import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, jsonSchema } from "ai";
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

// 20 requests per 1 hour -- vision calls cost more than plain chat, so a tighter cap
const hourlyRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai:scan-menu:hourly",
    })
  : null;

// Simple in-memory rate limiter fallback for local dev / when Redis isn't configured
type RateLimitInfo = { hourlyCount: number; hourlyReset: number };
const rateLimitMap = new Map<string, RateLimitInfo>();
const HOURLY_LIMIT = 20;
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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_RESTRICTIONS = 10;

type DishResult = {
  original_text: string;
  translated_name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  warnings: string[];
  dietary_flags: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    gluten_free: boolean;
    nut_free: boolean;
  };
  price_original: string;
  price_usd_approx: number;
};

type ScanResult = {
  dishes: DishResult[];
  restaurant_notes: string;
  scan_confidence: number;
};

// Plain JSON Schema (not zod -- zod is only a transitive dep of `ai`, not a direct dependency
// here) describing the exact shape documented in API_SPECIFICATION.md §13.
const SCAN_SCHEMA = jsonSchema<ScanResult>({
  type: "object",
  properties: {
    dishes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original_text: { type: "string", description: "Dish name exactly as printed on the menu" },
          translated_name: { type: "string", description: "Natural English name/translation" },
          description: { type: "string", description: "1-2 sentences on traditional ingredients and preparation" },
          ingredients: { type: "array", items: { type: "string" } },
          allergens: {
            type: "array",
            items: { type: "string" },
            description: "e.g. nuts, dairy, gluten, egg, fish, shellfish, soy -- empty array if none apply",
          },
          warnings: {
            type: "array",
            items: { type: "string" },
            description: "Short plain-language warnings, especially for the traveler's stated dietary restrictions",
          },
          dietary_flags: {
            type: "object",
            properties: {
              vegetarian: { type: "boolean" },
              vegan: { type: "boolean" },
              halal: { type: "boolean" },
              gluten_free: { type: "boolean" },
              nut_free: { type: "boolean" },
            },
            required: ["vegetarian", "vegan", "halal", "gluten_free", "nut_free"],
          },
          price_original: { type: "string", description: "Price exactly as printed, e.g. '45,000'. Empty string if none visible." },
          price_usd_approx: { type: "number", description: "Rough USD estimate. 0 if no price is visible." },
        },
        required: [
          "original_text",
          "translated_name",
          "description",
          "ingredients",
          "allergens",
          "warnings",
          "dietary_flags",
          "price_original",
          "price_usd_approx",
        ],
      },
    },
    restaurant_notes: {
      type: "string",
      description: "1-2 sentences of practical context about this menu for the traveler's dietary restrictions",
    },
    scan_confidence: { type: "number", description: "0 to 1 -- confidence in the OCR/translation given image quality" },
  },
  required: ["dishes", "restaurant_notes", "scan_confidence"],
});

function buildSystemPrompt(dietaryRestrictions: string[]): string {
  const restrictionsText = dietaryRestrictions.length > 0 ? dietaryRestrictions.join(", ") : "none specified";
  return `You are an expert culinary guide specializing in Uzbekistan's traditional cuisine, helping a tourist read a restaurant menu photo (Cyrillic, Uzbek Latin, or Russian).

Identify every dish visible in the image and translate it, explain its traditional ingredients (e.g. Palov/Osh contains rice, beef or mutton, carrots, onions and cumin), and flag allergens.

The traveler's dietary restrictions: ${restrictionsText}. Pay special attention to these when writing "warnings" and the "dietary_flags" for each dish -- most traditional Uzbek meat dishes are halal by default; mark halal false only if the dish typically contains pork or alcohol.

Never invent a dish that isn't visible in the image. If the image isn't a readable menu, return an empty "dishes" array and explain why in "restaurant_notes".`;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unlike chat, the menu scanner needs an owning user for both the Storage upload (RLS is
    // scoped per-user-folder) and for the per-user rate limit -- no anonymous fallback here.
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to scan a menu" }, { status: 401 });
    }

    // Strict Rate Limiting Enforcement -- 20 requests / hour
    if (redis) {
      const { success, reset } = await hourlyRateLimit!.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Hourly rate limit exceeded" },
          { status: 429, headers: { "X-RateLimit-Limit": "20", "X-RateLimit-Reset": reset.toString() } }
        );
      }
    } else {
      const rlCheck = checkInMemoryRateLimit(user.id);
      if (!rlCheck.success) {
        return NextResponse.json(
          { success: false, error: "Hourly rate limit exceeded" },
          { status: 429, headers: { "X-RateLimit-Limit": HOURLY_LIMIT.toString(), "X-RateLimit-Reset": rlCheck.reset.toString() } }
        );
      }
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_IMAGE_BYTES * 1.5) {
      // *1.5 headroom for multipart boundaries/other fields -- the authoritative check is on
      // the parsed file below, this is just a cheap early reject.
      return NextResponse.json({ success: false, error: "Image too large (max 10 MB)" }, { status: 413 });
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const dietaryRestrictionsRaw = formData.getAll("dietary_restrictions");

    if (!(image instanceof File)) {
      return NextResponse.json({ success: false, error: "Missing required field: image" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(image.type)) {
      return NextResponse.json({ success: false, error: "Image must be JPEG or PNG" }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: "Image too large (max 10 MB)" }, { status: 413 });
    }

    const dietaryRestrictions = dietaryRestrictionsRaw
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .slice(0, MAX_RESTRICTIONS)
      .map((v) => v.trim());

    if (!process.env.MOONSHOT_API_KEY) {
      console.error("MOONSHOT_API_KEY is missing");
      return NextResponse.json({ success: false, error: "Menu scanner unavailable" }, { status: 503 });
    }

    const imageBytes = new Uint8Array(await image.arrayBuffer());

    // Best-effort persistence to private Storage (menu-scans/<user_id>/<uuid>.<ext>) -- doesn't
    // block the actual scan if it fails, same "don't let non-critical persistence break the
    // live feature" approach as chat history.
    const ext = image.type === "image/png" ? "png" : "jpg";
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("menu-scans").upload(storagePath, imageBytes, {
      contentType: image.type,
      upsert: false,
    });
    if (uploadError) console.error("Failed to save menu scan photo:", uploadError);

    try {
      const result = await generateObject({
        model: moonshot.chat("kimi-k3"),
        schema: SCAN_SCHEMA,
        system: buildSystemPrompt(dietaryRestrictions),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this Uzbek restaurant menu." },
              { type: "file", data: imageBytes, mediaType: image.type },
            ],
          },
        ],
      });

      return NextResponse.json({ success: true, ...result.object });
    } catch (apiError: any) {
      console.error("Moonshot Vision API Error:", apiError);
      return NextResponse.json({ success: false, error: "Menu scanner unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Scan Menu API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
