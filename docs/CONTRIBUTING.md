# Contributing Guide — Uzbekistan Digital Tourism Ecosystem

**Welcome!** Thank you for your interest in contributing to the Uzbekistan Digital Tourism Ecosystem. This guide covers everything you need to know to contribute effectively.

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Getting Started](#2-getting-started)
3. [Branch Strategy](#3-branch-strategy)
4. [Development Workflow](#4-development-workflow)
5. [Code Standards](#5-code-standards)
6. [Commit Message Convention](#6-commit-message-convention)
7. [Pull Request Process](#7-pull-request-process)
8. [Code Review Guidelines](#8-code-review-guidelines)
9. [Documentation Standards](#9-documentation-standards)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Repository Structure

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
├── docs/                        # Project documentation
├── .github/
│   ├── workflows/               # GitHub Actions CI/CD
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── turbo.json                   # Turborepo configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
├── package.json                 # Root package.json
└── .env.example                 # Environment variable template
```

### Key Directories

| Directory | Purpose | Ownership |
|---|---|---|
| `apps/*` | Individual portal applications | Feature teams |
| `packages/ui` | Shared design system components | UI team |
| `packages/database` | Database client, types, queries | Backend team |
| `packages/auth` | Authentication logic | Security team |
| `supabase/migrations` | Database schema changes | Backend team (reviewed by all) |
| `docs/` | Project documentation | All contributors |

---

## 2. Getting Started

### 2.1 Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| pnpm | 8.x | `pnpm --version` |
| Docker Desktop | Latest | `docker --version` |
| Git | Latest | `git --version` |

### 2.2 Setup

```bash
# Clone the repository
git clone https://github.com/org/uzbekistan-tourism.git
cd uzbekistan-tourism

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start local Supabase (requires Docker)
pnpm supabase start

# Apply migrations and seed data
pnpm supabase db reset

# Start all apps in development mode
pnpm dev
```

### 2.3 Verify Setup

After `pnpm dev`, verify all services are running:

| Service | URL | Expected |
|---|---|---|
| Tourist App | `http://localhost:3000` | Login page |
| Provider App | `http://localhost:3001` | Login page |
| Agency Portal | `http://localhost:3002` | Login page |
| Admin Portal | `http://localhost:3003` | Login page |
| Supabase Studio | `http://localhost:54323` | Database dashboard |

---

## 3. Branch Strategy

### 3.1 Branch Types

We follow a simplified **Git Flow** model:

| Branch | Purpose | Created From | Merges Into |
|---|---|---|---|
| `main` | Production-ready code | — | — |
| `develop` | Integration branch | `main` | `main` |
| `feature/*` | New features | `develop` | `develop` |
| `fix/*` | Bug fixes | `develop` | `develop` |
| `hotfix/*` | Critical production fixes | `main` | `main` + `develop` |
| `chore/*` | Maintenance tasks | `develop` | `develop` |
| `docs/*` | Documentation updates | `develop` | `develop` |

### 3.2 Branch Naming

```
feature/T-123-tourist-survival-map
fix/T-456-booking-crash-null-agency
hotfix/critical-auth-bypass
chore/update-dependencies
docs/api-specification-v2
```

**Pattern:** `<type>/<ticket-id>-<short-description>`

### 3.3 Protected Branches

| Branch | Protection Rules |
|---|---|
| `main` | Require PR, ≥ 1 approval, all CI checks pass, no force push |
| `develop` | Require PR, ≥ 1 approval, unit + integration tests pass |

---

## 4. Development Workflow

### 4.1 Feature Development Flow

```
1. Pick a task from the project board
2. Create a feature branch: git checkout -b feature/T-123-survival-map
3. Make changes with frequent small commits
4. Write/update tests for your changes
5. Run tests locally: pnpm test
6. Push branch: git push origin feature/T-123-survival-map
7. Create Pull Request → develop
8. Address code review feedback
9. Merge after approval
```

### 4.2 Working with the Monorepo

```bash
# Run a specific app only
pnpm dev --filter=tourist-webapp

# Run tests for a specific package
pnpm test --filter=@repo/ui

# Build a specific app
pnpm build --filter=agency-portal

# Add a dependency to a specific package
pnpm add lodash --filter=@repo/database

# Add a shared package as dependency
pnpm add @repo/ui --filter=tourist-webapp --workspace
```

### 4.3 Database Changes

```bash
# Create a new migration
pnpm supabase migration new create_reviews_table

# Edit the migration file in supabase/migrations/

# Reset and test locally
pnpm supabase db reset

# Verify changes in Supabase Studio
# http://localhost:54323
```

**Important:** Every migration must be:
- **Reversible** (include a rollback comment or companion down-migration)
- **Reviewed by the backend team** before merging
- **Tested with existing seed data** to prevent data loss

---

## 5. Code Standards

### 5.1 TypeScript

| Rule | Enforcement |
|---|---|
| **Strict mode** | `"strict": true` in `tsconfig.json` |
| **No `any`** | `@typescript-eslint/no-explicit-any: error` |
| **Explicit return types** | Required for exported functions |
| **Interface over type** | Prefer `interface` for object shapes |
| **Null safety** | Use optional chaining (`?.`) and nullish coalescing (`??`) |

### 5.2 React

| Rule | Enforcement |
|---|---|
| **Functional components** | No class components |
| **Named exports** | `export function Component()` over `export default` |
| **Custom hooks** | Extract logic into `use*` hooks |
| **Props destructuring** | Destructure in function signature |
| **Key prop** | Always use stable, unique keys in lists |

### 5.3 File Naming

| Type | Convention | Example |
|---|---|---|
| **Components** | PascalCase directory + file | `BookingCard/BookingCard.tsx` |
| **Hooks** | camelCase with `use` prefix | `useBooking.ts` |
| **Utilities** | camelCase | `formatPrice.ts` |
| **Types** | PascalCase | `BookingTypes.ts` |
| **Tests** | Same name with `.test` suffix | `BookingCard.test.tsx` |
| **API Routes** | kebab-case directories | `api/v1/bookings/route.ts` |
| **CSS Modules** | Same name with `.module.css` | `BookingCard.module.css` |

### 5.4 Import Order

Enforced by ESLint `import/order`:

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { createClient } from '@supabase/supabase-js';
import mapboxgl from 'mapbox-gl';

// 3. Internal packages (@repo/*)
import { Button, Card } from '@repo/ui';
import { supabase } from '@repo/database';

// 4. Relative imports
import { BookingCard } from './BookingCard';
import { formatPrice } from '../utils/formatters';

// 5. Types
import type { Booking, Service } from '@repo/types';

// 6. Styles
import styles from './BookingCard.module.css';
```

### 5.5 Tooling Configuration

| Tool | Config File | Purpose |
|---|---|---|
| **ESLint** | `packages/config/eslint-config.js` | Code quality rules |
| **Prettier** | `.prettierrc` | Code formatting |
| **TypeScript** | `packages/config/tsconfig.json` | Type checking base config |
| **Tailwind** | `packages/config/tailwind.config.js` | Shared design tokens |

---

## 6. Commit Message Convention

We follow **Conventional Commits** for automated changelogs and semantic versioning.

### 6.1 Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 6.2 Types

| Type | Purpose | Example |
|---|---|---|
| `feat` | New feature | `feat(tourist): add survival map pin clustering` |
| `fix` | Bug fix | `fix(provider): resolve toggle state persistence` |
| `docs` | Documentation | `docs(api): update booking endpoint examples` |
| `style` | Formatting (no code change) | `style(ui): fix button padding consistency` |
| `refactor` | Code restructuring | `refactor(database): extract query helpers` |
| `test` | Adding/fixing tests | `test(bookings): add RLS policy tests` |
| `chore` | Maintenance | `chore: update pnpm to v8.15` |
| `perf` | Performance improvement | `perf(map): lazy-load Mapbox GL JS` |
| `ci` | CI/CD changes | `ci: add Playwright E2E job` |

### 6.3 Scopes

| Scope | Maps To |
|---|---|
| `tourist` | `apps/tourist-webapp` |
| `provider` | `apps/provider-app` |
| `agency` | `apps/agency-portal` |
| `admin` | `apps/admin-portal` |
| `ui` | `packages/ui` |
| `database` | `packages/database` |
| `auth` | `packages/auth` |
| `api` | API routes |
| `map` | Mapbox/geospatial |
| `ai` | OpenAI integration |

### 6.4 Examples

```
feat(tourist): implement Taste & Trust menu scanner

Add camera capture and OpenAI Vision integration for
translating Uzbek/Cyrillic menus with allergen warnings.

Closes #42

---

fix(provider): resolve booking notification not showing

The push notification was failing silently due to
missing VAPID key in the service worker registration.

Fixes #78

---

chore(database): add migration for impact_stamps table

New table to track tourist digital stamps for the
Impact Passport gamification feature.
```

---

## 7. Pull Request Process

### 7.1 PR Template

```markdown
## What does this PR do?
<!-- Brief description of the changes -->

## Related Issue
<!-- Link to the task/issue: Closes #123 -->

## Type of Change
- [ ] 🚀 Feature
- [ ] 🐛 Bug Fix
- [ ] 📝 Documentation
- [ ] 🔧 Refactor
- [ ] ✅ Test
- [ ] 🏗️ Chore

## Portal(s) Affected
- [ ] Tourist WebApp
- [ ] Provider App
- [ ] Agency Portal
- [ ] Admin Portal
- [ ] Shared Package(s): ___

## Checklist
- [ ] Self-reviewed the code
- [ ] Added/updated tests
- [ ] Added/updated documentation
- [ ] Tested locally (all affected portals)
- [ ] No console.log or debug code left
- [ ] Database migration included (if schema change)

## Screenshots / Recordings
<!-- Add screenshots for UI changes -->
```

### 7.2 PR Guidelines

| Guideline | Details |
|---|---|
| **Size** | Keep PRs small (< 400 lines changed). Split large features into multiple PRs |
| **One concern** | Each PR addresses one feature, bug, or refactor |
| **Description** | Write a clear description explaining *what* and *why* |
| **Draft PRs** | Use draft PRs for work-in-progress to get early feedback |
| **Linked issues** | Always link the relevant issue/task |
| **Screenshots** | Required for all UI changes |

---

## 8. Code Review Guidelines

### 8.1 For Reviewers

| Focus Area | Questions to Ask |
|---|---|
| **Correctness** | Does this code do what it claims to do? |
| **Security** | Are there RLS implications? Is user input validated? |
| **Performance** | Will this query scale? Is there unnecessary re-rendering? |
| **Readability** | Can I understand this code in 6 months? |
| **Testing** | Are edge cases covered? Is the test meaningful? |
| **Accessibility** | Are ARIA attributes present? Is keyboard navigation working? |

### 8.2 Review Etiquette

| Do | Don't |
|---|---|
| ✅ Be specific and constructive | ❌ Say "this is wrong" without explanation |
| ✅ Suggest alternatives | ❌ Rewrite the code in comments |
| ✅ Ask questions | ❌ Make assumptions about intent |
| ✅ Acknowledge good work | ❌ Only point out negatives |
| ✅ Use "nit:" prefix for minor suggestions | ❌ Block merge for cosmetic issues |

### 8.3 Review Comment Prefixes

| Prefix | Meaning | Blocks Merge? |
|---|---|---|
| **blocking:** | Must be fixed before merge | ✅ Yes |
| **suggestion:** | Improvement idea, author decides | ❌ No |
| **nit:** | Minor cosmetic issue | ❌ No |
| **question:** | Seeking understanding | ❌ No |
| **praise:** | Highlighting good work | ❌ No |

---

## 9. Documentation Standards

### 9.1 Code Documentation

| Element | Requirement |
|---|---|
| **Exported functions** | JSDoc comment with `@param` and `@returns` |
| **Complex logic** | Inline comments explaining *why*, not *what* |
| **API routes** | JSDoc with method, path, auth requirements |
| **Database queries** | Comment explaining the business rule |
| **Components** | JSDoc with prop descriptions |

```typescript
/**
 * Calculates the total price for a booking based on service price,
 * guest count, and any applicable seasonal surcharges.
 *
 * @param servicePrice - Base price per person in the service's currency
 * @param guestCount - Number of guests (minimum 1)
 * @param bookingDate - Date of the experience (for seasonal pricing)
 * @returns Total price in the same currency as the service
 */
export function calculateBookingPrice(
  servicePrice: number,
  guestCount: number,
  bookingDate: Date
): number {
  // Seasonal surcharge: +20% during peak season (April–October)
  const month = bookingDate.getMonth();
  const seasonalMultiplier = month >= 3 && month <= 9 ? 1.2 : 1.0;
  
  return servicePrice * guestCount * seasonalMultiplier;
}
```

### 9.2 Documentation Updates

| Change Type | Documentation Required |
|---|---|
| New API endpoint | Update `API_SPECIFICATION.md` |
| New database table/column | Update `DB_SCHEMA.md` |
| Architecture decision | Add entry to `ADR.md` |
| Environment variable added | Update `DEPLOYMENT_GUIDE.md` + `.env.example` |
| New shared component | Update `UI_UX_GUIDELINES.md` + Storybook |
| Security-relevant change | Update `SECURITY_AND_COMPLIANCE.md` |

---

## 10. Troubleshooting

### Common Issues

**Supabase won't start:**
```bash
# Check Docker is running
docker ps

# Reset Supabase completely
pnpm supabase stop --no-backup
pnpm supabase start
```

**Type errors after pulling latest:**
```bash
# Regenerate types from database
pnpm supabase gen types typescript --local > packages/database/types.ts
```

**pnpm install fails:**
```bash
# Clear pnpm store and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

**Port already in use:**
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

**Turborepo cache issues:**
```bash
# Clear Turborepo cache
pnpm turbo clean
pnpm turbo build --force
```

---

*Questions? Reach out to the team in the `#dev-tourism` channel. Happy contributing! 🚀*
