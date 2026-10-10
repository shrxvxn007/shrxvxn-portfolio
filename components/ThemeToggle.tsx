"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Fixed light/dark toggle. Swaps the `light` class on <html> (all colors
 * are CSS vars) and persists the choice to localStorage. The initial
 * render shows the dark-mode icon; the useEffect syncs to the real theme
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

  const label = light ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="border-linebright bg-panel/90 text-muted hover:border-accent hover:text-accent fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center border shadow-lg transition-colors"
    >
      {light ? (
        <Moon size={18} strokeWidth={1.5} />
      ) : (
        <Sun size={18} strokeWidth={1.5} />
      )}
    </button>
  );
}
