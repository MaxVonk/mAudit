'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ScoreGauge } from '@/components/score-gauge';
import { DiffBadge } from '@/components/diff-badge';
import { FindingCard } from '@/components/finding-card';
import { useLanguage } from '@/lib/i18n';
import {
  Download,
  Share2,
  Trash2,
  AlertTriangle,
  Users,
  Shield,
  FileCheck,
  RefreshCw,
  Check,
  Building,
  Calendar,
} from 'lucide-react';
import { StoredScanReport, AuditFinding } from '@/lib/types';

const CATEGORY_NAMES_EN: Record<string, string> = {
  IDENTITY: 'Identity & MFA',
  ADMIN: 'Global Administrators',
  CONDITIONAL_ACCESS: 'Conditional Access',
  EMAIL_DNS: 'Email & Domain Security (DNS)',
  SHARING: 'File Sharing & Collaboration',
  APP_GOVERNANCE: 'Application Governance',
};

export default function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();
  const { language, t } = useLanguage();

  const [report, setReport] = useState<StoredScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'PASS' | 'NOT_APPLICABLE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remediating, setRemediating] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/report/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || (language === 'en' ? 'Report could not be loaded.' : 'Rapporten kunde inte laddas.'));
        }
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [token, language]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/report/${token}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/?deleted=true');
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleRunRemediatedScan = async () => {
    setRemediating(true);
    try {
      const res = await fetch('/api/scan/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: 'remediated_sme' }),
      });
      const data = await res.json();
      if (data.token) {
        router.push(`/report/${data.token}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemediating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary">
              {language === 'en' ? 'Loading assessment report...' : 'Laddar besiktningsrapport...'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/30 bg-surface text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">
              {language === 'en' ? 'Report not available' : 'Rapporten är inte tillgänglig'}
            </h2>
            <p className="text-xs text-text-secondary mb-6">{error || (language === 'en' ? 'Report was deleted or has expired.' : 'Rapporten har tagits bort eller upphört att gälla.')}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              {language === 'en' ? 'Return to Home' : 'Tillbaka till startsidan'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Filter findings
  const findings: AuditFinding[] = report.findings;
  const filteredFindings = findings.filter((f) => {
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    if (!matchesCategory) return false;

    if (activeFilter === 'CRITICAL') return f.severity === 'CRITICAL' && f.status === 'FAIL';
    if (activeFilter === 'WARNING') return f.status === 'WARNING';
    if (activeFilter === 'PASS') return f.status === 'PASS';
    if (activeFilter === 'NOT_APPLICABLE') return f.status === 'NOT_APPLICABLE';
    return true;
  });

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL' && f.status === 'FAIL').length;
  const warningCount = findings.filter((f) => f.status === 'WARNING').length;
  const passCount = findings.filter((f) => f.status === 'PASS').length;
  const naCount = findings.filter((f) => f.status === 'NOT_APPLICABLE').length;

  const dateStr = new Date(report.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate NIS2 & GDPR summary stats
  const nis2Findings = findings.filter((f) => f.compliance.nis2Article);
  const nis2Pass = nis2Findings.filter((f) => f.status === 'PASS').length;
  const gdprFindings = findings.filter((f) => f.compliance.gdprArticle);
  const gdprPass = gdprFindings.filter((f) => f.status === 'PASS').length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* TOP BAR / REPORT HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent mb-1.5">
                <Building className="w-4 h-4" />
                <span>{t('report.header')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {report.companyName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('report.auditedOn')} {dateStr}</span>
                <span>•</span>
                <span className="font-mono text-[11px]">ID: {report.tenantIdHash.substring(0, 12)}...</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 no-print">
              <button
                onClick={handleRunRemediatedScan}
                disabled={remediating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-brand-accent/20 transition-colors"
                title="Simulate re-scan after remediations to see diffing"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${remediating ? 'animate-spin' : ''}`} />
                <span>{remediating ? 'Analyzing...' : t('report.diffBtn')}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-white hover:bg-surface-subtle transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('report.pdfBtn')}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-white hover:bg-surface-subtle transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? t('report.sharedCopied') : t('report.shareBtn')}</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('report.deleteBtn')}</span>
              </button>
            </div>
          </div>

          {/* SCAN DIFF NOTIFICATION (IF PRESENT) */}
          {report.diff && (
            <div className="mb-8">
              <DiffBadge diff={report.diff} />
            </div>
          )}

          {/* EXECUTIVE SCORE CARD & 4 KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Score Gauge */}
            <div className="lg:col-span-4 flex">
              <div className="w-full">
                <ScoreGauge score={report.score} />
              </div>
            </div>

            {/* Quick KPIs & Regulatory compliance */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* KPI 1: MFA */}
              <div className="p-5 rounded-2xl border border-border bg-surface/90 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('report.kpi.mfa')}</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white mb-1">
                    {report.summaryStats.mfaPercent}%
                  </div>
                  <p className="text-xs text-text-secondary">
                    {report.summaryStats.mfaRegisteredUsers} {language === 'en' ? 'of' : 'av'} {report.summaryStats.totalUsers} {t('report.kpi.mfaDesc')}
                  </p>
                </div>
                <div className="w-full bg-surface-subtle h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      report.summaryStats.mfaPercent >= 95 ? 'bg-status-pass' : 'bg-status-warning'
                    }`}
                    style={{ width: `${report.summaryStats.mfaPercent}%` }}
                  />
                </div>
              </div>

              {/* KPI 2: Global Admins */}
              <div className="p-5 rounded-2xl border border-border bg-surface/90 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('report.kpi.admins')}</span>
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white mb-1">
                    {report.summaryStats.adminCount} {language === 'en' ? 'accounts' : 'st'}
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('report.kpi.adminsDesc')}
                  </p>
                </div>
                <div className="mt-3">
                  <span className="text-[11px] font-medium text-text-muted">
                    {language === 'en' ? 'Admin MFA Compliance:' : 'MFA bland administratörer:'} {report.summaryStats.adminMfaPercent}%
                  </span>
                </div>
              </div>

              {/* KPI 3: NIS2 Compliance */}
              <div className="p-5 rounded-2xl border border-border bg-surface/90 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('report.kpi.nis2')}</span>
                  <FileCheck className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {nis2Pass} {language === 'en' ? 'of' : 'av'} {nis2Findings.length} {language === 'en' ? 'controls met' : 'kontroller'}
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('report.kpi.nis2Desc')}
                  </p>
                </div>
                <div className="w-full bg-surface-subtle h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full"
                    style={{ width: `${nis2Findings.length ? (nis2Pass / nis2Findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* KPI 4: GDPR Compliance */}
              <div className="p-5 rounded-2xl border border-border bg-surface/90 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('report.kpi.gdpr')}</span>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {gdprPass} {language === 'en' ? 'of' : 'av'} {gdprFindings.length} {language === 'en' ? 'controls met' : 'kontroller'}
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('report.kpi.gdprDesc')}
                  </p>
                </div>
                <div className="w-full bg-surface-subtle h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${gdprFindings.length ? (gdprPass / gdprFindings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIES OVERVIEW */}
          <div className="mb-10 rounded-2xl border border-border bg-surface/80 p-6">
            <h3 className="text-base font-bold text-white mb-4">{t('report.catBreakdown')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(report.categoryScores).map(([catKey, cat]) => (
                <div key={catKey} className="p-4 rounded-xl bg-surface-subtle/50 border border-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">
                      {language === 'en' ? (CATEGORY_NAMES_EN[catKey] || cat.name) : cat.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-accent">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        cat.percentage >= 90 ? 'bg-status-pass' : cat.percentage >= 70 ? 'bg-status-warning' : 'bg-status-fail'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>{cat.findingsCount.pass} {language === 'en' ? 'passed' : 'godkända'}</span>
                    <span>{cat.findingsCount.fail} {language === 'en' ? 'failed' : 'brister'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINDINGS LIST & FILTERS */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{t('report.findingsTitle')}</h3>
                <p className="text-xs text-text-secondary">
                  {t('report.findingsSubtitle')}
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 no-print">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === 'ALL'
                      ? 'bg-brand-primary text-white'
                      : 'bg-surface text-text-secondary hover:text-white border border-border'
                  }`}
                >
                  {t('filter.all')} ({findings.length})
                </button>
                {criticalCount > 0 && (
                  <button
                    onClick={() => setActiveFilter('CRITICAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                    }`}
                  >
                    {t('filter.critical')} ({criticalCount})
                  </button>
                )}
                <button
                  onClick={() => setActiveFilter('WARNING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === 'WARNING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                  }`}
                >
                  {t('filter.warnings')} ({warningCount})
                </button>
                <button
                  onClick={() => setActiveFilter('PASS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === 'PASS'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                  }`}
                >
                  {t('filter.passed')} ({passCount})
                </button>
                {naCount > 0 && (
                  <button
                    onClick={() => setActiveFilter('NOT_APPLICABLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeFilter === 'NOT_APPLICABLE'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {t('filter.na')} ({naCount})
                  </button>
                )}
              </div>
            </div>

            {/* Findings Accordion Cards */}
            <div className="space-y-3.5">
              {filteredFindings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-border bg-surface text-text-muted text-sm">
                  {language === 'en' ? 'No findings matched the selected filter.' : 'Inga kontroller matchade det valda filtret.'}
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    defaultExpanded={finding.status === 'FAIL' || finding.status === 'WARNING'}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRMATION MODAL FOR DATA DELETION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">{t('report.deleteModal.title')}</h3>
            </div>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              {t('report.deleteModal.desc')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-border bg-surface-subtle text-xs font-semibold text-text-primary hover:bg-surface transition-colors"
              >
                {t('report.deleteModal.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25"
              >
                {deleting ? 'Deleting...' : t('report.deleteModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
