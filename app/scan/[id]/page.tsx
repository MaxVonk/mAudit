'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ShieldCheck, CheckCircle2, Loader2, Circle, AlertTriangle, Key } from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

interface ScanStep {
  id: string;
  labelEn: string;
  labelSv: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const INITIAL_STEPS: ScanStep[] = [
  { id: '1', labelEn: 'Connecting to Microsoft Graph and inspecting tenant licenses...', labelSv: 'Ansluter till Microsoft Graph och verifierar tenant-licenser...', status: 'in_progress' },
  { id: '2', labelEn: 'Querying SPF, DKIM, and DMARC against public DNS servers...', labelSv: 'Slår upp SPF, DKIM och DMARC mot publika DNS-servrar...', status: 'pending' },
  { id: '3', labelEn: 'Auditing Global Administrators and MFA registration metrics...', labelSv: 'Granskar Globala Administratörer och MFA-efterlevnad...', status: 'pending' },
  { id: '4', labelEn: 'Evaluating Conditional Access policies and legacy auth blocking...', labelSv: 'Kontrollerar Conditional Access och blockering av legacy auth...', status: 'pending' },
  { id: '5', labelEn: 'Calculating CIS & NIS2 compliance and compiling final report...', labelSv: 'Beräknar CIS- och NIS2-efterlevnad samt slutför rapport...', status: 'pending' },
];

function ScanView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const [steps, setSteps] = useState<ScanStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(15);
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function triggerScan() {
      const tenant = searchParams.get('tenant');
      try {
        if (tenant) {
          const liveRes = await fetch('/api/scan/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: tenant }),
          });
          const liveData = await liveRes.json();
          if (liveData.token && active) {
            setReportToken(liveData.token);
            return;
          }
          if (liveData.error && active) {
            setScanError(liveData.error);
            return;
          }
        }

        const res = await fetch('/api/scan/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: 'vulnerable_sme' }),
        });
        const data = await res.json();
        if (data.token && active) {
          setReportToken(data.token);
        }
      } catch (err: any) {
        console.error('Scan error:', err);
        if (active) {
          setScanError(err.message || 'Ett oväntat fel uppstod vid skanningen.');
        }
      }
    }

    triggerScan();

    // Step progression animation ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 600);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [searchParams]);

  // Update step status based on progress percentage
  useEffect(() => {
    setSteps((prev) =>
      prev.map((step, idx) => {
        const threshold = (idx + 1) * 20;
        if (progress >= threshold) {
          return { ...step, status: 'completed' };
        } else if (progress >= threshold - 20) {
          return { ...step, status: 'in_progress' };
        } else {
          return { ...step, status: 'pending' };
        }
      })
    );

    if (progress >= 100 && reportToken) {
      const timeout = setTimeout(() => {
        router.push(`/report/${reportToken}`);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [progress, reportToken, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        {scanError ? (
          <div className="w-full max-w-xl rounded-2xl border border-rose-500/30 bg-surface p-8 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Microsoft Graph Autentiseringsfel</h2>
                <p className="text-xs text-text-secondary">Kunde inte hämta access token för den anslutna tenanten</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-rose-500/20 font-mono text-xs text-rose-300 break-words mb-5">
              {scanError}
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border text-xs text-text-secondary space-y-2 mb-6">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Key className="w-4 h-4 text-brand-accent" />
                <span>Hur du åtgärdar detta:</span>
              </div>
              <p>
                Felet <strong className="text-white">AADSTS7000215 (Invalid client secret)</strong> beror oftast på att:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-1">
                <li>Värdet som kopierades från Azure Portal var <strong className="text-white">Secret ID</strong> istället för <strong className="text-white">Value</strong>.</li>
                <li>Ett tecken råkade falla bort under kopieringen (t.ex. sista tecknet).</li>
              </ul>
              <p className="pt-1 text-slate-300">
                👉 Gå till <em>Entra ID &gt; App registrations &gt; mAudit &gt; Certificates &amp; secrets</em>, klicka på <strong>+ New client secret</strong>, klicka på <strong>kopieringsikonen</strong> i kolumnen <strong>Value</strong> och klistra in i din <code className="text-brand-accent font-mono">.env</code>. Starta sedan om servern.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary text-xs font-semibold text-white hover:bg-brand-hover transition-colors"
              >
                Försök igen
              </button>
              <button
                onClick={async () => {
                  const res = await fetch('/api/scan/demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: 'vulnerable_sme' }),
                  });
                  const data = await res.json();
                  if (data.token) router.push(`/report/${data.token}`);
                }}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface-subtle text-xs font-semibold text-text-secondary hover:text-white transition-colors"
              >
                Fortsätt med demodata istället
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 shadow-2xl text-center">
            {/* Progress Ring / Gauge */}
            <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#1F2937"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#06B6D4"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (progress / 100) * 377}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{progress}%</span>
                <span className="text-[10px] uppercase font-semibold text-text-muted">{t('scan.scanning')}</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{t('scan.progress')}</h2>
            <p className="text-xs text-text-secondary mb-8">
              {t('scan.subtitle')}
            </p>

          {/* Sequential Step Log */}
          <div className="space-y-3 text-left">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-lg border p-3 text-xs transition-colors ${
                  step.status === 'completed'
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-200'
                    : step.status === 'in_progress'
                    ? 'border-brand-accent/30 bg-brand-accent/5 text-white font-medium'
                    : 'border-border/40 bg-surface-subtle/30 text-text-muted'
                }`}
              >
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                {step.status === 'in_progress' && (
                  <Loader2 className="h-4 w-4 text-brand-accent animate-spin shrink-0" />
                )}
                {step.status === 'pending' && (
                  <Circle className="h-4 w-4 text-slate-600 shrink-0" />
                )}
                <span>{language === 'en' ? step.labelEn : step.labelSv}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ScanView />
    </Suspense>
  );
}

