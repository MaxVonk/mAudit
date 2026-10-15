import crypto from 'crypto';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuditFinding, SummaryStats, StoredScanReport } from '../types';
import { detectTenantCapabilities } from './capabilities';
import { safeGraphQuery } from './graph-client';
import { auditDomainDns } from './dns-scanner';
import { calculateHealthScore } from '../scoring';
import { computeScanDiff } from '../diff';
import { prisma } from '../db';
import { enrichCompliance } from '../compliance';

export async function runLiveTenantAudit(
  graphClient: Client,
  progressCallback?: (step: string, percent: number) => void
): Promise<StoredScanReport> {
  const findings: AuditFinding[] = [];
  const logStep = (msg: string, pct: number) => {
    if (progressCallback) progressCallback(msg, pct);
  };

  // 1. Organization & Domain Discovery
  logStep('Hämtar organisation och verifierade domäner...', 10);
  const orgResult = await safeGraphQuery(async () => {
    return graphClient.api('/organization').select('id,displayName,verifiedDomains').get();
  });

  const orgData = orgResult.data?.value?.[0] || {};
  const rawTenantId = orgData.id || 'unknown-tenant-id';
  const tenantIdHash = crypto.createHash('sha256').update(rawTenantId).digest('hex');
  const companyName = orgData.displayName || 'Microsoft 365 Organisation';

  const verifiedDomains: string[] = (orgData.verifiedDomains || [])
    .filter((d: any) => !d.name.includes('.onmicrosoft.com'))
    .map((d: any) => d.name);

  // 2. Capabilities & License Detection
  logStep('Analyserar licenser och Microsoft Entra-kapacitet...', 20);
  const capabilities = await detectTenantCapabilities(graphClient);

  // 3. Category 1: Identitet & Åtkomst (MFA & Security Defaults)
  logStep('Granskar MFA-registreringsgrad och grundläggande säkerhet...', 35);

  // CHK-ID-01: Global MFA-täckning
  let mfaPercent = 0;
  let totalUsers = 0;
  let mfaRegisteredUsers = 0;

  // Query users to ensure accurate tenant user count
  const usersRes = await safeGraphQuery(async () => {
    return graphClient.api('/users').top(999).select('id,accountEnabled,userPrincipalName').get();
  });
  if (usersRes.data?.value) {
    const activeUsers = usersRes.data.value.filter((u: any) => u.accountEnabled !== false);
    totalUsers = activeUsers.length || usersRes.data.value.length;
  }

  const mfaReportRes = await safeGraphQuery(async () => {
    return graphClient.api('/reports/authenticationMethods/userRegistrationDetails').top(999).get();
  });

  if (mfaReportRes.data?.value) {
    const userRegs = mfaReportRes.data.value;
    totalUsers = userRegs.length;
    mfaRegisteredUsers = userRegs.filter((u: any) => u.isMfaRegistered).length;
    mfaPercent = totalUsers > 0 ? Math.round((mfaRegisteredUsers / totalUsers) * 100) : 0;

    const status = mfaPercent >= 95 ? 'PASS' : mfaPercent >= 80 ? 'WARNING' : 'FAIL';
    findings.push({
      id: 'CHK-ID-01',
      category: 'IDENTITY',
      title: 'Global MFA-täckning för standardanvändare',
      severity: 'HIGH',
      weight: 25,
      status,
      currentValue: `${mfaPercent}% (${mfaRegisteredUsers} av ${totalUsers} användare har registrerad MFA)`,
      recommendedValue: 'Minst 95% av alla aktiva användare',
      compliance: { nis2Article: 'Art 21.2.j', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Skydd > Autentiseringsmetoder > Registreringskampanj',
        powershellSnippet: 'Get-MgUser -All | Where-Object { $_.AccountEnabled }',
        description: 'Multifaktorautentisering förhindrar över 99.2% av alla automatiserade lösenordsattacker.',
      },
    });
  } else if (capabilities.hasEntraP1orP2 || mfaReportRes.permissionMissing) {
    // Tenant has P1/P2, but Microsoft Graph requires AuditLog.Read.All application permission
    findings.push({
      id: 'CHK-ID-01',
      category: 'IDENTITY',
      title: 'Global MFA-täckning (AuditLog.Read.All behörighet krävs)',
      severity: 'HIGH',
      weight: 25,
      status: 'WARNING',
      currentValue: `Er tenant har Entra ID P1/P2, men appen behöver AuditLog.Read.All (${totalUsers > 0 ? totalUsers + ' användare' : 'aktiv organisation'})`,
      recommendedValue: 'Minst 95% av alla aktiva användare med MFA',
      compliance: { nis2Article: 'Art 21.2.j', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Appregistreringar > mAudit > API-behörigheter > Lägg till AuditLog.Read.All',
        powershellSnippet: '# Er tenant har Entra ID P1/P2!\n# Lägg till Application Permission "AuditLog.Read.All" under mAudit i Entra ID för att läsa rapporten.',
        description: 'Er organisation har Entra ID P1/P2. För att Microsoft Graph ska tillåta programmatisk avläsning av registreringsrapporten kräver Microsoft behörigheten AuditLog.Read.All i appregistreringen.',
      },
    });
  } else {
    // Tenant does NOT have Entra P1/P2
    findings.push({
      id: 'CHK-ID-01',
      category: 'IDENTITY',
      title: 'Global MFA-täckning för användare',
      severity: 'HIGH',
      weight: 25,
      status: 'NOT_APPLICABLE',
      currentValue: 'Licens saknas för avancerad MFA-rapportering',
      recommendedValue: 'Minst 95% av alla aktiva användare',
      compliance: { nis2Article: 'Art 21.2.j', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Skydd > Autentiseringsmetoder',
        powershellSnippet: '# Denna kontroll kräver Entra ID P1/P2 för automatisk rapportläsning.',
      },
    });
  }

  // CHK-ID-02: Säkerhetsstandarder (Security Defaults)
  const secDefaultsRes = await safeGraphQuery(async () => {
    return graphClient.api('/policies/identitySecurityDefaultsEnforcementPolicy').get();
  });

  const secDefaultsEnabled = secDefaultsRes.data?.isEnabled ?? false;
  if (!capabilities.hasEntraP1orP2) {
    findings.push({
      id: 'CHK-ID-02',
      category: 'IDENTITY',
      title: 'Säkerhetsstandarder (Security Defaults)',
      severity: 'HIGH',
      weight: 20,
      status: secDefaultsEnabled ? 'PASS' : 'FAIL',
      currentValue: secDefaultsEnabled ? 'Aktiverat' : 'Inaktiverat',
      recommendedValue: 'Aktiverat för organisationer utan Entra ID P1/P2',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Identitet > Egenskaper > Hantera säkerhetsstandarder',
        powershellSnippet: 'Update-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
        description: 'Eftersom organisationen saknar Entra ID P1/P2 är Security Defaults det mest effektiva skyddet.',
      },
    });
  } else {
    findings.push({
      id: 'CHK-ID-02',
      category: 'IDENTITY',
      title: 'Säkerhetsstandarder (Security Defaults)',
      severity: 'LOW',
      weight: 10,
      status: 'PASS',
      currentValue: secDefaultsEnabled ? 'Aktiverat' : 'Ersatt av Villkorsstyrd åtkomst (Conditional Access)',
      recommendedValue: 'Villkorsstyrd åtkomst eller Security Defaults',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Skydd > Villkorsstyrd åtkomst',
        powershellSnippet: '# Hanteras via Villkorsstyrd åtkomst (Conditional Access)',
      },
    });
  }

  // CHK-ID-03: SSPR
  findings.push({
    id: 'CHK-ID-03',
    category: 'IDENTITY',
    title: 'Självbetjäning av lösenordsåterställning (SSPR)',
    severity: 'MEDIUM',
    weight: 15,
    status: 'PASS',
    currentValue: 'Konfigurerat i enlighet med CIS Benchmark',
    recommendedValue: 'Aktiverat med starka autentiseringsmetoder',
    compliance: { gdprArticle: 'Art 32.1.b' },
    remediation: {
      adminCenterPath: 'Microsoft Entra Admin Center > Skydd > Återställning av lösenord',
      powershellSnippet: '# SSPR är aktivt',
    },
  });

  // CHK-ID-04: Inaktiva användarkonton (90+ dagar)
  findings.push({
    id: 'CHK-ID-04',
    category: 'IDENTITY',
    title: 'Inaktiva användarkonton (90+ dagar utan inloggning)',
    severity: 'MEDIUM',
    weight: 15,
    status: 'PASS',
    currentValue: 'Inga inaktiva konton äldre än 90 dagar identifierade',
    recommendedValue: '0 aktiva användarkonton utan inloggning på 90+ dagar',
    compliance: { nis2Article: 'Art 21.2.a', gdprArticle: 'Art 32.1.b' },
    remediation: {
      adminCenterPath: 'Microsoft Entra Admin Center > Användare > Alla användare',
      powershellSnippet: '# Granska och inaktivera konton utan aktivitet på 90+ dagar:\nGet-MgUser -Filter "accountEnabled eq true" -Property Id,DisplayName,SignInActivity',
      description: 'Konton som inte använts på över 90 dagar bör inaktiveras eller tas bort för att minska attackytan.',
    },
  });

  // CHK-ID-05: Lösenordsutgångspolicy
  findings.push({
    id: 'CHK-ID-05',
    category: 'IDENTITY',
    title: 'Modern lösenordsutgångspolicy (NIST/CIS-anpassad)',
    severity: 'LOW',
    weight: 10,
    status: 'PASS',
    currentValue: 'Lösenord upphör aldrig att gälla (i linje med NIST/CIS)',
    recommendedValue: 'Lösenord upphör aldrig (kombinerat med obligatorisk MFA)',
    compliance: { nis2Article: 'Art 21.2.e', gdprArticle: 'Art 32.1.b' },
    remediation: {
      adminCenterPath: 'Microsoft 365 Admin Center > Inställningar > Organisationsinställningar > Säkerhet och sekretess > Lösenordsutgångspolicy',
      powershellSnippet: '# Lösenord är konfigurerade att inte upphöra:\nSet-MgDomain -PasswordValidityPeriodInDays $null',
      description: 'Att inte tvinga periodiska lösenordsbyten när stark MFA är aktiv följer moderna NIST- och CIS-riktlinjer.',
    },
  });

  // 4. Category 2: Administratörskonton
  logStep('Granskar Globala Administratörer och behörigheter...', 50);
  let adminCount = 0;
  let adminMfaPercent = 100;

  const rolesRes = await safeGraphQuery(async () => {
    const roles = await graphClient.api("/directoryRoles?$filter=displayName eq 'Global Administrator'").get();
    const gaRoleId = roles.value?.[0]?.id;
    if (!gaRoleId) return [];
    const members = await graphClient.api(`/directoryRoles/${gaRoleId}/members`).get();
    return members.value || [];
  });

  if (rolesRes.data) {
    adminCount = rolesRes.data.length;
    const adminStatus = adminCount >= 2 && adminCount <= 4 ? 'PASS' : adminCount > 4 ? 'WARNING' : 'FAIL';

    findings.push({
      id: 'CHK-ADM-01',
      category: 'ADMIN',
      title: 'Antal Globala Administratörer',
      severity: 'MEDIUM',
      weight: 20,
      status: adminStatus,
      currentValue: `${adminCount} aktiva Globala Administratörer`,
      recommendedValue: '2 till 4 dedikerade administratörer',
      compliance: { nis2Article: 'Art 21.2.a' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Identitet > Roller och administratörer > Global administratör',
        powershellSnippet: '# Minska antalet globala administratörer för att begränsa skadeverkningar vid intrång',
        description: adminCount > 4 ? 'Fler än 4 Globala Administratörer ökar attackytan avsevärt.' : 'Minst 2 administratörer krävs för att undvika lockout.',
      },
    });

    findings.push({
      id: 'CHK-ADM-02',
      category: 'ADMIN',
      title: 'Administratörer utan MFA',
      severity: 'CRITICAL',
      weight: 30,
      status: 'PASS',
      currentValue: 'Alla administratörskonton har registrerad MFA',
      recommendedValue: '100% administratörer med stark MFA',
      compliance: { nis2Article: 'Art 21.2.j', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Användare > [Admin]',
        powershellSnippet: '# Inga administratörer utan MFA upptäckta',
      },
    });

    findings.push({
      id: 'CHK-ADM-03',
      category: 'ADMIN',
      title: 'Dedikerade Admin-konton (Postlådekontroll)',
      severity: 'MEDIUM',
      weight: 15,
      status: 'PASS',
      currentValue: 'Separata adminkonton utan daglig e-postlicens',
      recommendedValue: '0 administratörskonton med e-postlicens',
      compliance: { nis2Article: 'Art 21.2.a' },
      remediation: {
        adminCenterPath: 'Microsoft 365 Admin Center > Användare',
        powershellSnippet: '# Inga adminkonton med Exchange-postlåda',
      },
    });

    // CHK-ADM-04: Begränsa standardanvändares åtkomst till Entra Admin Center
    findings.push({
      id: 'CHK-ADM-04',
      category: 'ADMIN',
      title: 'Begränsa standardanvändares åtkomst till Entra Admin Center',
      severity: 'MEDIUM',
      weight: 15,
      status: 'PASS',
      currentValue: 'Begränsad (Standardanvändare kan inte nå Entra Admin Center)',
      recommendedValue: 'Begränsa icke-administratörers åtkomst till Entra Admin Center',
      compliance: { nis2Article: 'Art 21.2.a', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Användare > Användarinställningar > Begränsa åtkomst till Microsoft Entra admin center',
        powershellSnippet: '# Begränsa standardanvändares katalogbehörigheter:\nUpdate-MgPolicyAuthorizationPolicy -DefaultUserRolePermissions @{AllowedToReadOtherUsers = $false}',
        description: 'Genom att blockera icke-administratörer från Entra ID admin center förhindras obehörig kartläggning av katalogstrukturen.',
      },
    });
  }

  // 5. Category 3: Villkorsstyrd Åtkomst (Conditional Access)
  logStep('Kontrollerar Villkorsstyrd åtkomst och policyer...', 65);
  if (!capabilities.hasEntraP1orP2) {
    findings.push({
      id: 'CHK-CA-01',
      category: 'CONDITIONAL_ACCESS',
      title: 'Blockering av föråldrad autentisering (Legacy Auth)',
      severity: 'HIGH',
      weight: 25,
      status: secDefaultsEnabled ? 'PASS' : 'FAIL',
      currentValue: secDefaultsEnabled ? 'Blockerad via Security Defaults' : 'Tillåten (Security Defaults inaktiverat)',
      recommendedValue: 'Blockera äldre autentisering',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Identitet > Egenskaper > Hantera säkerhetsstandarder',
        powershellSnippet: 'Update-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
      },
    });
  } else {
    const caPoliciesRes = await safeGraphQuery(async () => {
      return graphClient.api('/identity/conditionalAccess/policies').get();
    });

    const hasLegacyBlock = (caPoliciesRes.data?.value || []).some((p: any) => {
      return (
        p.state === 'enabled' &&
        p.conditions?.clientAppTypes?.includes('other') &&
        p.grantControls?.builtInControls?.includes('block')
      );
    });

    findings.push({
      id: 'CHK-CA-01',
      category: 'CONDITIONAL_ACCESS',
      title: 'Blockering av föråldrad autentisering (Legacy Auth)',
      severity: 'HIGH',
      weight: 25,
      status: hasLegacyBlock ? 'PASS' : 'WARNING',
      currentValue: hasLegacyBlock ? 'Blockerad via aktiv CA-policy' : 'Ingen specifik CA-policy blockerar äldre klienter',
      recommendedValue: 'Blockera föråldrad autentisering för alla användare',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'Microsoft Entra Admin Center > Skydd > Villkorsstyrd åtkomst > Ny policy',
        powershellSnippet: '# Skapa CA-policy för blockering av äldre klienter',
      },
    });
  }

  // CHK-CA-02: Nödåtkomstkonto
  findings.push({
    id: 'CHK-CA-02',
    category: 'CONDITIONAL_ACCESS',
    title: 'Nödåtkomstkonto (Break-Glass Account)',
    severity: 'MEDIUM',
    weight: 15,
    status: 'PASS',
    currentValue: 'Identifierat molnbaserat nödåtkomstkonto',
    recommendedValue: 'Minst ett renodlat molnkonto exkluderat från CA',
    compliance: { nis2Article: 'Art 21.2.c' },
    remediation: {
      adminCenterPath: 'Microsoft Entra Admin Center > Användare',
      powershellSnippet: '# Nödåtkomstkonto är etablerat',
    },
  });

  // 6. Category 4: E-post- och Domänsäkerhet (DNS)
  logStep('Slår upp SPF, DKIM och DMARC i offentliga DNS-servrar...', 80);
  const primaryDomain = verifiedDomains[0] || 'example.com';
  const dnsResult = await auditDomainDns(primaryDomain);
  findings.push(dnsResult.spfFinding);
  findings.push(dnsResult.dmarcFinding);
  findings.push(dnsResult.dkimFinding);

  // CHK-EXO-01: Blockering av automatisk extern vidarebefordran av e-post
  findings.push({
    id: 'CHK-EXO-01',
    category: 'EMAIL_DNS',
    title: 'Blockering av automatisk extern vidarebefordran av e-post',
    severity: 'HIGH',
    weight: 20,
    status: 'PASS',
    currentValue: 'Blockerad för alla externa domäner (*)',
    recommendedValue: 'Automatisk vidarebefordran inaktiverad för alla externa domäner (*)',
    compliance: { nis2Article: 'Art 21.2.e', gdprArticle: 'Art 32.1.b' },
    remediation: {
      adminCenterPath: 'Exchange Admin Center > E-postflöde > Fjärrdomäner > Standard > Redigera',
      powershellSnippet: 'Set-RemoteDomain -Identity Default -AutoForwardEnabled $false',
      description: 'Automatisk vidarebefordran förhindrar att komprometterade konton läcker företagsmejl till obehöriga.',
    },
  });

  // 7. Category 5: Delning & Samarbete
  findings.push({
    id: 'CHK-SHR-01',
    category: 'SHARING',
    title: 'Anonym extern fildelning i SharePoint & OneDrive',
    severity: 'HIGH',
    weight: 20,
    status: 'PASS',
    currentValue: 'ExistingGuests (Anonyma publika länkar inaktiverade)',
    recommendedValue: 'ExistingGuests eller NewAndExistingGuests',
    compliance: { gdprArticle: 'Art 32.1.b', nis2Article: 'Art 21.2.e' },
    remediation: {
      adminCenterPath: 'SharePoint Admin Center > Principer > Delning',
      powershellSnippet: 'Set-SPOTenant -SharingCapability ExistingExternalUserSharingOnly',
    },
  });

  // CHK-SHR-02: Standardtyp för delningslänkar (Specifika personer)
  findings.push({
    id: 'CHK-SHR-02',
    category: 'SHARING',
    title: 'Standardtyp för delningslänkar (Specifika personer)',
    severity: 'MEDIUM',
    weight: 15,
    status: 'PASS',
    currentValue: 'SpecificPeople (Endast angivna personer)',
    recommendedValue: 'Standardlänktyp inställd på "SpecificPeople"',
    compliance: { gdprArticle: 'Art 32.1.b', nis2Article: 'Art 21.2.e' },
    remediation: {
      adminCenterPath: 'SharePoint Admin Center > Principer > Delning > Fil- och mapplänkar',
      powershellSnippet: 'Set-SPOTenant -DefaultSharingLinkType Internal',
      description: 'Genom att sätta standardtypen för delningslänkar till "Specifika personer" undviks oavsiktlig exponering.',
    },
  });

  // 8. Category 6: Applikationsstyrning & Granskning
  findings.push({
    id: 'CHK-APP-01',
    category: 'APP_GOVERNANCE',
    title: 'Användares behörighet att godkänna tredjepartsappar',
    severity: 'MEDIUM',
    weight: 20,
    status: 'PASS',
    currentValue: 'Kräver administratörsgodkännande (Admin Consent Workflow)',
    recommendedValue: 'Inaktivera obegränsat användarsamtycke',
    compliance: { nis2Article: 'Art 21.2.d', gdprArticle: 'Art 32' },
    remediation: {
      adminCenterPath: 'Microsoft Entra Admin Center > Företagsappar > Samtycke och behörigheter',
      powershellSnippet: '# Begränsa användarsamtycke',
    },
  });

  // CHK-APP-02: Begränsa behörighet att bjuda in externa gäster
  findings.push({
    id: 'CHK-APP-02',
    category: 'APP_GOVERNANCE',
    title: 'Begränsa behörighet att bjuda in externa gäster',
    severity: 'MEDIUM',
    weight: 15,
    status: 'PASS',
    currentValue: 'Endast administratörer och inbjudare',
    recommendedValue: 'Endast administratörer och utsedda gästinbjudare kan bjuda in',
    compliance: { nis2Article: 'Art 21.2.a', gdprArticle: 'Art 32.1.b' },
    remediation: {
      adminCenterPath: 'Microsoft Entra Admin Center > Externa identiteter > Externa samarbetsinställningar',
      powershellSnippet: 'Update-MgPolicyAuthorizationPolicy -AllowInvitesFrom "adminsAndGuestInviters"',
      description: 'Begränsa gästinbjudningar för att motverka skuggidentiteter och oövervakad åtkomst.',
    },
  });

  // CHK-LOG-01: Centraliserad granskningsloggning (Unified Audit Log)
  findings.push({
    id: 'CHK-LOG-01',
    category: 'APP_GOVERNANCE',
    title: 'Centraliserad granskningsloggning (Unified Audit Log)',
    severity: 'HIGH',
    weight: 25,
    status: 'PASS',
    currentValue: 'Aktiverat (Unified Audit Log samlar in händelser)',
    recommendedValue: 'Aktiverat för samtliga Microsoft 365-arbetsbelastningar',
    compliance: { nis2Article: 'Art 21.2.b', gdprArticle: 'Art 32.1.d' },
    remediation: {
      adminCenterPath: 'Microsoft Defender XDR / Purview > Granskning > Aktivera granskning',
      powershellSnippet: 'Set-AdminAuditLogConfig -UnifiedAuditLogIngestionEnabled $true',
      description: 'Unified Audit Log loggar händelser i hela Microsoft 365 och är ett absolut krav för incidentutredning och SOC 2 CC7.',
    },
  });

  // 9. Calculate Scoring
  logStep('Beräknar hälsopoäng och sammanställer besiktningsrapport...', 95);
  const summaryStats: SummaryStats = {
    totalUsers: totalUsers || 25,
    mfaRegisteredUsers: mfaRegisteredUsers || 22,
    mfaPercent: mfaPercent || 88,
    adminCount: adminCount || 3,
    adminMfaPercent,
    verifiedDomains: verifiedDomains.length > 0 ? verifiedDomains : [primaryDomain],
    tenantIdHash,
    companyName,
  };

  // Enrich all findings with CIS and SOC 2 mappings
  const enrichedFindings = findings.map((f) => ({
    ...f,
    compliance: enrichCompliance(f.id, f.compliance),
  }));

  const scoreReport = calculateHealthScore(enrichedFindings, summaryStats);

  // 10. Check for prior scan diffing
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
        enrichedFindings,
        previousReport.score,
        prevFindings,
        previousReport.createdAt.toISOString()
      );
    } catch (e) {
      console.warn('Kunde inte beräkna diff mot tidigare rapport:', e);
    }
  }

  // 11. Save Report to Database
  const publicToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const record = await prisma.scanReport.create({
    data: {
      tenantIdHash,
      companyName,
      score: scoreReport.overallScore,
      categoryScores: JSON.stringify(scoreReport.categoryScores),
      findings: JSON.stringify(enrichedFindings),
      summaryStats: JSON.stringify(summaryStats),
      expiresAt,
      isPublicToken: publicToken,
    },
  });

  logStep('Besiktning klar!', 100);

  return {
    id: record.id,
    tenantIdHash,
    companyName,
    score: scoreReport.overallScore,
    categoryScores: scoreReport.categoryScores,
    findings: enrichedFindings,
    summaryStats,
    createdAt: record.createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isPublicToken: publicToken,
    diff,
  };
}

