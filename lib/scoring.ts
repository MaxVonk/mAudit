import {
  AuditFinding,
  CategoryScore,
  FindingCategory,
  ScoreReport,
  SummaryStats,
} from './types';

export const CATEGORY_METADATA: Record<
  FindingCategory,
  { name: string; weight: number }
> = {
  IDENTITY: { name: 'Identitet & MFA', weight: 0.35 },
  ADMIN: { name: 'Administratörskonton', weight: 0.25 },
  CONDITIONAL_ACCESS: { name: 'Villkorsstyrd åtkomst', weight: 0.15 },
  EMAIL_DNS: { name: 'E-post- och Domänsäkerhet', weight: 0.15 },
  SHARING: { name: 'Delning & Samarbete', weight: 0.05 },
  APP_GOVERNANCE: { name: 'Applikationsstyrning', weight: 0.05 },
};

/**
 * Calculates earned points, category breakdown, and total normalized health score (0-100).
 * Handles NOT_APPLICABLE status by excluding from both earned and max weights.
 */
export function calculateHealthScore(
  findings: AuditFinding[],
  summaryStats: SummaryStats
): ScoreReport {
  const categoryScores: Partial<Record<FindingCategory, CategoryScore>> = {};
  const categories = Object.keys(CATEGORY_METADATA) as FindingCategory[];

  let totalWeightedScore = 0;
  let totalActiveCategoryWeight = 0;

  for (const cat of categories) {
    const meta = CATEGORY_METADATA[cat];
    const catFindings = findings.filter((f) => f.category === cat);

    let earned = 0;
    let max = 0;
    const counts = { pass: 0, fail: 0, warning: 0, notApplicable: 0 };

    for (const finding of catFindings) {
      if (finding.status === 'NOT_APPLICABLE') {
        counts.notApplicable++;
        continue; // Neutral impact on score
      }

      max += finding.weight;

      if (finding.status === 'PASS') {
        earned += finding.weight;
        counts.pass++;
      } else if (finding.status === 'WARNING') {
        // Warning earns partial credit (50%)
        earned += finding.weight * 0.5;
        counts.warning++;
      } else {
        counts.fail++;
      }
    }

    // Category percentage (0 - 100)
    const percentage = max > 0 ? Math.round((earned / max) * 100) : 100;
    const catWeightedScore = (percentage * meta.weight);

    categoryScores[cat] = {
      category: cat,
      name: meta.name,
      earnedWeight: Math.round(earned),
      maxWeight: max,
      percentage,
      categoryWeight: meta.weight,
      weightedScore: catWeightedScore,
      findingsCount: counts,
    };

    if (max > 0) {
      totalWeightedScore += catWeightedScore;
      totalActiveCategoryWeight += meta.weight;
    }
  }

  // Normalize if some categories had zero applicable checks
  const overallScore =
    totalActiveCategoryWeight > 0
      ? Math.round(totalWeightedScore / totalActiveCategoryWeight)
      : 100;

  // Canonical score bands (per auditor specification & SKILL.md: 90 / 70)
  let scoreBand: 'EXCELLENT' | 'WARNING' | 'CRITICAL' = 'CRITICAL';
  let bandLabel = 'Kritiska sårbarheter identifierade';

  if (overallScore >= 90) {
    scoreBand = 'EXCELLENT';
    bandLabel = 'Utmärkt säkerhetsläge';
  } else if (overallScore >= 70) {
    scoreBand = 'WARNING';
    bandLabel = 'Godtagbart med åtgärdsbehov';
  }

  return {
    overallScore,
    scoreBand,
    bandLabel,
    categoryScores: categoryScores as Record<FindingCategory, CategoryScore>,
    findings,
    summaryStats,
  };
}

