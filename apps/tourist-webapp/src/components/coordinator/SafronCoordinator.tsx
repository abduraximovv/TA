"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Loader2,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { ActivityCard, SwapPanel } from "./ActivityCard";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import type { AIServiceSearchResult, AIPackageSearchResult } from "@repo/types";
import { TripControlBar } from "./TripControlBar";
import { PackageCarousel, SnappedPackageTimeline } from "./PackageCarousel";
import { PackageDetailSheet } from "./PackageDetailSheet";

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80";

const QUICK_PROMPTS = [
  { emoji: "🏔️", label: "Zaamin escape", text: "Plan a 3-day nature retreat in Zaamin mountain reserve" },
  { emoji: "🏺", label: "Gijduvan ceramics", text: "I want a ceramics masterclass in Gijduvan near Bukhara" },
  { emoji: "🌊", label: "Nurata springs", text: "Design a 2-day trip to Nurata including Chashma sacred springs" },
  { emoji: "🐎", label: "Horseback Fergana", text: "Horseback riding tour through the Fergana Valley for 2 people" },
  { emoji: "🌙", label: "Aral Sea camp", text: "Yurt camp experience near the Aral Sea — 2 nights" },
];

const WELCOME_TEXT = `Assalomu Alaykum ✦

I'm your Safron AI Coordinator — built to unlock **Hidden Uzbekistan**, the places beyond Registan Square that most tourists never reach.

Tell me your dream trip and I'll build a real itinerary from our database of vetted local providers — no hallucinations, only bookable experiences.`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SafronCoordinatorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  travelDate?: string | null;
  guestCount?: number;
}

interface DayPlan {
  dayNum: number;
  label: string;
  location: string;
  slots: Slot[];
}

interface Slot {
  uid: string;
  service: AIServiceSearchResult;
  time: string;
  /** The tourist's confirmed slot pick. Defaults to `time` when the service has no real timed
   *  slots to choose from (unmanaged, current behavior); otherwise starts null unless the AI's
   *  suggested `time` happens to match a real slot, and can only be set via a chip click in
   *  ActivityCard -- see needsSlotChoice there. Selecting this slot for booking is blocked while
   *  this is null. */
  chosenTime: string | null;
  swapping?: boolean;
  alts?: AIServiceSearchResult[];
}

function initialChosenTime(service: AIServiceSearchResult, aiSuggestedTime: string): string | null {
  const slots = service.available_slots ?? [];
  if (slots.length === 0) return aiSuggestedTime;
  return slots.some((s) => s.start_time === aiSuggestedTime) ? aiSuggestedTime : null;
}

