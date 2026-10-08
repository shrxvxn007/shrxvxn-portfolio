"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Fixed light/dark toggle. Swaps the `light` class on <html> (all colors
 * are CSS vars) and persists the choice to localStorage. The initial
 * render shows the dark icon; the useEffect syncs to the real theme
 * after mount, so SSR and hydration always agree.
 */
export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* private mode — theme just won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="border-line bg-base/80 text-dim hover:text-accent hover:border-linebright fixed right-3 top-3 z-50 flex h-8 w-8 items-center justify-center border backdrop-blur-sm transition-colors"
    >
      {light ? <Moon size={13} strokeWidth={1.5} /> : <Sun size={13} strokeWidth={1.5} />}
    </button>
  );
}
