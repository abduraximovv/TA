# Product Requirements Document (PRD)

**Project:** Uzbekistan Digital Tourism Ecosystem  
**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft  
**Product Owner:** Platform Founding Team

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [Problem Statement](#2-problem-statement)
3. [Target User Personas](#3-target-user-personas)
4. [Product Overview](#4-product-overview)
5. [Feature Requirements — MVP](#5-feature-requirements--mvp)
6. [Feature Requirements — Post-MVP](#6-feature-requirements--post-mvp)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics & KPIs](#8-success-metrics--kpis)
9. [Assumptions & Constraints](#9-assumptions--constraints)
10. [Dependencies](#10-dependencies)
11. [Glossary](#11-glossary)

---

## 1. Vision & Mission

### Vision

**Become the digital infrastructure backbone of Uzbekistan's tourism economy** — connecting every rural artisan, every travel agency, and every international tourist into a single, seamless ecosystem that democratizes access to authentic cultural experiences regardless of a traveler's budget.

### Mission

Build and operate a 4-portal digital platform that:

1. **Bridges the digital divide** between rural service providers and the formal tourism economy.
2. **Democratizes travel** by offering AI-powered planning, safety, and navigation tools to all tourists, not just those who can afford premium agencies.
3. **Disperses tourism** from overcrowded primary hubs toward authentic "Hidden Uzbekistan" experiences.
4. **Automates compliance** with government systems to reduce friction for agencies and ensure national data accuracy.
5. **Formalizes the shadow economy** by digitizing cash-based rural transactions.

### Product Name (Working)

**UzTour Ecosystem** (placeholder — final brand TBD)

---

## 2. Problem Statement

### 2.1 The Digital Divide

Rural yurt owners, local artisans, and active tourism guides do not have advanced digital booking systems. They rely on chaotic phone calls and cash, excluding them from the modern B2B travel economy.

### 2.2 Agency Bottlenecks

Travel agencies (DMCs) spend thousands of hours manually:
- Checking provider availability (phone calls)
- Reconciling cash payments
- Filling out government E-Mehmon compliance forms
- Building itineraries in spreadsheets

### 2.3 Imbalanced Tourism

Tourists crowd the same 5 monuments (Registan, Ark, Ichan-Kala), while rich, authentic cultural experiences in rural areas remain unexplored and unmonetized.

### 2.4 The Budget Penalty

High-quality, safe travel is locked behind expensive agency fees. Budget travelers and international students are left to navigate unsafe areas, language barriers, and poor logistics alone.

### 2.5 Low Tourist Retention

Tourists are funneled to the same commercial spots, leave feeling they have "completed" the country, and have no motivation to return. No visibility into dynamic local experiences exists.

---

## 3. Target User Personas

### Persona 1: The Independent Tourist (FIT)

| Attribute | Details |
|---|---|
| **Name** | Sofia, 28 |
| **Location** | Berlin, Germany |
| **Travel Style** | Mid-budget, experience-seeking, solo/couple travel |
| **Tech Comfort** | High — uses Google Maps, Booking.com, ChatGPT daily |
| **Pain Points** | Language barrier in Uzbekistan; can't find authentic local experiences beyond tourist traps; dietary restrictions (vegetarian) hard to communicate; feels unsafe in unfamiliar areas at night |
| **Goals** | Experience authentic Uzbek culture safely; find hidden gems; communicate with locals; manage dietary needs |
| **Device** | iPhone 14 Pro, reliable 4G when in cities |

### Persona 2: The Budget Student Traveler

| Attribute | Details |
|---|---|
| **Name** | Ahmed, 22 |
| **Location** | Cairo, Egypt (studying in Tashkent) |
| **Travel Style** | Ultra-budget, backpacker, group with friends |
| **Tech Comfort** | High — relies heavily on free apps and AI |
| **Pain Points** | Cannot afford agency fees; gets lost on public transport; roaming data is expensive; doesn't know which areas are safe; language barrier |
| **Goals** | Travel Uzbekistan safely on a student budget; find cheap authentic food; avoid tourist traps |
| **Device** | Mid-range Android, limited data plan |

### Persona 3: The Rural Local Provider

| Attribute | Details |
|---|---|
| **Name** | Rustam, 52 |
| **Location** | Nurata District, Navoi Region |
| **Role** | Yurt camp owner, also offers camel riding |
| **Tech Comfort** | Low — uses WhatsApp and basic SMS |
| **Pain Points** | Only gets clients through word-of-mouth or when agencies call him; misses bookings because he's in the desert; cash-only payments are unreliable; no way to show his services to international tourists |
| **Goals** | Get more consistent bookings; receive digital payments; showcase his yurt camp to tourists worldwide |
| **Device** | Low-end Android phone, intermittent 3G connectivity |

### Persona 4: The Travel Agency Manager (DMC)

| Attribute | Details |
|---|---|
| **Name** | Dilnoza, 38 |
| **Location** | Tashkent |
| **Role** | Operations manager at a mid-size DMC (Silk Road Adventures) |
| **Tech Comfort** | Medium-High — uses Excel, email, basic CRM |
| **Pain Points** | Spends 60% of work time calling rural providers to check availability; manually fills E-Mehmon forms for every tourist; builds itineraries in Excel and Word; no visibility into real-time provider availability |
| **Goals** | Real-time provider inventory; automated compliance; professional itinerary builder to impress clients; reduce operational overhead |
| **Device** | Desktop PC at office, iPad in the field |

### Persona 5: The Platform Administrator

| Attribute | Details |
|---|---|
| **Name** | Aziz, 35 |
| **Location** | Tashkent |
| **Role** | Platform operations lead & government liaison |
| **Tech Comfort** | High |
| **Pain Points** | No centralized view of tourism data; cannot verify quality of rural providers; no way to track GMV or tourist density patterns |
| **Goals** | Platform-wide analytics; provider quality control; tourist safety monitoring; demonstrate platform value to government partners |
| **Device** | Desktop workstation |

---

## 4. Product Overview

### 4.1 System Architecture

The platform consists of **four interconnected portals** sharing a unified backend:

```
┌─────────────────────────────────────────────────────────────┐
│                    UzTour Ecosystem                          │
├──────────┬──────────┬──────────────┬────────────────────────┤
│ Tourist  │ Provider │   Agency     │   Admin                │
│ WebApp   │ App      │   Portal     │   Portal               │
│ (PWA)    │ (PWA)    │   (Web)      │   (Web)                │
├──────────┴──────────┴──────────────┴────────────────────────┤
│           Shared Backend (Supabase + Next.js API)           │
├─────────────────────────────────────────────────────────────┤
│    PostgreSQL + PostGIS │ Auth │ Storage │ Realtime          │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Feature Levels

Features are categorized into four levels based on technical complexity and business priority:

| Level | Phase | Focus |
|---|---|---|
| **Level 1** | MVP | Informational & UX Foundations — build trust |
| **Level 2** | MVP | Interactive Community & Tools — drive engagement |
| **Level 3** | MVP/Pitch | "Wow" Factor Ecosystem — demonstrate portal connectivity |
| **Level 4** | Post-Funding | Deep Tech & Gov Integration — systemic solutions |

---

## 5. Feature Requirements — MVP

### 5.1 Tourist WebApp (B2C)

#### F-T01: Essential Survival Maps

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 1 |
| **Description** | Interactive Mapbox-powered map showing categorized pins for SOS hubs, clean public toilets, cultural sites, festivals, pharmacies, ATMs, and WiFi hotspots |
| **User Story** | As a tourist, I want to see safety-critical locations on a map so I can navigate Uzbekistan safely and confidently. |
| **Acceptance Criteria** | ① Map loads within 2 seconds ② At least 6 pin categories are visible ③ Tapping a pin shows name, description, and "Get Directions" button ④ Map data is cached for offline use ⑤ User's current location is shown on the map |

#### F-T02: Taste & Trust Dietary Scanner

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 2 |
| **Description** | Tourist photographs a Cyrillic/Uzbek menu; AI translates each dish, explains ingredients, and flags allergens (nuts, dairy, gluten, meat types) |
| **User Story** | As a tourist with dietary restrictions, I want to scan a restaurant menu and understand what I can safely eat. |
| **Acceptance Criteria** | ① Camera opens from a single button tap ② AI response returns within 5 seconds ③ Each dish shows: translated name, description, allergen icons ④ Supports Uzbek and Russian text ⑤ Works with low-quality images (phone camera in dim lighting) |

#### F-T03: Direct Discovery — Hidden Uzbekistan

| Field | Details |
|---|---|
| **Priority** | P1 (Should Have) |
| **Level** | 2 |
| **Description** | Browse and book authentic local experiences (masterclasses, yurt stays, adventure activities) directly from verified providers |
| **User Story** | As a tourist, I want to discover and book unique local experiences that aren't available on mainstream travel sites. |
| **Acceptance Criteria** | ① Service cards show photo, title, price, rating, and distance ② Filter by category, price range, and distance ③ Booking flow: select date → confirm → notification sent to provider ④ Booking confirmation page with provider contact |

#### F-T04: Contextual Translator

| Field | Details |
|---|---|
| **Priority** | P1 (Should Have) |
| **Level** | 1 |
| **Description** | Built-in text/voice translator optimized for Uzbek travel scenarios (bargaining, taxi directions, dietary restrictions) |
| **User Story** | As a tourist who doesn't speak Uzbek or Russian, I want to communicate basic needs to locals. |
| **Acceptance Criteria** | ① Text input produces translation within 2 seconds ② Voice input supported (speech-to-text) ③ Common phrases pre-loaded for offline use ④ Cultural context notes included where relevant |

#### F-T05: User Authentication

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 1 |
| **Description** | Registration and login via email/password or Google OAuth |
| **User Story** | As a tourist, I want to create an account quickly to save my preferences and bookings. |
| **Acceptance Criteria** | ① Registration in under 60 seconds ② Google OAuth single-click login ③ Profile page with name, photo, and travel dates ④ Session persists across browser closes |

---

### 5.2 Local Provider App (B2B/C)

#### F-P01: Availability Toggle

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 2 |
| **Description** | Dead-simple "Online/Offline" toggle that updates provider availability in real-time across all portals |
| **User Story** | As a local provider, I want to toggle my availability with one tap so agencies and tourists know when I'm available. |
| **Acceptance Criteria** | ① Single toggle button on the main screen ② Status updates in under 1 second ③ Agencies see updated availability instantly ④ Toggle state persists if app is closed |

#### F-P02: Booking Management

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 2 |
| **Description** | Receive push notifications for new booking requests; 1-click Accept/Decline interface |
| **User Story** | As a local provider, I want to be notified immediately when I receive a booking so I can respond quickly. |
| **Acceptance Criteria** | ① Push notification received within 10 seconds of booking ② Accept/Decline buttons on notification card ③ Accepted bookings appear in "My Bookings" list ④ Tourist receives confirmation/decline notification |

#### F-P03: Micro-Franchise Profile

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 3 |
| **Description** | Basic form to upload photos, set prices, describe services. AI auto-translates from Uzbek to English/Russian |
| **User Story** | As a local provider, I want to create a professional profile for my service so tourists and agencies can find and book me. |
| **Acceptance Criteria** | ① Form fields: title, description, photos (up to 5), price, duration, max guests ② AI auto-translates descriptions ③ Preview card shows how tourists will see the listing ④ Submitted profile enters verification queue |

#### F-P04: Provider Authentication

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 1 |
| **Description** | Simplified registration with phone number or email |
| **User Story** | As a local provider with limited tech skills, I want to register easily without complicated forms. |
| **Acceptance Criteria** | ① Registration in under 2 minutes ② Phone number OTP verification ③ Minimal required fields (name, phone, service type) |

---

### 5.3 Travel Agency Portal (B2B)

#### F-A01: Provider Inventory Dashboard

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 2 |
| **Description** | Live dashboard showing all available local providers, updated in real-time based on their Online/Offline toggle |
| **User Story** | As an agency manager, I want to see which providers are currently available so I can build itineraries with real-time data. |
| **Acceptance Criteria** | ① Provider cards show: name, service, status (green/red), price, rating ② Filters by category, location, price, availability ③ Real-time updates without page refresh ④ Click to view full provider profile |

#### F-A02: Booking CRM

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 2 |
| **Description** | Kanban-style board tracking tourist bookings across states (Pending → Accepted → Confirmed → Completed) |
| **User Story** | As an agency manager, I want to track all my bookings in one place so I never lose track of a client's reservation. |
| **Acceptance Criteria** | ① Kanban columns match booking statuses ② Drag-and-drop cards between columns ③ Click card to see full booking details ④ Filter by date range, provider, tourist |

#### F-A03: Itinerary Canvas V1

| Field | Details |
|---|---|
| **Priority** | P1 (Should Have) |
| **Level** | 3 |
| **Description** | Drag-and-drop calendar where agencies assign booked services to specific days, with automatic price calculation |
| **User Story** | As an agency manager, I want to visually build trip itineraries by dragging services onto a calendar. |
| **Acceptance Criteria** | ① Calendar view with day columns ② Drag services from inventory sidebar ③ Total price updates on every change ④ Export itinerary as PDF ⑤ Share with tourist via link |

#### F-A04: Agency Authentication

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 1 |
| **Description** | Agency registration with company details; team member invitation system |
| **User Story** | As an agency manager, I want to create a team account so my colleagues can manage bookings together. |
| **Acceptance Criteria** | ① Company registration with license number ② Invite team members via email ③ Role-based access (manager, agent) |

---

### 5.4 Master Admin Portal (B2G)

#### F-M01: Provider Verification Hub

| Field | Details |
|---|---|
| **Priority** | P0 (Must Have) |
| **Level** | 3 |
| **Description** | Table to review, approve, or reject new rural providers with uploaded verification documents |
| **User Story** | As an admin, I want to verify providers to maintain platform quality and tourist safety. |
| **Acceptance Criteria** | ① Pending providers table with profile details ② View uploaded documents ③ Approve or Reject with reason ④ Approved providers become visible to tourists/agencies ⑤ Provider receives notification of decision |

#### F-M02: Platform Analytics Dashboard

| Field | Details |
|---|---|
| **Priority** | P1 (Should Have) |
| **Level** | 3 |
| **Description** | Macro-view dashboard showing total active tourists, providers, bookings, and GMV |
| **User Story** | As an admin, I want to see platform health metrics at a glance to demonstrate value to stakeholders. |
| **Acceptance Criteria** | ① KPI cards: active tourists, verified providers, bookings (today/week/month), GMV ② Line charts for trends ③ Date range selector ④ Data refreshes every 5 minutes |

#### F-M03: Heatmap Oversight

| Field | Details |
|---|---|
| **Priority** | P1 (Should Have) |
| **Level** | 3 |
| **Description** | Real-time heatmap of tourist clustering using anonymized geolocation data from active PWA sessions |
| **User Story** | As an admin, I want to see where tourists are concentrated to identify bottleneck areas and inform policy decisions. |
| **Acceptance Criteria** | ① Mapbox heatmap layer updates every 60 seconds ② Color intensity reflects tourist density ③ Filter by city/region ④ Data is anonymized (no individual tracking) |

---

## 6. Feature Requirements — Post-MVP

### Level 2 (Post-MVP Enhancement)

| ID | Feature | Portal | Priority |
|---|---|---|---|
| F-T06 | Contextual Notification Engine | Tourist | P2 |
| F-T07 | Live Hidden Uzbekistan Heatmap | Tourist | P2 |
| F-T08 | Trust-Based Impact Passport | Tourist | P2 |

### Level 3 (Pitch-Winning Features)

| ID | Feature | Portal | Priority |
|---|---|---|---|
| F-A05 | Collaborative AI Itinerary Canvas | Agency + Tourist | P2 |
| F-P05 | AI-Powered Service Standardization | Provider | P2 |
| F-A06 | E-Mehmon & Gov-Compliance Automation | Agency + Admin | P3 |

### Level 4 (Post-Funding Vision)

| ID | Feature | Portal | Priority |
|---|---|---|---|
| F-ALL01 | Dynamic Crowd-Shifting Pricing API | All | P3 |
| F-A07 | B2B Multi-Agency Resource Pooling | Agency | P3 |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|---|---|
| Page load time (FCP) | < 1.5 seconds |
| API response time (p95) | < 200 ms |
| Map rendering time | < 2 seconds |
| PWA installation | < 30 seconds |
| Offline mode availability | Core maps + cached translations |

### 7.2 Scalability

| Requirement | Target |
|---|---|
| Concurrent users | 10,000 (MVP) → 100,000 (Year 2) |
| Database size | 10 GB (MVP) → 100 GB (Year 2) |
| File storage | 50 GB (MVP) → 500 GB (Year 2) |

### 7.3 Security

| Requirement | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT-based) |
| Authorization | Row-Level Security (database-level) |
| Data encryption | TLS 1.3 in transit, AES-256 at rest |
| PII handling | GDPR-compliant data processing |
| Vulnerability scanning | Automated Dependabot + manual pen testing |

### 7.4 Accessibility

| Requirement | Standard |
|---|---|
| WCAG Level | AA compliance |
| Screen reader support | Full ARIA labeling |
| Keyboard navigation | All interactive elements |
| Color contrast | Minimum 4.5:1 ratio |
| Responsive design | Mobile-first, 320px minimum width |

### 7.5 Internationalization (i18n)

| Language | Priority | Coverage |
|---|---|---|
| English | MVP | Full UI + content |
| Russian | MVP | Full UI + content |
| Uzbek | MVP | Full UI + content |
| French | Post-MVP | UI strings |
| Chinese | Post-MVP | UI strings |
| Arabic | Post-MVP | UI strings |

---

## 8. Success Metrics & KPIs

### 8.1 MVP Success Criteria (First 90 Days)

| Metric | Target | Measurement |
|---|---|---|
| **Registered tourists** | 500 | Supabase Auth count |
| **Verified providers** | 50 | Provider verification table |
| **Active agencies** | 5 | Agency accounts with ≥ 1 booking |
| **Total bookings** | 200 | Bookings table count |
| **Menu scans performed** | 1,000 | Analytics events |
| **Map views** | 5,000 | Analytics events |
| **PWA installations** | 300 | Web App Install tracking |
| **Provider availability rate** | > 60% | % of providers Online during business hours |

### 8.2 Business KPIs (Year 1)

| KPI | Target | Formula |
|---|---|---|
| **Gross Merchandise Value (GMV)** | $50,000 | Sum of all completed booking values |
| **Take Rate** | 10–15% | Platform commission / GMV |
| **Monthly Active Users (MAU)** | 2,000 | Unique users with ≥ 1 session/month |
| **Tourist Retention Rate** | 15% | Tourists who make ≥ 2 bookings |
| **Provider Onboarding Rate** | 20 providers/month | New verified providers per month |
| **Net Promoter Score (NPS)** | > 50 | Post-experience survey |

### 8.3 Impact KPIs

| KPI | Target | Purpose |
|---|---|---|
| **Rural Tourism Revenue** | $20,000 | Revenue flowing to rural providers |
| **Hidden Gem Visits** | 500 | Bookings for non-primary-hub services |
| **Shadow Economy Digitization** | 200 transactions | Formerly cash-only transactions processed digitally |

---

## 9. Assumptions & Constraints

### 9.1 Assumptions

1. Tourists will use QR codes at airports/hotels to access the PWA without App Store downloads.
2. Rural providers have basic smartphone access (Android, 3G minimum).
3. OpenAI API will remain available and affordable for Uzbekistan-based requests.
4. Government (E-Mehmon system) will eventually provide API access for compliance automation.
5. Mapbox provides adequate map coverage for rural Uzbekistan.

### 9.2 Constraints

1. **Budget:** MVP must be built with minimal hosting costs (Supabase free tier + Vercel hobby/pro plan).
2. **Team:** Small development team (2–4 engineers) for MVP phase.
3. **Timeline:** MVP demo-ready within 3–4 months.
4. **Connectivity:** Provider app must function in areas with intermittent 3G connectivity.
5. **Regulatory:** Must comply with Uzbekistan's data localization requirements (if applicable).

---

## 10. Dependencies

| Dependency | Type | Risk | Mitigation |
|---|---|---|---|
| Supabase platform availability | External service | Medium | Open-source; can self-host if needed |
| OpenAI API access from Uzbekistan | External service | Medium | Use proxy/edge function; cache common translations |
| Mapbox coverage in rural areas | External service | Low | Supplement with OpenStreetMap data |
| Government E-Mehmon API | External (future) | High | Build manual fallback; automate OCR independently |
| Stripe payment processing in UZS | External service | High | Integrate Payme/Click (local) as primary payment |
| Rural internet infrastructure | Infrastructure | High | Aggressive PWA offline caching strategy |

---

## 11. Glossary

| Term | Definition |
|---|---|
| **FIT** | Free Independent Traveler — a tourist traveling without a pre-booked group tour |
| **DMC** | Destination Management Company — a local travel agency that manages tourism logistics |
| **PWA** | Progressive Web App — a web application that behaves like a native mobile app |
| **E-Mehmon** | Uzbekistan's mandatory guest registration system for foreign tourists |
| **GMV** | Gross Merchandise Value — total value of all transactions processed |
| **RLS** | Row-Level Security — PostgreSQL feature that restricts data access at the database row level |
| **PostGIS** | PostgreSQL extension for geospatial data processing |
| **Shadow Economy** | Cash-based, informal transactions not captured in formal financial systems |
| **Hidden Uzbekistan** | Marketing term for authentic, off-the-beaten-path cultural experiences |
| **Choyxona** | Traditional Uzbek teahouse — the cultural setting for the Taste & Trust feature |
| **Tandir** | Traditional clay oven used for baking bread — a key masterclass offering |

---

*This PRD is a living document. Feature requirements will be refined based on user research, stakeholder feedback, and technical discoveries during development.*
