# Stage 2 Prompt Pack — Tourist WebApp ↔ Business Portals

This file has **8 prompts** split across two laptops so Stage 2 can be built in parallel without
merge conflicts. Read this whole intro before either of you starts — it explains why the prompts
are ordered the way they are.

## How this actually works (read first)

**You both point at the same one hosted Supabase project.** There is no "your database" and
"friend's database" — it's one shared cloud instance. That changes the usual multi-repo playbook:

1. **Prompt 1 (Shared Contract) only needs to run once, by whichever of you starts first.** It
   creates new tables in the live database and new shared TypeScript code in `packages/`. The
   moment the *other* person pulls that branch/commit, their laptop sees the new tables too — no
   second migration run needed. Don't both run Prompt 1; agree who goes first.
2. **This repo's Supabase project cannot be reached by raw Postgres connection from inside a
   Claude Code sandbox** (confirmed repeatedly this session — DNS only resolves an IPv6 address
   for the direct DB host and there's no IPv6 route out). Every migration in this pack has to be
   pasted by a human into **Supabase Dashboard → SQL Editor → Run**. Claude Code will print the
   SQL for you; you paste it. This is normal, not a bug.
3. **Git branches**: whoever runs Prompt 1 should commit `packages/types`, `packages/database`,
   and the new `supabase/migrations/*.sql` file to `main` (or a `stage2-shared` branch merged into
   `main`) and push **before** either of you starts your own app-specific branch. The other person
   then runs `git pull` before starting their first prompt, so both of you compile against the
   identical shared types from minute one.
4. **Branch names**: friend uses `stage2-tourist` (touches only `apps/tourist-webapp`), you use
   `stage2-business` (touches only `apps/provider-app` + `apps/agency-portal`). Neither of you
   should touch `packages/` again after Prompt 1 lands — if you think you need to, stop and
   coordinate first, since that's the one shared surface that *can* conflict.
5. **Table/column names are fixed by Prompt 1.** If a later prompt seems to need a field that
   doesn't exist, don't invent a new column ad hoc — flag it and add it to `packages/types` +
   a small follow-up migration, so the other person's laptop doesn't silently diverge.

### Reality check baked into these prompts

The previous AI-generated draft assumed `bookings`, `reviews`, `itineraries`, `booking_status_history`,
and `notifications` already existed (per `docs/DB_SCHEMA.md`). **They don't — none of them exist in
the live database yet.** `docs/DB_SCHEMA.md` is a design spec, not a record of what's deployed (the
same gap that caused the Stage 1 `user_profiles`/`provider_verifications` surprise). Prompt 1 below
creates all of them from scratch, scoped to what Stage 2 actually needs (per
`docs/PROJECT_LIFECYCLE.md` §4) — it deliberately leaves out `payment_status`, `in_progress`/`no_show`
statuses, and full itinerary drag-and-drop scheduling, since those are explicitly Stage 3+ scope.

---

## Prompt 1 — Shared Contract (run once, first, by either of you)

**Why this exists:** both apps need to agree on table names, columns, and TypeScript types before
either of you writes UI against them. Skipping this and letting each app invent its own shape is
exactly how merge pain happens.

