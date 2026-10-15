import { AuditFinding } from './types';

export interface FindingLocalization {
  title: { en: string; sv: string };
  description: { en: string; sv: string };
  recommendedValue: { en: string; sv: string };
  adminCenterPath: { en: string; sv: string };
  powershellSnippet?: { en: string; sv: string };
  nis2Article?: { en: string; sv: string };
  gdprArticle?: { en: string; sv: string };
  currentValueMap?: Record<string, { en: string; sv: string }>;
}

export const FINDING_LOCALIZATIONS: Record<string, FindingLocalization> = {
  'CHK-ID-01': {
    title: {
      en: 'Global MFA Coverage for Standard Users',
      sv: 'Global MFA-täckning för standardanvändare',
    },
    description: {
      en: 'Users without multi-factor authentication are vulnerable to credential stuffing, password spraying, and phishing attacks. Enforcing MFA blocks over 99.2% of automated identity attacks.',
      sv: 'Användare som saknar multifaktorautentisering är sårbara för credential stuffing och nätfiske. Att kräva MFA blockerar över 99.2% av automatiserade identitetsattacker.',
    },
    recommendedValue: {
      en: 'At least 95% of active users with registered MFA',
      sv: 'Minst 95% av alla aktiva användare',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Protection > Authentication methods > Registration campaign',
      sv: 'Microsoft Entra Admin Center > Skydd > Autentiseringsmetoder > Registreringskampanj',
    },
    powershellSnippet: {
      en: '# Require MFA registration via Microsoft Graph PowerShell:\nGet-MgUser -All | Where-Object { $_.AccountEnabled -eq $true } | ForEach-Object {\n  # Enforce Conditional Access or per-user MFA policy\n  Write-Host "Enforce MFA for $($_.UserPrincipalName)"\n}',
      sv: '# Aktivera MFA-krav för användare via Microsoft Graph PowerShell:\nGet-MgUser -All | Where-Object { $_.AccountEnabled -eq $true } | ForEach-Object {\n  # Konfigurera villkorsstyrd åtkomst eller per-user MFA\n  Write-Host "Kräv MFA för $($_.UserPrincipalName)"\n}',
    },
    nis2Article: {
      en: 'Art 21.2.j (Supply chain & access security)',
      sv: 'Art 21.2.j (Säkerhet i försörjningskedja och åtkomst)',
    },
    gdprArticle: {
      en: 'Art 32.1.b (Confidentiality & integrity)',
      sv: 'Art 32.1.b (Förmåga att upprätthålla konfidentialitet)',
    },
  },

  'CHK-ID-02': {
    title: {
      en: 'Security Defaults Enforcement',
      sv: 'Säkerhetsstandarder (Security Defaults)',
    },
    description: {
      en: 'The organization lacks Entra ID P1/P2 licenses but has disabled Security Defaults. This leaves the tenant without enforced MFA or legacy authentication blocking.',
      sv: 'Organisationen saknar Entra P1/P2 men har inaktiverat Security Defaults. Detta innebär att varken MFA eller blockering av legacy auth tvingas fram centralt.',
    },
    recommendedValue: {
      en: 'Enabled for organizations without Entra ID P1/P2',
      sv: 'Aktiverat (Enabled) för organisationer utan Entra ID P1/P2',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Identity > Overview > Properties > Manage Security Defaults > Select "Enabled"',
      sv: 'Microsoft Entra Admin Center > Identitet > Översikt > Egenskaper > Hantera säkerhetsstandarder > Välj "Aktiverad"',
    },
    powershellSnippet: {
      en: '# Enable Security Defaults via Graph API (requires no P1/P2 license):\nUpdate-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
      sv: '# Aktivera säkerhetsstandarder via Graph API (kräver inte P1/P2 licens):\nUpdate-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
    },
    nis2Article: {
      en: 'Art 21.2.e (Cyber hygiene baseline)',
      sv: 'Art 21.2.e (Grundläggande cybersäkerhetshygien)',
    },
  },

  'CHK-ID-03': {
    title: {
      en: 'Self-Service Password Reset (SSPR)',
      sv: 'Självbetjäning av lösenordsåterställning (SSPR)',
    },
    description: {
      en: 'Self-service password reset enables secure credential recovery with modern verification factors, reducing helpdesk credential exposure.',
      sv: 'Lösenordsåterställning är korrekt konfigurerad med moderna säkerhetskontroller.',
    },
    recommendedValue: {
      en: 'Enabled with at least 2 verification methods',
      sv: 'Aktiverat med minst 2 verifieringsmetoder',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Protection > Password reset',
      sv: 'Microsoft Entra Admin Center > Skydd > Återställning av lösenord',
    },
    powershellSnippet: {
      en: '# Verify SSPR policy authorization:\nGet-MgPolicyAuthorizationPolicy | Select-Object AllowedToCreateApps, DefaultUserRolePermissions',
      sv: '# Kontrollera SSPR-policy:\nGet-MgPolicyAuthorizationPolicy | Select-Object AllowedToCreateApps, DefaultUserRolePermissions',
    },
    gdprArticle: {
      en: 'Art 32.1.b (Confidentiality)',
      sv: 'Art 32.1.b',
    },
  },

  'CHK-ADM-01': {
    title: {
      en: 'Number of Global Administrators',
      sv: 'Antal Globala Administratörer',
    },
    description: {
      en: 'Having more than 4 Global Administrators increases the risk of credential compromise and violates the principle of least privilege (PoLP). Maintain 2 to 4 dedicated accounts.',
      sv: 'Fler än 4 Globala Administratörer ökar risken för behörighetsläckor och strider mot principen om minsta behörighet (PoLP).',
    },
    recommendedValue: {
      en: '2 to 4 dedicated administrators',
      sv: '2 till 4 dedikerade administratörer',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Identity > Roles & admins > Roles & admins > Global Administrator',
      sv: 'Microsoft Entra Admin Center > Identitet > Roller och administratörer > Global administratör',
    },
    powershellSnippet: {
      en: '# Review and reduce active Global Administrator assignments:\n$Admins = Get-MgDirectoryRole | Where-Object { $_.DisplayName -eq "Global Administrator" } | Get-MgDirectoryRoleMember\n$Admins | Select-Object Id, AdditionalProperties',
      sv: '# Granska och minska Global Admin-roller:\n$Admins = Get-MgDirectoryRole | Where-Object { $_.DisplayName -eq "Global Administrator" } | Get-MgDirectoryRoleMember\n$Admins | Select-Object Id, AdditionalProperties',
    },
    nis2Article: {
      en: 'Art 21.2.a (Risk analysis & access policies)',
      sv: 'Art 21.2.a (Policyer för riskanalys och åtkomstbegränsning)',
    },
  },

  'CHK-ADM-02': {
    title: {
      en: 'Administrators Without Phishing-Resistant MFA',
      sv: 'Administratörer utan MFA',
    },
    description: {
      en: 'An administrator account without multi-factor authentication represents the highest single attack vector in M365 and can lead to full tenant compromise.',
      sv: 'Ett administratörskonto utan MFA är den enskilt största angreppsvektorn mot M365 och kan leda till fullständigt övertagande av hela miljön.',
    },
    recommendedValue: {
      en: '100% of administrators with strong phishing-resistant MFA',
      sv: '100% administratörer med stark fuskresistent MFA',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Users > [Admin User] > Authentication methods',
      sv: 'Microsoft Entra Admin Center > Användare > [Admin-användare] > Autentiseringsmetoder',
    },
    powershellSnippet: {
      en: '# Immediately enforce MFA registration for admin accounts:\nWrite-Warning "Critical: Privileged accounts must require phishing-resistant MFA"',
      sv: '# Tvinga omedelbar MFA-registrering för administratören:\nWrite-Warning "Kritiskt: 1 admin saknar MFA!"',
    },
    nis2Article: {
      en: 'Art 21.2.j (Multi-factor authentication)',
      sv: 'Art 21.2.j (Multifaktorautentisering)',
    },
    gdprArticle: {
      en: 'Art 32.1.b (Technical & organizational measures)',
      sv: 'Art 32.1.b (Tekniska och organisatoriska åtgärder)',
    },
  },

  'CHK-ADM-03': {
    title: {
      en: 'Dedicated Admin Accounts (Mailbox & Productivity License Check)',
      sv: 'Dedikerade Admin-konton (Postlådekontroll)',
    },
    description: {
      en: 'Administrators who read day-to-day email using their privileged accounts are at severe risk of compromise from spear-phishing and malicious attachments.',
      sv: 'Administratörer som läser e-post med sitt behöriga konto riskerar att komprometteras via nätfiskelänkar.',
    },
    recommendedValue: {
      en: '0 admin accounts with email licenses (use separate daily accounts)',
      sv: '0 administratörskonton med e-postlicenser (använd separata konton)',
    },
    adminCenterPath: {
      en: 'Microsoft 365 Admin Center > Active users > Select admin > Licenses > Remove Exchange Online',
      sv: 'Microsoft 365 Admin Center > Aktiva användare > Välj administratör > Licenser > Ta bort Exchange Online',
    },
    powershellSnippet: {
      en: '# Separate daily user accounts from privileged admin accounts:\n# Admin accounts (e.g. admin.name@domain.com) should NEVER be used for daily email.',
      sv: '# Separera vardagskonto från adminkonto:\n# Adminkonton ska ALDRIG användas för daglig e-postläsning.',
    },
    nis2Article: {
      en: 'Art 21.2.a (Access control & segregation of duties)',
      sv: 'Art 21.2.a',
    },
  },

  'CHK-CA-01': {
    title: {
      en: 'Blocking Legacy Authentication (POP3/IMAP/SMTP)',
      sv: 'Blockering av föråldrad autentisering (Legacy Auth)',
    },
    description: {
      en: 'Legacy email protocols (such as POP3, IMAP, and Basic Auth) cannot enforce multi-factor authentication, making them prime targets for automated password spraying.',
      sv: 'Äldre protokoll (t.ex. äldre Outlook, IMAP) kan inte genomdriva MFA och kringgår era säkerhetsspärrar.',
    },
    recommendedValue: {
      en: 'Blocked via Security Defaults or Conditional Access policy',
      sv: 'Blockerad via Security Defaults eller CA-policy',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Protection > Conditional Access > New Policy > Client apps > Legacy authentication clients > Block',
      sv: 'Microsoft Entra Admin Center > Skydd > Villkorsstyrd åtkomst > Ny policy > Klientappar > Äldre autentiseringsklienter > Blockera',
    },
    powershellSnippet: {
      en: '# Enforce Security Defaults or Conditional Access to block legacy protocols:\nUpdate-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
      sv: '# Aktivera Security Defaults (om utan P1/P2) eller skapa CA-policy:\nUpdate-MgPolicyIdentitySecurityDefaultEnforcementPolicy -IsEnabled $true',
    },
    nis2Article: {
      en: 'Art 21.2.e (Protocol hardening)',
      sv: 'Art 21.2.e (Härdning av protokoll)',
    },
    gdprArticle: {
      en: 'Art 32.1.d (Security effectiveness)',
      sv: 'Art 32.1.d',
    },
  },

  'CHK-CA-02': {
    title: {
      en: 'Break-Glass Emergency Access Account Exclusion',
      sv: 'Nödåtkomstkonto (Break-Glass Account)',
    },
    description: {
      en: 'Without a dedicated, cloud-only break-glass emergency account excluded from Conditional Access, organizations face total lockout if identity federation or MFA services fail.',
      sv: 'Saknas ett nödåtkomstkonto riskerar organisationen fullständig lockout om federering eller MFA-tjänster havererar.',
    },
    recommendedValue: {
      en: 'At least one cloud-only emergency account excluded from CA with continuous alerting',
      sv: 'Minst ett renodlat molnkonto exkluderat från CA med stark övervakning',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Users > New user (e.g. emergency-admin@tenant.onmicrosoft.com)',
      sv: 'Microsoft Entra Admin Center > Användare > Skapa användare (t.ex. emergency-admin@tenant.onmicrosoft.com)',
    },
    powershellSnippet: {
      en: '# Create a cloud-only emergency account with a 30+ character random password:\n# Store the password in a physical fireproof vault.',
      sv: '# Skapa ett molnbaserat break-glass konto med 30+ slumptecken lösenord:\n# Förvara lösenordet i ett fysiskt säkerhetsskåp.',
    },
    nis2Article: {
      en: 'Art 21.2.c (Business continuity & incident management)',
      sv: 'Art 21.2.c (Driftskontinuitet och krishantering)',
    },
  },

  'CHK-DNS-01': {
    title: {
      en: 'SPF Record Validity',
      sv: 'SPF-postens giltighet',
    },
    description: {
      en: 'The SPF record is published with -all (HardFail), preventing unauthorized mail servers from sending spoofed emails on behalf of your domain.',
      sv: 'SPF-posten är korrekt publicerad och förhindrar att obehöriga servrar utger sig för att skicka från er domän.',
    },
    recommendedValue: {
      en: 'Includes Exchange Online and ends with -all (HardFail)',
      sv: 'Innehåller Exchange Online och slutar på -all (HardFail)',
    },
    adminCenterPath: {
      en: 'DNS Provider > Manage TXT records for your custom domain',
      sv: 'DNS-leverantör > Hantera TXT-poster för er domän',
    },
    powershellSnippet: {
      en: '# SPF is correctly configured with HardFail (-all)',
      sv: '# SPF är korrekt konfigurerat med HardFail (-all)',
    },
    nis2Article: {
      en: 'Art 21.2.e (Secure communication)',
      sv: 'Art 21.2.e (Säker kommunikation)',
    },
  },

  'CHK-DNS-02': {
    title: {
      en: 'DMARC Enforcement & Anti-Spoofing Policy',
      sv: 'DMARC-efterlevnad',
    },
    description: {
      en: 'Without DMARC, external attackers can forge emails appearing directly from your corporate domain without recipient filters rejecting them.',
      sv: 'Utan DMARC kan externa bedragare skicka förfalskade e-postmeddelanden som ser ut att komma direkt från er domän utan att mottagarens skräppostfilter reagerar.',
    },
    recommendedValue: {
      en: 'v=DMARC1; p=quarantine or p=reject;',
      sv: 'v=DMARC1; p=quarantine eller p=reject;',
    },
    adminCenterPath: {
      en: 'DNS Provider > Create new TXT record with host name "_dmarc"',
      sv: 'DNS-leverantör > Skapa ny TXT-post med värdnamn "_dmarc"',
    },
    powershellSnippet: {
      en: '# Create the following DNS TXT record:\n# Host: _dmarc.yourdomain.com\n# Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100"',
      sv: '# Skapa följande DNS TXT-post:\n# Namn: _dmarc.doman.se\n# Värde: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@doman.se; pct=100"',
    },
    nis2Article: {
      en: 'Art 21.2.e (Electronic communication security)',
      sv: 'Art 21.2.e (Säkerhet i elektronisk kommunikation)',
    },
    gdprArticle: {
      en: 'Art 32.1.b (Confidentiality)',
      sv: 'Art 32.1.b',
    },
  },

  'CHK-DNS-03': {
    title: {
      en: 'DKIM Cryptographic Email Signature',
      sv: 'DKIM-signering',
    },
    description: {
      en: 'Emails are cryptographically signed with DKIM keys, ensuring messages are not altered or tampered with in transit.',
      sv: 'E-postmeddelanden signeras kryptografiskt med DKIM vilket verifierar att innehållet inte manipulerats under transport.',
    },
    recommendedValue: {
      en: 'DKIM keys enabled in Exchange Online and published in DNS',
      sv: 'DKIM-nycklar aktiverade i Exchange Online och publicerade i DNS',
    },
    adminCenterPath: {
      en: 'Microsoft Defender XDR > Email & collaboration > Policies & rules > Threat policies > DKIM',
      sv: 'Microsoft Defender XDR > E-post och samarbete > Principer > DKIM',
    },
    powershellSnippet: {
      en: '# DKIM is enabled in Exchange Online and validated via DNS',
      sv: '# DKIM är aktiverat och validerat i DNS',
    },
    nis2Article: {
      en: 'Art 21.2.e (Secure communication)',
      sv: 'Art 21.2.e',
    },
  },

  'CHK-SHR-01': {
    title: {
      en: 'Anonymous External Link Sharing in SharePoint & OneDrive',
      sv: 'Anonym extern fildelning i SharePoint & OneDrive',
    },
    description: {
      en: 'Anonymous links ("Anyone with the link") allow anyone possessing the URL to download or view internal company documents without identity verification.',
      sv: 'Anonyma länkar innebär att vem som helst som kommer över en länk kan läsa eller ladda ner företagsdokument utan autentisering.',
    },
    recommendedValue: {
      en: 'ExistingGuests or NewAndExistingGuests (Authentication required)',
      sv: 'ExistingGuests eller NewAndExistingGuests (Kräv inloggning)',
    },
    adminCenterPath: {
      en: 'SharePoint Admin Center > Policies > Sharing > External sharing > Set slider to "Existing guests"',
      sv: 'SharePoint Admin Center > Principer > Delning > Extern delning > Sätt reglaget till "Befintliga gäster"',
    },
    powershellSnippet: {
      en: '# Restrict external link sharing via SharePoint Online PowerShell:\nSet-SPOTenant -SharingCapability ExistingExternalUserSharingOnly',
      sv: '# Begränsa extern delning via SharePoint Online PowerShell:\nSet-SPOTenant -SharingCapability ExistingExternalUserSharingOnly',
    },
    gdprArticle: {
      en: 'Art 32.1.b (Prevent accidental exposure of personal data)',
      sv: 'Art 32.1.b (Förhindra oavsiktlig exponering av personuppgifter)',
    },
    nis2Article: {
      en: 'Art 21.2.e (System & network security)',
      sv: 'Art 21.2.e',
    },
  },

  'CHK-APP-01': {
    title: {
      en: 'User Consent for Third-Party Applications (OAuth Consent)',
      sv: 'Användares behörighet att godkänna tredjepartsappar (OAuth Consent)',
    },
    description: {
      en: 'End-users cannot grant unverified cloud apps permission to access company data without an administrator reviewing and approving the request.',
      sv: 'Slutanvändare kan inte ge obetrodda molnapplikationer tillgång till företagsdata utan att en administratör granskar förfrågan.',
    },
    recommendedValue: {
      en: 'Disable end-user consent for untrusted apps (Require admin consent)',
      sv: 'Inaktivera slutanvändarsamtycke för obetrodda appar',
    },
    adminCenterPath: {
      en: 'Microsoft Entra Admin Center > Enterprise applications > Consent and permissions > User consent settings',
      sv: 'Microsoft Entra Admin Center > Företagsappar > Samtycke och behörigheter > Användarmedgivande',
    },
    powershellSnippet: {
      en: '# Restrict end-user application consent via Authorization Policy:\nSet-MgPolicyAuthorizationPolicy -DefaultUserRolePermissions @{AllowedToCreateApps = $false}',
      sv: '# Begränsa användarsamtycke:\nSet-MgPolicyAuthorizationPolicy -DefaultUserRolePermissions @{AllowedToCreateApps = $false}',
    },
    nis2Article: {
      en: 'Art 21.2.d (Supply chain & application acquisition)',
      sv: 'Art 21.2.d (Säkerhet vid förvärv och utveckling)',
    },
    gdprArticle: {
      en: 'Art 32 (Security of processing)',
      sv: 'Art 32',
    },
  },
};

