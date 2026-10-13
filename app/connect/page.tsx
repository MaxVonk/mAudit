'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { TrustCard } from '@/components/trust-card';
import { ArrowRight, Info, PlayCircle, ShieldCheck } from 'lucide-react';

export default function ConnectPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-accent mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Säker administratörsanslutning
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Hur mAudit ansluter till er organisation
            </h1>
            <p className="mt-3 text-text-secondary text-sm sm:text-base">
              För att besiktiga er säkerhetskonfiguration loggar en Global Administratör in via Microsofts officiella
              godkännanderuta.
            </p>
          </div>

          {/* Trust Card Component */}
          <TrustCard />

          {/* Action Buttons */}
          <div className="mt-8 space-y-3.5">
            <a
              href="/api/auth/consent"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-4 text-base font-semibold text-white shadow-xl shadow-brand-primary/25 hover:bg-brand-hover transition-all"
            >
              <span>Fortsätt till Microsofts säkra inloggning</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={handleLaunchDemo}
                disabled={loadingDemo}
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-accent hover:text-cyan-300 transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{loadingDemo ? 'Genererar rapport...' : 'Har du inga administratörsrättigheter just nu? Testa med demodata'}</span>
              </button>
            </div>
          </div>

          {/* Callout Notice */}
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-border/80 bg-surface/50 p-4 text-xs text-text-muted">
            <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <p>
              Under inloggningen kommer Microsoft att visa en dialogruta där de begärda rättigheterna listas. Du måste
              vara Global Administratör eller Privileged Role Administrator i er Microsoft Entra ID-tenant för att
              slutföra besiktningen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

