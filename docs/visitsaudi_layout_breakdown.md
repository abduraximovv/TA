# VisitSaudi.com — Layout & Design Breakdown

Source: https://www.visitsaudi.com/en (+ Destinations, Things To Do, Saudi Offers, Interactive Map). Pulled by scrolling every page and reading the live CSS/Tailwind classes, so the measurements below (blur %, border-radius, colors) are the site's actual values, not guesses. Use this as a build spec — each bullet is meant to be copy-pasteable into a prompt like "make a card with X".

---

## 1. Main Page (Homepage)

Sections appear in this exact order:

- **Navbar**
  - Fixed to top, `z-50`, full width, height 64px mobile / 80px desktop.
  - `backdrop-blur: 20px` + `background: black at 70% opacity` (Tailwind `bg-transparent/70` over a dark base) — this is the "transparency and blur" effect: you can see the hero image through a frosted dark pane.
  - `transition: all 300ms` — implies it swaps to a solid/opaque background once the user scrolls past the hero (standard pattern; confirm by scrolling on the live site if you want the exact scrolled-state color).
  - White text/logo on the transparent state. Logo is a white cursive "Saudi" wordmark + small "Welcome to Arabia" tagline underneath, top-left.
  - Center-left nav links (Destinations, Plan Your Trip, Things To Do, Saudi Offers, Saudi Calendar, Interactive Map) — two of them ("Destinations", "Plan Your Trip") are dropdown menus (chevron icon).
  - Right cluster: accessibility icon (circular outline button), Search (pill button, icon+label, outlined), language switcher ("EN" + globe icon, pill outline), "Get Your Visa" (outlined pill), "Log In / Sign Up" (solid filled pill, brand purple).

- **Hero — Full-bleed video/banner slider**
  - Full-width, full-viewport-height background **video** (autoplay, muted, with a manual mute/pause toggle top-right of the hero, circular translucent buttons).
  - A dark gradient overlay fades from transparent at the top to black at the bottom, so text stays legible over the video without a flat color block.
  - Centered content near the bottom third: large serif display headline (e.g. "Summer Your Way"), a one-line description, and a solid purple pill CTA button ("Book Now").
  - It's a **slider** (carousel) with 4 slides (seen: "Summer Your Way", "AFC Asian Cup Saudi 2027™", "Water fun awaits!", "Join and Enjoy Saudi Rewards"). Progress is shown as a thin horizontal bar under the slide captions at the very bottom, filled with a **rainbow/gradient stripe** (magenta → teal → yellow) that animates left-to-right to time the auto-advance — a distinctive, colorful loading-bar-style indicator instead of plain dots.
  - Slide captions for all 4 slides are listed in a row below the video, current one bold/white, others dimmed gray — acts as manual navigation too.

- **"Explore Summer Destinations" — Destination cards (Swiper carousel)**
  - Section heading in the bold serif/display font, left-aligned.
  - Horizontal swipeable row of cards (built with Swiper.js), 4-5 visible at a time, a circular arrow button floats on the right edge to advance.
  - **Card shape**: white background, `border-radius: 20px` on all corners (`rounded-[20px]`).
  - **Card layout, top to bottom**: padded title area (city name, bold, centered) → short 2-line description (gray, centered) → "Discover More" text link (purple) → photo fills the bottom of the card.
  - **Card image**: `border-radius: 20px` but with the **top-left/top-right corners squared off** (`!rounded-t-none`) — so only the bottom two corners are rounded, matching the card's own bottom radius, while the top blends flush into the text area above it. Net effect: a rounded rectangle card with a photo "tucked into" the bottom.

