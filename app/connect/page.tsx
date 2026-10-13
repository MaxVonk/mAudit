'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { TrustCard } from '@/components/trust-card';
import { useLanguage } from '@/lib/i18n';
import { ArrowRight, Info, PlayCircle, ShieldCheck, AlertCircle, Key } from 'lucide-react';

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const errorParam = searchParams.get('error');

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/scan/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: 'vulnerable_sme' }),
      });
      const data = await res.json();
      if (data.token) {
        router.push(`/report/${data.token}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-accent mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('connect.badge')}
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          {t('connect.title')}
        </h1>
        <p className="mt-3 text-text-secondary text-sm sm:text-base">
          {t('connect.desc')}
        </p>
      </div>

      {/* Azure Client ID Missing Banner */}
      {errorParam === 'no_azure_client_id' && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm mb-1.5">
            <Key className="w-4 h-4" />
            <span>AZURE_CLIENT_ID missing in server environment</span>
          </div>
          <p className="leading-relaxed mb-3 text-amber-200/90">
            To connect to a live Microsoft 365 tenant, configure your <code className="bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30 font-mono text-[11px]">AZURE_CLIENT_ID</code> in your <code className="bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30 font-mono text-[11px]">.env</code> file.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleLaunchDemo}
              disabled={loadingDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Run with demo data instead</span>
            </button>
          </div>
        </div>
      )}

      {/* Generic Error Banner */}
      {errorParam && errorParam !== 'no_azure_client_id' && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <span className="font-bold block text-rose-200 mb-0.5">Connection Error</span>
            <span>{errorParam}</span>
          </div>
        </div>
      )}

      {/* Trust Card Component */}
      <TrustCard />

      {/* Action Buttons */}
      <div className="mt-8 space-y-3.5">
        <a
          href="/api/auth/consent"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-4 text-base font-semibold text-white shadow-xl shadow-brand-primary/25 hover:bg-brand-hover transition-all"
        >
          <span>{t('connect.button')}</span>
          <ArrowRight className="w-5 h-5" />
        </a>

        <div className="flex items-center justify-center pt-2">
          <button
            onClick={handleLaunchDemo}
            disabled={loadingDemo}
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-accent hover:text-cyan-300 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{loadingDemo ? 'Loading...' : t('connect.demoFallback')}</span>
          </button>
        </div>
      </div>

      {/* Callout Notice */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border/80 bg-surface/50 p-4 text-xs text-text-muted">
        <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
        <p>{t('connect.callout')}</p>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <Suspense fallback={<div className="container mx-auto max-w-2xl text-center py-12 text-xs text-text-muted">Loading...</div>}>
          <ConnectContent />
        </Suspense>
      </main>
    </div>
  );
}
