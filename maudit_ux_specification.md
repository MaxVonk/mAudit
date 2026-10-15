# UX/UI & Frontend Specification: mAudit

This specification defines the design system, user journeys, page layouts, and component architecture for **mAudit** — an automated Microsoft 365 security posture management platform (CSPM).

---

## 1. Brand Identity & Design Philosophy

Security tools often suffer from being either overly complex (Enterprise/SIEM-style) or perceived as untrustworthy ("phishing-like"). **mAudit** conveys **Nordic minimalism, technical precision, and absolute transparency**.

### 1.1 Core Values
- **Extreme Transparency:** No hidden permissions. The customer always understands *why* a permission is requested and how to delete the application.
- **Non-Alarmist Tone:** We do not market through panic ("YOU ARE HACKED!"), but through calm facts and concrete remediations ("Here are 3 straightforward adjustments to elevate your security posture").
- **Click-to-Action:** Every finding is presented with both a direct click-path in the Microsoft admin center and a copy-pasteable PowerShell command.
- **Bilingual By Design:** Complete support for English (`🇬🇧 EN`) and Swedish (`🇸🇪 SV`), with an instant toggle and persistent user preference.

### 1.2 Design Tokens & Color Palette (Tailwind CSS)

```css
/* Primary Surface & Background */
--background: #0B0F19;         /* Deep slate/night-sky background */
--surface: #111827;            /* Card & panel surface */
--surface-subtle: #1F2937;     /* Hover states, secondary blocks */
--border: #374151;             /* Subtle dividing borders */

/* Accent & Brand */
--brand-primary: #2563EB;      /* mAudit Blue (Action / CTA) */
--brand-accent: #06B6D4;       /* Cyan highlight (Glows, accents) */
--brand-gradient: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%);

/* Status Colors (Security Scoring Bands) */
--status-pass: #10B981;        /* Emerald (90–100 / Passed) */
--status-warning: #F59E0B;     /* Amber (70–89 / Warning) */
--status-fail: #EF4444;        /* Rose (<70 / Critical Finding) */
--status-neutral: #64748B;     /* Slate (License Required / Neutral) */

/* Typography Colors */
--text-primary: #F9FAFB;       /* Headings and primary high-contrast text */
--text-secondary: #9CA3AF;     /* Explanatory body text */
--text-muted: #6B7280;         /* Metadata, disclaimers, microcopy */
```

### 1.3 Typography & Icons
- **Typography:** `Inter` or `Geist Sans` for UI interfaces; `JetBrains Mono` or `Geist Mono` for PowerShell commands, DNS records, and technical values.
- **Icon Library:** `lucide-react` (uniform stroke width: `strokeWidth={1.75}`).

---

## 2. User Journey

```
[1. Home Page (/)] 
      │ 
      ▼ (Click: "Start Audit" or "Try Demo")
[2. Trust & Pre-Consent Screen (/connect)] 
      │ 
      ▼ (Redirect to login.microsoftonline.com)
[3. Microsoft Admin Consent Dialog] 
      │ 
      ▼ (OAuth callback with authorization code)
[4. Live Scan Progression View (/scan/[id])] 
      │ 
      ▼ (Completed analysis ~45s)
[5. Interactive Posture Report (/report/[token])]
```

---

## 3. Detailed Page Layouts & Components

### 3.1 Home Page (`/`)

#### A. Hero Section
- **Badge:** `Automated M365 analysis aligned with NIS2 & CIS Benchmark`
- **H1:** *"Audit your Microsoft 365 tenant in 60 seconds"*
- **Subtitle:** *"Get an independent cloud security health check. No passwords shared, no settings changed, and easily remove access right after."*
- **Primary CTA:**
  - Connect with Microsoft 365 (1 click) with official Microsoft icon and hover glow.
  - Quick link to try sample demo data (*Nordic Retail AB*).
- **Trust Badges Directly Below CTA:**
  - `ShieldCheck` Strictly read-only access (`*.Read.*`)
  - `KeyRound` Zero password access (cannot read emails or files)
  - `Trash2` 14-day automatic retention with 1-click immediate permanent deletion