- **"What's On" — Events carousel**
  - Square-ish dark cards, image fills the whole card edge-to-edge (no padding/radius visible — flush rectangle, slightly rounded corners at ~12-16px).
  - Date badge overlaid top-left directly on the photo: two stacked mini date blocks (start date "01 / JAN / 2026" and end date "31 / DEC / 2026") in a translucent dark chip.
  - Below the image: location pin icon + "CITY | CATEGORY" in small caps, then bold event title, then a purple pill button ("Buy Tickets" or "Visit Website").
  - Some event images use **stylized Arabic calligraphy as graphic design** baked into the photo/poster itself (e.g. an event called "Sunken Treasures" shows the Arabic title كنوز غارقة in a decorative gold script over the image) — this is a recurring motif: Arabic type used as a visual/branding element inside imagery, not as page UI text.
  - Right-edge circular arrow button to scroll the carousel, same pattern as the destinations section.

- **"Discover The Latest Offers" — Offer cards**
  - White card, `View All` link top-right of the section heading.
  - **Image area** is two stacked photos (top: brand/hotel logo lockup on a plain backdrop; bottom: a lifestyle photo) — gives the card a "before/after" or "brand + experience" feel.
  - A **starburst/rosette discount badge** ("10% OFF", green fill, white text) overlaps the bottom-left corner of the image, sitting half on the photo / half on the white card body — looks like a wax seal or price sticker.
  - Below: date-range text (small, gray), bold offer title, and a "View Offer" link with a small external-link arrow icon.

- **Promotional banner** — full-width image/graphic banner (single CTA), no text content captured but sits between the offers and Things To Do sections as a visual break.

- **"Things To Do" — Category-filtered card grid**
  - Horizontal row of circular line-icon filters at the top (All ✓, Nature 🌳, Culture & History, Shopping 🛍, Food & Beverages 🍴) — each icon sits inside a thin circular outline; the active filter gets a pink checkmark above it and a colored underline/active state.
  - Cards below: **full-bleed rectangular photos, no border-radius** (hard square corners, unlike the destination cards) laid edge-to-edge in a tight grid — a deliberate contrast to the rounded cards elsewhere on the page.
  - Caption under each photo: pin icon + "CITY | CATEGORY" small caps, then bold place name (no description text — this section is scannable/visual only).

- **"Explore More Destinations"** — a second instance of the same rounded-20px Swiper destination-card carousel from section 2, different cities.

- **"Stories and Insights" — Editorial/blog tiles**
  - 3-column full-bleed image grid, images butted edge-to-edge with a small gutter, **no rounding**.
  - Text is overlaid directly on the photo at the bottom (not below it like other sections): a small underlined category label (e.g. "ADVENTURE", "ADVENTURE, FAMILIES, FRIENDS") in a thin-weight uppercase font, a horizontal rule under it, then a bold white headline — all sitting on a dark gradient scrim at the bottom of the photo so white text stays legible.

- **"Know the Destinations" — Mini interactive map module**
  - Split layout: left column is a vertically scrolling list of destination cards (thumbnail photo, tag row + live weather temperature top-right, bold city name) in plain white rounded cards.
  - Right column (majority of width) is an **embedded custom map** of Saudi Arabia (flat, light-gray landmass, thin purple country border line) with circular photo-thumbnail pins scattered by region — pins have a colored ring border (purple/orange) and cluster tightly where there are multiple attractions near each other.
  - Hovering/selecting a pin shows a small white tooltip card with the destination name (bold) and its tags (e.g. "Nature, Culture & History, Adventure") in gray underneath — tooltip has a soft drop shadow and small rounded corners, pointer-style tail toward the pin.

- **"Book Your Next Adventure" — Bookable experience cards**
  - Same horizontal swiper pattern again, cards show: photo, brand/location pin + city name top-left, a small activity-count pill (e.g. "🚶 250") top-right, then below the photo: date/price context, bold experience title, and a purple "Book Now" pill button.

- **"Visit Saudi in Numbers" — Stat cards**
  - White rounded cards with a distinctive **notched/perforated left edge**: a repeating diagonal zig-zag ribbon pattern in the brand's magenta + teal/blue colors, like a ticket stub or stamp perforation, running down the entire left border of the card.
  - Each card pairs a big bold purple number/stat ("598+", "20", "8+") with a short label, plus a flat-style isometric illustration (people, luggage, map pin, etc. — a consistent friendly "explainer illustration" art style used sitewide for non-photo content).
  - One larger card in this section ("204+ Stories to Inspire You") instead lists a ranked "Most Visited Stories" list (numbered 01-05) with chevron links.

