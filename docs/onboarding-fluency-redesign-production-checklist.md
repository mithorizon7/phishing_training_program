# Onboarding Fluency Redesign Checklist

Source of truth checklist for a large/intense task.

## Metadata
- Created: 2026-03-06T15:23:09
- Last Updated: 2026-03-06T15:40:22
- Workspace: /Users/davedxn/Downloads/phishing_training_program
- Checklist Doc: /Users/davedxn/Downloads/phishing_training_program/docs/onboarding-fluency-redesign-production-checklist.md

## Scope
- [x] Q-000 [status:verified] Redesign first-session onboarding for learner flow across landing/dashboard/training so users reach first meaningful success (first completed message decision with comprehension) with less confusion and lower decision error risk.

## Sign-off Gate
- [ ] G-001 [status:blocked] All queued work, findings, fixes, and validations are complete.
- [x] G-002 [status:verified] All findings are resolved or marked `accepted_risk` with rationale and owner.
- [ ] G-003 [status:blocked] Required validation suite has been rerun on the final code state.
- [x] G-004 [status:verified] Residual risks and follow-ups are documented.

## Rerun Matrix
- [x] G-010 [status:verified] If code changes after any checked `V-*`, reset affected validation items to unchecked.
- [ ] G-011 [status:blocked] Final sign-off only after a full validation pass completed after the last code edit.

## Audit Queue
- [x] Q-001 [status:verified] Create checklist and baseline scope.
- [x] Q-002 [status:verified] Complete discovery/audit of impacted systems.
- [x] Q-003 [status:verified] Implement required changes.
- [x] Q-004 [status:accepted_risk] Expand or update automated tests.
- [ ] Q-005 [status:blocked] Run full validation suite.
- [ ] Q-006 [status:blocked] Final code-quality pass and sign-off review.

## Findings Log
- [x] F-001 [status:verified] [P1] [confidence:0.90] First-session learners are not given a clear guided path to first meaningful success; training starts without explicit step-by-step framing or progress orientation.
  - Evidence: addressed with guided progress UI and first-session dashboard flow in `client/src/pages/training.tsx`, `client/src/components/dashboard.tsx`, and locale updates.
  - Owner: codex
  - Linked Fix: P-001, P-002
- [x] F-002 [status:verified] [P1] [confidence:0.89] Action selection is available even if learners skip inspection, so novices can make unstructured guesses without learning a repeatable analysis routine.
  - Evidence: addressed by first-decision lens-check gating and unlock guidance in `client/src/components/inbox/message-detail.tsx` with wiring from `client/src/pages/training.tsx`.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-003 [status:verified] [P2] [confidence:0.84] Guidance is not persistently rediscoverable during active shifts, increasing abandonment risk after initial confusion.
  - Evidence: addressed by persistent "Quick Guide" toggle and reopenable panel in `client/src/pages/training.tsx`.
  - Owner: codex
  - Linked Fix: P-002

## Fix Log
- [x] P-001 [status:verified] Add first-session dashboard onboarding path and reduce initial cognitive load before advanced analytics.
  - Addresses: F-001
  - Evidence: `client/src/components/dashboard.tsx`, `client/src/locales/en.json`, `client/src/locales/lv.json`, `client/src/locales/ru.json`.
- [x] P-002 [status:verified] Add training quick-guide scaffolding with clear step progression and persistent help reopen entrypoint.
  - Addresses: F-001, F-003
  - Evidence: `client/src/pages/training.tsx`, `client/src/locales/en.json`, `client/src/locales/lv.json`, `client/src/locales/ru.json`.
- [x] P-003 [status:verified] Add first-decision safety rail requiring minimum inspection checklist completion before action buttons unlock.
  - Addresses: F-002
  - Evidence: `client/src/components/inbox/message-detail.tsx`, `client/src/pages/training.tsx`.
- [x] P-004 [status:verified] Improve onboarding interaction quality: keyboard-accessible checklist controls, automatic checklist progress from real inspection actions, and mobile-safe training layout behavior.
  - Addresses: F-001, F-002, F-003
  - Evidence: `client/src/components/inbox/message-detail.tsx`, `client/src/pages/training.tsx`.

## Validation Log
- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-06 15:35 EST pass; rerun 2026-03-06 15:40 EST pass.
- [x] V-002 [status:verified] `npm run build`
  - Evidence: 2026-03-06 15:35 EST pass; rerun 2026-03-06 15:40 EST pass (existing non-blocking warnings: PostCSS `from` warning and large chunk notice).
- [x] V-003 [status:verified] `npx tsx scripts/i18n-validate.ts`
  - Evidence: 2026-03-06 15:35 EST pass; rerun 2026-03-06 15:40 EST pass.
- [ ] V-004 [status:blocked] Manual smoke review of first-run flow (`/` -> `/dashboard` -> `/training`) on desktop and mobile breakpoints.
  - Evidence: 2026-03-06 15:35 EST + fail (`npm run dev` fails: `DATABASE_URL` is not set).

## Residual Risks
- [x] R-001 [status:accepted_risk] Runtime UX smoke pass remains unexecuted due missing database environment configuration.
  - Rationale: build/type/i18n checks pass, but interactive flow could not be exercised in-browser without `DATABASE_URL`.
  - Owner: user/repo maintainer
  - Follow-up trigger/date: after provisioning `DATABASE_URL`, run `/` -> `/dashboard` -> `/training` learner smoke on desktop and mobile.

## Change Log
- 2026-03-06T15:23:09: Checklist initialized.
- 2026-03-06T15:31:42: Discovery complete; findings and fix plan logged; validation matrix adapted to project scripts.
- 2026-03-06T15:36:18: Onboarding redesign implemented, validations run, and remaining runtime smoke risk documented.
- 2026-03-06T15:40:22: Additional quality sweep complete (accessibility and mobile flow hardening) with full validation rerun.
