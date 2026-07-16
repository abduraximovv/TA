import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E6F8A",
          light: "#2A9FCC",
          dark: "#14506A"
        },
        secondary: {
          DEFAULT: "#D4A843",
          light: "#E8C96E"
        },
        accent: "#C4553A",
        success: "#2D8A4E",
        warning: "#D9972B",
        error: "#C93B3B"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
