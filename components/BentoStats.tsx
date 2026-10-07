"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import EquityChart from "./charts/EquityChart";
import LossChart from "./charts/LossChart";

/** Count-up for numeric hero metrics (triggered on view). */
function CountUp({ to, suffix = "", decimals = 0, className = "" }: { to: number; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <span ref={ref} className={className}>
      {inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="tabular-nums"
        >
          {to.toFixed(decimals)}
          {suffix}
        </motion.span>
      ) : (
        <span className="text-dim">—{suffix && suffix}</span>
      )}
    </span>
  );
}

function Marker({ tag }: { tag: string }) {
  return <span className="font-mono text-[10px] tracking-[0.3em] text-dim">[{tag}]</span>;
}

export default function BentoStats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
            [02]&nbsp;//&nbsp;CAPABILITY_SURFACE
          </div>
          <h2 className="font-sans mt-3 text-4xl font-semibold tracking-[-0.04em] text-fg md:text-5xl">
            Signal density, <span className="text-muted">built deliberately.</span>
          </h2>
        </div>
        <div className="text-dim hidden font-mono text-[10px] tracking-widest md:block">
          GRID 12×8 / MODULAR
        </div>
      </div>

      {/* Strict linear bento — unequal modules, hairline borders */}
      <div className="border-line border">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* equity module */}
          <div className="border-line md:col-span-7 border-b p-6 md:border-r">
            <div className="flex items-center justify-between">
              <Marker tag="01" />
              <span className="text-dim font-mono text-[10px] tracking-widest">EQUITY // 24M</span>
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div className="font-mono text-4xl tracking-[-0.03em] text-fg">
                <CountUp to={2.71} decimals={2} />
              </div>
              <div className="text-accent font-mono text-[11px] tracking-widest">SHARPE ▲</div>
            </div>
            <div className="mt-5">
              <EquityChart seed={13} height={130} />
            </div>
          </div>

          {/* loss module */}
          <div className="border-line md:col-span-5 border-b p-6">
            <div className="flex items-center justify-between">
              <Marker tag="02" />
              <span className="text-dim font-mono text-[10px] tracking-widest">TRAIN // DESCENT</span>
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div className="font-mono text-4xl tracking-[-0.03em] text-fg">
                <CountUp to={184} suffix="M" />
              </div>
              <div className="text-dim font-mono text-[11px] tracking-widest">PARAMS</div>
            </div>
            <div className="mt-5">
              <LossChart height={130} />
            </div>
          </div>

          {/* latency module */}
          <div className="border-line md:col-span-4 p-6 md:border-r">
            <Marker tag="03" />
            <div className="mt-4 font-mono text-4xl tracking-[-0.03em] text-fg">
              <CountUp to={1.9} decimals={1} suffix="ms" />
            </div>
            <div className="text-dim mt-2 font-mono text-[10px] tracking-[0.25em]">
              P99 // EXECUTION_FABRIC
            </div>
            <pre className="border-line mt-5 border bg-base p-3 font-mono text-[10px] leading-relaxed text-muted">
[SYS_INIT] io_uring registered
[LOG]      ring depth 4096
[LOG]      zero_copy=on
[OK]       1.9ms steady state
            </pre>
          </div>

          {/* precision module */}
          <div className="border-line md:col-span-4 p-6 md:border-r">
            <Marker tag="04" />
            <div className="mt-4 font-mono text-4xl tracking-[-0.03em] text-fg">
              <CountUp to={99.98} decimals={2} suffix="%" />
            </div>
            <div className="text-dim mt-2 font-mono text-[10px] tracking-[0.25em]">
              AVAILABILITY // 10M_roll
            </div>
            <div className="border-line mt-5 grid grid-cols-3 border-t pt-3 font-mono text-[10px] tracking-wider text-muted">
              <div>LOST: 0 pkts</div>
              <div>REBAL: ×3</div>
              <div>FAILOV: 42ms</div>
            </div>
          </div>

          {/* stack module */}
          <div className="border-line md:col-span-4 p-6">
            <Marker tag="05" />
            <div className="text-dim mt-4 font-mono text-[10px] tracking-[0.25em]">
              STACK // CONCENTRIC
            </div>
            <div className="border-line mt-4 space-y-0 border-t">
              {[
                ["RESEARCH", "python · polars · statmodels"],
                ["MODELING", "pytorch · triton · ray"],
                ["RUNTIME", "rust · c++20 · io_uring"],
                ["DELIVERY", "nextjs · golang · k8s"],
              ].map(([k, v]) => (
                <div key={k} className="border-line flex items-baseline justify-between border-b py-2.5 last:border-b-0">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-fg">{k}</span>
                  <span className="font-mono text-[10px] text-dim tracking-wider">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
