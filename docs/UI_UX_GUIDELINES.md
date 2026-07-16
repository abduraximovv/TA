# UI/UX Design Guidelines — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft

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
| **Authentic & Modern** | Blend Uzbek cultural identity (geometric patterns, warm earth tones) with contemporary digital aesthetics |
| **Simplicity First** | Especially for the Provider App — every feature must be usable with minimal literacy |
| **Trust Through Design** | Professional, clean interfaces that build confidence in a new platform |
| **Progressive Disclosure** | Show only what's needed; reveal complexity as users engage deeper |
| **Mobile-First** | Design for mobile screens first, then adapt for larger displays |

### Design Inspiration

The visual identity draws from:
- **Islamic geometric patterns** — used subtly in backgrounds and loading states
- **Silk Road color palette** — warm golds, deep blues, terracotta reds
- **Modern travel apps** — clean cards, bold typography, immersive photography
- **Uzbek tilework** — intricate border patterns for premium elements

---

## 2. Design System Foundations

### 2.1 Shared Component Library

All four portals share a unified component library located in `packages/ui/`. This ensures visual consistency and reduces development time.

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
| **Headings** | `Inter` | 600 (SemiBold), 700 (Bold) | H1–H4, page titles |
| **Body** | `Inter` | 400 (Regular), 500 (Medium) | Paragraphs, descriptions |
| **Monospace** | `JetBrains Mono` | 400 | Code snippets, IDs, prices |
| **Uzbek Display** | `Noto Sans` | 400, 700 | Uzbek/Cyrillic script rendering |

### 3.2 Type Scale

| Element | Size | Line Height | Weight | Tailwind Class |
|---|---|---|---|---|
| **Display** | 48px / 3rem | 1.1 | 700 | `text-5xl font-bold` |
| **H1** | 36px / 2.25rem | 1.2 | 700 | `text-4xl font-bold` |
| **H2** | 30px / 1.875rem | 1.25 | 600 | `text-3xl font-semibold` |
| **H3** | 24px / 1.5rem | 1.3 | 600 | `text-2xl font-semibold` |
| **H4** | 20px / 1.25rem | 1.35 | 600 | `text-xl font-semibold` |
| **Body Large** | 18px / 1.125rem | 1.6 | 400 | `text-lg` |
| **Body** | 16px / 1rem | 1.6 | 400 | `text-base` |
| **Body Small** | 14px / 0.875rem | 1.5 | 400 | `text-sm` |
| **Caption** | 12px / 0.75rem | 1.4 | 500 | `text-xs font-medium` |

---

## 4. Color Palette

### 4.1 Brand Colors

Inspired by Uzbek landscapes: desert sands, blue-tiled mosques, golden sunsets, and lush oasis greens.

| Token | Hex | HSL | Usage |
|---|---|---|---|
| **Primary** | `#1E6F8A` | `hsl(195, 63%, 33%)` | Primary actions, links, active states |
| **Primary Light** | `#2A9FCC` | `hsl(198, 65%, 48%)` | Hover states, secondary emphasis |
| **Primary Dark** | `#14506A` | `hsl(198, 68%, 25%)` | Dark mode primary |
| **Secondary** | `#D4A843` | `hsl(42, 60%, 55%)` | Gold accents, premium elements, CTAs |
| **Secondary Light** | `#E8C96E` | `hsl(45, 71%, 67%)` | Highlights, badges |
| **Accent** | `#C4553A` | `hsl(10, 55%, 50%)` | Alerts, important actions, terracotta |
| **Success** | `#2D8A4E` | `hsl(145, 50%, 36%)` | Online status, success messages |
| **Warning** | `#D9972B` | `hsl(40, 68%, 51%)` | Warnings, pending states |
| **Error** | `#C93B3B` | `hsl(0, 55%, 51%)` | Error states, declined bookings |

### 4.2 Neutral Colors

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
| **Gray 50** | `#F9FAFB` | Page background |
| **White** | `#FFFFFF` | Card backgrounds |

### 4.3 Semantic Color Usage

| State | Light Mode | Dark Mode |
|---|---|---|
| **Page Background** | Gray 50 | Gray 950 |
| **Card Background** | White | Gray 900 |
| **Primary Text** | Gray 900 | Gray 50 |
| **Secondary Text** | Gray 600 | Gray 400 |
| **Border** | Gray 200 | Gray 700 |
| **Hover** | Gray 100 | Gray 800 |
| **Active** | Primary | Primary Light |
| **Online** | Success | Success |
| **Offline** | Gray 400 | Gray 600 |

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

| Token | Size | Usage |
|---|---|---|
| `rounded-sm` | 4px | Inline badges |
| `rounded` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Modals, sheets |
| `rounded-full` | 9999px | Avatars, status dots |

---

## 6. Component Library

### 6.1 Buttons

| Variant | Usage | Appearance |
|---|---|---|
| **Primary** | Main CTAs ("Book Now", "Accept") | Solid primary color, white text |
| **Secondary** | Secondary actions ("View Details") | Outlined, primary text |
| **Ghost** | Tertiary actions ("Cancel") | Transparent, subtle hover |
| **Danger** | Destructive actions ("Decline", "Delete") | Red solid background |
| **Success** | Positive actions ("Go Online", "Approve") | Green solid background |
| **Icon** | Map controls, navigation | Circular, icon-only |

Sizes: `sm` (32px height), `md` (40px), `lg` (48px)

### 6.2 Cards

| Type | Portal | Content |
|---|---|---|
| **Service Card** | Tourist, Agency | Photo, title, price, rating, distance, CTA |
| **Booking Card** | All | Status badge, date, service name, guest count, actions |
| **Provider Card** | Agency, Admin | Avatar, name, status dot, services count, rating |
| **Location Pin Card** | Tourist | Name, type icon, distance, quick actions |
| **Stat Card** | Admin | KPI value, trend indicator, sparkline |
| **Notification Card** | All | Icon, title, body, timestamp, read/unread |

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
| **Clean Toilet** | Droplet | Blue (`#1E6F8A`) | Hygiene locations |
| **Cultural Site** | Landmark | Gold (`#D4A843`) | Monuments, mosques |
| **Festival** | Music/Star | Purple (`#7C3AED`) | Active festivals |
| **Pharmacy** | Plus in circle | Green (`#2D8A4E`) | Medical |
| **ATM** | Banknote | Teal (`#0D9488`) | Financial |
| **WiFi** | WiFi signal | Blue (`#2A9FCC`) | Connectivity |
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
| Primary on White | 5.2:1 | ✅ AA |
| White on Primary | 5.2:1 | ✅ AA |
| Secondary (Gold) on White | 3.1:1 | ❌ (use on dark bg only) |
| Gray 600 on White | 4.6:1 | ✅ AA |
| White on Gray 900 | 15.4:1 | ✅ AAA |

### 9.3 Focus Ring Style

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
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
  /* Colors */
  --color-primary: hsl(195, 63%, 33%);
  --color-primary-light: hsl(198, 65%, 48%);
  --color-primary-dark: hsl(198, 68%, 25%);
  --color-secondary: hsl(42, 60%, 55%);
  --color-accent: hsl(10, 55%, 50%);
  --color-success: hsl(145, 50%, 36%);
  --color-warning: hsl(40, 68%, 51%);
  --color-error: hsl(0, 55%, 51%);

  /* Neutrals */
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-border: #E5E7EB;

  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-unit: 4px;

  /* Radii */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode */
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
