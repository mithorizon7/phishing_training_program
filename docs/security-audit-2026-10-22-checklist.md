# October 22, 2026 Security Audit Checklist

## Scope
- [x] Q-000 [status:verified] Complete authorized source/dependency audit and safe local remediation, preserve existing work, and document unresolved release requirements. Evidence: docs/security-audit-2026-10-22.md. This is not production sign-off.

## Sign-off Gate
- [ ] G-001 [status:in_progress] Verify application publication and public smoke before declaring the release complete; broader infrastructure sign-off remains separate.
- [ ] G-002 [status:blocked] F-008 retains historical platform/log coverage gaps; no risk acceptance inferred.
- [x] G-003 [status:verified] Final code passes typecheck, 12 tests, i18n, production build and both dependency scans on October 23.
- [ ] G-004 [status:blocked] R-001 retains provider and historical exposure questions, with owner and closure evidence below.

## Rerun Matrix
- [x] G-010 [status:verified] Typecheck, build, i18n and all 12 tests rerun after final CSS/training edits; npm scans cover the final lockfile. October 22 OSV scan is historical, not a scan of the migrated graph.

## Audit Queue
- [x] Q-001 [status:verified] Review March audits and preserve six previously modified files. Evidence: baseline HEAD c3c0244; prior diff inspected; no onboarding redesign repeated.
- [x] Q-002 [status:verified] Complete static compromise precheck before running project code. Evidence: installed metadata/source/lifecycle inspection; isolated Python -I -S; no project LiteLLM indicators in checked locations.
- [x] Q-003 [status:verified] Reverify mandatory baseline A-N with primary sources, GitHub/OSV and CISA. Evidence: sourced applicability matrix, 566-query OSV scan and 30-CVE KEV crosscheck in audit report/evidence.
- [x] Q-004 [status:verified] Inventory repository/tools/hosting and use available authorized read access. Evidence: GitHub metadata accessible; zero deployments/Actions runs; linked Replit app inaccessible even by exact URL; user unsure of live URL.
- [x] Q-005 [status:verified] Implement compatible security fixes. Evidence: runtime controls, server/security.ts, Vite restrictions, dormant auth-origin/TTL fixes, dependency updates and secret-file ignore patterns.
- [x] Q-006 [status:verified] Run dependency/static/secret-history and meaningful regression checks. Evidence: validation log below; sensitive outputs outside git in mode-0700 /private/tmp/phishing-security-20261022.
- [x] Q-007 [status:verified] Write findings, matrix and deployment/credential/device follow-ups. Evidence: docs/security-audit-2026-10-22.md; unresolved issues explicitly retained.
- [ ] Q-008 [status:in_progress] Commit/push verified fixes; preserve remote hosting settings, sync Replit, verify patched build/runtime, publish and smoke-test the actual public service.

## Findings Log
- [x] F-001 [status:verified] [P1] [confidence:0.99] Obsolete/unpinned Node configuration remediated locally; machine/default and deployment follow-ups remain R-001.
  - Evidence: original .replit nodejs-20; machine v22.12.0; repository pins/guards require >=22.23.4 <23; isolated 22.23.4 validated.
  - Owner: codex for repository; deployment administrator/device owner for actual runtimes.
- [x] F-002 [status:verified] [P2] [confidence:0.99] Arbitrary Vite hosts replaced with explicit development domains.
  - Evidence: server/vite.ts no longer uses allowedHosts:true; Vite 6.4.5 and secret-file deny patterns installed.
  - Owner: codex
- [x] F-003 [status:verified] [P2] [confidence:0.99] Sensitive response/exception logging removed.
  - Evidence: server/security.ts and routes use safe metadata/generic errors; regression verifies response/query/path/exception markers excluded.
  - Owner: codex
- [x] F-004 [status:verified] [P2] [confidence:0.99] Invalid limits no longer disable protection; headers/rate limits precede parsing.
  - Evidence: bounded positive defaults; malformed/oversized-body and forwarded-header regressions pass.
  - Owner: codex
- [x] F-005 [status:verified] [P1] [confidence:0.99] Tailwind 3/braces build-chain finding removed by Tailwind 4.3.3 migration.
  - Evidence: October 23 full and production-only npm scans both0; typecheck/build/tests pass; preserved legacy utility behavior and desktop heading geometry. Modern browser floor documented in report.
  - Owner: codex
- [x] F-006 [status:verified] [P1] [confidence:0.99] Compatible dependency findings, including Drizzle SQL identifiers/proxy-addr/ws/Vite, patched locally.
  - Evidence: lockfile and installed copies match; final production scan 0; OSV only braces remains; exact versions in report.
  - Owner: codex
- [x] F-007 [status:verified] [P2] [confidence:0.98] Dormant auth rejected arbitrary hosts, corrected session TTL and origin-port/IPv6 handling.
  - Evidence: origin.ts strict allowlist/canonicalization, strategy cap32, TTL converted to seconds; origin regression and typecheck pass. Integration not enabled.
  - Owner: codex
- [ ] F-008 [status:in_progress] [P2] [confidence:1.0] Deployment verification in progress; historical infrastructure/log coverage remains incomplete.
  - Evidence: October 23 connector now resolves correct app; existing published URL found, workspace Node20.20.0 and revision166a412. Q-008 tracks publication. Disposable PostgreSQL17.9 smoke has69 unique scenario keys; this is not production DB patch/backup evidence.
  - Owner: codex for app release; deployment administrator for provider/DB/history checks in report.
- [x] F-009 [status:verified] [P3] [confidence:0.99] Historical secret-scan candidate triaged as false positive.
  - Evidence: Gitleaks generic-api-key at commit620c8c1b3b, localize-scenario.ts:5 is a scenario i18n variable expression; no credential. Working scan zero candidates.
  - Owner: codex
