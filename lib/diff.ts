import { AuditFinding, ScanDiff } from './types';

/**
 * Computes difference between current scan and an earlier scan of the same tenant.
 */
export function computeScanDiff(
  currentScore: number,
  currentFindings: AuditFinding[],
  previousScore: number,
  previousFindings: AuditFinding[],
  previousDate: string
): ScanDiff {
  const scoreDelta = currentScore - previousScore;
  const resolvedFindings: string[] = [];
  const newFailures: string[] = [];

  const prevFindingMap = new Map<string, AuditFinding>();
  for (const pf of previousFindings) {
    prevFindingMap.set(pf.id, pf);
  }

  for (const cf of currentFindings) {
    const prev = prevFindingMap.get(cf.id);
    if (!prev) continue;

    const wasFailing = prev.status === 'FAIL' || prev.status === 'WARNING';
    const isNowPassing = cf.status === 'PASS';

    const wasPassing = prev.status === 'PASS';
    const isNowFailing = cf.status === 'FAIL' || cf.status === 'WARNING';

    if (wasFailing && isNowPassing) {
      resolvedFindings.push(cf.id);
    } else if (wasPassing && isNowFailing) {
      newFailures.push(cf.id);
    }
  }

  return {
    previousScore,
    scoreDelta,
    previousDate,
    resolvedFindings,
    newFailures,
  };
}

