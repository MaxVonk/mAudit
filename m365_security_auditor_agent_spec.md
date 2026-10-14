# Agent Specification: M365 Security Posture Auditor (CSPM)

You are an expert full-stack security engineer and cloud architect. Your task is to build a production-grade, automated Microsoft 365 security assessment platform. The application scans a customer's Microsoft Entra ID / M365 tenant using read-only permissions via OAuth2 Admin Consent, analyzes configurations against CIS M365 benchmarks, maps findings to NIS2 and GDPR, and delivers a shareable, actionable web report.

---

## 1. Architectural Vision & Core Differentiators

This tool improves upon existing single-shot scanners, through four core architectural pillars:
1. **Dynamic License Awareness:** Inspects tenant SKUs (`subscribedSkus`) *before* running checks. It adapts expectations (e.g. evaluating Security Defaults for Business Standard instead of penalizing for lack of Conditional Access, which requires Entra ID P1/P2).
2. **Actionable Remediation Engine:** Every finding includes both a direct Microsoft 365 Admin Center click-path and a copy-pasteable PowerShell CLI remediation snippet.
3. **Regulatory Mapping (NIS2 & GDPR):** Links technical gaps directly to NIS2 (Directive (EU) 2022/2555 Art. 21) and GDPR (Art. 32) compliance criteria for executive stakeholders.
4. **Scan Diffing ("Before & After"):** Allows users to re-scan their tenant to track progress, showing resolved risks and updated health scores over time.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript, React 19 / Server Components)
- **Styling & Components:** Tailwind CSS, Radix UI / shadcn/ui, Lucide Icons
- **Database & ORM:** PostgreSQL / SQLite with Prisma or Drizzle ORM
- **Microsoft Cloud Client:** `@microsoft/microsoft-graph-client`, `@azure/identity`
- **DNS Hygiene:** Node.js native `dns/promises` (SPF, DKIM, DMARC validation)
- **Token Security:** `crypto` (SHA-256 tokens, AES-256 for temporary storage)

---

## 3. Azure Entra ID App & Consent Architecture

### 3.1 App Registration Configuration
- **Application Type:** Multi-Tenant Web App
- **Supported Account Types:** Accounts in any organizational directory (Multitenant)
- **Permissions (Application Permissions - Read-Only):**
  - `Organization.Read.All` (Domain names, tenant details)
  - `Directory.Read.All` (Users, groups, licensing metadata)
  - `Policy.Read.All` (Conditional Access, authentication methods, authorization policies)
  - `Reports.Read.All` (Credential user registration details for MFA metrics)
  - `RoleManagement.Read.Directory` (Active Global Admins and role assignments)

### 3.2 Handling Microsoft Verified Publisher
To prevent the "Unverified Publisher" warning during Admin Consent:
- The app must display a dedicated **Pre-Consent Trust Screen** explaining:
  - Exactly which read-only permissions are requested.
  - Zero password access, zero modification capability.
  - One-click offboarding: Instructs admins how to remove the Enterprise App under `Entra ID > Enterprise Applications > All applications` immediately after the report is generated.
- The consent URL format:
  `https://login.microsoftonline.com/common/adminconsent?client_id={AZURE_CLIENT_ID}&redirect_uri={ENCODED_REDIRECT_URI}&state={CSRF_STATE_TOKEN}`

---

## 4. Tenant License Detection & Graceful Fallback Engine

Before running the security assertion rules, the scanner queries `GET /v1.0/subscribedSkus`.

```typescript
export interface TenantCapabilities {
  hasEntraP1orP2: boolean;
  hasExchangeOnline: boolean;
  hasSharePoint: boolean;
  hasBusinessPremium: boolean;
  skuList: string[];
}
```

### Fallback & 403 Handler Pattern
Any API call to an endpoint that requires an upgraded license (e.g. Risk-based Conditional Access, PIM, Identity Protection) must be wrapped in a safe runner:

```typescript
async function safeGraphQuery<T>(queryFn: () => Promise<T>): Promise<{ data: T | null; errorStatus?: number; licenseMissing: boolean }> {
  try {
    const data = await queryFn();
    return { data, licenseMissing: false };
  } catch (error: any) {
    if (error?.statusCode === 403 || error?.code === 'Authentication_RequestFromNonPremiumTenantOrB2CTenant') {
      return { data: null, errorStatus: 403, licenseMissing: true };
    }
    throw error;
  }
}
```