- **"Impact of Digital Transformation" — Icon stat cards**
  - Section background has a **very faint repeating Islamic/geometric pattern watermark** (mashrabiya-lattice style motif) in light gray, barely visible, giving texture without competing with content.
  - Cards repeat the same notched zig-zag ribbon left-edge treatment as the stats section above, each with a flat illustration icon, a bold purple headline stat/claim, and a short gray sentence underneath.

- **"Know Before You Go" — Guide link cards**
  - Simple 4-up grid: illustration, bold title ("About Saudi", "Visa Regulations", "Travel Guide", "Getting Around"), underlined purple "Learn More" link. No card border/background — sits directly on the page background, separated only by whitespace. Background again has a faint arabesque pattern bleeding in from the corner.

- **"Evaluate Your Digital Experience" — Survey CTA banner**
  - A plain white full-width rounded card (large, ~20px radius) containing a bold headline, one sentence of body copy, an outlined pill button ("Start Survey"), and a friendly illustration (two people, a speech bubble) anchored to the right.

- **Footer**
  - Divider strip immediately above the footer: a **repeating white-on-light-gray geometric star/diamond Islamic pattern band**, full width, maybe 15-20px tall — a recurring "Arabic pattern as a horizontal rule" device used at major section boundaries across the site.
  - "Download Visit Saudi App" store badges (Google Play / App Store / AppGallery) + a newsletter email signup field with a "Join" button, side by side.
  - Main footer body is solid near-black, four link columns (Discover Saudi / Saudi Partner / Related Links / Call Center-with-social-icons-and-a-Contact-Us-pill), plus the same cursive pink/magenta "Saudi" logo and two small "Powered by / Registered with" government badges.
  - Bottom bar: solid black, copyright text left, legal links right (Terms, Privacy, Freedom of Information, Sitemap).

- **Floating persistent elements** (present on every page): a small circular "Noura" AI assistant avatar bubble bottom-right that expands into a chat greeting, and a vertical "Feedback" tab pinned to the right edge of the viewport (rotated text, brand purple background) that opens a survey overlay when clicked.

---

## 2. Destinations Page (`/en/destinations`)

