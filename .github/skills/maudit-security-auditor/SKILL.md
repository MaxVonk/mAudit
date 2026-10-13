---
name: maudit-security-auditor
description: 'Build, extend, review, or test mAudit, a Microsoft 365 security posture auditing platform. Use for Entra ID and Microsoft Graph scanning, CIS-aligned checks, licensing-aware findings, remediation, NIS2/GDPR mapping, report privacy, or the Swedish mAudit frontend.'
argument-hint: 'Describe the mAudit feature, security check, or workflow to work on'
---

# mAudit Security Auditor

Use this skill to implement or review mAudit features in line with the product's security architecture and UX. The authoritative project requirements are [the auditor specification](../../../m365_security_auditor_agent_spec.md) and [the UX specification](../../../maudit_ux_specification.md). Read the relevant sections before changing code; do not assume that this skill replaces either specification.

## When to Use

- Implement or change M365 tenant consent, scanning, security checks, scoring, remediation, report storage, or scan diffing.
- Build or revise the mAudit user experience, especially trust/consent, live scanning, or assessment reports.
- Review mAudit code for security, privacy, correctness, or consistency with the specifications.
- Add tests or verify behavior for any of these areas.

## Workflow

1. **Pin down the slice.** Identify the requested behavior, its owning code path, and the nearest test. Read only the relevant sections of both specs and nearby project conventions. State a local hypothesis and a focused check before editing.
2. **Check requirements for conflicts.** Treat the auditor specification as the source for security, data, scan, and scoring behavior; treat the UX specification as the source for presentation and interaction. If they disagree on behavior or a public contract, identify the mismatch and ask for a decision before encoding an assumption. The canonical score bands are 90/70, as specified by the auditor requirements; the UX example's 85/65 bands are stale and should be aligned when implementing that UI.
3. **Preserve the security boundary.** Use read-only delegated/application permissions as specified. Never add a write permission, read tenant content (mail, files, chats, or passwords), or persist a directory mirror. Keep tokens and consent state protected; validate OAuth state and avoid exposing secrets. Make requested permissions, data use, offboarding, and deletion clear to the tenant admin.
4. **Make checks capability-aware.** Inspect tenant SKUs before premium-dependent rules. Represent checks unavailable because of licensing as not applicable, keep them neutral in scoring, and offer the documented Security Defaults alternative where relevant. Handle expected Graph 403/license errors locally; propagate unrelated failures rather than disguising them.
5. **Keep findings actionable and traceable.** Use the documented finding contract and statuses. Include current and recommended values, severity, compliance references where supported, a Microsoft admin-center path, and a PowerShell remediation. Do not claim a check passed when its data could not be retrieved. Keep personal identities out of persistent findings and summary data.
6. **Keep the product voice consistent.** Use established Swedish M365 terminology, with English portal labels in parentheses when useful. Be calm and specific rather than alarmist. Explain why consent is needed, what is and is not accessed, retention and deletion, and how to remove the enterprise app. Each failed check should lead to a practical next action.
7. **Implement narrowly.** Follow the existing stack and conventions. Preserve public APIs unless the requested behavior requires a change. Avoid unrelated refactors, speculative checks, or storing extra tenant data. Update documentation only where the behavior or operator setup changes.
8. **Verify the requested behavior.** Add or update focused tests for the changed rule, error path, privacy invariant, or user flow. Run the narrowest relevant test/typecheck/lint first, then required project gates. For UI work, verify responsive layout, loading/empty/error states, accessible controls, and print/PDF behavior when touched. Report tests that could not be run.

## Product Invariants

- Tenant assessment uses Microsoft Graph plus DNS checks for verified domains, with license-aware rules and safe handling of unavailable premium endpoints.
- Findings map technical state to concrete remediation; NIS2 and GDPR references are supporting context, not a claim of legal certification.
- Persist only aggregated/anonymized report data, a tenant identifier hash, and the documented report metadata. Reports expire after 14 days and users can delete them immediately.
- A report supports comparison with a prior scan when available and explains resolved/new findings without retaining a directory mirror.
- The experience prioritizes transparency, technical precision, and calm language. The consent/trust screen is a security-critical user flow, not decorative copy.

## Completion Checklist

- The change matches both specs, or any conflict is explicitly resolved rather than hidden.
- Permissions remain read-only; no tenant content or unnecessary personal data is collected or stored.
- License limitations and Graph failures cannot produce misleading passes or unfair score penalties.
- Findings and reports remain actionable, understandable, and consistent with the documented contracts.
- Relevant focused checks pass, with remaining verification gaps stated clearly.