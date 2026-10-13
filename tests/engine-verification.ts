import assert from 'assert';
import { calculateHealthScore } from '../lib/scoring';
import { computeScanDiff } from '../lib/diff';
import { AuditFinding, SummaryStats } from '../lib/types';
import { DEMO_PROFILES } from '../lib/scanner/mock-data';
import { createDemoScan } from '../lib/scanner/demo-runner';
import { prisma } from '../lib/db';

async function runTests() {
  console.log('--- Kör mAudit Engine Verifieringstester ---');

  // Test 1: Canonical Score Bands (90 / 70)
  console.log('Test 1: Verifierar kanoniska betygströsklar (90/70)...');
  const dummyStats: SummaryStats = {
    totalUsers: 10,
    mfaRegisteredUsers: 10,
    mfaPercent: 100,
    adminCount: 2,
    adminMfaPercent: 100,
    verifiedDomains: ['test.se'],
    tenantIdHash: 'test-hash',
    companyName: 'Test AB',
  };

  const perfectFindings: AuditFinding[] = [
    {
      id: 'CHK-ID-01',
      category: 'IDENTITY',
      title: 'MFA',
      severity: 'HIGH',
      weight: 25,
      status: 'PASS',
      currentValue: '100%',
      recommendedValue: '95%',
      compliance: {},
      remediation: { adminCenterPath: '', powershellSnippet: '' },
    },
  ];

  const report100 = calculateHealthScore(perfectFindings, dummyStats);
  assert.strictEqual(report100.overallScore, 100);
  assert.strictEqual(report100.scoreBand, 'EXCELLENT', '100p ska vara EXCELLENT');

  // Test 2: Neutral impact of NOT_APPLICABLE (Licens saknas)
  console.log('Test 2: Verifierar neutral poängpåverkan vid saknad licens (NOT_APPLICABLE)...');
  const findingsWithNA: AuditFinding[] = [
    {
      id: 'CHK-ID-01',
      category: 'IDENTITY',
      title: 'MFA',
      severity: 'HIGH',
      weight: 25,
      status: 'PASS',
      currentValue: '100%',
      recommendedValue: '95%',
      compliance: {},
      remediation: { adminCenterPath: '', powershellSnippet: '' },
    },
    {
      id: 'CHK-ID-02',
      category: 'IDENTITY',
      title: 'PIM/Identity Protection',
      severity: 'HIGH',
      weight: 25,
      status: 'NOT_APPLICABLE',
      currentValue: 'Kräver P2',
      recommendedValue: '',
      compliance: {},
      remediation: { adminCenterPath: '', powershellSnippet: '' },
    },
  ];

  const reportNA = calculateHealthScore(findingsWithNA, dummyStats);
  assert.strictEqual(
    reportNA.overallScore,
    100,
    'NOT_APPLICABLE får inte straffa poängen (ska exkluderas ur täljare och nämnare)'
  );

  // Test 3: Demo Profile Scoring
  console.log('Test 3: Beräknar poäng för demo-profiler...');
  const vulnProfile = DEMO_PROFILES.vulnerable_sme;
  const vulnReport = calculateHealthScore(vulnProfile.findings, vulnProfile.summaryStats);
  console.log(`- Vulnerable SME: ${vulnReport.overallScore}/100 (${vulnReport.scoreBand})`);
  assert(
    vulnReport.overallScore < 70,
    `Vulnerable profile ska ha < 70 poäng pga allvarliga brister (fick: ${vulnReport.overallScore})`
  );
  assert.strictEqual(vulnReport.scoreBand, 'CRITICAL');

  const remediatedProfile = DEMO_PROFILES.remediated_sme;
  const remReport = calculateHealthScore(remediatedProfile.findings, remediatedProfile.summaryStats);
  console.log(`- Remediated SME: ${remReport.overallScore}/100 (${remReport.scoreBand})`);
  assert(
    remReport.overallScore >= 90,
    `Remediated profile ska ha >= 90 poäng (fick: ${remReport.overallScore})`
  );
  assert.strictEqual(remReport.scoreBand, 'EXCELLENT');

  // Test 4: Scan Diffing Engine
  console.log('Test 4: Verifierar Diffing Engine ("Före och Efter")...');
  const diff = computeScanDiff(
    remReport.overallScore,
    remediatedProfile.findings,
    vulnReport.overallScore,
    vulnProfile.findings,
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  );

  assert(diff.scoreDelta > 0, 'Poängskillnaden måste vara positiv efter åtgärder');
  assert(diff.resolvedFindings.length > 0, 'Åtgärdade brister måste identifieras');
  console.log(`- Poängökning: +${diff.scoreDelta} poäng`);
  console.log(`- Antal åtgärdade brister: ${diff.resolvedFindings.length}`);

  // Test 5: End-to-End Database Persistence & Deletion
  console.log('Test 5: Skapar och raderar rapport i SQLite databas...');
  const demoReport = await createDemoScan('vulnerable_sme');
  assert(demoReport.isPublicToken, 'Rapport måste ha en public token');
  assert(demoReport.id, 'Rapport måste ha ett UUID');

  const fetched = await prisma.scanReport.findUnique({
    where: { isPublicToken: demoReport.isPublicToken },
  });
  assert(fetched, 'Rapporten ska kunna hittas i databasen');

  // Immediate Purge
  await prisma.scanReport.delete({
    where: { id: demoReport.id },
  });
  const afterDelete = await prisma.scanReport.findUnique({
    where: { isPublicToken: demoReport.isPublicToken },
  });
  assert.strictEqual(afterDelete, null, 'Rapporten ska vara permanent raderad');

  console.log('\n✅ ALLA 5 VERIFIERINGSTESTER LYCKADES!');
}

runTests()
  .catch((e) => {
    console.error('❌ Testfel:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

