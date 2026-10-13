'use client';

import Link from 'next/link';
import { ShieldCheck, PlayCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleLaunchDemo = async (profile: 'vulnerable_sme' | 'remediated_sme') => {
    try {
      setLoadingDemo(true);
      const res = await fetch('/api/scan/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (data.token) {
        router.push(`/report/${data.token}`);
      }
    } catch (err) {
      console.error('Demo launch failed:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent p-2 shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              mAudit
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-accent border border-brand-accent/30">
                M365 CSPM
              </span>
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => handleLaunchDemo('vulnerable_sme')}
            disabled={loadingDemo}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle/80 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-subtle hover:border-brand-accent/40 transition-colors"
          >
            <PlayCircle className="h-3.5 w-3.5 text-brand-accent" />
            {loadingDemo ? 'Laddar demo...' : 'Testa demo (Nordic Retail)'}
          </button>

          <Link
            href="/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-hover hover:shadow-brand-primary/30 transition-all"
          >
            Starta besiktning
          </Link>
        </nav>
      </div>
    </header>
  );
}

