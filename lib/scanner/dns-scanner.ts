import * as dns from 'dns/promises';
import { AuditFinding } from '../types';

export interface DomainDnsAuditResult {
  domain: string;
  spfFinding: AuditFinding;
  dmarcFinding: AuditFinding;
  dkimFinding: AuditFinding;
}

export async function auditDomainDns(domain: string): Promise<DomainDnsAuditResult> {
  const cleanDomain = domain.trim().toLowerCase();

  // 1. CHK-DNS-01: SPF Verification
  let spfFinding: AuditFinding;
  try {
    const txtRecords = await dns.resolveTxt(cleanDomain);
    const flattenedTxt = txtRecords.map((r) => r.join(''));
    const spfRecord = flattenedTxt.find((r) => r.startsWith('v=spf1'));

    if (!spfRecord) {
      spfFinding = {
        id: `CHK-DNS-01-${cleanDomain}`,
        category: 'EMAIL_DNS',
        title: `SPF-post saknas (${cleanDomain})`,
        severity: 'HIGH',
        weight: 20,
        status: 'FAIL',
        currentValue: 'Ingen SPF TXT-post hittades i DNS',
        recommendedValue: 'v=spf1 include:spf.protection.outlook.com -all',
        compliance: { nis2Article: 'Art 21.2.e (Säker kommunikation)' },
        remediation: {
          adminCenterPath: `DNS-leverantör för ${cleanDomain} > Lägg till TXT-post`,
          powershellSnippet: `# Skapa SPF TXT-post:\n# Namn: @\n# Värde: "v=spf1 include:spf.protection.outlook.com -all"`,
          description: 'Utan SPF kan servrar världen över skicka e-post utformad som er utan kontroll.',
        },
      };
    } else {
      const hasOutlook = spfRecord.includes('spf.protection.outlook.com');
      const isHardFail = spfRecord.includes('-all');
      const isSoftFail = spfRecord.includes('~all');
      const isPermissive = spfRecord.includes('+all') || spfRecord.includes('?all');

      if (hasOutlook && (isHardFail || isSoftFail)) {
        spfFinding = {
          id: `CHK-DNS-01-${cleanDomain}`,
          category: 'EMAIL_DNS',
          title: `SPF-postens giltighet (${cleanDomain})`,
          severity: 'HIGH',
          weight: 20,
          status: 'PASS',
          currentValue: spfRecord,
          recommendedValue: 'v=spf1 include:spf.protection.outlook.com -all',
          compliance: { nis2Article: 'Art 21.2.e' },
          remediation: {
            adminCenterPath: 'DNS-leverantör',
            powershellSnippet: '# SPF är korrekt konfigurerad',
            description: `SPF är korrekt publicerat med ${isHardFail ? 'HardFail (-all)' : 'SoftFail (~all)'}.`,
          },
        };
      } else if (isPermissive) {
        spfFinding = {
          id: `CHK-DNS-01-${cleanDomain}`,
          category: 'EMAIL_DNS',
          title: `SPF-post är alltför tillåtande (${cleanDomain})`,
          severity: 'HIGH',
          weight: 20,
          status: 'FAIL',
          currentValue: spfRecord,
          recommendedValue: 'Ersätt +all/?all med -all (HardFail)',
          compliance: { nis2Article: 'Art 21.2.e' },
          remediation: {
            adminCenterPath: 'DNS-leverantör',
            powershellSnippet: '# Byt ut +all mot -all i er SPF TXT-post',
            description: 'Posten avslutas med +all eller ?all vilket innebär att all e-post godtas oavsett avsändare.',
          },
        };
      } else {
        spfFinding = {
          id: `CHK-DNS-01-${cleanDomain}`,
          category: 'EMAIL_DNS',
          title: `SPF saknar Exchange Online-referens (${cleanDomain})`,
          severity: 'HIGH',
          weight: 20,
          status: 'WARNING',
          currentValue: spfRecord,
          recommendedValue: 'v=spf1 include:spf.protection.outlook.com -all',
          compliance: { nis2Article: 'Art 21.2.e' },
          remediation: {
            adminCenterPath: 'DNS-leverantör',
            powershellSnippet: '# Inkludera Microsoft 365 i SPF-posten',
            description: 'Microsoft 365 (spf.protection.outlook.com) saknas i SPF-posten.',
          },
        };
      }
    }
  } catch {
    spfFinding = {
      id: `CHK-DNS-01-${cleanDomain}`,
      category: 'EMAIL_DNS',
      title: `Kunde inte slå upp SPF (${cleanDomain})`,
      severity: 'HIGH',
      weight: 20,
      status: 'FAIL',
      currentValue: 'DNS TXT-uppslagning misslyckades eller post saknas',
      recommendedValue: 'v=spf1 include:spf.protection.outlook.com -all',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'DNS-leverantör',
        powershellSnippet: '# Skapa TXT-post med v=spf1 include:spf.protection.outlook.com -all',
      },
    };
  }

  // 2. CHK-DNS-02: DMARC Policy
  let dmarcFinding: AuditFinding;
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${cleanDomain}`);
    const flattenedDmarc = dmarcRecords.map((r) => r.join(''));
    const dmarcRecord = flattenedDmarc.find((r) => r.toUpperCase().includes('V=DMARC1'));

    if (!dmarcRecord) {
      dmarcFinding = {
        id: `CHK-DNS-02-${cleanDomain}`,
        category: 'EMAIL_DNS',
        title: `DMARC-efterlevnad (${cleanDomain})`,
        severity: 'HIGH',
        weight: 25,
        status: 'FAIL',
        currentValue: 'Ingen DMARC-post hittades på _dmarc.' + cleanDomain,
        recommendedValue: 'v=DMARC1; p=quarantine eller p=reject;',
        compliance: {
          nis2Article: 'Art 21.2.e (Säkerhet i elektronisk kommunikation)',
          gdprArticle: 'Art 32.1.b',
        },
        remediation: {
          adminCenterPath: `DNS-leverantör för ${cleanDomain} > Ny TXT-post med värdnamn "_dmarc"`,
          powershellSnippet: `# Skapa DMARC-post:\n# Namn: _dmarc.${cleanDomain}\n# Värde: "v=DMARC1; p=quarantine; rua=mailto:dmarc@${cleanDomain}; pct=100"`,
          description: 'Utan DMARC kan externa parter skicka bluffmejl med er domän som synlig avsändare utan att mottagarens servrar blockerar det.',
        },
      };
    } else {
      const lower = dmarcRecord.toLowerCase();
      if (lower.includes('p=reject') || lower.includes('p=quarantine')) {
        dmarcFinding = {
          id: `CHK-DNS-02-${cleanDomain}`,
          category: 'EMAIL_DNS',
          title: `DMARC-efterlevnad (${cleanDomain})`,
          severity: 'HIGH',
          weight: 25,
          status: 'PASS',
          currentValue: dmarcRecord,
          recommendedValue: 'p=quarantine eller p=reject',
          compliance: { nis2Article: 'Art 21.2.e', gdprArticle: 'Art 32.1.b' },
          remediation: {
            adminCenterPath: 'DNS-leverantör',
            powershellSnippet: '# DMARC är skyddande konfigurerad',
            description: 'DMARC tvingar mottagande e-postservrar att sätta misstänkta falska mejl i karantän eller avvisa dem helt.',
          },
        };
      } else {
        dmarcFinding = {
          id: `CHK-DNS-02-${cleanDomain}`,
          category: 'EMAIL_DNS',
          title: `DMARC är endast i övervakningsläge (p=none) (${cleanDomain})`,
          severity: 'HIGH',
          weight: 25,
          status: 'WARNING',
          currentValue: dmarcRecord,
          recommendedValue: 'Höj policyn till p=quarantine eller p=reject',
          compliance: { nis2Article: 'Art 21.2.e' },
          remediation: {
            adminCenterPath: `DNS-leverantör > Ändra _dmarc.${cleanDomain}`,
            powershellSnippet: `# Ändra p=none till p=quarantine:\n# "v=DMARC1; p=quarantine; pct=100"`,
            description: 'Policyn p=none loggar endast incidenter men stoppar inte spoofade falska mejl från att levereras till mottagarnas inkorgar.',
          },
        };
      }
    }
  } catch {
    dmarcFinding = {
      id: `CHK-DNS-02-${cleanDomain}`,
      category: 'EMAIL_DNS',
      title: `DMARC-post saknas helt (${cleanDomain})`,
      severity: 'HIGH',
      weight: 25,
      status: 'FAIL',
      currentValue: 'Ingen TXT-post på _dmarc.' + cleanDomain,
      recommendedValue: 'v=DMARC1; p=quarantine eller p=reject;',
      compliance: { nis2Article: 'Art 21.2.e', gdprArticle: 'Art 32.1.b' },
      remediation: {
        adminCenterPath: `DNS-leverantör > Skapa TXT för _dmarc.${cleanDomain}`,
        powershellSnippet: `# Skapa DMARC-post:\n# Namn: _dmarc\n# Värde: "v=DMARC1; p=quarantine; pct=100"`,
        description: 'DMARC saknas helt, vilket lämnar domänen oskyddad mot identitetskapning och vd-bedrägerier via e-post.',
      },
    };
  }

  // 3. CHK-DNS-03: DKIM Selector Verification
  let dkimFinding: AuditFinding;
  try {
    const cnameRecords = await dns.resolveCname(`selector1._domainkey.${cleanDomain}`);
    const pointsToMsft = cnameRecords.some((c) => c.includes('onmicrosoft.com'));

    if (pointsToMsft || cnameRecords.length > 0) {
      dkimFinding = {
        id: `CHK-DNS-03-${cleanDomain}`,
        category: 'EMAIL_DNS',
        title: `DKIM-signering (${cleanDomain})`,
        severity: 'MEDIUM',
        weight: 15,
        status: 'PASS',
        currentValue: `CNAME selector1._domainkey -> ${cnameRecords.join(', ')}`,
        recommendedValue: 'selector1._domainkey pekar mot Microsoft 365',
        compliance: { nis2Article: 'Art 21.2.e' },
        remediation: {
          adminCenterPath: 'Microsoft Defender XDR > DKIM',
          powershellSnippet: '# DKIM är aktivt',
        },
      };
    } else {
      dkimFinding = {
        id: `CHK-DNS-03-${cleanDomain}`,
        category: 'EMAIL_DNS',
        title: `DKIM pekar inte mot Microsoft 365 (${cleanDomain})`,
        severity: 'MEDIUM',
        weight: 15,
        status: 'WARNING',
        currentValue: cnameRecords.join(', ') || 'Okänd CNAME-post',
        recommendedValue: 'selector1._domainkey pekar mot onmicrosoft.com',
        compliance: { nis2Article: 'Art 21.2.e' },
        remediation: {
          adminCenterPath: 'Microsoft Defender XDR > E-post och samarbete > DKIM',
          powershellSnippet: '# Verifiera DKIM-konfiguration i Microsoft 365',
        },
      };
    }
  } catch {
    dkimFinding = {
      id: `CHK-DNS-03-${cleanDomain}`,
      category: 'EMAIL_DNS',
      title: `DKIM-nyckel saknas i DNS (${cleanDomain})`,
      severity: 'MEDIUM',
      weight: 15,
      status: 'WARNING',
      currentValue: 'Ingen CNAME-post hittades för selector1._domainkey.' + cleanDomain,
      recommendedValue: 'Skapa CNAME selector1._domainkey tillhörande Microsoft 365',
      compliance: { nis2Article: 'Art 21.2.e' },
      remediation: {
        adminCenterPath: 'Microsoft Defender XDR > Principer > DKIM > Aktivera nycklar',
        powershellSnippet: '# Aktivera DKIM i Exchange Online PowerShell:\nNew-DkimSigningConfig -DomainName ' + cleanDomain + ' -Enabled $true',
        description: 'Utan DKIM kan inte mottagande servrar bekräfta att innehållet i era e-postmeddelanden inte förvanskats under transport.',
      },
    };
  }

  return { domain: cleanDomain, spfFinding, dmarcFinding, dkimFinding };
}

