'use client';

import { ShieldCheck, Lock, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

const PERMISSIONS_LIST = [
  {
    name: 'Directory.Read.All',
    scopeEn: 'Directory Information',
    scopeSv: 'Kataloginformation',
    descEn: 'Reads tenant metadata, user counts, and licensing models to calibrate security benchmarks.',
    descSv: 'Läser organisationsmetadata, antal aktiva användare och licensmodeller för att anpassa säkerhetskraven.',
  },
  {
    name: 'Organization.Read.All',
    scopeEn: 'Organization & Domains',
    scopeSv: 'Organisation & Domäner',
    descEn: 'Identifies verified custom domains to perform public SPF, DKIM, and DMARC DNS lookups.',
    descSv: 'Identifierar anslutna domäner (t.ex. ertforetag.se) för att slå upp SPF-, DKIM- och DMARC-poster.',
  },
  {
    name: 'Policy.Read.All',
    scopeEn: 'Security Policies',
    scopeSv: 'Säkerhetspolicyer',
    descEn: 'Evaluates Security Defaults, Conditional Access, and modern password authorization policies.',
    descSv: 'Granskar om Security Defaults, Conditional Access och moderna lösenordskrav är aktiverade.',
  },
  {
    name: 'Reports.Read.All',
    scopeEn: 'MFA & Authentication Methods',
    scopeSv: 'MFA & Registreringsgrad',
    descEn: 'Retrieves aggregated statistics on employee MFA registration percentages.',
    descSv: 'Hämtar aggregerad statistik över hur stor andel av personalen som har aktiverat multifaktorautentisering.',
  },
  {
    name: 'RoleManagement.Read.Directory',
    scopeEn: 'Administrator Roles',
    scopeSv: 'Administratörsroller',
    descEn: 'Counts Global Administrators and checks for dedicated accounts and MFA compliance.',
    descSv: 'Räknar antalet Globala Administratörer och kontrollerar att de har MFA och dedikerade konton.',
  },
  {
    name: 'AuditLog.Read.All',
    scopeEn: 'Audit & MFA Reports',
    scopeSv: 'Granskningsloggar & MFA',
    descEn: 'Allows programmatic read-only access to authentication registration details via Graph API.',
    descSv: 'Tillåter automatiserad läsning av registreringsstatus för autentiseringsmetoder via Graph API.',
  },
];

export function TrustCard() {
  const [showDetails, setShowDetails] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-6 md:p-8 backdrop-blur shadow-xl">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <ShieldCheck className="w-7 h-7 text-brand-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{t('trust.title')}</h3>
          <p className="text-sm text-text-secondary">{t('trust.subtitle')}</p>
        </div>
      </div>

      <ul className="space-y-4 text-sm text-text-secondary mb-6">
        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Eye className="w-5 h-5 text-status-pass mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">{t('trust.point1.title')}</strong>
            <span>{t('trust.point1.desc')}</span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Lock className="w-5 h-5 text-status-pass mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">{t('trust.point2.title')}</strong>
            <span>{t('trust.point2.desc')}</span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Trash2 className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">{t('trust.point3.title')}</strong>
            <span>{t('trust.point3.desc')}</span>
          </div>
        </li>
      </ul>

      {/* Permission drill-down */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <span>{t('trust.drilldown')}</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2.5 animate-fadeIn">
            {PERMISSIONS_LIST.map((perm) => (
              <div key={perm.name} className="p-3 rounded-lg bg-surface-subtle/70 border border-border/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-brand-accent font-semibold">{perm.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-text-muted">
                    {language === 'en' ? perm.scopeEn : perm.scopeSv}
                  </span>
                </div>
                <p className="text-text-secondary">
                  {language === 'en' ? perm.descEn : perm.descSv}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