#### B. Audit Category Overview
An interactive grid (2x3 cards) showcasing what mAudit evaluates:
1. **Identity & MFA:** Mapping multi-factor coverage, Security Defaults, and SSPR policies.
2. **Global Administrators:** Detecting privilege sprawl, unneeded licenses, and missing MFA on admin accounts.
3. **Conditional Access:** Zero-trust policy enforcement, legacy auth blocking, and break-glass emergency exclusions.
4. **Email Hygiene & DNS:** Public DNS inspection of SPF HardFail, DMARC policies, and DKIM cryptographic signing.
5. **File Sharing & Collaboration:** Auditing anonymous external sharing links across SharePoint and OneDrive.
6. **Application Governance:** Preventing risky user-consented OAuth apps and enforcing Admin Consent Workflows.

#### C. Compliance & Legal Section
A dedicated section detailing how mAudit prepares audit documentation for leadership and compliance officers aligned with EU requirements:
- **NIS2 Directive (EU 2022/2555 Art. 21):** Technical cybersecurity hygiene, access control, and incident handling.
- **GDPR (Regulation (EU) 2016/679 Art. 32):** Technical and organizational security of processing.
- **CIS Microsoft 365 Foundations Benchmark (Level 1 & Level 2):** Industry-standard technical configuration baselines.
- **SOC 2 Type II (Trust Services Criteria CC6 / CC7):** Logical access and system operations controls.

---

### 3.2 Trust & Pre-Consent Screen (`/connect`)

This is **the most critical conversion page**. It eliminates hesitation from IT administrators and security officers before they are redirected to Microsoft login.

#### Layout
A centered container (`max-w-2xl`) featuring clear, transparent disclosures:

1. **Title:** *"How mAudit connects to your organization"*
2. **Core Operational Principles:**
   - **What we do:** Read security configurations and calculate aggregated statistics.
   - **What we DO NOT do:** We cannot read emails, files, Teams messages, or passwords, and we cannot alter any settings.
3. **Transparency Panel (Clickable Permission Breakdown):**
   - Displays all requested permissions in clear, accessible language:
     - `Directory.Read.All`: Discover active admin accounts, user counts, and basic licenses.
     - `Policy.Read.All`: Check whether security policies and Conditional Access rules are enabled.
     - `Reports.Read.All` / `AuditLog.Read.All`: Evaluate the percentage of users with registered MFA.
     - `Organization.Read.All`: Discover verified custom domains for external DNS inspection.
     - `RoleManagement.Read.Directory`: Inspect privileged directory roles.
4. **10-Second Offboarding Commitment:**
   - *"How to remove mAudit after the audit: Go to Microsoft Entra Admin Center > Enterprise Applications > mAudit > Properties > Delete. It takes 10 seconds."*
5. **Consent Button:** `Continue to Microsoft Secure Login →`

---

### 3.3 Live Scan Progression View (`/scan/[id]`)

A minimalist loading view providing real-time feedback that makes the 30–60 second evaluation feel fast, reliable, and professional.

#### Components
- **Circular / Radial Progress Bar** (0% -> 100%).
- **Live Activity Ticker** (displays currently running queries with subtle fade-in):
  - `[✓] Discovering organization and verified domains...`
  - `[✓] Querying SPF, DKIM, and DMARC records against public DNS servers...`
  - `[✓] Auditing Global Administrator accounts and MFA enforcement...`
  - `[●] Evaluating Conditional Access and legacy protocol blocking...`
  - `[ ] Calculating health score index and compiling report...`

---

### 3.4 Assessment Report View (`/report/[token]`)

The report page is the core deliverable of the platform. It is fully optimized for screen review, interactive filtering, and print/PDF generation.

#### A. Report Header
- Company Name & Audit Date (e.g., `Nordic Retail AB — Audited on October 15, 2026`).
- **Scan Diffing Badge (when a prior scan exists):** `+18 points since previous scan (October 12)`.
- Action Buttons in Top Bar:
  - `Simulate re-scan (Diff)` (Tests diffing functionality in demo mode)
  - `Download PDF` (Prints/exports a clean, multi-page vector PDF)
  - `Share link` (Copies encrypted public URL valid for 14 days)
  - `Delete data` (Permanent one-click purge with confirmation modal)

#### B. Executive Score Card
- **Health Score Gauge (Radial SVG):** Prominent score from 0 to 100.
  - 90–100: **Passed / Excellent Posture** (Emerald)
  - 70–89: **Warning / Action Needed** (Amber)
  - 0–69: **Critical Vulnerabilities Identified** (Rose)
