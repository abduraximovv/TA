# Uzbekistan Design Language — "Silk Road Modern"

**Version:** 1.0
**Date:** 2026-08-01
**Status:** Active — this is the creative direction for the VisitSaudi-parity transformation described in `docs/VISITSAUDI_TRANSFORMATION_PLAN.md`.
**Relationship to other docs:** This document **extends** `docs/UI_UX_GUIDELINES.md` (the "Immersive Minimalism" system already implemented on the Tourist WebApp landing page). It does not replace it — the 5 core color tokens, the 3-font stack, and the Destination Card pattern defined there are the foundation. This doc adds the missing structural sophistication (card families, cultural motif library, illustration style, motion language, imagery sourcing rules) needed to reach the scale and polish of `visitsaudi.com`, using Uzbekistan's own cultural material instead of Saudi's.

---

## 0. Why "Silk Road Modern," not a copy of VisitSaudi

`docs/visitsaudi_layout_breakdown.md` is a **structural** reference — the *kinds* of sections, card families, and interaction patterns a world-class national tourism site uses (hero video slider, three card families, interactive map with photo pins, a stat section with a bespoke card treatment, a recurring geometric pattern used as a divider). None of that is Saudi-specific; it's just what "premium tourism platform" looks like at this scale.

What *is* Saudi-specific — the plum-purple brand color, the mashrabiya lattice, Arabic calligraphy in event photography, the "Noura" assistant — gets replaced wholesale with Uzbekistan's own material. The rule for every decision below: **if it's a pattern/structure, borrow it; if it's content/color/motif, it must come from Uzbekistan.**

---

## 1. Color Palette

### 1.1 Core brand tokens (inherited, unchanged — see `UI_UX_GUIDELINES.md` §4.1)

| Token | Hex | Source / cultural grounding |
|---|---|---|
| Sand | `#F9F8F5` | Kyzylkum desert, sun-bleached adobe (khan-style) walls |
| Midnight Emerald | `#0A2320` | The turquoise-black glazed tile shadow tone found at the base of Registan's iwans at dusk |
| White | `#FFFFFF` | Marble/alabaster inlay used in Timurid portals |
| Gold | `#C5A880` | Brass mosque doors, desert light, gold-thread suzani embroidery |
| Turquoise | `#006B70` | **This is not decorative — it's literal.** The turquoise/cobalt glazed majolica tile (*kashi*) covering the domes of the Bibi-Khanym Mosque, Shah-i-Zinda necropolis, and Registan madrasas is the single most recognizable visual signature of Uzbek architecture. This token is that tile.

### 1.2 New token: Pomegranate (the one addition this doc makes)

| Token | Hex | Usage |
|---|---|---|
| **Pomegranate** | `#A72608` | The single "high-energy" accent — used *only* for promo/discount badges, live/urgent indicators, and the ikat-ribbon card edge (§3.3). Never used for body text or large fills. Pomegranates are a recurring motif in Uzbek ceramics, painted miniatures, and Navruz (New Year) imagery — an authentic cultural reference, not an arbitrary "make it pop" red. |

This is the *only* new brand color needed. VisitSaudi's near-black dark-UI surfaces (navbar scrim, event card overlays) map directly onto our existing Midnight Emerald — no new token required there; it already reads as "dark, not pure black" the same way.

### 1.3 Functional colors (inherited, unchanged)

Success `#2D8A4E` / Warning `#D9972B` / Error `#C93B3B` — see `UI_UX_GUIDELINES.md` §4.2. Not part of the brand palette; used only for booking status, form validation, etc.

---

## 2. Typography

Inherited stack, unchanged: **Playfair Display** (display/headings), **Inter** (UI/body), **JetBrains Mono** (labels/data/prices). See `UI_UX_GUIDELINES.md` §3.

**New addition — Hero Display scale**, to reach VisitSaudi's editorial boldness (their H1 renders at 80px):

| Element | Size | Weight | Usage |
|---|---|---|---|
| **Hero Display** | 80px (48px mobile) | Playfair Display 700 | Homepage hero headline only |
| **Section Display** | 56px | Playfair Display 600 | *(already defined — UI_UX_GUIDELINES §3.2)* |

