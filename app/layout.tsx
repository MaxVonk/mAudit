import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mAudit — M365 Säkerhetsbesiktning & NIS2-analys',
  description: 'Automatiserad hälsokontroll av er Microsoft 365 och Entra ID-miljö enligt CIS Benchmarks och NIS2. 100% skrivskyddad, noll lösenordsåtkomst.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="dark">
      <body className="bg-background text-text-primary antialiased selection:bg-brand-primary/30 selection:text-white">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

