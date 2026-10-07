"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/** Dual decay curves (train/val) in one compact SVG. */
function decay(seed: number, n: number) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const base = 0.92 * Math.exp(-2.6 * x) * 0.9 + 0.09;
    const y = base + (rand() - 0.5) * 0.06 * (1 - x * 0.7);
    pts.push([x * 100, Math.max(0.03, y) * 100]);
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

export default function LossChart({ height = 110 }: { height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const train = decay(11, 80);
  const val = decay(29, 80);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#18181B" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path
          d={train}
          fill="none"
          stroke="#00FF66"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={val}
          fill="none"
          stroke="#8A8A93"
          strokeWidth={1}
          strokeDasharray="3 2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-2 bottom-1 flex justify-between font-mono text-[9px] tracking-widest text-dim">
        <span>STEP 0</span>
        <span>96K</span>
      </div>
    </div>
  );
}
