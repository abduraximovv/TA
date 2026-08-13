# UI/UX Design Guidelines — Uzbekistan Digital Tourism Ecosystem

**Version:** 2.0  
**Date:** 2026-08-01  
**Status:** Draft

> **Design system update (2.0):** The brand palette and type system below reflect the
> "Immersive Minimalism" design language (source: Claude Design project `Design System Kitchen
> Sink.dc.html`, Uzbekistan Digital Tourism Ecosystem — Design Tokens v1.0), currently
> implemented on the **Tourist WebApp landing/marketing pages** (`apps/tourist-webapp/src/components/landing/*`,
> `Navbar.tsx`, `Footer.tsx`) **and, as of the AI features (chat, menu scanner, itinerary
> planner), on those full-screen panels too** (`apps/tourist-webapp/src/components/ai/*`,
> `apps/tourist-webapp/src/components/booking/ItineraryGenerator.tsx`,
> `apps/tourist-webapp/src/app/ai-chat/page.tsx`). It's applied there via inline hex values, not
> yet wired into `packages/ui/tailwind.config.ts` (which still carries an older, unrelated
> "Travelora" blue/coral palette used by other in-progress screens). Treat this doc as the target
> system for the shared component library; §2.1 lists the migration gap.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System Foundations](#2-design-system-foundations)
3. [Typography](#3-typography)
4. [Color Palette](#4-color-palette)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Library](#6-component-library)
7. [Iconography](#7-iconography)
8. [Responsive & PWA Design Standards](#8-responsive--pwa-design-standards)
9. [Accessibility (WCAG AA)](#9-accessibility-wcag-aa)
10. [Portal-Specific UX Flows](#10-portal-specific-ux-flows)
11. [Micro-Interactions & Animations](#11-micro-interactions--animations)
12. [Design Tokens](#12-design-tokens)

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|---|---|
| **Immersive Minimalism** | Spacious, cinematic layouts — let photography and typography carry the page instead of decoration |
| **Authentic & Modern** | Blend Uzbek cultural identity with a restrained, editorial digital aesthetic |
| **Simplicity First** | Especially for the Provider App — every feature must be usable with minimal literacy |
| **Trust Through Design** | Professional, clean interfaces that build confidence in a new platform |
| **Progressive Disclosure** | Show only what's needed; reveal complexity as users engage deeper |
| **Mobile-First** | Design for mobile screens first, then adapt for larger displays |

### Design Inspiration

The visual identity draws from:
- **Silk Road travel journals** — serif display headlines (Playfair Display), generous whitespace, muted sand backgrounds
- **Midnight emerald & brass gold** — deep emerald grounding, warm gold accents on premium/CTA elements, a muted turquoise for secondary actions
- **Frosted-glass overlays** — badges and circular CTAs on photography use `backdrop-filter: blur()` over a dark gradient scrim, not solid chips
- **Modern travel apps** — clean cards, immersive full-bleed photography, confident negative space

---

## 2. Design System Foundations

### 2.1 Shared Component Library

All four portals share a unified component library located in `packages/ui/`. This ensures visual consistency and reduces development time.

> **Migration gap:** `packages/ui/tailwind.config.ts` has not yet been updated with the Immersive
> Minimalism tokens in §4/§12 below — it still defines an older "Travelora" blue/coral palette.
> The Tourist WebApp landing page, and now the AI feature panels (`components/ai/GeometricLoader.tsx`,
> `components/ai/MenuScanner.tsx`, `components/booking/ItineraryGenerator.tsx`, `app/ai-chat/page.tsx`),
> implement the new system the same way — inline hex values on each element instead of Tailwind
> theme classes. The color values themselves are correct and consistent with §4 wherever checked;
> only the delivery mechanism (inline styles vs. Tailwind utilities) is the gap. Moving the tokens
> into the shared Tailwind config (so `bg-emerald-950`, `text-gold-400`, etc. work platform-wide)
> is outstanding follow-up work, not yet done.

```
packages/ui/
├── components/
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   ├── Badge/
│   ├── Avatar/
│   ├── MapPin/
│   ├── Navbar/
│   ├── Sidebar/
│   ├── StatusToggle/
│   ├── BookingCard/
│   ├── ServiceCard/
│   ├── KanbanBoard/
│   ├── Calendar/
│   └── ...
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── animations.css
├── hooks/
│   ├── useMediaQuery.ts
│   └── useTheme.ts
└── utils/
    ├── cn.ts (classname merger)
    └── formatters.ts
```

### 2.2 Technology

| Tool | Purpose |
|---|---|
| **Tailwind CSS** | Utility-first styling framework |
| **Radix UI** | Unstyled, accessible primitives for complex components |
| **Framer Motion** | Animation library for micro-interactions |
| **Lucide Icons** | Consistent icon set |
| **next/font** | Optimized font loading |

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Display / Headings** | `Playfair Display` | 500, 600, 700 | Display type, H1–H2, hero headlines, card titles |
| **UI / Body** | `Inter` | 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold) | Paragraphs, descriptions, buttons, form labels |
| **Labels / Data** | `JetBrains Mono` | 400, 500 | Eyebrow labels, badges, prices, IDs, timestamps |
| **Uzbek Display** | `Noto Sans` | 400, 700 | Uzbek/Cyrillic script rendering (supplementary — not part of the core three-font system) |

Loaded via Google Fonts: `Playfair+Display:wght@500;600;700` and `Inter:wght@400;500;600;700`,
alongside the existing `JetBrains+Mono:wght@400;500`.

### 3.2 Type Scale

| Element | Size | Line Height | Weight | Font | Tailwind Class |
|---|---|---|---|---|---|
| **Display** | 56px | 1.08 | 600 | Playfair Display | `text-[56px] font-serif font-semibold leading-[1.08]` |
| **H1** | 40px | 1.15 | 600 | Playfair Display | `text-[40px] font-serif font-semibold` |
| **H2** | 28px | 1.2 | 600 | Playfair Display | `text-[28px] font-serif font-semibold` |
| **Body** | 16px / 1rem | 1.6 | 400 | Inter | `text-base` |
| **UI Label** | 14px / 0.875rem | 1.4 | 600 | Inter | `text-sm font-semibold` |
| **Mono / Data** | 12px / 0.75rem | 1.4 | 400 | JetBrains Mono | `font-mono text-xs` |

`font-serif` should map to Playfair Display (not the browser default serif) once the shared
Tailwind config picks up the new `fontFamily` tokens — see §2.1.

---

## 4. Color Palette

### 4.1 Brand Colors — "Immersive Minimalism" (Design Tokens v1.0)

Five core tokens, deliberately small. `tailwind.config.js → theme.extend.colors` (target — see
migration gap in §2.1).

| Token | Hex | Tailwind Name | Usage |
|---|---|---|---|
| **Sand / Beige** | `#F9F8F5` | `sand-50` | Page background |
| **Midnight Emerald** | `#0A2320` | `emerald-950` | Primary text, dark surfaces, primary button background |
| **Crisp White** | `#FFFFFF` | `white` | Card backgrounds |
| **Gold** | `#C5A880` | `gold-400` | CTA buttons, price labels, premium accents |
| **Turquoise** | `#006B70` | `teal-700` | Secondary actions (e.g. "Go Online"), links |

### 4.2 Functional / Status Colors

Not part of the visual rebrand — these are unchanged from the previous palette and still needed
for booking status, alerts, and map-pin categories regardless of brand styling.

| Token | Hex | HSL | Usage |
|---|---|---|---|
| **Success** | `#2D8A4E` | `hsl(145, 50%, 36%)` | Online status, success messages, accepted bookings |
| **Warning** | `#D9972B` | `hsl(40, 68%, 51%)` | Warnings, pending states |
| **Error** | `#C93B3B` | `hsl(0, 55%, 51%)` | Error states, declined bookings |

### 4.3 Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| **Gray 950** | `#0A0E14` | Dark mode background |
| **Gray 900** | `#111827` | Dark mode card background |
| **Gray 800** | `#1F2937` | Dark mode elevated surfaces |
| **Gray 700** | `#374151` | Dark mode borders |
| **Gray 600** | `#4B5563` | Muted text |
| **Gray 500** | `#6B7280` | Placeholder text |
| **Gray 400** | `#9CA3AF` | Disabled states |
| **Gray 300** | `#D1D5DB` | Light borders |
| **Gray 200** | `#E5E7EB` | Light dividers |
| **Gray 100** | `#F3F4F6` | Light backgrounds |

### 4.4 Semantic Color Usage

| State | Value |
|---|---|
| **Page Background** | Sand `#F9F8F5` |
| **Card Background** | White |
| **Primary Text** | Midnight Emerald `#0A2320` |
| **Secondary Text** | Midnight Emerald at 55–65% opacity, e.g. `rgba(10,35,32,0.65)` |
| **Border** | Midnight Emerald at 8–10% opacity, e.g. `rgba(10,35,32,0.08)` |
| **Primary CTA** | Emerald background, Sand text |
| **Secondary CTA** | Gold background, Emerald text |
| **Tertiary Action** | Turquoise background, White text |
| **Online** | Success |
| **Offline** | Gray 400 |

Dark-mode equivalents for this palette are not yet defined — the legacy dark-mode tokens in
§12.1 predate this system and should be treated as provisional until revisited.

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Based on a 4px grid system:

| Token | Size | Tailwind | Usage |
|---|---|---|---|
| `space-1` | 4px | `p-1` | Inner padding, tight gaps |
| `space-2` | 8px | `p-2` | Inline element spacing |
| `space-3` | 12px | `p-3` | Small component padding |
| `space-4` | 16px | `p-4` | Standard component padding |
| `space-5` | 20px | `p-5` | Card padding |
| `space-6` | 24px | `p-6` | Section padding |
| `space-8` | 32px | `p-8` | Large section gaps |
| `space-10` | 40px | `p-10` | Page-level vertical spacing |
| `space-12` | 48px | `p-12` | Major section dividers |
| `space-16` | 64px | `p-16` | Hero sections |

### 5.2 Layout Patterns

| Pattern | Use Case | Implementation |
|---|---|---|
| **Single Column** | Tourist PWA, Provider App | `max-w-lg mx-auto` |
| **Two Column** | Agency dashboard (sidebar + content) | `grid grid-cols-[280px_1fr]` |
| **Three Column** | Admin portal (sidebar + content + details) | `grid grid-cols-[240px_1fr_320px]` |
| **Full Bleed** | Maps, heatmaps | `w-full h-screen` |
| **Card Grid** | Service listings, provider inventory | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` |

### 5.3 Border Radius

Immersive Minimalism favors sharper, more restrained corners than the previous system —
straight edges read as more editorial, reserving fully-rounded shapes for pill/circular controls.

| Token | Size | Usage |
|---|---|---|
| `rounded-sm` | 3px | Buttons, inputs |
| `rounded` | 4px | Color swatches, small tiles |
| `rounded-lg` | 6px | Cards |
| `rounded-xl` | 16px | Modals, sheets |
| `rounded-full` | 9999px | Avatars, status dots, badges, frosted circular CTAs |

> **Implementation note:** full-screen overlay panels — `AuthModal.tsx` and the newer AI feature
> panels (`MenuScanner.tsx`, `ItineraryGenerator.tsx`, `app/ai-chat/page.tsx`) — consistently use
> larger, softer radii than the table above for the surfaces inside them: **12px** for text/number/date
> inputs and **16px** for cards, image previews, chat bubbles, and the upload dropzone, rather
> than `rounded-sm` (3px, inputs) or `rounded-lg` (6px, cards). 16px is within the documented
> `rounded-xl` value but that token is scoped above to "Modals, sheets," not card- or input-level
> elements; 12px has no token in this scale at all. Treat 12px/16px as the de-facto radius pairing
> for content inside modal/full-screen overlay surfaces until §12.1's token set is revisited to
> include it explicitly.

---

## 6. Component Library

### 6.1 Buttons

`components/ui/Button.tsx`. All variants: Inter 600, 15px label, `rounded-sm` (3px), ~14px/28px
padding.

| Variant | Usage | Appearance |
|---|---|---|
| **Primary** | Main CTAs ("Explore the Silk Road", "Book Now") | Emerald `#0A2320` bg, Sand `#F9F8F5` text; hover `#123833` |
| **Secondary (Gold)** | High-emphasis commercial actions ("Book Experience") | Gold `#C5A880` bg, Emerald text; hover `#b89a6f` |
| **Outline** | Secondary actions ("View Itinerary") | Transparent bg, 1px Emerald-at-30%-opacity border, Emerald text; hover fills border + faint bg tint |
| **Teal Action** | Provider-side positive actions ("Go Online") | Turquoise `#006B70` bg, White text; hover `#00565a` |
| **Danger** | Destructive actions ("Decline", "Delete") | Error `#C93B3B` solid background, white text |
| **Disabled** | Any variant, disabled state | Emerald-at-5%-opacity bg, Emerald-at-40%-opacity text, `cursor: not-allowed` |
| **Icon** | Map controls, navigation, card CTAs | Circular, frosted-glass (see §6.2), icon-only |

Sizes: `sm` (32px height), `md` (40px), `lg` (48px)

### 6.2 Cards

| Type | Portal | Content |
|---|---|---|
| **Destination Card** | Tourist (landing) | Full-bleed photo, frosted-glass badge, bottom gradient scrim, Playfair title, price + frosted circular CTA — see below |
| **Service Card** | Tourist, Agency | Photo, title, price, rating, distance, CTA |
| **Booking Card** | All | Status badge, date, service name, guest count, actions |
| **Provider Card** | Agency, Admin | Avatar, name, status dot, services count, rating |
| **Location Pin Card** | Tourist | Name, type icon, distance, quick actions |
| **Stat Card** | Admin | KPI value, trend indicator, sparkline |
| **Notification Card** | All | Icon, title, body, timestamp, read/unread |

#### Destination Card — frosted-glass overlay pattern

`components/ui/DestinationCard.tsx`. Reference: Kitchen Sink "Destination Card."

- Container: `rounded-lg` (6px), Emerald `#0A2320` background, fixed height (440px in the
  reference), `box-shadow: 0 20px 40px -12px rgba(10,35,32,0.25)`
- Photo fills the container (`position: absolute; inset: 0`)
- Bottom scrim: `linear-gradient(180deg, rgba(10,35,32,0) 40%, rgba(10,35,32,0.88) 100%)` over the photo
- Badge (top-left): pill, `background: rgba(249,248,245,0.14)`, `backdrop-filter: blur(12px)`,
  `border: 1px solid rgba(255,255,255,0.18)`, JetBrains Mono 11px uppercase, white text
- Content (bottom, over the scrim): Playfair Display 25px/600 title in white, Inter 14px
  description at 75% white opacity, JetBrains Mono 13px price in Gold `#C5A880`, and a 36px
  circular frosted CTA (`background: rgba(249,248,245,0.12)`, `backdrop-filter: blur(10px)`,
  1px white-18%-opacity border) with a directional arrow icon

### 6.3 Forms

| Component | Description |
|---|---|
| **TextInput** | Standard text field with label, helper text, error state |
| **TextArea** | Multi-line input for descriptions |
| **Select** | Dropdown with search (Radix Select) |
| **DatePicker** | Calendar popup for booking dates |
| **FileUpload** | Drag-and-drop zone with preview (photos) |
| **Toggle** | The critical Online/Offline switch for providers |
| **PriceInput** | Numeric input with currency selector |

### 6.4 Navigation

| Component | Portal | Type |
|---|---|---|
| **Bottom Navigation** | Tourist PWA, Provider App | Mobile tab bar (Map, Scan, Book, Profile) |
| **Sidebar** | Agency Portal, Admin Portal | Collapsible desktop sidebar |
| **Top Bar** | All | Logo, search, notifications bell, user avatar |
| **Breadcrumbs** | Agency, Admin | Page hierarchy trail |

### 6.5 Data Display

| Component | Use Case |
|---|---|
| **DataTable** | Admin verification hub, analytics |
| **KanbanBoard** | Agency booking CRM |
| **Calendar** | Itinerary Canvas |
| **MapView** | Survival Map, Heatmap |
| **Chart** | Admin analytics (line, bar, donut) |
| **Badge** | Booking status, user role, service category |
| **EmptyState** | No results, first-time user prompts |

---

## 7. Iconography

### 7.1 Icon Library

**Primary:** Lucide Icons (MIT license, consistent stroke width)

### 7.2 Custom Icons (Map Pins)

| Pin | Icon | Color | Usage |
|---|---|---|---|
| **SOS Hub** | Shield with cross | Red (`#C93B3B`) | Emergency locations |
| **Clean Toilet** | Droplet | Turquoise (`#006B70`) | Hygiene locations |
| **Cultural Site** | Landmark | Gold (`#C5A880`) | Monuments, mosques |
| **Festival** | Music/Star | Purple (`#7C3AED`) | Active festivals |
| **Pharmacy** | Plus in circle | Green (`#2D8A4E`) | Medical |
| **ATM** | Banknote | Teal (`#0D9488`) | Financial |
| **WiFi** | WiFi signal | Turquoise (`#006B70`) | Connectivity |
| **Water** | Glass | Cyan (`#06B6D4`) | Drinking water |

---

## 8. Responsive & PWA Design Standards

### 8.1 Breakpoints

| Name | Min Width | Target |
|---|---|---|
| **Mobile (xs)** | 0px | Phones (portrait) |
| **Mobile (sm)** | 640px | Phones (landscape), small tablets |
| **Tablet (md)** | 768px | Tablets (portrait) |
| **Desktop (lg)** | 1024px | Tablets (landscape), laptops |
| **Wide (xl)** | 1280px | Desktop monitors |
| **Ultra-wide (2xl)** | 1536px | Large monitors |

### 8.2 Portal Responsive Strategy

| Portal | Primary Viewport | Responsive Range |
|---|---|---|
| **Tourist WebApp** | Mobile (xs–sm) | xs → xl |
| **Provider App** | Mobile (xs–sm) | xs → md |
| **Agency Portal** | Desktop (lg–xl) | md → 2xl |
| **Admin Portal** | Desktop (lg–xl) | lg → 2xl |

### 8.3 PWA Requirements

| Requirement | Implementation |
|---|---|
| **App Manifest** | `manifest.json` with name, icons (192px, 512px), theme color |
| **Splash Screen** | Custom splash with logo on primary background |
| **Status Bar** | Theme-colored status bar on Android/iOS |
| **Safe Areas** | Respect notch and home indicator via `env(safe-area-inset-*)` |
| **Touch Targets** | Minimum 44×44px for all interactive elements |
| **Offline Page** | Branded offline fallback when network is unavailable |

### 8.4 Orientation

| Portal | Orientation Support |
|---|---|
| Tourist App | Portrait primary; landscape for maps |
| Provider App | Portrait only |
| Agency Portal | Landscape primary |
| Admin Portal | Landscape only |

---

## 9. Accessibility (WCAG AA)

### 9.1 Requirements

| Standard | Requirement | Implementation |
|---|---|---|
| **Color Contrast** | 4.5:1 minimum for text | All color pairs validated |
| **Focus Indicators** | Visible focus ring on all interactive elements | 2px ring, primary color |
| **Screen Readers** | Full ARIA labeling | `aria-label`, `role`, `aria-live` |
| **Keyboard Nav** | All features accessible via keyboard | Tab order, Enter/Space activation |
| **Alt Text** | All images have descriptive alt text | Enforced via ESLint |
| **Form Labels** | All inputs have associated labels | `<label htmlFor>` or `aria-label` |
| **Error Messages** | Inline, descriptive error messages | `aria-describedby` |
| **Reduced Motion** | Respect `prefers-reduced-motion` | Disable animations when set |
| **Text Resizing** | Support up to 200% zoom | Relative units (`rem`, `em`) |

### 9.2 Color Contrast Validation

| Pair | Ratio | Pass |
|---|---|---|
| Emerald on Sand | 15.5:1 | ✅ AAA |
| White on Emerald | 16.5:1 | ✅ AAA |
| Gold on Emerald | 7.3:1 | ✅ AAA (gold text/labels on dark surfaces) |
| Gold on White | 2.3:1 | ❌ (gold is a fill/accent color only — never use as text on light backgrounds) |
| Gray 600 on White | 4.6:1 | ✅ AA |
| White on Gray 900 | 15.4:1 | ✅ AAA |

### 9.3 Focus Ring Style

```css
:focus-visible {
  outline: 2px solid var(--color-turquoise);
  outline-offset: 2px;
  border-radius: var(--radius);
}
```

---

## 10. Portal-Specific UX Flows

### 10.1 Tourist WebApp — Key Flows

**Flow 1: Survival Map Navigation**
```
Launch App → Map loads with current location → 
See categorized pins around user → Tap a pin → 
Pin card slides up (name, type, distance) → 
"Get Directions" opens native maps app
```

**Flow 2: Menu Scanning (Taste & Trust)**
```
Tap "Scan Menu" → Camera opens → 
Point at menu → Capture photo → 
Loading animation (3–5 sec) → 
Dish cards appear (translated name, description, allergens) → 
Tap dish for details → Warning badges highlight restrictions
```

**Flow 3: Booking a Masterclass**
```
Browse Discovery feed → Tap service card → 
Service detail page (photos, description, reviews) → 
"Book Now" → Select date + guests → 
Confirm → Booking pending notification → 
Provider accepts → Confirmation screen with details
```

### 10.2 Provider App — Key Flows

**Flow 1: Going Online**
```
Open app → Main screen shows giant toggle → 
Tap toggle ON → Green "You're Online" state → 
Agencies and tourists can now see and book you → 
Tap toggle OFF → Gray "Offline" state
```

**Flow 2: Handling a Booking**
```
Push notification → "New booking request!" → 
Tap → See booking details (date, guests, notes) → 
Big green "Accept" or red "Decline" buttons → 
Tap Accept → Booking confirmed → 
Tourist receives notification
```

### 10.3 Agency Portal — Key Flows

**Flow 1: Building an Itinerary**
```
Dashboard → "New Itinerary" → 
Enter trip details (dates, tourist) → 
Left sidebar: Provider inventory (filter by available) → 
Drag service cards onto calendar grid → 
Price auto-calculates → 
"Share with Client" → Tourist receives link
```

**Flow 2: Managing Bookings (CRM)**
```
Dashboard → Bookings tab → 
Kanban board (Pending | Accepted | Confirmed | Completed) → 
Drag card to new status → 
Click card for details → 
Contact provider or tourist inline
```

### 10.4 Admin Portal — Key Flows

**Flow 1: Verifying a Provider**
```
Dashboard → Verification Hub → 
Table of pending providers → 
Click row → See profile, photos, documents → 
"Approve" or "Reject" (with reason) → 
Provider receives notification
```

**Flow 2: Monitoring Heatmap**
```
Dashboard → Heatmap tab → 
Full-screen Mapbox map → 
Density overlay updates every 60 seconds → 
Toggle between cities → 
Zoom into hotspots for detail
```

---

## 11. Micro-Interactions & Animations

### 11.1 Animation Principles

| Principle | Guideline |
|---|---|
| **Duration** | 150–300ms for UI transitions; 300–500ms for page transitions |
| **Easing** | `cubic-bezier(0.4, 0, 0.2, 1)` for standard; `spring` for playful elements |
| **Purpose** | Every animation must serve UX (feedback, orientation, delight) |
| **Performance** | Animate only `transform` and `opacity` (GPU-accelerated) |
| **Accessibility** | Respect `prefers-reduced-motion` — reduce to instant transitions |

### 11.2 Key Animations

| Element | Animation | Duration |
|---|---|---|
| **Page Transitions** | Fade + slide up | 300ms |
| **Card Hover** | Subtle lift (translateY -2px) + shadow | 200ms |
| **Button Press** | Scale down to 0.98 | 100ms |
| **Toggle ON/OFF** | Slide + color transition | 250ms |
| **Map Pin Appear** | Drop + bounce | 400ms |
| **Booking Status Change** | Card flash (green/red) | 300ms |
| **Loading State** | Geometric pattern pulse (Uzbek-inspired) | Loop |
| **Menu Scan Result** | Cards stagger in from bottom | 50ms per card |
| **Notification Bell** | Shake + badge count pop | 300ms |
| **Pull to Refresh** | Geometric spinner rotation | Loop |

### 11.3 Loading States

```
Skeleton Loading: Shimmer effect on card placeholders
Spinner: Rotating Uzbek geometric pattern (custom SVG)
Progress Bar: Thin, primary-colored bar at top of viewport
Toast: Slide in from top-right, auto-dismiss after 5 seconds
```

---

## 12. Design Tokens

### 12.1 CSS Custom Properties

```css
:root {
  /* Brand colors — Immersive Minimalism (Design Tokens v1.0) */
  --color-sand: #F9F8F5;      /* sand-50 — page background */
  --color-emerald: #0A2320;   /* emerald-950 — primary text, dark surfaces */
  --color-white: #FFFFFF;
  --color-gold: #C5A880;      /* gold-400 — CTAs, price labels */
  --color-turquoise: #006B70; /* teal-700 — secondary actions */

  /* Functional / status colors (unchanged by the rebrand) */
  --color-success: hsl(145, 50%, 36%);
  --color-warning: hsl(40, 68%, 51%);
  --color-error: hsl(0, 55%, 51%);

  /* Semantic aliases */
  --color-bg: var(--color-sand);
  --color-surface: var(--color-white);
  --color-text-primary: var(--color-emerald);
  --color-text-secondary: rgba(10, 35, 32, 0.65);
  --color-border: rgba(10, 35, 32, 0.08);

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-unit: 4px;

  /* Radii */
  --radius-sm: 3px;
  --radius: 4px;
  --radius-lg: 6px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-card: 0 20px 40px -12px rgba(10,35,32,0.25); /* Destination Card */

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode — provisional, predates the Immersive Minimalism system (see §4.4) */
[data-theme="dark"] {
  --color-bg: #0A0E14;
  --color-surface: #111827;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-border: #374151;
}
```

---

*This design guide is a living document. Specific component implementations will be refined during development sprints with designer input.*
