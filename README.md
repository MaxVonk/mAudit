# mAudit — Microsoft 365 Security Posture Auditor (CSPM)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Compliance](https://img.shields.io/badge/Compliance-CIS%20%7C%20SOC%202%20%7C%20NIS2%20%7C%20GDPR-emerald.svg)](https://github.com/MaxVonk/mAudit)

**mAudit** is a production-grade, automated Microsoft 365 security posture management (CSPM) platform. It inspects an organization's Microsoft Entra ID and M365 tenant using read-only permissions via OAuth2 Admin Consent, evaluates configurations against CIS benchmarks, maps gaps directly to **CIS Microsoft 365 Foundations**, **SOC 2 Type II**, **NIS2 (Directive (EU) 2022/2555 Art. 21)**, and **GDPR (Art. 32)**, and delivers an interactive, actionable, shareable web report.

---

## 📸 Posture Report Preview

![mAudit Cloud Security Posture Report](screenshots/result.png)

*Interactive cloud security report displaying executive health score, operational KPIs, multi-framework compliance readiness (CIS, SOC 2, NIS2, GDPR), and deep-dive remediation cards.*

---

## 🌟 Core Architectural Pillars

1. **Dynamic License Awareness:**
   - Automatically queries tenant SKUs (`subscribedSkus`) *before* executing security checks.
   - Gracefully marks premium checks as `NOT_APPLICABLE` for tenants without Entra ID P1/P2 licenses, evaluating *Security Defaults* instead of applying unfair score penalties.
2. **Actionable Remediation Engine:**
   - Every finding includes both a direct Microsoft 365 Admin Center click-path and copy-pasteable PowerShell CLI remediation snippets.
3. **Multi-Framework Regulatory & Standards Mapping:**
   - **CIS Microsoft 365 Foundations Benchmark:** Technical baseline controls (Level 1 & Level 2).
   - **SOC 2 Type II:** Trust Services Criteria for logical access and system operations (CC6 / CC7).
   - **NIS2 Directive:** European cybersecurity risk management measures (Directive (EU) 2022/2555 Art. 21).
   - **GDPR Security of Processing:** Technical safeguards against data leakage and unauthorized access (Regulation (EU) 2016/679 Art. 32).
4. **Scan Diffing ("Before & After"):**
   - Tracks tenant remediation progress over time by matching tenant ID hashes, highlighting score deltas (`+X points`), resolved risks, and new misconfigurations.
5. **Zero-Retention Privacy Architecture:**
   - **No Directory Mirroring:** Never stores employee lists, passwords, emails, or personal identifiers.
   - Stores only aggregated statistics and SHA-256 tenant hashes.
   - Built-in 14-day expiration with a prominent **1-click permanent data wipe** button.
6. **Nordic Minimalist Dark UX:**
   - Built with Next.js 15 App Router, React 19, and Tailwind CSS.
   - Dedicated **Pre-Consent Trust Screen** explaining permissions, zero-content access, and 10-second Enterprise App offboarding.
7. **Bilingual By Design (English & Swedish):**
   - Full application localization for both English and Swedish.
   - Instant language switcher (`🇬🇧 EN` / `🇸🇪 SV`) in the navigation bar with `localStorage` preference persistence.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.x or later
- **npm** or **pnpm**

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/MaxVonk/mAudit.git
cd mAudit
npm install
```

### 2. Database Setup (Zero-Config SQLite)
mAudit includes a portable SQLite setup out of the box (PostgreSQL-compatible via Prisma):
```bash
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the built-in verification test suite to validate scoring calculations, license fallback handling, scan diffing, and database lifecycle:
```bash
npx tsx tests/engine-verification.ts
```

Run the production build:
```bash
npm run build
```

---

## 🎮 Instant Demo Mode

You can test and evaluate the entire end-to-end application **without needing an active Microsoft Azure tenant**:
- Click **"Try demo (Nordic Retail)"** on the homepage or navigation bar.
- Generates a complete security evaluation report for a sample organization (*Nordic Retail AB*).
- Click **"Simulate re-scan (Diff)"** inside the report to see scan diffing in action with positive score deltas and resolved vulnerabilities.
- Filter findings by framework: click **CIS**, **SOC 2**, **NIS2**, or **GDPR** cards to see related technical checks.
- Click **"Delete data"** to test the one-click permanent database purge.