If `licenseMissing === true`:
- The rule status becomes `STATUS: NOT_APPLICABLE_LICENSE_REQUIRED` (neutral impact on score).
- The report explains: *"Denna kontroll kräver Microsoft Entra ID P1/P2 (ingår i t.ex. Microsoft 365 Business Premium). För er nuvarande licens rekommenderas Security Defaults istället."*

---

## 5. Security Check Specifications & Implementation Rules

All checks must implement this interface:

```typescript
export interface AuditFinding {
  id: string;
  category: 'IDENTITY' | 'ADMIN' | 'CONDITIONAL_ACCESS' | 'EMAIL_DNS' | 'SHARING' | 'APP_GOVERNANCE';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  currentValue: string;
  recommendedValue: string;
  compliance: {
    nis2Article?: string;  // e.g. "Art 21.2.e (MFA & Säker kommunikation)"
    gdprArticle?: string;  // e.g. "Art 32 (Säkerhet vid behandling)"
  };
  remediation: {
    adminCenterPath: string;
    powershellSnippet: string;
  };
}
```

### 5.1 Category 1: Identitet & Åtkomst (Identity & MFA)
- **CHK-ID-01: Global MFA-täckning för standardanvändare**
  - *Endpoint:* `GET /v1.0/reports/authenticationMethods/userRegistrationDetails`
  - *Logic:* Count users where `isMfaRegistered === true` vs total active users.
  - *Pass:* > 95% registered. Warning: 80–94%. Fail: < 80%.
  - *Remediation PS:* `Set-MsolUser -UserPrincipalName $upn -StrongAuthenticationRequirements ...`
  - *NIS2:* Art. 21.2.j / GDPR: Art. 32.1.b.

- **CHK-ID-02: Säkerhetsstandarder (Security Defaults)**
  - *Endpoint:* `GET /v1.0/policies/identitySecurityDefaultsEnforcementPolicy`
  - *Logic:* If tenant does NOT have Entra P1/P2, `isEnabled` MUST be `true`. If tenant has Entra P1/P2, this can be false provided Conditional Access is configured.

- **CHK-ID-03: Självbetjäning av lösenordsåterställning (SSPR)**
  - *Endpoint:* `GET /v1.0/policies/authorizationPolicy`
  - *Check:* Flag if users cannot reset passwords securely or if password expiration is enabled (modern NIST/CIS guidance recommends disabling arbitrary password expiration when MFA is active).

### 5.2 Category 2: Administratörskonton (Privileged Accounts)
- **CHK-ADM-01: Antal Globala Administratörer**
  - *Endpoint:* `GET /v1.0/directoryRoles?$filter=displayName eq 'Global Administrator'` -> `/members`
  - *Logic:* Ideal range is 2 to 4. Flag if > 4 (excessive privilege risk) or < 2 (lockout risk).
  - *Remediation Path:* `Microsoft Entra Admin Center > Identitet > Roller och administratörer`.

- **CHK-ADM-02: Administratörer utan MFA (Critical)**
  - *Logic:* Cross-reference Global Admin IDs against `userRegistrationDetails`.
  - *Pass:* 100% of admins must have registered phishing-resistant or strong MFA. Any admin without MFA is an immediate CRITICAL failure.

- **CHK-ADM-03: Dedikerade Admin-konton (Licens- och postlådekontroll)**
  - *Endpoint:* `GET /v1.0/users/{adminId}/assignedLicenses`
  - *Logic:* Global Admin accounts should NOT have an active Exchange Online mailbox or daily productivity licenses (prevents reading daily phishing emails as admin).

### 5.3 Category 3: Villkorsstyrd Åtkomst (Conditional Access)
- **CHK-CA-01: Blockering av föråldrad autentisering (Legacy Auth)**
  - *Endpoint:* `GET /v1.0/identity/conditionalAccess/policies`
  - *Logic:* Look for an enabled policy targeting `clientAppTypes` including `exchangeActiveSync` and `other` with access control set to `block`.
  - *License Guard:* If tenant has no P1/P2, evaluate whether Security Defaults is active instead.

- **CHK-CA-02: Nödåtkomstkonto (Break-Glass Account Exclusion)**
  - *Logic:* Verify that at least one dedicated cloud-only emergency account is excluded from standard Conditional Access policies to prevent accidental lockout.

### 5.4 Category 4: E-post- och Domänsäkerhet (DNS & Exchange)
*Executed via native DNS queries for all verified custom domains discovered in `GET /v1.0/domains`:*
- **CHK-DNS-01: SPF-postens giltighet**
  - *Method:* `dns.resolveTxt(domain)`
  - *Logic:* Must contain `v=spf1 include:spf.protection.outlook.com` and end with `-all` (HardFail) or `~all` (SoftFail). Flag if `+all` or missing.
  - *Remediation:* Create TXT record `v=spf1 include:spf.protection.outlook.com -all`.

