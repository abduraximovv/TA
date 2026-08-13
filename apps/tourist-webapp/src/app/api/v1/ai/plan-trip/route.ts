import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, jsonSchema } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { searchServices } from "@/lib/ai/searchServices";
import type { AIServiceSearchResult, PlanTripMessage, PlanTripResponse } from "@repo/types";

// The second Kimi call below is a small schema (reply_text + a handful of IDs), so this is
// nowhere near itinerary-suggest's 60-170s -- but kept generous for the same reason.
export const maxDuration = 120;

// Initialize OpenAI-compatible client for Moonshot (Kimi)
const moonshot = createOpenAI({
  baseURL: "https://api.moonshot.ai/v1",
  apiKey: process.env.MOONSHOT_API_KEY,
});

// Optional: Upstash Redis Rate Limiting
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// 10 requests per 1 hour -- two Kimi calls per request (intent extraction + final reply), same
// cap as the itinerary generator.
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
  if (!info) {
    info = { hourlyCount: 0, hourlyReset: now + HOUR_MS };
  }
  if (now > info.hourlyReset) {
    info.hourlyCount = 0;
    info.hourlyReset = now + HOUR_MS;
  }
  if (info.hourlyCount >= HOURLY_LIMIT) {
    return { success: false, reset: info.hourlyReset };
  }
  info.hourlyCount++;
  rateLimitMap.set(userId, info);
  return { success: true, reset: info.hourlyReset };
}

const MAX_MESSAGES = 20;

// Real category values on the live `services` table -- category is free text, not an enum, so
// grounding Kimi's guess against the actual set (rather than letting it invent e.g. "pottery")
// is what makes the downstream exact-match search actually find anything.
const KNOWN_CATEGORIES = ["masterclass", "tour", "food", "bazaar", "adventure", "stay", "nature"];

const intentSchema = jsonSchema<{
  ready_to_search: boolean;
  category: string | null;
  region: string | null;
  max_price_uzs: number | null;
  travel_date: string | null;
  guest_count: number | null;
}>({
  type: "object",
  properties: {
    ready_to_search: {
      type: "boolean",
      description: "True only if the tourist has expressed a specific, concrete preference worth searching real inventory for -- not just a greeting or vague interest.",
    },
    category: {
      type: "string",
      description: `One of exactly: ${KNOWN_CATEGORIES.join(", ")} -- or empty string if none clearly matches.`,
    },
    region: { type: "string", description: "A region or city name if mentioned, else empty string." },
    max_price_uzs: {
      type: "number",
      description: "Maximum budget in UZS. Convert USD to UZS at roughly 12600 UZS/USD if the tourist gave a USD figure. 0 if no budget mentioned.",
    },
    travel_date: {
      type: "string",
      description: "The tourist's travel date as YYYY-MM-DD if they gave one, exact or relative (resolve 'next Friday' etc. against TODAY given below). Empty string if no date was mentioned.",
    },
    guest_count: {
      type: "number",
      description: "Number of travelers mentioned (e.g. 'for 2 of us' -> 2). 0 if not mentioned.",
    },
  },
  required: ["ready_to_search", "category", "region", "max_price_uzs", "travel_date", "guest_count"],
});

const replySchema = jsonSchema<{ reply_text: string; recommended_services: string[] }>({
  type: "object",
  properties: {
    reply_text: { type: "string", description: "The conversational reply to show the tourist, in the language they've been writing in." },
    recommended_services: {
      type: "array",
      items: { type: "string" },
      description: "IDs of services from the provided REAL_SERVICES context that best match what the tourist asked for. Empty array if none fit or none were provided.",
    },
  },
  required: ["reply_text", "recommended_services"],
});

function normalizeTravelDate(raw: string | null | undefined): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : raw;
}

function normalizeGuestCount(raw: number | null | undefined): number {
  if (!raw || !Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.floor(raw), 50);
}

