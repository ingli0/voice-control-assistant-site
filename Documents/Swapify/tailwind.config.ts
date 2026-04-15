import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#191414",
          dark: "#121212",
          card: "#282828",
          hover: "#2A2A2A",
          text: "#B3B3B3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        "swipe-right": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(150%) rotate(30deg)", opacity: "0" },
        },
        "swipe-left": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(-150%) rotate(-30deg)", opacity: "0" },
        },
        "card-enter": {
          "0%": { transform: "scale(0.85) translateY(30px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "1" },
          "70%": { transform: "scale(1.2)", opacity: "0.3" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "swipe-right": "swipe-right 0.4s ease-out forwards",
        "swipe-left": "swipe-left 0.4s ease-out forwards",
        "card-enter": "card-enter 0.35s ease-out forwards",
        shimmer: "shimmer 2s infinite linear",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
