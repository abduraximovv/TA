// Consolidated mock-data seed for the server Supabase project. Replaces the older scattered
// seed-users.js / seed-admin.js / seed-stage2.mjs / seed-more-tours.js scripts, which only ever
// created one account per role. Safe to re-run at any time: it deletes its own *@ta-demo.uz
// accounts (clearing dependent rows in bookings/reviews/itineraries/etc. first, since most of
// those FKs to auth.users aren't ON DELETE CASCADE -- see deleteDependentRows()) and the known
// demo destinations before recreating everything from scratch, then seeds providers+services,
// agencies+packages, destinations+opinions, and a few completed bookings+reviews for realism.
//
// Usage: node packages/database/scripts/seed-full.mjs   (run from repo root; reads root ./.env)
// Also runnable via: pnpm db:seed

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", "..", "..", ".env");
const env = {};
fs.readFileSync(envPath, "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  });

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const DEMO_PASSWORD = "Demo12345!";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const PROVIDERS = [
  {
    email: "provider1@ta-demo.uz",
    full_name: "Rustam Yusupov",
    business_name: "Samarkand Craft Trails",
    services: [
      {
        title: "Traditional Tandir Bread Baking",
        description: "Learn to bake traditional Uzbek bread in a clay tandir oven with a master baker. Includes hands-on practice and fresh bread to take home.",
        category: "masterclass",
        price: 150000,
        duration_minutes: 120,
        max_guests: 8,
        city: "Samarkand",
        region: "Samarkand Region",
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.8,
        rating_count: 24,
      },
      {
        title: "Registan Square Sunset Walking Tour",
        description: "A guided evening walk through Samarkand's Registan ensemble, with stories of the Timurid empire as the madrasas light up.",
        category: "tour",
        price: 120000,
        duration_minutes: 150,
        max_guests: 12,
        city: "Samarkand",
        region: "Samarkand Region",
        image_url: "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.7,
        rating_count: 31,
      },
      {
        title: "Silk Paper Making Workshop",
        description: "Hand-make paper the traditional way at a working silk paper mill, using centuries-old mulberry-bark techniques.",
        category: "masterclass",
        price: 95000,
        duration_minutes: 90,
        max_guests: 10,
        city: "Samarkand",
        region: "Samarkand Region",
        image_url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.6,
        rating_count: 9,
      },
    ],
  },
  {
    email: "provider2@ta-demo.uz",
    full_name: "Aziza Karimova",
    business_name: "Rishtan Ceramics House",
    services: [
      {
        title: "Ceramic Workshop with a Master Potter",
        description: "Hand-throw and paint your own piece of Rishtan ceramics under the guidance of a fourth-generation master potter.",
        category: "masterclass",
        price: 95000,
        duration_minutes: 150,
        max_guests: 6,
        city: "Rishtan",
        region: "Fergana Valley",
        image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.9,
        rating_count: 18,
      },
      {
        title: "Fergana Valley Family Dining Experience",
        description: "Share a home-cooked plov feast with a local family, followed by tea and traditional sweets in their courtyard.",
        category: "food",
        price: 140000,
        duration_minutes: 120,
        max_guests: 10,
        city: "Fergana",
        region: "Fergana Valley",
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.8,
        rating_count: 14,
      },
    ],
  },
  {
    email: "provider3@ta-demo.uz",
    full_name: "Dilshod Nazarov",
    business_name: "Nurata Desert Camps",
    services: [
      {
        title: "Desert Camel Riding Experience",
        description: "A camel trek through the Kyzylkum Desert dunes with a local guide, ending with a traditional tea ceremony at camp.",
        category: "adventure",
        price: 300000,
        duration_minutes: 120,
        max_guests: 6,
        city: "Nurata",
        region: "Navoi Region",
        image_url: "https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.9,
        rating_count: 27,
      },
      {
        title: "Yurt Stay Under the Stars",
        description: "Overnight in a traditional yurt camp on the edge of the Kyzylkum Desert, with dinner by the fire and stargazing.",
        category: "stay",
        price: 180000,
        duration_minutes: 720,
        max_guests: 4,
        city: "Nurata",
        region: "Navoi Region",
        image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.7,
        rating_count: 21,
      },
      {
        title: "Lake Aydarkul Sunrise Kayaking",
        description: "Paddle out onto Lake Aydarkul at dawn, when the desert lake is calmest and the birdlife is most active.",
        category: "adventure",
        price: 110000,
        duration_minutes: 90,
        max_guests: 8,
        city: "Nurata",
        region: "Navoi Region",
        image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.5,
        rating_count: 6,
      },
    ],
  },
  {
    email: "provider4@ta-demo.uz",
    full_name: "Malika Tursunova",
    business_name: "Chimgan Highland Guides",
    services: [
      {
        title: "Guided Mountain Trekking",
        description: "A half-day guided trek through the Chimgan Highlands, with panoramic views over the Chatkal mountain range.",
        category: "adventure",
        price: 220000,
        duration_minutes: 240,
        max_guests: 10,
        city: "Chimgan",
        region: "Tashkent Region",
        image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.8,
        rating_count: 19,
      },
      {
        title: "Chimgan Cable Car & Picnic",
        description: "Ride the cable car up Kumbel Peak and enjoy a packed mountain picnic with sweeping valley views.",
        category: "tour",
        price: 90000,
        duration_minutes: 180,
        max_guests: 15,
        city: "Chimgan",
        region: "Tashkent Region",
        image_url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.4,
        rating_count: 11,
      },
      {
        title: "Extreme Chimgan Heliskiing",
        description: "Experience untouched powder in the Tien Shan mountains, with helicopter drops onto the slopes and expert guides.",
        category: "adventure",
        price: 4500000,
        duration_minutes: 360,
        max_guests: 4,
        city: "Chimgan",
        region: "Tashkent Region",
        image_url: "https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.95,
        rating_count: 12,
      },
    ],
  },
  {
    email: "provider5@ta-demo.uz",
    full_name: "Bahodir Ergashev",
    business_name: "Khiva Heritage Walks",
    services: [
      {
        title: "Ichan-Kala Old Town Guided Tour",
        description: "Walk the walled inner city of Khiva with a local historian, from the Kalta Minor minaret to the Kunya-Ark fortress.",
        category: "tour",
        price: 130000,
        duration_minutes: 180,
        max_guests: 12,
        city: "Khiva",
        region: "Khorezm Region",
        image_url: "https://images.unsplash.com/photo-1600100397608-f0d0f5eb1e8f?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.9,
        rating_count: 33,
      },
      {
        title: "Khorezm Carpet Weaving Demonstration",
        description: "Watch and try your hand at a traditional loom with local weavers, learning the patterns unique to Khorezm.",
        category: "masterclass",
        price: 80000,
        duration_minutes: 90,
        max_guests: 8,
        city: "Khiva",
        region: "Khorezm Region",
        image_url: "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.6,
        rating_count: 7,
      },
      {
        title: "Khiva Ancient Walls Evening Walk",
        description: "Walk the illuminated 10-meter high mud walls of Ichan-Kala after dark, tracing the footsteps of the Khans.",
        category: "tour",
        price: 100000,
        duration_minutes: 90,
        max_guests: 15,
        city: "Khiva",
        region: "Khorezm Region",
        image_url: "https://images.unsplash.com/photo-1590080875897-6f26e981d28c?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.88,
        rating_count: 45,
      },
    ],
  },
  {
    email: "provider6@ta-demo.uz",
    full_name: "Aziz Rahimov",
    business_name: "Heritage & Nature Trails",
    services: [
      {
        title: "Bukhara Culinary Masterclass: Somsa & Shashlik",
        description: "Learn to bake traditional Bukharian somsa in a real tandoor oven, followed by a shashlik feast in a courtyard kitchen.",
        category: "food",
        price: 250000,
        duration_minutes: 180,
        max_guests: 10,
        city: "Bukhara",
        region: "Bukhara Region",
        image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200",
        is_featured: true,
        rating_avg: 4.92,
        rating_count: 88,
      },
      {
        title: "Zaamin National Park Hiking & Camping",
        description: "Discover the 'Uzbek Switzerland' — hike through dense juniper forests and camp under the stars in Zaamin National Park.",
        category: "adventure",
        price: 500000,
        duration_minutes: 1440,
        max_guests: 8,
        city: "Zaamin",
        region: "Jizzakh Region",
        image_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1200",
        is_featured: false,
        rating_avg: 4.85,
        rating_count: 24,
      },
    ],
  },
];

const AGENCIES = [
  {
    email: "agency1@ta-demo.uz",
    full_name: "Nodira Aliyeva",
    business_name: "Silk Road Journeys",
    itineraries: [
      {
        title: "Classic Silk Road, 7 Days",
        description: "Tashkent, Samarkand, Bukhara, and Khiva in one seamless route through Uzbekistan's Silk Road heartland.",
        start_date: "2026-09-01",
        end_date: "2026-09-07",
        total_price: 4500000,
        items: [
          { serviceTitle: "Registan Square Sunset Walking Tour", sort_order: 1 },
          { serviceTitle: "Traditional Tandir Bread Baking", sort_order: 2 },
          { serviceTitle: "Ichan-Kala Old Town Guided Tour", sort_order: 3 },
        ],
      },
      {
        title: "Desert & Caravanserais, 6 Days",
        description: "Kyzylkum desert crossings and ancient trade-route stopovers, from camel treks to starlit yurt camps.",
        start_date: "2026-10-05",
        end_date: "2026-10-10",
        total_price: 3800000,
        items: [
          { serviceTitle: "Desert Camel Riding Experience", sort_order: 1 },
          { serviceTitle: "Yurt Stay Under the Stars", sort_order: 2 },
          { serviceTitle: "Lake Aydarkul Sunrise Kayaking", sort_order: 3 },
        ],
      },
    ],
  },
  {
    email: "agency2@ta-demo.uz",
    full_name: "Sardor Yuldashev",
    business_name: "Mountains & Heritage Tours",
    itineraries: [
      {
        title: "Mountains & Monasteries, 5 Days",
        description: "Chimgan trekking paired with Silk Road heritage stops, mixing highland air with old-city history.",
        start_date: "2026-08-10",
        end_date: "2026-08-14",
        total_price: 3200000,
        items: [
          { serviceTitle: "Guided Mountain Trekking", sort_order: 1 },
          { serviceTitle: "Chimgan Cable Car & Picnic", sort_order: 2 },
          { serviceTitle: "Silk Paper Making Workshop", sort_order: 3 },
        ],
      },
      {
        title: "Fergana Valley Craft Route, 4 Days",
        description: "A slower-paced tour through the Fergana Valley's ceramics workshops and family dining rooms.",
        start_date: "2026-11-02",
        end_date: "2026-11-05",
        total_price: 2100000,
        items: [
          { serviceTitle: "Ceramic Workshop with a Master Potter", sort_order: 1 },
          { serviceTitle: "Fergana Valley Family Dining Experience", sort_order: 2 },
        ],
      },
    ],
  },
  {
    email: "agency3@ta-demo.uz",
    full_name: "Gulnora Rashidova",
    business_name: "Culinary Uzbekistan Co.",
    itineraries: [
      {
        title: "Culinary Uzbekistan, 4 Days",
        description: "Plov masterclasses, bazaars, and family dining rooms across three cities.",
        start_date: "2026-09-20",
        end_date: "2026-09-23",
        total_price: 2450000,
        items: [
          { serviceTitle: "Traditional Tandir Bread Baking", sort_order: 1 },
          { serviceTitle: "Fergana Valley Family Dining Experience", sort_order: 2 },
          { serviceTitle: "Khorezm Carpet Weaving Demonstration", sort_order: 3 },
        ],
      },
      {
        title: "Grand Uzbekistan Loop, 10 Days",
        description: "The complete route: Tashkent, Chimgan, Samarkand, Nurata, Bukhara, and Khiva.",
        start_date: "2026-10-15",
        end_date: "2026-10-25",
        total_price: 6900000,
        items: [
          { serviceTitle: "Chimgan Cable Car & Picnic", sort_order: 1 },
          { serviceTitle: "Registan Square Sunset Walking Tour", sort_order: 2 },
          { serviceTitle: "Desert Camel Riding Experience", sort_order: 3 },
          { serviceTitle: "Ichan-Kala Old Town Guided Tour", sort_order: 4 },
        ],
      },
    ],
  },
];

const TOURISTS = [
  { email: "tourist1@ta-demo.uz", full_name: "Emily Carter" },
  { email: "tourist2@ta-demo.uz", full_name: "James Whitfield" },
  { email: "tourist3@ta-demo.uz", full_name: "Sofia Martins" },
];

const ADMIN = { email: "admin@ta-demo.uz", full_name: "Platform Admin" };

const DESTINATIONS = [
  {
    name: "Samarkand",
    slug: "samarkand",
    region: "Samarkand Region",
    description: "The jewel of the Silk Road, home to the turquoise domes of Registan Square.",
    body: "Samarkand has drawn travelers along the Silk Road for over two thousand years. Its Registan Square, framed by three monumental madrasas, is one of the most photographed sights in Central Asia, but the city rewards slower exploration too: the Shah-i-Zinda necropolis, the Gur-e-Amir mausoleum, and the working silk paper mills just outside town. Mornings are best spent wandering the old quarter before the day-trip crowds arrive; evenings bring the Registan's light show and the smell of fresh non bread from neighborhood tandirs.",
    image_url: "https://images.unsplash.com/photo-1591901206811-cb341f9e6da8?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1591901206811-cb341f9e6da8?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=1200",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200",
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1200",
    ],
    is_featured: true,
    display_order: 1,
  },
  {
    name: "Bukhara",
    slug: "bukhara",
    region: "Bukhara Region",
    description: "A living museum-city of madrasas, minarets, and centuries-old trading domes.",
    body: "Unlike Samarkand's grand set-pieces, Bukhara's Old Town is dense and walkable, a maze of covered trading domes, hidden courtyards, and over a hundred protected monuments within a few square kilometers. The Kalyan Minaret has stood since 1127; the Lyab-i Hauz pool has been the social heart of the city since the 16th century. Come for the Ark Fortress and stay for the carpet workshops and the tea houses that spill out onto the square at dusk.",
    image_url: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?q=80&w=1200",
      "https://images.unsplash.com/photo-1600100397608-f0d0f5eb1e8f?q=80&w=1200",
    ],
    is_featured: true,
    display_order: 2,
  },
  {
    name: "Khiva",
    slug: "khiva",
    region: "Khorezm Region",
    description: "A fortified desert city where the entire walled inner town is a UNESCO site.",
    body: "Khiva's Ichan-Kala is the most complete example of a fortified Central Asian city, its mudbrick walls enclosing minarets, madrasas, and palaces largely unchanged since the 19th century. It's small enough to explore fully on foot in a day, but the light at sunrise and sunset over the Kalta Minor minaret is worth staying an extra night for. Just outside the walls, Khorezm's carpet weavers still work traditional looms passed down through generations.",
    image_url: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1591901206811-cb341f9e6da8?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?q=80&w=1200",
    ],
    is_featured: true,
    display_order: 3,
  },
  {
    name: "Tashkent",
    slug: "tashkent",
    region: "Tashkent",
    description: "Uzbekistan's modern capital, blending Soviet-era metro art with a rebuilt old town.",
    body: "Tashkent is where most journeys through Uzbekistan begin and end, and it's worth more than a layover. The Tashkent Metro doubles as an underground art gallery, each station themed around a different piece of the country's history. Chorsu Bazaar's blue-domed hall is one of the best places in the country to see Uzbek daily life up close, and the Museum of Applied Arts gives useful context before heading out to Samarkand or Bukhara.",
    image_url: "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200",
    ],
    is_featured: false,
    display_order: 4,
  },
  {
    name: "Nurata & the Kyzylkum Desert",
    slug: "nurata",
    region: "Navoi Region",
    description: "Desert camps, camel treks, and the surprising blue of man-made Lake Aydarkul.",
    body: "Nurata sits at the edge of the Kyzylkum Desert, historically a waypoint for caravans and pilgrims visiting the Nur-Ota spring. Today it's the easiest access point to yurt camps out on the desert steppe, where nights bring some of the clearest stargazing in the country. Lake Aydarkul, formed by an irrigation accident in the 1960s, now supports flamingos, pelicans, and a small fishing community alongside the tourist camps.",
    image_url: "https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200",
    ],
    is_featured: true,
    display_order: 5,
  },
  {
    name: "Chimgan Highlands",
    slug: "chimgan",
    region: "Tashkent Region",
    description: "Alpine trekking and cable cars an hour outside the capital.",
    body: "The Chatkal mountain range rises abruptly an hour east of Tashkent, and the Chimgan Highlands are the easiest escape from the capital's summer heat. A Soviet-era cable car still runs up Kumbel Peak, and hiking trails range from easy valley walks to multi-day treks toward Charvak Reservoir. Winter turns the same slopes into Uzbekistan's main ski resort.",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    ],
    is_featured: false,
    display_order: 6,
  },
  {
    name: "Fergana Valley",
    slug: "fergana-valley",
    region: "Fergana Valley",
    description: "The country's craft heartland — ceramics, silk, and family-run kitchens.",
    body: "Fenced in by mountains on three sides, the Fergana Valley has its own microclimate and its own crafts tradition, largely untouched by the Silk Road tourist trail further west. Rishtan's blue-glazed ceramics have been made the same way for centuries; Margilan's silk mills still hand-dye ikat fabric; and home-hosted dinners here tend to be the most memorable meals of a trip through Uzbekistan.",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200",
    ],
    is_featured: false,
    display_order: 7,
  },
  {
    name: "Moynaq & the Aral Sea",
    slug: "moynaq",
    region: "Karakalpakstan",
    description: "A stranded ship graveyard marking one of the world's starkest environmental stories.",
    body: "Moynaq was a thriving fishing port on the Aral Sea until the sea itself receded over a hundred kilometers away, a consequence of Soviet-era irrigation projects. The rusting hulls of its former fishing fleet now sit stranded on what is desert sand. It's a sobering, memorable stop rather than a conventional sightseeing one, and the small local museum does a good job explaining what happened and what's being done about it.",
    image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200",
    hero_image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1800",
    gallery_images: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200",
    ],
    is_featured: false,
    display_order: 8,
  },
];