```markdown
# ROLE: Senior Staff Architect
# TASK: Stage 2 — Shared Data Contract (bookings, itineraries, reviews, notifications)
# CONTEXT: @packages/types, @packages/database, @supabase/migrations, @docs/DB_SCHEMA.md, @docs/PROJECT_LIFECYCLE.md

We're starting Stage 2. None of the tables this stage needs (bookings, itineraries,
itinerary_items, booking_status_history, reviews, notifications) exist in the live Supabase
project yet — confirm this yourself by checking `supabase/migrations/` and querying
`information_schema.tables`. docs/DB_SCHEMA.md describes a superset design; scope this to what
docs/PROJECT_LIFECYCLE.md Stage 2 (section 4) actually asks for — no payment_status, no
in_progress/no_show booking states, no itinerary drag-and-drop scheduling (that's Stage 3).

## 1. PLAN MODE FIRST
Read docs/DB_SCHEMA.md sections on bookings/itineraries/reviews/notifications, and the actual
live schema (packages/database/src/types.ts + supabase/migrations/*.sql), and reconcile the two
before writing any SQL. Note explicitly: services.category is free TEXT in production (not an
enum) and services.provider_id has no FK — design around this, don't silently "fix" it as part of
this task.

## 2. NEW MIGRATION (supabase/migrations/<today's date>_stage2_core.sql)
Create, with RLS modeled on the existing owner-scoped pattern in
supabase/migrations/20260722010000_services_owner_rls.sql:

- Enums: `booking_status` ('pending','accepted','declined','completed','cancelled'),
  `itinerary_status` ('draft','active','completed'),
  `notification_type` ('booking_request','booking_accepted','booking_declined','review_received','system').
- `itineraries`: id, agency_id (FK auth.users), title (not null), description, start_date,
  end_date, status itinerary_status default 'draft', total_price numeric(12,2) default 0,
  currency text default 'UZS', created_at, updated_at.
- `itinerary_items`: id, itinerary_id (FK itineraries ON DELETE CASCADE), service_id (FK services,
  nullable — a package can include a custom line item not tied to an existing service), title,
  price numeric(12,2), sort_order int default 0, created_at.
- `bookings`: id, tourist_id (FK auth.users, not null), service_id (FK services, nullable),
  itinerary_id (FK itineraries, nullable), provider_id (FK auth.users, nullable — set at insert
  time to whichever of services.provider_id / itineraries.agency_id owns this booking, so RLS and
  the "Pending Bookings" list don't need a join), status booking_status default 'pending',
  booking_date date not null, guest_count int default 1, special_requests text,
  passenger_manifest jsonb, dietary_preferences text, pickup_location text,
  total_price numeric(12,2), currency text default 'UZS', created_at, updated_at.
  Add `CHECK (num_nonnulls(service_id, itinerary_id) = 1)` — a booking is against exactly one of
  a single service OR a package, never both, never neither.
- `booking_status_history`: id, booking_id (FK bookings ON DELETE CASCADE), old_status,
  new_status (not null), changed_by (FK auth.users), notes, changed_at default now().
- `reviews`: id, tourist_id (FK auth.users, not null), service_id (FK services, nullable),
  itinerary_id (FK itineraries, nullable), booking_id (FK bookings, UNIQUE, not null — one review
  per booking), rating int not null CHECK (rating BETWEEN 1 AND 5), comment text,
  `response` text (business reply), `response_at` timestamptz, created_at.
- `notifications`: id, user_id (FK auth.users, not null), title (not null), body (not null),
  type notification_type not null, action_url text, is_read bool default false, created_at.
- RLS on every table: owners can read/write their own rows (tourist_id = auth.uid(),
  provider_id/agency_id = auth.uid()); no public-read unless explicitly needed (services already
  has public-read; bookings/reviews/notifications should not).
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings, public.notifications;`
- A new Storage bucket for service photos: `insert into storage.buckets (id, name, public) values
  ('service-photos', 'service-photos', true);` plus RLS on `storage.objects` so only the owner
  (folder path prefixed with their `auth.uid()`) can write, but anyone can read.
- **Print the full SQL in your response** — do not attempt to execute it directly; this project's
  live DB has already needed manual paste-into-SQL-Editor twice this session due to sandbox
  network limits. Tell me clearly when to paste it and wait for me to confirm it ran before
  continuing.

## 3. packages/types
Add (do not remove or restructure the existing `UserProfile` export) snake_case interfaces
matching the migration exactly: `Booking`, `BookingStatus`, `Itinerary`, `ItineraryItem`,
`ItineraryStatus`, `Review`, `Notification`, `NotificationType`. No `any` types.

## 4. packages/database
Add typed helpers to the shared client:
- `getAvailableServices()` — public services list.
- `getApprovedItineraries()` — itineraries with status != 'draft'.
- `createBooking(input: BookingInput)` — inserts, deriving `provider_id` server-side from the
  referenced service/itinerary, not trusted from client input.
- `getMyBookings(userId: string, role: 'tourist' | 'provider' | 'agency')`.
- `getReviewsForService(serviceId: string)` / `getReviewsForItinerary(itineraryId: string)`.
- `createReview(input: ReviewInput)`.
- `subscribeToBookingUpdates(userId: string, role: 'tourist' | 'provider' | 'agency', onChange: (payload) => void)`
  — wraps the existing `.channel().on("postgres_changes", ...)` pattern already used in
  apps/provider-app/src/app/auth/pending/page.tsx, so neither app reinvents it.
- `uploadServicePhoto(file: File, ownerId: string)` — uploads to the `service-photos` bucket under
  a path prefixed with `ownerId`, returns the public URL.

## 5. VERIFICATION
- Run `pnpm build` at the repo root — every package/app must still type-check.
- Write and run a throwaway Node script (delete it after) that inserts one row into each new
  table and reads it back, to prove RLS + FKs work before either of us builds UI on top of this.