- Breadcrumb under the navbar: "Homepage > Destinations" (gray, `>` separator, current page not a link).
- H1 "Saudi Destinations" in the bold serif display font, with a "View On Saudi Map" text link (purple) aligned to the right of the heading — same row.
- **Full interactive map module** (larger version of the homepage's mini-map): left column = scrollable list of destination cards (photo thumbnail, tag row, live weather icon+temperature, bold name); right column = the custom Saudi map with circular photo pins, purple border country outline, and hover tooltips — identical visual language to the homepage version but given much more vertical space (a proper full section rather than a teaser).
- **"All Destinations" grid** below the map: strict 3-column grid, cards are **full-bleed photography with zero border-radius** (flush rectangles, small gutter between them) — deliberately squarer/flatter than the rounded Swiper cards used elsewhere.
  - Per card: small weather icon + temperature top-right corner overlaid on the photo, uppercase tag list top-left overlaid on the photo (e.g. "NATURE, CULTURE & HISTORY, ADVENTURE"), then below the image (off-photo, on the white page background): bold city name.
- Grid continues for every region (AlUla, Jeddah, Riyadh, Aseer, Al Ahsa, The Red Sea, KAEC, Makkah, Madinah, etc.) — no visible pagination, just a long continuous grid (confirm if it lazy-loads more on scroll).

**Prompt-style summary**: *"Build a destinations index: hero map+list combo at the top (custom SVG/vector map with circular photo pins and a synced scrollable sidebar list), then a plain 3-col grid of square, non-rounded photo tiles with weather+tag overlays top corners and a bold city name caption below each tile."*

---

## 3. Things To Do Page (`/en/things-to-do`)

- Breadcrumb + H1 "Things to do" (serif display font), same pattern as Destinations.
- **Toolbar row** directly under the heading:
  - Search input, left-aligned, rounded rectangle, magnifying-glass icon, placeholder "Search".
  - Solid purple pill "Filters" button (icon + label) that likely opens a fuller side/modal filter panel.
  - Row of quick-filter pill chips: "All" (checked, pink checkmark icon), "Destinations ▾", "Attraction" (icon), "Experience" (icon), "Event" (icon), "Categories ▾" — all outlined pill buttons, unselected ones plain gray border/text, consistent ~full-radius pill shape (`border-radius: 9999px`-style).
  - A "Default" sort dropdown, outlined pill, far right.
- **Results grid**: 4 columns, cards are full-bleed photos with **no rounding** (same flat style as the Destinations grid) laid tightly edge-to-edge.
  - Caption block below each photo: date/date-range in gray, then pin icon + location name, then bold activity/event title, then — only when relevant — a "From ﷼ 350" price line in bold purple.
  - Notably, some tiles are pure branding/photography with **Arabic script used as the hero graphic** (e.g. a "Cinema AlBalad" card is basically a neon sign photo with the Arabic name سينما البلد glowing in red) — reinforces that Arabic typography shows up as an *art/photography element within cards*, not as page chrome.

**Prompt-style summary**: *"A filterable card grid page: search bar + pill-shaped filter chips row (icons + labels, one always active with a checkmark) + a sort dropdown, then a dense 4-col grid of square-cornered photo cards with a small caption stack underneath (date, location, title, optional price)."*

---

## 4. Saudi Offers Page (`/en/offers`)

- Breadcrumb "Homepage > Saudi Offers Platform".
- **Hero**: unlike the homepage's edge-to-edge video, this hero is a **static photo inset with visible page margins** (rounded corners on the image block, ~20px radius, a small expand/fullscreen icon button floats top-right of the image). Bold serif headline ("Unlock More") + one-line description overlaid bottom-left on a dark gradient scrim.
- Directly under the hero: the **same repeating geometric Arabic pattern strip** used as a footer divider elsewhere on the site — here it doubles as the hero's bottom border/frame, in a bright multicolor version (pink/orange/teal/purple zig-zags) rather than the muted footer one.
- **Two-column filter layout**:
  - Left sidebar: "FILTERS" label + "Clear All" link + a solid purple "Hide/Show Filters" pill toggle button. Below it, collapsible filter groups (chevron to collapse), each with its own mini search box and a checkbox list (e.g. "OFFERS TYPE": All / Offers Your Way / Saudi Rewards Offers / General; "DESTINATION": All Destinations / Taif / Makkah / Al Ahsa / Riyadh / The Red Sea, with a "Show More" link to expand further; a "CATEGORY" group below that).
  - Right content area: 4-column grid of offer cards, **identical component to the homepage's "Discover The Latest Offers" cards** — two-stacked-photo image (partner logo lockup + lifestyle shot), overlapping starburst discount/promo badge bottom-left of the image (colors vary: green "10%/25% OFF" or a plain "SUM26" / "STA-JOR" promo-code badge), date range, bold title, "View Offer" link with external-link icon.

**Prompt-style summary**: *"An offers marketplace: inset rounded hero photo with a decorative multicolor zig-zag pattern as its bottom border, then a classic e-commerce-style layout — collapsible checkbox filter sidebar on the left, 4-col grid of partner offer cards on the right, each card using a two-photo stack + an overlapping badge/sticker for the discount."*

---

## 5. Interactive Map Page (`map.visitsaudi.com/en`)

This is a separate subdomain/app, not just a section — a full custom mapping product.

- **Full-viewport map**, navbar floats on top with a transparent/dark scrim (consistent with the rest of the site), no page scroll — the map itself is the entire canvas.
- **Custom map style** (not a stock Google/Mapbox skin): cream/beige landmass, pale blue water, thin dashed magenta/purple line for the country/region borders, small gray uppercase region labels (e.g. "TABUK", "AL QASSIM", "RIYADH", "EASTERN PROVINCE"). Very minimal — no street grid clutter, reads more like a stylized illustrated map than a navigation tool.
- **Pins**, two types:
  - Small white circular "cluster" badges showing a plain number (count of nearby POIs) when zoomed out.
  - **Category icon pins**: solid magenta/purple filled circles with a simple white line-icon inside (a running figure for activities, a fork/knife for food, a landmark icon, etc.) — brand-color-coded regardless of category, so the icon (not the color) carries the meaning.
  - **Photo pins**: circular cropped photo thumbnails with a colored ring border (orange/tan for standard POIs, a different accent for "featured" ones) — these are the higher-priority/marquee destinations, visually upgraded from plain icon pins.
- **Map controls**: a floating vertical stack bottom-left, white rounded-square buttons with soft shadow — Home/recenter, Locate-me (target icon), Zoom in (+), Zoom out (–), and a small basemap-style thumbnail toggle (swap between map styles, e.g. terrain vs. simplified) at the very bottom of the stack.
- **Bottom overlay carousel**: a horizontally scrollable strip of city cards docked to the bottom edge of the screen, each a photo card with a translucent frosted-glass weather pill (icon + temperature, e.g. "☀️ 41.2°") and one or two tag pills (e.g. "Urban", "Food") overlaid top-left/top-right of the photo, then the city name + a ">" chevron below. A small chevron-down "collapse" handle sits centered just above this carousel to hide/reveal it.
- Clicking a pin presumably opens a detail card/panel (not fully captured — treat this as the one page where you may want to click through live to confirm the popup's exact styling before building it).

**Prompt-style summary**: *"A full-screen custom-styled map (flat color basemap, no street clutter, dashed purple region borders) with two-tier pins — brand-purple icon pins for quick category browsing and circular photo pins with colored rings for featured spots — floating rounded-square map controls bottom-left, and a horizontally scrollable 'nearby cities' card carousel docked to the bottom edge with frosted weather/tag pill overlays."*

---

## 6. Design System — Patterns Noticed Across Every Page

**Color palette**
- Primary brand color: deep magenta/plum purple, `rgb(120, 0, 110)` / `#78006E` — used for all solid CTA buttons, links, active states, big stat numbers, and the "Saudi" logotype (rendered as a pink-to-purple gradient script).
- Secondary/accent green: used specifically for discount badges ("% OFF" starbursts) — a bright kelly green, visually distinct from the purple so promos pop.
- Page background is **not pure white** — it's `#F8F8F8`, a very light warm gray, which is why white cards read as slightly "lifted" with soft shadows rather than blending into the page.
- Text defaults to near-black (`rgb(0,0,0)`) for body copy, with mid-gray for secondary/meta text (dates, tags, descriptions).
- Dark UI surfaces (navbar, event cards, photo-caption scrims, footer) use a near-black charcoal rather than true black.

**Typography**
- Headlines/section titles: a custom **serif display typeface** ("SaudiSerif-Bold") — gives the brand an editorial, upscale-travel-magazine feel rather than a generic tech-startup sans-serif look. Homepage H1 renders at 80px.
- Body/UI text: a custom **grotesque sans-serif** ("SaudiSans", semibold for buttons/labels) falling back to system UI fonts.
- A custom icon/glyph font ("Saudi-Riyal") is loaded specifically to render the ﷼ currency symbol correctly next to prices.
- All-caps, letter-spaced small text is used consistently for meta labels (location + category tags, region names on the map, "DOWNLOAD VISIT SAUDI APP" etc.) — a clear visual tier below headlines and body text.

**Cards & edges — three distinct "families" used deliberately, not randomly**
1. **Rounded feature cards** (`border-radius: 20px`): destination carousels, bookable-experience carousels, stat cards, the survey CTA banner. Used wherever the design wants to feel soft/friendly/promotional.
2. **Flush/square cards** (`border-radius: 0`): Things To Do grid, Destinations index grid, Stories editorial tiles. Used for dense, scannable, "catalog" content — the squared edges make the grid feel more like a gallery/archive.
3. **Notched ribbon-edge cards**: the "Visit Saudi in Numbers" and "Impact of Digital Transformation" stat cards use a unique repeating diagonal zig-zag pattern in brand colors down the left edge, like a torn ticket stub — this is the one truly bespoke card treatment on the site and worth recreating deliberately (a CSS `clip-path` polygon or a repeating background pattern works well for this).

**Buttons**
- Solid pill/rounded-rect buttons in brand purple with white text for primary actions (Book Now, Log In/Sign Up).
- Outlined pill buttons (purple border, purple or white text depending on background) for secondary actions (Get Your Visa, Search, Hide Filters toggle, Start Survey).
- Small `border-radius: 8px` on the button component itself even though it visually reads as very rounded at typical button heights (~44-48px tall, so the radius-to-height ratio makes it look pill-shaped without technically using `border-radius: 9999px`).

**Arabic/Islamic decorative motifs** (this is a deliberate, recurring brand device, not incidental)
- A repeating **geometric star/diamond Islamic pattern band** (mashrabiya/zellige-inspired, not literal script) is used as a horizontal divider at major section boundaries: above the footer (muted white-on-gray version) and as the offers-page hero's bottom border (bright multicolor version).
- The same lattice pattern appears as a **very faint full-bleed watermark** behind the "Impact of Digital Transformation" section and bleeding in from a corner behind "Know Before You Go" — texture without competing with foreground content.
- Actual **Arabic script/calligraphy appears inside photography**, not as UI chrome — e.g. an event poster reading "كنوز غارقة" (Sunken Treasures) in gold script, and a neon sign reading "سينما البلد" (Cinema AlBalad) — used as authentic cultural texture within real photos/graphics rather than as translated UI labels.
- The animated hero progress bar uses a similar multicolor "woven ribbon" stripe (magenta/teal/yellow) echoing the same pattern language in motion form.

**Illustration style**
- A consistent flat, friendly, isometric-ish 2D illustration style (rounded shapes, muted secondary palette: dusty blue, terracotta, sage) is used for anything that isn't real photography — stat-card icons, the survey CTA graphic, "Know Before You Go" guide icons, digital-transformation icons. Keeps the "human/explainer" moments visually distinct from the "aspirational/photographic" travel content.

**Motion / interactivity**
- Hero is an autoplaying muted background video with manual mute/pause controls, not a static image.
- Section-level content in carousels uses Swiper.js with a floating circular arrow button (usually just one "next" arrow visible, positioned on the right edge, overlapping the content).
- Navbar transitions (`transition: all 300ms`) between a transparent/blurred state (over the hero) and (presumably) a solid state on scroll.
- A live AI chat assistant ("Noura") avatar and a vertical rotated-text "Feedback" tab are persistent floating elements on every page — both use the brand purple.
- The homepage/destinations maps show live weather (icon + current temperature) per destination card, pulled dynamically rather than static copy.

---

### Quick "recreate this" prompt you can reuse

> Build a travel-tourism homepage with: a fixed navbar using 20px backdrop-blur over 70%-opacity dark background, transitioning to solid on scroll; a full-bleed autoplaying muted hero video with a bottom gradient scrim, centered serif headline + purple pill CTA, and a multicolor gradient progress bar for the slide timer; alternating rounded-20px "feature" card carousels (Swiper, white bg, photo tucked into the bottom half only, top corners of the photo squared) for destinations/experiences; square, zero-radius photo-tile grids for dense listing pages (things-to-do, all-destinations); offer cards with a two-photo stack and an overlapping starburst discount badge; stat cards with a torn-ticket zig-zag ribbon left edge in brand colors; a custom illustrated flat-map component with circular photo pins (colored ring borders) and brand-purple icon pins, synced to a scrollable destination list; a repeating Islamic geometric pattern band as the divider above the footer and as a faint background watermark on stat sections; primary color a deep plum/magenta (#78006E), page background off-white (#F8F8F8), display headlines in a custom serif, UI text in a custom grotesque sans, all-caps letter-spaced meta labels throughout.
