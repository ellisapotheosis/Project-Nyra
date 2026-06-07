# UI Upgrade Design Spec — Project Nyra

**Date:** 2026-06-07  
**Scope:** ratehunter.net + projectnyra.com  
**Status:** Approved — implementation pending

## Executive Summary

Full-stack UI/UX upgrade across both Project Nyra apps targeting maximum memorability and conversion. 50 ideas were brainstormed, rated 1–10, and all 50 approved for implementation across three phases. The upgrade preserves all existing architecture — new components drop into the established Magic UI pattern (`src/components/ui/`) and follow the existing oklch design system tokens.

**Goal:** Make both apps hard to stop thinking about. Ratehunter converts borrowers on first visit. Projectnyra makes brokers feel like they're operating a Bloomberg terminal crossed with a spaceship.

---

## Architecture Decisions

### Principles

- All new components are `"use client"` — they use animation/DOM APIs
- Follow existing Magic UI pattern: copy source into `src/components/ui/`, no external CDN deps
- New npm packages: `lottie-react` only (for micro-animation icons). Everything else uses Framer Motion + WebGL + SVG + CSS already in the project
- TypeScript strict mode: 0 errors required before each phase ships
- Glassmorphism is pure CSS — `backdrop-filter`, gradient-border wrapper pattern, no packages

### Color System

All new components consume existing oklch design tokens:

- `--primary`: oklch(0.5038 0.2937 285.3753) — indigo/purple
- `--seafoam`: oklch(0.8871 0.1828 166.5465) — seafoam/teal
- `--neon-pink`: oklch(0.667 0.295 322.15) — neon pink
- `--bg`, `--fg`, `--card`, `--border` — base surface tokens

### Shared Components (both apps)

| Component         | File                                     | Purpose                                              |
| ----------------- | ---------------------------------------- | ---------------------------------------------------- |
| `LottieIcon`      | `src/components/ui/lottie-icon.tsx`      | Wrapper for Lottie JSON animations on icons          |
| `GlossaryTooltip` | `src/components/ui/glossary-tooltip.tsx` | Bloomberg-style hover definitions for mortgage terms |
| `SkeletonBlock`   | `src/components/ui/skeleton.tsx`         | Shimmer loading skeleton component set               |
| `GlassCard`       | `src/components/ui/glass-card.tsx`       | Frosted glass card with gradient border wrapper      |
| `GlassModal`      | `src/components/ui/glass-modal.tsx`      | Glassmorphism dialog replacement for shadcn Dialog   |

---

## Phase 1 — Tier S: Conversion-Critical (10 features)

**Ratehunter features:**

### #1 — Particle Rate Cloud

- **File:** `apps/ratehunter/src/components/RateParticleCloud.tsx`
- **Approach:** Canvas 2D (not WebGL — simpler, sufficient). Each lender offer = one particle. Particles organize into a horizontal band sorted by rate. Slider adjustments trigger spring-physics reorganization via Framer Motion `useSpring`. Selecting a particle fires a radial burst.
- **Integration:** Replaces the static rate comparison table in ratehunter `page.tsx`

### #2 — "Your Savings" Hero Counter

- **File:** Extend existing `NumberTicker.tsx` with `prefix`/`suffix` props, mount on scroll via `useInView`
- **Integration:** Hero section — displays total 30yr savings vs national average. Updates dynamically with loan slider.

### #4 — Live Rate Heartbeat