- Confirm `git status` shows only `packages/*` and the new migration file changed — nothing in
  `apps/tourist-webapp`, `apps/provider-app`, or `apps/agency-portal` should be touched by this
  prompt.
```

---

## Prompt 2 — Tourist WebApp: Clean Discovery + Real Packages (For your friend)

**Why this exists:** `/discover` and `/service/[id]` already fetch real `services` rows, but they're
dressed up with fake badges, a fake "old price," and fake duration text that don't correspond to
any real column — this has to come out before booking can be wired to real data. `/packages` is
currently a static "coming soon" page; it needs to become the itinerary browsing view.

```markdown
# ROLE: Senior Staff UI Engineer (Tourist App)
# TASK: Stage 2 — Real Discovery Cleanup + Itinerary Browsing
# CONTEXT: @apps/tourist-webapp, @repo/types, @repo/database
# BRANCH: stage2-tourist (make sure you've pulled the shared-contract commit first)

## 1. DISCOVERY CLEANUP
In apps/tourist-webapp/src/app/discover/DiscoverClient.tsx and
apps/tourist-webapp/src/app/service/[id]/page.tsx:
- Remove the hardcoded promo badges, the fabricated `oldPrice = price * 1.3` discount math, the
  hardcoded "5 Days / 4 Nights" / "2 Hours" duration text, the hardcoded "(124 reviews)" count,
  and the hardcoded "Samarkand" location fallback. Replace review count with a real count from
  `getReviewsForService()` (added in the shared contract). If a field is genuinely absent
  (services.category is free text, not every row has a real duration), design an honest empty
  state instead of fabricating a plausible-looking number.
- Use `getAvailableServices()` from @repo/database instead of any ad hoc query.

## 2. REAL PACKAGES TAB
Replace the static "coming soon" content in apps/tourist-webapp/src/app/packages/page.tsx with a
real listing using `getApprovedItineraries()`. Each card: agency name, title, date range, total
price, and item count (join `itinerary_items`). Link through to a package detail view (new route,
e.g. `/packages/[id]`) showing the itemized list, mirroring the structure of `/service/[id]`.

## 3. VERIFICATION
- Screenshot both `/discover` and `/packages` with real data (you may need to add a couple of
  test services/itineraries first via the business apps, or directly via SQL, if none exist yet).
- Confirm no page references a field that doesn't exist on the real `Service`/`Itinerary` types
  from @repo/types (no `any`, no fabricated fields).
```

---

## Prompt 3 — Tourist WebApp: Booking Engine (For your friend)

**Why this exists:** the "Book Now" and "Request Booking" buttons currently have no `onClick` at
all — this is the single most important gap for Stage 2, since nothing downstream (business
decision engine, reviews) works without real bookings existing.

```markdown
# ROLE: Senior Staff UI Engineer (Tourist App)
# TASK: Stage 2 — Differentiated Booking Workflow
# CONTEXT: @apps/tourist-webapp, @repo/types, @repo/database
# BRANCH: stage2-tourist

The "Book Now" button on /service/[id] and "Request Booking" elsewhere currently have no
onClick handler at all — booking is fully unimplemented, not partially done. Fix that.

## 1. SERVICE BOOKING (single service)
On the service detail page, replace the dead button with a form/modal capturing: `date`,
`guest_count`, `special_requests`. On submit, call `createBooking()` from @repo/database with
`service_id` set (`itinerary_id` left null). Require the user to be signed in first; if not,
redirect to /auth/login with a `next` param back to this page.

## 2. PACKAGE BOOKING (itinerary)
On the package detail page (built in the previous prompt), add a booking form capturing:
`passenger_manifest` (repeatable name inputs, store as the jsonb array shape @repo/types defines),
`dietary_preferences`, `pickup_location`, plus `date`/`guest_count`. Calls `createBooking()` with
`itinerary_id` set (`service_id` left null).

## 3. MY BOOKINGS
Add a simple bookings list to /profile or a new /bookings page using `getMyBookings(userId, 'tourist')`,
showing status (pending/accepted/declined/completed) with a status-colored badge.

## 4. VERIFICATION
- Screenshot both booking forms.
- Submit one of each type for real and confirm the row appears in `public.bookings` with
  `status = 'pending'` and the correct one of `service_id`/`itinerary_id` set.
