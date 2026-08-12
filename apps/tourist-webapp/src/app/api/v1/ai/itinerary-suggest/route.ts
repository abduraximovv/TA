import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, jsonSchema } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { ItinerarySuggestResponse } from "@repo/types";

// Full-itinerary generation with kimi-k3 measured at 60-170+ seconds in testing (structured,
// schema-constrained output for a multi-day nested plan is slow regardless of trip length) --
// well past most serverless platforms' default function timeout. Vercel's Hobby plan caps
// functions at 10s regardless of this setting; Pro/Enterprise (or Fluid Compute) can honor it,
// but the project's actual plan needs to support it or this will hard-fail in production.
export const maxDuration = 300;

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

// 10 requests per 1 hour -- a full itinerary generation is the most expensive AI call on the
// platform (long system prompt + provider catalog + structured output), hence the tight cap.
const hourlyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:itinerary-suggest:hourly",
    })
  : null;

// Simple in-memory rate limiter fallback for local dev / when Redis isn't configured
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

const MAX_DAYS = 21;
const MAX_INTERESTS = 10;

// Real region/city names for the "Hidden Uzbekistan" destinations named in the PRD -- used to
// pull actual partner listings (if any exist yet) into the prompt so routing is grounded in
// real, bookable services rather than Kimi inventing plausible-sounding but fictional ones.
const HIDDEN_UZBEKISTAN_REGIONS = ["Nurata", "Gijduvan", "Zaamin", "Sentob", "Yangiabad"];

const SCAN_SCHEMA = jsonSchema<ItinerarySuggestResponse>({
  type: "object",
  properties: {
    total_estimated_cost: { type: "number" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day_number: { type: "number" },
          theme: { type: "string" },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", description: "e.g. '09:00'" },
                title: { type: "string" },
                description: { type: "string" },
                location_name: { type: "string" },
                estimated_cost: { type: "number", description: "USD" },
              },
              required: ["time", "title", "description", "location_name", "estimated_cost"],
            },
          },
        },
        required: ["day_number", "theme", "activities"],
      },
    },
  },
  required: ["total_estimated_cost", "days"],
});

function buildSystemPrompt(days: number, budgetUsd: number, startDate: string, interests: string[], catalog: string) {
  return `You are an elite, sustainable travel designer in Uzbekistan. Generate a highly detailed, day-by-day travel plan for ${days} days with a total budget of $${budgetUsd} starting on ${startDate}.

Match the tourist's interests: ${interests.join(", ")}.

CRITICAL BUSINESS RULE: You must design a decentralized itinerary. Actively divert the user from overcrowded tourist traps in Tashkent and Samarkand. Instead, route them to "Hidden Uzbekistan" experiences:
- Stay at authentic family-run yurt camps in the Nurata Desert.
- Participate in traditional ceramics masterclasses with local artisans in Gijduvan.
- Go trekking and stay at mountain homestays in Zaamin.

${catalog}

Every activity needs a realistic estimated_cost in USD, and the day's activities should keep the trip within the total budget. Never invent a partner provider's name if a real one from the catalog above fits -- only invent a plausible generic one (e.g. "a family-run guesthouse") when nothing in the catalog matches.`;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // A generated itinerary is meaningless without an owner to save it against, and this is the
    // most expensive AI call on the platform -- no anonymous fallback, same as the menu scanner.
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to plan an itinerary" }, { status: 401 });
    }

    // Strict Rate Limiting Enforcement -- 10 requests / hour
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
    const days = Number(body?.days);
    const budgetUsd = Number(body?.budget_usd);
    const interests = Array.isArray(body?.interests)
      ? body.interests.filter((i: unknown): i is string => typeof i === "string" && i.trim().length > 0).slice(0, MAX_INTERESTS)
      : [];
    const startDate = typeof body?.start_date === "string" ? body.start_date.trim() : "";

    if (!Number.isFinite(days) || days < 1 || days > MAX_DAYS) {
      return NextResponse.json({ success: false, error: `days must be a number between 1 and ${MAX_DAYS}` }, { status: 400 });
    }
    if (!Number.isFinite(budgetUsd) || budgetUsd <= 0) {
      return NextResponse.json({ success: false, error: "budget_usd must be a positive number" }, { status: 400 });
    }
    if (interests.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required field: interests" }, { status: 400 });
    }
    if (!startDate || Number.isNaN(Date.parse(startDate))) {
      return NextResponse.json({ success: false, error: "start_date must be a valid date" }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is missing");
      return NextResponse.json({ success: false, error: "Itinerary planner unavailable" }, { status: 503 });
    }

    // Context injection: real partner services in the Hidden Uzbekistan regions, so the model
    // routes to actual bookable listings instead of only inventing plausible-sounding ones.
    let catalog = "No specific partner listings are available yet -- recommend authentic, realistic experiences by name and region instead.";
    try {
      const { data: ruralServices } = await supabase
        .from("services")
        .select("title, category, city, region, price, currency")
        .or(HIDDEN_UZBEKISTAN_REGIONS.map((r) => `city.ilike.%${r}%,region.ilike.%${r}%`).join(","))
        .limit(20);

      if (ruralServices && ruralServices.length > 0) {
        const lines = ruralServices
          .map((s: any) => `- ${s.title} (${s.category}, ${[s.city, s.region].filter(Boolean).join(", ")}) -- ${s.price} ${s.currency}`)
          .join("\n");
        catalog = `Real partner rural providers available to route this tourist to (prefer these when they fit):\n${lines}`;
      }
    } catch (catalogError) {
      console.error("Failed to load rural provider catalog:", catalogError);
    }

    try {
      const result = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: SCAN_SCHEMA,
        system: buildSystemPrompt(days, budgetUsd, startDate, interests, catalog),
        prompt: "Generate the itinerary now.",
      });

      return NextResponse.json({ success: true, ...result.object });
    } catch (apiError: any) {
      console.error("Moonshot Itinerary API Error:", apiError);
      return NextResponse.json({ success: false, error: "Itinerary planner unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Itinerary Suggest API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
