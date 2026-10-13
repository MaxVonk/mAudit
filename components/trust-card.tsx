'use client';

import { ShieldCheck, Lock, Eye, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const PERMISSIONS_LIST = [
  {
    name: 'Directory.Read.All',
    scope: 'Kataloginformation',
    description: 'Läser organisationsmetadata, antal aktiva användare och licensmodeller för att anpassa säkerhetskraven.',
  },
  {
    name: 'Organization.Read.All',
    scope: 'Organisation & Domäner',
    description: 'Identifierar anslutna domäner (t.ex. ertforetag.se) för att slå upp SPF-, DKIM- och DMARC-poster.',
  },
  {
    name: 'Policy.Read.All',
    scope: 'Säkerhetspolicyer',
    description: 'Granskar om Security Defaults, Conditional Access och moderna lösenordskrav är aktiverade.',
  },
  {
    name: 'Reports.Read.All',
    scope: 'MFA & Registreringsgrad',
    description: 'Hämtar aggregerad statistik över hur stor andel av personalen som har aktiverat multifaktorautentisering.',
  },
  {
    name: 'RoleManagement.Read.Directory',
    scope: 'Administratörsroller',
    description: 'Räknar antalet Globala Administratörer och kontrollerar att de har MFA och dedikerade konton.',
  },
];

export function TrustCard() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-6 md:p-8 backdrop-blur shadow-xl">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <ShieldCheck className="w-7 h-7 text-brand-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">100% skrivskyddad säkerhetsanalys</h3>
          <p className="text-sm text-text-secondary">Inga ändringar eller åtkomst till känsligt företagsinnehåll</p>
        </div>
      </div>

      <ul className="space-y-4 text-sm text-text-secondary mb-6">
        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Eye className="w-5 h-5 text-status-pass mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">Enbart läsrättigheter (.Read):</strong>
            <span>mAudit begär uteslutande officiella Microsoft Graph läsbehörigheter. Appen saknar helt behörighet att ändra, spara eller konfigurera om er miljö.</span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Lock className="w-5 h-5 text-status-pass mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">Noll åtkomst till innehåll eller lösenord:</strong>
            <span>Vi kan varken läsa anställdas inkorgar, Teams-meddelanden, OneDrive-dokument eller lösenord. Ingen persondatakopia sparas.</span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-surface-subtle/40 p-3.5 rounded-xl border border-border/50">
          <Trash2 className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <strong className="text-white block mb-0.5">Enkel avregistrering (10 sekunder):</strong>
            <span>Du kan omedelbart radera appen efter avslutad besiktning under <em>Microsoft Entra Admin Center &gt; Företagsappar &gt; mAudit &gt; Egenskaper &gt; Ta bort</em>.</span>
          </div>
        </li>
      </ul>

      {/* Permission drill-down */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <span>De 5 behörigheter som begärs i Microsofts inloggningsruta</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2.5 animate-fadeIn">
            {PERMISSIONS_LIST.map((perm) => (
              <div key={perm.name} className="p-3 rounded-lg bg-surface-subtle/70 border border-border/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-brand-accent font-semibold">{perm.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-text-muted">{perm.scope}</span>
                </div>
                <p className="text-text-secondary">{perm.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

