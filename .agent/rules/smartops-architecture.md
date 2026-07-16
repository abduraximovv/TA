---
name: smartops-architecture
description: SmartOps ERP core architecture rules. Enforces Modular Monolith + DDD, multi-tenancy via RLS, financial precision (BIGINT), offline-first idempotency, and data integrity (soft deletes, ACID). ALWAYS apply when writing any code, SQL, or API for this project.
---

# SmartOps ERP — Architecture Constitution

You are working on a **multi-tenant SaaS/ERP system** called SmartOps. These rules are absolute. No deviations without explicit user approval.

---

## ADR-001: Modular Monolith + Vertical Slice Architecture

**Rule:** All business code lives in `src/modules/[domain]/[layer]/`.

```
src/modules/
├── core/          # Infrastructure: DB clients, loggers, shared types
├── auth/          # Authentication & sessions (Supabase Auth)
├── organizations/ # Multi-tenancy: tenant management, invitations, RBAC
└── billing/       # Stripe/LemonSqueezy integration
```

Each module has exactly 4 DDD layers:

| Layer | Path | Rule |
|---|---|---|
| Domain | `/domain/` | Pure TypeScript. Zero framework imports. Entities, value types, `Result<T>` |
| Application | `/application/` | Use cases + Zod DTOs. Orchestrates domain + infra |
| Infrastructure | `/infrastructure/` | Supabase queries, external APIs. Returns `Result<T>` |
| Presentation | `/presentation/` | Server Actions, hooks, API routes. Calls application layer only |

**Forbidden:**
- ❌ Module A directly importing from `src/modules/B/infrastructure/` or `src/modules/B/domain/`
- ❌ Database queries in presentation layer
- ❌ Business logic in `src/app/` route files

---

## ADR-002: Multi-Tenancy via RLS (MANDATORY)

**Rule:** EVERY new database table (except global dictionaries) MUST have:

```sql
-- 1. organization_id column
organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,

-- 2. RLS enabled
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- 3. Tenant isolation policy
CREATE POLICY "tenant_isolation" ON public.your_table
  FOR ALL
  USING (organization_id = public.get_current_organization_id())
  WITH CHECK (organization_id = public.get_current_organization_id());
```

**Forbidden:**
- ❌ Creating a table without `organization_id`
- ❌ Creating a table without RLS policy
- ❌ Using service role key in client-facing code to bypass RLS
- ❌ Suggesting "Database per Tenant" architecture

---

## ADR-003: Financial Precision — BIGINT Only

**Rule:** ALL money/financial amounts stored as `BIGINT` in smallest currency unit (tiyin for UZS, cent for USD).

```sql
-- ✅ CORRECT
amount BIGINT NOT NULL DEFAULT 0,   -- 150000 = 1500.00 UZS

-- ❌ NEVER
amount FLOAT,    -- floating point errors are catastrophic in ERP
amount DECIMAL,  -- unless DECIMAL(19,4) for specific cases
```

```typescript
// TypeScript: money is always integer (number)
const price: MoneyAmount = 150000; // tiyin

// ✅ Only convert to display format in UI layer
formatMoney(price, 'UZS'); // → "1 500,00 UZS"

// ❌ Never do arithmetic with floats
const price = 1500.00; // WRONG
```

---

## ADR-004: Offline-First & Idempotency

**Rule:** UUIDs for new records are ALWAYS generated on the client BEFORE sending the request.

```typescript
// ✅ Client generates ID before POST
import { generateId } from '@/lib/utils';

const newProductId = generateId(); // crypto.randomUUID()
await supabase.from('products').insert({ id: newProductId, ... });
```

**Rule:** All data fetching uses TanStack Query with `staleTime`.

```typescript
// ✅ TanStack Query for all server data
const { data } = useQuery({
  queryKey: ['products', orgId],
  queryFn: () => fetchProducts(orgId),
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

**Rule:** All mutations use Optimistic Updates — UI reacts before server confirms.

---

## ADR-005: Data Integrity — No Hard Deletes, Full Audit

**Rule:** NEVER use `DELETE` on business entities. Always soft delete.

```sql
-- ✅ Soft delete
UPDATE public.products SET deleted_at = now() WHERE id = $1;

-- ❌ Hard delete — FORBIDDEN
DELETE FROM public.products WHERE id = $1;
```

**Rule:** All tables have audit fields:
```sql
created_by  UUID NOT NULL REFERENCES public.users(id),
updated_by  UUID NULL     REFERENCES public.users(id),
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL,
```

**Rule:** Multi-table operations MUST use transactions:
```typescript
// ✅ Supabase RPC for atomic operations
const { data, error } = await supabase.rpc('create_organization_with_admin', {
  org_name: name,
  admin_user_id: userId,
});
```

**Rule:** Dual Approval — `approved_by` MUST NOT equal `created_by` for COMMITTED transactions. This is enforced by the DB trigger `enforce_dual_approval()`.

---

## ADR-006: JSONB for Flexible Attributes

**Rule:** Flexible/optional entity fields go into a `JSONB` column named `attributes`.

```sql
-- ✅ Flexible product attributes
attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
-- E.g.: { "color": "white", "brand": "Akfa", "barcode": "1234567890" }

-- Create GIN index for fast JSONB search
CREATE INDEX ON public.products USING GIN (attributes);
```

---

## Security Rules (Default Deny)

Before writing ANY Server Action or API route:

1. **Authenticate:** Call `supabase.auth.getUser()` — never trust cookies alone
2. **Authorize:** Check user's role matches required permission
3. **Validate:** Parse input with Zod schema before touching business logic
4. **Isolate:** Verify `organization_id` matches `get_current_organization_id()`

```typescript
// ✅ Correct Server Action pattern
'use server';

export async function updateProduct(input: unknown): Promise<ApiResponse<Product>> {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('UNAUTHORIZED', 'Authentication required');

  // 2. Validate input (Zod)
  const parsed = UpdateProductSchema.safeParse(input);
  if (!parsed.success) return fail('VALIDATION_ERROR', parsed.error.message);

  // 3. Call application layer (never infra directly)
  return updateProductUseCase(parsed.data, user.id);
}
```

---

## Error Handling — No-Throw Zone

**Rule:** Domain and Presentation layers MUST NOT throw exceptions. Use `Result<T>`.

```typescript
// ✅ Return Result<T> from infrastructure
import { ok, fail, type Result } from '@/modules/core/domain/types';

async function getProduct(id: string): Promise<Result<Product>> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return fail('DB_ERROR', error.message);
  return ok(data);
}

// ✅ Fold in presentation — no try/catch in UI
const result = await getProduct(id);
if (isOk(result)) {
  setProduct(result.data);
} else {
  toast.error(result.message);
}
```

---

## Checklist Before Every Commit

- [ ] New table has `organization_id` + RLS policy
- [ ] No `FLOAT`/`DOUBLE` in money columns
- [ ] UUIDs generated on client with `generateId()`
- [ ] No `DELETE` — using `deleted_at` instead
- [ ] Server Action validates with Zod + checks auth
- [ ] Multi-table changes use transactions
- [ ] Domain layer has zero framework imports
