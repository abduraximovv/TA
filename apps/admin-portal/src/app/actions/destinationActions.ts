"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface DestinationFormInput {
  name: string;
  region: string;
  description: string;
  body: string;
  image_url: string;
  hero_image_url: string;
  gallery_images: string[];
  is_featured: boolean;
  display_order: number;
}

export async function createDestination(input: DestinationFormInput) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin.from("destinations").insert({
    name: input.name,
    slug: slugify(input.name),
    region: input.region || null,
    description: input.description || null,
    body: input.body || null,
    image_url: input.image_url || null,
    hero_image_url: input.hero_image_url || null,
    gallery_images: input.gallery_images,
    is_featured: input.is_featured,
    display_order: input.display_order,
  });
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/destinations");
  return { success: true };
}

export async function updateDestination(id: string, input: DestinationFormInput) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from("destinations")
    .update({
      name: input.name,
      slug: slugify(input.name),
      region: input.region || null,
      description: input.description || null,
      body: input.body || null,
      image_url: input.image_url || null,
      hero_image_url: input.hero_image_url || null,
      gallery_images: input.gallery_images,
      is_featured: input.is_featured,
      display_order: input.display_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/destinations");
  return { success: true };
}

export async function deleteDestination(id: string) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin.from("destinations").delete().eq("id", id);
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/destinations");
  return { success: true };
}
