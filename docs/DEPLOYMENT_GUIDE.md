# Deployment Guide — Uzbekistan Digital Tourism Ecosystem

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Draft

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Environment Architecture](#2-environment-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Local Development Setup](#4-local-development-setup)
5. [Supabase Configuration](#5-supabase-configuration)
6. [Vercel Deployment](#6-vercel-deployment)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Domain & DNS Configuration](#8-domain--dns-configuration)
9. [Environment Variables](#9-environment-variables)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Backup & Recovery](#11-backup--recovery)
12. [Rollback Procedures](#12-rollback-procedures)
13. [Scaling Procedures](#13-scaling-procedures)
14. [Runbook — Common Operations](#14-runbook--common-operations)

---

## 1. Infrastructure Overview

### Architecture Diagram

```
                    ┌──────────────┐
                    │  Cloudflare  │
                    │  WAF + CDN   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌──────▼────┐ ┌────▼────────┐
     │   Vercel   │ │  Vercel   │ │   Vercel    │
     │ Tourist PWA│ │ Provider  │ │  Agency +   │
     │            │ │   PWA     │ │   Admin     │
     └────────┬───┘ └──────┬────┘ └────┬────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                  ┌────────▼────────┐
                  │    Supabase     │
                  │ PostgreSQL +    │
                  │ Auth + Storage  │
                  │ + Edge Functions│
                  │ + Realtime      │
                  └─────────────────┘
```

### Service Inventory

| Service | Provider | Purpose | Tier |
|---|---|---|---|
| **Web Hosting (x4)** | Vercel | Next.js app hosting | Pro |
| **Database** | Supabase | PostgreSQL + PostGIS | Pro |
| **Auth** | Supabase Auth | Authentication | Included |
| **Storage** | Supabase Storage | File/image storage | Included |
| **Edge Functions** | Supabase | Serverless compute | Included |
| **Realtime** | Supabase Realtime | WebSocket subscriptions | Included |
| **CDN/WAF** | Cloudflare | DDoS protection, SSL | Free/Pro |
| **AI** | OpenAI | GPT-4, Vision | Pay-as-you-go |
| **Maps** | Mapbox | Map tiles, geocoding | Pay-as-you-go |
| **Analytics** | PostHog | Event tracking | Free tier |
| **CI/CD** | GitHub Actions | Build, test, deploy | Free tier |

---

## 2. Environment Architecture

| Environment | Purpose | Trigger | URL Pattern | Database |
|---|---|---|---|---|
| **Local** | Development | `pnpm dev` | `localhost:3000–3003` | Supabase local (Docker) |
| **Preview** | PR review | Push to PR branch | `[branch].vercel.app` | Supabase branch DB |
| **Staging** | Pre-prod testing | Merge to `main` | `staging.*.uzbektourism.app` | Supabase staging |
| **Production** | Live platform | Manual approval | `*.uzbektourism.app` | Supabase production |

### Environment Promotion Flow

```
Feature Branch → Preview Deploy (auto)
    │
    ▼ (PR merged)
main → Staging Deploy (auto)
    │
    ▼ (manual approval after smoke tests)
Production Release → Production Deploy
```

---

## 3. Prerequisites

### 3.1 Account Requirements

| Service | Account Required | Setup |
|---|---|---|
| **GitHub** | Organization account | Repository + Actions |
| **Vercel** | Team account (Pro) | Link to GitHub repo |
| **Supabase** | Organization account | Create project |
| **Cloudflare** | Account | Add domain |
| **OpenAI** | API account | Generate API key |
| **Mapbox** | Account | Generate access token |

### 3.2 Local Tools

| Tool | Version | Installation |
|---|---|---|
| Node.js | 20.x LTS | `nvm install 20` |
| pnpm | 8.x | `npm install -g pnpm` |
| Docker Desktop | Latest | [docker.com](https://docker.com) |
| Supabase CLI | Latest | `pnpm add -g supabase` |
| Vercel CLI | Latest | `pnpm add -g vercel` |
| Git | Latest | Platform default |

---

## 4. Local Development Setup

### 4.1 Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/org/uzbekistan-tourism.git
cd uzbekistan-tourism

# 2. Install dependencies
pnpm install

# 3. Copy environment templates
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start local Supabase (requires Docker)
pnpm supabase start

# 5. Apply database migrations
pnpm supabase db reset

# 6. Start all development servers
pnpm dev
```

### 4.2 Local Services

After running `pnpm supabase start`, the following services are available:

| Service | URL |
|---|---|
| Supabase Studio | `http://localhost:54323` |
| Supabase API | `http://localhost:54321` |
| Supabase Auth | `http://localhost:54321/auth/v1` |
| Supabase Storage | `http://localhost:54321/storage/v1` |
| Tourist App | `http://localhost:3000` |
| Provider App | `http://localhost:3001` |
| Agency Portal | `http://localhost:3002` |
| Admin Portal | `http://localhost:3003` |

### 4.3 Hot Reload

All apps use Next.js Fast Refresh. File changes in `packages/*` trigger rebuilds in all consuming apps via Turborepo's watch mode.

---

## 5. Supabase Configuration

### 5.1 Project Setup

```bash
# Login to Supabase
pnpm supabase login

# Link to remote project
pnpm supabase link --project-ref <project-ref>

# Push migrations to remote
pnpm supabase db push

# Deploy Edge Functions
pnpm supabase functions deploy
```

### 5.2 Database Extensions

Enable the following extensions in the Supabase dashboard:

| Extension | Purpose |
|---|---|
| `postgis` | Geospatial queries |
| `pg_cron` | Scheduled database jobs |
| `pgcrypto` | PII field encryption |
| `pg_stat_statements` | Query performance monitoring |

### 5.3 Storage Buckets

| Bucket | Access | Max File Size | Allowed Types |
|---|---|---|---|
| `avatars` | Authenticated users (own) | 5 MB | `image/*` |
| `service-media` | Providers (own) | 10 MB | `image/*, video/*` |
| `documents` | Providers (own), Admins | 10 MB | `image/*, application/pdf` |
| `menu-scans` | Tourists (own) | 10 MB | `image/*` |

### 5.4 Edge Functions

| Function | Purpose | Trigger |
|---|---|---|
| `translate` | OpenAI translation wrapper | HTTP (API route proxy) |
| `scan-menu` | OpenAI Vision menu analysis | HTTP (API route proxy) |
| `send-notification` | Web Push notification dispatch | Database webhook |
| `calculate-heatmap` | Aggregate tourist density data | `pg_cron` (every 5 min) |

---

## 6. Vercel Deployment

### 6.1 Project Configuration

Each app in `apps/` is deployed as a separate Vercel project:

| App | Vercel Project | Root Directory |
|---|---|---|
| Tourist WebApp | `uzbektourism-tourist` | `apps/tourist-webapp` |
| Provider App | `uzbektourism-provider` | `apps/provider-app` |
| Agency Portal | `uzbektourism-agency` | `apps/agency-portal` |
| Admin Portal | `uzbektourism-admin` | `apps/admin-portal` |

### 6.2 Vercel Settings

```json
// vercel.json (per app)
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=tourist-webapp",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    }
  ]
}
```

### 6.3 Preview Deployments

Every PR automatically creates preview deployments for all four apps:
- `tourist-webapp-<hash>.vercel.app`
- `provider-app-<hash>.vercel.app`
- `agency-portal-<hash>.vercel.app`
- `admin-portal-<hash>.vercel.app`

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm turbo type-check
      - run: pnpm turbo test:unit

  integration:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test:integration
      - run: supabase stop

  build:
    needs: integration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build
      
  e2e:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm turbo test:e2e

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

### 7.2 Deployment Checklist

Before production deployment:

- [ ] All CI checks pass (lint, types, unit, integration, E2E)
- [ ] Preview deployment reviewed and approved
- [ ] Database migrations applied to staging and tested
- [ ] No new Dependabot alerts
- [ ] Release notes prepared
- [ ] Team notified in Slack/Telegram

---

## 8. Domain & DNS Configuration

### 8.1 Domain Setup (Cloudflare)

| Record | Type | Name | Value | Proxy |
|---|---|---|---|---|
| A | `uzbektourism.app` | → Vercel IP | ☁️ Proxied |
| CNAME | `app` | → `cname.vercel-dns.com` | ☁️ Proxied |
| CNAME | `provider` | → `cname.vercel-dns.com` | ☁️ Proxied |
| CNAME | `agency` | → `cname.vercel-dns.com` | ☁️ Proxied |
| CNAME | `admin` | → `cname.vercel-dns.com` | ☁️ Proxied |
| CNAME | `staging.app` | → `cname.vercel-dns.com` | ☁️ Proxied |

### 8.2 SSL Configuration

- **Cloudflare:** Full (strict) SSL mode
- **Vercel:** Automatic SSL certificate provisioning
- **HSTS:** Enabled with `max-age=31536000; includeSubDomains; preload`

---

## 9. Environment Variables

### 9.1 Variable Inventory

| Variable | Scope | Environments | Sensitivity |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | All | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | All | Public (safe with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | All | 🔴 Critical |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Client | All | Public (scoped) |
| `OPENAI_API_KEY` | Server | All | 🔴 Critical |
| `NEXT_PUBLIC_APP_URL` | Client | Per env | Public |
| `VAPID_PUBLIC_KEY` | Client | All | Public |
| `VAPID_PRIVATE_KEY` | Server | All | 🔴 Critical |
| `POSTHOG_API_KEY` | Server | Prod/Staging | 🟡 Sensitive |

### 9.2 Setting Variables in Vercel

```bash
# Set a variable for all environments
vercel env add OPENAI_API_KEY

# Set a variable for specific environment
vercel env add SUPABASE_SERVICE_ROLE_KEY --environment production
```

### 9.3 Local Development (.env.local)

```bash
# Copy the template
cp .env.example .env.local

# The template contains:
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
# SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=<your-dev-token>
# OPENAI_API_KEY=<your-dev-key>
```

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack

| Layer | Tool | What It Monitors |
|---|---|---|
| **Uptime** | Vercel Analytics + UptimeRobot | All 4 portal availability |
| **Performance** | Vercel Web Analytics | Core Web Vitals (LCP, FID, CLS) |
| **Errors** | Sentry | JavaScript errors, API errors |
| **Logs** | Vercel Logs + Supabase Logs | Request logs, Edge Function logs |
| **Analytics** | PostHog | User events, funnels, retention |
| **Database** | Supabase Dashboard | Query performance, connections, storage |
| **AI Costs** | OpenAI Dashboard | Token usage, spend tracking |

### 10.2 Alerts

| Alert | Condition | Channel | Priority |
|---|---|---|---|
| **App Down** | Any portal returns 5xx for > 1 min | Telegram + Email | P0 |
| **Error Spike** | > 50 errors in 5 minutes | Telegram | P1 |
| **Slow API** | p95 latency > 1 second | Email | P2 |
| **DB Connections** | > 80% pool capacity | Email | P1 |
| **OpenAI Budget** | > $100/day spend | Email | P1 |
| **Storage** | > 80% capacity | Email | P2 |

### 10.3 Health Check Endpoints

```
GET /api/health → { "status": "ok", "version": "1.0.0", "timestamp": "..." }
GET /api/health/db → { "status": "ok", "latency_ms": 12 }
GET /api/health/services → { "supabase": "ok", "openai": "ok", "mapbox": "ok" }
```

---

## 11. Backup & Recovery

### 11.1 Database Backups

| Type | Frequency | Retention | Provider |
|---|---|---|---|
| **Point-in-Time Recovery** | Continuous (WAL) | 7 days | Supabase (Pro plan) |
| **Daily Snapshot** | Every 24 hours | 30 days | Supabase automatic |
| **Manual Backup** | Before major migrations | Permanent | `pg_dump` to secure storage |

### 11.2 Backup Procedures

```bash
# Manual backup before major migration
pg_dump -h db.xyz.supabase.co -U postgres -d postgres \
  --format=custom \
  --file=backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h db.xyz.supabase.co -U postgres -d postgres \
  --clean --if-exists \
  backup_20260716.dump
```

### 11.3 Storage Backups

Supabase Storage objects are backed up daily. For critical files (passport scans, verification documents), implement additional backup to a secondary S3-compatible store.

---

## 12. Rollback Procedures

### 12.1 Application Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or via Vercel Dashboard:
# Project → Deployments → Click previous deploy → "Promote to Production"
```

**Time to rollback:** < 30 seconds

### 12.2 Database Rollback

```bash
# Revert the last migration
pnpm supabase migration repair --status reverted <migration-version>

# Apply the rollback SQL (must be written as part of migration)
pnpm supabase db push
```

### 12.3 Rollback Decision Matrix

| Severity | Impact | Action |
|---|---|---|
| **P0 — System down** | All users affected | Immediate Vercel rollback + notify team |
| **P1 — Feature broken** | One portal affected | Rollback within 1 hour if fix not found |
| **P2 — Minor bug** | Cosmetic/non-blocking | Fix forward in next deployment |

---

## 13. Scaling Procedures

### 13.1 Vertical Scaling (Supabase)

| Trigger | Action | How |
|---|---|---|
| CPU > 80% sustained | Upgrade compute add-on | Supabase Dashboard → Project → Settings → Addons |
| Connections > 80% pool | Enable connection pooling | Supabase Dashboard → Database → Connection Pooling |
| Storage > 80% | Upgrade plan | Supabase Dashboard → Billing |

### 13.2 Horizontal Scaling (Vercel)

Vercel automatically scales serverless functions. No manual intervention needed. For sustained high traffic:

| Trigger | Action |
|---|---|
| Edge function cold starts > 5% | Switch to Vercel Edge Runtime |
| Bandwidth exceeds plan | Upgrade Vercel plan |

### 13.3 Database Read Replicas

For heavy analytics queries (Admin portal), add a read replica:

```bash
# Supabase CLI (when available)
supabase db replicas create --region eu-central-1
```

---

## 14. Runbook — Common Operations

### 14.1 Deploy a Hotfix

```bash
# 1. Create hotfix branch from main
git checkout main && git pull
git checkout -b hotfix/fix-booking-crash

# 2. Make fix and commit
git add . && git commit -m "fix: resolve booking crash on null agency_id"

# 3. Push and create PR
git push origin hotfix/fix-booking-crash
# Create PR → wait for CI → merge → auto-deploys to staging

# 4. Promote to production
# Vercel Dashboard → Staging deploy → "Promote to Production"
```

### 14.2 Run a Database Migration

```bash
# 1. Create migration file
pnpm supabase migration new add_column_to_services

# 2. Edit the migration SQL
# supabase/migrations/YYYYMMDDHHMMSS_add_column_to_services.sql

# 3. Test locally
pnpm supabase db reset

# 4. Push to staging
pnpm supabase db push --linked

# 5. Verify on staging
# Test affected features

# 6. Push to production (after approval)
pnpm supabase db push --linked --target production
```

### 14.3 Rotate API Keys

```bash
# 1. Generate new key in provider dashboard
# 2. Update in Vercel
vercel env rm OPENAI_API_KEY
vercel env add OPENAI_API_KEY

# 3. Trigger redeployment
vercel redeploy --prod

# 4. Revoke old key in provider dashboard
```

### 14.4 Clear CDN Cache

```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone-id>/purge_cache" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything": true}'
```

---

*This deployment guide is maintained by the DevOps team and updated with each infrastructure change.*
