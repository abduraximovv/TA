import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

// 60 requests per 1 hour
const hourlyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:chat:hourly",
    })
  : null;

// Simple in-memory rate limiter fallback for local dev / when Redis isn't configured
type RateLimitInfo = { hourlyCount: number; hourlyReset: number };
const rateLimitMap = new Map<string, RateLimitInfo>();
const HOURLY_LIMIT = 60;
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

const SYSTEM_PROMPT = `You are Kimi, the AI travel assistant built into Safron, a digital tourism platform for Uzbekistan. You help international tourists with: real-time translation between Uzbek, Russian and English with cultural context; understanding local food, ingredients and dietary restrictions; bargaining and etiquette at bazaars; safety and emergency guidance; and day-by-day itinerary ideas across Samarkand, Bukhara, Khiva, Tashkent and beyond.

Be warm, concise and practical — like a knowledgeable local friend, not a generic chatbot. When asked to translate, give the phrase plus a short cultural tip if relevant. If you don't have a verified, specific fact (an exact address, phone number, or opening hours), say so plainly instead of guessing, and suggest how the traveler can verify it locally. Keep replies short enough to read comfortably on a phone screen unless the traveler asks for more detail.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

// Bounds prompt size/cost per ADR-006 mitigation (token budgets) -- only the most recent turns
// are needed for a coherent reply.
const MAX_HISTORY = 20;

function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m: any): m is ChatMessage =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY)
    .map((m: any) => ({ role: m.role, content: m.content.trim() }));
}

// GET /api/v1/ai/chat -- the signed-in tourist's saved conversation, oldest first. Anonymous
// visitors (and any DB hiccup) just get an empty list back rather than an error, so the chat
// page can fall back to the static greeting -- "fail secure" per SECURITY_AND_COMPLIANCE.md §1.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, messages: [] });
    }

    // LIMIT after ORDER BY created_at DESC keeps the most *recent* 50 rows; reversed afterwards
    // back into chronological order for display.
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to load chat history:", error);
      return NextResponse.json({ success: true, messages: [] });
    }

    return NextResponse.json({ success: true, messages: [...(data ?? [])].reverse() });
  } catch (error: any) {
    console.error("Chat History API Error:", error);
    return NextResponse.json({ success: true, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Use user ID if logged in, otherwise fall back to IP address for rate limiting
    const userId = user?.id || req.headers.get("x-forwarded-for") || "anonymous_user";

    // Strict Rate Limiting Enforcement -- 60 requests / hour
    if (redis) {
      const { success, reset } = await hourlyRateLimit!.limit(userId);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Hourly rate limit exceeded" },
          { status: 429, headers: { "X-RateLimit-Limit": "60", "X-RateLimit-Reset": reset.toString() } }
        );
      }
    } else {
      const rlCheck = checkInMemoryRateLimit(userId);
      if (!rlCheck.success) {
        return NextResponse.json(
          { success: false, error: "Hourly rate limit exceeded" },
          { status: 429, headers: { "X-RateLimit-Limit": HOURLY_LIMIT.toString(), "X-RateLimit-Reset": rlCheck.reset.toString() } }
        );
      }
    }

    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ success: false, error: "Missing required field: content" }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is missing");
      return NextResponse.json({ success: false, error: "Chat service unavailable" }, { status: 503 });
    }

    // Conversation memory: signed-in tourists get it from their saved history in Supabase (the
    // client can't spoof extra turns into context that way). Anonymous visitors have no saved
    // history, so we fall back to whatever the client sent -- keeps multi-turn context working
    // for guests exactly as it did before persistence existed.
    let priorHistory: ChatMessage[] = [];

    if (user) {
      const { data: historyRows, error: historyErr } = await supabase
        .from("ai_chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(MAX_HISTORY);

      if (historyErr) {
        console.error("Failed to load chat history for context:", historyErr);
      } else {
        priorHistory = [...(historyRows ?? [])].reverse() as ChatMessage[];
      }

      const { error: insertErr } = await supabase
        .from("ai_chat_messages")
        .insert({ user_id: user.id, role: "user", content });
      if (insertErr) console.error("Failed to save user chat message:", insertErr);
    } else {
      priorHistory = sanitizeHistory(body?.history);
    }

    const messages: ChatMessage[] = [...priorHistory, { role: "user", content }];

    try {
      const result = await generateText({
        model: moonshot.chat("kimi-k3"),
        system: SYSTEM_PROMPT,
        messages,
      });

      if (user) {
        const { error: insertReplyErr } = await supabase
          .from("ai_chat_messages")
          .insert({ user_id: user.id, role: "assistant", content: result.text });
        if (insertReplyErr) console.error("Failed to save assistant chat message:", insertReplyErr);
      }

      return NextResponse.json({ success: true, reply: result.text });
    } catch (apiError: any) {
      console.error("Moonshot API Error:", apiError);
      return NextResponse.json({ success: false, error: "Chat service unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