const OPINION_SNIPPETS = [
  "Went out of our way to visit and it was worth every minute — bring a good camera.",
  "Quieter than we expected for how well-known it is. Early morning is the way to go.",
  "Our guide made all the difference here, would not have understood half of what we saw without one.",
  "Loved the food nearby just as much as the sights themselves.",
  "Second time visiting and it still surprised us. Highly recommend a full day, not a rushed stop.",
  "A bit touristy at the main spots but wander two streets over and it's completely different.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Disposable accounts from the old, now-deleted seed-admin.js/seed-users.js scripts, plus this
// script's own *@ta-demo.uz accounts (so the script is safe to re-run). Any other account (real
// personal logins used for manual testing, etc.) is left alone.
const DISPOSABLE_TEST_EMAILS = new Set([
  "tourist@uzb.test",
  "provider@uzb.test",
  "agency@uzb.test",
  "admin@uzb.test",
  "tourist@test.com",
  "provider@test.com",
  "agency@test.com",
  "admin@test.com",
]);

function isDisposableTestEmail(email) {
  return DISPOSABLE_TEST_EMAILS.has(email) || email.endsWith("@ta-demo.uz");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The Supabase Auth Admin API rate-limits rapid sequential admin.deleteUser/createUser calls.
// Retry transient failures with backoff instead of silently skipping them (a skipped delete
// followed by a create for the same email fails loudly with "already registered", which is
// actually the safer outcome than the account silently ending up half-recreated).
async function withRetry(fn, { attempts = 4, baseDelayMs = 800 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await sleep(baseDelayMs * (i + 1));
    }
  }
  throw lastError;
}

async function selectIds(table, column, values) {
  if (values.length === 0) return [];
  const { data, error } = await supabase.from(table).select("id").in(column, values);
  if (error) throw new Error(`select ${table}.id where ${column} in (...) failed: ${error.message}`);
  return data.map((r) => r.id);
}

async function deleteWhereIn(table, column, values) {
  if (values.length === 0) return;
  const { error } = await supabase.from(table).delete().in(column, values);
  if (error) throw new Error(`delete from ${table} where ${column} in (...) failed: ${error.message}`);
}

// Deleting an auth user only cascades user_profiles -> services -> provider_verifications
// (those are the only FKs declared ON DELETE CASCADE). itineraries.agency_id,
// bookings.tourist_id/provider_id, reviews.tourist_id, notifications.user_id,
// destination_reviews.tourist_id, and booking_status_history.changed_by all reference
// auth.users(id) with no cascade, and itinerary_items.service_id references services with no
// cascade either -- so admin.deleteUser() 500s with a foreign key violation unless all of this
// is cleared first, in FK-safe order (children before parents).
async function deleteDependentRows(userIds) {
  if (userIds.length === 0) return;

  const serviceIds = await selectIds("services", "provider_id", userIds);
  const itineraryIds = await selectIds("itineraries", "agency_id", userIds);
  const bookingIds = [
    ...(await selectIds("bookings", "tourist_id", userIds)),
    ...(await selectIds("bookings", "provider_id", userIds)),
  ];

  await deleteWhereIn("booking_status_history", "changed_by", userIds);
  await deleteWhereIn("booking_status_history", "booking_id", bookingIds);
  await deleteWhereIn("reviews", "tourist_id", userIds);
  await deleteWhereIn("bookings", "id", bookingIds);
  await deleteWhereIn("notifications", "user_id", userIds);
  await deleteWhereIn("destination_reviews", "tourist_id", userIds);
  await deleteWhereIn("itinerary_items", "itinerary_id", itineraryIds);
  await deleteWhereIn("itinerary_items", "service_id", serviceIds);
  await deleteWhereIn("itineraries", "id", itineraryIds);
}

async function deleteDisposableTestUsers() {
  console.log("Deleting old demo/test accounts (leaving all other accounts untouched)...");
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(`listUsers failed: ${error.message}`);

  const toDelete = data.users.filter((u) => isDisposableTestEmail(u.email));
  for (const u of data.users) {
    if (!isDisposableTestEmail(u.email)) console.log(`  Keeping ${u.email}`);
  }

  console.log(`  Clearing dependent rows for ${toDelete.length} account(s)...`);
  await deleteDependentRows(toDelete.map((u) => u.id));

  for (const u of toDelete) {
    // Now safe: only user_profiles/services/provider_verifications are left referencing this
    // user, and those cascade automatically.
    await withRetry(async () => {
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
      if (delErr) throw new Error(delErr.message || JSON.stringify(delErr));
    });
    console.log(`  Deleted ${u.email}`);
    await sleep(300); // stay under the Auth Admin API's rate limit
  }
}

// destinations aren't owned by a user, so the cascade-delete above doesn't touch them. Clear the
// known demo slugs explicitly so re-running the script doesn't collide on the UNIQUE(slug).
async function deleteExistingDestinations() {
  const slugs = DESTINATIONS.map((d) => d.slug);
  const { error } = await supabase.from("destinations").delete().in("slug", slugs);
  if (error) throw new Error(`destinations cleanup failed: ${error.message}`);
}

async function createAccount(email, role, full_name) {
  const { data } = await withRetry(async () => {
    const res = await supabase.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { role, full_name },
      app_metadata: { role, is_verified: true },
    });
    if (res.error) throw new Error(res.error.message || JSON.stringify(res.error));
    return res;
  });
  await sleep(300); // stay under the Auth Admin API's rate limit
  const userId = data.user.id;

  // handle_new_user() trigger already inserted a user_profiles row; mark it verified
  // (provider/agency default to false pending review, tourist/admin only get backfilled
  // retroactively by the migration, not by the trigger for new signups).
  const { error: profErr } = await supabase
    .from("user_profiles")
    .update({ is_verified: true })
    .eq("id", userId);
  if (profErr) throw new Error(`user_profiles update(${email}) failed: ${profErr.message}`);

  return userId;
}