export function translateCurrentValue(finding: AuditFinding, lang: 'en' | 'sv'): string {
  if (lang === 'sv') return finding.currentValue;

  const val = finding.currentValue;

  // 1. MFA dynamic percentage and user count
  // e.g. "45% (151 av 332 användare har registrerad MFA)"
  // e.g. "71% (34 av 48 användare har MFA)"
  const mfaMatch = val.match(/^(\d+)%\s*\(([\d\s,]+)\s*av\s*([\d\s,]+)\s*användare\s*har\s*(?:registrerad\s*)?MFA\)/i);
  if (mfaMatch) {
    const hasReg = val.toLowerCase().includes('registrerad');
    return `${mfaMatch[1]}% (${mfaMatch[2].trim()} of ${mfaMatch[3].trim()} users have ${hasReg ? 'registered ' : ''}MFA)`;
  }

  // 2. Admin MFA
  // e.g. "1 av 5 Global Admins saknar registrerad MFA"
  const adminMfaMatch = val.match(/^(\d+)\s*av\s*(\d+)\s*(?:Global Admins|administratörer)\s*saknar\s*registrerad MFA/i);
  if (adminMfaMatch) {
    return `${adminMfaMatch[1]} of ${adminMfaMatch[2]} Global Admins lack registered MFA`;
  }
  if (
    val.includes('Alla administratörskonton har registrerad MFA') ||
    val.includes('100% administratörer har MFA aktivt') ||
    val.includes('Alla administratörskonton har MFA aktivt')
  ) {
    return '100% of administrator accounts have registered MFA';
  }

  // 3. Admin count
  // e.g. "5 aktiva Globala Administratörer"
  // e.g. "5 aktiva administratörer"
  // e.g. "3 dedikerade administratörer"
  const adminActiveMatch = val.match(/^(\d+)\s*aktiva\s*(?:Globala Administratörer|administratörer)/i);
  if (adminActiveMatch) {
    return `${adminActiveMatch[1]} active Global Administrators`;
  }
  const adminDedMatch = val.match(/^(\d+)\s*dedikerade\s*administratörer/i);
  if (adminDedMatch) {
    return `${adminDedMatch[1]} dedicated administrators`;
  }

  // 4. Admin mailboxes
  // e.g. "3 Global Admins har aktiv Exchange-postlåda"
  // e.g. "2 administratörer har aktiv Exchange-postlåda"
  const mailboxMatch = val.match(/^(\d+)\s*(?:Global Admins|administratörer)\s*har\s*aktiv Exchange-postlåda/i);
  if (mailboxMatch) {
    return `${mailboxMatch[1]} Global Admins have an active Exchange mailbox`;
  }
  if (
    val.includes('Separata adminkonton utan daglig e-postlicens') ||
    val.includes('Alla adminkonton saknar Exchange-licens')
  ) {
    return 'Separate admin accounts without daily email licenses';
  }

  // 5. Entra permission / license fallbacks
  if (val.includes('Er tenant har Entra ID P1/P2, men appen behöver AuditLog.Read.All')) {
    const userMatch = val.match(/\(([^)]+)\)/);
    const suffix = userMatch
      ? ` (${userMatch[1].replace('användare', 'users').replace('aktiv organisation', 'active organization')})`
      : '';
    return `Tenant has Entra ID P1/P2, but app requires AuditLog.Read.All permission${suffix}`;
  }
  if (val.includes('Licens saknas för avancerad MFA-rapportering')) {
    return 'License required for advanced MFA reporting';
  }

  // 6. Security Defaults & CA
  if (val.includes('Ersatt av Villkorsstyrd åtkomst')) {
    return 'Replaced by Conditional Access';
  }
  if (val.includes('Blockerad via aktiv CA-policy') || val.includes('Blockerad via Conditional Access')) {
    return 'Blocked via active Conditional Access policy';
  }
  if (val.includes('Ingen specifik CA-policy blockerar äldre klienter')) {
    return 'No specific Conditional Access policy blocks legacy clients';
  }
  if (val.includes('Blockerad via Security Defaults')) {
    return 'Blocked via Security Defaults';
  }
  if (
    val.includes('Tillåten (Security Defaults inaktiverat)') ||
    val.includes('Tillåten (POP3/IMAP/SMTP Auth ej blockerade)')
  ) {
    return 'Allowed (Legacy authentication not blocked)';
  }
  if (val.includes('Inaktiverat') || val.toLowerCase().includes('disabled')) {
    return 'Disabled';
  }
  if (val.includes('Aktiverat') || val.toLowerCase().includes('enabled')) {
    return 'Enabled';
  }

  // 7. SSPR & Break-glass
  if (
    val.includes('Konfigurerat i enlighet med CIS Benchmark') ||
    val.includes('Konfigurerat enligt CIS Benchmark')
  ) {
    return 'Configured in accordance with CIS Benchmark';
  }
  if (val.includes('Konfigurerat med MFA-krav')) {
    return 'Configured with MFA requirement';
  }
  if (
    val.includes('Identifierat molnbaserat nödåtkomstkonto') ||
    val.includes('Molnbaserat nödåtkomstkonto upprättat')
  ) {
    return 'Cloud-only break-glass emergency account established';
  }
  if (val.includes('Inget dokumenterat nödåtkomstkonto identifierat')) {
    return 'No documented break-glass emergency account identified';
  }

  // 8. Sharing & Apps
  if (val.includes('ExistingGuests')) {
    return 'ExistingGuests (Anonymous public links disabled)';
  }
  if (val.includes('AnyoneWithLink')) {
    return 'AnyoneWithLink (Anonymous sharing links permitted)';
  }
  if (val.includes('Kräver administratörsgodkännande')) {
    return 'Requires administrator approval (Admin Consent Workflow)';
  }
  if (val.includes('Användare kan själva godkänna appar')) {
    return 'Users can self-consent to third-party applications';
  }

  // 9. DNS
  if (val.includes('Ingen SPF TXT-post hittades i DNS')) {
    return 'No SPF TXT record found in DNS';
  }
  if (val.includes('DNS TXT-uppslagning misslyckades')) {
    return 'DNS TXT lookup failed or record missing';
  }
  if (val.includes('Ingen DMARC-post hittades på _dmarc.') || val.includes('DMARC-post saknas helt')) {
    const domainMatch = val.match(/_dmarc\.([a-zA-Z0-9.-]+)/);
    return domainMatch ? `No DMARC record found on _dmarc.${domainMatch[1]}` : 'DMARC record missing completely';
  }
  if (val.includes('CNAME selector1._domainkey pekar mot onmicrosoft.com')) {
    return 'CNAME selector1._domainkey points to onmicrosoft.com';
  }
  if (val.includes('CNAME selector1._domainkey konfigurerat')) {
    return 'CNAME selector1._domainkey configured and verified';
  }
  if (val.includes('Ingen DKIM CNAME-post hittades på selector1._domainkey.')) {
    const domainMatch = val.match(/selector1\._domainkey\.([a-zA-Z0-9.-]+)/);
    return domainMatch
      ? `No DKIM CNAME record found on selector1._domainkey.${domainMatch[1]}`
      : 'DKIM CNAME record missing in DNS';
  }
  if (val.includes('DKIM CNAME-uppslagning misslyckades')) {
    return 'DKIM CNAME lookup failed in DNS';
  }

  // 10. General fallback replacement for residual Swedish words
  return val
    .replace(/(\d+)\s*av\s*(\d+)/gi, '$1 of $2')
    .replace(/\banvändare\b/gi, 'users')
    .replace(/\baktiva\b/gi, 'active')
    .replace(/\bdedikerade\b/gi, 'dedicated')
    .replace(/\badministratörer\b/gi, 'administrators')
    .replace(/\bsaknar\b/gi, 'lack')
    .replace(/\bmed\b/gi, 'with')
    .replace(/\boch\b/gi, 'and')
    .replace(/\beller\b/gi, 'or');
}

