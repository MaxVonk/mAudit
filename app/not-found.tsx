import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface text-center">
          <AlertCircle className="w-12 h-12 text-brand-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">404 — Sidan hittades inte</h1>
          <p className="text-xs text-text-secondary mb-6">
            Den sida eller rapport du söker finns inte eller har upphört att gälla.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-primary text-xs font-semibold text-white hover:bg-brand-hover transition-colors"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </main>
    </div>
  );
}
