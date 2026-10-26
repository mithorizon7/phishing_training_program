# Security audit and remediation: October 22, 2026

Audit reference date: October 22, 2026, America/New_York. Advisory and scan snapshots were collected that afternoon; execution timestamps are retained in the local evidence. Repository baseline: `c3c0244`, branch `main`, with six pre-existing modified files preserved. This report supersedes March's vulnerability counts; it does not certify the live deployment.

## Final remediation update: October 23, 2026

This section supersedes the October 22 baseline findings and access limitations below. The historical baseline is retained to distinguish initial observations from verified remediation.

| Release check | Final local result |
| --- | --- |
| Runtime | Official Node 22.23.4 archive SHA256 verified; build and tests executed with this runtime. The current workstation default is now 24.22.1; no global runtime was changed by this audit. |
| Dependencies | Full graph and production-only `npm audit --ignore-scripts`: **0 vulnerabilities** on October 23. Tailwind 4.3.3 removes the affected Tailwind 3/braces chain. Zod4.6.7/drizzle-zod0.8.3 remove the independently detected Zod finding; final OSV472 pairs0. |
| Regression checks | Typecheck, all **17 tests**, i18n validation and production build pass after the final code edits. Non-blocking large-chunk and third-party pure-comment annotation warnings remain. |
| Learner correctness | All 69 authored correct actions produce safe positive outcomes. Correct deletion of informational legitimate messages no longer produces a penalty. Duplicate decisions, streak reset and verification-budget regressions pass. |
| CSS migration | Preserved legacy utility semantics, restored button cursor behavior, retained theme configuration and corrected desktop heading line height. Requires modern browsers: Safari 16.4+, Chrome 111+, Firefox 128+. |
| Learner privacy/copy | English, Latvian and Russian landing copy correctly states that refresh/close clears memory-only practice progress. |
| Hosting access | Correct existing Replit app is now accessible through the connector. Public URL: `https://phishing-program--mithorizon7.replit.app`. Before release, its workspace was revision `166a4125b3a00d459dc87ff66ca4d2464f1982b1`, Node 20.20.0, with an existing `.replit` modification. This is not evidence that the new fixes have been published. |
| Deployment | Application fixes committed/pushed as925d512 and published October23 as Replit mergebe101a7. Actual publicJS/CSS match the reviewed build byte-for-byte;69 original scenario IDs preserved,69 unique keys restored, no duplicates. Public desktopEnglish/mobileLatvian/Russian complete shifts and recovery. Final font/zoom polish is tracked separately. No schema migration or record deletion. |

The remaining historical platform, provider-host, credential-exposure and log-retention questions are not resolved by an application deployment. No compromise was confirmed and no unrelated credentials were rotated. A successful app release must not be described as comprehensive infrastructure or incident-response sign-off.

### Publication evidence and remaining limits

Deploymentc5742419-34d2-4d17-831c-bff8f5f7d87b successfully serves `https://phishing-program--mithorizon7.replit.app`. October23 production logs identify mergebe101a7eeee4c997e72f80134f59460744b38016, containing reviewed925d512c6695304dfa87872b7cb8b978dee79641. The preserved hosting-only difference is the existing python-base module. Production startup passed the unchanged patched-Node guard, but logs do not expose an exact version string; preview22.23.4 is not exact production-version evidence. Production read replica reports PostgreSQL16.15. Backup timestamps, retention and restore-readiness evidence and historical infrastructure questions remain unverified.

Public checks confirm application headers, no-store API responses, JSON404, compiled assets and data preservation. Independently observed live onboarding unlocks after three checks, awards correct feedback and advances messages; correct informational Delete now yields safe/+10. Replit's public desktopEnglish/mobileLatvian/Russian runs complete ten-message shifts and recovery100/100 without application failures. An external font stylesheet failure led to a final, separately validated font-loading patch and restoration of browser zoom. October26 hosting status remains success; final polish publication is tracked in the living checklist.

### Loaded-font responsive follow-through: October 26

Correct font delivery exposed previously masked narrow-screen overflow. Review branch251bc67d7c9faea47bc3d4d27a89ddd90b1eedfb corrects landing/header text, training message/inspection/action surfaces, confidence, feedback, summaries and recovery steps without changing learner logic or server behavior. Replit reports all nine English/Latvian/Russian x320/390/1365 combinations pass after fonts load, including nine complete ten-message shifts, keyboard checks and36 recovery drills (four scenarios per combination), with no request/console errors. All four font families load through one valid stylesheet, and200% mobile zoom works.

The source diff was independently reviewed and integrated into main without importing hosting-history changes. Review refinements add localized labels to icon-only channel filters, keep timestamps readable, allow long cue buttons to grow, and bound the confidence panel with scrolling on short screens. The complete local17-test/typecheck/i18n/build suite and both npm audits pass after these final source edits; refreshed OSV472 pairs0. Focused integrated browser checks and final republish are tracked separately before closure.

### Same-day independent advisory update

