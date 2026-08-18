import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, jsonSchema } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { searchServices } from "@/lib/ai/searchServices";
import { matchPackages } from "@/lib/ai/matchPackages";
import type { AIServiceSearchResult, AIPackageSearchResult, PlanTripMessage } from "@repo/types";

export const maxDuration = 120;

const moonshot = createOpenAI({
  baseURL: "https://api.moonshot.ai/v1",
  apiKey: process.env.MOONSHOT_API_KEY,
});

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const hourlyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:plan-trip:hourly",
    })
  : null;

type RateLimitInfo = { hourlyCount: number; hourlyReset: number };
const rateLimitMap = new Map<string, RateLimitInfo>();
const HOURLY_LIMIT = 10;
const HOUR_MS = 60 * 60 * 1000;

function checkInMemoryRateLimit(userId: string) {
  const now = Date.now();
  let info = rateLimitMap.get(userId);
  if (!info) info = { hourlyCount: 0, hourlyReset: now + HOUR_MS };
  if (now > info.hourlyReset) { info.hourlyCount = 0; info.hourlyReset = now + HOUR_MS; }
  if (info.hourlyCount >= HOURLY_LIMIT) return { success: false, reset: info.hourlyReset };
  info.hourlyCount++;
  rateLimitMap.set(userId, info);
  return { success: true, reset: info.hourlyReset };
}

const MAX_MESSAGES = 20;
const KNOWN_CATEGORIES = ["masterclass", "tour", "food", "bazaar", "adventure", "stay", "nature"];

// ─── Schema: Intent ──────────────────────────────────────────────────────────
const intentSchema = jsonSchema<{
  ready_to_search: boolean;
  category: string;
  region: string;
  max_price_uzs: number;
  travel_date: string;
  guest_count: number;
  guest_count_mentioned: boolean;
}>({
  type: "object",
  properties: {
    ready_to_search: { type: "boolean" },
    category: { type: "string" },
    region: { type: "string" },
    max_price_uzs: { type: "number" },
    travel_date: { type: "string" },
    guest_count: { type: "number" },
    guest_count_mentioned: { type: "boolean" },
  },
  required: ["ready_to_search", "category", "region", "max_price_uzs", "travel_date", "guest_count", "guest_count_mentioned"],
});

// ─── Schema: Outline ─────────────────────────────────────────────────────────
// Fast, small call: reply text + a day-by-day THEME/LOCATION outline only -- no service picking
// yet. This is what makes progressive per-day streaming possible: the old single replySchema
// call generated every day's full slot list in one generateObject() invocation, so nothing could
// be sent to the client until the ENTIRE multi-day itinerary had finished generating (see the
// stream-construction comment below for the actual fix this enables).
const outlineSchema = jsonSchema<{
  reply_text: string;
  day_outline: Array<{ day_number: number; label: string; location: string }>;
}>({
  type: "object",
  properties: {
    reply_text: {
      type: "string",
      description: "Short conversational reply for the chat bubble. If building an itinerary, briefly confirm what you built. If no services found, ask a clarifying question.",
    },
    day_outline: {
      type: "array",
      description: "One entry per day, theme and location ONLY -- do not pick specific services here, that happens in a separate call per day. Empty array if no services to recommend.",
      items: {
        type: "object",
        properties: {
          day_number: { type: "number" },
          label: { type: "string", description: "Short theme, e.g. 'Silk Road Wonders'" },
          location: { type: "string" },
        },
        required: ["day_number", "label", "location"],
      },
    },
  },
  required: ["reply_text", "day_outline"],
});

// ─── Schema: Day slots ────────────────────────────────────────────────────────
// One call per day, run sequentially inside the stream so each day's DAY: line can be enqueued
// the moment that specific (small, fast) call resolves, instead of waiting on every other day too.
const daySlotsSchema = jsonSchema<{ slots_json: string }>({
  type: "object",
  properties: {
    slots_json: {
      type: "string",
      description: 'JSON array string of 2-3 slots for THIS DAY ONLY, using real service IDs. Example: [{"service_id":"abc123","time":"09:00"},{"service_id":"def456","time":"14:00"}]',
    },
  },
  required: ["slots_json"],
});

function normalizeTravelDate(raw: string): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : raw;
}

