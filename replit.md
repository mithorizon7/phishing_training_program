# Inbox Arena - Phishing Training Platform

## Overview

Inbox Arena is an interactive phishing training platform that simulates realistic inbox triage scenarios. Users play as "Trust & Safety Analysts" processing messages across email, SMS, and call transcripts, learning to identify phishing attacks, BEC scams, and social engineering while building decision-making skills that protect organizations.

The core training loop presents users with 8-12 messages per "shift" where they must choose actions (Report, Delete, Verify, Proceed) and receive immediate feedback with explanations tied to real-world security concepts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with custom plugins for Replit integration
- **Design System**: Material Design influences with professional productivity tool aesthetics (Inter font family)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Authentication**: Replit OpenID Connect integration with Passport.js

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod schema validation
- **Schema Location**: `shared/schema.ts` for shared types between frontend and backend
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Scenarios**: Message library with phishing/legitimate content, difficulty scores, and correct actions
  - 69 total scenarios (44 malicious, 17 legitimate, 8 suspicious-legitimate)
  - Attack families: Phishing, BEC, Wrong-number, Vishing, OAuth, AI-phishing, QR-phishing, Tech-support, Reply-chain hijack
  - 25% legitimate content ratio for discrimination training (avoids paranoid over-reporting)
  - Multi-turn chain support (chainId, chainOrder, previousAction) for progressive scams like pig butchering
- **Shifts**: Gameplay sessions tracking user progress through scenario sets
- **Decisions**: Individual user choices with outcomes and points
- **UserProgress**: Aggregated statistics including accuracy, streaks, badges, and granular metrics:
  - `totalReports` / `correctReports`: Track report action usage and accuracy
  - `totalMaliciousSeen` / `correctMaliciousHandling`: Threat detection rate
  - `totalLegitimateSeen` / `correctLegitimateHandling`: Discrimination accuracy
  - `unsafeActions`: Proceed on malicious (security failures)
  - `highConfidenceWrong`: Overconfident errors for calibration training

### Adaptive Difficulty System
- Uses NIST Phish Scale methodology for scoring scenario difficulty (1-5)
- Progressive unlocking based on learner performance:
  - Shifts 0-2: Max difficulty 2 (basic scenarios only)
  - Shifts 3-5: Max difficulty 3 (if accuracy > 60%)
  - Shifts 6-10: Max difficulty 4 (if accuracy > 70%)
  - Shifts 11+: Max difficulty 5 (if accuracy > 75%)
- 20% challenge scenarios mixed in for stretch learning
- Automatic backfill ensures 10 scenarios per shift even when challenge scenarios unavailable

### Authentication Flow
- Replit Auth via OpenID Connect
- Session-based authentication with PostgreSQL session storage
- Protected routes use `isAuthenticated` middleware
- User data synced to local database on login

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Server dependencies allowlisted for bundling to optimize cold start times

## External Dependencies

### Database
- PostgreSQL (required, configured via `DATABASE_URL` environment variable)

### Authentication
- Replit OpenID Connect (`ISSUER_URL`, `REPL_ID`, `SESSION_SECRET` environment variables)

### Internationalization (i18n)
- **Framework**: i18next with react-i18next and ICU message format
- **Supported Languages**: English (en - source), Latvian (lv - default), Russian (ru)
- **Fallback Chain**: User preference → Browser locale → lv → en
- **Locale Files**: `client/src/locales/{en,lv,ru}.json`
- **Configuration**: `client/src/lib/i18n.ts`
- **Glossary**: `i18n-glossary.md` (locked terms for consistency)
- **Validation**: `npx tsx scripts/i18n-validate.ts`
- **Key Convention**: `feature.screen.element.state` (e.g., `header.dashboard`, `training.actions.report`)

### Frontend Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for date formatting
- embla-carousel-react for carousels
- i18next + react-i18next for internationalization

### Backend Libraries
- passport + openid-client for authentication
- memoizee for caching OIDC configuration
- drizzle-orm + drizzle-zod for database operations