import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Using standard supabase-js client to verify the JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    if (redis) {
      // Enforce daily limit first
      const { success: dailySuccess, reset: dailyReset } = await dailyRateLimit!.limit(userId);
      if (!dailySuccess) {
        return NextResponse.json(
          { success: false, error: "Daily rate limit exceeded" },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": "500",
              "X-RateLimit-Reset": dailyReset.toString(),
            },
          }
        );
      }

      // Enforce hourly limit
      const { success: hourlySuccess, reset: hourlyReset } = await hourlyRateLimit!.limit(userId);
      if (!hourlySuccess) {
        return NextResponse.json(
          { success: false, error: "Hourly rate limit exceeded" },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": "60",
              "X-RateLimit-Reset": hourlyReset.toString(),
            },
          }
        );
      }
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
       console.error("OPENAI_API_KEY is missing");
       return NextResponse.json(
         { success: false, error: "Translation service unavailable" },
         { status: 503 }
       );
    }

    const systemPrompt = `You are an expert Contextual Translator optimized for travel in Uzbekistan.
Your goal is to translate text or voice inputs between English and Uzbek/Russian.
When a user provides an input:
1. Translate it accurately. If it is in English, translate to Uzbek (and Russian if appropriate, or whichever fits the context). If it is in Uzbek/Russian, translate to English.
2. Provide "cultural context notes" when applicable. For example, if it's about bargaining, explain polite bargaining etiquette in Uzbekistan. If it mentions specific local ingredients (e.g., in a dietary restriction context), explain what they usually are.
3. Keep the output highly readable. Use this exact structure in plain text (since we are streaming):

TRANSLATION:
<the translated text>

CULTURAL NOTES:
<cultural notes or tips, if any. Otherwise say "None">`;

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
