"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sigma, BrainCircuit, Boxes } from "lucide-react";

type Project = {
  id: string;
  index: string;
  title: string;
  track: "QUANT" | "ML" | "SWE";
  summary: string;
  narrative: string[];
  metrics: { label: string; value: string }[];
  stack: string[];
  code: string;
  icon: LucideIcon;
};

const PROJECTS: Project[] = [
  {
    id: "volarb",
    index: "01",
    title: "Vol-Arb Statbook",
    track: "QUANT",
    summary: "Intraday volatility reversion engine across index futures.",
    narrative: [
      "Built the full research-to-execution loop: signal research in notebooks, promotion to a compiled strategy running colocated.",
      "Designed a per-venue fill model with adverse-selection penalization; slippage estimates re-fit nightly in an automated walk-forward harness.",
      "Risk layer enforces hard drawdown governors realized at the position-management thread — never downstream at the broker gateway.",
    ],
    metrics: [
      { label: "SHARPE", value: "2.71" },
      { label: "MAX DD", value: "-4.2%" },
      { label: "FILL LAT", value: "94μs" },
      { label: "TURNOVER", value: "$41M" },
    ],
    stack: ["Rust", "Polars", "NumPy", "kdb+", "Fix-4.4"],
    code: `let sig = zscore(spread, 20) * beta_adj(vix);
if sig.abs() > T_ENTRY && inv_ok(px, qty) {
  route_pegged(venue, px - 1tick, qty);
}`,
    icon: Sigma,
  },
  {
    id: "seqrank",
    index: "02",
    title: "Sequence Fill-Ranker",
    track: "ML",
    summary: "Transformer predicting short-horizon fill probability per quote.",
    narrative: [
      "Causal transformer over order-book delta streams with GQA heads to keep KV-cache footprint inside the tick budget.",
      "Two-stage curriculum: masked pretraining over 1.2T raw tokens, then supervised fine-tune on labeled executed orders.",
      "Serving path quantized to int8 with a CUDA graph capture; feature parity validated against the offline scorer bit-for-bit.",
    ],
    metrics: [
      { label: "AUC", value: "0.934" },
      { label: "P99 LAT", value: "11ms" },
      { label: "PARAMS", value: "184M" },
      { label: "TOKENS", value: "1.2T" },
    ],
    stack: ["PyTorch", "Triton", "vLLM", "Ray", "Weights&Bias"],
    code: `loss = masked_ce(logits, fills)
if step % 1k == 0:
    eval_regret(risk_model, shard=fills_val)
    policy.snapshot(ema=0.99)`,
    icon: BrainCircuit,
  },
  {
    id: "fabric",
    index: "03",
    title: "Execution Fabric",
    track: "SWE",
    summary: "Kernel-bypass messaging mesh for colocated strategy engines.",
    narrative: [
      "Designed a zero-copy ring-buffer transport; strategies slot in as isolated processes with shared, lock-free state views.",
      "Observability built in at the frame level: every wire message is accounted with a monotonic tag for loss/latency attribution.",
      "Zero leak regressions over a 10-month window, enforced by fuzzing in CI and fault injection in staging.",
    ],
    metrics: [
      { label: "P99 E2E", value: "1.9ms" },
      { label: "UPTIME", value: "99.98%" },
      { label: "SVC", value: "27" },
      { label: "LEAKS", value: "0" },
    ],
    stack: ["Rust", "C++20", "io_uring", "DPDK", "NATS"],
    code: `fn on_frame(m: &Frame) -> Cmd {
  match m.tag() {
    TAG_FILL => risk.on_fill(m)?,
    TAG_ACK  => recon.corr(m.seq()),
    _ => metrics.inc("unknown_tag"),
  }
}`,
    icon: Boxes,
  },
];

function DeckCard({
  project,
  i,
  total,
  containerProgress,
}: {
  project: Project;
  i: number;
  total: number;
  containerProgress: MotionValue<number>;
}) {
  const Icon = project.icon;
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const codeRotate = useTransform(scrollYProgress, [0, 1], [3, -3]);
  const codeY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  // this card shrinks + dims while the NEXT card slides over it
  const segStart = Math.min((i + 1) / total, 1);
  const segEnd = Math.min((i + 2) / total, 1);
  const scale = useTransform(
    containerProgress,
    [segStart, segEnd],
    [1, i === total - 1 ? 1 : 0.92]
  );
  const dim = useTransform(
    containerProgress,
    [segStart, segEnd],
    [0, i === total - 1 ? 0 : 0.55]
  );

  return (
    <div className="h-screen-scrub" style={{ height: i === total - 1 ? "auto" : "100vh" }}>
      <div
        className="sticky top-[10vh]"
        style={{ zIndex: i }}
      >
        <motion.div style={{ scale, transformOrigin: "center top" }}>
          <div className="border-line grid grid-cols-1 border bg-panel md:grid-cols-2">
            {/* left: pinned schematic */}
            <div className="border-line relative min-h-[300px] overflow-hidden border-b p-6 md:min-h-[420px] md:border-r md:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-dim font-mono text-[10px] tracking-[0.3em]">
                  [SCHEM_{project.index}]
                </span>
                <Icon className="text-muted h-4 w-4" strokeWidth={1.25} />
              </div>
              <motion.pre
                style={{ rotate: codeRotate, y: codeY }}
                className="border-line mt-5 border bg-base p-4 font-mono text-[11px] leading-relaxed text-muted"
              >
                {project.code}
              </motion.pre>
              <div className="border-line mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4">
                {project.metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-dim font-mono text-[9px] tracking-[0.25em]">{m.label}</div>
                    <div className="font-mono text-lg tracking-[-0.03em] text-fg">{m.value}</div>
                  </div>
                ))}
              </div>
              {/* faint schematic grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(#18181B 1px, transparent 1px), linear-gradient(90deg, #18181B 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                }}
              />
            </div>

            {/* right: narrative */}
            <div className="p-6">
              <div className="flex items-baseline gap-4">
                <span className="text-dim font-mono text-[10px] tracking-[0.3em]">
                  PRJ/{project.index}
                </span>
                <span
                  className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                    project.track === "QUANT" ? "text-accent" : "text-dim"
                  }`}
                >
                  {project.track}
                </span>
              </div>
              <h3 className="font-sans mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg">
                {project.title}
              </h3>
              <p className="mt-2 text-sm font-medium tracking-wide text-muted">{project.summary}</p>
              <div className="mt-5 space-y-4">
                {project.narrative.map((p, j) => (
                  <div key={j} className="flex gap-3">
                    <span className="text-dim shrink-0 pt-0.5 font-mono text-[10px]">
                      [LOG.{String(j + 1).padStart(2, "0")}]
                    </span>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{p}</p>
                  </div>
                ))}
              </div>
              <div className="border-line mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase"
                    style={{ padding: "3px 8px", border: "1px solid #2A2A30" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* dim veil when buried under the next card */}
          <motion.div
            style={{ opacity: dim }}
            className="pointer-events-none absolute inset-0 bg-base"
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function ProjectDeck() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref}>
      {PROJECTS.map((p, i) => (
        <DeckCard
          key={p.id}
          project={p}
          i={i}
          total={PROJECTS.length}
          containerProgress={scrollYProgress}
        />
      ))}
      <div className="border-line mt-10 border-t pt-4 font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
        [END_OF_ARCHIVE // DECK_SCRUB v1]
      </div>
    </div>
  );
}
