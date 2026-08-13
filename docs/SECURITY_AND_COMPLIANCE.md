# Security & Compliance — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Classification:** Internal — Engineering Team  
**Status:** Draft

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Authentication Strategy](#2-authentication-strategy)
3. [Authorization & Row-Level Security](#3-authorization--row-level-security)
4. [Data Protection & Encryption](#4-data-protection--encryption)
5. [Privacy & GDPR Compliance](#5-privacy--gdpr-compliance)
6. [E-Mehmon Government Compliance](#6-e-mehmon-government-compliance)
7. [Application Security](#7-application-security)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Threat Model](#9-threat-model)
10. [Incident Response Plan](#10-incident-response-plan)
11. [Security Audit Checklist](#11-security-audit-checklist)

---

## 1. Security Architecture Overview

### Defense-in-Depth Model

```
Layer 1: Network (Cloudflare WAF, DDoS protection, TLS 1.3)
    └── Layer 2: Application (Next.js middleware, input validation, CSRF)
        └── Layer 3: API (JWT verification, rate limiting, CORS)
            └── Layer 4: Database (RLS policies, encryption at rest)
                └── Layer 5: Monitoring (Anomaly detection, audit logs)
```

### Security Principles

| Principle | Implementation |
|---|---|
| **Least Privilege** | Users only access data their role permits (via RLS) |
| **Defense in Depth** | Multiple security layers, not single-point reliance |
| **Fail Secure** | Unauthorized requests return empty results, not errors with sensitive data |
| **Audit Everything** | All state changes (bookings, verifications) are logged with timestamps and actors |
| **Encrypt Everything** | TLS in transit, AES-256 at rest, hashed passwords |

---

## 2. Authentication Strategy

### 2.1 Supabase Auth Configuration

| Feature | Configuration |
|---|---|
| **Provider** | Supabase Auth (GoTrue) |
| **JWT Algorithm** | HS256 |
| **Access Token Lifetime** | 1 hour |
| **Refresh Token Lifetime** | 7 days |
| **Session Management** | Server-side via Supabase Auth cookies |
| **Password Policy** | Minimum 8 chars, 1 uppercase, 1 number, 1 special |
| **Account Lockout** | 5 failed attempts → 15-minute lockout |
| **MFA** | Optional TOTP for Agency and Admin users (recommended) |

### 2.2 Supported Auth Methods

| Method | User Types | Implementation |
|---|---|---|
| **Email + Password** | All | Supabase Auth native |
| **Google OAuth** | Tourist, Agency | Supabase Auth OAuth |
| **Apple OAuth** | Tourist | Supabase Auth OAuth |
| **Phone OTP** | Provider | Supabase Auth phone provider |
| **Magic Link** | Tourist | Supabase Auth magic link |

### 2.3 Session Security

```
┌─────────────────────────────────────────────────────┐
│ Client → POST /auth/login                           │
│   ← JWT access_token (1hr) + refresh_token (7d)     │
│                                                     │
│ Client → GET /api/v1/resource                       │
│   Authorization: Bearer <access_token>               │
│   ← Data (filtered by RLS)                          │
│                                                     │
│ Token expired:                                      │
│ Client → POST /auth/refresh                         │
│   ← New access_token + new refresh_token            │
│                                                     │
│ Refresh token expired or compromised:               │
│ Client → Re-authenticate                            │
└─────────────────────────────────────────────────────┘
```

### 2.4 Token Storage

The four portals do not share a single cookie implementation. Tourist Webapp and the other three portals (Provider App, Agency Portal, Admin Portal) use two different, incompatible session-cookie architectures:

| Platform | Storage Method | Security |
|---|---|---|
| **Tourist Webapp** | `@supabase/ssr` cookies (`httpOnly`, chunked), read/written by Next.js middleware and server components via `createServerClient` / `createBrowserClient` | Not accessible via JavaScript; session is verified server-side on every request via `supabase.auth.getUser()` (a real network round-trip to Supabase Auth, not a local decode) |
| **Provider App / Agency Portal / Admin Portal** | Single `sb-access-token` cookie holding the raw access-token JWT, written client-side (`document.cookie`) on every auth-state change by the shared `SessionProvider` (`packages/auth`) | **Not** `httpOnly` — it is set by client-side JavaScript. Each app's Edge middleware decodes the JWT payload locally to read role/verification claims for route gating; the signature is not verified and there is no network call to Supabase for this check |

This split is intentional, not accidental: the three portal apps' Edge middleware avoids `@supabase/ssr`'s cookie format and the per-request `getUser()` network round-trip for latency reasons, decoding the JWT locally instead. Because that local decode is used only for UI-level route gating (e.g. redirecting unverified providers away from the dashboard), every actual data read or write is still subject to full RLS enforcement using the caller's real, network-verified Supabase session — an unverified or tampered `sb-access-token` cookie can change which pages a request is routed to, but cannot by itself grant access to another user's data.

---

## 3. Authorization & Row-Level Security

### 3.1 Role Hierarchy

```
Admin (full platform access)
  └── Agency (own bookings, itineraries, provider inventory view)
      └── Provider (own services, own bookings)
          └── Tourist (own profile, own bookings, public services/locations)
```

### 3.2 RLS Policy Summary

| Table | Tourist | Provider | Agency | Admin |
|---|---|---|---|---|
| `users` | Read own | Read own | Read providers | Read/Write all |
| `user_profiles` | Read/Write own | Read/Write own | Read/Write own | Read/Write all |
| `services` | Read available | CRUD own | Read available | Read all |
| `bookings` | Read/Create own | Read/Update own service bookings | Read/Create facilitated | Read all |
| `locations` | Read active | Read active | Read active | CRUD all |
| `itineraries` | CRUD own (self-planned trips) | — | CRUD own (client itineraries) | Read all |
| `reviews` | Create/Read own | Read own service reviews | — | Read all |
| `notifications` | Read own | Read own | Read own | Read/Create all |
| `provider_verifications` | — | Read own | — | CRUD all |
| `analytics_events` | — | — | — | Read all |
| `ai_chat_messages` | Create/Read own (immutable — no update/delete) | — | — | — |

### 3.3 API-Level Guards (Defense in Depth)

```typescript
// Example: Next.js API route middleware
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  
  // Role-based route protection
  if (request.nextUrl.pathname.startsWith('/api/v1/admin')) {
    if (session.user.app_metadata.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
  }
  
  return NextResponse.next();
}
```

### 3.4 Data Isolation for AI Features

**`ai_chat_messages`** — backs the persistent AI chat assistant (`/ai-chat`). RLS restricts both `SELECT` and `INSERT` to `auth.uid() = user_id`, and both policies are scoped `TO authenticated` — anonymous chat sessions never touch this table; their history exists only in the client for the duration of the conversation. There is no `UPDATE` or `DELETE` policy, so messages are append-only/immutable once written via the public API, and there is no admin-bypass policy on this table — the only way to read another user's chat history is with the service-role key, which none of the AI routes use for this table.

**`menu-scans` storage bucket** — backs the Taste & Trust Dietary Scanner. The bucket is private (`public = false`), capped at 10 MB per file, and restricted to `image/jpeg`/`image/png`. Isolation is enforced by a folder-prefix convention: every object is written to `<user_id>/<uuid>.<ext>`, and all three `storage.objects` policies (`INSERT`, `SELECT`, `DELETE`, all `TO authenticated`) require `(storage.foldername(name))[1] = auth.uid()::text`. There is no `UPDATE` policy. Upload is best-effort — a failed upload only logs an error and does not block the scan response — but a failed upload also means the image was never persisted, so it never becomes readable by anyone. This is the same owner-scoped folder pattern already used by the `service-photos` bucket, except `service-photos` is public-read (anyone can view a listing's photos) while `menu-scans` has no public-read policy at all — only the uploading user can ever read their own scans back.

---

## 4. Data Protection & Encryption

### 4.1 Encryption Standards

| Layer | Method | Implementation |
|---|---|---|
| **In Transit** | TLS 1.3 | Cloudflare → Vercel → Supabase (end-to-end) |
| **At Rest (Database)** | AES-256 | Supabase managed encryption |
| **At Rest (Storage)** | AES-256 | Supabase Storage encryption |
| **Passwords** | bcrypt (cost factor 10) | Supabase Auth default |
| **API Keys** | Environment variables | Vercel encrypted environment |
| **PII Fields** | Application-level encryption | `pgcrypto` for sensitive fields |

### 4.2 Sensitive Data Classification

| Classification | Examples | Handling |
|---|---|---|
| **Critical** | Passwords, API keys, payment tokens | Never logged, never exposed in responses, encrypted at rest |
| **Sensitive PII** | Email, phone, passport scans, bank details | Encrypted at rest, access-controlled, audit-logged |
| **Standard PII** | Full name, country, travel dates | Access-controlled via RLS |
| **Public** | Service listings, location data, reviews | Publicly accessible, cached |

### 4.3 PII Field Encryption

```sql
-- Encrypt sensitive provider bank details
UPDATE user_profiles
SET metadata = jsonb_set(
  metadata,
  '{bank_details}',
  pgp_sym_encrypt(
    metadata->'bank_details'::text,
    current_setting('app.encryption_key')
  )::jsonb
);
```

---

## 5. Privacy & GDPR Compliance

### 5.1 Data Processing Principles

| GDPR Principle | Implementation |
|---|---|
| **Lawful Basis** | Consent (registration), Contract (booking), Legitimate Interest (analytics) |
| **Purpose Limitation** | Data collected only for specified purposes; no secondary use without consent |
| **Data Minimization** | Collect only what's necessary for the service |
| **Accuracy** | Users can update their profiles at any time |
| **Storage Limitation** | Inactive accounts archived after 24 months; deleted after 36 months |
| **Integrity & Confidentiality** | Encryption, RLS, access controls |

### 5.2 User Data Rights

| Right | Endpoint | Implementation |
|---|---|---|
| **Right to Access** | `GET /api/v1/users/me/data-export` | Export all user data as JSON |
| **Right to Rectification** | `PATCH /api/v1/users/me` | Self-service profile editing |
| **Right to Erasure** | `DELETE /api/v1/users/me` | Account deletion with 30-day grace period |
| **Right to Data Portability** | `GET /api/v1/users/me/data-export?format=csv` | Export in machine-readable format |
| **Right to Object** | Settings → Privacy | Opt-out of analytics and marketing |

### 5.3 Consent Management

```
┌──────────────────────────────────────────────────────┐
│ Registration Flow                                     │
│                                                      │
│ ☑ I agree to the Terms of Service (required)         │
│ ☑ I agree to the Privacy Policy (required)           │
│ ☐ I consent to anonymized analytics (optional)       │
│ ☐ I consent to receiving notifications (optional)    │
└──────────────────────────────────────────────────────┘
```

### 5.4 Third-Party Data Sharing

| Third Party | Data Shared | Purpose | Legal Basis |
|---|---|---|---|
| **Moonshot AI (Kimi)** | Menu images, translation text, chat messages, itinerary-planning inputs | AI processing (menu scanning, translation, chat assistant, itinerary suggestions) | Consent + contract |
| **Mapbox** | Anonymized location coordinates | Map rendering | Legitimate interest |
| **Stripe/Payme** | Payment details | Transaction processing | Contract |
| **PostHog** | Anonymized usage events | Analytics | Consent |

### 5.5 Data Retention Policy

| Data Type | Active Retention | Archive | Deletion |
|---|---|---|---|
| User accounts | While active | 24 months after last login | 36 months |
| Booking records | While active | 5 years (tax compliance) | 7 years |
| Analytics events | 12 months | 24 months | 36 months |
| AI request logs | 30 days | — | 30 days |
| Uploaded images | While service is active | 6 months after deletion | 12 months |

---

## 6. E-Mehmon Government Compliance

### 6.1 Overview

E-Mehmon is Uzbekistan's mandatory guest registration system. All accommodations must register foreign tourists within 24 hours of arrival.

### 6.2 Current State (MVP)

During MVP, E-Mehmon compliance is handled **manually** by agencies. The platform provides:

1. **Passport OCR scanning** (via Moonshot Vision) to auto-populate tourist information.
2. **Data export** in E-Mehmon compatible format (CSV/Excel).
3. **Compliance checklist** reminding agencies of registration deadlines.

### 6.3 Future State (Post-Funding)

| Feature | Description |
|---|---|
| **Direct API integration** | Submit registrations to E-Mehmon directly from the Agency Portal |
| **Automated form filling** | OCR + AI populates all required fields |
| **Compliance dashboard** | Track registration status for all tourists |
| **Deadline alerts** | Automated warnings when 24-hour deadline approaches |

### 6.4 Data Requirements for E-Mehmon

| Field | Source | Auto-Populated |
|---|---|---|
| Tourist full name | Passport OCR | ✅ |
| Passport number | Passport OCR | ✅ |
| Nationality | Passport OCR | ✅ |
| Date of birth | Passport OCR | ✅ |
| Visa number | Manual entry | ❌ |
| Accommodation address | Agency Portal | ✅ |
| Check-in date | Booking date | ✅ |
| Check-out date | Booking date | ✅ |

---

## 7. Application Security

### 7.1 Input Validation

| Attack Vector | Mitigation |
|---|---|
| **SQL Injection** | Supabase client uses parameterized queries; no raw SQL in application |
| **XSS (Cross-Site Scripting)** | React's JSX auto-escapes output; CSP headers enforced |
| **CSRF** | `SameSite=Strict` cookies; CSRF tokens on state-changing requests |
| **File Upload Attacks** | File type validation, size limits (10 MB), virus scanning via ClamAV |
| **Path Traversal** | Supabase Storage handles file paths; no user-controlled file system access |

### 7.2 Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://api.mapbox.com;
  style-src 'self' 'unsafe-inline' https://api.mapbox.com;
  img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://api.moonshot.ai;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'none';
  object-src 'none';
```

### 7.3 Dependency Security

| Tool | Purpose | Frequency |
|---|---|---|
| **Dependabot** | Automated dependency vulnerability alerts | Daily |
| **npm audit** | Dependency vulnerability scanning | Every CI build |
| **Snyk** | Deep dependency analysis (future) | Weekly |

### 7.4 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0 (rely on CSP instead)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), geolocation=(self), microphone=(self)
```

---

## 8. Infrastructure Security

### 8.1 Network Security

| Component | Security Measure |
|---|---|
| **Cloudflare** | WAF rules, DDoS protection, bot management, SSL termination |
| **Vercel** | Automatic HTTPS, edge network isolation, no SSH access |
| **Supabase** | Private network, connection pooling (PgBouncer), SSL-only connections |

### 8.2 Secret Management

| Secret | Storage | Access |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel encrypted env | Server-side only (Edge Functions) |
| `MOONSHOT_API_KEY` | Vercel encrypted env | Server-side only (AI API routes) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Vercel encrypted env | Server-side only (AI route rate limiting; each AI route falls back to a non-distributed in-memory limiter if unset) |
| `MAPBOX_SECRET_TOKEN` | Vercel encrypted env | Server-side only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env (public) | Client-side (safe — RLS protects data) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Vercel env (public) | Client-side (scoped to map renders) |

### 8.3 Access Control

| System | Access Method | Who |
|---|---|---|
| **Supabase Dashboard** | Email + MFA | Engineering leads only |
| **Vercel Dashboard** | GitHub SSO + MFA | Engineering team |
| **Cloudflare Dashboard** | Email + MFA | DevOps lead only |
| **GitHub Repository** | SSH keys + MFA | All engineers |
| **Production Database** | Supabase Dashboard only | No direct SQL access in production |

---

## 9. Threat Model

### 9.1 Threat Matrix

| Threat | Likelihood | Impact | Mitigation | Residual Risk |
|---|---|---|---|---|
| **Data breach via SQL injection** | Low | Critical | Parameterized queries, RLS, no raw SQL | Very Low |
| **Cross-tenant data leakage** | Medium | Critical | RLS policies, API-level guards | Low |
| **Account takeover** | Medium | High | Strong passwords, MFA, lockout policy | Low |
| **DDoS attack** | Medium | High | Cloudflare protection, rate limiting | Low |
| **API key exposure** | Low | Critical | Server-side only keys, env encryption | Very Low |
| **Malicious file upload** | Medium | Medium | File type validation, size limits, scanning | Low |
| **Insider threat** | Low | High | Least privilege, audit logs, MFA | Low |
| **Moonshot AI data leakage** | Low | Medium | No PII sent to AI, anonymization | Low |
| **Tourist location tracking** | Medium | High | Anonymized geo data, no real-time individual tracking | Low |

### 9.2 Attack Surface

```
External Attackers
  ├── Web Application (4 portals)
  │   ├── Input forms → Validation + Sanitization
  │   ├── File uploads → Type checking + Size limits
  │   └── API endpoints → Auth + Rate limiting
  ├── Network
  │   ├── DDoS → Cloudflare
  │   └── Man-in-the-Middle → TLS 1.3
  └── Third-Party Services
      ├── Supabase → SOC 2 Type II certified
      ├── Vercel → SOC 2 Type II certified
      └── Moonshot AI → Data processing agreement

Internal Threats
  ├── Engineers → MFA, code review, least privilege
  └── Admins → Audit logs, session monitoring
```

---

## 10. Incident Response Plan

### 10.1 Severity Levels

| Level | Description | Response Time | Example |
|---|---|---|---|
| **P0 — Critical** | Data breach, full service outage | 15 minutes | RLS bypass, database compromise |
| **P1 — High** | Partial outage, security vulnerability | 1 hour | Auth service down, XSS discovered |
| **P2 — Medium** | Degraded performance, non-critical bug | 4 hours | Slow API responses, map loading issues |
| **P3 — Low** | Minor issue, cosmetic | 24 hours | UI bug, non-critical feature broken |

### 10.2 Response Procedure

```
1. DETECT → Automated monitoring alert or user report
2. TRIAGE → Assess severity level (P0–P3)
3. CONTAIN → Isolate affected systems (disable endpoint, rotate key)
4. INVESTIGATE → Identify root cause via audit logs
5. REMEDIATE → Deploy fix, patch vulnerability
6. COMMUNICATE → Notify affected users if data was compromised
7. POST-MORTEM → Document findings, update security measures
```

### 10.3 Communication Templates

**P0 — Data Breach Notification:**
> We detected unauthorized access to [system] on [date]. We immediately [containment action]. [N] users may be affected. We recommend [action for users]. We are conducting a full investigation and will provide updates.

---

## 11. Security Audit Checklist

### Pre-Launch

- [ ] All RLS policies tested with each user role
- [ ] API rate limiting configured and tested
- [ ] CSP headers deployed and validated
- [ ] All secrets stored in encrypted environment variables
- [ ] No service role keys exposed to client-side code
- [ ] File upload validation tested (malicious files)
- [ ] CORS configured to allow only platform domains
- [ ] SQL injection testing completed (automated + manual)
- [ ] XSS testing completed across all portals
- [ ] MFA enabled for all admin and engineering accounts
- [ ] Dependency vulnerabilities resolved (npm audit)
- [ ] Privacy policy and terms of service published
- [ ] Cookie consent banner implemented
- [ ] Data export endpoint tested (GDPR right of access)
- [ ] Account deletion flow tested (GDPR right to erasure)

### Ongoing (Monthly)

- [ ] Review Dependabot alerts and update dependencies
- [ ] Review Supabase audit logs for anomalies
- [ ] Rotate non-critical API keys
- [ ] Review and update RLS policies for new tables
- [ ] Test backup restoration procedure
- [ ] Review rate limiting effectiveness

---

*This security document is reviewed and updated quarterly. All team members are responsible for following security best practices.*
