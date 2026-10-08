import type { Config } from "tailwindcss";

/**
 * Colors are CSS-variable driven so the light/dark toggle only has to swap
 * a class on <html>. Channels are space-separated RGB triplets, wrapped in
 * rgb(var(--c-x) / <alpha-value>) so Tailwind opacity modifiers still work.
 */
const ch = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: ch("base"),
        panel: ch("panel"),
        line: ch("line"),
        linebright: ch("linebright"),
        fg: ch("fg"),
        muted: ch("muted"),
        dim: ch("dim"),
        accent: ch("accent"),
        "accent-dim": ch("accent") /* legacy name — same as accent */,
        orange: ch("orange"),
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
