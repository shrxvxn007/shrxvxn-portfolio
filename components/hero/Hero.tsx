"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef } from "react";
import SystemTicker from "./SystemTicker";

// canvas layer loads after first paint — typography is server-rendered instantly
const GridCanvas = dynamic(() => import("./GridCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-base" />,
});

/**
 * Cinematic hero: canvas layer behind, pinned typography that splits
 * apart (letters drift) as the user scrolls. Ticker pinned at top.
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // split apart on scroll
  const xLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const yLine = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative h-[130vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* background canvas layer */}
        <motion.div style={{ scale: canvasScale }} className="absolute inset-0">
          <GridCanvas />
        </motion.div>

        {/* top ticker */}
        <div className="absolute inset-x-0 top-0">
          <SystemTicker />
        </div>

        {/* pinned typography */}
        <motion.div
          style={{ opacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-6xl px-6">
            <div className="font-mono text-[11px] tracking-[0.3em] text-dim uppercase">
              <span className="animate-pulse-dot text-accent inline-block h-1.5 w-1.5 rounded-full bg-[#00FF66] align-middle" />
              &nbsp;&nbsp;PORTFOLIO_NODE_01 — ONLINE · github.com/shrxvxn007
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <motion.h1
                style={{ x: xLeft }}
                className="font-sans text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-fg"
              >
                SHRAVAN
              </motion.h1>
              <motion.span
                style={{ x: xRight }}
                className="font-mono hidden text-[clamp(0.9rem,1.6vw,1.25rem)] tracking-[0.2em] text-muted md:block"
              >
                /q&middot;ml&middot;swe/
              </motion.span>
            </div>

            <motion.div
              style={{ y: yLine }}
              className="border-linebright mt-8 border-t pt-5"
            >
              <div className="flex items-baseline justify-between">
                <motion.h1
                  style={{ x: xRight }}
                  className="font-sans text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-fg"
                >
                  MUDDULURU
                </motion.h1>
                <motion.p
                  style={{ x: xLeft }}
                  className="max-w-xs text-right font-mono text-[11px] leading-relaxed tracking-[0.1em] text-dim uppercase"
                >
                  Market infrastructure
                  <br />
                  LLM inference engines
                  <br />
                  Alpha research
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity }}
              className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-[10px] tracking-[0.22em] text-dim uppercase"
            >
              <span>[01] Allocation-free hot paths</span>
              <span>[02] Nanoseconds are the product</span>
              <span>[03] Bit-for-bit reproducible</span>
            </motion.div>
          </div>
        </motion.div>

        {/* corner coordinates */}
        <div className="pointer-events-none absolute bottom-6 left-6 font-mono text-[10px] tracking-[0.2em] text-dim">
          SHRAVAN007 / PORTFOLIO // QUANT&middot;ML&middot;SWE
        </div>
        <div className="pointer-events-none absolute right-6 bottom-6 font-mono text-[10px] tracking-[0.2em] text-dim">
          SCROLL &darr;
        </div>
      </div>
    </section>
  );
}
