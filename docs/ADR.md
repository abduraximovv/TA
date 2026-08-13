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
- [ADR 007: Moonshot Kimi API (OpenAI-Compatible) Supersedes OpenAI](#adr-007-moonshot-kimi-api-openai-compatible-supersedes-openai)
- [ADR 008: Split Session-Cookie Strategy Across Apps](#adr-008-split-session-cookie-strategy-across-apps)

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
| **Status** | Superseded by [ADR 007](#adr-007-moonshot-kimi-api-openai-compatible-supersedes-openai) |
| **Date** | 2026-07-16 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | AI & Machine Learning |

> **Superseded:** The AI backend actually shipped for all AI-powered features is Moonshot's Kimi models (`kimi-k3`), accessed via an OpenAI-compatible SDK client, not OpenAI. This ADR is retained below as the historical record of the original decision; see ADR 007 for the current state.

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

## ADR 007: Moonshot Kimi API (OpenAI-Compatible) Supersedes OpenAI

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-08-13 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | AI & Machine Learning |
| **Supersedes** | [ADR 006: OpenAI API for AI-Powered Features](#adr-006-openai-api-for-ai-powered-features) |

### Context

ADR 006 committed the platform to OpenAI's API (GPT-4 / GPT-4 Vision) as the backend for AI-powered features. The AI-powered features that have since shipped are:

1. **AI Chat Assistant** (`/ai-chat`, `POST`/`GET /api/v1/ai/chat`) — a persistent, Kimi-branded conversational assistant with per-user chat history.
2. **Taste & Trust Dietary Scanner** (`POST /api/v1/ai/scan-menu`) — vision-based menu analysis producing dish translations, ingredients, allergens, and dietary flags.
3. **Itinerary Suggest** (`POST /api/v1/ai/itinerary-suggest`) — a tourist-facing self-service trip planner that generates a day-by-day itinerary.
4. **Contextual Translator** (`POST /api/v1/ai/translate`) — free-text translation with an embedded cultural-context note.

All four route handlers, independently, construct an AI client as:

```ts
createOpenAI({
  baseURL: "https://api.moonshot.ai/v1",
  apiKey: process.env.MOONSHOT_API_KEY,
})
```

and call the model as `moonshot.chat("kimi-k3")`. The `createOpenAI` helper (from the `ai` SDK's `@ai-sdk/openai` package) is being used purely as a generic OpenAI-compatible HTTP client pointed at Moonshot's endpoint — no request is made to OpenAI's own API, and no `OPENAI_API_KEY` is read anywhere in the application code. The platform now integrates **Moonshot's Kimi models via an OpenAI-compatible API**, not OpenAI itself.

No `packages/ai` shared wrapper exists — each of the four routes duplicates the client-construction and rate-limiting boilerplate independently (this was the vendor-abstraction mitigation ADR 006 proposed; it was not built).

### Decision

Use **Moonshot's Kimi API** (model `kimi-k3`), accessed through the OpenAI-compatible client shape of the `ai` SDK, as the AI backend for the Chat Assistant, Dietary Scanner, Itinerary Suggest, and Contextual Translator features, superseding ADR 006's OpenAI decision.

### Consequences

#### Positive

- **Drop-in SDK compatibility:** Because Moonshot exposes an OpenAI-compatible API surface, the existing `ai` SDK integration pattern (`generateText`, `generateObject`, structured JSON-schema output) required no framework change — only the `baseURL`, API key, and model identifier changed.

#### Negative

- **Required environment variable undocumented:** `MOONSHOT_API_KEY` is read by all four AI routes (each returns HTTP 503 if it is unset) but is **not listed in `.env.example`**, which still only documents the three Supabase variables. A fresh clone following `.env.example` alone cannot run any AI feature.
- **`turbo.json`'s `globalEnv` is stale:** it still lists `OPENAI_API_KEY` (unused by any route) instead of `MOONSHOT_API_KEY`.
- **No shared AI package:** the vendor-abstraction layer proposed as a mitigation in ADR 006 (`packages/ai`) was never built; each of the four routes independently constructs the Moonshot client and its own rate-limiting logic.
- **Stale CSP entry:** `apps/tourist-webapp/src/middleware.ts`'s `connect-src` directive still allow-lists `https://api.openai.com` and does not list `https://api.moonshot.ai`. This has no functional impact today because all Moonshot calls are made server-side from Next.js route handlers, not fetched from the browser, but the directive no longer reflects the actual upstream dependency.
- **Documentation drift:** `docs/TECHNICAL_PLAN.md` and `docs/DEPLOYMENT_GUIDE.md` still reference OpenAI, GPT-4, GPT-4 Vision, and `OPENAI_API_KEY` throughout (tech-stack tables, environment variable inventories, cost/risk sections, monitoring/alerting sections) and have not been updated for this change.

### Notes

No rationale for choosing Moonshot's Kimi models over OpenAI (cost, latency, regional availability, or otherwise) is recorded in the codebase or commit history available at the time of writing. This ADR documents the change in AI backend as a fact of the current implementation rather than asserting a motivation that has not been established.

---

## ADR 008: Split Session-Cookie Strategy Across Apps

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-08-13 |
| **Decision Makers** | Platform Engineering Team |
| **Category** | Authentication & Session Management |

### Context

The four apps in the monorepo share a single `packages/auth` package (`SessionProvider.tsx`) for client-side session state, but read that session on the server via two different mechanisms:

1. **Tourist WebApp** uses `@supabase/ssr` (`createBrowserClient` / `createServerClient`). The browser client persists the session into cookies in the chunked format `@supabase/ssr`'s server client expects; `apps/tourist-webapp/src/utils/supabase/server.ts`'s `createClient(cookieStore)` reads those cookies and calls `supabase.auth.getUser()` — a server-verified, per-request check — for both its API routes and Server Actions.
2. **Provider App, Agency Portal, and Admin Portal** do not use `@supabase/ssr`. Their Edge middleware instead reads a plain `sb-access-token` cookie and decodes the JWT payload directly, without a per-request network call to Supabase. `packages/auth/src/SessionProvider.tsx` writes this cookie by hand (`document.cookie = ...`) on every `onAuthStateChange`, alongside letting `getSupabaseBrowserClient()` write the `@supabase/ssr` cookie format for the Tourist WebApp's benefit. An inline comment in `SessionProvider.tsx` states this is intentional: it avoids `@supabase/ssr`'s cookie format and a per-request `getUser()` network call in these three apps' Edge middleware. `sb-refresh-token` is deliberately never written, since nothing reads it under this scheme.

`packages/database/src/client.ts` mirrors the split on the query-client side: `getSupabase()` (plain `@supabase/supabase-js`, localStorage session, intended only for anonymous/public reads) coexists with `getSupabaseBrowserClient()` (`@supabase/ssr`'s `createBrowserClient`).

Separately, three of Tourist WebApp's own route handlers (`/api/v1/bookings`, `/api/v1/destination-reviews`, `/api/v1/reviews`) work around both cookie schemes by minting a request-scoped Supabase client authenticated via an explicit `Authorization: Bearer` header sent from the client, because neither cookie format reliably propagated the caller's identity into PostgREST for Row-Level Security purposes at the time those routes were written.

### Decision

Maintain two distinct, coexisting session-cookie architectures within the monorepo:

- **Tourist WebApp**: `@supabase/ssr` cookies, verified server-side via `supabase.auth.getUser()` on each request.
- **Provider App, Agency Portal, Admin Portal**: a hand-set `sb-access-token` cookie, decoded as a JWT client-side in each app's Edge middleware without a server round-trip or signature verification.

`packages/auth/src/SessionProvider.tsx` is the shared bridge that writes both cookie formats simultaneously so a single client-side auth component can serve all four apps' differing server-side session-reading strategies.

### Consequences

#### Positive

- **No per-request Supabase network call in three apps' Edge middleware:** decoding the JWT locally avoids the latency and quota cost of calling `supabase.auth.getUser()` on every request routed through Provider App, Agency Portal, and Admin Portal middleware.
- **Each app's session-reading strategy was addressable independently:** Tourist WebApp could adopt `@supabase/ssr` without requiring a coordinated migration of the other three apps' middleware in the same change.

#### Negative

- **Two divergent auth code paths to maintain:** a bug fix or security hardening applied to one cookie-reading strategy does not automatically apply to the other. As one symptom of this, `packages/auth/src/serverClaims.ts`'s docstring still states that its JWT-decoding pattern "mirrors the pattern already used in `apps/tourist-webapp/src/middleware.ts`" — no longer accurate, since Tourist WebApp's middleware moved to `@supabase/ssr` and no longer decodes the JWT manually; the comment was not updated when that migration happened.
- **Unverified JWT decode in three apps:** Provider App, Agency Portal, and Admin Portal middleware decode the `sb-access-token` JWT payload without cryptographic signature verification against Supabase, relying on the cookie having been set only by the legitimate `SessionProvider` flow rather than on the token being independently re-verified per request.
- **Not currently documented outside inline code comments:** `docs/SECURITY_AND_COMPLIANCE.md`'s description of cookie handling does not distinguish between the two schemes, describing httpOnly cookie handling uniformly across portals.

---

*New ADRs will be added as significant architectural decisions are made during development. Each ADR is immutable once accepted — superseding decisions create new ADRs referencing the original.*