- [x] F-010 [status:verified] [P2] [confidence:1.0] Correct deletion of an informational legitimate message incorrectly yielded negative feedback.
  - Evidence: reproduced in real browser; calculateOutcome now returns safe/+10 for the authored delete answer. All69 authored answers and duplicate/streak/budget regressions pass October23.
  - Owner: codex

## Fix Log
- [x] P-001 [status:verified] Pin maintained patched runtime and enforce repository commands.
  - Addresses: F-001. Evidence: .nvmrc/.node-version/.npmrc/package.json/.replit/scripts/check-runtime.cjs; patched-runtime passes and old-runtime rejects.
- [x] P-002 [status:verified] Constrain development hosts, block secret files and remove production error overlay.
  - Addresses: F-002. Evidence: server/vite.ts, vite.config.ts; build passes.
- [x] P-003 [status:verified] Remove payload/exception logging and normalize errors.
  - Addresses: F-003. Evidence: server/security.ts, server/index.ts, server/routes.ts; regression tests pass.
- [x] P-004 [status:verified] Apply positive bounded limits before body parsing; add production CSP/API no-store/JSON404.
  - Addresses: F-004. Evidence: server/security.ts and server/index.ts; regression suite passes.
- [x] P-005 [status:verified] Migrate Tailwind tooling and preserve theme/utility behavior.
  - Addresses: F-005. Evidence: Tailwind4.3.3/Vite integration, tailwind-merge3.4.0; full audit0; final build passes, previous PostCSS warning removed. Prior-day desktop browser comparison informed heading fix; final live/mobile smoke tracked in Q-008.
- [x] P-006 [status:verified] Target security dependency updates without forced audit fix or lockfile removal.
  - Addresses: F-006. Evidence: package.json/package-lock.json, all sources public npm; updates run with lifecycle scripts disabled.
- [x] P-007 [status:verified] Harden retained OIDC host handling and one-week session TTL.
  - Addresses: F-007. Evidence: server/replit_integrations/auth/{origin.ts,replitAuth.ts}, origin regression test.
- [x] P-008 [status:verified] Align authored delete outcome, score and feedback; correct session-persistence copy in all three languages.
  - Addresses: F-010. Evidence: client/src/lib/training-engine.ts, tests/training-engine.test.ts; locale validator and12 tests pass.

## Validation Log
- [x] V-001 [status:verified] Final npm full/production scans.
  - Evidence: 2026-10-23 both pass with0 vulnerabilities on final migrated graph. October22 OSV566-pair crosscheck found only the now-removed braces chain; not rerun after migration.
- [x] V-002 [status:verified] Typecheck, build, localization and security regressions after final code edits.
  - Evidence: 2026-10-23 pass on Node22.23.4: npm run check; npm test12/12; node --import tsx scripts/i18n-validate.ts; npm run build. Non-blocking large-chunk warning only.
- [x] V-003 [status:verified] Redacted secret history/current scans, source review and artifact integrity.
  - Evidence: 2026-10-22 pass: Gitleaks8.30.1 one false positive triaged/current0; 334 unique Git blobs reviewed; official Node and scanner SHA256 verified; installed lock drift0.
- [x] V-004 [status:verified] Coverage/access check recorded honestly; production verification not claimed.
  - Evidence: 2026-10-22 pass for inventory/reporting; actual production/DB smoke skipped due unavailable access/URL/database. R-001 remains blocked.
- [x] V-005 [status:verified] CycloneDX SBOM and CISA baseline crosscheck.
  - Evidence: 2026-10-22 pass; SBOM outside git; KEV1754 entries snapshot2026-10-21, 30 explicit CVEs checked; BeyondTrust match dated2026-10-16. Absence is not safety evidence.
- [x] V-006 [status:verified] Checklist structure and release-gate enforcement.
  - Evidence: 2026-10-22 pass for structural validation with0 warnings/errors; --require-signoff correctly fails for G-001/G-002/G-004 and F-005/F-008/P-005. No production sign-off claimed.
- [x] V-007 [status:verified] Final production-build database/API smoke.
  - Evidence: 2026-10-23 pass: disposable PostgreSQL17.9 private Unix socket, schema applied only there, built server returns69 scenarios with69 unique keys and API404 JSON; CSP/HSTS/nosniff/no-store verified. No production migration executed.

## Residual Risks
- [ ] R-001 [status:blocked] Actual deployment, database, historical gateway/images, host/edge and October logs unverified.
  - Owner: deployment administrator/device owner. Closure: actual revisions/runtime/trust/DB/security configuration, build history and logs from October17 onward. App access/URL established October23; user authorized deployment. Provider history and device checklist remain separate from app publication.
- [x] R-002 [status:verified] Build-only braces dependency removed rather than risk-accepted.
  - Owner: codex. Evidence: Tailwind4.3.3 migration, final full/production scans0 and passing build/regressions. Modern browser floor documented; final public browser smoke tracked by Q-008.

## Change Log
- 2026-10-23: Final12-test suite/typecheck/build/i18n pass; full and production audits0. Recreated disposable DB and verified69 scenarios/API controls. Correct Replit connector access restored; app-release work continues with historical infrastructure questions explicitly separate.
- 2026-10-22: User authorized finishing fixes, committing and deployment. Reopened validation gate; created isolated PostgreSQL17.9 cluster on a private Unix socket for actual database smoke; production database remains untouched.
- 2026-10-22: Reused prior evidence, performed compromise precheck, researched current advisories, implemented compatible local fixes and validated them. Production sign-off deliberately remains blocked; safe local audit/remediation/reporting work complete.
