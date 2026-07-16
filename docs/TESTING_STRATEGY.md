# Testing Strategy — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Pyramid](#2-testing-pyramid)
3. [Unit Testing](#3-unit-testing)
4. [Integration Testing](#4-integration-testing)
5. [End-to-End (E2E) Testing](#5-end-to-end-e2e-testing)
6. [API Testing](#6-api-testing)
7. [Database & RLS Testing](#7-database--rls-testing)
8. [Performance Testing](#8-performance-testing)
9. [Accessibility Testing](#9-accessibility-testing)
10. [PWA Testing](#10-pwa-testing)
11. [CI Pipeline Integration](#11-ci-pipeline-integration)
12. [Coverage Targets](#12-coverage-targets)
13. [Testing Environments](#13-testing-environments)
14. [Quality Gates](#14-quality-gates)

---

## 1. Testing Philosophy

### Core Principles

| Principle | Description |
|---|---|
| **Test What Matters** | Prioritize business-critical paths (bookings, auth, payments) over cosmetic tests |
| **Shift Left** | Catch bugs as early as possible — unit tests run on every push |
| **Realistic Data** | Use seed data that mirrors production scenarios (Uzbek names, UZS prices) |
| **Security-Aware** | Explicitly test RLS policies and cross-tenant data isolation |
| **Fast Feedback** | Unit tests < 30s, integration < 2 min, E2E < 10 min |

### Testing Responsibilities

| Role | Responsibilities |
|---|---|
| **Feature Developer** | Write unit tests for all new functions; integration tests for API routes |
| **QA (if hired)** | E2E test scenarios, exploratory testing, cross-browser verification |
| **DevOps** | CI pipeline configuration, test environment management |
| **Security Lead** | RLS policy tests, penetration testing coordination |

---

## 2. Testing Pyramid

```
         ╱╲
        ╱  ╲          E2E Tests (Playwright)
       ╱    ╲         ~20 critical user flows
      ╱──────╲
     ╱        ╲       Integration Tests (Vitest + Supabase)
    ╱          ╲      ~100 API routes, DB queries, RLS policies
   ╱────────────╲
  ╱              ╲    Unit Tests (Vitest)
 ╱                ╲   ~500+ pure functions, components, hooks
╱──────────────────╲
```

| Layer | Tool | Count (Target) | Run Time |
|---|---|---|---|
| **Unit** | Vitest + React Testing Library | 500+ | < 30 seconds |
| **Integration** | Vitest + Supabase local | 100+ | < 2 minutes |
| **E2E** | Playwright | 20–40 | < 10 minutes |

---

## 3. Unit Testing

### 3.1 Tooling

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner (fast, Vite-native, TypeScript support) |
| **React Testing Library** | Component testing (user-centric, accessibility-focused) |
| **MSW (Mock Service Worker)** | Mock API responses in component tests |
| **@testing-library/user-event** | Simulate realistic user interactions |

### 3.2 What to Unit Test

| Category | Examples |
|---|---|
| **Utility Functions** | Price formatting (UZS → USD), date formatting, distance calculation |
| **Validation Logic** | Form validators, booking date validation, guest count limits |
| **Business Logic** | Booking status transitions, price calculation, availability checks |
| **React Hooks** | `useBooking`, `useAuth`, `useMapPins`, `useTranslation` |
| **React Components** | Button states, Card rendering, Form error display, Status badges |
| **Type Guards** | User role checks, API response type validation |

### 3.3 Naming Convention

```
[function/component].[test scenario].[expected result]

// Examples:
formatPrice.withUZS.returnsFormattedString
BookingCard.whenPending.showsAcceptDeclineButtons
validateBookingDate.withPastDate.returnsError
```

### 3.4 File Structure

```
packages/ui/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx      ← Component test
│   │   └── Button.stories.tsx
│   └── BookingCard/
│       ├── BookingCard.tsx
│       ├── BookingCard.test.tsx
│       └── BookingCard.stories.tsx
├── utils/
│   ├── formatters.ts
│   └── formatters.test.ts       ← Unit test
└── hooks/
    ├── useBooking.ts
    └── useBooking.test.ts        ← Hook test
```

### 3.5 Example Unit Tests

```typescript
// formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, formatDistance } from './formatters';

describe('formatPrice', () => {
  it('formats UZS with thousand separators', () => {
    expect(formatPrice(150000, 'UZS')).toBe("150,000 UZS");
  });

  it('formats USD with dollar sign', () => {
    expect(formatPrice(3.50, 'USD')).toBe("$3.50");
  });

  it('handles zero', () => {
    expect(formatPrice(0, 'UZS')).toBe("0 UZS");
  });
});

describe('formatDistance', () => {
  it('shows meters for distances under 1km', () => {
    expect(formatDistance(750)).toBe("750 m");
  });

  it('shows km for distances over 1km', () => {
    expect(formatDistance(2300)).toBe("2.3 km");
  });
});
```

```tsx
// BookingCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingCard } from './BookingCard';

describe('BookingCard', () => {
  const mockBooking = {
    id: 'booking-1',
    status: 'pending',
    serviceName: 'Tandir Bread Baking',
    bookingDate: '2026-08-05',
    guestCount: 2,
    totalPrice: 300000,
    currency: 'UZS',
  };

  it('renders booking details', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('Tandir Bread Baking')).toBeInTheDocument();
    expect(screen.getByText('300,000 UZS')).toBeInTheDocument();
    expect(screen.getByText('2 guests')).toBeInTheDocument();
  });

  it('shows Accept/Decline buttons when pending', () => {
    render(<BookingCard booking={mockBooking} userRole="provider" />);
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('hides action buttons when completed', () => {
    render(<BookingCard booking={{ ...mockBooking, status: 'completed' }} userRole="provider" />);
    expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument();
  });
});
```

---

## 4. Integration Testing

### 4.1 Tooling

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner |
| **Supabase local** | Local PostgreSQL with RLS policies |
| **Supabase Test Helpers** | Create test users, seed data |

### 4.2 What to Integration Test

| Category | Examples |
|---|---|
| **API Routes** | All Next.js API endpoints (request/response validation) |
| **Database Queries** | Service listing with filters, booking creation, spatial queries |
| **RLS Policies** | Cross-tenant data isolation (critical!) |
| **Auth Flows** | Registration, login, token refresh, role assignment |
| **Realtime** | Provider availability toggle → Agency sees update |
| **File Uploads** | Service photo upload → Storage URL returned |

### 4.3 RLS Policy Testing (Critical)

```typescript
// rls-policies.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('RLS: Bookings Table', () => {
  let touristClient: SupabaseClient;
  let agencyClient: SupabaseClient;
  let providerClient: SupabaseClient;

  beforeAll(async () => {
    touristClient = createAuthenticatedClient('tourist@test.com');
    agencyClient = createAuthenticatedClient('agency@test.com');
    providerClient = createAuthenticatedClient('provider@test.com');
  });

  it('tourist can only see their own bookings', async () => {
    const { data } = await touristClient.from('bookings').select('*');
    expect(data?.every(b => b.tourist_id === TOURIST_ID)).toBe(true);
  });

  it('agency cannot see another agency bookings', async () => {
    const { data } = await agencyClient.from('bookings').select('*');
    expect(data?.every(b => b.agency_id === AGENCY_ID || b.agency_id === null)).toBe(true);
  });

  it('provider can see bookings for their services only', async () => {
    const { data } = await providerClient.from('bookings').select('*, services!inner(provider_id)');
    expect(data?.every(b => b.services.provider_id === PROVIDER_ID)).toBe(true);
  });

  it('tourist cannot update booking status', async () => {
    const { error } = await touristClient
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', BOOKING_ID);
    expect(error).toBeTruthy();
  });
});
```

### 4.4 API Route Testing

```typescript
// api/bookings.test.ts
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/v1/bookings/route';

describe('POST /api/v1/bookings', () => {
  it('creates a booking with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${TOURIST_TOKEN}` },
      body: {
        service_id: 'service-uuid',
        booking_date: '2026-08-05',
        guest_count: 2,
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('pending');
  });

  it('rejects booking with past date', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${TOURIST_TOKEN}` },
      body: {
        service_id: 'service-uuid',
        booking_date: '2020-01-01',
        guest_count: 2,
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(422);
  });

  it('rejects unauthenticated request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { service_id: 'service-uuid', booking_date: '2026-08-05', guest_count: 2 },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });
});
```

---

## 5. End-to-End (E2E) Testing

### 5.1 Tooling

| Tool | Purpose |
|---|---|
| **Playwright** | Cross-browser E2E testing (Chromium, Firefox, WebKit) |
| **Playwright Test** | Built-in test runner with parallel execution |

### 5.2 Critical User Flows to Test

| # | Flow | Portal | Priority |
|---|---|---|---|
| 1 | Tourist registration → login → profile setup | Tourist | P0 |
| 2 | Tourist views Survival Map → taps pin → sees details | Tourist | P0 |
| 3 | Tourist scans menu → receives translated results | Tourist | P0 |
| 4 | Tourist browses services → books a masterclass | Tourist | P0 |
| 5 | Provider registers → creates service profile | Provider | P0 |
| 6 | Provider toggles Online/Offline | Provider | P0 |
| 7 | Provider receives booking → accepts | Provider | P0 |
| 8 | Agency views provider inventory → filters | Agency | P0 |
| 9 | Agency creates itinerary → adds services | Agency | P1 |
| 10 | Agency CRM kanban → drags booking card | Agency | P1 |
| 11 | Admin views pending providers → approves one | Admin | P0 |
| 12 | Admin views analytics dashboard | Admin | P1 |
| 13 | Admin views heatmap | Admin | P1 |
| 14 | Full booking flow: Tourist books → Provider accepts → Confirmed | Cross-portal | P0 |
| 15 | Tourist leaves review after completed booking | Tourist | P1 |

### 5.3 E2E Test Example

```typescript
// e2e/tourist-booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tourist Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'tourist@test.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('tourist can browse and book a masterclass', async ({ page }) => {
    // Navigate to discovery
    await page.click('[data-testid="nav-discover"]');
    await expect(page.locator('[data-testid="service-card"]')).toHaveCount.greaterThan(0);

    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'masterclass');

    // Click first service
    await page.click('[data-testid="service-card"]:first-child');
    await expect(page.locator('[data-testid="service-title"]')).toBeVisible();

    // Book the service
    await page.click('[data-testid="book-now-button"]');
    await page.fill('[data-testid="booking-date"]', '2026-08-05');
    await page.fill('[data-testid="guest-count"]', '2');
    await page.click('[data-testid="confirm-booking"]');

    // Verify confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Pending');
  });
});
```

### 5.4 Browser Matrix

| Browser | Engine | Test Priority |
|---|---|---|
| **Chrome** | Chromium | Primary (most tourists) |
| **Safari** | WebKit | Primary (iOS PWA) |
| **Firefox** | Gecko | Secondary |
| **Samsung Internet** | Chromium | Spot-check |

---

## 6. API Testing

### 6.1 Automated API Tests

Run alongside integration tests, but focused on HTTP contract validation:

| Test Area | Examples |
|---|---|
| **Status Codes** | 200, 201, 400, 401, 403, 404, 422, 429, 500 |
| **Response Schema** | JSON structure matches API specification |
| **Auth Enforcement** | All protected routes reject unauthenticated requests |
| **Rate Limiting** | 429 returned after exceeding limits |
| **Input Validation** | Invalid request bodies return descriptive errors |
| **Pagination** | Cursor-based pagination returns correct results |

### 6.2 Manual API Testing

| Tool | Purpose |
|---|---|
| **Thunder Client (VS Code)** | Quick manual API testing during development |
| **Postman Collection** | Shared team collection with all endpoints |

---

## 7. Database & RLS Testing

### 7.1 Migration Testing

```bash
# Reset database and re-run all migrations
pnpm supabase db reset

# Verify all tables exist
pnpm supabase db lint
```

### 7.2 Seed Data Validation

```bash
# Apply seed data and verify counts
pnpm supabase db reset --seed
```

### 7.3 Spatial Query Testing

```sql
-- Test: Find services within 50km of Samarkand
SELECT COUNT(*) FROM services
WHERE ST_DWithin(
  location,
  ST_MakePoint(66.9597, 39.6542)::geography,
  50000
);
-- Expected: > 0
```

---

## 8. Performance Testing

### 8.1 Lighthouse CI

Run Lighthouse audits on every PR:

| Metric | Threshold | Action if Below |
|---|---|---|
| **Performance** | ≥ 90 | Block merge |
| **Accessibility** | ≥ 95 | Block merge |
| **Best Practices** | ≥ 90 | Warning |
| **SEO** | ≥ 90 | Warning |
| **PWA** | Pass all audits | Block merge |

### 8.2 Load Testing (Pre-Launch)

| Tool | Scenario | Target |
|---|---|---|
| **k6** | 100 concurrent users browsing services | p95 < 200ms |
| **k6** | 50 concurrent bookings | p95 < 500ms |
| **k6** | 200 map tile requests | p95 < 1s |
| **k6** | 20 concurrent AI translations | p95 < 5s |

---

## 9. Accessibility Testing

### 9.1 Automated

| Tool | Integration |
|---|---|
| **axe-core** | Integrated with Playwright for E2E a11y checks |
| **eslint-plugin-jsx-a11y** | Lint-time accessibility checks |
| **Lighthouse** | Accessibility audit in CI |

### 9.2 Manual

| Test | Frequency |
|---|---|
| **Screen reader testing** (VoiceOver, NVDA) | Before each major release |
| **Keyboard-only navigation** | Every sprint |
| **High contrast mode** | Before each major release |
| **200% zoom** | Before each major release |

---

## 10. PWA Testing

| Test | Method | Tool |
|---|---|---|
| **Installability** | Verify install prompt appears | Chrome DevTools |
| **Offline mode** | Disable network → verify cached pages | Playwright |
| **Push notifications** | Send test notification → verify receipt | Manual + Playwright |
| **Service Worker** | Verify assets cached correctly | Chrome DevTools |
| **Manifest** | Validate manifest.json fields | Lighthouse |
| **iOS Safari** | Test PWA on iPhone Safari | BrowserStack |

---

## 11. CI Pipeline Integration

### 11.1 Test Stages in GitHub Actions

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test:unit
    timeout-minutes: 5

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      supabase:
        image: supabase/postgres:15
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm supabase db reset
      - run: pnpm turbo test:integration
    timeout-minutes: 10

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install
      - run: pnpm turbo build
      - run: pnpm turbo test:e2e
    timeout-minutes: 20

  lighthouse:
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000
          budgetPath: ./lighthouse-budget.json
```

### 11.2 Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "turbo test",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest watch",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 12. Coverage Targets

| Type | Target | Measurement |
|---|---|---|
| **Unit Tests** | ≥ 80% statement coverage | Vitest `--coverage` |
| **Integration Tests** | 100% API route coverage | All routes have ≥ 1 test |
| **E2E Tests** | All P0 flows covered | Flow checklist |
| **RLS Tests** | 100% policy coverage | Every table, every role |
| **Branch Coverage** | ≥ 70% | Vitest coverage report |

### Coverage Enforcement

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
      exclude: [
        'node_modules',
        '**/*.test.*',
        '**/*.stories.*',
        '**/types/**',
      ],
    },
  },
});
```

---

## 13. Testing Environments

| Environment | Database | API | Purpose |
|---|---|---|---|
| **Local Dev** | Supabase Local (Docker) | `localhost:3000–3003` | Developer testing |
| **CI** | Supabase in Docker | Ephemeral | Automated pipeline |
| **Staging** | Supabase Branch DB | `staging.*.uzbektourism.app` | Pre-production validation |
| **Production** | Supabase Production | `*.uzbektourism.app` | Smoke tests only (read-only) |

---

## 14. Quality Gates

A PR cannot be merged to `main` unless:

| Gate | Requirement |
|---|---|
| ✅ **Unit Tests** | All pass, coverage ≥ 80% |
| ✅ **Integration Tests** | All pass |
| ✅ **Type Check** | `tsc --noEmit` passes |
| ✅ **Lint** | ESLint + Prettier pass |
| ✅ **Build** | `turbo build` succeeds |
| ✅ **E2E (P0 flows)** | All pass (on PR to `main`) |
| ✅ **Lighthouse** | Performance ≥ 90, Accessibility ≥ 95 |
| ✅ **Code Review** | ≥ 1 approval from team member |

---

*This testing strategy will evolve as the platform matures. New test scenarios should be added with each feature release.*
