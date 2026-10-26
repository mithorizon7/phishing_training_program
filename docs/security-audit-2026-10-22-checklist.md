# October 22, 2026 Security Audit Checklist

## Scope
- [x] Q-000 [status:verified] Complete authorized source/dependency audit and safe local remediation, preserve existing work, and document unresolved release requirements. Evidence: docs/security-audit-2026-10-22.md. This is not production sign-off.

## Sign-off Gate
- [ ] G-001 [status:blocked] Comprehensive platform sign-off remains limited by F-008/R-001; the application release is separately verified in G-020.
- [ ] G-002 [status:blocked] F-008 retains historical platform/log coverage gaps; no risk acceptance inferred.
- [x] G-003 [status:verified] October26 final checks pass after all responsive/accessibility edits: typecheck,17 tests,i18n,build and full/production npm audits0; focused hosted checks pass.
- [ ] G-004 [status:blocked] R-001 retains provider and historical exposure questions, with owner and closure evidence below.
- [x] G-020 [status:verified] Complete application releaseffb6eb9 published October26 as Replit0efc823; public artifact/data/security/mobile checks pass. Broader provider sign-off remains separate.

## Rerun Matrix
- [x] G-010 [status:verified] Typecheck/build/i18n/17 tests rerun after final code edits. Full/production npm scans0 and final472-pair OSV scan0 cover current lockfile.

## Audit Queue
- [x] Q-001 [status:verified] Review March audits and preserve six previously modified files. Evidence: baseline HEAD c3c0244; prior diff inspected; no onboarding redesign repeated.
- [x] Q-002 [status:verified] Complete static compromise precheck before running project code. Evidence: installed metadata/source/lifecycle inspection; isolated Python -I -S; no project LiteLLM indicators in checked locations.
- [x] Q-003 [status:verified] Reverify mandatory baseline A-N with primary sources, GitHub/OSV and CISA. Evidence: sourced applicability matrix, 566-query OSV scan and 30-CVE KEV crosscheck in audit report/evidence.
- [x] Q-004 [status:verified] Inventory repository/tools/hosting and use available authorized read access. Evidence: GitHub metadata accessible; zero deployments/Actions runs; linked Replit app inaccessible even by exact URL; user unsure of live URL.
- [x] Q-005 [status:verified] Implement compatible security fixes. Evidence: runtime controls, server/security.ts, Vite restrictions, dormant auth-origin/TTL fixes, dependency updates and secret-file ignore patterns.
- [x] Q-006 [status:verified] Run dependency/static/secret-history and meaningful regression checks. Evidence: validation log below; sensitive outputs outside git in mode-0700 /private/tmp/phishing-security-20261022.
- [x] Q-007 [status:verified] Write findings, matrix and deployment/credential/device follow-ups. Evidence: docs/security-audit-2026-10-22.md; unresolved issues explicitly retained.
- [x] Q-008 [status:verified] Commit/push application fixes and publish existing Replit service.
  - Evidence: main925d512; deployed mergebe101a7; public assets byte-identical,69 original IDs/keyed rows retained, headers/JSON404 and complete public learner flows pass October23. Existing hosting settings/history preserved.
- [x] Q-009 [status:verified] Finish font/zoom/responsive/accessibility fixes, commit/push canonical main and republish existing service.
  - Evidence: mainffb6eb9, deployed0efc823; publish success, publicJS/CSS byte-identical, font/zoom metadata correct,69 IDs/keys retained, security headers/JSON404 pass; actual public320pxRU loaded-font/initial-training smoke passes without errors.

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
- [ ] F-008 [status:blocked] [P2] [confidence:1.0] Application release verified; historical infrastructure/log coverage and backup metadata remain incomplete.
  - Evidence: production startup logs identify mergebe101a7 and passed Node guard, without exact version string. Production read replica reports PostgreSQL16.15. Public flows, assets and69 retained scenario IDs verified. Backup timestamps/retention/restore evidence and historical provider/device coverage remain unavailable; previewNode22.23.4 is not exact production-version proof.
  - Owner: codex for app release; deployment administrator for provider/DB/history checks in report.
- [x] F-009 [status:verified] [P3] [confidence:0.99] Historical secret-scan candidate triaged as false positive.
  - Evidence: Gitleaks generic-api-key at commit620c8c1b3b, localize-scenario.ts:5 is a scenario i18n variable expression; no credential. Working scan zero candidates.
  - Owner: codex
