# VisitSaudi-Parity Transformation Plan — All 4 Apps

**Version:** 1.0
**Date:** 2026-08-01
**Status:** Planning complete, implementation not yet started.
**Author's note (read this first):** This document was written by an AI assistant (Claude) in a single working session, after directly reading the live codebase — every file path, table name, and "already built" claim below was verified against the actual repo at `E:\Desktop\EC Projects\TA`, not assumed. It's written to be picked up cold by a different developer or AI with zero prior context on this conversation. If you're that reader: start with §0, then work top to bottom. Re-verify file paths before editing — the codebase will have moved on since this was written.

**Companion documents (read in this order):**
1. `docs/visitsaudi_layout_breakdown.md` — the structural reference (what visitsaudi.com actually does, section by section).
2. `docs/UZBEKISTAN_DESIGN_LANGUAGE.md` — our own creative direction (colors, cultural motifs, card families, imagery rules). **Read this before touching any UI** — it defines the vocabulary this plan uses (e.g. "Family 1/2/3 cards," "ikat-ribbon," "Pomegranate").
3. `docs/UI_UX_GUIDELINES.md` — the base design system (already-implemented tokens, typography, existing component specs).
4. `docs/PROJECT_LIFECYCLE.md` — overall project staging; this transformation is additive polish on top of a Stage-2-complete platform, not a rewrite of business logic.

**The one hard rule, repeated because it matters more than anything else in this document:** every number, list, card, and stat shown anywhere must come from a real Supabase query. Real photography from Unsplash/Wikimedia is fine and encouraged (see design doc §5) — that's content sourcing, not mock data. Hardcoded arrays pretending to be live data are not acceptable anywhere in this plan, including "temporary" placeholders. If real data isn't available yet for a section, either build the migration/seed first, or build an honest empty/"coming soon" state (see multiple examples of this pattern already in the codebase, e.g. `apps/tourist-webapp/src/app/flights/page.tsx`).

---

## 0. Current State — What's Already True (verified 2026-08-01)

Don't rebuild what already works. This section exists so you don't waste time re-auditing.

### 0.1 Already implemented, matches or is compatible with the target design language
- **Design tokens**: Sand/Emerald/White/Gold/Turquoise (Family 1 "Destination Card" pattern) are live on the Tourist WebApp landing page (`apps/tourist-webapp/src/components/landing/*`, `Navbar.tsx`, `Footer.tsx`) via inline hex values — **not yet in Tailwind config**, see §1.1.
- **Fonts loaded**: Playfair Display + Inter + JetBrains Mono, via Google Fonts `<link>` in the landing components.
- **Family 1 card pattern** (frosted-glass, gradient scrim, rounded-6px): built and working in `DestinationsSection.tsx` (landing teaser) and `apps/tourist-webapp/src/app/discover/DiscoverClient.tsx` (full destinations grid).
- **Real data pipeline for the landing page**: `apps/tourist-webapp/src/app/page.tsx` fetches `getTopDestinations(8)`, `getFeaturedExperiences(8)`, `getFeaturedItineraries(8)`, `getUpcomingEvents(6)` — all real Supabase queries, all real tables. **Events data is fetched but never rendered** — see §2.1, this is a quick, high-value fix.
- **Route structure**: `/discover` (destinations, Family 1 cards today), `/service` + `/service/[id]` (experiences), `/packages` + `/packages/[id]`, `/map` (Mapbox-backed Survival Map), `/profile`, `/dashboard` — all wired to real data, properly nested URLs, no mock data (audited and fixed 2026-08-01, see git history same date).
- **Admin dashboard KPIs**: real aggregate queries exist in `apps/admin-portal/src/app/actions/dashboardActions.ts` (`getPlatformStats()`) — total tourists, bookings, GMV, verified providers, weekly deltas. **This is the exact pattern to reuse** for the new "Uzbekistan in Numbers" public-facing stat section (§2.3) — don't reinvent aggregate-query logic, import/adapt this.
- **Booking + review workflows**: fully real, end-to-end, realtime-wired (see Stage 2 audit notes in `PROJECT_LIFECYCLE.md` §4). Not in scope for this visual transformation.

