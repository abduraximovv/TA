---
name: smartops-ui-playbook
description: SmartOps ERP UI/UX rules. Enforces Apple-style premium ERP design with Tailwind CSS v4, Shadcn UI, Lucide icons, framer-motion. ALWAYS apply when writing any React component, page, or UI logic for this project.
---

# SmartOps ERP — UI & Component Playbook

You are a **Senior Frontend Engineer + UX Designer** for SmartOps ERP. The design philosophy is **"Invisible ERP"** — premium, minimal, Apple-style. Users should feel productivity, not complexity.

---

## Strict Tech Stack

| Tool | Rule |
|---|---|
| **Styling** | ONLY Tailwind CSS v4 — no CSS Modules, no styled-components, no plain CSS |
| **Components** | ONLY Shadcn UI (Radix-based, copied into `src/components/ui/`) |
| **Icons** | ONLY `lucide-react` |
| **Animations** | ONLY `framer-motion` (micro-interactions only) |
| **Class merging** | ALWAYS use `cn()` from `@/lib/utils` |
| **Forbidden** | Material UI, Ant Design, Bootstrap, Chakra UI, Heroicons |

---

## Design Philosophy — "Apple-Style ERP"

### 1. Minimalism (Visual Restraint)
- Maximum whitespace — no visual noise
- Decorative elements must not compete with functional content
- No gradients just for decoration — only for status/data visualization

### 2. Progressive Disclosure
- Hide complex settings behind "Advanced" buttons or tabs
- Default view = simplest possible action
- Reveal complexity only when user requests it

### 3. Role-Based UI (Two Modes)

**Mobile / Warehouse (Storekeeper):**
- Card-based layout
- ONE primary action button per screen
- Minimum 44×44px touch targets (works in gloves)
- Large fonts, high contrast

**Desktop / Office (Manager/Admin):**
- High data density — tables, dashboards
- Keyboard-first workflow with shortcuts
- Bulk actions support
- Multi-column layouts

---

## Component Rules

### Naming
```
Files:      kebab-case.tsx        → receive-goods-button.tsx
Components: PascalCase            → ReceiveGoodsButton
Props:      on-prefix for events  → onStatusChange, onSubmit
```

### Every component must:
1. Use `cn()` for class merging — never string concatenation
2. Be small, single-responsibility
3. Extract data fetching to Server Components or custom hooks

```tsx
// ✅ Correct component structure
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface StatusBadgeProps extends ButtonHTMLAttributes<HTMLDivElement> {
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED';
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-emerald-100 text-emerald-800': status === 'ACTIVE',
          'bg-amber-100 text-amber-800': status === 'PENDING',
          'bg-rose-100 text-rose-800': status === 'CANCELLED',
        },
        className,
      )}
      {...props}
    />
  );
}
```

---

## Color Semantics (Functional Only)

Colors convey **status**, not decoration:

| Color | Semantic | Use Case |
|---|---|---|
| 🟢 `emerald` | Success / In Stock | Order fulfilled, sufficient stock |
| 🟡 `amber` | Pending / Warning | Awaiting approval, low stock |
| 🔴 `rose` | Error / Critical | Out of stock, overdue, cancelled |
| ⚪ `slate` | Neutral / Default | Normal data, no action required |

---

## Loading & Empty States

### Skeleton Loaders (Always — no spinner)
```tsx
// ✅ Always use Shadcn Skeleton for loading states
import { Skeleton } from '@/components/ui/skeleton';

function ProductListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
```

### Empty States (Always — no blank page)
```tsx
// ✅ Always show meaningful empty state
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

function EmptyProducts({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="text-lg font-medium text-slate-900">Товары не добавлены</h3>
      <p className="mt-1 text-sm text-slate-500">Добавьте первый товар, чтобы начать учёт</p>
      <Button onClick={onAdd} className="mt-6">Добавить товар</Button>
    </div>
  );
}
```

---

## Optimistic UI & Button States

```tsx
// ✅ Button must go disabled after first click (prevent double-submit)
import { useTransition } from 'react';

function CommitButton({ onCommit }: { onCommit: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => startTransition(onCommit)}
    >
      {isPending ? 'Проводка...' : 'Провести'}
    </Button>
  );
}
```

---

## Error Display

```tsx
// ✅ Human-readable errors via Shadcn toast — never raw DB errors
import { toast } from 'sonner';

// Good
toast.error('Недостаточно товара: на складе не хватает 5 штук');

// Bad
toast.error('ERROR: insert or update on table "transactions" violates foreign key constraint');
```

---

## Accessibility (A11y)

- All forms: keyboard navigable (Tab order)
- All interactive elements: `aria-label` for screen readers
- All images: `alt` text
- Color alone must NOT convey meaning (add icon or text label too)
- WCAG AA minimum contrast ratio

---

## Smart Defaults in Forms

```tsx
// ✅ Pre-fill with likely values
const form = useForm({
  defaultValues: {
    date: new Date().toISOString().split('T')[0],   // today
    location_id: userPrimaryWarehouse?.id ?? '',     // user's main warehouse
    currency_code: organization?.currency_code ?? 'UZS',
  }
});
```
