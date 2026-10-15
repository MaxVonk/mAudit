import { AuditFinding } from './types';

export interface ComplianceMapping {
  cisControl: string;
  cisLevel: 'Level 1' | 'Level 2';
  soc2Criteria: string[];
  soc2Description: string;
  nis2Article?: string;
  gdprArticle?: string;
}

export const COMPLIANCE_MAPPINGS: Record<string, ComplianceMapping> = {
  'CHK-ID-01': {
    cisControl: 'CIS M365 1.1.1',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1', 'CC6.2'],
    soc2Description: 'Logical Access & Multi-Factor Authentication',
    nis2Article: 'Art 21.2.j (Supply chain & access security)',
    gdprArticle: 'Art 32.1.b (Confidentiality & integrity)',
  },
  'CHK-ID-02': {
    cisControl: 'CIS M365 1.1.2',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1', 'CC6.6'],
    soc2Description: 'Security Defaults & Baseline Access Controls',
    nis2Article: 'Art 21.2.e (Cyber hygiene baseline)',
  },
  'CHK-ID-03': {
    cisControl: 'CIS M365 1.1.3',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1'],
    soc2Description: 'Credential Management & Self-Service Password Reset',
    gdprArticle: 'Art 32.1.b (Confidentiality)',
  },
  'CHK-ADM-01': {
    cisControl: 'CIS M365 1.1.4',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.3'],
    soc2Description: 'Least Privilege & Global Admin Governance',
    nis2Article: 'Art 21.2.a (Risk analysis & access policies)',
  },
  'CHK-ADM-02': {
    cisControl: 'CIS M365 1.1.2',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1', 'CC6.3'],
    soc2Description: 'Privileged Access MFA & Administrative Protection',
    nis2Article: 'Art 21.2.j (Multi-factor authentication)',
    gdprArticle: 'Art 32.1.b (Technical & organizational measures)',
  },
  'CHK-ADM-03': {
    cisControl: 'CIS M365 1.1.5',
    cisLevel: 'Level 2',
    soc2Criteria: ['CC6.3'],
    soc2Description: 'Role Segregation & Dedicated Admin Accounts',
    nis2Article: 'Art 21.2.a (Access policies)',
  },
  'CHK-CA-01': {
    cisControl: 'CIS M365 1.1.6',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1', 'CC6.6'],
    soc2Description: 'Legacy Authentication Blocking & Protocol Hardening',
    nis2Article: 'Art 21.2.e (Protocol hardening)',
    gdprArticle: 'Art 32.1.d (Security effectiveness)',
  },
  'CHK-CA-02': {
    cisControl: 'CIS M365 1.1.7',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC7.4', 'CC6.3'],
    soc2Description: 'Business Continuity & Emergency Break-Glass Account',
    nis2Article: 'Art 21.2.c (Business continuity & crisis management)',
  },
  'CHK-DNS-01': {
    cisControl: 'CIS M365 2.1.1',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.6'],
    soc2Description: 'Sender Policy Framework (SPF) Verification',
    nis2Article: 'Art 21.2.e (Secure communication)',
  },
  'CHK-DNS-02': {
    cisControl: 'CIS M365 2.1.3',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.6'],
    soc2Description: 'DMARC Domain Alignment & Anti-Phishing',
    nis2Article: 'Art 21.2.e (Electronic communication security)',
    gdprArticle: 'Art 32.1.b (Confidentiality)',
  },
  'CHK-DNS-03': {
    cisControl: 'CIS M365 2.1.2',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.6'],
    soc2Description: 'DKIM Cryptographic Email Signature',
    nis2Article: 'Art 21.2.e (Secure communication)',
  },
  'CHK-SHR-01': {
    cisControl: 'CIS M365 3.1.1',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1', 'CC6.7'],
    soc2Description: 'External Sharing & Unauthenticated Link Prevention',
    gdprArticle: 'Art 32.1.b (Prevent unauthorized exposure)',
    nis2Article: 'Art 21.2.e (Network & system security)',
  },
  'CHK-APP-01': {
    cisControl: 'CIS M365 1.2.1',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.6', 'CC6.8'],
    soc2Description: 'Third-Party Application Consent & OAuth Governance',
    nis2Article: 'Art 21.2.d (Supply chain & acquisition)',
    gdprArticle: 'Art 32 (Security of processing)',
  },
  'CHK-ID-04': {
    cisControl: 'CIS M365 1.1.8',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.2'],
    soc2Description: 'Access Reviews & Stale Account Deprovisioning',
    nis2Article: 'Art 21.2.a (Access control & risk policies)',
    gdprArticle: 'Art 32.1.b (Confidentiality & integrity)',
  },
  'CHK-ID-05': {
    cisControl: 'CIS M365 1.1.4',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.1'],
    soc2Description: 'NIST-Aligned Password Expiration Strategy',
    nis2Article: 'Art 21.2.e (Cyber hygiene baseline)',
    gdprArticle: 'Art 32.1.b (Authentication assurance)',
  },
  'CHK-ADM-04': {
    cisControl: 'CIS M365 1.1.9',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.2', 'CC6.3'],
    soc2Description: 'Administrative Portal Boundary Restrictions',
    nis2Article: 'Art 21.2.a (Principle of least privilege)',
    gdprArticle: 'Art 32.1.b (Unauthorized access prevention)',
  },
  'CHK-EXO-01': {
    cisControl: 'CIS M365 4.1.2',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.6', 'CC6.7'],
    soc2Description: 'Data Exfiltration & Auto-Forwarding Controls',
    nis2Article: 'Art 21.2.e (Electronic communication security)',
    gdprArticle: 'Art 32.1.b (Data loss prevention)',
  },
  'CHK-SHR-02': {
    cisControl: 'CIS M365 4.1.3',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.3'],
    soc2Description: 'Least Privilege Default File Sharing Scopes',
    nis2Article: 'Art 21.2.e (System & network security)',
    gdprArticle: 'Art 32.1.b (Prevent accidental disclosure)',
  },
  'CHK-APP-02': {
    cisControl: 'CIS M365 1.1.7',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC6.3'],
    soc2Description: 'External Identity & Guest Invitation Governance',
    nis2Article: 'Art 21.2.a (Access control)',
    gdprArticle: 'Art 32.1.b (Confidentiality)',
  },
  'CHK-LOG-01': {
    cisControl: 'CIS M365 6.1.1',
    cisLevel: 'Level 1',
    soc2Criteria: ['CC7.2', 'CC7.3'],
    soc2Description: 'Unified Security Audit Logging & Forensics Readiness',
    nis2Article: 'Art 21.2.b (Incident handling & logging)',
    gdprArticle: 'Art 32.1.d (Effectiveness testing & auditability)',
  },
};

export function enrichCompliance(id: string, existing?: Partial<AuditFinding['compliance']>): AuditFinding['compliance'] {
  const standard = COMPLIANCE_MAPPINGS[id];
  if (!standard) {
    return existing || {};
  }
  return {
    ...standard,
    ...existing,
    cisControl: existing?.cisControl || standard.cisControl,
    cisLevel: existing?.cisLevel || standard.cisLevel,
    soc2Criteria: existing?.soc2Criteria || standard.soc2Criteria,
    soc2Description: existing?.soc2Description || standard.soc2Description,
    nis2Article: existing?.nis2Article || standard.nis2Article,
    gdprArticle: existing?.gdprArticle || standard.gdprArticle,
  };
}