All-caps, letter-spaced (`0.1em`–`0.2em`) JetBrains Mono is used consistently for meta labels — city/category tags, region names on the map, eyebrow labels above headings. This pattern is already established (`"Curated by Admins"`, `"Hosted by Rural Business Owners"` etc. on the current landing page) — just keep applying it everywhere VisitSaudi uses its equivalent all-caps meta text.

No custom currency glyph is needed (VisitSaudi loads a font just for `﷼`) — UZS prices are formatted as plain numbers via `Intl.NumberFormat("uz-UZ")`, already implemented in `formatPrice`/service card components.

---

## 3. Card Families

Direct parallel to VisitSaudi's three deliberate card treatments (`visitsaudi_layout_breakdown.md` §6, "three distinct families").

### 3.1 Family 1 — Feature Cards (rounded, frosted-glass)

**Already built and shipped** — this is the "Destination Card" pattern documented in `UI_UX_GUIDELINES.md` §6.2: `rounded-lg` (6px), full-bleed photo, bottom gradient scrim (`rgba(10,35,32,0) → rgba(10,35,32,0.88)`), frosted-glass badge top-left, Playfair title + gold price + frosted circular CTA bottom.

**Usage:** hero-adjacent carousels — Destinations, Regional Experiences, Packages, and (new) Offers and Bookable Experiences. This is our answer to VisitSaudi's rounded-20px Swiper cards. We keep our tighter 6px radius rather than copying their 20px — it's already consistent with the rest of the shipped UI and changing it now would create visual whiplash across pages that already use it correctly.

### 3.2 Family 2 — Catalog Cards (flush, zero-radius)

**New pattern, not yet built.** For dense listing/grid pages where the goal is scannability over polish — VisitSaudi's Destinations-index and Things-To-Do grids.

- `border-radius: 0`. Full-bleed photo, tight grid gutter (8–12px), no card background/shadow.
- Caption overlay directly on the photo (small JetBrains Mono tag row top-left/top-right, e.g. `"SAMARKAND · CULTURAL"`), OR caption below the tile on the page background (bold Inter place/service name, no description) — pick per-page based on density needed (overlay = denser, below = airier).
- **Where this applies in the current codebase:** the `/service` grid (`ServiceListClient.tsx`) and the `/discover` destinations grid (`DiscoverClient.tsx`) currently both use Family 1 styling. Per §7 of this doc and the implementation plan, `/discover`'s main grid should switch to Family 2 (it's a dense "browse everything" catalog), while curated carousels (landing page sections, "Explore More Destinations") keep Family 1. This mirrors VisitSaudi exactly: same underlying data, two different card treatments depending on whether the section is a curated teaser or a full catalog.

### 3.3 Family 3 — Ikat-Ribbon Stat Cards

**New, bespoke — our equivalent of VisitSaudi's "torn ticket stub" zig-zag ribbon edge**, and the one truly signature card treatment worth building deliberately.

- White card, `rounded-lg` (6px), standard soft shadow.
- **Left edge**: a repeating vertical ikat-stripe pattern, ~12–16px wide, running the full height of the card. Implement as a CSS `repeating-linear-gradient` (diagonal, `115deg`, like the existing "Live Tourist Density" panel pattern in `apps/admin-portal/src/app/verification-hub/page.tsx`) cycling through Emerald → Gold → Turquoise → Pomegranate at low opacity (12–18%), or as a static SVG/PNG pattern tile if a hand-drawn ikat motif is sourced (see §5). This directly parallels VisitSaudi's diagonal zig-zag ribbon but uses a real Uzbek textile pattern instead of an abstract zig-zag.
- Content: big Playfair Display number in Midnight Emerald (e.g. `"8"`, `"500+"`, `"12,000+"`), short Inter label underneath, optional flat-illustration icon (§6).
- **Where this applies:** a new "Uzbekistan in Numbers" section (regions covered, verified providers, completed bookings, traveler reviews) — see implementation plan Phase 2. **Every number in this section must be a real aggregate query**, following the exact pattern already built for `apps/admin-portal/src/app/actions/dashboardActions.ts` (COUNT/SUM against `services`, `bookings`, `user_profiles`, `reviews` — service-role client, since RLS scopes most of these tables to their owner). No hardcoded stats — this was the entire point of the Stage 2 data-authenticity audit; don't reintroduce fake numbers under a prettier card.

---

