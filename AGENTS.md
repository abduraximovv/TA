# Uzbekistan Digital Tourism Ecosystem (UzTour) - AI Agent Context

Welcome, AI Agent! You are working on the **Uzbekistan Digital Tourism Ecosystem (UzTour)**. This file is your ultimate source of truth for understanding the project structure, architecture, UI conventions, and where to find more information. Always read this file when you begin a task.

---

## 1. Project Overview
This project is a **Tri-Sided Digital Infrastructure Platform** designed to connect international tourists, local travel agencies (DMCs), rural Uzbek suppliers, and government compliance systems into one seamless, monetizable ecosystem.

### Core Objectives:
- **Bridge the digital divide** for rural service providers.
- **Democratize travel** via AI-powered planning tools.
- **Decentralize tourism** toward "Hidden Uzbekistan".
- **Automate compliance** with government systems.

---

## 2. Monorepo Architecture & File Locations
This is a **Turborepo/pnpm monorepo**. The codebase is strictly split into applications (`apps/`) and shared packages (`packages/`).

### Applications (`apps/`)
These are the frontend platforms, all built using **Next.js** and **React**.
- `apps/tourist-webapp`: PWA (Mobile-first) for Foreign travelers (FITs) - Trip planning, navigation, discovery.
- `apps/provider-app`: PWA (Ultra-simple mobile) for Rural artisans, guides - Availability toggle, booking management.
- `apps/agency-portal`: Desktop/Tablet web for DMC managers - CRM, itinerary building, inventory.
- `apps/admin-portal`: Desktop web for Platform owners, gov partners - Analytics, verification, compliance.

### Shared Packages (`packages/`)
Never duplicate code across apps. Use these shared workspaces (imported as `@repo/*`):
- `packages/ui`: Shared Tailwind CSS components, icons, and design system elements.
- `packages/database`: Supabase client definitions, database schema types, and query helpers.
- `packages/auth`: Shared authentication logic and session management.
- `packages/types`: Shared TypeScript interfaces and Zod schemas.
- `packages/config`: Shared configurations for ESLint, TypeScript, Tailwind, etc.

---

## 3. UI/UX Design System & Aesthetics
**You must follow the "Immersive Minimalism" design philosophy.**
- **Aesthetic Goal:** Authentic, modern, professional, and visually stunning. Let photography and typography carry the page rather than heavy decoration.
- **Micro-Interactions:** Always build dynamic interfaces. Use hover states, smooth transitions, and subtle animations to make the UI feel alive.
- **Tailwind CSS:** Use Tailwind for styling. Avoid inline styles unless absolutely necessary.
- **Mobile-First:** The Tourist WebApp and Provider App are PWAs and must be designed for mobile screens first.
- **Context:** If you need specific color hexes, typography rules, or accessibility standards, **consult `docs/UI_UX_GUIDELINES.md`**.

---

## 4. Backend & Database Rules (Supabase + PostGIS)
The backend is powered by **Supabase (PostgreSQL)**. 

### Key Rules:
- **Row Level Security (RLS) is Mandatory:** Never bypass RLS in client applications. Every table must have RLS enabled, mapping data strictly to user/organization IDs.
- **PostGIS:** We use PostGIS for geospatial queries (e.g., finding nearby attractions). Do not write manual geospatial math if PostGIS functions are available.
- **UUIDs:** Use `gen_random_uuid()` for primary keys across all tables.
- **Migrations:** All schema changes must be done via Supabase migrations (`supabase/migrations/`). Do not make direct schema changes through the UI if they need to be tracked in version control.
- **Context:** **Consult `docs/DB_SCHEMA.md`** for the exact schema, relations, and RLS policies.

---

## 5. Artificial Intelligence Stack
- We use the **Vercel AI SDK** to power chat interfaces and itinerary planners.
- Based on recent Architecture Decision Records (ADR-007), we use **Moonshot Kimi API** (OpenAI-compatible) for AI features.
- Most AI integration code lives within the `tourist-webapp` (e.g., `src/app/api/v1/ai/` or `src/components/ai/`). 
- Always ensure AI features handle context limits properly and stream responses where applicable.

---

## 6. Where to Get Even More Context
This file is just the beginning. Before making major architectural changes, API additions, or UI updates, **you must read the relevant files in the `docs/` folder:**

- **Product & Scope:** Read `docs/PRD.md` to understand MVP boundaries and target personas.
- **Architecture & Decisions:** Read `docs/ADR.md` for historical decisions (like why we chose PWA over native apps, and Kimi over OpenAI).
- **Backend & Data:** Read `docs/DB_SCHEMA.md` and `docs/API_SPECIFICATION.md` before altering database logic or writing new endpoints.
- **Design & UI:** Read `docs/UI_UX_GUIDELINES.md` to ensure your components match the "Immersive Minimalism" aesthetic.
- **Security & CI/CD:** Read `docs/SECURITY_AND_COMPLIANCE.md` and `docs/TECHNICAL_PLAN.md`.

*Always look at the codebase context and read these markdown files if you are ever unsure about the "why" or "how" of a feature.*

