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
} from 'lucide-react';
import { AuditFinding } from '@/lib/types';

interface FindingCardProps {
  finding: AuditFinding;
  defaultExpanded?: boolean;
}

export function FindingCard({ finding, defaultExpanded = false }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

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
          Godkänd
        </span>
      );
    }
    if (status === 'NOT_APPLICABLE') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          Licens krävs
        </span>
      );
    }
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Kritisk
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Hög prioritet
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Medel
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Låg
          </span>
        );
    }
  };

  const copyToClipboard = async () => {
    if (!finding.remediation.powershellSnippet) return;
    try {
      await navigator.clipboard.writeText(finding.remediation.powershellSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera:', err);
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
                {finding.title}
              </span>
              {getSeverityBadge(finding.severity, finding.status)}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="font-mono text-[11px] text-text-secondary">{finding.id}</span>
              {finding.compliance.nis2Article && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-300 border border-blue-500/20">
                  <Shield className="w-2.5 h-2.5" />
                  {finding.compliance.nis2Article.split(' ')[0]} {finding.compliance.nis2Article.split(' ')[1]}
                </span>
              )}
              {finding.compliance.gdprArticle && (
                <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/20">
                  <FileCheck className="w-2.5 h-2.5" />
                  {finding.compliance.gdprArticle}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block text-xs text-text-muted">
            Vikt: {finding.weight}p
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
          {finding.remediation.description && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Varför detta är en risk
              </h4>
              <p className="text-text-secondary leading-relaxed">{finding.remediation.description}</p>
            </div>
          )}

          {/* Current vs Recommended */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1">Nuvarande värde</span>
              <span
                className={`font-mono text-xs ${
                  finding.status === 'PASS'
                    ? 'text-emerald-400'
                    : finding.status === 'WARNING'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {finding.currentValue}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted block mb-1">Rekommenderat läge</span>
              <span className="font-mono text-xs text-emerald-400">{finding.recommendedValue}</span>
            </div>
          </div>

          {/* Admin Center Click-Path */}
          {finding.remediation.adminCenterPath && (
            <div className="rounded-lg bg-surface p-4 border border-border">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-white">
                <ExternalLink className="h-4 w-4 text-brand-accent" />
                <span>Åtgärda via Microsoft 365 Admin Center</span>
              </div>
              <div className="text-xs font-mono text-text-secondary bg-surface-subtle/60 p-2.5 rounded border border-border/50 break-words">
                {finding.remediation.adminCenterPath}
              </div>
            </div>
          )}

          {/* PowerShell Remediation */}
          {finding.remediation.powershellSnippet && (
            <div className="rounded-lg bg-slate-950 p-4 border border-border/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>Åtgärda via PowerShell</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopierat!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Kopiera</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800">
                <code>{finding.remediation.powershellSnippet}</code>
              </pre>
            </div>
          )}

          {/* Regulatory details */}
          {(finding.compliance.nis2Article || finding.compliance.gdprArticle) && (
            <div className="flex flex-wrap gap-4 text-xs text-text-muted pt-2 border-t border-border/50">
              {finding.compliance.nis2Article && (
                <div>
                  <span className="font-semibold text-blue-400">NIS2-koppling: </span>
                  <span>{finding.compliance.nis2Article}</span>
                </div>
              )}
              {finding.compliance.gdprArticle && (
                <div>
                  <span className="font-semibold text-cyan-400">GDPR-koppling: </span>
                  <span>{finding.compliance.gdprArticle}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

