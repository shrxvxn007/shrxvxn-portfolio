"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  seed?: number;
  draw?: boolean; // draw line on view
  fill?: boolean;
  height?: number;
  accent?: string;
};
/** Monochrome SVG equity curve with deterministic pseudo-random walk. */
function buildPath(seed: number, w: number, h: number, n = 90) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  let v = 0.35;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.42) * 0.045; // upward drift
    v = Math.max(0.02, Math.min(0.95, v));
    pts.push([(i / (n - 1)) * w, h - v * h]);
  }
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return { line, area, pts };
}

export default function EquityChart({
  seed = 7,
  fill = true,
  height = 120,
  // theme-aware default; tokens are channel triplets, so wrap in rgb().
  // Colors go through the style prop because presentation attributes
  // can't resolve var().
  accent = "rgb(var(--c-accent))",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const W = 100; // viewBox units
  const H = height / 2;
  const { line, area, pts } = buildPath(seed, W, H);
  const last = pts[pts.length - 1];

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        {fill && inView && (
          <motion.path
            d={area}
            style={{ fill: accent }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.07 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        )}
        <motion.path
          d={line}
          fill="none"
          style={{ stroke: accent }}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {inView && (
          <motion.circle
            cx={last[0]}
            cy={last[1]}
            r={2}
            style={{ fill: accent }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5 }}
          />
        )}
      </svg>
    </div>
  );
}
