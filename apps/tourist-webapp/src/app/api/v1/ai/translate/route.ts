import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Initialize OpenAI client for Moonshot
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

// 60 requests per 1 hour
const hourlyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:translate:hourly",
    })
  : null;

// 500 requests per 1 day
const dailyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 d"),
      analytics: true,
      prefix: "ratelimit:ai:translate:daily",
    })
  : null;

// Simple In-Memory Rate Limiter Fallback
type RateLimitInfo = { hourlyCount: number; dailyCount: number; hourlyReset: number; dailyReset: number; };
const rateLimitMap = new Map<string, RateLimitInfo>();
const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 500;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function checkInMemoryRateLimit(userId: string) {
  const now = Date.now();
  let info = rateLimitMap.get(userId);
  if (!info) {
    info = { hourlyCount: 0, dailyCount: 0, hourlyReset: now + HOUR_MS, dailyReset: now + DAY_MS };
  }
  if (now > info.hourlyReset) { info.hourlyCount = 0; info.hourlyReset = now + HOUR_MS; }
  if (now > info.dailyReset) { info.dailyCount = 0; info.dailyReset = now + DAY_MS; }

  if (info.hourlyCount >= HOURLY_LIMIT) return { success: false, error: "Hourly rate limit exceeded", limit: HOURLY_LIMIT, reset: info.hourlyReset };
  if (info.dailyCount >= DAILY_LIMIT) return { success: false, error: "Daily rate limit exceeded", limit: DAILY_LIMIT, reset: info.dailyReset };

  info.hourlyCount++;
  info.dailyCount++;
  rateLimitMap.set(userId, info);
  return { success: true };
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Use user ID if logged in, otherwise fallback to IP address for rate limiting
    const userId = user?.id || req.headers.get("x-forwarded-for") || "anonymous_user";

    // Strict Rate Limiting Enforcement
    if (redis) {
      // Enforce daily limit first
      const { success: dailySuccess, reset: dailyReset } = await dailyRateLimit!.limit(userId);
      if (!dailySuccess) {
        return NextResponse.json({ success: false, error: "Daily rate limit exceeded" }, { status: 429, headers: { "X-RateLimit-Limit": "500", "X-RateLimit-Reset": dailyReset.toString() } });
      }

      // Enforce hourly limit
      const { success: hourlySuccess, reset: hourlyReset } = await hourlyRateLimit!.limit(userId);
      if (!hourlySuccess) {
        return NextResponse.json({ success: false, error: "Hourly rate limit exceeded" }, { status: 429, headers: { "X-RateLimit-Limit": "60", "X-RateLimit-Reset": hourlyReset.toString() } });
      }
    } else {
      const rlCheck = checkInMemoryRateLimit(userId);
      if (!rlCheck.success) {
        return NextResponse.json({ success: false, error: rlCheck.error }, { status: 429, headers: { "X-RateLimit-Limit": rlCheck.limit!.toString(), "X-RateLimit-Reset": rlCheck.reset!.toString() } });
      }
    }

    const body = await req.json();
    const { text, context_situation, target_language } = body;

    if (!text || !context_situation || !target_language) {
      return NextResponse.json({ success: false, error: "Missing required fields: text, context_situation, target_language" }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
       console.error("MOONSHOT_API_KEY is missing");
       return NextResponse.json({ success: false, error: "Translation service unavailable" }, { status: 503 });
    }

    const systemPrompt = `You are a culturally aware digital translator in Uzbekistan. Translate the input text to the target language based on the provided travel context. Do not translate literally; instead, provide a culturally polite, natural translation. Add a short, friendly 'Culture Tip' (maximum 1 sentence) explaining any local etiquette related to this situation.`;
    const userPrompt = `Context: ${context_situation}\nTarget Language: ${target_language}\n\nText to translate:\n"${text}"`;

    try {
      const result = await generateText({
        model: moonshot.chat("kimi-k3"),
        system: systemPrompt,
        prompt: userPrompt,
      });

      return NextResponse.json({ success: true, translation: result.text });
    } catch (apiError: any) {
      console.error("Moonshot API Error:", apiError);
      return NextResponse.json({ success: false, error: "Translation service unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