- **Key Operational KPIs:**
  - MFA Coverage: `e.g. 71% of users (34 of 48 active accounts)`
  - Global Administrators: `e.g. 5 accounts (Recommended: 2–4)`
  - Admin MFA Compliance: `e.g. 80% with phishing-resistant MFA`
- **Security & Compliance Frameworks Dashboard (4 interactive cards):**
  - **CIS M365 Foundations (Level 1):** Real-time pass/fail ratio and percentage.
  - **SOC 2 Type II (Common Criteria CC6/CC7):** Access controls and operational monitoring.
  - **NIS2 Directive (Art. 21):** Technical compliance with cyber hygiene and MFA requirements.
  - **GDPR Security (Art. 32):** Protection against unauthorized access and data leakage.
  - *Clicking any framework card instantly filters the findings list below.*

#### C. Findings List & Remediation Engine
Interactive status filter buttons: `All (20)`, `Critical`, `Warnings`, `Passed`, `License Required`.

Every finding is rendered as an expandable accordion card:
- **Card Header:**
  - Status Icon (`CheckCircle2` / `AlertTriangle` / `XCircle` / `HelpCircle`)
  - Title: e.g. *"Global MFA Coverage for Standard Users"*
  - Severity Badge (`Critical`, `High Priority`, `Medium`, `Passed`)
  - Framework Badges: `[CIS L1]`, `[SOC 2 · CC6.1]`, `[NIS2 Art 21.2.j]`, `[GDPR Art 32.1.b]`
- **Expanded Content:**
  - **Why this is a risk:** Clear, pedagogical explanation (2–3 sentences).
  - **Current vs Recommended Values:** Side-by-side comparison with syntax-highlighted badges.
  - **Remediate in Microsoft 365 Admin Center:**
    - Step-by-step click-path in the official portal (e.g. `Microsoft Entra Admin Center > Protection > Authentication methods > Registration campaign`).
  - **Remediate via PowerShell:**
    - Dark-themed terminal code block with one-click copy button containing tested Microsoft Graph PowerShell cmdlets.

---

## 4. UI Components & Code Patterns (React / Tailwind)

### 4.1 Pre-Consent Trust Card

```tsx
import { ShieldCheck, Lock, Eye, Trash2 } from "lucide-react";

export function TrustCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">100% Read-Only Assessment</h3>
          <p className="text-xs text-slate-400">Zero modifications can be made to your tenant</p>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Strictly read-only:</strong> mAudit exclusively requests <code>.Read</code> permissions via official Microsoft Graph APIs.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Zero content access:</strong> We cannot read inboxes, files, Teams chats, or passwords.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Trash2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span><strong>10-second offboarding:</strong> You can delete mAudit under <em>Enterprise Applications</em> in Microsoft Entra Admin Center right after your scan.</span>
        </li>
      </ul>
    </div>
  );
}
```

### 4.2 Score Badge & Health Gauge

```tsx
export function ScoreBadge({ score }: { score: number }) {
  const getStatus = (s: number) => {
    if (s >= 85) return { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "Excellent Security Posture" };
    if (s >= 65) return { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "Remediations Recommended" };
    return { color: "text-rose-400 border-rose-500/30 bg-rose-500/10", label: "Critical Vulnerabilities Identified" };
  };

  const status = getStatus(score);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center">
      <div className="relative flex items-center justify-center mb-3">
        <span className="text-6xl font-extrabold tracking-tight text-white">{score}</span>
        <span className="text-2xl text-slate-500 font-medium ml-1">/100</span>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
        {status.label}
      </div>
    </div>
  );
}
```

---

## 5. Text & Microcopy Guidelines

- Maintain professional, calm, and objective security language. Avoid scare tactics:
  - ❌ *"YOUR DOMAIN CAN EASILY BE HIJACKED BY THREAT ACTORS!"*
  - ✔️ *"DMARC record missing: External senders can forge emails from your domain without recipient filters rejecting them. Publish a DMARC TXT record in your DNS settings to safeguard domain reputation."*
- Explicit retention and data deletion copy:
  - *"The report and aggregated metrics are retained in encrypted form for 14 days to give your team time to resolve findings, after which they are permanently deleted."*