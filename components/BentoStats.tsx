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
            The numbers behind
            <span className="text-muted"> the builds.</span>
          </h2>
        </div>
        <div className="text-dim hidden font-mono text-[10px] tracking-widest md:block">
          GRID 12×8 / MODULAR
        </div>
      </div>

      {/* Strict linear bento — unequal modules, hairline borders */}
      <div className="border-line border">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* throughput module — aster */}
          <div className="border-line md:col-span-7 border-b p-6 md:border-r">
            <div className="flex items-center justify-between">
              <Marker tag="01" />
              <span className="text-dim font-mono text-[10px] tracking-widest">ASTER // MATCHING_ENGINE</span>
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div className="font-mono text-4xl tracking-[-0.03em] text-fg">
                <CountUp to={30.85} decimals={2} suffix="M" />
              </div>
              <div className="text-accent font-mono text-[11px] tracking-widest">EVENTS/SEC ▲</div>
            </div>
            <div className="mt-5">
              <EquityChart seed={13} height={130} />
              <div className="text-dim mt-2 font-mono text-[9px] tracking-widest">
                EQUITY CURVE — ILLUSTRATIVE SHAPE, NOT LIVE DATA
              </div>
            </div>
          </div>

          {/* dispatch module — retrovm */}
          <div className="border-line md:col-span-5 border-b p-6">
            <div className="flex items-center justify-between">
              <Marker tag="02" />
              <span className="text-dim font-mono text-[10px] tracking-widest">RETROVM // DISPATCH</span>
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div className="font-mono text-4xl tracking-[-0.03em] text-fg">
                <CountUp to={540} />
              </div>
              <div className="text-dim font-mono text-[11px] tracking-widest">MIPS</div>
            </div>
            <div className="mt-5">
              <LossChart height={130} />
              <div className="text-dim mt-2 font-mono text-[9px] tracking-widest">
                SYNTHETIC VISUAL — REAL BENCH NUMBERS IN THE REPO
              </div>
            </div>
          </div>

          {/* latency module — aster hot path */}
          <div className="border-line md:col-span-4 p-6 md:border-r">
            <Marker tag="03" />
            <div className="mt-4 font-mono text-4xl tracking-[-0.03em] text-fg">
              <CountUp to={32} suffix="ns" />
            </div>
            <div className="text-dim mt-2 font-mono text-[10px] tracking-[0.25em]">
              P50 // ENGINE_CALLBACK
            </div>
            <pre className="border-line mt-5 overflow-x-auto whitespace-pre border bg-base p-3 font-mono text-[10px] leading-relaxed text-muted">
{`=== Aster bench, 1M events ===
Events      1,000,000
Throughput  13.88 M ev/s
p50=32ns  p90=64ns  p99=128ns
alloc=0  (pool preallocated)`}
            </pre>
          </div>

          {/* inference module — auratensor */}
          <div className="border-line md:col-span-4 p-6 md:border-r">
            <Marker tag="04" />
            <div className="mt-4 font-mono text-4xl tracking-[-0.03em] text-fg">
              <CountUp to={2.35} decimals={2} suffix=" t/s" />
            </div>
            <div className="text-dim mt-2 font-mono text-[10px] tracking-[0.25em]">
              LLAMA-1B Q4_0 // NEON
            </div>
            <div className="border-line mt-5 grid grid-cols-3 border-t pt-3 font-mono text-[10px] tracking-wider text-muted">
              <div>DEPS: 0</div>
              <div>TESTS: 49</div>
              <div>CTX: 8K</div>
            </div>
          </div>

          {/* stack module */}
          <div className="border-line md:col-span-4 p-6">
            <Marker tag="05" />
            <div className="text-dim mt-4 font-mono text-[10px] tracking-[0.25em]">
              STACK //              BUILDS_IN_ANGER
            </div>
            <div className="border-line mt-4 space-y-0 border-t">
              {[
                ["SYSTEMS", "c++20 · cmake · mmap"],
                ["INFERENCE", "java21 · vector-api · gguf"],
                ["RESEARCH", "python · cvxpy · pandas"],
                ["WEB", "nextjs · react · tailwind"],
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
