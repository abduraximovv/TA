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

Create a new booking. *(Tourist or Agency)*

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

---

### `GET /api/v1/bookings/:id`

Get a single booking with full details.

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

---

### `GET /api/v1/bookings/:id/history`

Get the status change audit trail for a booking.

---

## 8. Endpoints — Locations (Survival Map)

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

Submit a review for a completed booking.

**Request Body:**

```json
{
  "booking_id": "booking-uuid-...",
  "rating": 5,
  "comment": "Amazing experience! Rustam was incredibly welcoming."
}
```

**Business Rules:**
- Tourist can only review bookings with `completed` status.
- One review per booking.
- Rating must be 1–5.

---

### `GET /api/v1/services/:id/reviews`

Get all reviews for a specific service.

**Query Parameters:** `sort_by` (`rating`, `created_at`), `sort_order`, `limit`, `cursor`

---

## 11. Endpoints — Provider Verification (Admin)

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

### `POST /api/v1/ai/translate`

Contextual translation for tourists.

**Request Body:**

```json
{
  "text": "I am vegetarian. Does this dish contain meat?",
  "source_language": "en",
  "target_language": "uz",
  "context": "restaurant"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "translation": "Men vegetarianman. Bu taomda go'sht bormi?",
    "transliteration": "Men vegetarianman. Bu taomda go'sht bormi?",
    "cultural_note": "In Uzbekistan, most traditional dishes contain meat. Ask for 'go'shtsiz' (without meat) when ordering.",
    "audio_url": null
  }
}
```

---

### `POST /api/v1/ai/scan-menu`

Taste & Trust menu scanner.

**Request Body:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `image` | file | Menu photo (JPEG/PNG, max 10 MB) |
| `dietary_restrictions` | string[] | User's restrictions (optional) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
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
}
```

---

### `POST /api/v1/ai/itinerary-suggest` *(Agency)*

AI-powered itinerary suggestion.

**Request Body:**

```json
{
  "start_city": "Tashkent",
  "end_city": "Khiva",
  "duration_days": 7,
  "budget_per_day_usd": 50,
  "interests": ["culture", "food", "adventure"],
  "group_size": 2,
  "dietary_restrictions": ["vegetarian"]
}
```

---

## 14. Endpoints — Notifications

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
| `503` | `SERVICE_UNAVAILABLE` | Upstream service unavailable (OpenAI, Mapbox) |

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
| `/ai/scan-menu` | 20 | 100 |
| `/ai/itinerary-suggest` | 10 | 50 |

### 17.3 Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1721145660
Retry-After: 30
```

---

*This API specification will be updated as new features are implemented. Breaking changes will be communicated through API versioning (`/v2/`).*