- [x] F-010 [status:verified] [P2] [confidence:1.0] Correct deletion of an informational legitimate message incorrectly yielded negative feedback.
  - Evidence: reproduced in real browser; calculateOutcome now returns safe/+10 for the authored delete answer. All69 authored answers and duplicate/streak/budget regressions pass October23.
  - Owner: codex
- [x] F-011 [status:verified] [P1] [confidence:0.99] Zod advisory GHSA-mrhx-c7xc-m3w5 independently identified and patched despite npm audit0.
  - Evidence: October23 initial474-pair OSV query found Zod3.24.2; upgraded4.6.7/drizzle-zod0.8.3, removed two unused adapters rather than forcing incompatible peers. Final472-pair query0. New schema/early-rejection tests2/2 pass; whole-suite rerun tracked in G-003.
  - Owner: codex
- [x] F-012 [status:verified] [P2] [confidence:1.0] Localized mobile recovery-result overflow resolved.
  - Evidence: Replit final production-build checks measure390px page width in all three languages at390px. Independent local browser confirms English390px, Latvian/Russian390px and320px without overflow; recovery100/100 and no browser errors.
  - Owner: codex
- [x] F-013 [status:verified] [P1] [confidence:1.0] Legacy unkeyed scenario duplication prevented by key backfill and serialized startup.
  - Evidence: actual public API69 null-key rows exactly match authored fingerprints. Disposable PostgreSQL concurrent startup preserves69 IDs, restores69 keys, creates0 rows; repeated startup changes0.
  - Owner: codex
- [x] F-014 [status:verified] [P3] [confidence:1.0] Font requests and browser zoom corrected; exposed layout issues separately tracked in F-015.
  - Evidence: October26 Replit977a17e/a887a8f confirms all four families loaded, one combined stylesheet, all font/stylesheet requests200 with no ORB failures, and mobile zoom200%. Removed maximum-scale=1; independent endpointHTTP200.
  - Owner: codex
- [x] F-015 [status:verified] [P2] [confidence:1.0] Loaded-font mobile layout overflows resolved without clipping or hiding learner actions.
  - Evidence: reviewed branch commit251bc67 fixes eight presentation-only components. Replit reports all nine EN/LV/RU x320/390/1365 combinations pass, nine complete shifts and36 recovery drills pass with no errors. Source diff independently reviewed/integrated without hosting-history changes. Final focused accessibility rerun remains Q-009.
  - Owner: codex
- [x] F-016 [status:verified] [P2] [confidence:0.99] Channel naming and short-screen/long-cue access corrected.
  - Evidence: finalffb6eb9/0efc823 focused checks pass in all six EN/LV/RU x320/390 combinations with320px-tall viewport: localized tab labels/tooltips/keyboard switching,12px timestamps, full cue text, scroll/keyboard-reachable confidence controls; no overflow/errors. Local final suite also passes.
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
- [x] P-009 [status:verified] Upgrade Zod4.6.7 and drizzle-zod0.8.3; remove unused form/error adapters.
  - Addresses: F-011. Evidence: package/lock and tests/schema.test.ts; authored insert validation and bounded-collection early rejection pass; OSV472 pairs0.
- [x] P-010 [status:verified] Stack/wrap localized recovery results and replace nested link/button with one semantic action.
  - Addresses: F-012. Evidence: client/src/pages/recover.tsx; final Replit and independent local browser checks above pass.
- [x] P-011 [status:verified] Backfill legacy keys without duplicating data; serialize startup synchronization.
  - Addresses: F-013. Evidence: server/scenario-seeding.ts, tests/scenario-seeding.test.ts; actual concurrent-DB/idempotence smoke passes. Native insert types replace widened Zod enum inference in authored seed typing.
- [x] P-012 [status:verified] Consolidate valid font loading, remove unused scaffold font requests and restore browser zoom.
  - Addresses: F-014. Evidence: client/index.html, client/src/index.css; local suite and hosted request/zoom verification pass. Responsive corrections remain P-013 before publication.
- [x] P-013 [status:verified] Reflow headers, long text and training/recovery controls at narrow phone widths without hiding actions or clipping content.
  - Addresses: F-015. Evidence:251bc67 independently reviewed; nine-combination loaded-font checks, keyboard checks, nine shifts and36 recovery drills pass. Local integrated suite rerun passes.
