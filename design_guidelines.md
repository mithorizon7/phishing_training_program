# Design Guidelines: Inbox Arena - Phishing Training Platform

## Design Approach

**Design System Approach**: Material Design with productivity tool influences (Linear's clarity + Notion's information hierarchy)

**Rationale**: This is a professional training application requiring efficiency, credibility, and clear information hierarchy. The interface must feel authentic (like a real email client) while providing effective educational feedback.

**Core Principles**:
- Professional credibility over visual flair
- Realistic inbox simulation for skill transfer
- Clear feedback visualization
- Minimal cognitive load during decision-making

---

## Typography

**Font Family**: Inter (primary) via Google Fonts CDN
- Clean, professional, excellent readability
- Supports hierarchy through weight variation

**Type Scale**:
- Headlines (H1): text-2xl font-bold (Progress screens, module titles)
- Section Headers (H2): text-xl font-semibold (Screen titles, "Inbox", "Feedback")
- Message Subjects: text-base font-medium
- Body Text: text-sm font-normal (message content, explanations)
- Labels/Meta: text-xs font-medium (sender info, timestamps, tags)
- Buttons: text-sm font-semibold

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12 for consistency
- Component padding: p-4, p-6
- Section spacing: space-y-4, space-y-6
- Card gaps: gap-4
- Screen margins: p-6, p-8

**Container Strategy**:
- Full-width application shell
- Main content: max-w-7xl mx-auto
- Inbox messages: max-w-4xl for readability
- Sidebars/panels: w-80 (inspection panel)

---

## Component Library

### Core Application Structure

**Navigation Header** (fixed top):
- Logo + "Inbox Arena" wordmark (left)
- Navigation: Dashboard, Training, Progress (center)
- User avatar + notification badge (right)
- Height: h-16, border-b with subtle shadow

**Inbox Screen Layout**:
- Tab bar (Email/SMS/Calls) - subtle background differentiation
- Message list: card-based layout with hover states
- Each message card shows: sender, subject, timestamp, preview snippet
- Visual priority indicator (colored left border: green=safe, yellow=verify, red=urgent)
- Fixed action bar at bottom when message selected

**Message Detail View**:
- Split layout: 60/40 (message content / inspection panel)
- Message header: sender info, subject (prominent)
- Full message body with natural line breaks
- Inspection panel (collapsible): reveals actual addresses, link targets, QR decode results
- Action buttons (sticky footer): Report, Delete, Verify, Proceed - clearly differentiated

**Feedback Screen**:
- Result banner (full-width): success (green tint), warning (yellow), danger (red)
- Message displayed again with highlighted cues (yellow highlights for text, tooltip markers)
- Explanation card: "Why this matters" with one-sentence principle
- Follow-up question card (simple radio buttons)
- "Continue" button (prominent)

**Progress Dashboard**:
- Stats grid (3-4 columns): Accuracy %, Safe Decisions, False Positives, Streak
- Skills section: Badge cards (icon, label, progress bar)
- Recent activity timeline
- Weakness identification panel: "Most missed cues" (tag cloud or list)

### UI Elements

**Buttons**:
- Primary (Report/Proceed): filled, prominent
- Secondary (Delete/Verify): outlined
- Danger actions (Proceed on phishing): red accent
- Safe actions (Report): blue/green accent

**Message Cards**:
- Clean card design with subtle shadow
- Sender name (font-medium)
- Subject (font-semibold, slightly larger)
- Timestamp (text-xs, muted)
- Snippet (text-sm, truncated with ellipsis)
- Left border for visual priority

**Inspection Panel**:
- Accordion-style sections: Sender Details, Link Analysis, Attachments, QR Code
- "Reveal" buttons for showing underlying addresses
- Monospace font for technical details (email addresses, URLs)
- Copy-to-clipboard icons

**Badge/Tag System**:
- Skill badges: icon + label, outlined when locked, filled when earned
- Attack type tags: small pills with consistent color coding (phishing=blue, BEC=purple, spoofing=orange)
- Difficulty indicators: 1-5 shield icons using NIST scale

**Feedback Highlights**:
- Inline text highlights: yellow background with subtle border
- Tooltip markers: small numbered circles that reveal explanation on hover
- Cue legend: persistent list showing what each highlight means

---

## Interaction Patterns

**Hover States**:
- Message cards: subtle shadow increase, slight scale
- Buttons: opacity 90%, no dramatic changes
- Links in messages: underline appears, cursor pointer

**URL Preview**:
- On hover over links: small tooltip appears showing full URL
- On mobile: tap-and-hold gesture shows overlay modal

**Verification Flow**:
- Modal overlay showing verification options (call number, open portal, check directory)
- Consumes one verification token (show remaining: "2 verifications left")

**Progressive Disclosure**:
- Inspection panel starts collapsed
- Advanced details hidden behind "Show technical details" toggle
- Scenario library uses expandable cards

---

## Visual Treatment

**Inbox Realism**:
- Use subtle grid lines to separate messages (like real email clients)
- Timestamp formatting matches familiar patterns ("2 hours ago", "Yesterday")
- Sender avatars (generated based on initials, consistent colors)
- Read/unread visual states (bold vs normal weight)

**Educational Feedback**:
- Clear visual separation between "game UI" and "inbox UI"
- Feedback overlays use distinct treatment (cards with borders, not blending with inbox)
- Success/failure states use gentle color tints, not harsh overlays

**Professional Aesthetic**:
- Minimal decoration - no gamified graphics in core interface
- Icons from Heroicons (outline style) for clarity
- Consistent corner rounding: rounded-lg for cards, rounded for buttons
- Subtle shadows: shadow-sm for cards, shadow-md for modals

---

## Adaptive Learning UI

**Difficulty Indicator** (for instructors):
- NIST Phish Scale visualization: 1-5 shields, outlined or filled
- Displayed in scenario cards, hidden from learners during training

**Confidence Rating Widget**:
- Horizontal slider (50-100%)
- Clear labels: "Somewhat sure" to "Very confident"
- Appears after each decision before revealing feedback

**Mistake Pattern Display**:
- Tag cloud showing most-missed cues (size indicates frequency)
- Clickable tags filter to relevant training scenarios

---

## Images

**No hero images** - this is a functional application, not a marketing site.

**In-scenario images**: 
- Message attachments shown as file previews (PDF icon, image thumbnails)
- QR codes rendered when scenarios include them
- Sender avatars (generated, consistent)

**Progress screen**:
- Skill badge icons (custom SVG via Heroicons or similar)
- Achievement graphics (subtle illustrations for milestones)