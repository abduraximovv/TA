export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  body: string | null;
  region: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  gallery_images: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