function normalizeGuestCount(raw: number): number {
  if (!raw || !Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.floor(raw), 50);
}

// THE ANCHOR RULE (see COORDINATOR_SYSTEM below) needs to know whether the tourist has a package
// snapped into their timeline client-side -- SafronCoordinator sends a streamlined summary, not
// the full AIPackageSearchResult, so this only trusts/reads the fields that summary has.
interface SnappedPackageSummary {
  id: string;
  title: string;
  cities: string[];
  /** Inclusive day count computed client-side from the package's start_date/end_date (see
   *  packageDurationDays in SafronCoordinator.tsx) -- null if either date was missing. Without
   *  this, day_outline generation has no way to know a 10-day package needs 10 days of (light)
   *  filler content rather than whatever generic count the model defaults to, which is the exact
   *  "AI plans 5 days for a 10-day package" mismatch this field exists to close. */
  duration_days: number | null;
}

function normalizeSnappedPackage(raw: any): SnappedPackageSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim().slice(0, 200) : null;
  if (!id || !title) return null;
  const cities = Array.isArray(raw.cities)
    ? raw.cities.filter((c: unknown): c is string => typeof c === "string" && c.trim().length > 0)
        .slice(0, 10)
        .map((c: string) => c.trim().slice(0, 100))
    : [];
  const duration_days =
    typeof raw.duration_days === "number" && Number.isFinite(raw.duration_days) && raw.duration_days > 0 && raw.duration_days <= 60
      ? Math.round(raw.duration_days)
      : null;
  return { id, title, cities, duration_days };
}

const COORDINATOR_SYSTEM = `You are the Safron AI Travel Coordinator for Uzbekistan's national tourism platform.

RULES:
- Build a structured multi-day itinerary using ONLY service IDs from REAL_SERVICES.
- Assign 2–3 slots per day across different times (morning, afternoon, evening).
- Spread services across the days.
- NEVER invent service IDs. Only use IDs from REAL_SERVICES.
- Converse in the tourist's language.

CRITICAL UX RULE — "THE STEVE JOBS APPROACH":
- NEVER return an empty days array. NEVER ask the user to specify days or regions before generating an itinerary.
- If REAL_SERVICES has any results at all, you MUST build a day-by-day plan from them, even if they don't perfectly match the user's request.
- If the user asked for something you can't find (e.g. "nature" but you only have "culture"), PIVOT AND SELL: acknowledge their interest, then enthusiastically recommend what you DO have. Example: "We're still expanding our deep-nature retreats, but for a honeymoon, you absolutely must experience this 3-day romantic experience in Samarkand!"
- If REAL_SERVICES is empty/unavailable, still write an inspiring reply and suggest the user try a different region or interest — but ALSO build a minimal 1-day plan from the fallback services if any are provided.
- Show them something beautiful. Do not make them work for it.

CRITICAL PLANNING ALGORITHM - YOU MUST OBEY TIME AND SPACE:
1. THE HOTEL RULE: If the user asks for hotels, luxury stays, or a honeymoon, YOU MUST explicitly recommend the Agency Packages provided in the PACKAGES array. State clearly that our curated packages include top-tier hotel accommodations.
2. THE TIME MATH RULE: You must respect the duration of activities. If Activity A is a 'Hike' starting at 09:00 and lasts 4 hours, Activity B CANNOT start before 14:00 (allowing 1 hour for travel/rest).
3. THE GEOFENCE RULE: Do not make the tourist teleport. All activities within a single day MUST be in the same city or district. If they are in Chimgan in the morning, they cannot be in Bukhara in the afternoon.
4. THE GASTRONOMY RULE (Biological Needs): Tourists must eat. You must actively inject 'Dining' or 'Food' category services into the itinerary. Always schedule a lunch around 12:30-14:00 and a dinner around 19:00-20:30. The dining location MUST logically follow the previous activity (e.g., if the morning activity was in Chorsu Bazaar, the lunch recommendation must be nearby).
5. THE ANCHOR RULE: If the user has snapped an Agency Package into their timeline, use the package's daily locations as your anchor. Only suggest extra evening services that match the city the package has them sleeping in.

- Return ONLY valid, raw JSON. DO NOT wrap your response in markdown code blocks (\`\`\`json). DO NOT include any text outside the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    /*
    // Disabled rate limiting and auth block for testing
    if (!user && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ success: false, error: "Sign in to plan a trip" }, { status: 401 });
    }

    if (redis) {
      const { success, reset } = await hourlyRateLimit!.limit(userId);
      if (!success) {
        return NextResponse.json({ success: false, error: "RATE_LIMITED" }, { status: 429, headers: { "X-RateLimit-Limit": "10", "X-RateLimit-Reset": reset.toString() } });
      }
    } else {
      const rlCheck = checkInMemoryRateLimit(userId);
      if (!rlCheck.success) {
        return NextResponse.json({ success: false, error: "RATE_LIMITED" }, { status: 429, headers: { "X-RateLimit-Limit": HOURLY_LIMIT.toString(), "X-RateLimit-Reset": rlCheck.reset.toString() } });
      }
    }
    */

    const body = await req.json();
    const rawMessages = body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ success: false, error: "Missing messages" }, { status: 400 });
    }

    const snappedPackage = normalizeSnappedPackage(body?.snappedPackage);

    const messages: PlanTripMessage[] = rawMessages
      .filter((m: any): m is PlanTripMessage => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
      .slice(-MAX_MESSAGES)
      .map((m: any) => ({ role: m.role, content: m.content.trim() }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ success: false, error: "Last message must be from user" }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ success: false, error: "Travel coordinator unavailable" }, { status: 503 });
    }

    try {
      // ── Pass 1: Intent extraction ─────────────────────────────────────────
      const today = new Date().toISOString().slice(0, 10);
      const intent = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: intentSchema,
        system: `You are extracting travel intent from the conversation.