- **CHK-DNS-02: DMARC-efterlevnad**
  - *Method:* `dns.resolveTxt(`_dmarc.${domain}`)`
  - *Logic:* Pass if record exists with `p=quarantine` or `p=reject`. Warning if `p=none`. Fail if no DMARC record exists.

- **CHK-DNS-03: DKIM-konfiguration**
  - *Method:* `dns.resolveCname(`selector1._domainkey.${domain}`)`
  - *Logic:* Verifies selector presence pointing to `onmicrosoft.com`.

### 5.5 Category 5: Delning & Samarbete (SharePoint & Teams)
- **CHK-SHR-01: Anonym extern länkdelning**
  - *Endpoint:* `GET /v1.0/admin/sharepoint/settings` (or Graph organization sharing policy endpoint)
  - *Logic:* `sharingCapability` should be `ExistingGuests` or `Disabled`, NOT `ExternalUserAndGuestSharing` (Anonymous "Anyone with the link").

### 5.6 Category 6: Applikationsstyrning (Consent Governance)
- **CHK-APP-01: Användares behörighet att godkänna tredjepartsappar**
  - *Endpoint:* `GET /v1.0/policies/authorizationPolicy`
  - *Logic:* `defaultUserRolePermissions.allowedToCreateApps` must be `false` and `permissionGrantPolicyDefinitions` must require admin approval for OAuth consent.
  - *Remediation PS:* `Set-MgPolicyAuthorizationPolicy -DefaultUserRolePermissions @{AllowedToCreateApps = $false}`

---

## 6. Scoring Algorithm & Health Index

The Total Health Score is calculated on a 0–100 scale:

$$Score = \sum \left( \frac{\text{Earned Weight per Category}}{\text{Total Max Weight per Category}} \times \text{Category Weight} \right)$$

- **Weight Distributions:**
  - Identity & MFA: 35%
  - Admin Security: 25%
  - Conditional Access & Legacy Auth: 15%
  - Email Hygiene (DNS): 15%
  - Collaboration & App Governance: 10%
- Rules flagged as `NOT_APPLICABLE_LICENSE_REQUIRED` are deducted from both the numerator and denominator so the tenant is not penalized for missing premium SKUs.

---

## 7. Data Privacy & Zero-Retention Security Architecture

1. **No Directory Mirroring:** Do not store full lists of employee names, emails, or objects in the persistent database.
2. **Aggregated Storage Only:**
   ```prisma
   model ScanReport {
     id            String   @id @default(uuid())
     tenantIdHash  String   // SHA-256 of Azure Tenant ID
     companyName   String
     score         Int
     categoryScores Json
     findings      Json     // Array of AuditFinding objects (anonymized)
     summaryStats  Json     // e.g. { totalUsers: 50, mfaPercent: 88, adminCount: 3 }
     createdAt     DateTime @default(now())
     expiresAt     DateTime // Defaults to createdAt + 14 days
     isPublicToken String   @unique // Cryptographic random string for URL
   }
   ```
3. **One-Click Data Deletion:** The report page must contain a prominent "Radera denna rapport omedelbart" button which purges the row from the database.

---

## 8. Development Roadmap for Agent

1. **Phase 1: Project Setup & Authentication**
   - Initialize Next.js project with Tailwind CSS, Lucide icons, and Prisma.
   - Implement `/api/auth/consent` and `/api/auth/callback` to handle the Microsoft multi-tenant consent workflow and exchange tokens.
2. **Phase 2: Tenant Profile & Graph Scanner**
   - Build `TenantCapabilityService` to inspect SKUs and available licenses.
   - Implement `GraphScanner` and safe API invocation wrappers.
   - Implement `DnsHygieneScanner` using Node's `dns/promises`.
3. **Phase 3: Assertion Engine & Remediation Generator**
   - Implement all 15 audit check rules matching the `AuditFinding` interface.
   - Provide localized Swedish copy for admin center paths, NIS2 references, and PowerShell scripts.
4. **Phase 4: Diffing & Progress Tracking**
   - Query if a previous report exists for the given `tenantIdHash`.
   - Compute delta metrics: score change, resolved findings, new findings.
5. **Phase 5: Public Report UI & Export**
   - Build `/report/[token]` with score gauges, category filters, and finding cards.
   - Add a printable/PDF-friendly layout.
