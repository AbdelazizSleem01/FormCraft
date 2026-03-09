import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          50: "#F2F2F8",
          100: "#E4E4F0",
          200: "#C9C9E1",
          300: "#9999C3",
          400: "#6666A5",
          500: "#333387",
          600: "#1A1A6E",
          700: "#0D0D57",
          800: "#07073F",
          900: "#030328",
        },
        accent: {
          DEFAULT: "#6C63FF",
          soft: "#8B84FF",
          muted: "#4A42E8",
        },
        jade: {
          DEFAULT: "#00D97E",
          soft: "#00F090",
          muted: "#00B868",
        },
        amber: {
          DEFAULT: "#FFB020",
        },
        rose: {
          DEFAULT: "#FF4D6A",
        },
        surface: {
          DEFAULT: "#13131A",
          raised: "#1C1C26",
          overlay: "#242433",
          border: "#2E2E42",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