```

---

## Prompt 4 — Tourist WebApp: Reviews + Realtime Status Toasts (For your friend)

**Why this exists:** closes the loop — a tourist needs to know the instant their booking is
accepted/declined (Stage 2's realtime requirement), and needs a way to leave feedback afterward.

```markdown
# ROLE: Senior Staff UI Engineer (Tourist App)
# TASK: Stage 2 — Reviews + Realtime Booking Notifications
# CONTEXT: @apps/tourist-webapp, @repo/types, @repo/database
# BRANCH: stage2-tourist

## 1. REVIEWS
On a completed booking (status = 'completed') in the bookings list from the previous prompt, show
a "Leave a review" action (only if no review exists yet for that booking_id — one review per
booking, enforced by the DB's UNIQUE constraint too, so handle the conflict gracefully). Star
rating (1-5) + comment, calling `createReview()`. Show submitted reviews (with any business
`response`) on the relevant service/package detail page, using `getReviewsForService()` /
`getReviewsForItinerary()`.

## 2. REALTIME STATUS TOASTS
On mount (e.g. in the root layout or a client provider), call `subscribeToBookingUpdates(user.id,
'tourist', ...)` from @repo/database. When a booking's status changes to 'accepted' or 'declined',
show a Toast (reuse the @repo/ui Toast component — check apps/admin-portal's verification-hub page
for the established usage pattern) with a friendly message and a link to the booking.

## 3. VERIFICATION
- Manually flip a test booking's status via SQL (or ask the business-app side to accept one once
  merged) and confirm a toast appears without a page refresh.
- Screenshot the reviews list showing at least one review with a business `response`.
```

---

## Prompt 5 — Business Apps: Photo Upload + Agency Package Builder (For you)

**Why this exists:** Stage 1 already gave both apps working Services/Inventory CRUD (image_url is
a plain text field today) — this prompt adds real photo upload, and gives agency-portal the one
thing it's genuinely missing: a way to bundle existing services into a sellable package.

```markdown
# ROLE: Senior Staff Architect (Business Portals)
# TASK: Stage 2 — Photo Upload + Agency Package Builder
# CONTEXT: @apps/provider-app, @apps/agency-portal, @repo/database
# BRANCH: stage2-business (make sure you've pulled the shared-contract commit first)

## 1. PHOTO UPLOAD
In both apps/provider-app/src/app/services/page.tsx and apps/agency-portal/src/app/inventory/page.tsx
(and their ServiceFormModal components), replace the plain "Image URL" text input with a real file
picker that calls `uploadServicePhoto()` from @repo/database (uploads to the `service-photos`
bucket added in the shared contract), then stores the returned public URL in `services.image_url`
same as today. Keep a graceful fallback if no image is chosen.

## 2. AGENCY PACKAGE BUILDER (simple — NOT the Stage 3 drag-and-drop calendar)
New page apps/agency-portal/src/app/packages/page.tsx (add to the Sidebar nav alongside
Dashboard/Inventory). A form: title, description, start_date, end_date, then a multi-select list
of the agency's own existing services (query the same way Inventory already does, filtered to
this agency's provider_id) to add as itinerary_items, each with an editable price (defaulting to
the service's own price). Total price auto-sums the items but stays editable. Saves to
`itineraries` + `itinerary_items`. List existing packages below the form with edit/delete, same
UX pattern as the Services/Inventory cards from Stage 1. Do NOT build calendar/scheduling UI —
that's explicitly Stage 3 scope per docs/PROJECT_LIFECYCLE.md.

## 3. VERIFICATION
- Upload a real photo for a service and confirm the URL round-trips (visible on the card, and a
  real object exists in the `service-photos` bucket in Supabase Storage).
- Create one package with 2+ items, confirm it appears correctly, then confirm it's visible in
  the tourist-webapp's /packages tab once both branches are merged (note this cross-check for the
  joint verification prompt at the end — you may not be able to fully confirm it solo before merge).
```

---

## Prompt 6 — Business Apps: Booking Decision Engine (For you)

**Why this exists:** this is the core "seller manages requests" workflow Stage 2 is named for —
without it, tourist bookings just sit as inert 'pending' rows forever.

```markdown
# ROLE: Senior Staff Architect (Business Portals)
# TASK: Stage 2 — Booking Decision Engine
# CONTEXT: @apps/provider-app, @apps/agency-portal, @repo/database
# BRANCH: stage2-business

