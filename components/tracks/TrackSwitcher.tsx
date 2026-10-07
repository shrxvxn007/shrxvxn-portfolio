"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TrackPanels from "./TrackPanels";
import type { Track } from "./TrackContext";

const TRACKS: Track[] = ["QUANT", "ML", "SWE"];

const TRACK_META: Record<Track, { tag: string; blurb: string }> = {
  QUANT: { tag: "α", blurb: "Mathematical rigor. Expectancy over intuition." },
  ML: { tag: "∇", blurb: "Model architecture. Learning curves over claims." },
  SWE: { tag: "o1", blurb: "Systems infrastructure. P99s over promises." },
};

/**
 * Interactive switcher: tab row acts like a data matrix header.
 * Selecting a track triggers a horizontal curtain-wipe of the panel.
 */
export default function TrackSwitcher() {
  const [track, setTrack] = useState<Track>("QUANT");

  return (
    <div className="w-full">
      {/* Track tab bar — razor-thin top rail */}
      <div className="border-linebright grid grid-cols-3 border-y">
        {TRACKS.map((t) => {
          const active = t === track;
          return (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`group relative px-5 py-4 text-left transition-colors duration-200 ${
                active ? "bg-panel" : "hover:bg-panel/60"
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.3em] uppercase transition-colors ${
                  active ? "text-fg" : "text-dim group-hover:text-muted"
                }`}
              >
                [TRK_{t === "SWE" ? "03" : t === "ML" ? "02" : "01"}] {t}
              </span>
              <span
                className={`mt-1 block font-mono text-[10px] tracking-wide transition-colors ${
                  active ? "text-muted" : "text-dim/70 group-hover:text-dim"
                }`}
              >
                {TRACK_META[t].blurb}
              </span>
              {active && (
                <motion.div
                  layoutId="track-underline"
                  className="absolute inset-x-0 bottom-0 h-px bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Curtain-wipe panel swap */}
      <div className="relative mt-px">
        <AnimatePresence mode="wait" initial={true}>
          <TrackPanels key={track} track={track} />
        </AnimatePresence>
      </div>
    </div>
  );
}
