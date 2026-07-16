# Technical Plan — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft  
**Authors:** Platform Engineering Team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architectural Approach](#2-architectural-approach)
3. [Technology Stack](#3-technology-stack)
4. [MVP Feature Scope by Portal](#4-mvp-feature-scope-by-portal)
5. [Infrastructure & Hosting](#5-infrastructure--hosting)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Performance & Scalability](#7-performance--scalability)
8. [Technology Risk Assessment](#8-technology-risk-assessment)
9. [Development Environment](#9-development-environment)
10. [Third-Party Integrations](#10-third-party-integrations)

---

## 1. Project Overview

### 1.1 Vision

Build a **Tri-Sided Digital Infrastructure Platform** that connects international tourists, local travel agencies (DMCs), government compliance systems, and rural Uzbek suppliers into one seamless, monetizable ecosystem.

### 1.2 Core Objectives

- **Bridge the digital divide** between rural Uzbek service providers and the formal tourism economy.
- **Democratize travel** by providing budget-friendly AI-powered planning and safety tools.
- **Decentralize tourism** away from primary hubs (Samarkand, Bukhara, Khiva) toward "Hidden Uzbekistan."
- **Automate compliance** with government systems (E-Mehmon) to reduce agency overhead.
- **Formalize the shadow economy** by digitizing rural cash-based transactions.

### 1.3 System Boundaries

The platform consists of four interconnected portals:

| Portal | User Type | Platform | Primary Use Case |
|---|---|---|---|
| Tourist WebApp | Foreign travelers (FITs) | PWA (Mobile-first) | Trip planning, navigation, discovery |
| Local Provider App | Rural artisans, guides | PWA (Ultra-simple mobile) | Availability toggle, booking management |
| Travel Agency Portal | DMC managers | Desktop/Tablet web | CRM, itinerary building, inventory |
| Master Admin Portal | Platform owners, gov partners | Desktop web | Analytics, verification, compliance |

---

## 2. Architectural Approach

### 2.1 Monorepo Strategy

We adopt a **Turborepo-powered monorepo** to unify all four portals under a single repository. This eliminates code duplication and ensures consistency across the ecosystem.

```
uzbekistan-tourism/
├── apps/
│   ├── tourist-webapp/          # Next.js PWA — Tourist B2C
│   ├── provider-app/            # Next.js PWA — Local Provider B2B/C
│   ├── agency-portal/           # Next.js — Agency B2B
│   └── admin-portal/            # Next.js — Admin B2G
├── packages/
│   ├── ui/                      # Shared React component library
│   ├── database/                # Supabase client, types, migrations
│   ├── auth/                    # Shared authentication logic
│   ├── config/                  # Shared ESLint, TypeScript, Tailwind configs
│   ├── map-utils/               # Mapbox GL JS shared utilities
│   ├── ai/                      # OpenAI API shared wrappers
│   └── types/                   # Shared TypeScript type definitions
├── supabase/
│   ├── migrations/              # PostgreSQL migration files
│   ├── seed/                    # Seed data for development
│   └── functions/               # Supabase Edge Functions
├── turbo.json
├── package.json
└── docs/                        # This documentation directory
```

### 2.2 Key Architectural Principles

| Principle | Implementation |
|---|---|
| **Shared Nothing Between Portals** | Each `apps/*` portal is independently deployable |
| **Shared Everything Between Packages** | UI components, auth logic, DB types are reused |
| **Database as Source of Truth** | Supabase PostgreSQL with RLS enforces all business rules |
| **API-First Design** | All data flows through Next.js API routes or Supabase Edge Functions |
| **Offline-First for PWAs** | Service workers cache critical assets for tourist/provider use |

### 2.3 Data Flow Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tourist PWA │     │ Provider PWA │     │ Agency Portal│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes / Edge Functions         │
├─────────────────────────────────────────────────────────┤
│              Supabase (PostgreSQL + PostGIS)              │
│              Row-Level Security (RLS)                     │
│              Realtime Subscriptions                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Admin Portal  │
              │  (Full Access) │
              └────────────────┘
```

---

## 3. Technology Stack

### 3.1 Core Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 14.x | SSR + API routes in one framework |
| **UI Library** | React | 18.x | Component-based architecture |
| **Styling** | Tailwind CSS | 3.x | Rapid, utility-first styling |
| **Language** | TypeScript | 5.x | Type safety across the entire monorepo |
| **Monorepo Tool** | Turborepo | 2.x | Fast parallel builds, shared caching |
| **Package Manager** | pnpm | 8.x | Efficient disk space, strict dependency resolution |

### 3.2 Backend & Data

| Layer | Technology | Rationale |
|---|---|---|
| **Database** | Supabase (PostgreSQL 15) | Managed PostgreSQL with built-in auth, RLS, realtime |
| **Spatial Data** | PostGIS Extension | Native geospatial queries for maps and heatmaps |
| **Authentication** | Supabase Auth | Email/password, OAuth (Google, Apple), magic links |
| **File Storage** | Supabase Storage | Provider photos, menu images, passport scans |
| **Realtime** | Supabase Realtime | Live provider availability updates, booking notifications |
| **Edge Functions** | Supabase Edge Functions (Deno) | Serverless compute for AI processing, webhooks |

### 3.3 Integrations

| Service | Technology | Use Case |
|---|---|---|
| **Mapping** | Mapbox GL JS | Survival Maps, Heatmap, geolocation |
| **AI/NLP** | OpenAI API (GPT-4) | Contextual Translator, Taste & Trust, Itinerary AI |
| **Payments** | Stripe / Payme (local) | Tourist payments + provider payouts |
| **Push Notifications** | Web Push API | Contextual notifications for tourists |
| **OCR** | Tesseract.js / OpenAI Vision | Passport scanning, menu scanning |
| **Analytics** | PostHog (self-hosted) | Privacy-first platform analytics |

### 3.4 Mobile Strategy: Progressive Web App (PWA)

| PWA Capability | Implementation |
|---|---|
| **Installability** | Web App Manifest with icons, splash screens |
| **Offline Support** | Service Worker with Workbox for asset caching |
| **Push Notifications** | Web Push API with VAPID keys |
| **Camera Access** | MediaDevices API for menu/passport scanning |
| **Geolocation** | Geolocation API for heatmap and survival maps |
| **Distribution** | QR codes at airports, hotels, and tourism kiosks |

---

## 4. MVP Feature Scope by Portal

### 4.1 Tourist WebApp (B2C)

| Feature | Description | Tech Dependencies |
|---|---|---|
| **Survival Map** | Interactive map with pins for SOS hubs, clean toilets, cultural sites, local festivals | Mapbox GL JS, PostGIS, Supabase |
| **Taste & Trust Scanner** | Upload menu photo → AI translates, explains dishes, warns of allergens | OpenAI Vision API, Supabase Storage |
| **Direct Discovery** | Browse and book "Hidden Uzbekistan" masterclasses from local providers | Supabase queries, booking flow |
| **User Auth** | Registration/login with email or Google OAuth | Supabase Auth |
| **PWA Shell** | Installable, offline-capable progressive web app | Next.js PWA config, Workbox |

### 4.2 Local Provider App (B2B/C)

| Feature | Description | Tech Dependencies |
|---|---|---|
| **Status Toggle** | Dead-simple "Online/Offline" availability switch | Supabase Realtime |
| **Booking Management** | Push notifications for new requests, 1-click Accept/Decline | Web Push API, Supabase |
| **Micro-Franchise Profile** | Form to upload photos, set prices, describe services | Supabase Storage, CRUD forms |
| **User Auth** | Simplified registration with phone number or email | Supabase Auth |

### 4.3 Travel Agency Portal (B2B)

| Feature | Description | Tech Dependencies |
|---|---|---|
| **Provider Inventory** | Live dashboard of available local providers (respects Online/Offline toggle) | Supabase Realtime subscriptions |
| **Booking CRM** | Kanban-style board tracking tourist bookings and supplier statuses | React DnD, Supabase |
| **Itinerary Canvas V1** | Drag-and-drop calendar for assigning services to trip days | React DnD, calendar library |
| **User Auth** | Agency account with team member invitations | Supabase Auth, team roles |

### 4.4 Master Admin Portal (B2G)

| Feature | Description | Tech Dependencies |
|---|---|---|
| **Verification Hub** | Table to approve/reject new rural providers | Supabase admin queries |
| **Platform Analytics** | Dashboard: active tourists, providers, GMV | PostHog + custom Supabase queries |
| **Heatmap Oversight** | Real-time tourist clustering visualization | Mapbox GL JS, anonymized geo data |
| **User Auth** | Admin-only access with elevated privileges | Supabase Auth + RLS |

---

## 5. Infrastructure & Hosting

### 5.1 Hosting Architecture

| Component | Host | Rationale |
|---|---|---|
| **Next.js Apps (x4)** | Vercel | Native Next.js support, edge network, preview deploys |
| **Database** | Supabase Cloud | Managed PostgreSQL, automatic backups |
| **Edge Functions** | Supabase Edge Functions | Low-latency serverless compute |
| **File Storage** | Supabase Storage | Integrated with auth and RLS |
| **DNS & CDN** | Cloudflare | DDoS protection, edge caching, SSL |
| **Analytics** | PostHog Cloud / Self-hosted | Privacy-compliant event tracking |

### 5.2 Environment Strategy

| Environment | Purpose | Database | URL Pattern |
|---|---|---|---|
| **Development** | Local development | Local Supabase (Docker) | `localhost:3000–3003` |
| **Staging** | Pre-production testing | Supabase branch database | `staging.*.uzbektourism.app` |
| **Production** | Live platform | Supabase production | `*.uzbektourism.app` |

### 5.3 Domain Architecture

```
uzbektourism.app              → Tourist WebApp (landing)
app.uzbektourism.app          → Tourist WebApp (PWA)
provider.uzbektourism.app     → Local Provider App
agency.uzbektourism.app       → Travel Agency Portal
admin.uzbektourism.app        → Master Admin Portal
api.uzbektourism.app          → API Gateway (if needed)
```

---

## 6. CI/CD Pipeline

### 6.1 Pipeline Overview

```
Developer Push → GitHub Actions → Lint + Type Check → Unit Tests
    → Integration Tests → Build → Preview Deploy (PR)
    → Merge to main → Staging Deploy → Smoke Tests
    → Manual Approval → Production Deploy
```

### 6.2 Pipeline Stages

| Stage | Tool | Trigger |
|---|---|---|
| **Lint & Format** | ESLint + Prettier | Every push |
| **Type Check** | `tsc --noEmit` | Every push |
| **Unit Tests** | Vitest | Every push |
| **Integration Tests** | Playwright | PR to `main` |
| **Build** | `turbo build` | PR to `main` |
| **Preview Deploy** | Vercel Preview | Every PR |
| **Staging Deploy** | Vercel + Supabase Branch | Merge to `main` |
| **Production Deploy** | Vercel + Supabase Prod | Manual approval |

### 6.3 Turborepo Caching

Turborepo's remote caching (via Vercel) ensures that unchanged packages are not rebuilt, reducing CI times by up to 80%.

---

## 7. Performance & Scalability

### 7.1 Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.0s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **API Response Time (p95)** | < 200ms | PostHog / Custom |
| **Map Load Time** | < 2.0s | Custom instrumentation |

### 7.2 Scalability Considerations

| Concern | Mitigation |
|---|---|
| **Database load** | Supabase connection pooling (PgBouncer), read replicas for analytics |
| **Map tile serving** | Mapbox CDN handles tile delivery globally |
| **AI API latency** | Edge Functions with streaming responses, response caching |
| **Tourist spike seasons** | Vercel auto-scales serverless functions; Supabase supports compute add-ons |
| **Offline usage** | Service Worker caches all critical UI and recent map tiles |

---

## 8. Technology Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **PWA limitations on iOS** | Medium | High | Test extensively on Safari; use fallback UI for unsupported features |
| **OpenAI API cost overrun** | High | Medium | Implement rate limiting, caching, and token budget per user |
| **Supabase vendor lock-in** | Medium | Low | Use standard PostgreSQL; Supabase is open-source and self-hostable |
| **Mapbox pricing at scale** | Medium | Medium | Monitor tile requests; consider MapLibre as open-source fallback |
| **Poor rural connectivity** | High | High | Aggressive offline caching; minimal payload for Provider PWA |
| **Government API instability** | Medium | Medium | Queue-based integration with retry logic for E-Mehmon |
| **Data privacy regulations** | High | Medium | Implement GDPR-compliant data handling from day one |

---

## 9. Development Environment

### 9.1 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | JavaScript runtime |
| pnpm | 8.x | Package manager |
| Docker | Latest | Local Supabase instance |
| Supabase CLI | Latest | Database migrations, local dev |
| Git | Latest | Version control |

### 9.2 Local Setup

```bash
# Clone repository
git clone https://github.com/org/uzbekistan-tourism.git
cd uzbekistan-tourism

# Install dependencies
pnpm install

# Start local Supabase
pnpm supabase start

# Run all apps in development mode
pnpm dev

# Run a specific app
pnpm dev --filter=tourist-webapp
```

### 9.3 Environment Variables

All environment variables are managed through `.env.local` files per app, with a shared `.env.example` template:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# OpenAI
OPENAI_API_KEY=your-openai-key

# App URLs
NEXT_PUBLIC_TOURIST_APP_URL=http://localhost:3000
NEXT_PUBLIC_PROVIDER_APP_URL=http://localhost:3001
NEXT_PUBLIC_AGENCY_APP_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_APP_URL=http://localhost:3003
```

---

## 10. Third-Party Integrations

### 10.1 Integration Matrix

| Integration | Portal(s) | Priority | Complexity |
|---|---|---|---|
| **Supabase Auth** | All | MVP | Low |
| **Supabase Realtime** | Provider, Agency | MVP | Medium |
| **Mapbox GL JS** | Tourist, Admin | MVP | Medium |
| **OpenAI GPT-4** | Tourist, Agency | MVP | Medium |
| **OpenAI Vision** | Tourist | MVP | Medium |
| **Web Push API** | Tourist, Provider | MVP | Low |
| **Stripe** | Tourist, Agency | Post-MVP | High |
| **Payme (Uzbek)** | Provider | Post-MVP | High |
| **E-Mehmon API** | Agency, Admin | Post-MVP | High |
| **PostHog Analytics** | Admin | MVP | Low |

### 10.2 API Rate Limits & Quotas

| Service | Free Tier | Expected MVP Usage | Action Needed |
|---|---|---|---|
| **Supabase** | 500 MB DB, 50K auth users | Well within limits | None |
| **Mapbox** | 50K map loads/month | ~5K during MVP | None |
| **OpenAI** | Pay-per-token | ~$50–200/month at MVP | Set budget alerts |
| **Vercel** | 100 GB bandwidth | Well within limits | None |
| **PostHog** | 1M events/month | Well within limits | None |

---

*This document is a living artifact and will be updated as architectural decisions evolve during development.*
