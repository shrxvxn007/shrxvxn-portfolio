import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0C",
        panel: "#0F0F12",
        line: "#18181B",
        linebright: "#2A2A30",
        fg: "#FFFFFF",
        muted: "#8A8A93",
        dim: "#4B4B52",
        accent: "#00FF66",
        "accent-dim": "#00FF6633",
        orange: "#FF5C00",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      animation: {
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        "ticker-scroll": "tickerScroll 40s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        tickerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
