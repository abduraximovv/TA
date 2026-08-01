# Project Development Lifecycle — Uzbekistan Digital Tourism Ecosystem

**Version:** 2.0 (UI-First Strategy)
**Date:** 2026-07-19
**Status:** Active
**Purpose:** Track staged project development from inception to full production launch, prioritizing a premium UI and foundational backend architecture.

---

## Table of Contents

1. [Lifecycle Overview](#1-lifecycle-overview)
2. [Stage 0 — Infrastructure & Setup](#2-stage-0--infrastructure--setup)
3. [Stage 1 — Premium Visual Identity & Core Architecture](#3-stage-1--premium-visual-identity--core-architecture)
4. [Stage 2 — Core Business Workflows & Transactions](#4-stage-2--core-business-workflows--transactions)
5. [Stage 3 — Advanced Ecosystem Features](#5-stage-3--advanced-ecosystem-features)
6. [Stage 4 — Compliance, Scale & Launch](#6-stage-4--compliance-scale--launch)
7. [Progress Tracking Dashboard](#7-progress-tracking-dashboard)

---

## 1. Lifecycle Overview

### Strategic Shift: UI-First & "Visit Saudi" Aesthetic

To establish immediate trust and deliver a world-class experience, the project has shifted to a **UI-First** methodology for Stage 1. 
Instead of building features vertically (frontend + backend simultaneously), we will build the entire platform visually, mapping out every user journey in high-fidelity with real database connections and massive seed data.

* **Design Standard:** The aesthetic target is the **Visit Saudi** official portal (premium layouts, smooth micro-animations, minimalist informational density).
* **Real Foundations:** No mock APIs. The UI will be powered by real Supabase routing and database schemas, populated entirely by comprehensive seed scripts.
* **Context-Dependent Responsiveness:**
  * **Mobile-First:** *Tourist Landing Page* & *Supplier (Provider) App*. Essential for on-the-go tourists and field workers. These must feel like native mobile apps while scaling perfectly to desktop.
  * **Desktop-First:** *Admin Portal* & *Agency Portal*. Designed for power-users managing bulk actions, high-density data visualizations, and complex dashboards on workstations.

### Stage Map

```mermaid
gantt
    title Project Development Lifecycle
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section Foundation
    Stage 0: Infrastructure       :s0, 2026-07-16, 2w

    section MVP Development
    Stage 1: Premium UI & Core Backend  :s1, after s0, 6w
    Stage 2: Business Workflows         :s2, after s1, 4w
    Stage 3: Advanced Features          :s3, after s2, 4w

    section Scale & Launch
    Stage 4: Compliance & Launch        :s4, after s3, 4w
```

---

## 2. Stage 0 — Infrastructure & Setup

> **Duration:** 2 weeks  
> **Goal:** Establish the technical foundation so all team members can develop features in parallel.

### Deliverables Checklist
- [x] **Monorepo initialized** with Turborepo + pnpm workspaces (Tourist, Provider, Agency, Admin).
- [x] **Shared packages** created (UI, Database, Auth, Types, Config).
- [x] **Database schema deployed** (Core tables: users, profiles, services, bookings).
- [x] **CI/CD pipeline operational** (Vercel preview deploys).
- [x] **Design tokens defined** (Tailwind config matching new premium aesthetic).

---

## 3. Stage 1 — Premium Visual Identity & Core Architecture

> **Duration:** 6 weeks  
> **Goal:** Deliver the complete visual workflow for all four portals, connected to real database schemas with comprehensive seed data. All routing and data fetching must work, while deep business logic is deferred.

### Sequence of Execution
We will build the portals in the following order to ensure a logical flow of UI data:
1. Tourist Landing Page & Discovery
2. Admin Dashboard & Oversight
3. Agency Portal (B2B)
4. Supplier / Provider App (B2B/C)

### 3.1 Tourist WebApp (Landing & Discovery)
**Strategy:** Mobile-First, App-like feel.
- [x] **Visit Saudi Aesthetic:** Implement immersive landing page with full-bleed imagery, smooth scroll animations (Framer Motion), and sophisticated typography.
- [x] **Routing & Navigation:** Seamless transition between Home, Discover, Map, and Profile pages.
- [x] **Real Data Integration:** Fetch locations, travel packages, and categories directly from Supabase (using seeded data).
- [x] **Workflow States Built:**
  - Login / Registration modals.
  - "Discover Uzbekistan" destination carousels.
  - Service detail views (stubbed booking buttons).

### 3.2 Admin Portal
**Strategy:** Desktop-First, High-Density.
- [ ] **Dashboard Layout:** Sidebar navigation, complex data tables, and KPI metric cards.
- [x] **Workflow States Built:**
  - **Verification Hub:** UI showing pending agency/supplier registration requests. Detailed view of uploaded documents and Approve/Reject controls.
  - **Oversight:** Empty state for the heatmap and analytics graphs.
- [ ] **Real Data Integration:** Fetch list of users, providers, and agencies from the real database. It shoudl cashe it so it would not send new requests every time it reloads.

### 3.3 Agency Portal
**Strategy:** Desktop-First, Power-User focused.
- [ ] **Workflow States Built:**
  - Agency Registration flow (including "Awaiting Admin Approval" holding screen).
  - Inventory Dashboard: Grid/List views of available suppliers and packages.
  - Itinerary Canvas: Layout for the drag-and-drop calendar (UI only, logic deferred).
- [ ] **Real Data Integration:** Load approved suppliers and services from Supabase.

### 3.4 Supplier (Provider) App
**Strategy:** Mobile-First, Accessible & Simple.
- [ ] **Workflow States Built:**
  - Supplier Registration flow (including "Awaiting Admin Approval" holding screen).
  - Main Dashboard: Giant Availability Toggle (UI state changes color/animation).
  - Service Creation Form: Upload photos, description, and price (saves to DB).
  - "My Bookings" list view.
- [ ] **Real Data Integration:** Profile fetching, saving new services to the Supabase `services` table.

### 3.5 [NEW] The Identity & Verification Bridge
**Goal:** Connect Auth states to the Admin Hub to remove the "placeholder" feel.
- [x] **State-Aware Middleware:** Implement routing logic that checks `user.is_verified` before allowing access to B2B dashboards.
- [x] **B2B Onboarding UI:** Build the high-fidelity registration forms for Agencies (License upload) and Providers (Service type selection).
- [x] **The "Holding" Experience:** Create the premium `/auth/pending` page that users see while waiting for Aziz (Admin) to approve them.
- [ ] **Real-Time Verification:** Ensure the "Approve" button in the Admin Portal updates the `users.is_verified` boolean in Supabase, instantly granting the user access via a Realtime subscription.

### 3.6 Stage 1 Backend Foundations
- [x] **Comprehensive Seed Strategy:** Develop `seed.sql` and node scripts that populate the database with realistic, high-quality data (matching the "Visit Saudi" aesthetic requirements: high-res image URLs, real destination descriptions, dummy user accounts for every role).
- [x] **Real Connections:** No mock APIs. Use Supabase client for all data fetching.

### 3.7 Core Authentication & Approvals
- [x] **Authentication Flow:** Connected Supabase Auth, enforced JWT routing protection and role-based redirects.
- [x] **Approval Workflows:** Connected the Admin Portal's Approve/Reject buttons to update user roles/statuses in the database, triggering access for Agencies/Suppliers.

---

## 4. Stage 2 — Core Business Workflows & Transactions

> **Duration:** 4 weeks  
> **Goal:** Wire up the heavy functional logic behind the beautiful interfaces created in Stage 1.
> **Verified:** 2026-08-01, full code-level audit against this checklist (booking/review flows traced end-to-end, all 4 apps checked for hardcoded/mock data).

### Deliverables Checklist
- [x] **Tourist WebApp Integration:** Display real listings and offerings directly from providers and agencies. Confirmed live Supabase-backed across landing, discovery, and profile pages.
- [x] **Review & Rating System:**
  - Tourists can leave a post-booking review (comment, star rating). `POST /api/v1/reviews` now also enforces server-side that the associated booking is `completed` before accepting a review (previously client-side only).
- [x] **Offerings & Inventory Management:**
  - **Providers:** Real create/update/delete against `services`, including photo upload to Supabase Storage.
  - **Agencies:** Real create/update/delete against `itineraries`/`itinerary_items` via a form-based Packages page.
- [x] **Comprehensive Booking Flow (Real-time):**
  - Provider/Agency booking detail views, Accept/Decline, and full `booking_status_history` audit trail — all real DB writes.
  - Supabase Realtime confirmed wired on both sides (tourist gets notified on accept/decline; provider/agency gets notified on new bookings).
- [x] **Review Management:** Providers and Agencies fetch real reviews (`getReviewsForServices`/`getReviewsForItineraries`) and replies persist via `updateReviewResponse`.
- [x] ~~**Agency CRM:** Make the Kanban board fully functional~~ — **Descoped 2026-08-01.** No drag-and-drop Kanban was built; Accept/Decline buttons on a sortable data table cover the same status-transition functionality with real DB persistence. Revisit as a UX upgrade only if a future audit shows the button-driven flow is a workflow bottleneck.
- [x] ~~**Itinerary Canvas** (drag-and-drop calendar, mentioned in Stage 1 §3.3)~~ — **Descoped 2026-08-01.** Replaced by the simpler form-based Packages CRUD page above; itinerary/itinerary_items persistence is real, just not drag-and-drop.

### Admin Portal follow-up (found during the 2026-08-01 audit, now fixed)
Stage 1's "UI-first" build left several Admin Portal surfaces with hardcoded placeholder numbers
that were never wired to real queries. All fixed as part of Stage 2 close-out:
- Dashboard KPIs (active tourists, pending verifications, total bookings, GMV) and the revenue
  chart now use real Supabase aggregate queries (`apps/admin-portal/src/app/actions/dashboardActions.ts`).
- Analytics page (previously a one-line placeholder) now shows real bookings-by-status,
  users-by-role, top services, and review-quality breakdowns.
- Users page (previously a static "Stage 2" stub) now lists real accounts with role/status filtering.
- Verification Hub's secondary KPI cards (Active Tourists, GMV, Verified Providers) were hardcoded;
  now real. Its "Live Tourist Density" panel was falsely labeled "LIVE" for a decorative
  placeholder — relabeled "PREVIEW" pending the actual Mapbox/PostGIS integration (Stage 3).
- Verification queue was silently rendering "No ID · No License" for every request —
  `company_registration_number`/`license_number` were displayed but never collected by the
  registration flow or present in the schema. Now shows real submitted data (email/phone/role) instead.
- Agency Dashboard's "Pending Bookings" stat was hardcoded to `0`; its "Active Listings" stat was
  also silently always-zero (queried the `services` table, which agencies never own rows in —
  should have queried `itineraries`). Both now query real, correct data.

---

## 5. Stage 3 — Advanced Ecosystem Features

> **Duration:** 4 weeks  
> **Goal:** Integrate the "Wow Factor" features and AI capabilities.

### Deliverables Checklist
- [ ] **Taste & Trust Scanner:** Connect the camera UI to OpenAI Vision API for real-time menu translation and allergen detection.
- [ ] **Contextual Translator:** Connect the chat UI to LLM endpoints for cultural translations.
- [ ] **Itinerary Builder:** Implement the complex auto-pricing and scheduling logic for the Agency drag-and-drop calendar.
- [ ] **Survival Map:** Connect Mapbox GL to PostGIS geospatial queries for live SOS/Cultural pins.

---

## 6. Stage 4 — Compliance, Scale & Launch

> **Duration:** 4 weeks  
> **Goal:** Prepare the platform for government partnership, harden security, and public release.

### Deliverables Checklist
- [ ] **E-Mehmon Automation:** OCR passport scanning (UI already built in Stage 1) connected to data extraction and Excel/CSV export logic.
- [ ] **Payments:** Stripe and Payme/Click integration for actual transaction processing.
- [ ] **Dynamic Crowd-Shifting API:** Background jobs to calculate tourist density and adjust recommended alternatives.
- [ ] **Launch Readiness:** 
  - Lighthouse audits (Score > 90 across performance/accessibility).
  - Cloudflare WAF and SSL configuration.
  - Final Marketing deployment.

---

## 7. Progress Tracking Dashboard

| Stage | Status | Progress | Focus |
|---|---|---|---|
| Stage 0: Setup | 🟢 Complete | 100% | Infrastructure |
| Stage 1: Premium UI & Core DB | 🟡 In Progress | 85% | UI, DB, Authentication, Approvals completed |
| Stage 2: Business Workflows | 🟢 Complete | 100% | Offerings, real-time bookings, and reviews verified end-to-end 2026-08-01; Kanban/Itinerary Canvas formally descoped in favor of the simpler CRUD UI already shipped |
| Stage 3: Advanced Features | ⬜ Not Started | 0% | AI Scanners, Itineraries |
| Stage 4: Compliance & Launch | ⬜ Not Started | 0% | E-Mehmon, Payments, Scale |

### How to Update
Update this document at the end of each sprint. Mark completed items with `[x]` and adjust the progress percentages in the table.
