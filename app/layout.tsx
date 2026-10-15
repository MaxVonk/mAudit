import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'mAudit — M365 Cloud Security Posture Auditor',
  description: 'Automated security posture assessment of Microsoft 365 and Entra ID environments aligned with CIS Benchmarks, NIS2, and GDPR. 100% read-only, zero password access.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary antialiased selection:bg-brand-primary/30 selection:text-white">
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