async function approveVerification(userId, role, businessName, email) {
  const { error } = await supabase.from("provider_verifications").insert({
    user_id: userId,
    role,
    business_name: businessName,
    email,
    status: "approved",
  });
  if (error) throw new Error(`provider_verifications insert failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await deleteDisposableTestUsers();
  await deleteExistingDestinations();

  console.log("\nCreating admin account...");
  await createAccount(ADMIN.email, "admin", ADMIN.full_name);

  console.log("\nCreating tourist accounts...");
  const touristIds = [];
  for (const t of TOURISTS) {
    const id = await createAccount(t.email, "tourist", t.full_name);
    touristIds.push({ id, email: t.email });
  }

  console.log("\nCreating provider accounts + services...");
  const allServices = []; // { id, title, provider_id }
  for (const p of PROVIDERS) {
    const providerId = await createAccount(p.email, "provider", p.full_name);
    await approveVerification(providerId, "provider", p.business_name, p.email);

    const rows = p.services.map((s) => ({
      provider_id: providerId,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
      currency: "UZS",
      image_url: s.image_url,
      duration_minutes: s.duration_minutes,
      max_guests: s.max_guests,
      is_available: true,
      is_featured: s.is_featured,
      city: s.city,
      region: s.region,
      location: s.city,
      is_rural_provider: true,
      provider_name: p.business_name,
      rating_avg: s.rating_avg,
      rating_count: s.rating_count,
      avg_rating: s.rating_avg,
      reviews_count: s.rating_count,
    }));

    const { data: inserted, error } = await supabase.from("services").insert(rows).select("id, title");
    if (error) throw new Error(`services insert failed for ${p.business_name}: ${error.message}`);
    inserted.forEach((row) => allServices.push({ ...row, provider_id: providerId }));
    console.log(`  ${p.business_name}: ${inserted.length} services`);
  }

  console.log("\nCreating agency accounts + packages...");
  for (const a of AGENCIES) {
    const agencyId = await createAccount(a.email, "agency", a.full_name);
    await approveVerification(agencyId, "agency", a.business_name, a.email);

    for (const it of a.itineraries) {
      const { data: itinerary, error: itinErr } = await supabase
        .from("itineraries")
        .insert({
          agency_id: agencyId,
          title: it.title,
          description: it.description,
          start_date: it.start_date,
          end_date: it.end_date,
          status: "active",
          total_price: it.total_price,
          currency: "UZS",
        })
        .select()
        .single();
      if (itinErr) throw new Error(`itinerary insert failed (${it.title}): ${itinErr.message}`);

      const items = it.items.map((item) => {
        const svc = allServices.find((s) => s.title === item.serviceTitle);
        if (!svc) throw new Error(`Unknown serviceTitle reference: ${item.serviceTitle}`);
        return {
          itinerary_id: itinerary.id,
          service_id: svc.id,
          title: item.serviceTitle,
          sort_order: item.sort_order,
          price: Math.round(it.total_price / it.items.length),
        };
      });
      const { error: itemsErr } = await supabase.from("itinerary_items").insert(items);
      if (itemsErr) throw new Error(`itinerary_items insert failed (${it.title}): ${itemsErr.message}`);
    }
    console.log(`  ${a.business_name}: ${a.itineraries.length} packages`);
  }

  console.log("\nCreating destinations...");
  const destinationIds = [];
  for (const d of DESTINATIONS) {
    const { data, error } = await supabase
      .from("destinations")
      .insert({
        name: d.name,
        slug: d.slug,
        description: d.description,
        body: d.body,
        region: d.region,
        image_url: d.image_url,
        hero_image_url: d.hero_image_url,
        gallery_images: d.gallery_images,
        is_featured: d.is_featured,
        display_order: d.display_order,
      })
      .select()
      .single();
    if (error) throw new Error(`destination insert failed (${d.name}): ${error.message}`);
    destinationIds.push(data.id);
  }
  console.log(`  ${destinationIds.length} destinations`);

  console.log("\nCreating destination opinions...");
  let opinionCount = 0;
  for (const destId of destinationIds) {
    const numOpinions = 2 + Math.floor(Math.random() * 2); // 2-3
    for (let i = 0; i < numOpinions; i++) {
      const tourist = touristIds[(opinionCount + i) % touristIds.length];
      const { error } = await supabase.from("destination_reviews").insert({
        destination_id: destId,
        tourist_id: tourist.id,
        rating: 4 + Math.floor(Math.random() * 2), // 4-5
        comment: OPINION_SNIPPETS[(opinionCount + i) % OPINION_SNIPPETS.length],
      });
      if (error) throw new Error(`destination_reviews insert failed: ${error.message}`);
      opinionCount++;
    }
  }
  console.log(`  ${opinionCount} destination opinions`);

  console.log("\nCreating a few completed bookings + reviews for realism...");
  const bookingSeeds = [
    { touristIdx: 0, service: allServices[0] },
    { touristIdx: 1, service: allServices[3] },
  ];
  for (const seed of bookingSeeds) {
    const tourist = touristIds[seed.touristIdx];
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .insert({
        tourist_id: tourist.id,
        service_id: seed.service.id,
        provider_id: seed.service.provider_id,
        status: "completed",
        booking_date: "2026-06-15",
        guest_count: 2,
        special_requests: null,
        total_price: 150000,
        currency: "UZS",
      })
      .select()
      .single();
    if (bErr) throw new Error(`booking insert failed: ${bErr.message}`);

    const { error: rErr } = await supabase.from("reviews").insert({
      tourist_id: tourist.id,
      service_id: seed.service.id,
      booking_id: booking.id,
      rating: 5,
      comment: `${seed.service.title} was the highlight of our trip — highly recommend booking ahead.`,
    });
    if (rErr) throw new Error(`review insert failed: ${rErr.message}`);
  }
  console.log(`  ${bookingSeeds.length} completed bookings + reviews`);

  console.log("\nSeed complete.");
  console.log(`All mock accounts use password: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