- [x] P-014 [status:verified] Label channel filters and keep confidence/cue content reachable in short/narrow viewports.
  - Addresses: F-016. Evidence: message-list.tsx, confidence-rating.tsx, feedback-screen.tsx; final six-combination short-screen checks and full local regression suite pass.

## Validation Log
- [x] V-001 [status:verified] Final npm full/production scans.
  - Evidence: 2026-10-23 both npm scans pass with0 vulnerabilities; final independent OSV472-pair query0 after Zod4.6.7 patch. Historical scans are superseded.
- [x] V-002 [status:verified] Typecheck, build, localization and security regressions after final code edits.
  - Evidence: 2026-10-23 pass on Node22.23.4 after final code edits: npm run check; npm test17/17; node --import tsx scripts/i18n-validate.ts; npm run build. Non-blocking large-chunk and third-party pure-comment annotation warnings remain.
- [x] V-003 [status:verified] Redacted secret history/current scans, source review and artifact integrity.
  - Evidence: 2026-10-22 pass: Gitleaks8.30.1 one false positive triaged/current0; 334 unique Git blobs reviewed; official Node and scanner SHA256 verified; installed lock drift0.
- [x] V-004 [status:verified] Coverage/access check recorded honestly; production verification not claimed.
  - Evidence: 2026-10-22 pass for inventory/reporting; actual production/DB smoke skipped due unavailable access/URL/database. R-001 remains blocked.
- [x] V-005 [status:verified] CycloneDX SBOM and CISA baseline crosscheck.
  - Evidence: 2026-10-22 pass; SBOM outside git; KEV1754 entries snapshot2026-10-21, 30 explicit CVEs checked; BeyondTrust match dated2026-10-16. Absence is not safety evidence.
- [x] V-006 [status:verified] Checklist structure and release-gate enforcement.
  - Evidence: 2026-10-26 pass for structural validation with0 warnings/errors; --require-signoff correctly remains blocked by broad platform gatesG-001/G-002/G-004 and coverage findingF-008. All application findings/fixes and application-release gateG-020/Q-009 are verified. No blanket infrastructure sign-off claimed.
- [x] V-007 [status:verified] Final production-build database/API smoke.
  - Evidence: 2026-10-23 pass: disposable PostgreSQL17.9 private Unix socket, schema applied only there, built server returns69 scenarios with69 unique keys and API404 JSON; CSP/HSTS/nosniff/no-store verified. No production migration executed.
- [x] V-008 [status:verified] Independent final dependency crosscheck and schema regression.
  - Evidence: 2026-10-23 pass: OSV472 distinct locked name/version pairs0 advisory matches; CycloneDX SBOM regenerated outside Git; schema regression2/2. Full-suite rerun remains G-003.
- [x] V-009 [status:verified] Concurrent legacy startup/data-retention smoke.
  - Evidence: 2026-10-23 pass against disposable PostgreSQL only:69 unkeyed fixtures, two concurrent transactions restore69 keys, create0 rows, preserve all69 IDs; repeat returns0 changes. Public pre-release69 rows have exact matching fingerprints; no destructive production operation.
- [x] V-010 [status:verified] Final synchronized production-build browser/runtime checks.
  - Evidence: 2026-10-23 pass reported by Replit for mergebe101a7 including925d512; code/lock parity except retained python-base module, Node22.23.4 build/preview/test,17 tests, npm0/0, OSV472/0. Six desktop/mobile-language combinations complete first10-message shift, feedback/cues/summary/dashboard and recovery100/100. Independent local mobile checks pass390px and320px for long translations. Actual public checks remain Q-008.
- [x] V-011 [status:verified] Actual public deployment and end-to-end/data verification.
  - Evidence: 2026-10-23 pass: Replit publish success; direct publicJS/CSS byte comparison, CSP/HSTS/nosniff/no-store/JSON404,69 preserved IDs and69 distinct keys. Replit public desktopEnglish/mobileLatvian/Russian complete10-message shifts and recovery100/100; independent browser verifies initial rail, progression and Delete safe/+10 with no application errors. External font error tracked in F-014. Exact runtime minor/patch and backups remain F-008.
- [x] V-012 [status:verified] Final font/zoom patch local regression pass.
  - Evidence: 2026-10-26 pass on Node22.23.4: npm run check, npm test17/17, i18n validation, production build, full/production audits0; corrected Google Fonts requestHTTP200. Loaded-font hosted responsive/public checks remain Q-009.
