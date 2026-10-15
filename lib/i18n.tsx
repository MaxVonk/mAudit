'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sv';

export interface Translations {
  [key: string]: {
    en: string;
    sv: string;
  };
}

export const DICTIONARY: Translations = {
  // Navbar
  'nav.tag': { en: 'M365 CSPM', sv: 'M365 CSPM' },
  'nav.demo': { en: 'Try demo (Nordic Retail)', sv: 'Testa demo (Nordic Retail)' },
  'nav.start': { en: 'Start Audit', sv: 'Starta besiktning' },
  'nav.loadingDemo': { en: 'Loading demo...', sv: 'Laddar demo...' },

  // Home Hero
  'hero.badge': {
    en: 'Automated M365 analysis aligned with NIS2 & CIS Benchmark',
    sv: 'Automatiserad M365-analys enligt NIS2 & CIS Benchmark',
  },
  'hero.title1': { en: 'Audit your Microsoft 365 tenant', sv: 'Besiktiga er Microsoft 365-miljö' },
  'hero.title2': { en: 'in 60 seconds', sv: 'på 60 sekunder' },
  'hero.subtitle': {
    en: 'Get an independent cloud security health check. No passwords shared, no settings changed, and easily remove access right after.',
    sv: 'Få en oberoende hälsokontroll av er molnsäkerhet. Inga lösenord delas, inga inställningar ändras, och ni tar enkelt bort behörigheten direkt efteråt.',
  },
  'hero.cta': {
    en: 'Connect with Microsoft 365 (1 click)',
    sv: 'Anslut med Microsoft 365 (1 klick)',
  },
  'hero.howItWorks': {
    en: 'How do permissions work? Learn more →',
    sv: 'Hur fungerar behörigheterna? Läs mer →',
  },
  'hero.demoPrompt': {
    en: 'Try demo data',
    sv: 'Testa demodata',
  },

  // Trust Badges
  'badge.readOnly.title': { en: 'Read-only access', sv: 'Endast läsrättigheter' },
  'badge.readOnly.desc': { en: 'Official .Read Graph APIs', sv: 'Officiella .Read Graph API' },
  'badge.noPassword.title': { en: 'Zero password access', sv: 'Noll lösenordsåtkomst' },
  'badge.noPassword.desc': { en: 'Cannot read emails or files', sv: 'Kan inte läsa mejl eller filer' },
  'badge.retention.title': { en: '14 days retention', sv: '14 dagars lagring' },
  'badge.retention.desc': { en: 'Or delete with 1 click now', sv: 'Eller radera med 1 klick nu' },

  // 6 Categories
  'cat.title': { en: 'What mAudit inspects in your environment', sv: 'Vad mAudit kontrollerar i er miljö' },
  'cat.subtitle': {
    en: '20 in-depth security checks map vulnerabilities and provide actionable PowerShell remediation.',
    sv: '20 djupgående säkerhetskontroller kartlägger sårbarheter och ger konkreta åtgärder med PowerShell.',
  },
  'cat.1.title': { en: '1. Identity & MFA', sv: '1. Identitet & MFA' },
  'cat.1.desc': {
    en: 'Maps MFA coverage across all active users, evaluates Security Defaults, and verifies SSPR policies.',
    sv: 'Kartlägger multifaktortäckning bland alla aktiva användare, verifierar Security Defaults och säkerställer SSPR-rutiner.',
  },
  'cat.2.title': { en: '2. Global Administrators', sv: '2. Globala Administratörer' },
  'cat.2.desc': {
    en: 'Detects privilege sprawl, enforces 2–4 dedicated admin accounts, and flags admins without phishing-resistant MFA or with active mailboxes.',
    sv: 'Hittar behörighetsläckor, säkerställer 2–4 dedikerade adminkonton och flaggar administratörer utan stark MFA eller med e-postpostlådor.',
  },
  'cat.3.title': { en: '3. Conditional Access', sv: '3. Villkorsstyrd Åtkomst' },
  'cat.3.desc': {
    en: 'Verifies legacy authentication blocking (POP3/IMAP/SMTP) and validates break-glass emergency account exclusions.',
    sv: 'Granskar blockering av äldre autentisering (Legacy Auth/POP3/IMAP) och verifierar nödåtkomstkonton (Break-Glass).',
  },
  'cat.4.title': { en: '4. Email Hygiene & DNS', sv: '4. E-posthygien & DNS' },
  'cat.4.desc': {
    en: 'Performs live queries against public DNS servers: validates SPF HardFail, DMARC anti-spoofing policy, and DKIM signing.',
    sv: 'Djupkontroll av offentliga DNS-servrar: Validerar SPF med HardFail, DMARC-policy mot spoofing och DKIM-signering i Exchange.',
  },
  'cat.5.title': { en: '5. Sharing & Collaboration', sv: '5. Fildelning & Samarbete' },
  'cat.5.desc': {
    en: 'Audits anonymous external link sharing across SharePoint and OneDrive to stop accidental data exposure.',
    sv: 'Granskar anonym extern fildelning i SharePoint och OneDrive för att stoppa oavsiktliga dataläckor till obehöriga.',
  },
  'cat.6.title': { en: '6. Apps & Governance', sv: '6. Applikationer & Behörigheter' },
  'cat.6.desc': {
    en: 'Prevents end-users from granting risky third-party OAuth app permissions and enforces Admin Consent Workflows.',
    sv: 'Förhindrar slutanvändare från att godkänna riskfyllda tredjepartsappar och tvingar fram Admin Consent Workflow.',
  },
  'cat.weight': { en: 'Weight: of health score', sv: 'Vikt: av hälsopoängen' },

  // NIS2 & GDPR
  'compliance.badge': { en: 'EU Cybersecurity Requirements', sv: 'EU-cybersäkerhetskrav' },
  'compliance.title': { en: 'Audit Documentation for NIS2 and GDPR', sv: 'Rapporteringsunderlag för NIS2 och GDPR' },
  'compliance.desc': {
    en: 'The NIS2 Directive (Article 21) and GDPR (Article 32) mandate continuous verification of technical measures for authentication, email security, and access governance. mAudit maps every technical configuration directly to statutory articles.',
    sv: 'NIS2-direktivet (Artikel 21) och GDPR (Artikel 32) kräver att ledning och IT dokumenterar kontinuerliga tekniska åtgärder för autentisering, e-postsäkerhet och behörighetsstyrning. mAudit mappar varje teknisk inställning direkt till respektive lagkrav.',
  },
  'compliance.button': { en: 'View sample report with legal mapping', sv: 'Se exempelrapport med lagrum' },
  'compliance.auto': { en: 'Automated audit', sv: 'Automatiserad besiktning' },

  // Connect & Trust Screen
  'connect.badge': { en: 'Secure Admin Connection', sv: 'Säker administratörsanslutning' },
  'connect.title': { en: 'How mAudit connects to your organization', sv: 'Hur mAudit ansluter till er organisation' },
  'connect.desc': {
    en: 'To inspect your security posture, a Global Administrator signs in through Microsoft official admin consent prompt.',
    sv: 'För att besiktiga er säkerhetskonfiguration loggar en Global Administratör in via Microsofts officiella godkännanderuta.',
  },
  'connect.button': { en: 'Continue to Microsoft Secure Login', sv: 'Fortsätt till Microsofts säkra inloggning' },
  'connect.demoFallback': {
    en: "Don't have admin permissions right now? Run with demo data",
    sv: 'Har du inga administratörsrättigheter just nu? Testa med demodata',
  },
  'connect.callout': {
    en: 'During sign-in, Microsoft will present a dialog listing all requested read-only permissions. You must be a Global Administrator or Privileged Role Administrator in your Entra ID tenant to complete the audit.',
    sv: 'Under inloggningen kommer Microsoft att visa en dialogruta där de begärda rättigheterna listas. Du måste vara Global Administratör eller Privileged Role Administrator i er Microsoft Entra ID-tenant för att slutföra besiktningen.',
  },

  // Trust Card
  'trust.title': { en: '100% read-only security assessment', sv: '100% skrivskyddad säkerhetsanalys' },
  'trust.subtitle': { en: 'Zero changes and zero access to sensitive company content', sv: 'Inga ändringar eller åtkomst till känsligt företagsinnehåll' },
  'trust.point1.title': { en: 'Strictly read-only permissions (.Read):', sv: 'Enbart läsrättigheter (.Read):' },
  'trust.point1.desc': {
    en: 'mAudit requests official Microsoft Graph read permissions only. The app has zero capability to modify or reconfigure your tenant.',
    sv: 'mAudit begär uteslutande officiella Microsoft Graph läsbehörigheter. Appen saknar helt behörighet att ändra, spara eller konfigurera om er miljö.',
  },
  'trust.point2.title': { en: 'Zero access to emails, files, or passwords:', sv: 'Noll åtkomst till innehåll eller lösenord:' },
  'trust.point2.desc': {
    en: 'We cannot read employee inboxes, Teams messages, OneDrive documents, or passwords. No directory copy is retained.',
    sv: 'Vi kan varken läsa anställdas inkorgar, Teams-meddelanden, OneDrive-dokument eller lösenord. Ingen persondatakopia sparas.',
  },
  'trust.point3.title': { en: 'Easy 10-second offboarding:', sv: 'Enkel avregistrering (10 sekunder):' },
  'trust.point3.desc': {
    en: 'You can immediately delete the app after the audit in Microsoft Entra Admin Center > Enterprise Applications > mAudit > Properties > Delete.',
    sv: 'Du kan omedelbart radera appen efter avslutad besiktning under Microsoft Entra Admin Center > Företagsappar > mAudit > Egenskaper > Ta bort.',
  },
  'trust.drilldown': {
    en: 'The 6 read-only permissions requested in Microsoft login dialog',
    sv: 'De 6 behörigheter som begärs i Microsofts inloggningsruta',
  },

  // Scan View
  'scan.progress': { en: 'Audit in progress...', sv: 'Besiktning pågår...' },
  'scan.subtitle': {
    en: 'Retrieving security configurations and evaluating your M365 posture in real time.',
    sv: 'Vi hämtar säkerhetskonfigurationer och analyserar era M365-inställningar i realtid.',
  },
  'scan.scanning': { en: 'Scanning', sv: 'Skannar' },

  // Report View
  'report.header': { en: 'M365 Cloud Security Posture Report', sv: 'M365 Cloud Security Posture Report' },
  'report.auditedOn': { en: 'Audited on', sv: 'Besiktigad' },
  'report.diffBtn': { en: 'Simulate re-scan (Diff)', sv: 'Simulera om-skanning (Diff)' },
  'report.pdfBtn': { en: 'Download PDF', sv: 'Ladda ner PDF' },
  'report.shareBtn': { en: 'Share link', sv: 'Dela länk' },
  'report.sharedCopied': { en: 'Link copied!', sv: 'Länk kopierad!' },
  'report.deleteBtn': { en: 'Delete data', sv: 'Radera data' },
  'report.frameworks': { en: 'Security & Compliance Frameworks', sv: 'Säkerhetsramverk & Efterlevnad' },
  'report.frameworksDesc': {
    en: 'Real-time readiness evaluation across CIS Microsoft 365, SOC 2 Type II, NIS2 Directive, and GDPR.',
    sv: 'Realtidsutvärdering av efterlevnad mot CIS Microsoft 365, SOC 2 Type II, NIS2-direktivet och GDPR.',
  },
  'report.kpi.cis': { en: 'CIS M365 Foundations', sv: 'CIS M365 Foundations' },
  'report.kpi.cisDesc': { en: 'Technical baseline controls (Level 1)', sv: 'Tekniska baskontroller (Level 1)' },
  'report.kpi.soc2': { en: 'SOC 2 Type II (TSC)', sv: 'SOC 2 Type II (TSC)' },
  'report.kpi.soc2Desc': { en: 'Common Criteria for Security (CC6/CC7)', sv: 'Säkerhetskriterier för revision (CC6/CC7)' },
  'report.kpi.mfa': { en: 'MFA Coverage', sv: 'MFA-täckning' },
  'report.kpi.mfaDesc': { en: 'of all active users', sv: 'av alla aktiva användare' },
  'report.kpi.admins': { en: 'Global Administrators', sv: 'Globala Administratörer' },
  'report.kpi.adminsDesc': { en: 'Recommended range is 2–4 dedicated accounts', sv: 'Rekommenderat antal är 2–4 dedikerade konton' },
  'report.kpi.nis2': { en: 'NIS2 Directive (Art. 21)', sv: 'NIS2 Direktiv (Art. 21)' },
  'report.kpi.nis2Desc': { en: 'Technical compliance with cyber hygiene & MFA', sv: 'Teknisk efterlevnad av cyberhygien & MFA' },
  'report.kpi.gdpr': { en: 'GDPR Security (Art. 32)', sv: 'GDPR Säkerhet (Art. 32)' },
  'report.kpi.gdprDesc': { en: 'Protection against unauthorized access & leaks', sv: 'Skydd mot obehörig åtkomst och dataläckor' },
  'report.catBreakdown': { en: 'Audit Categories & Score Breakdown', sv: 'Besiktningsområden & Poängfördelning' },
  'report.findingsTitle': { en: 'Detailed Security Checks', sv: 'Detaljerade säkerhetskontroller' },
  'report.findingsSubtitle': {
    en: 'Click any card to reveal pedagogical explanation, admin click-path, and copyable PowerShell commands.',
    sv: 'Klicka på ett kort för att se pedagogisk förklaring, klickväg och PowerShell-kommando.',
  },
  'filter.all': { en: 'All', sv: 'Alla' },
  'filter.critical': { en: 'Critical', sv: 'Kritiska' },
  'filter.warnings': { en: 'Warnings', sv: 'Varningar' },
  'filter.passed': { en: 'Passed', sv: 'Godkända' },
  'filter.na': { en: 'License Required', sv: 'Licens krävs' },
  'filter.framework.all': { en: 'All Frameworks', sv: 'Alla ramverk' },
  'filter.framework.cis': { en: 'CIS Benchmark (L1)', sv: 'CIS Benchmark (L1)' },
  'filter.framework.soc2': { en: 'SOC 2 Criteria', sv: 'SOC 2 Kriterier' },
  'filter.framework.nis2': { en: 'NIS2 (Art. 21)', sv: 'NIS2 (Art. 21)' },
  'filter.framework.gdpr': { en: 'GDPR (Art. 32)', sv: 'GDPR (Art. 32)' },
  'report.deleteModal.title': { en: 'Delete audit report immediately?', sv: 'Radera besiktningsrapport omedelbart?' },
  'report.deleteModal.desc': {
    en: 'This permanently purges the report and all aggregated statistics from the database. The public link will stop working immediately. This action cannot be undone.',
    sv: 'Detta raderar rapporten och all aggregerad statistik permanent från databasen. Den offentliga länken slutar omedelbart att fungera. Denna åtgärd kan inte ångras.',
  },
  'report.deleteModal.cancel': { en: 'Cancel', sv: 'Avbryt' },
  'report.deleteModal.confirm': { en: 'Yes, permanently delete now', sv: 'Ja, radera all data nu' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Check saved preference or default to English
    const saved = localStorage.getItem('maudit_lang') as Language;
    if (saved === 'en' || saved === 'sv') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('maudit_lang', lang);
  };

  const t = (key: string): string => {
    const item = DICTIONARY[key];
    if (!item) return key;
    return item[language] || item.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