## 1. PENDING BOOKINGS VIEW
New page in each app (apps/provider-app/src/app/bookings/page.tsx,
apps/agency-portal/src/app/bookings/page.tsx — add to each Sidebar nav). Use `getMyBookings(userId,
'provider' | 'agency')` from @repo/database. List/detail layout matching the admin-portal
Verification Hub pattern you already built in Stage 1 (DataTable + DetailsPanel-style) — reuse
that visual language for consistency, but these are app-local components, not @repo/ui (booking
data isn't generic enough to share).

## 2. ACCEPT / DECLINE
Buttons on the detail panel. On click: update `bookings.status`, and insert a row into
`booking_status_history` (old_status, new_status, changed_by = auth.uid()). Also insert a
`notifications` row for the tourist (`type: 'booking_accepted' | 'booking_declined'`) — this is
what powers the realtime toast your friend built in Prompt 4.
Use direct client-side Supabase calls (RLS already scopes these to the owning provider_id) rather
than a server action, matching how Services/Inventory already work — no service-role key needed
here since these are the business's own rows.

## 3. VERIFICATION
- Create a test booking (or ask your friend to, once merged) and confirm it appears in the
  Pending Bookings list without a manual refresh (subscribe to `subscribeToBookingUpdates` here
  too, same helper, filtered by `provider_id`).
- Accept one, decline another; confirm both `booking_status_history` and `notifications` rows
  are created correctly for each.
```

---

## Prompt 7 — Business Apps: Review Replies + Realtime Alerts (For you)

**Why this exists:** matches your friend's Prompt 4 — businesses need to see and respond to
feedback, and get a live signal when a new booking request lands instead of having to poll.

```markdown
# ROLE: Senior Staff Architect (Business Portals)
# TASK: Stage 2 — Review Management + Realtime Pending-Booking Alerts
# CONTEXT: @apps/provider-app, @apps/agency-portal, @repo/database
# BRANCH: stage2-business

## 1. FEEDBACK TAB
New page in each app (e.g. apps/provider-app/src/app/reviews/page.tsx) listing reviews for this
business's own services/itineraries via `getReviewsForService()`/`getReviewsForItinerary()`
filtered to their own owned rows. Each review shows a "Reply" action (only if `response` is
currently null) — a textarea that updates `reviews.response` + `response_at`.

## 2. REALTIME PENDING-COUNT BADGE
On the Sidebar (both apps), add a small badge on the "Bookings" nav item showing the live count of
`status = 'pending'` bookings for this user, updated via `subscribeToBookingUpdates` (same helper
as Prompt 6) rather than a fixed poll interval.

## 3. VERIFICATION
- Reply to a real review, confirm it renders correctly (and, if time permits, that the tourist
  side shows the reply — cross-check with your friend).
- With the app open, create a new pending booking from another tab/browser and confirm the
  sidebar badge count updates without a manual refresh.
```

---

## Prompt 8 — Joint Merge Verification (Either laptop, after merging both branches)

**Why this exists:** the individual prompts above were each verified in isolation; this is the one
end-to-end pass that proves the two sides actually speak the same language once merged.

```markdown
# ROLE: Senior Staff QA / Release Engineer
# TASK: Stage 2 — End-to-End Merge Verification
# CONTEXT: whole repo, post-merge of stage2-tourist and stage2-business into main

## 1. BUILD
Run `pnpm build` at the repo root. All four apps (tourist-webapp, provider-app, agency-portal,
admin-portal) must compile with no type errors, especially anywhere touching the new
@repo/types/@repo/database exports from both branches.

## 2. MANUAL END-TO-END LOOP
Run this exact sequence, screenshotting each step:
1. As a tourist, book a real service on tourist-webapp.
2. As that service's provider, confirm the booking appears in provider-app's Pending Bookings
   list within a few seconds, with no manual refresh.
3. Accept it as the provider.
4. Confirm the tourist sees a real-time "Accepted" toast on tourist-webapp within a few seconds.
5. Mark the booking completed (directly via SQL is fine for this test since a
   provider-triggered "complete" action wasn't in scope for Prompts 1-7) and leave a review as
   the tourist.
6. Confirm the review appears on the business's Feedback tab, reply to it, and confirm the reply
   shows up back on the tourist side.
7. Repeat the same loop once for an itinerary/package booking (agency side) instead of a single
   service, to confirm the `itinerary_id` path works identically to the `service_id` path.

## 3. REPORT
List anything that didn't work, with the exact step it broke on — don't silently patch and move
on without noting what was actually broken, since that's exactly the kind of gap (e.g. the
"Book Now" button having no handler) that slipped through Stage 1's own review.
```
