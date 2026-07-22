import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Travelora Design System
        primary: {
          DEFAULT: "#1877F2",
          light: "#4B94F5",
          dark: "#0F5AC2",
          50: "#E8F1FE",
          100: "#D1E3FD",
        },
        secondary: {
          DEFAULT: "#FF5A5F",
          light: "#FF8084",
          dark: "#E0484D",
        },
        accent: "#FFB020",
        success: "#00B268",
        warning: "#FFB020",
        error: "#FF3B30",
        // Travelora neutrals
        sand: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
        },
        dark: {
          DEFAULT: "#111827",
          forest: "#1F2937",
          graphite: "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Inter", "sans-serif"], // We replace serif with sans in Travelora
        cursive: ["Dancing Script", "cursive"],
        mono: ["JetBrains Mono", "monospace"],
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
        "card": "8px",
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