---

## 🔐 Microsoft Entra ID Production Setup

To connect live enterprise tenants, register a Multi-Tenant Application in the [Microsoft Entra Admin Center](https://entra.microsoft.com):

### 1. App Registration Settings
- **Name:** `mAudit`
- **Supported account types:** `Accounts in any organizational directory (Multitenant)`
- **Redirect URI (Web):** `https://your-domain.com/api/auth/callback` (or `http://localhost:3000/api/auth/callback` for development)

### 2. Application Permissions (Read-Only)
Add the following Microsoft Graph Application Permissions:
- `Directory.Read.All` — Reads tenant users, groups, and licensing metadata.
- `Organization.Read.All` — Discovers verified custom domains for DNS inspection.
- `Policy.Read.All` — Inspects Security Defaults, Conditional Access, and authorization policies.
- `Reports.Read.All` — Reads credential registration details to calculate MFA metrics.
- `RoleManagement.Read.Directory` — Inspects active Global Administrators and privileged role assignments.
- `AuditLog.Read.All` — Required by Microsoft Graph to read authentication methods & MFA registration reports.

### 3. Environment Configuration
Create a `.env` file in the project root based on `.env.example`:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Microsoft Entra ID App Credentials
AZURE_CLIENT_ID="your-azure-application-client-id"
AZURE_CLIENT_SECRET="your-azure-client-secret"
AZURE_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# Session Encryption Secret
SESSION_SECRET="your-32-byte-hex-secret"
```

---

## 📂 Project Architecture

```
mAudit/
├── app/
│   ├── layout.tsx                 # Root dark theme layout & typography
│   ├── page.tsx                   # Landing page (Hero, Categories, NIS2)
│   ├── connect/
│   │   └── page.tsx               # Pre-Consent Trust Screen & Permissions
│   ├── scan/
│   │   └── [id]/page.tsx          # Real-time scan progression & ticker
│   ├── report/
│   │   └── [token]/page.tsx       # Assessment Report, framework tabs & PDF view
│   └── api/
│       ├── auth/
│       │   ├── consent/route.ts   # Microsoft OAuth2 Consent URL generator
│       │   └── callback/route.ts  # Admin consent OAuth redirect handler
│       ├── scan/
│       │   ├── demo/route.ts      # Instant demo scan generator
│       │   └── live/route.ts      # Live Microsoft Graph scanner API
│       └── report/
│           └── [token]/route.ts   # Report retrieval & one-click purge
├── components/
│   ├── navbar.tsx                 # Header navigation & quick demo launcher
│   ├── trust-card.tsx             # Pre-consent security & privacy disclosure
│   ├── score-gauge.tsx            # SVG radial score gauge (90/70 score bands)
│   ├── finding-card.tsx           # Accordion card with PowerShell snippets
│   └── diff-badge.tsx             # Scan diffing indicator
├── lib/
│   ├── db.ts                      # Prisma database client singleton
│   ├── types.ts                   # Domain models & TypeScript interfaces
│   ├── scoring.ts                 # Health index calculation (90/70 bands)
│   ├── compliance.ts              # CIS Foundations & SOC 2 Type II compliance mapping engine
│   ├── finding-translations.ts    # Comprehensive EN/SV dictionary for findings & values
│   ├── diff.ts                    # Scan comparison engine
│   ├── i18n.tsx                   # English & Swedish localization context & dictionary
│   └── scanner/
│       ├── capabilities.ts        # Tenant SKU & license capability detector
│       ├── graph-client.ts        # Graph client & safe query 403 runner
│       ├── dns-scanner.ts         # SPF, DKIM, DMARC validation via dns/promises
│       ├── live-scanner.ts        # Live Microsoft Graph audit orchestrator
│       └── mock-data.ts           # Demo tenant profiles & mock findings
├── prisma/
│   └── schema.prisma              # ScanReport database schema
├── screenshots/
│   └── result.png                 # Posture report visual preview
└── tests/
    └── engine-verification.ts     # Automated unit & integration test suite
```

---

## 🛡️ License
 
This project is open source and distributed under the [MIT License](LICENSE).
 
Copyright (c) 2026 Max Krabbenhöft (MaxVonk).
