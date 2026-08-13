# API Specification — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Base URL:** `https://api.uzbektourism.app/v1`  
**Protocol:** REST over HTTPS  
**Authentication:** Supabase JWT (Bearer Token)

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Common Conventions](#3-common-conventions)
4. [Endpoints — Authentication](#4-endpoints--authentication)
5. [Endpoints — Users & Profiles](#5-endpoints--users--profiles)
6. [Endpoints — Services](#6-endpoints--services)
7. [Endpoints — Bookings](#7-endpoints--bookings)
8. [Endpoints — Locations (Survival Map)](#8-endpoints--locations-survival-map)
9. [Endpoints — Itineraries](#9-endpoints--itineraries)
10. [Endpoints — Reviews](#10-endpoints--reviews)
11. [Endpoints — Provider Verification (Admin)](#11-endpoints--provider-verification-admin)
12. [Endpoints — Analytics (Admin)](#12-endpoints--analytics-admin)
13. [Endpoints — AI Features](#13-endpoints--ai-features)
14. [Endpoints — Notifications](#14-endpoints--notifications)
15. [Webhooks & Events](#15-webhooks--events)
16. [Error Handling](#16-error-handling)
17. [Rate Limiting](#17-rate-limiting)

---

## 1. API Overview

The API serves all four portals through a unified set of endpoints. Access control is enforced at two levels:

1. **Supabase RLS:** Database-level row filtering based on the authenticated user's role.
2. **API Middleware:** Next.js API route middleware validates JWT tokens and enforces role-based access.

### Architecture

```
Client (PWA / Portal) 
  → Bearer JWT in Authorization header
    → Next.js API Route (validation, business logic)
      → Supabase Client (with user context)
        → PostgreSQL (RLS policies applied)
```

---

## 2. Authentication & Authorization

### 2.1 Authentication Flow

```
1. Client sends credentials to Supabase Auth
2. Supabase returns JWT access token + refresh token
3. Client includes JWT in all API requests:
   Authorization: Bearer <jwt_token>
4. API validates JWT and extracts user context
5. Supabase client uses user context for RLS
```

### 2.2 JWT Payload

```json
{
  "sub": "a1b2c3d4-0001-4000-8000-000000000001",
  "email": "tourist@example.com",
  "role": "authenticated",
  "app_metadata": {
    "role": "tourist"
  },
  "exp": 1721145600
}
```

### 2.3 Role-Based Access Matrix

| Endpoint Group | Tourist | Provider | Agency | Admin |
|---|---|---|---|---|
| Auth | ✅ | ✅ | ✅ | ✅ |
| User Profile (own) | ✅ | ✅ | ✅ | ✅ |
| User Profile (all) | ❌ | ❌ | ❌ | ✅ |
| Services (read) | ✅ | ✅ | ✅ | ✅ |
| Services (write) | ❌ | ✅ (own) | ❌ | ✅ |
| Bookings (own) | ✅ | ✅ (own services) | ✅ (own) | ✅ |
| Locations (read) | ✅ | ✅ | ✅ | ✅ |
| Locations (write) | ❌ | ❌ | ❌ | ✅ |
| Itineraries | ❌ | ❌ | ✅ (own) | ✅ |
| Reviews (write) | ✅ | ❌ | ❌ | ❌ |
| Verification | ❌ | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ❌ | ✅ |
| AI Features | ✅ | ❌ | ✅ | ✅ |

---

## 3. Common Conventions

### 3.1 Request Format

- **Content-Type:** `application/json`
- **Timestamps:** ISO 8601 format (`2026-07-16T12:00:00Z`)
- **UUIDs:** Version 4 UUIDs for all resource IDs
- **Pagination:** Cursor-based via `cursor` and `limit` query parameters

### 3.2 Pagination

```
GET /api/v1/services?limit=20&cursor=eyJpZCI6Ijxla...
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6IjxuZXh0Li4.",
    "has_more": true,
    "total": 142
  }
}
```

### 3.3 Filtering

```
GET /api/v1/services?category=masterclass&city=Samarkand&min_price=100000&max_price=500000&is_available=true
```

### 3.4 Sorting

```
GET /api/v1/services?sort_by=price&sort_order=asc
```

### 3.5 Standard Response Envelope

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-16T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Price must be a positive number",
    "details": [
      { "field": "price", "issue": "must be greater than 0" }
    ]
  },
  "meta": {
    "timestamp": "2026-07-16T12:00:00Z",
    "request_id": "req_abc124"
  }
}
```

---

## 4. Endpoints — Authentication

> **Implementation note:** None of the endpoints below exist as Next.js API routes. Authentication is handled by calling the Supabase Auth SDK directly from the client (`supabase.auth.signUp`, `signInWithPassword`, `signInWithOAuth`, `refreshSession`, `signOut`, etc., wired up in `packages/auth/src/SessionProvider.tsx`) against Supabase's own hosted Auth API. This section documents the equivalent conceptual operations and payload shapes, not a literal `/api/v1/auth/*` HTTP surface implemented by this codebase.

### `POST /api/v1/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "tourist@example.com",
  "password": "SecureP@ss123",
  "role": "tourist",
  "full_name": "Sofia Mueller",
  "phone": "+49170123456"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "email": "tourist@example.com",
      "role": "tourist"
    },
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "abc...",
      "expires_at": "2026-07-17T12:00:00Z"
    }
  }
}
```

---

### `POST /api/v1/auth/login`

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "tourist@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):** Same structure as register response.

---

### `POST /api/v1/auth/login/oauth`

Initiate OAuth login (Google, Apple).

**Request Body:**

```json
{
  "provider": "google",
  "redirect_url": "https://app.uzbektourism.app/auth/callback"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "authorization_url": "https://accounts.google.com/o/oauth2/v2/..."
  }
}
```

---

### `POST /api/v1/auth/refresh`

Refresh an expired access token.

**Request Body:**

```json
{
  "refresh_token": "abc..."
}
```

---

### `POST /api/v1/auth/logout`

Invalidate the current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

## 5. Endpoints — Users & Profiles

> **Implementation note:** These are not Next.js API routes. A user's own profile is read/updated via direct Supabase client calls against the `user_profiles` table (RLS-scoped to `auth.uid() = id`) from tourist-webapp/provider-app/agency-portal components. The admin-only listing is implemented as a Server Action, `getAllUserProfiles()` in `apps/admin-portal/src/app/actions/usersActions.ts` (joins `user_profiles` with `auth.admin.listUsers()` for email, using the service-role key), not a `GET /api/v1/users` route.

### `GET /api/v1/users/me`

Get the authenticated user's profile.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "email": "tourist@example.com",
    "role": "tourist",
    "is_verified": true,
    "profile": {
      "full_name": "Sofia Mueller",
      "phone": "+49170123456",
      "avatar_url": "https://storage.uzbektourism.app/avatars/...",
      "language": "en",
      "country": "DE",
      "metadata": {
        "dietary_restrictions": ["vegetarian"],
        "travel_dates": {
          "arrival": "2026-08-01",
          "departure": "2026-08-14"
        }
      }
    }
  }
}
```

---

### `PATCH /api/v1/users/me`

Update the authenticated user's profile.

**Request Body (partial update):**

```json
{
  "full_name": "Sofia M.",
  "language": "de",
  "metadata": {
    "dietary_restrictions": ["vegetarian", "nut-allergy"]
  }
}
```

---

### `GET /api/v1/users` *(Admin only)*

List all users with filtering.

**Query Parameters:** `role`, `is_verified`, `is_active`, `search`, `limit`, `cursor`

---

## 6. Endpoints — Services

> **Implementation note:** No `/api/v1/services` route exists. Reads are implemented via direct Supabase client calls from the frontend — `packages/database/src/client.ts`'s `getAvailableServices()` and `getServiceById()` — not as Next.js API routes. Provider-side create/update/delete/availability-toggle are not backed by dedicated route handlers or Server Actions either; they follow the same direct-Supabase-client pattern from provider-app's service-management components, relying on RLS (`provider_id = auth.uid()`) rather than an API middleware layer for authorization. The endpoints below describe the conceptual operations and payload shapes, not a literal HTTP surface.

### `GET /api/v1/services`

List available services with filtering and geospatial search.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by service category |
| `city` | string | Filter by city |
| `region` | string | Filter by region |
| `min_price` | number | Minimum price filter |
| `max_price` | number | Maximum price filter |
| `is_available` | boolean | Only available services |
| `lat` | number | Latitude for proximity search |
| `lng` | number | Longitude for proximity search |
| `radius_km` | number | Search radius in kilometers |
| `sort_by` | string | `price`, `rating`, `distance`, `created_at` |
| `sort_order` | string | `asc` or `desc` |
| `limit` | number | Results per page (max 50) |
| `cursor` | string | Pagination cursor |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid-...",
      "provider_id": "provider-uuid-...",
      "provider_name": "Rustam's Yurt Camp",
      "title": "Traditional Tandir Bread Baking Masterclass",
      "description": "Learn to bake traditional Uzbek bread...",
      "category": "masterclass",
      "price": 150000.00,
      "currency": "UZS",
      "duration_minutes": 120,
      "max_guests": 8,
      "is_available": true,
      "location": {
        "lat": 39.6542,
        "lng": 66.9597
      },
      "city": "Samarkand",
      "region": "Samarkand Region",
      "rating_avg": 4.8,
      "rating_count": 24,
      "media": [
        {
          "url": "https://storage.uzbektourism.app/services/...",
          "type": "photo"
        }
      ],
      "distance_km": 2.3
    }
  ],
  "pagination": {
    "next_cursor": "...",
    "has_more": true,
    "total": 45
  }
}
```

---

### `GET /api/v1/services/:id`

Get a single service by ID.

---

### `POST /api/v1/services` *(Provider only)*

Create a new service.

**Request Body:**

```json
{
  "title": "Desert Camel Riding Experience",
  "title_uz": "Cho'l tuya minish tajribasi",
  "description": "A 2-hour camel ride through the Kyzylkum Desert...",
  "category": "adventure",
  "price": 300000.00,
  "currency": "UZS",
  "duration_minutes": 120,
  "max_guests": 6,
  "location": {
    "lat": 41.5513,
    "lng": 62.8578
  },
  "address": "Nurata District",
  "city": "Nurata",
  "region": "Navoi Region"
}
```

---

### `PATCH /api/v1/services/:id` *(Provider — own only)*

Update a service.

---

### `PATCH /api/v1/services/:id/availability` *(Provider — own only)*

Toggle service availability (the core "Online/Offline" feature).

**Request Body:**

```json
{
  "is_available": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "service-uuid-...",
    "is_available": true,
    "updated_at": "2026-07-16T12:00:00Z"
  }
}
```

---

### `DELETE /api/v1/services/:id` *(Provider — own only)*

Soft-delete a service.

---

## 7. Endpoints — Bookings

### `POST /api/v1/bookings`

Create a new booking. *(Tourist or Agency)* This route genuinely exists (`apps/tourist-webapp/src/app/api/v1/bookings/route.ts`), but its actual contract differs from the shape below in three ways:

- **Auth:** it does not use the standard cookie session. It reads an `Authorization: Bearer <token>` header and constructs a request-scoped Supabase client authenticated with that token, because neither the shared anonymous client nor the SSR cookie client reliably carried the caller's identity into the underlying PostgREST call for RLS purposes. Returns `401 {error:'Unauthorized'}` if the header is missing or invalid.
- **Request body:** there is no field whitelist — the body is spread directly into the insert alongside a server-set `tourist_id`/`provider_id`. `service_id` or `itinerary_id` (not shown above) resolves `provider_id` server-side by looking up the service's or itinerary's owner.
- **Response:** returns the raw inserted row directly (`NextResponse.json(booking, {status:201})`), not wrapped in the `{success, data}` envelope shown below.

**Request Body:**

```json
{
  "service_id": "service-uuid-...",
  "booking_date": "2026-08-05",
  "guest_count": 2,
  "notes": "We are vegetarian, please adjust the menu"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "booking-uuid-...",
    "tourist_id": "tourist-uuid-...",
    "service_id": "service-uuid-...",
    "agency_id": null,
    "status": "pending",
    "booking_date": "2026-08-05",
    "guest_count": 2,
    "total_price": 300000.00,
    "currency": "UZS",
    "notes": "We are vegetarian, please adjust the menu",
    "created_at": "2026-07-16T12:00:00Z"
  }
}
```

---

### `GET /api/v1/bookings`

List bookings for the authenticated user (filtered by role via RLS).

**Query Parameters:** `status`, `from_date`, `to_date`, `service_id`, `limit`, `cursor`

> **Implementation note:** No such route exists. Reads are implemented via direct Supabase client calls from the frontend — `packages/database/src/client.ts`'s `getMyBookings(userId, role)` — not as a Next.js API route.

---

### `GET /api/v1/bookings/:id`

Get a single booking with full details.

> **Implementation note:** No such route exists as a literal endpoint; a single booking is read as part of the same direct Supabase client calls described above.

---

### `PATCH /api/v1/bookings/:id/status` *(Provider or Agency)*

Update booking status (accept, decline, cancel, complete).

**Request Body:**

```json
{
  "status": "accepted",
  "notes": "Looking forward to hosting you!"
}
```

**Business Rules:**

| Current Status | Allowed Transitions | Who Can Transition |
|---|---|---|
| `pending` | `accepted`, `declined`, `cancelled` | Provider (accept/decline), Tourist/Agency (cancel) |
| `accepted` | `confirmed`, `cancelled` | System (on payment), Tourist/Agency (cancel) |
| `confirmed` | `in_progress`, `cancelled`, `no_show` | Provider, System |
| `in_progress` | `completed` | Provider |
| `completed` | — (terminal) | — |
| `cancelled` | — (terminal) | — |
| `declined` | — (terminal) | — |

> **Implementation note:** No `PATCH /api/v1/bookings/:id/status` route exists. Status transitions are performed via direct `.update()` calls on the `bookings` table from provider-app/agency-portal booking-management components (RLS-scoped to `provider_id = auth.uid()`), which also insert a row into `booking_status_history` and a `notifications` row for the tourist.

---

### `GET /api/v1/bookings/:id/history`

Get the status change audit trail for a booking.

> **Implementation note:** No such route exists; `booking_status_history` is read directly via Supabase client calls, not through a dedicated endpoint.

---

## 8. Endpoints — Locations (Survival Map)

> **Implementation note:** No `/api/v1/locations` routes exist. Reads are implemented via a direct Supabase client call, `packages/database/src/client.ts`'s `fetchLocationsInRadius(lat, lng, radiusMeters)`, which invokes the Postgres RPC function `get_locations_in_radius` — not a REST route. There is no write path (create/update) implemented anywhere in the codebase for this endpoint group.

### `GET /api/v1/locations`

Get map pins for the Survival Map.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter by location type (`sos_hub`, `clean_toilet`, etc.) |
| `city` | string | Filter by city |
| `lat` | number | Center latitude for radius search |
| `lng` | number | Center longitude for radius search |
| `radius_km` | number | Search radius (default: 10) |
| `limit` | number | Max results (default: 100) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "location-uuid-...",
      "name": "Tourist Police HQ - Samarkand",
      "description": "Main tourist police station...",
      "type": "sos_hub",
      "coordinates": {
        "lat": 39.6542,
        "lng": 66.9597
      },
      "phone": "+998 66 233 1234",
      "operating_hours": {
        "monday": { "open": "00:00", "close": "23:59" },
        "tuesday": { "open": "00:00", "close": "23:59" }
      },
      "city": "Samarkand"
    }
  ]
}
```

---

### `GET /api/v1/locations/:id`

Get a single location with full details.

---

### `POST /api/v1/locations` *(Admin only)*

Create a new map location.

---

### `PATCH /api/v1/locations/:id` *(Admin only)*

Update a location.

---

## 9. Endpoints — Itineraries

> **Implementation note:** None of the endpoints below exist as Next.js API routes. Reads are implemented via direct Supabase client calls — `packages/database/src/client.ts`'s `getApprovedItineraries()` and `getItineraryById()`. Agency-side create/edit of itineraries is presumed to follow the same direct-Supabase-client pattern from agency-portal's package-management components (RLS-scoped to `agency_id = auth.uid()`); this was not traced route-by-route. Separately, a tourist can self-plan a trip: `POST /api/v1/ai/itinerary-suggest` (§13) generates a plan, and a Server Action — `saveGeneratedItinerary()` in `apps/tourist-webapp/src/app/actions/itinerary.ts` — persists it into `itineraries`/`itinerary_items` (RLS-scoped to the new `tourist_id` column, mutually exclusive with `agency_id`). Neither of these AI-adjacent flows goes through a `POST /api/v1/itineraries` route.

### `POST /api/v1/itineraries` *(Agency only)*

Create a new itinerary.

**Request Body:**

```json
{
  "title": "7-Day Silk Road Explorer",
  "description": "A curated journey from Tashkent to Khiva...",
  "tourist_id": "tourist-uuid-...",
  "start_date": "2026-08-01",
  "end_date": "2026-08-07"
}
```

---

### `GET /api/v1/itineraries`

List itineraries (agency sees own, tourist sees assigned, admin sees all).

---

### `GET /api/v1/itineraries/:id`

Get itinerary with all items.

**Response includes nested items:**

```json
{
  "success": true,
  "data": {
    "id": "itinerary-uuid-...",
    "title": "7-Day Silk Road Explorer",
    "start_date": "2026-08-01",
    "end_date": "2026-08-07",
    "status": "draft",
    "total_estimated_cost": 2500000.00,
    "items": [
      {
        "id": "item-uuid-...",
        "service_id": "service-uuid-...",
        "title": "Tandir Bread Baking Masterclass",
        "scheduled_date": "2026-08-03",
        "start_time": "10:00",
        "duration_minutes": 120,
        "price": 150000.00,
        "sort_order": 1
      }
    ]
  }
}
```

---

### `POST /api/v1/itineraries/:id/items` *(Agency only)*

Add a service to an itinerary.

**Request Body:**

```json
{
  "service_id": "service-uuid-...",
  "scheduled_date": "2026-08-03",
  "start_time": "10:00",
  "notes": "Confirm vegetarian options"
}
```

---

### `PATCH /api/v1/itineraries/:id/items/:itemId` *(Agency only)*

Update or reorder an itinerary item.

---

### `DELETE /api/v1/itineraries/:id/items/:itemId` *(Agency only)*

Remove an item from an itinerary.

---

### `PATCH /api/v1/itineraries/:id/status` *(Agency only)*

Update itinerary status (`draft` → `proposed` → `accepted` → `active` → `completed`).

---

## 10. Endpoints — Reviews

### `POST /api/v1/reviews` *(Tourist only)*

Submit a review for a completed booking. This route genuinely exists (`apps/tourist-webapp/src/app/api/v1/reviews/route.ts`), using the same bearer-token auth pattern as `POST /api/v1/bookings` (§7). Only `booking_id` is required in the body; the rest is spread as-is into the insert alongside a server-set `tourist_id`. The response is `{success:true, data: review}` with an implicit `200` status (no explicit `201`).

**Request Body:**

```json
{
  "booking_id": "booking-uuid-...",
  "rating": 5,
  "comment": "Amazing experience! Rustam was incredibly welcoming."
}
```

**Business Rules (enforced server-side in the real route):**
- Tourist can only review bookings with `completed` status (`422` otherwise).
- Reviewer must be the booking's own tourist (`403` otherwise); booking must exist (`404` otherwise).
- Rating must be 1–5.
- There is no explicit "one review per booking" check in the route's own code — this relies on a database-level constraint rather than an application-level check.

A related but separate route, `POST /api/v1/destination-reviews` (not part of this section's scope in the original design — destination-level reviews are a distinct concept from service/itinerary reviews), also exists in the codebase and is not otherwise documented here.

---

### `GET /api/v1/services/:id/reviews`

Get all reviews for a specific service.

**Query Parameters:** `sort_by` (`rating`, `created_at`), `sort_order`, `limit`, `cursor`

> **Implementation note:** No such route exists. Reads are implemented via direct Supabase client calls — `packages/database/src/client.ts`'s `getReviewsForService()`, `getReviewsForItinerary()`, `getReviewsForServices()` (batch), and `getMyReviews()` — not through a dedicated endpoint.

---

## 11. Endpoints — Provider Verification (Admin)

> **Implementation note:** Neither endpoint below exists as a Next.js API route. Both are Server Actions in `apps/admin-portal/src/app/actions/verificationActions.ts` — `getUnifiedVerificationRequests()`, `approveUser(requestId, userId)`, and `rejectUser(requestId, reason)` — run with the service-role key (full RLS bypass), relying on `middleware.ts` to gate who can reach the admin-portal app at all rather than on a per-request API authorization check.

### `GET /api/v1/admin/verifications`

List pending provider verifications. *(Admin only)*

**Query Parameters:** `status` (`pending`, `approved`, `rejected`), `limit`, `cursor`

---

### `PATCH /api/v1/admin/verifications/:id`

Approve or reject a provider. *(Admin only)*

**Request Body:**

```json
{
  "status": "approved"
}
```

or:

```json
{
  "status": "rejected",
  "rejection_reason": "Uploaded documents are expired. Please re-submit current business license."
}
```

---

## 12. Endpoints — Analytics (Admin)

> **Implementation note:** None of the endpoints below exist as Next.js API routes. `GET /api/v1/admin/analytics/overview` and `.../trends` are covered by Server Actions in `apps/admin-portal/src/app/actions/` — `getAnalyticsData()` (`analyticsActions.ts`, bookings-by-status, users-by-role, top-5 services, review counts/ratings) and `getPlatformStats()` (`dashboardActions.ts`, tourist/booking/verification counts, GMV, 7-day revenue breakdown). `GET /api/v1/admin/analytics/heatmap` has **no backing implementation at all** — the admin dashboard's "Tourist Density Heatmap" card is a static placeholder (literal text "Mapbox Integration Pending") with no PostGIS query or real data binding behind it.

### `GET /api/v1/admin/analytics/overview`

Get platform-wide KPI summary. *(Admin only)*

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "active_tourists": 342,
    "verified_providers": 48,
    "active_agencies": 7,
    "bookings_today": 15,
    "bookings_this_week": 87,
    "bookings_this_month": 312,
    "gmv_this_month": 45000000.00,
    "gmv_currency": "UZS"
  }
}
```

---

### `GET /api/v1/admin/analytics/heatmap`

Get anonymized tourist density data for heatmap rendering. *(Admin only)*

**Query Parameters:** `city`, `timeframe` (`1h`, `24h`, `7d`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "timeframe": "1h",
    "grid_cells": [
      {
        "lat": 39.654,
        "lng": 66.975,
        "density": 42
      },
      {
        "lat": 39.658,
        "lng": 66.960,
        "density": 18
      }
    ]
  }
}
```

---

### `GET /api/v1/admin/analytics/trends`

Get trend data for dashboards. *(Admin only)*

**Query Parameters:** `metric` (`bookings`, `users`, `gmv`), `period` (`daily`, `weekly`, `monthly`), `from`, `to`

---

## 13. Endpoints — AI Features

All AI endpoints in this section are real Next.js Route Handlers under `apps/tourist-webapp/src/app/api/v1/ai/` (unlike most other sections in this document — see the implementation notes elsewhere). Each calls the Moonshot `kimi-k3` model through an OpenAI-compatible client (`createOpenAI({ baseURL: "https://api.moonshot.ai/v1", apiKey: process.env.MOONSHOT_API_KEY })`), replacing the OpenAI GPT-4 integration originally planned. A `503 SERVICE_UNAVAILABLE` is returned if `MOONSHOT_API_KEY` is unset or the upstream call fails. Rate limiting uses Upstash Redis sliding windows when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are configured, falling back to a per-process in-memory counter otherwise (not distributed — resets on cold start, and gives no real protection across multiple serverless instances); see §17.2 for the actual limits enforced per endpoint.

### `POST /api/v1/ai/translate`

Contextual translation for tourists. No sign-in is required — anonymous callers are accepted, rate-limited by IP (`x-forwarded-for`) instead of user ID.

**Request Body:**

```json
{
  "text": "I am vegetarian. Does this dish contain meat?",
  "context_situation": "restaurant",
  "target_language": "uz"
}
```

All three fields are required (`400 VALIDATION_ERROR` if any are missing). There is no `source_language` field.

**Response (200 OK):**

```json
{
  "success": true,
  "translation": "Men vegetarianman. Bu taomda go'sht bormi? Culture Tip: In Uzbekistan, most traditional dishes contain meat — ask for 'go'shtsiz' (without meat) when ordering."
}
```

The response is a single flat JSON object, not wrapped in a `data` envelope. There is no `transliteration`, `cultural_note`, or `audio_url` field — the model is instructed to fold a short "Culture Tip" directly into the `translation` string rather than returning it separately.

> **Note:** The tourist-webapp's `/translator` page (`components/ContextualTranslator.tsx`) has not been updated to this contract — it still POSTs `{prompt}` and expects a streamed plain-text response, so submissions from that page currently fail against this endpoint. The page is also unlinked from in-app navigation, superseded by the AI chat assistant below. This reads as an incomplete migration rather than a deliberate deprecation; treat `/translator` as orphaned pending a product decision on whether to fix or remove it.

---

### `POST /api/v1/ai/scan-menu`

Taste & Trust menu scanner. Requires an authenticated session (`401 {success:false, error:"Sign in to scan a menu"}` otherwise — no anonymous path).

**Request Body:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `image` | file | Menu photo (JPEG/PNG, max 10 MB) |
| `dietary_restrictions` | string[] | User's restrictions (optional, up to 10 entries) |

**Response (200 OK):**

```json
{
  "success": true,
  "dishes": [
    {
      "original_text": "Плов",
      "translated_name": "Plov (Rice Pilaf)",
      "description": "Uzbekistan's national dish: rice cooked with carrots, onions, and lamb in a large kazan pot.",
      "ingredients": ["rice", "lamb", "carrots", "onions", "cumin", "oil"],
      "allergens": [],
      "warnings": ["Contains lamb meat"],
      "dietary_flags": {
        "vegetarian": false,
        "vegan": false,
        "halal": true,
        "gluten_free": true,
        "nut_free": true
      },
      "price_original": "45,000",
      "price_usd_approx": 3.50
    },
    {
      "original_text": "Самса",
      "translated_name": "Samsa (Baked Pastry)",
      "description": "Flaky pastry filled with seasoned lamb and onions, baked in a tandir oven.",
      "ingredients": ["flour", "lamb", "onions", "cumin", "butter"],
      "allergens": ["gluten", "dairy"],
      "warnings": ["Contains gluten (wheat flour)", "Contains dairy (butter)", "Contains lamb meat"],
      "dietary_flags": {
        "vegetarian": false,
        "vegan": false,
        "halal": true,
        "gluten_free": false,
        "nut_free": true
      },
      "price_original": "15,000",
      "price_usd_approx": 1.17
    }
  ],
  "restaurant_notes": "Traditional Uzbek choyxona. Most dishes are meat-heavy. Ask for 'sabzavotli' (vegetable) options.",
  "scan_confidence": 0.94
}
```

The dish schema itself (`dishes[]`, `restaurant_notes`, `scan_confidence`) is accurate field-for-field, but the envelope is flat — these are top-level siblings of `success`, not nested under a `data` key.

The uploaded photo is persisted, best-effort, to the private `menu-scans` storage bucket at `<user_id>/<uuid>.<ext>`; a failed upload is logged but does not fail the scan request.

Errors: `400` missing/invalid image; `413` image too large; `503` scanner unavailable; `429` on rate limit (see §17.2 — hourly only, no daily cap is enforced despite what earlier revisions of this table claimed).

---

### `POST /api/v1/ai/itinerary-suggest`

AI-powered itinerary suggestion for a signed-in tourist self-planning their own trip (`401 {success:false, error:"Sign in to plan an itinerary"}` if not signed in — no anonymous path, and no role restriction beyond "signed in"). This is a tourist self-service planner, not an agency-facing tool.

**Request Body:**

```json
{
  "days": 7,
  "budget_usd": 500,
  "interests": ["culture", "food", "adventure"],
  "start_date": "2026-08-01"
}
```

| Field | Type | Description |
|---|---|---|
| `days` | number | Trip length in days, 1–21 |
| `budget_usd` | number | Total trip budget in USD, must be positive |
| `interests` | string[] | 1–10 interest tags |
| `start_date` | string | ISO date string, must parse as a valid date |

There is no `start_city`, `end_city`, `group_size`, or `dietary_restrictions` field.

**Response (200 OK):**

```json
{
  "success": true,
  "total_estimated_cost": 480,
  "days": [
    {
      "day_number": 1,
      "theme": "Arrival & Old Town Tashkent",
      "activities": [
        {
          "time": "09:00",
          "title": "Chorsu Bazaar walking tour",
          "description": "Explore Tashkent's largest traditional market...",
          "location_name": "Chorsu Bazaar",
          "estimated_cost": 15
        }
      ]
    }
  ]
}
```

The response is flat (no `data` wrapper).

The generator deliberately biases suggestions away from Tashkent and Samarkand toward a fixed set of decentralization-focus regions (Nurata, Gijduvan, Zaamin, Sentob, Yangiabad), grounding activities in real `services` listings from those regions where available.

This route only generates a plan; it does not persist anything. `export const maxDuration = 300` is set because generation has been observed to take 60–170+ seconds — this requires a Vercel plan/runtime that honors extended function durations (a plan capped at 10 seconds would hard-fail this route).

Errors: `400` on validation failure; `503` planner unavailable; `429` on rate limit (see §17.2 — hourly only, no daily cap is enforced despite what earlier revisions of this table claimed).

> **Note — saving a generated itinerary:** There is no `POST /api/v1/itineraries` call in this flow. A generated plan is saved via the Server Action `saveGeneratedItinerary()` (`apps/tourist-webapp/src/app/actions/itinerary.ts`), which inserts one `itineraries` row (`tourist_id`, `status: "draft"`, `currency: "USD"` — note this differs from the rest of the platform's `UZS` default) and one `itinerary_items` row per activity, using that table's `description`, `location_name`, `scheduled_time`, and `day_number` columns.

---

### `POST /api/v1/ai/chat`

Persistent AI chat assistant ("Kimi"). Anonymous use is allowed for one-off exchanges; signed-in users get durable, server-side history.

**Request Body:**

```json
{
  "content": "What should I pack for a trip to Samarkand in October?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

`content` is required (`400` if missing/empty). `history` is only used for anonymous callers — client-supplied, sanitized and capped to the last 20 turns. For a signed-in user, context is always loaded server-side from that user's own stored history, so a client-supplied `history` cannot spoof context.

**Response (200 OK):**

```json
{
  "success": true,
  "reply": "For a trip to Samarkand in October, pack layers..."
}
```

For signed-in users, both the user's message and the assistant's reply are persisted to `ai_chat_messages` (best-effort — a persistence failure is logged but does not fail the response). Anonymous conversations are not persisted at all.

Errors: `400` missing `content`; `503` chat service unavailable/unconfigured; `429` on rate limit (see §17.2); `500` on unexpected failure.

---

### `GET /api/v1/ai/chat`

Get the authenticated user's chat history.

**Response (200 OK):**

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-uuid-...",
      "role": "user",
      "content": "What should I pack for a trip to Samarkand in October?",
      "created_at": "2026-08-12T09:00:00Z"
    },
    {
      "id": "msg-uuid-...",
      "role": "assistant",
      "content": "For a trip to Samarkand in October, pack layers...",
      "created_at": "2026-08-12T09:00:03Z"
    }
  ]
}
```

Returns the caller's last 50 messages, oldest first. For anonymous callers, or on any read error, this returns `{"success": true, "messages": []}` rather than an error status — a deliberate fail-empty pattern rather than `401`/`500`.

**Backing table:** `ai_chat_messages` (`id`, `user_id`, `role` — `"user"` | `"assistant"`, `content`, `created_at`). RLS is scoped to `auth.uid() = user_id` for both `SELECT` and `INSERT`; there is no `UPDATE`/`DELETE` policy, so messages are immutable once written.

---

## 14. Endpoints — Notifications

> **Implementation note:** No route.ts or Server Action implementing these endpoints was found in the codebase. Given the pattern used elsewhere, notifications are most likely read via direct Supabase client calls against the `notifications` table plus a Realtime subscription on `notifications:{user_id}` (§15.1) from components, but this has not been independently confirmed line-by-line. `POST /api/v1/notifications/subscribe` (Web Push registration) has no corresponding implementation evidence at all — no `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` env vars and no `PushManager`/service-worker push code exist anywhere in the repo, so treat Web Push as unimplemented.

### `GET /api/v1/notifications`

Get notifications for the authenticated user.

**Query Parameters:** `is_read` (boolean), `type`, `limit`, `cursor`

---

### `PATCH /api/v1/notifications/:id/read`

Mark a notification as read.

---

### `POST /api/v1/notifications/subscribe`

Register a Web Push subscription.

**Request Body:**

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

---

## 15. Webhooks & Events

### 15.1 Supabase Realtime Channels

The platform uses Supabase Realtime for live data synchronization:

| Channel | Purpose | Subscribers |
|---|---|---|
| `services:availability` | Provider Online/Offline toggle changes | Agency Portal |
| `bookings:provider:{id}` | New bookings for a specific provider | Provider App |
| `bookings:tourist:{id}` | Booking status updates for a tourist | Tourist App |
| `bookings:agency:{id}` | All booking updates for an agency | Agency Portal |
| `notifications:{user_id}` | User-specific notifications | All portals |

### 15.2 Event Payload Format

```json
{
  "event": "INSERT",
  "schema": "public",
  "table": "bookings",
  "commit_timestamp": "2026-07-16T12:00:00Z",
  "old_record": null,
  "record": {
    "id": "booking-uuid-...",
    "status": "pending",
    "tourist_id": "tourist-uuid-...",
    "service_id": "service-uuid-..."
  }
}
```

### 15.3 Future Webhook Endpoints

For future payment provider integrations:

| Webhook | Source | Purpose |
|---|---|---|
| `POST /api/v1/webhooks/stripe` | Stripe | Payment confirmations |
| `POST /api/v1/webhooks/payme` | Payme | Local payment confirmations |

---

## 16. Error Handling

### 16.1 Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid request body or parameters |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT token |
| `403` | `FORBIDDEN` | Valid token but insufficient permissions |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Resource already exists (e.g., duplicate review) |
| `422` | `BUSINESS_RULE_ERROR` | Valid request but violates business rule |
| `429` | `RATE_LIMITED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Unexpected server error |
| `503` | `SERVICE_UNAVAILABLE` | Upstream service unavailable (Moonshot AI, Mapbox) |

### 16.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Cannot review a booking that is not completed",
    "details": [
      {
        "field": "booking_id",
        "issue": "Booking status is 'pending', must be 'completed'"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-16T12:00:00Z",
    "request_id": "req_xyz789"
  }
}
```

---

## 17. Rate Limiting

### 17.1 Rate Limits by Role

| Role | Requests/Minute | Burst Limit |
|---|---|---|
| Tourist | 60 | 100 |
| Provider | 30 | 50 |
| Agency | 120 | 200 |
| Admin | 300 | 500 |
| Unauthenticated | 10 | 20 |

### 17.2 AI Endpoint Limits

| Endpoint | Requests/Hour | Daily Cap |
|---|---|---|
| `/ai/translate` | 60 | 500 |
| `/ai/scan-menu` | 20 | — (not enforced) |
| `/ai/itinerary-suggest` | 10 | — (not enforced) |
| `/ai/chat` | 60 | — (not enforced) |

Only `/ai/translate` enforces a daily cap in addition to its hourly limit. `/ai/scan-menu`, `/ai/itinerary-suggest`, and `/ai/chat` enforce an hourly limit only — there is no daily counter in code for these three, regardless of what a cap column might suggest. All limits are keyed by `user.id` when signed in; anonymous callers on `/ai/translate` and `/ai/chat` are keyed by the `x-forwarded-for` header, falling back to a shared `"anonymous_user"` bucket if that header is absent.

### 17.3 Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1721145660
Retry-After: 30
```

---

*This API specification will be updated as new features are implemented. Breaking changes will be communicated through API versioning (`/v2/`).*