CRITICAL RULES:
1. Set ready_to_search=true for ANY message that mentions travel, trips, visiting, honeymoon, vacation, exploring, or Uzbekistan in any way. The bar is extremely low — if they're talking about travel at all, search.
2. If the user does not specify how many days, ALWAYS assume 3 days. Never leave it at 0 or unresolved.
3. If the user is vague (e.g. "I don't know what to do", "honeymoon ideas", "what's good in Uzbekistan"), set ready_to_search=true with region and category as empty strings. This triggers a broad "Greatest Hits" search.
4. If no region is mentioned but the user mentions a type of activity (nature, culture, food), map it to a known category if possible.
5. TODAY=${today}. Resolve relative dates ("next week", "in 2 weeks") against it. If no date mentioned, leave travel_date empty.
6. Set guest_count_mentioned=true ONLY when the MOST RECENT user message explicitly states party size (e.g. "for 3 people", "2 of us", "me and my fiancé"). If the latest message says nothing about how many people are traveling, set guest_count_mentioned=false — even if an earlier message mentioned it.
7. Return ONLY valid, raw JSON. DO NOT wrap your response in markdown code blocks (\`\`\`json). DO NOT include any text outside the JSON object.`,
        messages,
      });

      // Hoist category/region so both searchServices and matchPackages use identical resolved values.
      const category = KNOWN_CATEGORIES.includes(intent.object.category ?? "") ? intent.object.category : null;
      const region = intent.object.region || null;
      const maxPriceUzs = intent.object.max_price_uzs || null;
      const normalizedTravelDate = normalizeTravelDate(intent.object.travel_date);

      let servicesContext = "No services context yet. The user just started the conversation.";
      const servicesById = new Map<string, AIServiceSearchResult>();
      // Whichever filter combination actually produced servicesById below -- reused by the
      // per-day exclusion re-fetch in the day loop further down so it draws from the same pool
      // (category/region/maxPrice/travelDate), not a differently-filtered one.
      let activeSearchFilters: { category: string | null; region: string | null; maxPrice: number | null; travelDate: string | null } = {
        category,
        region,
        maxPrice: maxPriceUzs,
        travelDate: normalizedTravelDate,
      };

      // Always search — the bar for ready_to_search is now very low.
      if (intent.object.ready_to_search) {
        const outcome = await searchServices(supabase, activeSearchFilters);
        if (outcome.success && outcome.services.length > 0) {
          for (const svc of outcome.services) servicesById.set(svc.id, svc);
          servicesContext = `REAL_SERVICES (use ONLY these IDs):\n${JSON.stringify(outcome.services, null, 2)}`;
        } else {
          // Even with no matches, try a broader search with no filters at all
          const broadFilters = { category: null, region: null, maxPrice: null, travelDate: null };
          const broadOutcome = await searchServices(supabase, broadFilters);
          if (broadOutcome.success && broadOutcome.services.length > 0) {
            for (const svc of broadOutcome.services) servicesById.set(svc.id, svc);
            servicesContext = `The user asked for something specific but no exact matches were found. Here are our BEST AVAILABLE services — use these to build an inspiring alternative itinerary. PIVOT AND SELL.\nREAL_SERVICES (use ONLY these IDs):\n${JSON.stringify(broadOutcome.services, null, 2)}`;
            activeSearchFilters = broadFilters;
          } else {
            servicesContext = "No services are currently available in the database. Apologize warmly and let the user know we are onboarding new partners soon.";
          }
        }
      }

      // ── Package match runs BEFORE the outline call (not concurrent with it) ────────────
      // THE HOTEL RULE below tells the model to "explicitly recommend the Agency Packages
      // provided in the PACKAGES array" -- that instruction is meaningless unless the model is
      // actually shown what matched. Running matchPackages() concurrently with the outline
      // generateObject() call (the old structure) meant reply_text was always written with zero
      // visibility into which packages existed. matchPackages() is a single DB RPC, not an LLM
      // call, so sequencing it first costs tens of milliseconds -- negligible next to the
      // multi-second generateObject() calls, and necessary for Rule 1 to do anything at all.
      const packageOutcome = await matchPackages(supabase, { category, region });
      const packagesArray: AIPackageSearchResult[] = packageOutcome.success ? packageOutcome.packages : [];

      const packagesContext = packagesArray.length > 0
        ? `PACKAGES (curated multi-day Agency Packages -- these DO include hotel/accommodation bookings as part of the package; when the tourist asks about hotels, luxury stays, or a honeymoon, recommend these BY NAME):\n${JSON.stringify(
            packagesArray.map(p => ({
              id: p.id,
              title: p.title,
              description: p.description,
              total_price: p.total_price,
              currency: p.currency,
              cities: p.cities,
              item_count: p.item_count,
            })),
            null,
            2
          )}`
        : "PACKAGES: none currently match this search. Do not claim we don't offer hotels or packages -- simply don't reference specific ones, and mention we're expanding our curated packages in this area.";

      // THE ANCHOR RULE (see COORDINATOR_SYSTEM) only activates when the client tells us a
      // package is snapped into the timeline -- otherwise this is an empty string and every
      // prompt below behaves exactly as it did before Phase 2.5.
      const anchorContext = snappedPackage
        ? `CRITICAL CONTEXT: The user has anchored their itinerary to an Agency Package called "${snappedPackage.title}". They are visiting these cities: ${
            snappedPackage.cities.length > 0 ? snappedPackage.cities.join(", ") : "unspecified"
          }. DO NOT generate a conflicting full-day schedule. You are acting as an upsell agent. Only suggest 1 or 2 extra "filler" activities (like evening dining or quick local events) that fit alongside a busy pre-planned package tour.${
            snappedPackage.duration_days
              ? ` THE PACKAGE'S ACTUAL DURATION IS EXACTLY ${snappedPackage.duration_days} DAY${snappedPackage.duration_days > 1 ? "S" : ""}. day_outline MUST contain exactly ${snappedPackage.duration_days} entries (day_number 1 through ${snappedPackage.duration_days}), one per day of the package -- NOT a generic 3-5 day count. Each day's entry is still just light filler per the rule above, not a full schedule.`
              : " The package's exact duration wasn't provided -- use your best judgment on how many days of light filler to suggest, but keep it brief (2-3 days at most)."
          }`
        : "";

      // ── Pass 2a: reply text + day outline (fast) ───────────────────────────────────────
      // DURATION RULE is scoped to this call specifically (not folded into COORDINATOR_SYSTEM,
      // which the per-day slot calls below also use) -- it governs how many day_outline entries
      // to generate, a decision that only happens here. Fixes the "AI recommends a 10-day
      // package in text but outlines a 5-day DIY timeline" mismatch: without an explicit day
      // count from the user, the model had nothing tying day_outline's length to whatever
      // package it was verbally pitching via THE HOTEL RULE.
      const outlineResult = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: outlineSchema,
        system: `${COORDINATOR_SYSTEM}\n\n${servicesContext}\n\n${packagesContext}\n\n${anchorContext}\n\nDURATION RULE: If the user does not explicitly state how many days their trip is, you MUST check the packagesContext. If you are recommending a specific package, your outline MUST generate the exact same number of days as that package's duration. Do not default to 3 or 5 days if a 10-day package is your primary recommendation.`,
        messages,
      });

      const servicesArray = Array.from(servicesById.values());

      // ── Stream the response back progressively ────────────────────────────
      // `start` is async so each day's generateObject() call can be awaited IN BETWEEN
      // controller.enqueue() calls -- this is the actual fix for the "stuck on Crafting..."
      // latency. The old code generated every day's full slot list in ONE generateObject() call
      // before the stream even opened, so the entire multi-day generation time (the real ~1min)
      // happened before any byte could be sent -- no amount of enqueue/flush tuning helps that,
      // because generateObject() only resolves once 100% done and there's nothing partial to
      // send earlier. Splitting into small per-day calls means Day 1 can be sent to the client
      // as soon as ITS (much smaller, much faster) call resolves, while Day 2+ are still
      // generating -- a real progressive reveal instead of a single late burst.
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // 1. Send full service dictionary
            controller.enqueue(encoder.encode(`DICT:${JSON.stringify(servicesArray)}\n`));

            // 2. Send matched packages (empty array if none matched or RPC failed)
            controller.enqueue(encoder.encode(`PACKAGES:${JSON.stringify(packagesArray)}\n`));

            // 3. Send metadata — guest_count_mentioned scoped to latest message only so a
            //    manual stepper value is not silently overwritten by an unrelated follow-up.
            controller.enqueue(encoder.encode(`META:${JSON.stringify({
              travel_date: normalizeTravelDate(intent.object.travel_date),
              guest_count: normalizeGuestCount(intent.object.guest_count),
              guest_count_mentioned: intent.object.guest_count_mentioned === true,
              // Resolved (not raw) category/region -- the exact values matchPackages() was
              // actually called with this turn. The client has no other way to know these; it
              // needs them to ask for one more matching package later via the same filters
              // ("Find another option") without re-deriving them from package titles/cities.
              package_category: category,
              package_region: region,
            })}\n`));

            // 4. Send conversational reply text -- already available, no per-day wait needed.
            if (outlineResult.object.reply_text) {
              controller.enqueue(encoder.encode(`TEXT:${JSON.stringify(outlineResult.object.reply_text)}\n`));
            }

            const outline = outlineResult.object.day_outline ?? [];

            if (outline.length > 0 && servicesArray.length > 0) {
              // 5. One small generateObject() call per day, awaited SEQUENTIALLY (not
              //    Promise.all) so Day 1 is guaranteed to be the first thing enqueued -- matches
              //    what the user actually sees ("Day 1 appears fast, Day 5 still catching up"),
              //    rather than parallel calls that could resolve in any order.
              const usedServiceIds: Set<string> = new Set<string>();
              for (const day of outline) {
                try {
                  // Re-query per day once something has actually been used, instead of reusing
                  // the single pre-loop servicesContext for every day and just *telling* the
                  // model which ids to avoid -- that prompt instruction was observed being
                  // ignored (e.g. the same Heliskiing service scheduled on multiple days).
                  // excludeIds is enforced inside the RPC itself (see searchServices.ts /
                  // search_available_services), so a used id is structurally absent from what
                  // this day's call can even see -- not just discouraged. As a side effect this
                  // also surfaces the "next best" services once the original top-N pool from
                  // before the loop gets exhausted by earlier days.
                  let dayServicesContext = servicesContext;
                  let dayServicesById = servicesById;

                  if (usedServiceIds.size > 0) {
                    const excludeIds: string[] = Array.from(usedServiceIds);
                    const freshOutcome = await searchServices(supabase, {
                      ...activeSearchFilters,
                      excludeIds,
                    });

                    if (freshOutcome.success && freshOutcome.services.length > 0) {
                      dayServicesById = new Map(servicesById);
                      const newlyDiscovered: AIServiceSearchResult[] = [];
                      for (const svc of freshOutcome.services) {
                        if (!dayServicesById.has(svc.id)) newlyDiscovered.push(svc);
                        dayServicesById.set(svc.id, svc);
                      }
                      // The client's DICT: handler merges into its own map keyed by id (see
                      // SafronCoordinator.tsx), so sending another DICT: chunk here is additive,
                      // not a replacement -- safe even though the first DICT: chunk already went
                      // out before this loop started.
                      if (newlyDiscovered.length > 0) {
                        controller.enqueue(encoder.encode(`DICT:${JSON.stringify(newlyDiscovered)}\n`));
                      }
                      dayServicesContext = `REAL_SERVICES (use ONLY these IDs -- already-used services from earlier days have been removed from this list, everything here is guaranteed unused so far):\n${JSON.stringify(freshOutcome.services, null, 2)}`;
                    } else {
                      dayServicesContext = "No further distinct services are available beyond what's already been scheduled on earlier days -- keep this day lighter (fewer slots) rather than repeating an earlier service.";
                    }
                  }

                  const dayResult = await generateObject({
                    model: moonshot.chat("kimi-k3"),
                    schema: daySlotsSchema,
                    system: `${COORDINATOR_SYSTEM}\n\n${dayServicesContext}\n\n${packagesContext}\n\n${anchorContext}\n\nBuild ONLY Day ${day.day_number} ("${day.label}", in ${day.location}) of the itinerary already outlined below. Pick 2-3 REAL_SERVICES IDs for this day only, UNLESS the CRITICAL CONTEXT above says the user has an anchored package -- in that case pick only 1-2 filler services for this day, per THE ANCHOR RULE. Apply THE TIME MATH RULE, THE GEOFENCE RULE (every service picked must be in or near ${day.location} -- do not pick a service from a different city/district), and THE GASTRONOMY RULE (include a nearby lunch and/or dinner "food"/"dining"-category service at a realistic time, logically following the activity right before it) from the CRITICAL PLANNING ALGORITHM above.\n\nFULL OUTLINE (for context only, do not regenerate other days):\n${JSON.stringify(outline)}`,
                    messages,
                  });

                  let parsedSlots: Array<{ service_id: string; time: string }> = [];
                  try {
                    parsedSlots = typeof dayResult.object.slots_json === "string"
                      ? JSON.parse(dayResult.object.slots_json)
                      : [];
                  } catch { parsedSlots = []; }

                  const validSlots = parsedSlots.filter(s => dayServicesById.has(s.service_id));
                  if (validSlots.length > 0) {
                    for (const s of validSlots) usedServiceIds.add(s.service_id);
                    controller.enqueue(encoder.encode(`DAY:${JSON.stringify({ ...day, slots: validSlots })}\n`));
                  }
                } catch (dayError: any) {
                  // One day's generation failing shouldn't take down the rest of the stream --
                  // log and move on to the next day, same as how a day with zero valid slots
                  // was already silently dropped before this change.
                  console.error(`Day ${day.day_number} generation failed:`, dayError?.message);
                }
              }
            } else if (servicesArray.length > 0) {
              // 6. Fallback: outline came back empty but we have services -- auto-build days.
              //    Synchronous chunking, not LLM-generated, so no reason to slow this down.
              const slotTimes = ["09:00", "13:00", "17:00"];
              const chunkSize = 2;
              for (let i = 0; i < Math.min(servicesArray.length, 6); i += chunkSize) {
                const chunk = servicesArray.slice(i, i + chunkSize);
                const dayNum = Math.floor(i / chunkSize) + 1;
                const fallbackDay = {
                  day_number: dayNum,
                  label: "Suggested Experiences",
                  location: chunk[0]?.city || chunk[0]?.region || "Uzbekistan",
                  slots: chunk.map((svc, si) => ({ service_id: svc.id, time: slotTimes[si] || "09:00" })),
                };
                controller.enqueue(encoder.encode(`DAY:${JSON.stringify(fallbackDay)}\n`));
              }
            }
          } catch (e: any) {
            controller.enqueue(encoder.encode(`ERROR:${JSON.stringify(e.message)}\n`));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    } catch (apiError: any) {
      console.error("Plan Trip API Error:", { message: apiError?.message, cause: apiError?.cause });
      return NextResponse.json({ success: false, error: "Travel coordinator unavailable", detail: apiError?.message }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Plan Trip Outer Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