The initial October 23 OSV crosscheck of 474 locked name/version pairs found **GHSA-mrhx-c7xc-m3w5**, updated that day at 18:30 UTC, for Zod 3.24.2 even while npm audit returned zero. The [reviewed advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) lists versions below 4.6.6; the [maintainer fix](https://github.com/colinhacks/zod/pull/6652) short-circuits oversized constrained collections before element parsing. The active API exposes only three read-only GET endpoints, not attacker-submitted schema validation, and body parsing is bounded. Nevertheless the release upgrades Zod and the matching schema adapter, removing unused form/error adapters rather than treating npm's result as complete coverage. Dedicated tests validate all authored scenario insert schemas and the early oversized-array rejection behavior. The patched graph has472 distinct pairs and zero OSV matches; both new schema tests pass. The complete suite and build are rerun before publication.

### Final data and localization regression fixes

The actual public scenario library contains69 legacy rows without localization keys; each exactly matches an authored scenario fingerprint. Key-only startup insertion would duplicate these rows. Startup now transactionally backfills only their localization keys, preserving IDs and content, and serializes concurrent startups with a transaction-scoped PostgreSQL advisory lock. Disposable PostgreSQL verification with two concurrent startups restored69 keys, created0 rows and preserved all69 IDs; a repeat made0 changes. Three new tests cover legacy/partial/custom libraries and idempotence. This is automatic data backfill, not a schema migration or deletion.

Replit's production-build browser run completed ten-message first shifts, confidence, feedback, cue checks, summaries, dashboard return and recovery in all six desktop/mobile-language combinations (1365x900 and390x844; English/Latvian/Russian). It identified recovery-result action overflow in Latvian/Russian. The final patch stacks/wraps actions, wraps result badges and uses a single semantic training link. Hosted layout rerun and actual publication remain separately tracked. These browser results are connector-reported, not a claim of independent local mobile observation.

## Historical baseline: October 22 release decision

1. Deployment administrator: establish access to the actual Replit deployment before promoting this change. The configured Node 20 module was obsolete; the production runtime and database patch level could not be inspected. Verify Node **22.23.4 or a newer patched 22.x**, including its trust bundle, in both build and running service. Repository settings alone do not update a running process.
2. Repository maintainer: the full dependency graph still has **seven high-severity audit entries** from the unpatched `braces@3.0.3` chain used by Tailwind 3. Keep builds on trusted source/configuration and away from production secrets. Move to a verified fixed CSS toolchain with visual regression testing, or consume a verified compatible backport when published. No compatible Tailwind 3 fix was available in registry metadata: latest 3.x was 3.4.19, still in the affected range. A blind Tailwind4 upgrade would change the supported-browser floor to Safari16.4/Chrome111/Firefox128 and has documented utility/preflight changes; preserving learner access requires an agreed browser matrix and visual checks. See the [maintainer migration guide](https://tailwindcss.com/docs/upgrade-guide).
3. If this project or any shared credentials were on Railway, follow the credential response below immediately. Repository evidence points to Replit, so Railway exposure is **unverified**, not a finding of compromise.

**Locally verified:** production dependency audit is 0; typecheck, production build, i18n validation and eight security regression tests pass on isolated Node 22.23.4. **Verified in production:** none of these changes. Production sign-off remains withheld pending deployment/database/log evidence and a disposition for the build-chain vulnerability.

## Prior work reused

| Previous work | Current evidence and disposition |
| --- | --- |
| March non-throwing error middleware, bounded rate-limit map, headers | Present on inspection; retained intent and strengthened ordering, configuration validation, error handling and logging. |
| March auth host validation | Present, but review found its arbitrary-host fallback was still permissive. Removed fallback; no claim that the earlier host protection was complete. |
| Accurate assignment deletion result | `server/storage.ts` still returns deleted-row-derived success. No reason to repeat that change. |
| Uncommitted scenario localization, streak, assignment launch, recovery keyboard and seed repair fixes | Preserved. Typecheck/build/i18n were rerun because dependencies and server code changed. No repeated onboarding redesign. |
| March zero-vulnerability npm scan | Historical only. A new scan was necessary: it found 23 entries. |
| Earlier failed database smoke | `DATABASE_URL` remains absent. Did not repeatedly start the full server against an unprovisioned database. Tested request controls independently. |

No forced audit fix, lockfile deletion, production deployment, credential rotation, account change, or global tool installation was performed. Work remained in the existing checkout to preserve its uncommitted work; no commit or push was made.

## Asset and access inventory

| Asset | Observed state | Coverage |
| --- | --- | --- |
| Source | React 18.3.1 / TypeScript 5.6.3 / Express / Drizzle / PostgreSQL, npm lockfile v3 | All application entrypoints, routes, SQL construction, build config and installed metadata reviewed. |
| GitHub | Public `mithorizon7/phishing_training_program`, default `main`; homepage `https://replit.com/@mithorizon7/Phishing-Program-Design` | Authorized `gh api` reads succeeded. No GitHub Deployments and zero Actions runs were returned. No CI workflow/container/devcontainer files in repository. These absences do not exclude external CI. |
| Hosting | `.replit` autoscale, port 5000, PostgreSQL 16 module | Connected Replit searches by phishing/Inbox and exact homepage URL returned no accessible app. App ID, public serving URL, build/runtime versions, previews and deployment logs remain unavailable. |
| Node | Local default v22.12.0; repository selected nodejs-20 | Patched repository pins/module/start controls. Tests used a separate verified Node v22.23.4 archive under `/private/tmp`; system runtime untouched. |
| Dependency graph | Before: 577 lockfile package records including root; after: 587 including root | All installed package versions match lockfile; platform/optional entries included in lockfile audit. Only installed platform binaries were exercised. |
| Runtime integrations | Active backend exposes only GET scenarios and published assignments | Anonymous training progress lives in React memory. No active instructor writes, auth/session endpoints, webhooks, uploads, AI tools, MCP endpoints or custom production WebSocket server found. |
| Dormant auth | Replit OIDC, Passport, PostgreSQL sessions remain in source | Not imported by `server/routes.ts`. Hardened fallback and TTL; live login/session behavior not tested or enabled. |
| Database | `pg` Pool uses `DATABASE_URL`; absent locally | Server version, extensions, TLS mode/CA, roles, exposure, backups and logs unverified. No RLS/tenant claim is made. |
| Edge/network | HTTP server uses Node `http.createServer`; Vite HMR only in development | No application QUIC/HTTP3 implementation. Provider HTTP3 termination, DNS, host kernel, WAF and network appliances unverified. |
| Project Python/Bun/containers | No requirements/pyproject/venv, Bun lockfile, Dockerfile, image references or Compose manifests | Not used by repository build/runtime. External gateways and historical containers remain unverified. No Docker/Bun/uv executable found on this shell PATH. |
| Workstation/tooling | macOS 26.6.2; Chrome 155.0.8059.85; Safari 26.6.2; original npm 11.8.0; isolated validation npm 10.9.9 | Read-only inventory. System trust state, desktop app embedded Electron/Chromium and all global tool environments were not comprehensively audited. Device actions below require their owner. |

## Compromise precheck and secret review

Before running builds/tests, inspected manifest/lockfile and installed-package metadata using `/usr/bin/python3 -I -S` (isolated, no site initialization). No project LiteLLM/Python dependency, suspect artifact digest, `cook.pth`, remote loader reference or marker was found in the checked locations. Inspected four existing lifecycle packages: bufferutil, es5-ext, esbuild and fsevents. Registry artifacts all resolve to `registry.npmjs.org`; no git/HTTP/private-registry tarball sources appeared. Dependency updates used `--ignore-scripts`. Existing native binaries were not rebuilt from unreviewed scripts.

Reviewed 334 unique Git blobs across all available refs with a redacting pattern scan, 17 applicable project text/metadata files and 11 retained npm log files. Then ran **Gitleaks 8.30.1** against all Git refs and the working directory. Working-directory scan returned zero candidates. History returned one `generic-api-key` candidate at commit `620c8c1b3b`, `client/src/lib/localize-scenario.ts:5`: inspection established it is an i18n-key variable expression referencing `scenario`, not a credential. It was not suppressed globally. No confirmed credential leak or compromise evidence was found in this coverage.

One accessible same-day Codex trace associated with this project was checked for GitHub/provider credential formats: zero matches. Accessible Codex/Claude configuration contained no LiteLLM/gateway reference. These checks do not establish historical gateway routing or cover missing sessions, third-party gateway logs, cloud audit events, deleted caches or old container artifacts.

Read [LiteLLM's incident notice](https://docs.litellm.ai/blog/security-incident-oct-21-2026), [StepSecurity's original analysis](https://www.stepsecurity.io/blog/litellm-1-107-0-compromised-pypi-backdoored-wheels-credential-stealer) and [Wiz's observations](https://www.wiz.io/blog/litellm-compromised-steals-credentials). Artifact exposure windows and response requirements are in the baseline matrix. No attacker infrastructure was contacted. No suspect artifact was executed or evidence deleted.

Sensitive scanner outputs are outside git in `/private/tmp/phishing-security-20261022`, directory mode 0700. They are local temporary evidence, not durable incident storage; copy them to an access-controlled incident store if an investigation is opened. No private code was uploaded to a scanning service. npm advisory requests send dependency names/versions; Gitleaks and source review run locally.

## Prioritized findings

Severity below distinguishes dependency advisory rating from demonstrated application exploitability. Owners named here are responsible for remaining steps; listing an owner does not imply their acceptance of risk.

| Priority / advisory | Asset and exact observed version | Conditions and evidence | Remediation / owner / status |
| --- | --- | --- | --- |
| P1: October Node release, including CVE-2026-111497 | Default local Node 22.12.0; configured nodejs-20 | Old runtime and trust bundle confirmed; production runtime unknown. Brotli reachability depends on decompression paths. No remote-code-execution test attempted. [Node advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases). | Pin >=22.23.4 <23, `.nvmrc`, `.node-version`, engine enforcement and guarded build/start; Replit module nodejs-22. Local isolated validation passes. Maintainer must update own runtime; deployment admin must verify/redeploy. |
| P1: build-chain DoS, CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm | braces 3.0.3; Tailwind 3.4.17; chokidar 3.6.0; micromatch 4.0.8; fast-glob 3.3.2; dependent typography/animation plugins | Deeply nested attacker-controlled patterns may exhaust the compiler stack. Repository uses fixed trusted content paths; application receives no glob patterns. Dev/build installation still contains vulnerable code. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). | Seven remaining audit entries share this chain. Moved compiler-only animation plugin to dev dependencies; production-only graph now 0. Full remediation remains open: maintainer to migrate CSS toolchain with screenshots or adopt verified upstream patch. No risk acceptance inferred. |
| P1 dependency rating critical: CVE-2026-90711 | proxy-addr 2.0.7 -> 2.0.8, Express 4.22.1 -> 4.22.3 | Requires susceptible trust-subnet configuration; active anonymous app does not enable `trust proxy`. [Maintainer/GHSA](https://github.com/advisories/GHSA-jqcg-44mw-7w3h), [OSV](https://api.osv.dev/v1/vulns/GHSA-jqcg-44mw-7w3h). | Patched lockfile/installed copy. codex: remediated locally, deployment pending. Not evidence of IP spoofing against production. |
| P1 dependency rating high: CVE-2026-39356 | drizzle-orm 0.39.3 -> 0.45.4 | Identifier escaping weakness; current routes use static identifiers and parameterized values. No attacker-supplied identifier path found. [Maintainer/GHSA](https://github.com/advisories/GHSA-gpj5-g38j-94v9), [OSV](https://api.osv.dev/v1/vulns/GHSA-gpj5-g38j-94v9). | Patched and typechecked with drizzle-zod 0.7.0. codex: remediated locally; live DB operations not validated. |
| P1/P2 dependency advisories | ws 8.19.0 -> 8.22.0; Vite 5.4.21 -> 6.4.5 | ws disclosure/DoS and Vite file-access/editor/middleware issues; primarily development surface here. [ws memory disclosure](https://github.com/advisories/GHSA-58qx-3vcg-4xpx), [ws DoS](https://github.com/advisories/GHSA-96hv-2xvq-fx4p), [Vite](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22). | Patched; Vite host allowlist and secret-file deny patterns tightened. codex: local build passes; actual Replit preview must be checked. |
| P2: sensitive logging | server/index.ts and reachable route catch blocks | Previous logger serialized full JSON responses; exception messages/stacks may contain secrets or submitted data. No actual leaked credential demonstrated. | Removed response capture/raw exception logging. Log route templates, method/status/duration; generic request errors. Regression tests pass. codex: remediated locally. Existing production logs unverified. |
| P2: weakened request controls | server/index.ts | Zero/negative configuration disabled limits/bounds; parsing preceded rate controls and headers. Malformed requests could skip security headers. | Strict bounded positive-integer defaults; controls before parsing; bounded map; no-store API responses; safe error normalization; production CSP. Regression suite passes. codex: remediated locally. Per-instance rate controls still need edge/provider review. |
| P2: dormant auth fallback and TTL | server/replit_integrations/auth/replitAuth.ts | Empty allowlist accepted a bounded number of arbitrary hosts; session-store TTL supplied milliseconds to an API expecting seconds. Not reachable in current app. | Reject unconfigured production auth hosts; preserve loopback ports/IPv6; canonicalize approved HTTPS origins; bound registered strategies; correct one-week store TTL. codex: source/typecheck and origin regression verified. Before enabling auth, test complete login/logout/refresh flow. |
| P2: missing environment evidence | Actual deployment, PostgreSQL, historical gateways, underlying hosts | No accessible Replit app, live URL, database or October service/cloud logs. This is a coverage gap, not proof of vulnerability or compromise. | Deployment administrator to supply access and complete the checklist below; production sign-off blocked. |

Other targeted fixed versions: body-parser 1.20.9, path-to-regexp 0.1.13, PostCSS 8.5.31, source-map-js 1.2.2, lodash 4.18.1, qs 6.16.1, brace-expansion 2.1.7, picomatch 2.3.2 on its 2.x branch (Vite retains 4.0.7), postcss-selector-parser 7.1.7, nanoid 3.3.20, yaml 2.9.1, Babel core 7.29.7, browserslist 4.29.4. Full advisory IDs/ranges and paths are in protected npm scan JSON. These were selected from the scan, not a blanket major upgrade. Vite 5 -> 6 and Drizzle 0.39 -> 0.45 were necessary compatibility changes; build/typecheck pass, but live database and browser regressions remain to be checked.

## Mandatory incident baseline applicability

Use the following dispositions only within the stated asset boundary. A repository non-match cannot clear an appliance, provider host or old environment.

| Baseline | Disposition and evidence | Current primary guidance / exact next check |
| --- | --- | --- |
| A. PHP, CVE-2026-109618 / 109619 | **Not applicable to repository runtime:** Node/TS only, no PHP/Composer files or serving binary configured. **Unverified:** provider/appliance embedded PHP and historical requests. | [PHP](https://www.php.net/), [CERT-EU](https://cert.europa.eu/publications/security-advisories/2026-018), [AWS history](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/), [AWS bulletin](https://aws.amazon.com/security/security-bulletins/2026-143-aws/). October 21 patches: 8.2.35/8.3.36/8.4.27/8.5.12. Obtain host/appliance SBOM and logs from October 17 onward. [Palo Alto](https://security.paloaltonetworks.com/CVE-2026-109618) assesses PAN-OS/Panorama availability impact; do not extrapolate proven upstream RCE to those products. |
| B. Node, all ten October issues | **Remediated locally, deployment pending:** isolated validation 22.23.4; machine default remains 22.12.0. Configured Node 20 replaced, actual deployment unknown. | [Advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), [22.23.4 release](https://nodejs.org/en/blog/release/v22.23.4), [support status](https://nodejs.org/en/about/previous-releases). Fixed October 21: 22.23.4/24.22.1/26.12.1. Verify every build/worker/runtime, not just package.json. Ten-item detail below. |
| C. Bun | **Not applicable to configured repository tooling:** npm/Node only; no Bun executable on PATH. **Unverified:** external builders/compiled tools. | [Bun 1.4.4](https://bun.com/blog/bun-v1.4.4) retrieved via curl after browser fetch failed. Release confirms broad security fixes, but gives no specific emSign/QPACK assurance. If discovered elsewhere, verify those fixes individually; do not expose affected HTTP3 services based solely on this release summary. |
| D. Railway | **Unverified:** no repository linkage; accessible GitHub homepage identifies Replit. No account-wide Railway inventory requested or modified. | [Disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st), [status](https://status.railway.com/). At checked status update October 22 16:14 UTC, Pro/Enterprise builds normal, Hobby/Free/Trial restoration still pending. API tokens invalidated October 22 04:17 UTC. If used: rotate third-party and registry secrets; verify bucket replacements, GitHub reconnect and running deployments. Revocation of Railway tokens alone is insufficient. |
| E. LiteLLM compromise | **Not applicable to current project dependency graph; historical/shared environment exposure unverified.** Static metadata, retained npm logs and project trace/config checks found no indicator. No image digests/history available. | [Vendor](https://docs.litellm.ai/blog/security-incident-oct-21-2026): malicious wheels 1.107.0 on October 21 11:39:51-13:23 UTC; image index `sha256:1bbcb1443bc962e45f5aad53fe3d2c30600e0379715fb6c664cdd3ac126c339e`, floating latest/main tags 11:46:56-14:20 UTC (GHCR removed by 13:51). Vendor recommends explicit pre-incident 1.106.2; clean source tag does not clear wheel/image exposure. Check historical pulls/installs/gateway routing, logs and cloud audit. Follow conditional incident response below. |
| F. eMudhra/emSign trust | **Remediated for isolated validation Node; deployment and workstation bundles unverified.** Node 22.23.4 uses updated trust roots; root inspection found no compromised emSign ECC G3 root. Unaffected G1 remains; removing every emSign root would be incorrect. | [Python guidance](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576), [uv](https://github.com/astral-sh/uv/security/advisories/GHSA-hq85-5cpj-mr62), [certifi](https://github.com/certifi/python-certifi/security/advisories/GHSA-6q48-6c7w-9gw2), [Mozilla](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/). Python baseline pip>=26.2.2, uv>=0.13.4, certifi>=2026.10.19 (advisory patch 2026.10.18, later compatibility guidance .19). No project Python environment to update. Inventory actual bundled/system/custom roots, not only OS updates. |
| G. GitLab CVE-2026-110264 and release set | **Not applicable to repository Git hosting:** remote is GitHub, no GitLab runner/config found. **Unverified:** external self-managed services. | [GitLab October 21 patches](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-5-1-released/): 19.5.1/19.4.3/19.3.6/19.2.9/19.1.9/19.0.10/18.11.13. Owner must identify any shared instance/runners and follow its branch upgrade path. |
| H. Java/GraalVM and Oracle | **Not applicable to repository language/runtime/dependencies. Unverified:** provider/shared infrastructure. | [October 21 alert](https://www.oracle.com/security-alerts/alert-cve-2026-91403.html), [October 20 CPU](https://www.oracle.com/security-alerts/cpuoct2026.html). Obtain actual JDK distribution/build and product inventory; apply distribution-specific fixes if present. |
| I. BIND / Unbound | **Not applicable to application dependencies. Unverified:** provider/local recursive and authoritative DNS. | [BIND matrix](https://kb.isc.org/docs/aa-00913): October 21 CVE-2026-19630/94300/96888/97313 fixed in 9.20.30 for that branch; use matching vendor branch/backport. [Unbound](https://nlnetlabs.nl/projects/unbound/download/): 1.26.2, October 21, fixes CVE-2026-97206/50106/96405/109125/35501. Owner must inventory resolvers and verify deployed package/backport status. |
| J. Cisco, Splunk, Fortinet | **Unverified infrastructure:** no products configured in repository, which does not exclude network appliances. | [Complete Cisco October 21 set](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-notice-QGwHnJ6k) covers Snort3, Expressway/UC, IOS XR and Secure Client; [Splunk](https://advisory.splunk.com/) lists SVD-2026-1010/1011/1012. [Fortinet](https://www.fortinet.com/blog/ciso-collective/fortinet-releases-security-hardening-release-for-multiple-products) mandates October 22 upgrades; use each firmware branch and availability table, including recent FortiMail/FortiAuthenticator. Separate these from PHP assessment and legacy Cisco Smart Install. Administrator must confirm models, running firmware, supported path and manual/cloud update status. |
| K. HTTP3/QPACK | **Not applicable to Node HTTP1 app termination. Unverified:** Replit edge/CDN, local tooling and provider QUIC. | [Original Header Accordions research](https://foxio.io/blog/header-accordions-qpack-amplification-attacks-against-http-3-servers), October 20: quic-go>=0.57.0, quiche>=0.29.3, lsquic>=4.9.0; Bun/h3/aioquic had distinct status. Get edge library/version or provider mitigation evidence; do not infer all HTTP3 implementations vulnerable or Bun fixed. |
| L. Linux/Atlassian/BeyondTrust | **Unverified provider/shared services:** local host is macOS; container/kernel/SaaS records unavailable. | [Red Hat](https://access.redhat.com/security/cve/cve-2026-99999), [Ubuntu](https://ubuntu.com/security/CVE-2026-99999), [Atlassian October 20](https://confluence.atlassian.com/security/security-bulletin-october-20-2026-1874690162.html), [BeyondTrust BT26-05](https://www.beyondtrust.com/trust-center/security-advisories/bt26-05). Linux disclosure October 15; verify host backports and reboot/livepatch separately from guest images. BeyondTrust CVE-2026-102764 disclosed October 15, SaaS patched October 9; self-hosted must apply vendor patch/upgrade. |
| M. Cloud Shell/WebSockets | **No repository dependency fix needed:** no Cloud Shell integration or privileged WebSocket tunnel in active app. Vite HMR is development-only and updated. Historical Cloud Shell usage unverified. | [Google release notes](https://docs.cloud.google.com/shell/docs/release-notes) confirm July 28 Origin/port-list remediation for CVE-2026-85267 and no customer action. October 22 disclosure is not the patch date. No blanket Google token revocation prescribed. |
| N. Broader stack/devices | **Application graph checked and locally patched; platform/device coverage incomplete.** PostgreSQL16 configured but exact server version unknown; no .NET, Java, Go, Rust, Signal/RingRTC package or browser automation dependency in project. | [PostgreSQL security](https://www.postgresql.org/support/security/), [Apple](https://support.apple.com/en-us/100100), [Chrome](https://chromereleases.googleblog.com/), [NVD RingRTC reference](https://nvd.nist.gov/vuln/detail/CVE-2026-113380). Browser page for NVD returned no record text, so RingRTC details were not independently confirmed. Review real provider/native/desktop versions, not inferred ones. No Bluetooth-wide instruction adopted. |

### All ten Node issues

The configured production Node 20 line is EOL and cannot be cleared from a supported-lines-only affected-version table. The table below applies to the observed **22.12.0** validation host; upgrading its isolated project runtime to **22.23.4** covers the applicable listed fixes.

| CVE | Issue / applicability to Node 22 |
| --- | --- |
| CVE-2026-105482 | DNS NUL truncation: affected line; resolve input reachability not demonstrated. |
| CVE-2026-105483 | Fullwidth-digit TLS hostname bypass: vendor lists 24/26, not 22. |
| CVE-2026-106069 | Loosely resolving IP TLS bypass: affected line; relevant to outbound TLS clients. |
| CVE-2026-111497 | Brotli out-of-bounds write/RCE: affected line; runtime patch required irrespective of npm scan. |
| CVE-2026-105481 | Keep-alive response ordering: affected line. |
| CVE-2026-106072 | Noncanonical IPv4 certificate validation: affected line. |
| CVE-2026-106074 | Snapshot/SEA random-cache reuse: affected line; repository has no SEA/user snapshot build. |
| CVE-2026-106070 | ZipFile invalid header prefix: vendor lists 26 only. |
| CVE-2026-106071 | Permission wildcard overgrant: vendor lists 26 only. |
| CVE-2026-106073 | realpathSync permission bypass: affected line; no permission-model security boundary configured here. |

### Advisory catalogs and dates

npm bulk advisories/GitHub Advisory Database supplied exact dependency ranges. An independent OSV querybatch covered all **566 distinct locked package/version pairs**, including platform/optional entries, and found only `braces@3.0.3` / GHSA-vfj7-8cjw-p6xm in the final graph. Independently fetched OSV records for Drizzle and proxy-addr; their publication timestamps are April 8 and October 5 respectively, so these are older unresolved issues newly addressed, not October 21 discoveries. Vite's reviewed advisory was published October 6. Vendor sources above distinguish disclosure, release and incident dates.

CISA KEV JSON retrieved October 22 had `dateReleased=2026-10-21T14:04:39.8983Z`, 1,754 entries. Cross-checked every explicit CVE in the supplied baseline, all ten Node CVEs and the identified Drizzle/proxy-addr/braces CVEs. BT26-05's CVE-2026-102764 was listed, added October 16. This is a timestamped catalog observation, not a claim that unlisted items are unexploited. AWS independently reports PHP activity on October 17. Refresh KEV/provider guidance again before production work.

## Application review results

Reviewed all three reachable API handlers and production/development server setup. Published-only assignment filtering exists on both list and detail reads. No mutation/admin endpoints are mounted; instructor UI source and authentication integration are dormant. SQL uses Drizzle parameter interpolation and static identifiers; no reachable raw SQL/command/template sink was found. Training messages and URLs render as React text; the generic chart helper's style-generation sink is not imported by the active app. No SSRF, upload, webhook, deserialization or tool-execution path was identified in the reachable app. These findings do not extend to unknown deployed source changes.

Added a production CSP compatible with the existing Google Fonts stylesheet/font origins, same-origin scripts/connections, React inline styles and image use. Development intentionally omits the production CSP so Vite can work. Production builds now exclude the Replit runtime-error overlay. Unknown `/api` endpoints return JSON 404 instead of falling into the SPA. Headers/rate controls precede parsing; API data is no-store; rate identity ignores untrusted forwarding headers by default. Behind a shared proxy, local limiting may group users by proxy address; administrator must establish trusted proxy topology and edge limits before changing that default.

Database permissions, public exposure, TLS authentication, RLS and live tenant isolation were not tested without a database. Training answers exposed by public scenario reads are intentional for this anonymous practice application, not a server-enforced assessment boundary. Do not use client-held progress as authoritative certification records.

## Validation and reproducibility

| Check | Result |
| --- | --- |
| Official Node archive integrity | SHA-256 matched official SHASUMS: `c9e1dbc748b33ed2d14f42445191ecaf14c56259c7a9a26d0042c49ec2b66428` (darwin-arm64 22.23.4). TLS verification retained; no system trust changes. |
| Gitleaks artifact integrity | SHA-256 matched GitHub release digest: `b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5`; scanner v8.30.1. |
| `npm audit --ignore-scripts --json` | Before: 23 (1 critical/16 high/4 moderate/2 low). Final: 7 high, all build-chain entries described above. |
| `npm audit --omit=dev --ignore-scripts --json` | Final: 0 vulnerabilities. This graph excludes build tooling; Replit full build installs still contain it. |
| Installed/lock consistency, lifecycle/source inspection | No installed version mismatches; same four lifecycle package families; no non-npm registry source. |
| `npm sbom --sbom-format cyclonedx` and OSV querybatch | SBOM retained outside git; all 566 unique locked package/version pairs checked; only remaining braces advisory returned. |
| Gitleaks all-ref Git + directory scan | One historical i18n-expression false positive triaged; no confirmed secrets. Directory: zero candidates. |
| `npm run check` | Pass on patched Node after dependency/security changes. |
| `npm run test:security` | 8/8 pass: auth-origin restrictions including ports/IPv6; positive defaults; malformed/oversized headers; rate-before-parse; spoofed forwarded headers; safe logs; generic errors; non-Error values. |
| `npm run build` | Pass on Node 22.23.4, Vite6.4.5 and Drizzle0.45.4. Existing PostCSS `from` and >500KB chunk warnings remain. |
| `node --import tsx scripts/i18n-validate.ts` | Pass. |
| Old-runtime guard | Default local Node22.12.0 correctly rejected. |
| Browser/DB/production smoke | Unverified: no configured DB or accessible serving URL. No claim of full end-to-end coverage. |
| Living audit checklist | Structural validation passes with zero warnings/errors. `--require-signoff` correctly fails on the open build-chain and deployment findings; production gates were not checked off. |

Initial network requests and loopback binding were sandbox-blocked; repeated with approved network/loopback access. `tsx` CLI required an IPC socket under the sandbox, so scripts now use the supported `node --import tsx` loader. Final successful tests ran after the fixes. No test failures were hidden by relaxing controls.

Reproduce after selecting the patched runtime (system/runtime installation changes are the owner's action):

```sh
nvm install 22.23.4
nvm use
node --version
npm ci --ignore-scripts
npm run check
npm run build
npm run test:security
node --import tsx scripts/i18n-validate.ts
npm audit --omit=dev --ignore-scripts
npm audit --ignore-scripts
```

The final full audit deliberately exits nonzero until the build-chain issue is resolved. Review lifecycle requirements for any new native package before selectively rebuilding it. `--ignore-scripts` is for installs, not an instruction to skip explicit validation commands.

## Production/deployment checklist (administrator; not executed)

- [ ] Identify live Replit app, custom domains, staging/previews/old deployments, workers/schedules and any secondary host. Confirm account access and map each to repository revision. Replit homepage from GitHub is `https://replit.com/@mithorizon7/Phishing-Program-Design`; connected access currently cannot resolve it.
- [ ] Capture existing deployed SHA/runtime/image/base, settings and rollback identifier in protected evidence. Determine whether any production source differs from this checkout.
- [ ] Confirm build AND runtime Node version, OpenSSL version and trust store from the provider shell: `node -p 'JSON.stringify({node:process.version,openssl:process.versions.openssl})'`. Ensure patched22.x meets this repository's guard. The Replit major-module selection alone is insufficient.
- [ ] Rebuild from reviewed lockfile with clean dependency caches; only approved lifecycle code. For a provider image, obtain a maintained base digest and host patch evidence; no repository Dockerfile exists to update. Keep build source trusted and credentials scoped while Tailwind residual remains unresolved.
- [ ] Ensure production uses `npm run start`/production server, not `npm run dev`; no Vite HMR/editor or runtime-error overlay should be served. Set exact `DEV_ALLOWED_HOSTS`/`REPLIT_DOMAINS` for private previews where needed, never a blanket host allow.
- [ ] In PostgreSQL's provider SQL console, run `SELECT version();` and review its branch/vendor security fixes; verify database role, public networking restrictions, encrypted authenticated transport, extensions, backup/restore and connection limits. Do not paste database URLs or passwords into audit output. No schema push is required by this patch.
- [ ] Review provider edge HTTP3/QUIC library status, proxy topology, WAF/global limits and managed Linux host kernel/backports/reboot state. Do not set `trust proxy=true` merely to obtain client IPs.
- [ ] Retain/review application, build, database, provider access and cloud audit history from at least October17 through remediation; extend to earlier periods if findings warrant. Current audit had no such log access or retention guarantee.
- [ ] Approve deployment only after documenting the Tailwind issue's remediation or explicit risk decision. Deploy once with current secrets; validate running SHA/version and verify `/`, `/dashboard`, first training shift, recovery, language switching and mobile/keyboard flow against the actual database.
- [ ] With `SITE_URL` set to the confirmed origin, inspect benign responses: `curl -I "$SITE_URL/"`, `curl -I "$SITE_URL/api/scenarios"`, `curl -i "$SITE_URL/api/not-a-route"`. Confirm CSP/HSTS/nosniff/no-store, JSON404 and absence of dev endpoints. Do not send exploit payloads to production.
- [ ] Rollback: select the previous provider deployment only if its runtime and credentials are still acceptable. If it is vulnerable, forward-fix on the patched runtime rather than restoring it blindly. Restore configuration from protected snapshot; no DB migration rollback is needed. Check service/error metrics and credential consumers after either action.

## Conditional credential and incident response

No confirmed secret exposure or compromise was identified in accessible project evidence. Do not rotate unrelated accounts based on a package-name non-match or a news headline. The following applies if deployment ownership/history establishes exposure; production actions need coordinated owner authorization.

- [ ] Railway owner: inventory environment-variable **names and issuing services**, environments, references and private registries, without exporting values. Identify shared consumers before rotation. Review account/service/build logs and provider usage/billing; record retention gaps.
- [ ] Revoke and reissue Railway API tokens invalidated at 04:17 UTC October22, update affected CI/CLI/integration consumers. Independently rotate each third-party database/provider/registry secret at its issuer, update references in all environments and verify old secrets fail. A changed environment value does not revoke the old credential.
- [ ] Follow Railway's [bucket/GitHub guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset): confirm regenerated bucket credentials, reconnect GitHub as directed, redeploy consumers once tier permits, and verify running deployments actually use replacements. At audit snapshot Pro/Enterprise available; recheck status for other tiers. Do not infer rotation is complete from platform token revocation.
- [ ] LiteLLM owner: preserve install/build records, image indexes/digests and the vendor UTC windows. If affected wheels/images executed, preserve hashes/timestamps, isolate outbound access with operations approval, stop using exposed agent sessions, and recover on trusted clean hosts/images. Do not start Python/pip in a suspect environment or put replacement secrets on it. No automatic deletion of evidence.
- [ ] If LiteLLM exposure is confirmed, inventory/revoke reachable cloud roles/temporary credentials, provider keys, database/master/virtual keys, GitHub CLI OAuth tokens, SSH/GPG material, browser sessions and agent/MCP credentials. A package version replacement alone is insufficient. Coordinate credentials shared with other projects.
- [ ] Examine gateway prompts/responses/log access for leaked tokens and unexpected users. Review AWS CloudTrail `GetCallerIdentity`, Bedrock/model discovery and IAM enumeration plus GCP/provider events from October21 onward, including use outside normal infrastructure. Include access and billing anomalies, not only application logs.

## One-time workstation/account/network checklist (outside repository changes)

- [ ] Device owner: update/select patched Node for this project with the commands above. Default Node22.12.0 remains installed; temporary validation runtime is not a machine-wide repair.
- [ ] Inventory Python, pip, uv, certifi, Java, Go, Rust/webpki and Bun only where actually installed/used, including bundled app environments. Precheck LiteLLM startup hooks before launching any suspect Python. Follow vendor trusted bootstrap and do not disable TLS verification.
- [ ] Verify macOS/Safari and Chrome security updates/revocation state using [Apple releases](https://support.apple.com/en-us/100100) and [Chrome releases](https://chromereleases.googleblog.com/); observed versions are inventory, not proof of currency. Inspect the running Codex/browser automation host's Electron/Chromium and agent/MCP versions through their own update channels. This audit did not change them.
- [ ] Network/services owner: inventory appliances, DNS, self-managed GitLab/runners, Oracle/JDKs, Atlassian and BeyondTrust; apply the matrix above only to products actually present, using vendor backports/upgrade paths and reboot checks. Ask the managed hosting provider for underlying host/edge evidence.
- [ ] Account owner: inspect security notifications/access history for confirmed provider exposure; make shared-token rotations centrally. Signal/RingRTC applicability requires actual installation/version evidence. No blanket Google-token or Bluetooth action follows from the supplied disclosures alone.

## Confidence and closure evidence

High confidence in observed local versions, fixes, locked dependency results, secret-candidate triage and request-control regressions. Moderate confidence in source-level reachability conclusions because they cover the current checkout, not unknown deployed revisions. Low/unknown confidence in production, historical gateway/image exposure, service compromise status, device trust and provider infrastructure because that evidence was unavailable.

Close the remaining blockers with: accessible live app and deployed revision/runtime; PostgreSQL/provider configuration and patch evidence; October install/build/application/cloud logs and retention statements; historical gateway/container inventory; and a verified fix or explicit owner decision for the Tailwind build chain. No evidence from this audit justifies declaring the whole system safe or incident recovery complete.
