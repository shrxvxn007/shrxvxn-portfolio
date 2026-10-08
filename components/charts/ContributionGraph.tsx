"use client";

import { useMemo } from "react";

/** GitHub-style contribution grid, deterministic. Accent intensity buckets. */
export default function ContributionGraph({ weeks = 40 }: { weeks?: number }) {
  const cells = useMemo(() => {
    const out: number[] = [];
    let s = 4242;
    for (let i = 0; i < weeks * 7; i++) {
      s = (s * 1103515245 + 12345) % 2147483648;
      out.push(s / 2147483648);
    }
    return out;
  }, [weeks]);

  const shade = (v: number) => {
    if (v < 0.28) return "rgb(var(--c-cell-0))";
    if (v < 0.5) return "rgb(var(--c-cell-1))";
    if (v < 0.72) return "rgb(var(--c-cell-2))";
    if (v < 0.88) return "rgb(var(--c-cell-3))";
    return "rgb(var(--c-cell-4))";
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className="grid w-full gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
      >
        {cells.map((v, i) => (
          <div
            key={i}
            className="aspect-square w-full"
            style={{ background: shade(v) }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[9px] tracking-widest text-dim">
        <span>DETERMINISTIC GRID / 40W</span>
        <div className="flex items-center gap-1">
          {[0.2, 0.45, 0.65, 0.85, 0.95].map((v) => (
            <div key={v} className="h-2 w-2" style={{ background: shade(v) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
