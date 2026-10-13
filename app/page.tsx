'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useLanguage } from '@/lib/i18n';
import {
  ShieldCheck,
  KeyRound,
  Trash2,
  Users,
  ShieldAlert,
  Sliders,
  Mail,
  Share2,
  Layers,
  ArrowRight,
  PlayCircle,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleRunDemo = async (profile: 'vulnerable_sme' | 'remediated_sme') => {
    setLoadingDemo(true);
    try {
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
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-brand-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-primary/15 to-brand-accent/15 blur-3xl pointer-events-none rounded-full" />

          <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative text-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-subtle/80 px-4 py-1.5 text-xs font-semibold text-text-primary mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
              {t('hero.title1')}{' '}
              <span className="bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-accent bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Main Action Card: 1-Click Onboarding */}
            <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur shadow-2xl mb-8">
              <div className="space-y-3">
                <a
                  href="/api/auth/consent"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-primary px-6 py-4 text-base font-semibold text-white shadow-xl shadow-brand-primary/25 hover:bg-brand-hover hover:scale-[1.01] transition-all"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span>{t('hero.cta')}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </a>

                <div className="flex items-center justify-between text-xs text-text-muted px-1 pt-1">
                  <a
                    href="/connect"
                    className="hover:text-white transition-colors underline underline-offset-4 decoration-border"
                  >
                    {t('hero.howItWorks')}
                  </a>
                  <button
                    onClick={() => handleRunDemo('vulnerable_sme')}
                    disabled={loadingDemo}
                    className="font-semibold text-brand-accent hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {loadingDemo ? t('nav.loadingDemo') : t('hero.demoPrompt')}
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-surface/50">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-status-pass">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{t('badge.readOnly.title')}</h4>
                  <p className="text-[11px] text-text-muted">{t('badge.readOnly.desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-surface/50">
                <div className="p-2 rounded-lg bg-blue-500/10 text-brand-accent">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{t('badge.noPassword.title')}</h4>
                  <p className="text-[11px] text-text-muted">{t('badge.noPassword.desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-surface/50">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{t('badge.retention.title')}</h4>
                  <p className="text-[11px] text-text-muted">{t('badge.retention.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 AUDIT CATEGORIES GRID */}
        <section className="py-16 border-t border-border/60 bg-surface/40">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                {t('cat.title')}
              </h2>
              <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
                {t('cat.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category 1 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.1.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.1.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">35% {t('cat.weight')}</span>
              </div>

              {/* Category 2 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.2.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.2.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">25% {t('cat.weight')}</span>
              </div>

              {/* Category 3 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.3.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.3.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">15% {t('cat.weight')}</span>
              </div>

              {/* Category 4 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.4.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.4.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">15% {t('cat.weight')}</span>
              </div>

              {/* Category 5 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.5.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.5.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">5% {t('cat.weight')}</span>
              </div>

              {/* Category 6 */}
              <div className="p-6 rounded-2xl border border-border bg-surface/80 hover:border-brand-primary/40 transition-all">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('cat.6.title')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {t('cat.6.desc')}
                </p>
                <span className="text-[11px] font-mono text-brand-accent">5% {t('cat.weight')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* NIS2 & GDPR COMPLIANCE BANNER */}
        <section className="py-16 border-t border-border/60">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-brand-primary/30 bg-gradient-to-br from-surface via-surface to-brand-primary/10 p-8 sm:p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-brand-accent mb-4">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    {t('compliance.badge')}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                    {t('compliance.title')}
                  </h3>
                  <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
                    {t('compliance.desc')}
                  </p>
                  <button
                    onClick={() => handleRunDemo('vulnerable_sme')}
                    className="inline-flex items-center gap-2 rounded-xl bg-surface-subtle border border-border px-4 py-2.5 text-sm font-semibold text-white hover:bg-surface hover:border-brand-accent/40 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-brand-accent" />
                    {t('compliance.button')}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-border/80 w-full md:w-80 shrink-0 text-center">
                  <div className="text-4xl font-extrabold text-white mb-1">100%</div>
                  <p className="text-xs text-text-muted mb-4 uppercase tracking-wider font-semibold">
                    {t('compliance.auto')}
                  </p>
                  <div className="space-y-2 text-xs text-text-secondary text-left">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-status-pass shrink-0" />
                      <span>CIS M365 v3.0 Benchmark</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-status-pass shrink-0" />
                      <span>NIS2 Directive Art. 21</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-status-pass shrink-0" />
                      <span>GDPR Art. 32 Security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/70 py-8 bg-surface/60 text-xs text-text-muted">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">mAudit</span>
            <span>— Microsoft 365 Cloud Security Posture Management</span>
          </div>
          <div>
            <span>14-day zero-retention privacy architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