- [x] V-013 [status:verified] Font delivery/zoom and independent advisory refresh.
  - Evidence: 2026-10-26 pass: Replit preview confirms all four fonts loaded, combined stylesheet/font requests200, no ORB/failed requests and200% mobile zoom. Current OSV472-pair query0. Responsive acceptance deliberately fails separately under F-015; font success is not layout sign-off.
- [x] V-014 [status:verified] Responsive source review and final integrated local regression pass.
  - Evidence: 2026-10-26 pass:251bc67 reviewed across all eight TSX files, no behavior/security/data changes; integrated without the hosting-only Python module. Local final17 tests/typecheck/i18n/build/npm full0/production0 pass after accessibility refinements. Replit baseline nine loaded-font viewport/language combinations, nine full shifts and36 recovery drills pass.
- [x] V-015 [status:verified] Canonical main parity and focused final accessibility checks.
  - Evidence: 2026-10-26 pass: mainffb6eb9 synchronized as Replit0efc823, exact tracked parity except approved Python hosting module; history/review branch retained. Final production build Node22.23.4/guard unchanged. Six EN/LV/RU x320/390 short-screen checks pass for filters, timestamps, cues, confidence scrolling/keyboard; no overflow or request/console/ORB errors. Existing nine shifts/36 drills reused, not redundantly rerun.
- [x] V-016 [status:verified] Final actual-public publication and artifact/data/accessibility smoke.
  - Evidence: 2026-10-26T15:40:11Z pass: publish successc5742419; publicJS SHA256d4f89a6390e3cb9fedff01b70fa9b690c177a3600db73003e35205119c6fc491 andCSSdd67568eb48fac103a7ae7e051842100038892904decd0009970db6e7ab0fea8 byte-match localffb6eb9 build; corrected font/zoom metadata,69 preserved original IDs/unique keys, JSON404/CSP/HSTS/nosniff/no-store confirmed. Replit actual-public320pxRU landing/training passes after four fonts load; all five filter names/four gated actions present, requests200 and no ORB/console/page failures. Build metadata identifies0efc823. No further source changes.

## Residual Risks
- [ ] R-001 [status:blocked] Provider backup/restore evidence, historical exposure, host/edge/device coverage and exact production Node-version string remain unverified.
  - Owner: deployment administrator/device owner. Closure: backup timestamps/retention/restore evidence, exact runtime/trust/provider security configuration and historical logs from October17 onward. Application release/revision/public behavior and patched-Node guard verified; production replica reports PostgreSQL16.15. These platform/history limits do not undo the completed application deployment, and no risk acceptance is inferred.
- [x] R-002 [status:verified] Build-only braces dependency removed rather than risk-accepted.
  - Owner: codex. Evidence: Tailwind4.3.3 migration, final full/production scans0 and passing build/regressions. Modern browser floor documented; final public browser smoke tracked by Q-008.

## Change Log
- 2026-10-26: Complete application releaseffb6eb9 published as0efc823 and actual public artifact/data/security/mobile checks pass. All application findings/fixes closed; F-008/R-001 retain only explicitly unverified platform/history evidence. Final changes after this release are documentation-only receipt updates.
- 2026-10-26: Resumed after stalled browser-emulation call. Rechecked cleanly scoped pending font/zoom patch and current successful hosting status; avoiding the stalled browser path. No new application feature scope added.
- 2026-10-23: Committed/pushed base release b1967c8. Replit merged without discarding prior history (8b18f1d), retained only python-base module difference, verified build/preview Node22.23.4 and completed first shifts/recovery in six desktop/mobile-language combinations. Found two mobile recovery overflows; final patch also prevents duplication of the actual legacy production library. Public deployment remains unchanged until final verification.
- 2026-10-23: Final12-test suite/typecheck/build/i18n pass; full and production audits0. Recreated disposable DB and verified69 scenarios/API controls. Correct Replit connector access restored; app-release work continues with historical infrastructure questions explicitly separate.
- 2026-10-22: User authorized finishing fixes, committing and deployment. Reopened validation gate; created isolated PostgreSQL17.9 cluster on a private Unix socket for actual database smoke; production database remains untouched.
- 2026-10-22: Reused prior evidence, performed compromise precheck, researched current advisories, implemented compatible local fixes and validated them. Production sign-off deliberately remains blocked; safe local audit/remediation/reporting work complete.
