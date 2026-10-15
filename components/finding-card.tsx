'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Shield,
  FileCheck,
  Lock,
  Award,
} from 'lucide-react';
import { AuditFinding } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import { FINDING_LOCALIZATIONS, translateCurrentValue } from '@/lib/finding-translations';

interface FindingCardProps {
  finding: AuditFinding;
  defaultExpanded?: boolean;
}

export function FindingCard({ finding, defaultExpanded = false }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />;
    }
  };

  const getSeverityBadge = (sev: string, status: string) => {
    if (status === 'PASS') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {language === 'en' ? 'Passed' : 'Godkänd'}
        </span>
      );
    }
    if (status === 'NOT_APPLICABLE') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {language === 'en' ? 'License Required' : 'Licens krävs'}
        </span>
      );
    }
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {language === 'en' ? 'Critical' : 'Kritisk'}
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {language === 'en' ? 'High Priority' : 'Hög prioritet'}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {language === 'en' ? 'Medium' : 'Medel'}
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {language === 'en' ? 'Low' : 'Låg'}
          </span>
        );
    }
  };

  // Base ID lookup without domain suffix (e.g., CHK-DNS-01-domain.com -> CHK-DNS-01)
  const baseId = finding.id.startsWith('CHK-DNS-') ? finding.id.substring(0, 10) : finding.id;
  const loc = FINDING_LOCALIZATIONS[baseId] || FINDING_LOCALIZATIONS[finding.id];

  const domainSuffix = finding.id.startsWith('CHK-DNS-') ? finding.id.replace(/^CHK-DNS-\d+-/, '') : null;
  const baseTitle = (language === 'en' ? loc?.title.en : loc?.title.sv) || finding.title;
  const title = domainSuffix && !baseTitle.includes(domainSuffix) ? `${baseTitle} (${domainSuffix})` : baseTitle;
  const description = (language === 'en' ? loc?.description.en : loc?.description.sv) || finding.remediation.description;
  const recommendedValue = (language === 'en' ? loc?.recommendedValue.en : loc?.recommendedValue.sv) || finding.recommendedValue;
  const adminCenterPath = (language === 'en' ? loc?.adminCenterPath.en : loc?.adminCenterPath.sv) || finding.remediation.adminCenterPath;
  const powershellSnippet = (language === 'en' ? loc?.powershellSnippet?.en : loc?.powershellSnippet?.sv) || finding.remediation.powershellSnippet;
  const currentValue = translateCurrentValue(finding, language);
  const nis2Article = (language === 'en' ? loc?.nis2Article?.en : loc?.nis2Article?.sv) || finding.compliance.nis2Article;
  const gdprArticle = (language === 'en' ? loc?.gdprArticle?.en : loc?.gdprArticle?.sv) || finding.compliance.gdprArticle;

  const copyToClipboard = async () => {
    if (!powershellSnippet) return;
    try {
      await navigator.clipboard.writeText(powershellSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isExpanded ? 'border-border bg-surface shadow-md' : 'border-border/60 bg-surface/70 hover:border-border'
      }`}
    >
      {/* Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {getStatusIcon(finding.status)}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-white text-sm sm:text-base tracking-tight truncate">
                {title}
              </span>
              {getSeverityBadge(finding.severity, finding.status)}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
              <span className="font-mono text-[11px] text-text-secondary">{finding.id}</span>
              {finding.compliance.cisControl && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/20 font-medium">
                  <Lock className="w-2.5 h-2.5" />
                  {finding.compliance.cisControl} {finding.compliance.cisLevel ? `(${finding.compliance.cisLevel === 'Level 1' ? 'L1' : 'L2'})` : ''}
                </span>
              )}
              {finding.compliance.soc2Criteria && finding.compliance.soc2Criteria.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-300 border border-purple-500/20 font-medium">
                  <Award className="w-2.5 h-2.5" />
                  SOC 2 · {finding.compliance.soc2Criteria.join(', ')}
                </span>
              )}
              {nis2Article && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-300 border border-blue-500/20">
                  <Shield className="w-2.5 h-2.5" />
                  {nis2Article.split(' ')[0]} {nis2Article.split(' ')[1]}
                </span>
              )}
              {gdprArticle && (
                <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/20">
                  <FileCheck className="w-2.5 h-2.5" />
                  {gdprArticle.split(' ')[0]} {gdprArticle.split(' ')[1]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block text-xs text-text-muted">
            {language === 'en' ? `Weight: ${finding.weight} pts` : `Vikt: ${finding.weight}p`}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-text-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-muted" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border-t border-border/70 p-4 sm:p-6 space-y-5 text-sm bg-surface-subtle/30 rounded-b-xl">
          {/* Pedagogical Explanation */}
          {description && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                {language === 'en' ? 'Why this is a risk' : 'Varför detta är en risk'}
              </h4>
              <p className="text-text-secondary leading-relaxed">{description}</p>
            </div>
          )}

          {/* Current vs Recommended */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1">
                {language === 'en' ? 'Current value' : 'Nuvarande värde'}
              </span>
              <span
                className={`font-mono text-xs ${
                  finding.status === 'PASS'
                    ? 'text-emerald-400'
                    : finding.status === 'WARNING'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {currentValue}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1">
                {language === 'en' ? 'Recommended setting' : 'Rekommenderat läge'}
              </span>
              <span className="font-mono text-xs text-emerald-400">{recommendedValue}</span>
            </div>
          </div>

          {/* Admin Center Click-Path */}
          {adminCenterPath && (
            <div className="rounded-lg bg-surface p-4 border border-border">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-white">
                <ExternalLink className="h-4 w-4 text-brand-accent" />
                <span>{language === 'en' ? 'Remediate in Microsoft 365 Admin Center' : 'Åtgärda via Microsoft 365 Admin Center'}</span>
              </div>
              <div className="text-xs font-mono text-text-secondary bg-surface-subtle/60 p-2.5 rounded border border-border/50 break-words">
                {adminCenterPath}
              </div>
            </div>
          )}

          {/* PowerShell Remediation */}
          {powershellSnippet && (
            <div className="rounded-lg bg-slate-950 p-4 border border-border/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Remediate via PowerShell' : 'Åtgärda via PowerShell'}</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{language === 'en' ? 'Copied!' : 'Kopierat!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{language === 'en' ? 'Copy' : 'Kopiera'}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800">
                <code>{powershellSnippet}</code>
              </pre>
            </div>
          )}

          {/* Compliance & Regulatory details */}
          {(finding.compliance.cisControl || finding.compliance.soc2Criteria || nis2Article || gdprArticle) && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                {language === 'en' ? 'Compliance & Security Framework Mappings' : 'Koppling till säkerhetsramverk & standarder'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {finding.compliance.cisControl && (
                  <div className="p-2.5 rounded bg-surface/70 border border-border/60">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-0.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CIS Microsoft 365 Foundations</span>
                    </div>
                    <div className="text-text-secondary text-[11px]">
                      {finding.compliance.cisControl} · {finding.compliance.cisLevel || 'Level 1'}
                    </div>
                  </div>
                )}
                {finding.compliance.soc2Criteria && finding.compliance.soc2Criteria.length > 0 && (
                  <div className="p-2.5 rounded bg-surface/70 border border-border/60">
                    <div className="flex items-center gap-1.5 font-semibold text-purple-300 mb-0.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>SOC 2 Type II (Trust Services)</span>
                    </div>
                    <div className="text-text-secondary text-[11px]">
                      {finding.compliance.soc2Criteria.join(', ')} — {finding.compliance.soc2Description || 'Security Controls'}
                    </div>
                  </div>
                )}
                {nis2Article && (
                  <div className="p-2.5 rounded bg-surface/70 border border-border/60">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-300 mb-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>NIS2 Directive (EU 2022/2555)</span>
                    </div>
                    <div className="text-text-secondary text-[11px]">
                      {nis2Article}
                    </div>
                  </div>
                )}
                {gdprArticle && (
                  <div className="p-2.5 rounded bg-surface/70 border border-border/60">
                    <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-0.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>GDPR (EU 2016/679)</span>
                    </div>
                    <div className="text-text-secondary text-[11px]">
                      {gdprArticle}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