- **File:** `apps/ratehunter/src/components/ui/rate-heartbeat.tsx`
- **Approach:** SVG polyline path. `useAnimationFrame` drives a moving window of simulated rate data (Perlin-style noise + trend). Color transitions: green (#00CCB2) when below weekly average, amber when above.

### #5 — Ink Reveal Transitions

- **File:** `apps/ratehunter/src/components/ui/ink-reveal.tsx`
- **Approach:** SVG `<clipPath>` with a morphing blob path. `useInView` triggers a Framer Motion path animation from collapsed to expanded. Wraps any section children.

### #6 — 3D Flip Rate Cards

- **File:** `apps/ratehunter/src/components/ui/rate-card-3d.tsx`
- **Approach:** CSS `perspective` + `rotateY` on hover/click. Front: rate + lender + monthly payment. Back: full APR breakdown, points, closing cost estimate. `transform-style: preserve-3d`.

### #7 — One-Tap Rate Lock Widget

- **File:** `apps/ratehunter/src/components/RateLockWidget.tsx`
- **Approach:** Floating sticky widget. Countdown timer (23:59:59 format) using `useEffect` interval. On click: canvas-confetti burst (already installed) + immediate form open / scroll to lead capture.

### #9 — Animated Payment Breakdown Donut

- **File:** `apps/ratehunter/src/components/ui/payment-donut.tsx`
- **Approach:** SVG circles with animated `stroke-dashoffset`. Four segments: principal, interest, taxes, insurance. Framer Motion animates values when loan inputs change. Hover segment highlights and shows dollar tooltip.

**Projectnyra features:**

### #3 — AI Sidebar "Ask Nyra"

- **File:** `apps/projectnyra/src/components/ai-sidebar.tsx`
- **Approach:** Right-side drawer (fixed, 360px wide). Framer Motion slide-in from right. Chat interface wired to Nexus Router `/chat` endpoint. Keyboard shortcut: `Cmd+Shift+N`. Context-aware: passes current lead ID if one is open.

### #8 — Smart Lead Score Rings

- **File:** `apps/projectnyra/src/components/ui/lead-score-ring.tsx`
- **Approach:** SVG circle with `stroke-dashoffset` animated from 0 to score value on mount. Color: red (0–39) → amber (40–69) → green (70–100). Hover shows breakdown tooltip (credit/income/urgency weights).

### #10 — The Rate Wall

- **File:** `apps/projectnyra/src/components/rate-wall.tsx`
- **Approach:** CSS grid of lender tiles. Each tile has a color that shifts via CSS custom property animation when rate changes (interpolated via `useSpring`). Best broker rates highlighted with glowing border.

---

## Phase 2 — Tier A: High-Value UX (15 features)

### #11 — Mortgage Narrative Scroll (ratehunter)

- **File:** `apps/ratehunter/src/components/MortgageNarrativeHero.tsx`
- Scroll-linked story using `useScroll` + `useTransform`. Four states: Pre-approved → Choosing → Closing → Moving. SVG illustrations morph between states via `clipPath` or simple CSS cross-fade.

### #12 — Bento Grid Command Center (projectnyra)

- **File:** `apps/projectnyra/src/components/BentoDashboard.tsx`
- Draggable bento layout using `@dnd-kit` (already installed). Tile sizes: `1×1`, `1×2`, `2×1`, `2×2`. Layout saved to `localStorage`. Default layout ships with pipeline value as hero tile.

### #13 — Pipeline Sankey Funnel (projectnyra)

- **File:** `apps/projectnyra/src/components/PipelineSankey.tsx`
- Pure SVG — no D3. Pre-calculated paths from stage percentages. Hover paths for drop-off rates. Animated on mount via `stroke-dashoffset`.

### #14 — Focus Mode (projectnyra)

- **File:** Modify `apps/projectnyra/src/app/(broker)/layout.tsx`
- `F` key listener toggles a CSS class on the layout root. Class applies `filter: brightness(0.05)` to everything except `.focus-target` elements. `Escape` exits.

### #15 — Broker Presence Cursors (projectnyra)

- **File:** `apps/projectnyra/src/components/ui/presence-cursors.tsx`
- WebSocket connection to a lightweight presence endpoint (or use Nexus Router SSE). Each connected broker gets a colored dot + initials label that follows their cursor on shared views.

### #16 — Progressive Disclosure Form (ratehunter)

- **File:** Refactor `apps/ratehunter/src/components/LeadCaptureWizard.tsx`
- Replace static multi-field form with step-reveal animation. Each field slides/fades in after previous is completed. After loan amount → show teaser rate → then request contact. Uses existing Framer Motion `AnimatePresence`.

### #17 — 30-Day Rate Forecast Widget (ratehunter)

- **File:** `apps/ratehunter/src/components/ui/rate-forecast-widget.tsx`
- SVG line chart with subtle gradient fill. Data: last 30 days actuals + 14-day trend projection (linear regression on historical points). Labeled "Trend estimate — not financial advice."

### #18 — Radial FAB Speed Dial (projectnyra)

- **File:** `apps/projectnyra/src/components/ui/speed-dial-fab.tsx`
- Fixed bottom-right FAB. Hover/click expands 5 radial action buttons with spring physics (Framer Motion `useSpring`). Actions: New Lead, Rate Quote, Send Campaign, View Pipeline, Ask Nyra.

### #19 — Lottie Micro-Animations (both apps)

- **Package:** `lottie-react` (add to both apps)
- **File:** `src/components/ui/lottie-icon.tsx` in both apps
- Replace static icons on: lock (security section), chart-bar (stats), house (property), checkmark (success states), star (favorites).

### #20 — Close Celebration Burst (projectnyra)

- **File:** Extend `apps/projectnyra/src/components/kanban-board.tsx`
- When card moves to "Closed" column: full-screen `canvas-confetti` burst (already installed) + a toast with borrower name, loan amount, and broker commission estimate.

### #21 — Rate Alert Subscription (ratehunter)

- **File:** `apps/ratehunter/src/components/ui/rate-alert-widget.tsx`
- Single-field email form with a threshold selector (loan type + target rate). Submits to Nexus Router `/rate-alerts` endpoint. Success state: animated checkmark + "We'll notify you at {email}."

### #22 — Glassmorphism Full Redesign (projectnyra)

- **Files:** `apps/projectnyra/src/components/ui/glass-card.tsx`, `glass-modal.tsx`, global CSS additions
- Pattern: gradient-border wrapper (1px padding with linear-gradient background) + inner div with `backdrop-filter: blur(22px) saturate(160%)` + `rgba(4,4,14,0.62)` background.
- Applied to: all `.c-card` instances, all modals, sidebar nav, header.

### #23 — Mortgage Journey Timeline (projectnyra)

- **File:** `apps/projectnyra/src/components/LoanTimeline.tsx`
- Vertical timeline with animated node reveals on scroll. Nodes are draggable to reorder custom stages. Each node expands on click to show timestamps, notes, and documents.

### #24 — Contextual Bloomberg Tooltips (both apps)

- **File:** `src/components/ui/glossary-tooltip.tsx` in both apps
- A `<GlossaryTooltip term="DTI">` wrapper component. On hover: rich tooltip card slides in with definition, current value in context, and a "Learn more" link. Covers: DTI, LTV, PITI, APR, ARM, PMI, Points, Origination Fee.

### #25 — Shareable Rate Snapshot (ratehunter)

- **File:** `apps/ratehunter/src/components/ui/share-snapshot.tsx`
- Encode current rate comparison state into URL params (loan amount, term, loan type, selected lenders). "Share" button copies short URL to clipboard. Referral source tracked via UTM params.

---

## Phase 3 — Tier B/C: Polish & Power Features (25 features)

**Agent C (ratehunter polish):**

- **#26 Skeleton Screens** — `SkeletonBlock.tsx` shimmer component; replace loading spinners in rate table, hero stats
- **#29 Rate Shock Timeline** — `RateShockSlider.tsx`: SVG line chart of 30yr rates 1970–today, draggable scrubber
- **#34 Animated SVG Journey** — `MortgageJourneySVG.tsx`: 5 SVG icons that draw via `stroke-dashoffset` on scroll-enter
- **#37 Parallax Depth Layers** — CSS `transform: translateY` on 3 z-layers in hero, driven by `useScroll`
- **#38 PWA** — `next.config.ts` + `next-pwa` (or manual service worker); offline rate cache with stale-while-revalidate
- **#42 Letter-Drop Hero** — `LetterDrop.tsx`: hero heading letters arrive with spring physics stagger (y: -20 → 0, bounce)
- **#48 Hero Video Loop** — `<video autoPlay muted loop playsInline>` with brand-palette color-grade overlay in hero
- **#50 Konami Code Easter Egg** — keydown sequence listener → neon cyberpunk CSS class swap + 2s jingle Audio API

**Agent D (projectnyra power features):**

- **#27 Swipe-to-Qualify** — drag gesture hook on lead cards (pointer events); left=decline, right=qualify with spring physics
- **#28 Notification Center 2.0** — extend existing `NotificationBell`: grouped by type, mark-all-read, deep-link on click
- **#31 Performance Heatmap** — `PerformanceHeatmap.tsx`: 52-week calendar grid, intensity = closes/day, GitHub-style
- **#33 Lead Source Sunburst** — `LeadSourceSunburst.tsx`: pure SVG arc segments with drill-down click handler
- **#35 Keyboard Shortcut Overlay** — `ShortcutOverlay.tsx`: Cmd+/ → full-screen overlay listing all shortcuts by section
- **#39 PDF Quote Generator** — `react-pdf` or `@react-pdf/renderer`; one-click branded PDF with rate comparison table
- **#40 Onboarding Checklist** — `OnboardingChecklist.tsx`: step-by-step with check animation + progress bar; fires confetti on completion
- **#43 Voice Search** — mic icon in command palette → `window.SpeechRecognition` → autocomplete leads
- **#47 Ambient Sound** — optional: 40Hz sine wave via Web Audio API; mute toggle in header; opt-in on first visit
- **#49 Haptics** — `navigator.vibrate()` on drag-start, card-drop, loan-close; mobile only, graceful no-op on desktop

**Agent E (shared/both apps):**

- **#30 Email Campaign Preview** — `EmailPreviewModal.tsx`: iframe sandbox rendering template, viewport toggle (mobile/desktop)
- **#32 Glassmorphism Modal System** — `GlassModal.tsx` replaces shadcn `<Dialog>` across both apps
- **#36 CSS Container Query Cards** — `@container` query on lead cards so same component adapts in sidebar vs full-width
- **#41 3D Globe Lead Map** — `LeadOriginGlobe.tsx` using `three-globe` or `deck.gl GlobeView`; lead pin clusters
- **#44 High-Contrast Mode** — CSS class toggle on `<html>`; WCAG AAA palette, visible focus rings, no gradient text
- **#45 Collaboration Cursors** — `PresenceCursors.tsx`: WebSocket/SSE presence feed; colored cursor labels per broker
- **#46 Houdini Paint Worklets** — `CSS.paintWorklet.addModule()` for generative card backgrounds; Chrome-only, `@supports` gated

---

## Data & Endpoint Notes

### Rate Data (Phases 1–2)

Components #1 (Particle Cloud), #4 (Heartbeat), #17 (Forecast Widget), and #10 (Rate Wall) use **simulated/mock rate data** in Phase 1. Live feed integration is out of scope for this UI spec — a `useRates()` hook will be created that returns mock data initially and can be swapped for a real endpoint later with no component changes.

### `/rate-alerts` Endpoint

Feature #21 posts to `POST /api/rate-alerts`. This endpoint does not yet exist in the Nexus Router config. Implementation: add a minimal n8n webhook handler that stores the alert subscription and sends a confirmation email. The UI component gracefully degrades to a "success" toast if the endpoint is unreachable.

### AI Sidebar Endpoint

Feature #3 uses `POST /nexus/chat` (existing Nexus Router chat endpoint). The sidebar passes the current broker's session token and optionally a `leadId` context parameter. Falls back to a static "Nexus offline" state if the endpoint is unreachable.

---

## Implementation Strategy

### Parallel Agent Dispatch Rules

Agents are assigned non-overlapping file sets:

- **Agent A** — New component files only (creates, does not modify existing pages)
- **Agent B** — Page-level wiring after Agent A's components exist
- **Agent C** — Separate app (if A/B are on ratehunter, C works on projectnyra)
- **Agent D** — CSS/global files (globals.css, tailwind.config.ts)

### TypeScript Validation Gate

After each phase: `rtk pnpm -C apps/ratehunter exec tsc --noEmit && rtk pnpm -C apps/projectnyra exec tsc --noEmit`

### File Conflict Prevention

All new components use unique filenames. No two agents touch `page.tsx` simultaneously. Page wiring happens in a sequential step after component creation.

---

## Success Criteria

- [ ] Both apps run `tsc --noEmit` with 0 errors after all phases
- [ ] `pnpm lint` passes in both apps
- [ ] All new components visible and functional on `localhost:3000` / `localhost:3001`
- [ ] Aurora background still runs at 60fps with new components mounted
- [ ] Glassmorphism `backdrop-filter` visible on Chrome, Firefox, Safari (with `-webkit-` prefix)
- [ ] Confetti burst fires on ratehunter wizard submit (existing) and projectnyra loan close (new)
- [ ] AI Sidebar successfully routes to Nexus Router (or gracefully degrades if offline)
