export type FindingCategory =
  | 'IDENTITY'
  | 'ADMIN'
  | 'CONDITIONAL_ACCESS'
  | 'EMAIL_DNS'
  | 'SHARING'
  | 'APP_GOVERNANCE';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FindingStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'NOT_APPLICABLE';

export interface AuditFinding {
  id: string;
  category: FindingCategory;
  title: string;
  severity: FindingSeverity;
  weight: number; // e.g., 10 to 30 within its category
  status: FindingStatus;
  currentValue: string;
  recommendedValue: string;
  compliance: {
    nis2Article?: string; // e.g. "Art 21.2.e (MFA & Säker kommunikation)"
    gdprArticle?: string; // e.g. "Art 32 (Säkerhet vid behandling)"
    cisControl?: string; // e.g. "CIS M365 v3.0 1.1.1"
    cisLevel?: 'Level 1' | 'Level 2';
    soc2Criteria?: string[]; // e.g. ["CC6.1", "CC6.2"]
    soc2Description?: string; // e.g. "Logical Access & Identity Governance"
  };
  remediation: {
    adminCenterPath: string;
    powershellSnippet: string;
    description?: string;
  };
}

export interface TenantCapabilities {
  hasEntraP1orP2: boolean;
  hasExchangeOnline: boolean;
  hasSharePoint: boolean;
  hasBusinessPremium: boolean;
  skuList: string[];
}

export interface SummaryStats {
  totalUsers: number;
  mfaRegisteredUsers: number;
  mfaPercent: number;
  adminCount: number;
  adminMfaPercent: number;
  verifiedDomains: string[];
  tenantIdHash: string;
  companyName: string;
  scanDurationMs?: number;
}

export interface CategoryScore {
  category: FindingCategory;
  name: string;
  earnedWeight: number;
  maxWeight: number;
  percentage: number;
  categoryWeight: number; // proportion of total score (0 to 1)
  weightedScore: number;
  findingsCount: {
    pass: number;
    fail: number;
    warning: number;
    notApplicable: number;
  };
}

export interface ScoreReport {
  overallScore: number; // 0 - 100
  scoreBand: 'EXCELLENT' | 'WARNING' | 'CRITICAL';
  bandLabel: string;
  categoryScores: Record<FindingCategory, CategoryScore>;
  findings: AuditFinding[];
  summaryStats: SummaryStats;
  diff?: ScanDiff;
}

export interface ScanDiff {
  previousScore: number;
  scoreDelta: number;
  previousDate: string;
  resolvedFindings: string[]; // finding IDs that were FAIL/WARN and are now PASS
  newFailures: string[];      // finding IDs that failed in this scan
}

export interface StoredScanReport {
  id: string;
  tenantIdHash: string;
  companyName: string;
  score: number;
  categoryScores: Record<FindingCategory, CategoryScore>;
  findings: AuditFinding[];
  summaryStats: SummaryStats;
  createdAt: string;
  expiresAt: string;
  isPublicToken: string;
  diff?: ScanDiff;
}

