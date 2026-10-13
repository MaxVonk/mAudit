'use client';

import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScanDiff } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface DiffBadgeProps {
  diff?: ScanDiff;
}

export function DiffBadge({ diff }: DiffBadgeProps) {
  const { language } = useLanguage();
  if (!diff) return null;

  const isPositive = diff.scoreDelta > 0;
  const isNegative = diff.scoreDelta < 0;

  const dateFormatted = new Date(diff.previousDate).toLocaleDateString(
    language === 'en' ? 'en-US' : 'sv-SE',
    {
      day: 'numeric',
      month: 'short',
    }
  );

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-surface-subtle/70 px-4 py-2.5 text-xs text-text-primary shadow-sm">
      <div className="flex items-center gap-1.5 font-semibold">
        {isPositive && (
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            +{diff.scoreDelta} {language === 'en' ? 'points' : 'poäng'}
          </span>
        )}
        {isNegative && (
          <span className="flex items-center gap-1 text-rose-400">
            <TrendingDown className="h-4 w-4" />
            {diff.scoreDelta} {language === 'en' ? 'points' : 'poäng'}
          </span>
        )}
        {!isPositive && !isNegative && (
          <span className="flex items-center gap-1 text-text-secondary">
            <Minus className="h-4 w-4" />
            {language === 'en' ? `Unchanged (${diff.previousScore} pts)` : `Oförändrat (${diff.previousScore} p)`}
          </span>
        )}
        <span className="text-text-muted font-normal">
          {language === 'en'
            ? `since previous assessment (${dateFormatted})`
            : `sedan föregående besiktning (${dateFormatted})`}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto text-[11px]">
        {diff.resolvedFindings.length > 0 && (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            {diff.resolvedFindings.length} {language === 'en' ? 'resolved findings' : 'åtgärdade brister'}
          </span>
        )}
        {diff.newFailures.length > 0 && (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" />
            {diff.newFailures.length} {language === 'en' ? 'new risks' : 'nya risker'}
          </span>
        )}
      </div>
    </div>
  );
}
