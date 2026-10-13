'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ShieldCheck, CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ScanStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const INITIAL_STEPS: ScanStep[] = [
  { id: '1', label: 'Ansluter till Microsoft Graph och verifierar tenant-licenser...', status: 'in_progress' },
  { id: '2', label: 'Slår upp SPF, DKIM och DMARC mot publika DNS-servrar...', status: 'pending' },
  { id: '3', label: 'Granskar Globala Administratörer och MFA-efterlevnad...', status: 'pending' },
  { id: '4', label: 'Kontrollerar Conditional Access och blockering av legacy auth...', status: 'pending' },
  { id: '5', label: 'Beräknar CIS- och NIS2-efterlevnad samt slutför rapport...', status: 'pending' },
];

function ScanView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [steps, setSteps] = useState<ScanStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(15);
  const [reportToken, setReportToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate or fetch report
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
          console.warn('Live scan returnerade fel, använder demofallback:', liveData.error);
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
      } catch (err) {
        console.error('Scan error:', err);
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
  }, []);

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
              <span className="text-[10px] uppercase font-semibold text-text-muted">Skannar</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Besiktning pågår...</h2>
          <p className="text-xs text-text-secondary mb-8">
            Vi hämtar säkerhetskonfigurationer och analyserar era M365-inställningar i realtid.
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
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
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