## 4. Cultural Motif Library

VisitSaudi treats Islamic geometric pattern as a recurring *structural* device (divider bands, watermarks) and Arabic calligraphy as *content* (inside real photography, never as UI chrome). Uzbekistan's own decorative arts give us a richer, more specific vocabulary — use these instead of a generic "Islamic pattern," and don't substitute Arabic calligraphy (that's specifically Gulf/Saudi visual culture, not Uzbek).

| Motif | What it is | Where to use it |
|---|---|---|
| **Girih lattice** | Interlocking geometric star-and-polygon strapwork — covers the facades of the Registan, Shah-i-Zinda, and virtually every Timurid-era madrasa in Samarkand/Bukhara. | Faint full-bleed background watermark behind stat/impact sections (5–8% opacity, matching how VisitSaudi uses mashrabiya as texture). Repeating horizontal divider band above the footer, muted white-on-sand version. |
| **Ikat (*abr*) pattern** | Fergana Valley hand-dyed silk weaving — soft-edged, "blurred" geometric/floral stripes in saturated multicolor. Uzbekistan's most internationally recognized textile art (UNESCO Intangible Cultural Heritage). **This is the signature motif of this whole design language** — more distinctively Uzbek than girih, which is shared across the wider Islamic world. | Family 3 stat card ribbon edge (§3.3). Hero slider progress bar — a multicolor woven-stripe indicator, directly replacing VisitSaudi's magenta/teal/yellow bar with real ikat color logic (crimson/cobalt/saffron/emerald). Section-break micro-accents (a short ikat-stripe rule under an eyebrow label, sparingly). |
| **Suzani medallion** | Large hand-embroidered radial sun/star medallion, the centerpiece motif of traditional suzani wall hangings and bridal textiles. | Decorative background accent behind CTA/newsletter banners (large, faint, off-center — like VisitSaudi's arabesque corner-bleed on "Know Before You Go"). Inspiration for a rosette-shaped badge component (our answer to VisitSaudi's starburst discount sticker) — used on the Offers cards in Phase 2. |
| **Kashi tilework** | Turquoise/cobalt glazed majolica tile mosaic — literally the source of our existing Turquoise + Gold + Emerald tokens (§1.1). | No separate pattern needed here — its job is done by the color palette itself. Optionally: a tessellating tile-mosaic pattern as an *alternate* divider treatment for pages that already use a lot of girih (avoid overusing one pattern site-wide). |
| **Timurid monumental form** | Peshtaq (grand iwan portal), muqarnas (honeycomb vaulting), paired minarets, ribbed azure domes. | Photographic subject matter, not a graphic device — this is what the hero video/photography should actually show (Registan Square, Bibi-Khanym, Kalta Minor in Khiva). Optionally, an arch-silhouette (`clip-path` or SVG mask) framing a hero CTA block, echoing VisitSaudi's occasional use of architectural framing devices. |

**Explicit rule:** no Arabic (or any) calligraphy used as decoration. Where VisitSaudi bakes Arabic script into event posters as a cultural-authenticity device, our equivalent is real photography of the ikat weaving process, girih tile-cutting, or suzani embroidery in progress — craft-in-action imagery reads as more authentic for Uzbekistan than typography would.

---

## 5. Imagery Sourcing Rules

**Hard rule carried over from every prior instruction in this project: no mock/placeholder data.** Photography is content, not data — real photos of real places are required, but they must be *real photographs*, not AI-generated or stock "generic Central Asia" imagery that doesn't depict the actual landmark being named.

- **Primary source:** Unsplash (`images.unsplash.com`), same as the existing seed data (`packages/database/scripts/seed-full.mjs`, `supabase/seed.sql` already use real Unsplash photo URLs for Registan, Bukhara, Khiva, Chorsu Bazaar, Fergana ceramics, etc.). When sourcing new images for a new section, search Unsplash directly for the specific landmark/subject (`"Registan Square"`, `"Bukhara Kalyan minaret"`, `"Fergana Valley ikat weaving"`, `"Chimgan mountains Uzbekistan"`, `"Aral Sea Moynaq ship graveyard"`) rather than generic terms — specificity matters for authenticity.
- **Secondary source:** Wikimedia Commons, for landmark/architecture photography where a specific well-known public-domain or CC-licensed photo exists (search `commons.wikimedia.org` by landmark name).
- **Do not invent image URLs.** If an agent/developer implementing this plan cannot verify an Unsplash or Wikimedia URL actually resolves to a real photo, search live rather than guessing a plausible-looking `photo-xxxxxxxxx` ID — broken images are worse than fewer images.
- **Video** (for the hero slider, §7.1): source a small number of real, short (10–20s loopable) stock video clips of Uzbekistan — Registan Square, a Fergana Valley silk workshop, Chimgan mountains, a Bukhara bazaar — from a royalty-free source (Pexels Videos, Coverr). Same rule: verify the clip is real footage of the named location before using it, or use a static full-bleed photo hero as a fallback (a static hero is honest; a fake/generic "exotic bazaar" video pretending to be Uzbekistan is not).

---

## 6. Illustration Style

VisitSaudi uses a flat, friendly, isometric-ish 2D illustration style for anything that isn't real photography (stat-card icons, survey CTA graphic, guide-link icons) — keeping "human/explainer" moments visually distinct from "aspirational/photographic" travel content. Adopt the same *structural* role, Uzbek subject matter:

- **Palette:** muted secondary tones only — dusty turquoise, warm terracotta/gold, sand — never the saturated ikat colors (those are reserved for the ikat pattern itself, keeping illustrations calm/legible).
- **Subject vocabulary:** yurts, Silk Road caravan (camels + traders), pomegranates, plov cauldron (*kazan*), suzani textile folds, Registan silhouette, Chimgan/Tian Shan mountain range, Kyzylkum desert dunes, a traditional teahouse (*choyxona*) tea set.
- **Where used:** Family 3 stat cards (§3.3), "Know Before You Go"-equivalent guide-link section, empty states (already a pattern in this codebase — e.g. `ServiceListClient.tsx`'s "No experiences available yet" state — extend the same illustrated-empty-state approach rather than plain text where it's cheap to do).

---

## 7. Motion & Interaction Language

| Element | Spec |
|---|---|
| **Navbar** | Fixed, transparent + `backdrop-filter: blur(20px)` over Midnight Emerald at ~70% opacity while over the hero; transitions (`300ms`) to solid Sand/White on scroll. *(Already close to this — verify current `Navbar.tsx` implements the scroll-triggered opacity swap; if not, this is a Phase 1 implementation item.)* |
| **Hero slider** | Autoplaying, muted, full-bleed background video (see §5 sourcing rules) with a bottom gradient scrim; 3–4 slides; **progress indicator is the ikat-stripe gradient bar** (§4) animating left-to-right per slide instead of dots. |
| **Carousels** | Swiper.js (or equivalent), one floating circular "next" arrow on the right edge, consistent across every horizontal-scroll section — already the pattern used by the existing `motion`/framer-motion stagger-fade-up entrance on landing sections; keep using framer-motion for viewport-triggered entrances, reserve Swiper specifically for the horizontal-drag carousel mechanic itself. |
| **Cards** | Family 1 hover: `-4px` lift + image scale(1.05) — already implemented (`ServiceCard`, `DiscoverClient` cards). Apply the same hover language to any new Family 1 cards (Offers, Bookable Experiences). |
| **Map pins** | Two-tier, matching VisitSaudi's icon-pin vs. photo-pin split (see implementation plan Phase 5 for the interactive map spec) — solid Turquoise icon pins for quick category browsing, circular photo-thumbnail pins with a Gold ring border for featured/high-priority destinations. |
| **Persistent floating elements** | No AI-assistant-avatar equivalent is in scope right now (that's a Stage 3 "Contextual Translator" concern, already on the roadmap in `docs/PROJECT_LIFECYCLE.md` — don't duplicate it here as a separate widget). A feedback tab is optional/low-priority; not required for VisitSaudi-parity. |

---

## 8. What this document deliberately does NOT specify

To keep this a *design language* (durable, structural) rather than an *implementation task list* (which changes as code changes), this document does not enumerate exact component file paths, exact Tailwind class names, or migration SQL. That level of detail — mapped against the actual current state of all 4 apps — lives in `docs/VISITSAUDI_TRANSFORMATION_PLAN.md`, which should be read second, after this document, and re-generated/updated if the codebase structure changes significantly (this doc should stay accurate much longer than that one).
