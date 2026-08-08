import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Safron brand design system — see docs/UZBEKISTAN_DESIGN_LANGUAGE.md and
        // docs/UI_UX_GUIDELINES.md. `primary`/`secondary`/`accent` are kept as the semantic
        // role names (so existing `bg-primary`/`text-primary` call sites repaint automatically)
        // but now point at the real brand tokens instead of the old "Travelora" blue/coral.
        primary: {
          DEFAULT: "#0A2320", // Emerald -- matches emerald.950 / --color-primary in packages/ui/src/styles/globals.css
          light: "#273D3B", // one step up the Emerald->white neutral scale below (gray.800) -- hover state
        },
        secondary: {
          DEFAULT: "#C5A880", // Gold -- matches gold.400 / --color-secondary
          dark: "#A78F6D", // ~15% darkened Gold -- hover state
        },
        accent: "#006B70", // Turquoise -- matches teal.700, Button.tsx's "teal action" variant
        sand: {
          50: "#F9F8F5",
        },
        emerald: {
          950: "#0A2320",
        },
        white: "#FFFFFF",
        gold: {
          400: "#C5A880",
        },
        teal: {
          700: "#006B70",
        },
        success: "#2D8A4E",
        warning: "#D9972B",
        error: "#C93B3B",
        // Neutral text/border/surface scale, mathematically blended white -> Midnight Emerald
        // (matches UI_UX_GUIDELINES.md §4.4: "Secondary Text = Emerald @ ~65% opacity",
        // "Border = Emerald @ ~8-14% opacity") so every existing `text-gray-*`/`border-gray-*`/
        // `bg-gray-*` call site across all 4 apps repaints on-brand without touching each file.
        gray: {
          50: "#F5F6F6",
          100: "#EBEDED",
          200: "#DDE0E0",
          300: "#C4CAC9",
          400: "#A2ABAA",
          500: "#808D8B",
          600: "#60706E",
          700: "#405351",
          800: "#273D3B",
          900: "#0A2320",
          950: "#081E1B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "'Playfair Display'", "serif"],
        display: ["var(--font-serif)", "'Playfair Display'", "serif"],
        cursive: ["Dancing Script", "cursive"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "bounce-gentle": "bounceGentle 2s infinite",
        "pulse-marker": "pulseMarker 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseMarker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.15)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      spacing: {
        "section": "6rem",
        "section-lg": "8rem",
      },
      borderRadius: {
        // Overrides the base Tailwind radius scale to match UI_UX_GUIDELINES.md §5.3 exactly,
        // so plain `rounded-sm`/`rounded`/`rounded-lg`/`rounded-xl` classes are correct by
        // default everywhere, instead of every call site needing an arbitrary-value override.
        "sm": "3px",   // buttons, inputs
        "DEFAULT": "4px", // color swatches, small tiles
        "lg": "6px",   // cards (Family 1 "Destination Card")
        "xl": "16px",  // modals, sheets
        "card": "6px",
        "pill": "9999px",
      },
      boxShadow: {
        "soft": "0 10px 30px rgba(0,0,0,0.05)",
        "card": "0 4px 20px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.1)",
        "navbar": "0 2px 20px rgba(0,0,0,0.08)",
      },
    }
  },
  plugins: []
};

export default config;