const COORDINATOR_SYSTEM_PROMPT = `You are the official Safron AI Travel Coordinator in the Compass tool. Converse politely with the tourist in their language.

Ask them about:
- Dates of travel
- Budget in USD or UZS
- Primary interests (Culture, Nature, Food, Masterclasses)

Once you have their preference, recommend only from the provided list of REAL database services. Never hallucinate non-existing guesthouses or tours -- if nothing in the provided list fits, say so honestly and ask a clarifying question instead of inventing an option.`;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Compass already gates opening at all behind sign-in (same as search-services), so this
    // should never actually fire in normal use -- kept as a real guard, not just UI trust.
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to plan a trip" }, { status: 401 });
    }

    if (redis) {
      const { success, reset } = await hourlyRateLimit!.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "RATE_LIMITED" },
          { status: 429, headers: { "X-RateLimit-Limit": "10", "X-RateLimit-Reset": reset.toString() } }
        );
      }
    } else {
      const rlCheck = checkInMemoryRateLimit(user.id);
      if (!rlCheck.success) {
        return NextResponse.json(
          { success: false, error: "RATE_LIMITED" },
          { status: 429, headers: { "X-RateLimit-Limit": HOURLY_LIMIT.toString(), "X-RateLimit-Reset": rlCheck.reset.toString() } }
        );
      }
    }

    const body = await req.json();
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required field: messages" }, { status: 400 });
    }

    const messages: PlanTripMessage[] = rawMessages
      .filter(
        (m: any): m is PlanTripMessage =>
          m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0
      )
      .slice(-MAX_MESSAGES)
      .map((m: any) => ({ role: m.role, content: m.content.trim() }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ success: false, error: "The last message must be from the user" }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is missing");
      return NextResponse.json({ success: false, error: "Travel coordinator unavailable" }, { status: 503 });
    }

    try {
      // Pass 1: does this conversation have enough to search real inventory on yet? Also pulls
      // out travel_date/guest_count so the Compass can offer true one-click booking when the
      // tourist already gave them, instead of always stopping to ask.
      const today = new Date().toISOString().slice(0, 10);
      const intent = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: intentSchema,
        system: `You analyze a tourist's conversation with a Uzbekistan travel coordinator and extract search intent. Only set ready_to_search true once they've given something concrete (an activity type, a place, or a budget) -- not for a bare greeting. TODAY is ${today} -- resolve relative dates ("next Friday", "in two weeks") against it.`,
        messages,
      });

      let servicesContext = "No search has been run yet -- ask the tourist for more detail before recommending anything.";
      const searchedServicesById = new Map<string, AIServiceSearchResult>();

      if (intent.object.ready_to_search) {
        const category = KNOWN_CATEGORIES.includes(intent.object.category ?? "") ? intent.object.category : null;
        const outcome = await searchServices(supabase, {
          category,
          region: intent.object.region || null,
          maxPrice: intent.object.max_price_uzs || null,
        });

        if (outcome.success && outcome.services.length > 0) {
          for (const service of outcome.services) searchedServicesById.set(service.id, service);
          servicesContext = `REAL_SERVICES (only recommend from these, by id):\n${JSON.stringify(outcome.services, null, 2)}`;
        } else {
          servicesContext =
            "The search for the tourist's stated preference returned no real matches. Say so honestly and ask a clarifying question or suggest they broaden their criteria -- do not invent a service.";
        }
      }

      // Pass 2: the actual reply, grounded in whatever real inventory (if any) pass 1 found.
      const result = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: replySchema,
        system: `${COORDINATOR_SYSTEM_PROMPT}\n\n${servicesContext}`,
        messages,
      });

      // Defense in depth against hallucinated IDs, per the system prompt's own "never
      // hallucinate" requirement -- don't just trust the model kept to the provided list. Mapping
      // back to full rows here (rather than returning bare ids) is what lets the Compass render
      // recommendation cards without a second round-trip.
      const recommended_services = result.object.recommended_services
        .filter((id) => searchedServicesById.has(id))
        .map((id) => searchedServicesById.get(id)!);

      const response: PlanTripResponse = {
        reply_text: result.object.reply_text,
        recommended_services,
        travel_date: normalizeTravelDate(intent.object.travel_date),
        guest_count: normalizeGuestCount(intent.object.guest_count),
      };

      return NextResponse.json({ success: true, ...response });
    } catch (apiError: any) {
      console.error("Moonshot Plan Trip API Error:", apiError);
      return NextResponse.json({ success: false, error: "Travel coordinator unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Plan Trip API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
