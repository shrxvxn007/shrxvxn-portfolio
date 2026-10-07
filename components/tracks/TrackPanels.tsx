"use client";

import { motion } from "framer-motion";
import type { Track } from "./TrackContext";
import EquityChart from "../charts/EquityChart";
import LossChart from "../charts/LossChart";
import ContributionGraph from "../charts/ContributionGraph";

const panelVariants = {
  enter: { clipPath: "inset(0 100% 0 0)" },
  center: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    clipPath: "inset(0 0 0 100%)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-line border-t pt-3">
      <div className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">{label}</div>
      <div className="mt-1 font-mono text-xl tracking-[-0.03em] text-fg md:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

function QuantPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div className="border-line col-span-2 border-b p-6 md:border-r md:border-b-0">
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">[QNT]&nbsp;REPLAY_BACKTEST</div>
        <div className="font-sans mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">
          Aster — MM Backtest over ITCH Replay
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          Avellaneda–Stoikov market-making over a deterministic ITCH replay
          pipeline: queue-position-aware quotes, Poisson fill probability,
          toxicity widening, and a 100M-event JSON golden for reproducibility.
        </p>
        <div className="mt-6">
          <EquityChart seed={7} height={150} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Events" value="100M" />
          <Metric label="Replay" value="104s" />
          <Metric label="Callbacks" value="p50 128ns" />
          <Metric label="Engine P50" value="32ns" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[STRAT]&nbsp;QUOTE_PIPELINE</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`ITCH S/A/E/C/D/L
  → MatchingEngine<Callback>
  → QueueTracker (vol ahead)
  → MmStrategy (A-S quote)
  → Analytics (PnL/Sharpe)
RISK pos-limit · throttle · DD-kill`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="Perf floor" value="10M/s" sub="CI-gated" />
          <Metric label="Hot path" value="0 alloc" sub="pooled orders" />
        </div>
      </div>
    </div>
  );
}

function MLPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div className="border-line col-span-2 border-b p-6 md:border-r md:border-b-0">
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">[ML]&nbsp;INFERENCE_ENGINE</div>
        <div className="font-sans mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">
          AuraTensor — Llama on the JVM
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          GGUF Llama 3 / Mistral inference in pure Java 21+: memory-mapped
          weights via the FFM API, a Vector-API SIMD kernel suite, and a fused
          Q4_0/Q8_0 dequant loop — zero third-party dependencies, no GPU.
        </p>
        <div className="mt-6">
          <LossChart height={150} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Runtime deps" value="0" />
          <Metric label="Tests" value="49" />
          <Metric label="KV-cache ctx" value="8,192" />
          <Metric label="1B Q4_0 t/s" value="2.35" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[ARCH]&nbsp;KERNEL_STACK</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`GGUF v3 ─→ mmap (FFM MemorySegment)
  ├─ SGEMM   vector-api
  ├─ RMSNorm · Softmax
  ├─ RoPE    · SiLU
  └─ Q4_0/Q8_0 fused dequant
SAMPLER greedy · top-k · top-p`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="Server" value="SSE" sub="virtual threads" />
          <Metric label="Platforms" value="3" sub="linux·mac·win" />
        </div>
      </div>
    </div>
  );
}

function SWEPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div className="border-line col-span-2 border-b p-6 md:border-r md:border-b-0">
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">[SWE]&nbsp;SYSTEMS</div>
        <div className="font-sans mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">
          RetroVM — Time-Travel Debugging
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          Deterministic record-and-replay VM in C++20: token-threaded dispatch
          via labels-as-values, mmap-backed .trace logs with cycle-level
          divergence detection, and a 256-deep snapshot ring for rewind.
        </p>
        <div className="mt-6">
          <ContributionGraph weeks={40} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Dispatch" value="540 MIPS" />
          <Metric label="Per op" value="1.85 ns" />
          <Metric label="Rewind" value="~3 µs" />
          <Metric label="Checkpoint" value="64 B" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[VM]&nbsp;REPL_SURFACE</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`(retrovm) breakpoint 0x20
(retrovm) continue
*** Breakpoint 0x20 hit ***
(retrovm) back 200        ← snapshot ring
(retrovm) save ckpt.state
  → 64-byte RVMSTATE magic`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="Phases" value="6/6" sub="roadmap done" />
          <Metric label="Bench gate" value="sub-ms" sub="CI-enforced" />
        </div>
      </div>
    </div>
  );
}

const panels: Record<Track, () => React.ReactElement> = {
  QUANT: QuantPanel,
  ML: MLPanel,
  SWE: SWEPanel,
};

export default function TrackPanels({ track }: { track: Track }) {
  const Panel = panels[track];
  return (
    <motion.div
      key={track}
      variants={panelVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="border-line border bg-panel"
    >
      <Panel />
    </motion.div>
  );
}
