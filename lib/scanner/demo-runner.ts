import crypto from 'crypto';
import { DEMO_PROFILES } from './mock-data';
import { calculateHealthScore } from '../scoring';
import { computeScanDiff } from '../diff';
import { prisma } from '../db';
import { StoredScanReport } from '../types';

export async function createDemoScan(profileKey: 'vulnerable_sme' | 'remediated_sme' = 'vulnerable_sme'): Promise<StoredScanReport> {
  const profile = DEMO_PROFILES[profileKey];
  if (!profile) throw new Error(`Okänd demoprofil: ${profileKey}`);

  const scoreReport = calculateHealthScore(profile.findings, profile.summaryStats);
  const tenantIdHash = profile.summaryStats.tenantIdHash;

  // Check if a prior scan exists for diffing
  const previousReport = await prisma.scanReport.findFirst({
    where: { tenantIdHash },
    orderBy: { createdAt: 'desc' },
  });

  let diff;
  if (previousReport) {
    try {
      const prevFindings = JSON.parse(previousReport.findings);
      diff = computeScanDiff(
        scoreReport.overallScore,
        profile.findings,
        previousReport.score,
        prevFindings,
        previousReport.createdAt.toISOString()
      );
    } catch (e) {
      console.warn('Kunde inte beräkna diff mot tidigare rapport:', e);
    }
  } else if (profileKey === 'remediated_sme') {
    // If user asked directly for remediated profile without running vulnerable first,
    // synthesize the initial vulnerable baseline for realistic demonstration of diffing!
    const baseline = DEMO_PROFILES.vulnerable_sme;
    const baselineScore = calculateHealthScore(baseline.findings, baseline.summaryStats).overallScore;
    diff = computeScanDiff(
      scoreReport.overallScore,
      profile.findings,
      baselineScore,
      baseline.findings,
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    );
  }

  const publicToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const record = await prisma.scanReport.create({
    data: {
      tenantIdHash,
      companyName: profile.name,
      score: scoreReport.overallScore,
      categoryScores: JSON.stringify(scoreReport.categoryScores),
      findings: JSON.stringify(profile.findings),
      summaryStats: JSON.stringify(profile.summaryStats),
      expiresAt,
      isPublicToken: publicToken,
    },
  });

  return {
    id: record.id,
    tenantIdHash,
    companyName: profile.name,
    score: scoreReport.overallScore,
    categoryScores: scoreReport.categoryScores,
    findings: profile.findings,
    summaryStats: profile.summaryStats,
    createdAt: record.createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isPublicToken: publicToken,
    diff,
  };
}