### 0.2 Explicitly NOT yet implemented (real gaps, not stylistic)
- **`packages/ui/tailwind.config.ts`** (shared across all 4 apps) still has an unrelated, older "Travelora" palette (`primary: #1877F2` blue, `secondary: #FF5A5F` coral) left over from an earlier design iteration. This is what Provider App's dashboard and most of Admin Portal currently render with — **not** the Immersive Minimalism tokens. This is the single most important Phase 0 task: get the real tokens into the shared Tailwind config so every app can use `bg-emerald-950`/`text-gold-400`/etc. instead of hand-written inline hex.
- **Events section**: real `events` table exists (`supabase/migrations/20240102000000_landing_page.sql`), real seed data exists (6 festivals, `supabase/seed.sql`), real fetch happens (`getUpcomingEvents`) — but `LandingClient.tsx` never renders an `EventsSection` component. It doesn't exist. Build it (§2.1).
- **Offers/promotions**: no table, no data model, nothing built. Full new feature (§2.4, needs a migration).
- **Stories/editorial**: no table, no data model, nothing built. Full new feature, lower priority (§2.5).
- **Weather integration**: nothing built. VisitSaudi shows live per-destination weather on cards and the map. This needs a real external API (e.g. Open-Meteo, free, no key required) — not mock temperatures. Scoped as optional/Phase-4 (§2.6) since it's the one section requiring a new external dependency.
- **Interactive map photo-pins / two-tier pin system**: current `SurvivalMap.tsx` renders generic category pins only (see `useMapPins` hook). No photo-thumbnail pins, no per-destination weather badges on the map. §3.
- **Provider App and Agency Portal branding**: **mixed state, not fully migrated.** Confirmed: `apps/agency-portal/src/app/dashboard/page.tsx` already uses Immersive Minimalism inline styles. Confirmed: `apps/provider-app/src/app/dashboard/page.tsx` still uses the old shared Tailwind tokens (`text-primary` = Travelora blue). **Do not assume either app is "done" — audit every page individually per §4/§5.**
- **Admin Portal branding**: also mixed. `verification-hub/page.tsx` uses Immersive Minimalism inline styles. `dashboard/page.tsx`, `analytics/page.tsx`, `users/page.tsx` (all rebuilt 2026-08-01 for real-data-wiring, deliberately kept in the pre-existing Tailwind/`#1E6F8A` style of their surrounding file at the time) still use the old palette. §6.

---

## 1. Phase 0 — Design System Foundation (do this first, blocks everything else)

### 1.1 Add real tokens to `packages/ui/tailwind.config.ts`