// AIPackageSearchResult has no days_count field (verified against real seeded packages: all 6
// active ones carry start_date/end_date, none carry a precomputed duration) -- inclusive day
// count is (end - start) + 1, matching how the seed titles like "Classic Silk Road, 7 Days" line
// up with their own start_date/end_date almost exactly (one seed row is off by a day, a data
// quality quirk in that specific row, not a formula error). Returns null when either date is
// missing so callers can fall back to a generic default instead of silently guessing.
function packageDurationDays(pkg: AIPackageSearchResult): number | null {
  if (!pkg.start_date || !pkg.end_date) return null;
  const start = new Date(pkg.start_date).getTime();
  const end = new Date(pkg.end_date).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function cid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SafronCoordinator({ isOpen, onOpenChange }: SafronCoordinatorProps) {
  const { user, session } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // chat + itinerary state
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // planCount tracks full planning sessions (not individual days)
  const [planCount, setPlanCount] = useState(0);
  
  // Mobile tab state
  const [mobileView, setMobileView] = useState<"chat" | "canvas">("chat");
  const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);

  // Selection & Booking state
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [globalBookStatus, setGlobalBookStatus] = useState<"idle" | "booking" | "done" | "error">("idle");
  const [globalBookError, setGlobalBookError] = useState("");

  // Guest count: promoted to real state, only overwritten by AI when guest_count_mentioned=true
  const [guestCount, setGuestCount] = useState(1);

  // Package showcase state
  const [packages, setPackages] = useState<AIPackageSearchResult[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<AIPackageSearchResult | null>(null); // detail sheet
  const [snappedPackage, setSnappedPackage] = useState<AIPackageSearchResult | null>(null);   // active in timeline
  const [packageBookedId, setPackageBookedId] = useState<string | null>(null);                // prevents double-booking
  const [lastPackageFilters, setLastPackageFilters] = useState<{ category: string | null; region: string | null }>({ category: null, region: null });
  const [isFindingMorePackages, setIsFindingMorePackages] = useState(false);
  const [findMorePackagesError, setFindMorePackagesError] = useState<string | null>(null);

  const toggleSelection = useCallback((uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        // ActivityCard already blocks this click while needsSlotChoice is true (no onClick
        // wired up), but re-check here too since this is the actual source of truth for what
        // gets booked -- a slot with no chosen time must never be addable to the booking set.
        const slot = days.flatMap((d) => d.slots).find((s) => s.uid === uid);
        if (!slot || slot.chosenTime === null) return prev;
        next.add(uid);
      }
      return next;
    });
  }, [days]);

  const chooseSlot = useCallback((dayIdx: number, slotUid: string, startTime: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i !== dayIdx ? d : { ...d, slots: d.slots.map((s) => (s.uid !== slotUid ? s : { ...s, chosenTime: startTime })) }
      )
    );
  }, []);

  const showCanvas = hasOpenedDrawer || sending || planCount > 0 || days.length > 0;

  useEffect(() => {
    if (sending || planCount > 0 || days.length > 0) {
      setHasOpenedDrawer(true);
    }
  }, [sending, planCount, days.length]);

  // scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Guards the auto-save effect below: must stay false until the session-restore fetch has
  // either found and applied a saved session or confirmed there isn't one. Without this, the
  // very first render's fresh/empty state would auto-save immediately and silently overwrite a
  // real saved session before GET even has a chance to return.
  const sessionLoadedRef = useRef(false);

  // Guards the "snappedPackage changed -> wipe days + fetch gap-fillers" effect further below.
  // When a saved session is restored with a package that was ALREADY snapped, snappedPackage
  // goes from null to that package -- structurally identical, from that effect's point of view,
  // to the user freshly clicking "Replace AI Plan." Without this guard, restoring a session would
  // immediately wipe the just-restored days and fire a redundant new AI request, discarding a
  // perfectly good saved itinerary. Set true right before the restore effect's setters run, reset
  // via setTimeout(0) so it stays true through React's synchronous commit + effect-processing
  // phase for that render and only clears on the NEXT tick, once genuinely new changes are safe
  // to react to again.
  const isRestoringSessionRef = useRef(false);

  // Removed limit for testing
  const MAX_PLANS = 9999;

  // reset on open
  useEffect(() => {
    if (isOpen) {
      sessionLoadedRef.current = false;
      setMsgs([]);
      setDays([]);
      setMobileView("chat");
      setPlanCount(0);
      setInput("");
      setSending(false);
      setHasOpenedDrawer(false);
      setSelectedUids(new Set());
      setGlobalBookStatus("idle");
      setGuestCount(1);
      setPackages([]);
      setSelectedPackage(null);
      setSnappedPackage(null);
      setPackageBookedId(null);
      setLastPackageFilters({ category: null, region: null });
      setIsFindingMorePackages(false);
      setFindMorePackagesError(null);
    }
  }, [isOpen]);

  // Restore any saved session for this user, once open and authenticated. Runs after the reset
  // effect above (React runs effects in declaration order), so this only ever adds data on top
  // of the fresh/empty state, never races it.
  useEffect(() => {
    if (!isOpen || !session?.access_token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/ai/coordinator-session", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok || cancelled) return;
        const { state } = await res.json();
        if (cancelled || !state) return;

        // See isRestoringSessionRef's declaration -- this must be true before setSnappedPackage
        // below, so the "snappedPackage changed" effect can tell this apart from a fresh click.
        isRestoringSessionRef.current = true;

        // Only fields that actually represent "the plan" are restored. sending/mobileView/
        // hasOpenedDrawer/globalBookStatus/globalBookError/input are deliberately left at their
        // fresh defaults -- transient UI state, not something worth resuming stale.
        if (Array.isArray(state.msgs)) setMsgs(state.msgs);
        if (Array.isArray(state.days)) setDays(state.days);
        if (typeof state.guestCount === "number") setGuestCount(state.guestCount);
        if (Array.isArray(state.packages)) setPackages(state.packages);
        if (state.snappedPackage) setSnappedPackage(state.snappedPackage);
        if (state.packageBookedId) setPackageBookedId(state.packageBookedId);
        if (Array.isArray(state.selectedUids)) setSelectedUids(new Set(state.selectedUids));
        if (typeof state.planCount === "number") setPlanCount(state.planCount);
        if (state.lastPackageFilters) setLastPackageFilters(state.lastPackageFilters);
        if ((state.msgs?.length ?? 0) > 0 || (state.days?.length ?? 0) > 0) {
          setMobileView("canvas");
        }
        // Cleared on the next macrotask, i.e. after React has committed this render and run
        // every effect (including the snappedPackage watcher) for it -- see the ref's own comment.
        setTimeout(() => { isRestoringSessionRef.current = false; }, 0);
      } catch (e) {
        console.error("Failed to load coordinator session:", e);
      } finally {
        if (!cancelled) sessionLoadedRef.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, session?.access_token]);

  // Debounced auto-save -- waits 1.5s after the last change before writing, so a burst of
  // updates (e.g. several DAY: lines streaming in quickly) collapses into one PUT instead of one
  // per state change. Gated on sessionLoadedRef so this can never fire before the restore effect
  // above has had a chance to run (see that ref's declaration for why that ordering matters).
  useEffect(() => {
    if (!isOpen || !session?.access_token || !sessionLoadedRef.current) return;
    // Nothing worth persisting yet -- skip so every visit to /coordinator doesn't create a saved
    // row even when the user never actually did anything.
    if (msgs.length === 0 && days.length === 0 && !snappedPackage) return;

    const state = {
      msgs, days, guestCount, packages, snappedPackage, packageBookedId,
      selectedUids: Array.from(selectedUids), planCount, lastPackageFilters,
    };
    const timer = setTimeout(() => {
      fetch("/api/v1/ai/coordinator-session", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ state }),
      }).catch((e) => console.error("Failed to save coordinator session:", e));
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen, session?.access_token, msgs, days, guestCount, packages, snappedPackage, packageBookedId, selectedUids, planCount, lastPackageFilters]);

  // focus input
  useEffect(() => {
    if (!isOpen || !user || showCanvas) return;
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, [isOpen, user, showCanvas]);

  // auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [msgs, sending, prefersReducedMotion]);

  const lastAsstMsg = [...msgs].reverse().find((m) => m.role === "assistant");
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  const tripDate = lastAsstMsg?.travelDate || defaultDate.toISOString().slice(0, 10);

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    send(`Change the entire trip to start on this exact date: ${newDate}. Keep the same activities if possible, but recalculate the itinerary for this new starting date.`);
  };

  // snapped package handler -- everything that should happen as a CONSEQUENCE of snappedPackage
  // changing (wiping days, resetting selection, triggering the gap-filler fetch) lives in the
  // effect below instead of here, so it fires the same way regardless of how snappedPackage got
  // set (explicit click here, the "×" unset button, or a future auto-select path). This
  // handler only does the two things specific to THIS click: set the package, close the modal.
  const handleReplacePlan = useCallback((pkg: AIPackageSearchResult) => {
    setSnappedPackage(pkg);
    setSelectedPackage(null);
  }, []);

  // Lazy-loaded gap-fillers: the moment snappedPackage changes (set OR unset), the old days no
  // longer apply -- they were either generated with no package context, or scoped to a DIFFERENT
  // package's cities/dates. Wipe first, then (only when a package just got snapped in) fire a
  // background planning request for 1-2 filler activities, WITHOUT waiting for the user to type
  // anything themselves -- that's the whole point of "lazy-loading on click" versus eagerly
  // generating fillers for every package the moment it's merely shown in the carousel (token
  // waste the original ask specifically wanted to avoid).
  //
  // `send` is deliberately NOT in the dependency array. It's a useCallback whose own identity
  // changes on nearly every render (msgs is one of its deps, and msgs changes every chat turn),
  // so including it here would refire this effect after every AI response -- not just when the
  // user actually snaps a different package. Effects only run after the full render commits
  // regardless of where they're declared, so `send` is already the current, fully-bound function
  // by the time this callback actually executes.
  useEffect(() => {
    // A restored session already has its own saved days/selectedUids/packageBookedId for this
    // exact snappedPackage -- wiping and re-fetching here would throw that away. See
    // isRestoringSessionRef's declaration.
    if (isRestoringSessionRef.current) return;
    setDays([]);
    setSelectedUids(new Set());
    setPackageBookedId(null);
    if (!snappedPackage) return; // just unsnapped -- clean slate, nothing to fetch

    const duration = packageDurationDays(snappedPackage);
    const cityList = snappedPackage.cities.filter(Boolean).join(", ") || "its route";
    const durationText = duration ? `${duration} day${duration > 1 ? "s" : ""}` : "its full length";
    send(
      `I've locked in the "${snappedPackage.title}" package (${cityList}, ${durationText}). ` +
      `Suggest 1-2 extra evening or free-time activities that fit alongside it for each day of the package -- ` +
      `don't rebuild the whole trip, the package already covers the main schedule.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snappedPackage]);

  // "Find another option" -- fetches exactly one package beyond what's already shown (offset =
  // packages.length, limit = 1), using the same category/region the original carousel search
  // matched against (see lastPackageFilters / the META: comment in plan-trip/route.ts). Per the
  // spec, the new package is immediately snapped in, which the watch effect above picks up on
  // its own -- this function doesn't duplicate any of that wipe/fetch-fillers logic itself.
  const findAnotherPackage = useCallback(async () => {
    if (isFindingMorePackages) return;
    setIsFindingMorePackages(true);
    setFindMorePackagesError(null);
    try {
      const params = new URLSearchParams({ offset: String(packages.length), limit: "1" });
      if (lastPackageFilters.category) params.set("category", lastPackageFilters.category);
      if (lastPackageFilters.region) params.set("region", lastPackageFilters.region);

      const res = await fetch(`/api/v1/ai/search-packages?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Couldn't find another package right now.");
      }

      const found: AIPackageSearchResult | undefined = data.packages?.[0];
      if (!found) {
        setFindMorePackagesError("No more matching packages found.");
        return;
      }

      setPackages((prev) => (prev.some((p) => p.id === found.id) ? prev : [...prev, found]));
      handleReplacePlan(found);
    } catch (err: any) {
      setFindMorePackagesError(err.message || "Couldn't find another package right now.");
    } finally {
      setIsFindingMorePackages(false);
    }
  }, [packages.length, lastPackageFilters, isFindingMorePackages, handleReplacePlan]);

  // ── Book All (package + selected services) ─────────────────────────────────────
  const bookAll = async () => {
    if (!session) return;
    const hasPackage = snappedPackage && snappedPackage.id !== packageBookedId;
    const hasServices = selectedUids.size > 0;
    if (!hasPackage && !hasServices) return;

    setGlobalBookStatus("booking");
    setGlobalBookError("");

    const baseDate = new Date(tripDate);

    // Package booking stays on the existing itinerary_id insert path -- process_multi_item_booking's
    // "package_departure" intent kind requires a specific package_departures.departure_id, which
    // this flexible-any-date package flow has no concept of (that's a fixed-schedule model
    // introduced for agency-managed departures, unrelated to snappedPackage here).
    const packagePromise = hasPackage && snappedPackage
      ? fetch("/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            service_id: null,
            itinerary_id: snappedPackage.id,
            status: "pending",
            booking_date: new Date(tripDate).toISOString(),
            guest_count: guestCount,
            special_requests: "Booked via Safron AI Coordinator",
            total_price: snappedPackage.total_price * guestCount,
            currency: snappedPackage.currency,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to book package: ${snappedPackage.title}`);
          }
          return { ok: true };
        })
      : null;

    // All selected services go in ONE call to process_multi_item_booking -- atomic (all succeed
    // or none do), replacing the old N-separate-fetches-via-create_booking_with_capacity_check
    // approach. selectedUids can only contain slots with a non-null chosenTime (toggleSelection
    // guards this), so `slot.chosenTime!` here is always safe.
    const selectedSlots: { day: DayPlan; slot: Slot }[] = [];
    for (const day of days) {
      for (const slot of day.slots) {
        if (selectedUids.has(slot.uid)) selectedSlots.push({ day, slot });
      }
    }

    const servicesPromise = hasServices
      ? fetch("/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            service_intents: selectedSlots.map(({ day, slot }) => {
              const slotDate = new Date(baseDate);
              slotDate.setDate(slotDate.getDate() + (day.dayNum - 1));
              return {
                service_id: slot.service.id,
                booking_date: slotDate.toISOString().slice(0, 10),
                guest_count: guestCount,
                special_requests: "Booked via Safron AI Coordinator",
                total_price: (Number(slot.service.price) || 0) * guestCount,
                currency: slot.service.currency,
              };
            }),
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to book selected experiences");
          }
          return res.json();
        })
      : null;

    const [packageResult, servicesResult] = await Promise.allSettled([
      packagePromise ?? Promise.resolve(null),
      servicesPromise ?? Promise.resolve(null),
    ]);

    const packageOk = !hasPackage || packageResult.status === "fulfilled";
    const servicesOk = !hasServices || servicesResult.status === "fulfilled";

    if (hasPackage && packageOk) setPackageBookedId(snappedPackage?.id ?? null);
    // The services batch is atomic -- either all selected uids succeeded together or none did,
    // unlike the old per-request partial-success bookkeeping this replaces.
    if (hasServices && servicesOk) setSelectedUids(new Set());

    const failures: string[] = [];
    if (hasPackage && !packageOk) {
      failures.push((packageResult as PromiseRejectedResult).reason?.message || "Package booking failed");
    }
    if (hasServices && !servicesOk) {
      failures.push((servicesResult as PromiseRejectedResult).reason?.message || "Experience bookings failed");
    }

    if (failures.length === 0) {
      setGlobalBookStatus("done");
      // The draft has been acted on in full -- nothing left to resume, so clear the saved
      // session rather than let a future visit restore an already-booked plan. Fire-and-forget:
      // booking already succeeded, a failed cleanup here shouldn't surface as an error to the user.
      if (session?.access_token) {
        fetch("/api/v1/ai/coordinator-session", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch((e) => console.error("Failed to clear coordinator session:", e));
      }
    } else {
      setGlobalBookError(failures.join(" "));
      setGlobalBookStatus("error");
    }
  };

  // ── Send (Progressive Streaming) ───────────────────────────────────────────
  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending || planCount >= MAX_PLANS) return;

      const userMsg: Msg = { id: cid(), role: "user", text: content };
      setMsgs((prev) => [...prev, userMsg]);
      setInput("");
      setSending(true);
      setMobileView("canvas"); 
      
      // Clear previous DIY itinerary; keep snappedPackage (user keeps it across follow-up turns)
      setDays([]);
      setSelectedUids(new Set());
      setGlobalBookStatus("idle");

      try {
        const history = [...msgs, userMsg]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.text }));

        // Streamlined summary only (id/title/cities), not the full AIPackageSearchResult (with
        // its nested items array) -- the backend's Anchor Rule only needs to know WHICH package
        // and WHERE, not the full itinerary breakdown, so this keeps payload/token cost down.
        const anchorPackage = snappedPackage
          ? {
              id: snappedPackage.id,
              title: snappedPackage.title,
              cities: snappedPackage.cities,
              // The backend's day_outline generation needs this to stop defaulting to a generic
              // day count when a package is anchored -- see packageDurationDays' own comment for
              // why this is computed from start_date/end_date rather than a days_count field
              // that doesn't exist on AIPackageSearchResult.
              duration_days: packageDurationDays(snappedPackage),
            }
          : null;

        const res = await fetch("/api/v1/ai/plan-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, snappedPackage: anchorPackage }),
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? "Coordinator unavailable right now.");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        const servicesDict = new Map<string, AIServiceSearchResult>();
        let dayCount = 0;
        
        const asstId = cid();
        setMsgs((prev) => [...prev, { id: asstId, role: "assistant", text: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          let newlineIdx;
          while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (!line.trim()) continue;
            
            if (line.startsWith('DICT:')) {
              try {
                const arr = JSON.parse(line.slice(5));
                for (const s of arr) servicesDict.set(s.id, s);
              } catch (e) { console.error("Parse dict error", e); }
            } else if (line.startsWith('PACKAGES:')) {
              try {
                const pkgs = JSON.parse(line.slice(9));
                if (Array.isArray(pkgs) && pkgs.length > 0) setPackages(pkgs);
              } catch (e) { console.error("Parse packages error", e); }
            } else if (line.startsWith('META:')) {
              try {
                const meta = JSON.parse(line.slice(5));
                setMsgs(prev => prev.map(m => m.id === asstId ? { ...m, travelDate: meta.travel_date, guestCount: meta.guest_count } : m));
                // Only overwrite the guest count stepper when the AI explicitly heard a party size
                // in the LATEST message (guest_count_mentioned=true). This prevents a follow-up
                // with no mention of people from silently resetting a manual stepper value.
                if (meta.guest_count_mentioned === true) {
                  setGuestCount(Math.max(1, Math.min(50, Math.floor(Number(meta.guest_count) || 1))));
                }
                // Remembered so "Find another option" can ask for one more package using the
                // SAME filters this turn's carousel was matched against, instead of guessing
                // from titles/cities client-side -- see plan-trip/route.ts's META: comment.
                setLastPackageFilters({ category: meta.package_category ?? null, region: meta.package_region ?? null });
              } catch (e) { console.error("Parse meta error", e); }
            } else if (line.startsWith('TEXT:')) {
              try {
                const chunkText = JSON.parse(line.slice(5));
                setMsgs(prev => prev.map(m => m.id === asstId ? { ...m, text: m.text + chunkText } : m));
              } catch (e) { console.error("Parse text error", e); }
            } else if (line.startsWith('DAY:')) {
              try {
                const dayCall = JSON.parse(line.slice(4));
                const newDay: DayPlan = {
                  dayNum: dayCall.day_number,
                  label: dayCall.label,
                  location: dayCall.location,
                  slots: (dayCall.slots || []).map((s: any) => {
                    const service = servicesDict.get(s.service_id);
                    return {
                      uid: cid(),
                      service,
                      time: s.time,
                      chosenTime: service ? initialChosenTime(service, s.time) : null,
                    };
                  }).filter((s: any) => !!s.service)
                };
                if (newDay.slots.length > 0) {
                  dayCount++;
                  setDays(prev => {
                    if (prev.some(d => d.dayNum === newDay.dayNum)) return prev;
                    return [...prev, newDay];
                  });
                }
              } catch (e) { console.error("Parse day error", e); }
            } else if (line.startsWith('ERROR:')) {
              console.error("Server error:", line.slice(6));
            }
          }
        }
        // Increment plan count once per full trip request
        setPlanCount(c => c + 1);
      } catch (err: any) {
        setMsgs((prev) => [
          ...prev,
          { id: cid(), role: "assistant", text: `⚠ ${err.message ?? "Something went wrong."}` },
        ]);
        setMobileView("chat"); 
      } finally {
        setSending(false);
      }
    },
    [input, sending, planCount, msgs, snappedPackage]
  );

  // ── Hot-Swap ──────────────────────────────────────────────────────────────
  const requestSwap = useCallback(async (dayIdx: number, slotUid: string, svc: AIServiceSearchResult) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i !== dayIdx
          ? d
          : { ...d, slots: d.slots.map((s) => (s.uid !== slotUid ? s : { ...s, swapping: true })) }
      )
    );
    try {
      const res = await fetch("/api/v1/ai/search-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: svc.category ?? null,
          region: svc.city ?? svc.region ?? null,
          exclude_id: svc.id,
        }),
      });
      const data = await res.json();
      const alts: AIServiceSearchResult[] = (data.services ?? []).slice(0, 3);
      setDays((prev) =>
        prev.map((d, i) =>
          i !== dayIdx
            ? d
            : { ...d, slots: d.slots.map((s) => (s.uid !== slotUid ? s : { ...s, swapping: false, alts })) }
        )
      );
    } catch {
      setDays((prev) =>
        prev.map((d, i) =>
          i !== dayIdx
            ? d
            : { ...d, slots: d.slots.map((s) => (s.uid !== slotUid ? s : { ...s, swapping: false })) }
        )
      );
    }
  }, []);

  const confirmSwap = useCallback((dayIdx: number, slotUid: string, replacement: AIServiceSearchResult) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i !== dayIdx
          ? d
          : {
              ...d,
              slots: d.slots.map((s) =>
                s.uid !== slotUid
                  ? s
                  : { uid: cid(), service: replacement, time: s.time, chosenTime: initialChosenTime(replacement, s.time) }
              ),
            }
      )
    );
  }, []);

  const cancelSwap = useCallback((dayIdx: number, slotUid: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i !== dayIdx ? d : { ...d, slots: d.slots.map((s) => (s.uid !== slotUid ? s : { ...s, alts: undefined })) }
      )
    );
  }, []);

  // ── Render guard ─────────────────────────────────────────────────────────
  if (!isOpen) return null;

  if (!user) {
    return (
      <AuthModal isOpen={true} onOpenChange={(o) => { if (!o) onOpenChange(false); }} />
    );
  }

  const plansLeft = MAX_PLANS - planCount;

  return (
    <motion.div
      key="coordinator-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
      className="fixed inset-0 z-[120] flex flex-col"
      style={{ background: "#F9F8F5" }}
    >
      {/* ── Background texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(197,168,128,0.1) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,107,112,0.05) 0%, transparent 60%)",
        }}
      />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex-shrink-0 flex items-center gap-3 px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
          paddingBottom: 14,
          borderBottom: "1px solid rgba(10,35,32,0.08)",
          background: "rgba(249,248,245,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close coordinator"
          className="tap-active flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #006B70, #0A2320)",
              border: "1px solid rgba(0,107,112,0.2)",
              boxShadow: "0 2px 10px rgba(0,107,112,0.1)",
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: "#F9F8F5" }} />
          </div>
          <div className="min-w-0">
            <div
              className="truncate"
              style={{ fontSize: 14, fontWeight: 700, color: "#0A2320", letterSpacing: "-0.01em" }}
            >
              Safron AI
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(10,35,32,0.6)", fontWeight: 500 }}>
              Hidden Uzbekistan
            </div>
          </div>
        </div>

        {showCanvas && (
          <div
            className="md:hidden flex items-center flex-shrink-0"
            style={{
              background: "rgba(10,35,32,0.05)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {(["chat", "canvas"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMobileView(v)}
                className="tap-active"
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 700,
                  color: mobileView === v ? "#F9F8F5" : "rgba(10,35,32,0.55)",
                  background: mobileView === v ? "#0A2320" : "transparent",
                  transition: "all 0.18s ease",
                  letterSpacing: "0.01em",
                }}
              >
                {v === "chat" ? "Chat" : "Itinerary"}
              </button>
            ))}
          </div>
        )}

        <div
          className="flex-shrink-0 flex items-center gap-1"
          style={{
            padding: "4px 9px",
            background: plansLeft <= 0 ? "rgba(201,59,59,0.1)" : "rgba(197,168,128,0.15)",
            borderRadius: 20,
            border: `1px solid ${plansLeft <= 0 ? "rgba(201,59,59,0.25)" : "rgba(197,168,128,0.3)"}`,
          }}
        >
          <Sparkles style={{ width: 9, height: 9, color: plansLeft <= 0 ? "#C93B3B" : "#A68B63" }} />
          <span style={{ fontSize: 10, color: plansLeft <= 0 ? "#C93B3B" : "#A68B63", fontWeight: 700 }} className="hidden sm:inline">
            {plansLeft > 0 ? plansLeft : 0}/{MAX_PLANS} remaining
          </span>
          <span style={{ fontSize: 10, color: plansLeft <= 0 ? "#C93B3B" : "#A68B63", fontWeight: 700 }} className="inline sm:hidden">
            {plansLeft > 0 ? plansLeft : 0}/{MAX_PLANS}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative flex-1 flex flex-row overflow-hidden">
        
        {/* ══ CHAT VIEW ══ */}
        <div
          className={`flex flex-col relative h-full transition-all duration-500 ease-in-out flex-shrink-0
            ${showCanvas ? "w-full md:w-[42%] lg:w-[35%] md:border-r border-teal-900/10" : "w-full"}
            ${showCanvas && mobileView === "canvas" ? "hidden md:flex" : "flex"}
          `}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ overscrollBehavior: "contain" }}>
            <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">

              {msgs.length === 0 && !sending && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div className="flex justify-center mb-6 mt-4">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 24,
                        background: "linear-gradient(135deg, #006B70, #0A2320)",
                        border: "1px solid rgba(0,107,112,0.2)",
                        boxShadow: "0 8px 32px rgba(0,107,112,0.15)",
                      }}
                    >
                      <Sparkles style={{ width: 32, height: 32, color: "#F9F8F5" }} />
                    </div>
                  </div>

                  <div
                    className="rounded-2xl px-5 py-5 mb-5"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(10,35,32,0.06)",
                      boxShadow: "0 4px 20px rgba(10,35,32,0.04)",
                      color: "#0A2320",
                      fontSize: 14.5,
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {WELCOME_TEXT}
                  </div>

                  <div className="flex flex-col gap-2">
                    <p style={{ fontSize: 10.5, color: "rgba(10,35,32,0.4)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>
                      QUICK START
                    </p>
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => send(p.text)}
                        className="tap-active flex items-center gap-3 text-left"
                        style={{
                          padding: "12px 16px",
                          background: "#FFFFFF",
                          border: "1px solid rgba(10,35,32,0.06)",
                          boxShadow: "0 2px 10px rgba(10,35,32,0.02)",
                          borderRadius: 14,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{p.emoji}</span>
                        <span style={{ fontSize: 13, color: "rgba(10,35,32,0.8)", fontWeight: 500 }}>
                          {p.text}
                        </span>
                        <ChevronRight style={{ width: 14, height: 14, color: "rgba(10,35,32,0.3)", marginLeft: "auto", flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {msgs.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="flex"
                    style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="flex-shrink-0 flex items-center justify-center mr-3 self-start mt-1"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: "linear-gradient(135deg, #006B70, #0A2320)",
                          boxShadow: "0 2px 8px rgba(0,107,112,0.15)",
                        }}
                      >
                        <Sparkles style={{ width: 12, height: 12, color: "#F9F8F5" }} />
                      </div>
                    )}
                    <div
                      className="max-w-[85%]"
                      style={{
                        padding: "14px 18px",
                        borderRadius: msg.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                        background: msg.role === "user" ? "#0A2320" : "#FFFFFF",
                        border: msg.role === "user" ? "none" : "1px solid rgba(10,35,32,0.06)",
                        boxShadow: msg.role === "user" ? "0 4px 16px rgba(10,35,32,0.12)" : "0 4px 16px rgba(10,35,32,0.04)",
                        color: msg.role === "user" ? "#F9F8F5" : "#0A2320",
                        fontSize: 14.5,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.text || (
                        <span className="flex items-center gap-1.5 opacity-60 text-sm">
                          <Loader2 className="animate-spin w-4 h-4" />
                          Thinking...
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 px-4 pb-safe"
            style={{
              paddingTop: 16,
              paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 20px)",
              background: "linear-gradient(to top, #F9F8F5 80%, rgba(249,248,245,0) 100%)",
            }}
          >
            <div className="flex items-end gap-2 max-w-2xl mx-auto">
              <textarea
                ref={inputRef as any}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={
                  planCount >= MAX_PLANS
                    ? "Plan limit reached for this session"
                    : "Message Safron AI…"
                }
                disabled={sending || planCount >= MAX_PLANS}
                rows={1}
                className="flex-1 min-w-0 outline-none resize-none overflow-hidden"
                style={{
                  padding: "16px 20px",
                  borderRadius: 24,
                  background: "#FFFFFF",
                  border: "1px solid rgba(10,35,32,0.12)",
                  boxShadow: "0 4px 20px rgba(10,35,32,0.04)",
                  color: "#0A2320",
                  fontSize: 15,
                  lineHeight: 1.4,
                  caretColor: "#006B70",
                }}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={sending || !input.trim() || planCount >= MAX_PLANS}
                className="tap-active flex-shrink-0 flex items-center justify-center disabled:opacity-30"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 24,
                  background: sending ? "rgba(10,35,32,0.05)" : "#0A2320",
                  border: sending ? "1px solid rgba(10,35,32,0.1)" : "none",
                  boxShadow: sending ? "none" : "0 4px 16px rgba(10,35,32,0.15)",
                }}
              >
                {sending ? (
                  <Loader2 style={{ width: 20, height: 20, color: "#0A2320" }} className="animate-spin" />
                ) : (
                  <Send style={{ width: 18, height: 18, color: "#F9F8F5", marginLeft: 2 }} />
                )}
              </button>
            </div>
            <p className="text-center mt-3 max-w-2xl mx-auto" style={{ fontSize: 11, color: "rgba(10,35,32,0.4)" }}>
              Grounded in Safron's live database · no invented providers
            </p>
          </div>
        </div>

        {/* ══ CANVAS VIEW (Right Drawer) ══ */}
        <AnimatePresence>
          {showCanvas && (
            <motion.div
              key="canvas-drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className={`flex-1 overflow-y-auto h-full relative ${
                mobileView === "chat" ? "hidden md:block" : "block"
              }`}
              style={{
                background: "#FFFFFF", 
                overscrollBehavior: "contain",
                boxShadow: "-12px 0 32px rgba(10,35,32,0.03)"
              }}
            >
              <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto pb-12">
                
                {/* Canvas header */}
                <div className="flex flex-col mb-6 pl-6 relative">
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#0A2320",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    Your Itinerary
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", marginTop: 6, fontWeight: 500 }}>
                    {days.length} day{days.length !== 1 ? "s" : ""} planned · tap ⇄ to swap activities
                  </p>
                </div>

                {/* Sticky Trip Control Bar */}
                <div className="-mx-4 md:-mx-8 mb-8">
                  <TripControlBar
                    tripDate={tripDate}
                    onDateChange={handleDateChange}
                    guestCount={guestCount}
                    onGuestCountChange={setGuestCount}
                    disabled={sending}
                  />
                </div>

                {/* Agency Package Carousel */}
                <PackageCarousel
                  packages={packages}
                  guestCount={guestCount}
                  onSelectPackage={setSelectedPackage}
                  prefersReducedMotion={!!prefersReducedMotion}
                  activePackageId={snappedPackage?.id}
                  onFindMore={findAnotherPackage}
                  isFindingMore={isFindingMorePackages}
                  findMoreError={findMorePackagesError}
                />

                {/* Timeline Container */}
                <div className="relative">
                  {/* The main vertical timeline line */}
                  <div 
                    className="absolute left-[24px] top-4 bottom-0 w-[2px]" 
                    style={{ background: "repeating-linear-gradient(to bottom, rgba(10,35,32,0.1) 0, rgba(10,35,32,0.1) 6px, transparent 6px, transparent 12px)" }}
                  />

                  {/* Snapped package section (persists across follow-up turns) */}
                  <AnimatePresence>
                    {snappedPackage && (
                      <SnappedPackageTimeline
                        pkg={snappedPackage}
                        guestCount={guestCount}
                        onRemove={() => setSnappedPackage(null)}
                        onViewDetail={() => setSelectedPackage(snappedPackage)}
                      />
                    )}
                  </AnimatePresence>

                  {/* Day sections */}
                  <AnimatePresence>
                    {days.map((day, dayIdx) => (
                      <motion.section
                        key={day.dayNum}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-12 relative"
                      >
                        {/* Circle on the timeline */}
                        <div 
                          className="absolute left-[24px] w-3.5 h-3.5 -ml-[6px] top-3 rounded-full z-10"
                          style={{ background: "#C5A880", boxShadow: "0 0 0 4px #FFFFFF" }}
                        />

                        {/* Day header */}
                        <div className="flex items-center gap-4 mb-6 pl-14">
                          <div className="flex-1 min-w-0">
                            <div
                              style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#0A2320",
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              Day {day.dayNum}: {day.label}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin style={{ width: 14, height: 14, color: "#006B70" }} />
                              <span style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", fontWeight: 600 }}>
                                {day.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Slots */}
                        <div className="flex flex-col gap-5 pl-14">
                          {day.slots.map((slot, slotIdx) => (
                            <motion.div 
                              key={slot.uid}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: slotIdx * 0.1 }}
                            >
                              <AnimatePresence mode="wait">
                                {slot.alts ? (
                                  <SwapPanel
                                    key={`swap-${slot.uid}`}
                                    original={slot.service}
                                    alts={slot.alts}
                                    time={slot.time}
                                    onConfirm={(svc) => confirmSwap(dayIdx, slot.uid, svc)}
                                    onCancel={() => cancelSwap(dayIdx, slot.uid)}
                                    prefersReducedMotion={!!prefersReducedMotion}
                                  />
                                ) : (
                                  <ActivityCard
                                    key={slot.uid}
                                    service={slot.service}
                                    time={slot.time}
                                    chosenTime={slot.chosenTime}
                                    onChooseSlot={(startTime) => chooseSlot(dayIdx, slot.uid, startTime)}
                                    isSwapping={!!slot.swapping}
                                    onSwap={() => requestSwap(dayIdx, slot.uid, slot.service)}
                                    session={session}
                                    prefersReducedMotion={!!prefersReducedMotion}
                                    selected={selectedUids.has(slot.uid)}
                                    onToggleSelect={() => toggleSelection(slot.uid)}
                                  />
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.section>
                    ))}
                  </AnimatePresence>

                  {/* Crafting Next Day Spinner */}
                  <AnimatePresence>
                    {sending && (
                      <motion.div
                        key="crafting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pl-14 flex items-center gap-3 py-4 mt-4"
                      >
                        <div 
                          className="absolute left-[24px] w-3.5 h-3.5 -ml-[6px] rounded-full z-10"
                          style={{ background: "#006B70", boxShadow: "0 0 0 4px #FFFFFF" }}
                        />
                        <Loader2 style={{ width: 20, height: 20, color: "#006B70" }} className="animate-spin" />
                        <span style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", fontWeight: 700, letterSpacing: "0.05em" }} className="uppercase">
                          {days.length === 0 ? "Crafting your itinerary..." : "Crafting next day..."}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Global Book Button — always fixed bottom, shows running price total */}
                  <AnimatePresence>
                    {((snappedPackage && snappedPackage.id !== packageBookedId) || selectedUids.size > 0) && (() => {
                      // Compute running total: (package + all selected services) × guestCount
                      const pkgPrice = (snappedPackage && snappedPackage.id !== packageBookedId)
                        ? snappedPackage.total_price
                        : 0;
                      const svcsPrice = days.reduce((acc, day) =>
                        acc + day.slots.reduce((s, slot) =>
                          s + (selectedUids.has(slot.uid) ? (Number(slot.service.price) || 0) : 0)
                        , 0)
                      , 0);
                      const totalUzs = (pkgPrice + svcsPrice) * guestCount;
                      const totalUsd = (totalUzs / 12600).toFixed(0);
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 24 }}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
                          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
                        >
                          <div
                            className="flex flex-col gap-2 p-3 w-full max-w-sm pointer-events-auto"
                            style={{
                              background: "rgba(255,255,255,0.97)",
                              backdropFilter: "blur(20px)",
                              borderRadius: 24,
                              boxShadow: "0 -4px 8px rgba(10,35,32,0.04), 0 8px 32px rgba(10,35,32,0.15)",
                              border: "1px solid rgba(10,35,32,0.1)",
                            }}
                          >
                            {/* Running total row */}
                            {totalUzs > 0 && (
                              <div className="flex items-center justify-between px-1 pb-1" style={{ borderBottom: "1px solid rgba(10,35,32,0.06)" }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(10,35,32,0.5)" }}>
                                  {guestCount > 1 ? `${guestCount} guests · ` : ""}Total
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: "#0A2320" }}>
                                    {totalUzs.toLocaleString("en-US").replace(/,/g, " ")}
                                  </span>
                                  <span style={{ fontSize: 10, color: "rgba(10,35,32,0.45)", fontWeight: 500 }}>UZS</span>
                                  <span style={{ fontSize: 11, color: "rgba(10,35,32,0.35)" }}>·</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#C5A880" }}>≈${totalUsd}</span>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={bookAll}
                              disabled={globalBookStatus === "booking"}
                              className="tap-active flex items-center justify-center gap-2 w-full disabled:opacity-50"
                              style={{
                                background: globalBookStatus === "error" ? "#C93B3B" : globalBookStatus === "done" ? "#006B70" : "#C5A880",
                                color: globalBookStatus === "done" ? "#FFFFFF" : "#0A2320",
                                borderRadius: 16,
                                padding: "14px 20px",
                                fontSize: 15,
                                fontWeight: 800,
                              }}
                            >
                              {globalBookStatus === "booking" && <Loader2 className="w-5 h-5 animate-spin" />}
                              {globalBookStatus === "done" && <CheckCircle2 className="w-5 h-5" />}
                              {globalBookStatus === "idle" && (() => {
                                const hasPkg = snappedPackage && snappedPackage.id !== packageBookedId;
                                const svcCount = selectedUids.size;
                                if (hasPkg && svcCount > 0) return `Book All (${svcCount + 1} items)`;
                                if (hasPkg) return `Book Package`;
                                return `Book ${svcCount} Experience${svcCount > 1 ? "s" : ""}`;
                              })()}
                              {globalBookStatus === "error" && "Try Again"}
                              {globalBookStatus === "booking" && "Booking..."}
                              {globalBookStatus === "done" && "Booked!"}
                            </button>
                            {globalBookError && (
                              <p className="text-center" style={{ fontSize: 12, color: "#C93B3B", fontWeight: 500 }}>
                                {globalBookError}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Package Detail Sheet */}
      <PackageDetailSheet
        pkg={selectedPackage}
        onOpenChange={(open) => { if (!open) setSelectedPackage(null); }}
        guestCount={guestCount}
        isActive={snappedPackage?.id === selectedPackage?.id}
        onReplacePlan={handleReplacePlan}
        prefersReducedMotion={!!prefersReducedMotion}
      />
    </motion.div>
  );
}

// ActivityCard and SwapPanel are in ./ActivityCard.tsx
