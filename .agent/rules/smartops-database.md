---
name: smartops-database
description: SmartOps ERP database rules for SQL migrations and Supabase interactions. Enforces RLS-first schema design, BIGINT money, UUID idempotency, soft deletes, audit triggers, and dual approval. ALWAYS apply when writing SQL, migrations, or Supabase queries.
---

# SmartOps ERP — Database Rules

You are operating a **production PostgreSQL database via Supabase** for a multi-tenant ERP. Data errors are catastrophic. These rules are enforced at the DB level by triggers and at the application level by policy.

---

## Migration Rules

1. **Never modify the database via Supabase Studio UI** — always write SQL migration files in `supabase/migrations/`
2. **Naming:** `YYYYMMDDHHMMSS_descriptive_name.sql`
3. **Each migration** must be idempotent: use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`
4. **Always include** in every new table migration:
   - UUID PK via `gen_random_uuid()`
   - `organization_id UUID NOT NULL REFERENCES public.organizations(id)`
   - Timestamps: `created_at`, `updated_at` (with trigger), `deleted_at`
   - Audit: `created_by`, `updated_by` references to `public.users(id)`
   - `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
   - RLS policy using `public.get_current_organization_id()`

---

## Schema Template for New Tables

```sql
CREATE TABLE IF NOT EXISTS public.my_entity (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name             VARCHAR(255) NOT NULL,
  -- ... business fields ...
  attributes       JSONB        NOT NULL DEFAULT '{}'::jsonb, -- ADR-006
  
  -- Audit fields (ADR-005)
  created_by       UUID         NULL REFERENCES public.users(id),
  updated_by       UUID         NULL REFERENCES public.users(id),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ  NULL        -- Soft delete only
);

-- Auto-update timestamp
CREATE OR REPLACE TRIGGER trg_my_entity_updated_at
  BEFORE UPDATE ON public.my_entity
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.my_entity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.my_entity
  FOR ALL
  USING (organization_id = public.get_current_organization_id())
  WITH CHECK (organization_id = public.get_current_organization_id());

-- Audit trigger
CREATE OR REPLACE TRIGGER audit_my_entity
  AFTER INSERT OR UPDATE OR DELETE ON public.my_entity
  FOR EACH ROW EXECUTE FUNCTION public.generic_audit_trigger_fn();
```

---

## Money Fields — BIGINT Always

```sql
-- ✅ CORRECT
price         BIGINT NOT NULL DEFAULT 0,   -- tiyin or cent
amount        BIGINT NOT NULL DEFAULT 0,
cost_price    BIGINT NOT NULL DEFAULT 0,

-- ❌ FORBIDDEN
price         FLOAT,
price         REAL,
price         DOUBLE PRECISION,
price         NUMERIC,   -- only allowed as DECIMAL(19,4) for quantity
```

---

## Soft Delete Pattern

```sql
-- ✅ Soft delete query
UPDATE public.products
SET deleted_at = now(), updated_by = auth.uid()
WHERE id = $1 AND organization_id = public.get_current_organization_id();

-- ✅ Always filter soft-deleted in queries
SELECT * FROM public.products
WHERE organization_id = public.get_current_organization_id()
  AND deleted_at IS NULL;

-- ❌ FORBIDDEN — hard delete
DELETE FROM public.products WHERE id = $1;
```

---

## Built-in DB Functions Available

| Function | Usage |
|---|---|
| `public.get_current_organization_id()` | Returns org ID of current auth user |
| `public.current_user_has_role(role TEXT)` | Checks if current user has role |
| `public.set_updated_at()` | Trigger function for auto-updating `updated_at` |
| `public.generic_audit_trigger_fn()` | Writes to `audit_logs` on any change |
| `public.enforce_dual_approval()` | Blocks self-approval on transactions |
| `public.check_inventory_balance()` | Prevents negative stock (strict mode) |
| `public.prevent_hard_delete()` | Blocks DELETE on protected tables |

---

## Inventory Balance Query Pattern

```sql
-- Current stock of a batch:
SELECT COALESCE(SUM(quantity_delta), 0) AS balance
FROM public.transactions
WHERE batch_id = $1
  AND status = 'COMMITTED'
  AND deleted_at IS NULL;

-- Use view for convenience:
SELECT * FROM public.v_batch_balances WHERE batch_id = $1;
```

---

## Index Strategy

```sql
-- Standard indexes on every tenant-scoped table:
CREATE INDEX IF NOT EXISTS idx_mytable_org  ON public.my_entity (organization_id) WHERE deleted_at IS NULL;

-- For JSONB attributes:
CREATE INDEX IF NOT EXISTS idx_mytable_attrs ON public.my_entity USING GIN (attributes);

-- For timestamp-based queries (reports, audit):
CREATE INDEX IF NOT EXISTS idx_mytable_created ON public.my_entity (organization_id, created_at DESC);
```

---

## Supabase MCP Workflow

When making schema changes:
1. Use `list_tables` MCP tool to understand existing schema first
2. Write SQL migration file in `supabase/migrations/`
3. Apply via `apply_migration` MCP tool OR Supabase CLI
4. After schema changes, run `generate_typescript_types` MCP tool
5. Save generated types to `src/types/database.types.ts`
