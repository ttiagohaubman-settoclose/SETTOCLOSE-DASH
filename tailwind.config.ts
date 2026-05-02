import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Inter"',
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      colors: {
        // Light mode
        surface: "#ffffff",
        background: "#f3f4f6",
        border: "#e5e7eb",
        muted: "#6b7280",
        // Dark mode overrides via CSS vars
      },
    },
  },
  plugins: [],
};

export default config;