This file is consumed by all 4 apps (`content` glob includes `../../apps/*/src/**/*`). Add, without removing the existing `primary`/`secondary`/`accent` Travelora tokens yet (removing them would break every page not yet migrated — do that as a final cleanup step in §7, after every app's pages have been individually migrated off them):

```ts
colors: {
  // ... existing primary/secondary/accent/sand/dark stay for now ...
  sand: { 50: "#F9F8F5" }, // note: conflicts with existing sand.50 = "#F9FAFB" — resolve by
                            // renaming the new one, e.g. `cream: { 50: "#F9F8F5" }`, or by
                            // completing the full token migration in one pass per app (safer)
  emerald: { 950: "#0A2320" },
  gold: { 400: "#C5A880" },
  teal: { 700: "#006B70" },
  pomegranate: { DEFAULT: "#A72608" },
},
fontFamily: {
  display: ["Playfair Display", "serif"],
  sans: ["Inter", "sans-serif"], // may already be mapped; verify no collision
  mono: ["JetBrains Mono", "monospace"],
},
borderRadius: {
  feature: "6px",   // Family 1 cards
  catalog: "0px",   // Family 2 cards
},
```

**Important naming collision to resolve before writing code:** the existing config already has `sand.50 = "#F9FAFB"` (a different, near-white gray, not our `#F9F8F5` cream/sand token). Pick one of: (a) rename our sand token to `cream`, (b) overwrite the existing `sand.50` value (check nothing currently relies on the old gray specifically), or (c) namespace ours as `sand.warm` / similar. Don't silently shadow it — that produces confusing bugs where some pages get the wrong "sand."

### 1.2 Build reusable pattern components (used across every phase below)

New files in `packages/ui/src/components/patterns/` (or wherever this package's convention is — check `packages/ui/src/components/` structure before creating):

- **`GirihWatermark.tsx`** — full-bleed, low-opacity (5–8%) repeating geometric pattern, CSS `repeating-linear-gradient` combo or an SVG tile background. Props: `opacity`, `color` (defaults to emerald).
- **`IkatRibbon.tsx`** — the Family 3 card left-edge pattern (design doc §3.3, §4). Implement as a `repeating-linear-gradient` cycling Emerald→Gold→Turquoise→Pomegranate, OR source/commission a real ikat-pattern SVG tile for higher fidelity. Props: `width` (default 14px).
- **`SuzaniMedallion.tsx`** — large radial/starburst SVG shape, single-color fill, low opacity, positioned as a decorative background accent (design doc §4). Used behind CTA/newsletter banners.
- **`StatCard.tsx`** — Family 3 card component: `IkatRibbon` + big Playfair number + Inter label + optional illustration icon slot. Takes real props (`value: number | string`, `label: string`) — **never give this component a default/example value**, force callers to pass real query results.

These four components are referenced repeatedly below; build them once, correctly, before starting page work.

---

## 2. Phase 1 — Tourist WebApp: Landing Page (`apps/tourist-webapp/src/app/page.tsx` → `LandingClient.tsx`)

Current section order: `HeroSection` → `DestinationsSection` → `PackagesSection` → `RegionalExperiencesSection` → `Footer`. Target order (VisitSaudi's structure, Uzbek content):

`HeroSection` (upgrade) → `DestinationsSection` (keep) → **`EventsSection`** (new) → `PackagesSection` (keep) → **`OffersSection`** (new, needs migration) → `RegionalExperiencesSection` (keep) → **`StatsSection`** (new) → **`StoriesSection`** (new, lower priority) → **`MapTeaserSection`** (new) → `Footer` (upgrade)

### 2.1 EventsSection — build now, data already exists (highest value-per-effort item in this whole plan)

- New file `apps/tourist-webapp/src/components/landing/EventsSection.tsx`.
- Props: `events: Event[]` (the `Event` type from `@repo/database`, already defined, already fetched in `page.tsx` — just needs to be passed to a new component and rendered in `LandingClient.tsx`).
- Layout per `visitsaudi_layout_breakdown.md` §1 "What's On": horizontal carousel, Family 1-adjacent card (dark background instead of photo-only), date badge overlay (start/end from `event.start_date`/`end_date`), location pin + `event.location`, bold `event.title`, CTA button — VisitSaudi has "Buy Tickets"/"Visit Website"; use `event.ticket_url` if present (`"Buy Tickets"`), else omit the button or link to a future event-detail page if one gets built.
- `event.image_url` — already real Unsplash URLs in the seed data (`supabase/seed.sql`).
- `LandingClient.tsx` edit: add `<EventsSection events={events} />` — `events` prop is already there, unused. This is a ~30 line component wiring plus the fetch is already done.

### 2.2 HeroSection upgrade — video slider

- Current: static hero (verify exact current implementation — likely a single image/gradient background based on earlier session work on `HeroSection.tsx`'s CTA links).
- Target: full-bleed autoplay muted background video (design doc §5, §7), 3–4 slide rotation, bottom gradient scrim, centered Playfair Display 80px headline + gold pill CTA, **ikat-stripe progress bar** (`IkatRibbon`-style component, horizontal, animating left-to-right per slide) replacing dot indicators.
- Slide content should be real, current, editable — either hardcode 3–4 slides describing real, evergreen aspects of the platform ("Book Verified Local Experiences," "Explore 8 Regions," etc. — this is copy, not data, so static slide *copy* is fine; just don't fabricate stats or claims within it) or, if time allows, source slides from `getUpcomingEvents`/`getFeaturedItineraries` dynamically so the hero rotates real current content automatically.
- Video sourcing: design doc §5. Fallback to a static full-bleed photo hero if no verified real video clip is sourced in time — do not use a fake/generic stock clip mislabeled as Uzbekistan.

### 2.3 StatsSection — "Uzbekistan in Numbers"

- New file `apps/tourist-webapp/src/components/landing/StatsSection.tsx`, using the new `StatCard` component (§1.2).
- Data: real aggregate queries. **Reuse the exact pattern from `apps/admin-portal/src/app/actions/dashboardActions.ts`**, either by extracting a shared server action into `packages/database` (better — avoids duplicating the service-role-client boilerplate across apps) or by writing an equivalent tourist-webapp-local server action. Candidate stats (verify each is a real column/query before committing to it):
  - Regions/destinations covered: `COUNT(destinations)`.
  - Verified providers: `COUNT(provider_verifications WHERE status='approved' AND role='provider')` — exact query already written, copy it.
  - Completed bookings: `COUNT(bookings WHERE status='completed')`.
  - Average rating / total reviews: same pattern as `apps/admin-portal/src/app/actions/analyticsActions.ts`'s `avgRating`/`totalReviews` computation — reuse.
- **This is a public-facing page** — decide whether these queries need the service-role client (bypassing RLS, since `bookings`/`user_profiles` aren't publicly readable per the RLS audit in `PROJECT_LIFECYCLE.md`) or whether it's acceptable/intended to expose only aggregate counts (not row-level data) via a public server action. Aggregate counts leaking via a public endpoint is generally fine (no PII), but confirm this is an accepted tradeoff before shipping — don't silently bypass RLS on a public page without that being a deliberate decision.

### 2.4 OffersSection — new feature, needs a migration

VisitSaudi's "Discover The Latest Offers" has no equivalent today. Full scope:

1. **New migration** `supabase/migrations/<timestamp>_offers.sql`:
   ```sql
   CREATE TABLE public.offers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     description TEXT,
     provider_id UUID REFERENCES auth.users(id), -- nullable: platform-wide offers vs provider-specific
     service_id UUID REFERENCES public.services(id),
     itinerary_id UUID REFERENCES public.itineraries(id),
     discount_label TEXT NOT NULL, -- e.g. "15% OFF", "Free breakfast" — display string, not necessarily numeric
     image_url TEXT,
     valid_from DATE,
     valid_until DATE,
     is_featured BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Offers are publicly readable" ON public.offers FOR SELECT USING (true);
   ```
   Adjust FKs/columns as needed once you check how providers/agencies would actually create offers (out of scope for this plan — decide whether offer creation is admin-curated only for v1, or self-serve for providers/agencies, since that affects whether you need RLS write policies + a creation UI in Provider App/Agency Portal too).
2. **Data fetch**: `getFeaturedOffers(limit)` in `packages/database/src/landing.ts`, same pattern as `getUpcomingEvents`.
3. **Component**: `OffersSection.tsx`, Family 1 card variant with the two-stacked-photo + suzani-medallion discount badge (design doc §4) instead of VisitSaudi's starburst.
4. **Seed real offers** (or leave the section rendering an honest empty state until real providers create real offers) — do not seed fake promotional copy pretending to be a real active discount.

### 2.5 StoriesSection — new feature, lower priority

VisitSaudi's "Stories and Insights" editorial blog tiles. Lowest priority in this plan — it's the section with the least connection to the core booking product. If built:
- New `stories`/`articles` table (title, slug, cover_image_url, category, body, published_at, author).
- Full-bleed 3-col grid, zero-radius (Family 2), text overlaid on bottom gradient scrim — matches `visitsaudi_layout_breakdown.md` §1 exactly, this is one of the few sections that translates almost 1:1 visually.
- Content: real, platform-team-written travel guides (e.g. "5 Days in Samarkand," "Fergana Valley Silk Route") — genuinely written content, not filler. If there's no capacity to write real editorial content yet, skip this section entirely rather than shipping placeholder articles.

### 2.6 MapTeaserSection — mini interactive map module

VisitSaudi's "Know the Destinations" split layout (scrollable destination list + embedded map with photo pins). See Phase 3 (§3) for the full map work this depends on — the homepage teaser should be a smaller version reusing whatever map component gets built there. Sequence this *after* Phase 3, not before.

### 2.7 Footer upgrade

- Add the girih pattern divider band (`GirihWatermark`, muted white-on-sand) immediately above the footer, matching VisitSaudi's recurring "pattern as horizontal rule" device (design doc §4).
- Newsletter signup + app-store badges row (if a PWA install prompt or app listing exists/is planned — otherwise skip the store badges, don't fabricate app store links that don't exist).
- Keep existing link columns; no structural change needed beyond the pattern band.

---

## 3. Phase 2 — Interactive Map (`/map`, `SurvivalMap.tsx`, plus the homepage teaser from §2.6)

Current: `apps/tourist-webapp/src/components/map/SurvivalMap.tsx`, generic pins via `useMapPins` hook, Mapbox GL. Already fixed this session to accept deep-link `lat`/`lng` from `/map?lat=..&lng=..`.

Target, per `visitsaudi_layout_breakdown.md` §5:
1. **Custom map style**: if using Mapbox, create/select a custom style (Mapbox Studio) with a minimal, illustrated look — cream landmass, pale turquoise water, thin gold/turquoise region-border lines, JetBrains Mono uppercase region labels. This is a real design task requiring Mapbox Studio access, not something doable purely in React code.
2. **Two-tier pins**:
   - Solid Turquoise category icon pins (existing `MapPin` component in `packages/ui`, recolor) for standard POIs.
   - Circular photo-thumbnail pins with a Gold ring border for featured destinations — new pin variant, sourced from `destinations.image_url` (real data, already exists).
3. **Bottom overlay carousel**: horizontally-scrollable destination card strip docked to the bottom of the map viewport, each card a frosted-glass weather pill (see §2.6 weather note below) + tag pills + destination name. Reuses Family 1 card styling in miniature.
4. **Weather integration (optional, Phase-4 priority)**: Open-Meteo (`api.open-meteo.com`, free, no API key, real live data) keyed by each destination's `latitude`/`longitude` (already columns on the `destinations` table per `supabase/migrations/20240102000000_landing_page.sql`). Fetch server-side or via a thin API route, cache aggressively (weather doesn't need to be real-time-real-time). **Do not hardcode a "sunny, 28°C" placeholder** — either wire the real API or omit the weather badge entirely until it's wired.

---

## 4. Phase 3 — Tourist WebApp: Remaining Pages

### 4.1 `/discover` (destinations index) — switch main grid to Family 2 (Catalog)

Per design doc §3.2: the full "browse everything" grid should be the flatter, denser Family 2 treatment, while curated homepage carousels stay Family 1. Edit `apps/tourist-webapp/src/app/discover/DiscoverClient.tsx`: change the grid card render from the current frosted-glass Family 1 style to zero-radius, tag-overlay Family 2 style. Keep `/discover/[slug]` detail pages as-is (not a grid, not affected).

### 4.2 `/service` (experiences index) — same Family 2 treatment

`apps/tourist-webapp/src/app/service/ServiceListClient.tsx` — currently Family 1 cards (see `ServiceCard` inline component). Per VisitSaudi's Things-To-Do page (`visitsaudi_layout_breakdown.md` §3), this should be the searchable/filterable dense grid: add a search input + category filter pill row (data already has `service.category`, no new column needed — just build the filter UI, client-side filtering over the already-fetched `services` array is fine for current data volume) above a Family 2 grid.

### 4.3 `/packages` — keep as Family 1 (already correct — packages are inherently a curated/premium product, matches VisitSaudi's "Book Your Next Adventure" carousel treatment, not the dense-catalog family).

### 4.4 `/about`, `/contact` — lower priority, apply girih watermark background + updated typography per design doc; no structural change needed.

### 4.5 `/flights`, `/hotels` — currently honest stub pages. Out of scope for this visual transformation (no real data/backend exists for either — building real flight/hotel search integration is a separate, much larger project, not a "make it look nicer" task). Leave as-is.

---

## 5. Phase 4 — Provider App (`apps/provider-app`)

**Audit every page individually — do not assume any page beyond what's listed below.** Confirmed as of 2026-08-01: `dashboard/page.tsx` uses old Travelora tokens (`text-primary` = `#1877F2`), not yet migrated.

Checklist (verify current state of each before editing, then migrate to Immersive Minimalism tokens + Family 1/2 cards as appropriate):
- [ ] `dashboard/page.tsx` — confirmed needs migration.
- [ ] `services/page.tsx` — audit.
- [ ] `bookings/page.tsx` — audit (functionally correct per Stage 2 audit, this is styling-only).
- [ ] `reviews/page.tsx` — audit.
- [ ] `Sidebar.tsx` — audit (was touched this session for a realtime-subscription bug fix only, not styling).

Provider App is mobile-first (per `PROJECT_LIFECYCLE.md` §1) and used by rural/regional business owners in the field — per that same doc's principle "Simplicity First... every feature must be usable with minimal literacy." **Do not over-decorate this app** — Family 3 ikat-ribbon stat cards and heavy motion are appropriate for the public tourist-facing site; Provider App should stay closer to Family 2's flat, scannable simplicity even where the brand colors get applied. Prioritize legibility and large touch targets over visual flourish here.

---

## 6. Phase 5 — Agency Portal (`apps/agency-portal`)

Confirmed: `dashboard/page.tsx` already uses Immersive Minimalism inline styles (verified/fixed this session). Audit remaining pages:
- [ ] `inventory/page.tsx`
- [ ] `packages/page.tsx`
- [ ] `bookings/page.tsx`
- [ ] `reviews/page.tsx`

Agency Portal is desktop-first, power-user-focused (`PROJECT_LIFECYCLE.md` §1). This is the one non-tourist-facing app where a Family 3-style stat card treatment (e.g. an agency's own booking-volume/revenue stats) is reasonable — it's a professional dashboard, not a marketing site, but a restrained version of the brand polish helps trust/professionalism for B2B users.

---

## 7. Phase 6 — Admin Portal (`apps/admin-portal`)

Confirmed mixed state:
- [x] `verification-hub/page.tsx` — Immersive Minimalism, done.
- [ ] `dashboard/page.tsx` — real data (fixed 2026-08-01), old Tailwind/`#1E6F8A` styling. Needs visual migration only (data layer is already correct — reuse `getPlatformStats()`, just restyle the cards/chart to the new tokens).
- [ ] `analytics/page.tsx` — same: real data, old styling.
- [ ] `users/page.tsx` — same: real data, old styling.
- [ ] `destinations/page.tsx` (admin's own CMS for managing the `destinations` table) — audit.

Admin Portal is internal-only (platform team/"Ministry Oversight" per existing copy) — visual polish here is the lowest priority in this entire plan. Fine to do last, or skip the Family 3/ikat treatment entirely in favor of just adopting the correct color tokens for consistency.

---

## 8. Phase 7 — Cleanup

Only after every app's pages have been individually migrated (§4–§7 checklists all checked):
1. Remove the old `primary`/`secondary`/`accent` Travelora tokens from `packages/ui/tailwind.config.ts` (§1.1) — confirm zero remaining references first (`grep -r "text-primary\|bg-primary\|text-secondary\|bg-secondary" apps/*/src` should return nothing, or only intentional non-color-related matches).
2. Delete this document's "audit checklists" once every box is checked, or archive it — it'll be stale/misleading once the migration is complete.
3. Update `docs/UI_UX_GUIDELINES.md` §2.1's "migration gap" callout (added 2026-08-01) once the shared Tailwind config actually has the real tokens — that callout exists specifically to be deleted when this work finishes.

---

## 9. Suggested Execution Order (if working through this alone/serially)

1. Phase 0 (§1) — foundation, blocks everything.
2. §2.1 EventsSection — highest value, data already exists, ~1 hour of work.
3. §2.2 HeroSection video upgrade.
4. §2.3 StatsSection (reuses existing admin query patterns).
5. §4.1–4.2 Family 2 grid conversion on `/discover` and `/service`.
6. §3 Map upgrades.
7. §2.4 Offers (new migration + feature).
8. §5, §6, §7 — per-app brand audits (Provider/Agency/Admin), can run in parallel with each other since they don't depend on one another.
9. §2.5 Stories (lowest priority, only if there's real editorial content to put in it).
10. §8 Cleanup.

Each numbered phase above is independently shippable — this doesn't need to be one giant PR. Commit/ship per-phase so the "no mock data" invariant is checkable at every step rather than only at the end.
