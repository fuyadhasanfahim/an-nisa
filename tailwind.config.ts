import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#fcc4c8",
          black: "#0b0b0f",
          white: "#ffffff",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(11, 11, 15, 0.08)",
        softSm: "0 8px 20px rgba(11, 11, 15, 0.06)",
      },
      borderRadius: {
        xl: "0.95rem",
      },
      keyframes: {
        stitch: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
      },
      animation: {
        stitch: "stitch 10s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

