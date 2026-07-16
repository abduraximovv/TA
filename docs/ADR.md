# Architecture Decision Records (ADR)

**Project:** Uzbekistan Digital Tourism Ecosystem  
**Version:** 1.0  
**Date:** 2026-07-16

---

## Table of Contents

- [ADR 001: Progressive Web App over Native Mobile Apps](#adr-001-progressive-web-app-over-native-mobile-apps)
- [ADR 002: Supabase (PostgreSQL) over NoSQL (MongoDB)](#adr-002-supabase-postgresql-over-nosql-mongodb)
- [ADR 003: Row-Level Security (RLS) for Authorization](#adr-003-row-level-security-rls-for-authorization)
- [ADR 004: Turborepo Monorepo Architecture](#adr-004-turborepo-monorepo-architecture)
- [ADR 005: Mapbox GL JS for Geospatial Features](#adr-005-mapbox-gl-js-for-geospatial-features)
- [ADR 006: OpenAI API for AI-Powered Features](#adr-006-openai-api-for-ai-powered-features)

---

## ADR 001: Progressive Web App over Native Mobile Apps

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Mobile Strategy |

### Context

The platform serves two mobile-primary user groups with fundamentally different constraints:

1. **International tourists** have high friction for downloading single-use apps abroad due to roaming data costs, App Store region restrictions, and limited device storage. A typical tourist visits Uzbekistan for 7–14 days and will not dedicate storage to a country-specific app.
2. **Rural local providers** (yurt owners, artisans, guides) often have older, low-storage Android devices with intermittent connectivity. Requiring them to download and maintain a native app creates an adoption barrier that defeats the purpose of bridging the digital divide.

### Decision

Build all mobile-facing interfaces (Tourist WebApp and Local Provider App) as **Progressive Web Apps (PWAs)** using Next.js with Service Worker support via Workbox.

### Consequences

#### Positive

- **Zero-friction onboarding:** Tourists can access the platform instantly via QR code scans at airports, hotels, and tourism kiosks — no App Store download required.
- **Bypass App Store review:** Critical during the MVP phase, where rapid iteration is essential. Updates are deployed instantly via the web.
- **Cross-platform by default:** A single codebase runs on iOS Safari, Android Chrome, and desktop browsers.
- **Offline capability:** Service Workers cache critical UI assets and recent map tiles, enabling basic functionality in low-connectivity rural areas.
- **Lightweight footprint:** PWAs consume minimal device storage compared to native apps, ideal for providers with low-end devices.

#### Negative

- **iOS limitations:** Safari has historically lagged behind Chrome in PWA support. Push notifications on iOS require iOS 16.4+, and background sync is limited.
- **No App Store presence:** Loss of discoverability through App Store search. Mitigated by QR-code-based distribution.
- **Limited native API access:** Cannot access NFC, Bluetooth, or advanced camera controls. Menu scanning via `MediaDevices` API is sufficient for MVP.

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **React Native** | Two separate mobile builds to maintain; adds complexity for a small team during MVP |
| **Flutter** | Requires Dart expertise; limited React ecosystem reuse with the web portals |
| **Ionic/Capacitor** | Added wrapper complexity for marginal native API gains not needed at MVP |
| **Native iOS + Android** | Maximum development cost; tourist adoption friction is prohibitively high |

---

## ADR 002: Supabase (PostgreSQL) over NoSQL (MongoDB)

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Database |

### Context

The platform is fundamentally **relational**: a specific tourist makes a booking via a specific agency for a specific local provider's service. These entities have strict foreign-key relationships that must be enforced for data integrity. Additionally, the platform requires:

- **Spatial queries** for map features (e.g., "find all available yurt camps within 50 km of Samarkand").
- **Row-Level Security** for multi-tenant data isolation across four user types.
- **Real-time subscriptions** for live provider availability updates.

### Decision

Use **PostgreSQL via Supabase** as the primary database, leveraging Supabase's managed hosting, built-in authentication, Row-Level Security, PostGIS extension, and Realtime capabilities.

### Consequences

#### Positive

- **Referential integrity:** Foreign keys and constraints enforce data consistency at the database level, preventing orphaned bookings or invalid provider references.
- **PostGIS extension:** Natively supports complex geospatial queries essential for Survival Maps, Heatmaps, and the Crowd-Shifting Pricing API.
- **Supabase ecosystem:** Out-of-the-box auth, storage, edge functions, and realtime reduce the number of separate services to manage.
- **Open-source:** Supabase is fully open-source. If vendor migration is needed, the PostgreSQL database can be self-hosted with minimal changes.
- **SQL familiarity:** PostgreSQL is widely understood, reducing onboarding friction for new team members.

#### Negative

- **Horizontal scaling:** PostgreSQL scales vertically more easily than horizontally. At very high scale, read replicas and connection pooling (PgBouncer) are required.
- **Schema rigidity:** Schema changes require migrations, adding process overhead compared to schemaless databases.

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **MongoDB** | Schemaless design risks data inconsistency; no native spatial queries without additional setup; poor fit for relational booking data |
| **Firebase (Firestore)** | Vendor lock-in to Google Cloud; limited relational modeling; no PostGIS equivalent |
| **PlanetScale (MySQL)** | No PostGIS equivalent; less mature RLS implementation |
| **Self-hosted PostgreSQL** | Higher operational burden during MVP; Supabase abstracts DevOps |

---

## ADR 003: Row-Level Security (RLS) for Authorization

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Security & Authorization |

### Context

The platform serves **four distinct user types** (Tourist, Provider, Agency, Admin) all accessing the **same PostgreSQL database**. Data leakage between these user types is a critical risk:

- An agency must never see another agency's client list or booking data.
- A provider must only see bookings assigned to their own services.
- A tourist must only see their own profile and booking history.
- Only admins should access platform-wide analytics and verification queues.

Traditional application-level authorization (middleware checks in Next.js API routes) is vulnerable to bugs — a single missing check exposes sensitive data.

### Decision

Implement **Supabase Row-Level Security (RLS) policies** on all database tables as the primary authorization mechanism. Application-level checks serve as a secondary, defense-in-depth layer.

### Consequences

#### Positive

- **Defense in depth:** Even if a bug exists in the Next.js frontend or API routes, the database itself prevents unauthorized data access.
- **Centralized policy:** Authorization logic is defined once in SQL policies, not scattered across dozens of API endpoints.
- **Auditable:** RLS policies are version-controlled via Supabase migrations, making security audits straightforward.
- **Automatic enforcement:** Every Supabase client query automatically runs through RLS policies — developers cannot accidentally bypass them.

#### Negative

- **Debugging complexity:** RLS policy errors can be difficult to diagnose. Queries silently return empty results rather than explicit "access denied" errors.
- **Performance overhead:** Complex RLS policies with joins can add query latency. Requires careful indexing and policy optimization.
- **Learning curve:** Developers unfamiliar with PostgreSQL policies need onboarding.

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **Application-only middleware** | Single point of failure; missing a check on one endpoint exposes data |
| **Separate databases per user type** | Massive operational complexity; duplicates schema and eliminates cross-entity queries |
| **GraphQL with field-level auth** | Adds framework complexity; RLS is more granular and database-native |

---

## ADR 004: Turborepo Monorepo Architecture

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Project Structure |

### Context

The platform consists of four separate web applications (Tourist, Provider, Agency, Admin) that share significant overlapping code:

- **Authentication logic** is identical across all four portals.
- **Database models and types** are derived from the same PostgreSQL schema.
- **UI components** (buttons, cards, map widgets, form elements) share a common design system.
- **Utility functions** (date formatting, currency conversion, geospatial calculations) are used everywhere.

Building four independent repositories would result in massive code duplication, version drift between shared dependencies, and inconsistent user experiences.

### Decision

Use a **Turborepo monorepo** with `pnpm` workspaces to house all four applications and shared packages in a single repository.

### Consequences

#### Positive

- **Code sharing:** Shared packages (`ui`, `database`, `auth`, `types`) are imported directly, eliminating duplication.
- **Atomic changes:** A database schema change and its corresponding UI update can be committed, reviewed, and deployed together.
- **Consistent tooling:** ESLint, Prettier, TypeScript, and Tailwind configurations are shared, ensuring code consistency.
- **Build performance:** Turborepo's intelligent caching and parallel execution dramatically speed up CI/CD.
- **Single PR for cross-portal features:** A feature that touches the Tourist app and Agency portal is one pull request, not two.

#### Negative

- **Repository size:** The monorepo will grow large over time, potentially slowing `git clone` for new developers.
- **CI complexity:** All four apps share a CI pipeline, requiring careful configuration of build filters and caching.
- **Deployment coordination:** Deploying one app may require awareness of changes in shared packages.

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **Polyrepo (4 repositories)** | Code duplication; version drift; impossible to make atomic cross-portal changes |
| **Nx** | Heavier configuration; Turborepo is simpler and better integrated with Vercel |
| **Lerna** | Legacy tool; Turborepo supersedes it with better caching and Vercel integration |

---

## ADR 005: Mapbox GL JS for Geospatial Features

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Mapping & Geospatial |

### Context

Multiple platform features require interactive, high-performance map rendering:

- **Survival Maps:** Static and dynamic pins for SOS hubs, clean toilets, cultural sites, and local festivals.
- **Live Heatmap:** Real-time tourist density visualization for the Admin portal and Hidden Uzbekistan discovery.
- **Crowd-Shifting Pricing API (future):** Geospatial analysis of tourist clustering at major monuments.
- **Provider Discovery:** "Find services near me" queries with radius-based search.

The mapping solution must support custom layers, dynamic data overlays, smooth animations, and integration with PostGIS spatial queries.

### Decision

Use **Mapbox GL JS** as the primary mapping library for all geospatial rendering across the platform.

### Consequences

#### Positive

- **Custom layer support:** Mapbox GL JS excels at rendering custom data layers (heatmaps, clustered markers, GeoJSON overlays), which is essential for all four map features.
- **Performance:** WebGL-powered rendering handles thousands of markers without lag.
- **Rich styling:** Mapbox Studio allows custom map styles that can match the platform's brand identity.
- **Strong React ecosystem:** `react-map-gl` provides idiomatic React bindings.
- **Geocoding & directions:** Mapbox APIs provide geocoding, routing, and isochrone analysis out of the box.

#### Negative

- **Cost at scale:** Mapbox charges per map load (50K free/month). Must monitor usage and budget accordingly.
- **Proprietary tiles:** Mapbox's tile servers are proprietary, unlike OpenStreetMap-based alternatives.
- **Bundle size:** Mapbox GL JS adds ~200 KB to the client bundle.

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **Google Maps JS API** | Higher cost; less flexible custom layer support; overkill for our use case |
| **Leaflet** | No WebGL rendering; poor performance with thousands of dynamic markers |
| **MapLibre GL JS** | Viable open-source fork; lacks Mapbox Studio and geocoding APIs. Kept as a fallback if Mapbox costs escalate |
| **OpenLayers** | Steeper learning curve; less React ecosystem support |

---

## ADR 006: OpenAI API for AI-Powered Features

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | AI & Machine Learning |

### Context

Three core MVP features require natural language processing and computer vision capabilities:

1. **Contextual Translator:** Real-time translation of Uzbek travel scenarios (bargaining, dietary restrictions, taxi directions) with cultural context.
2. **Taste & Trust Dietary Scanner:** OCR of Cyrillic/Uzbek menus with dish explanation and allergen warnings.
3. **Itinerary Canvas AI:** Intelligent route suggestions, cost calculations, and experience recommendations.

Building custom ML models is infeasible for an MVP timeline. We need a production-ready API with strong multilingual and vision capabilities.

### Decision

Use **OpenAI's API** (GPT-4 for text, GPT-4 Vision for image analysis) as the primary AI backend for all AI-powered features.

### Consequences

#### Positive

- **State-of-the-art multilingual NLP:** GPT-4 handles Uzbek, Russian, and English with contextual understanding far beyond simple translation APIs.
- **Vision capabilities:** GPT-4 Vision can analyze menu images, extract text, and provide structured dietary information in a single API call.
- **Rapid prototyping:** Prompt engineering is dramatically faster than training custom models.
- **Streaming responses:** API supports streaming, enabling real-time translation UI experiences.
- **Structured output:** JSON mode ensures AI responses can be directly parsed into UI components.

#### Negative

- **Cost per request:** GPT-4 is expensive at ~$0.03–0.06 per 1K tokens. Aggressive caching and prompt optimization are required.
- **Latency:** API calls can take 1–5 seconds depending on prompt complexity and server load.
- **Vendor dependency:** Full reliance on OpenAI's uptime and pricing decisions.
- **Data privacy:** Tourist queries and menu images are sent to OpenAI's servers. Privacy policy must disclose this.

### Mitigation Strategies

| Risk | Mitigation |
|---|---|
| **Cost overrun** | Implement per-user daily token budgets; cache frequent translations; use GPT-3.5 for simple queries |
| **Latency** | Use streaming responses; show loading animations; pre-cache common translations |
| **Vendor lock-in** | Abstract AI calls behind an interface (`packages/ai`); swap to Claude, Gemini, or self-hosted LLM if needed |
| **Privacy** | Anonymize user data before sending to API; disclose in privacy policy; consider EU-hosted endpoints |

### Alternatives Considered

| Alternative | Reason for Rejection |
|---|---|
| **Google Cloud Translation API** | Translation-only; no vision, no contextual understanding, no itinerary intelligence |
| **DeepL** | Superior translation quality for European languages, but weak Uzbek support and no vision capabilities |
| **Self-hosted LLM (LLaMA)** | Infeasible at MVP: requires GPU infrastructure, fine-tuning, and significant ML engineering effort |
| **Anthropic Claude** | Strong alternative; kept as backup. OpenAI chosen for superior vision capabilities and broader community tooling |

---

*New ADRs will be added as significant architectural decisions are made during development. Each ADR is immutable once accepted — superseding decisions create new ADRs referencing the original.*
