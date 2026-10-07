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
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">[QNT]&nbsp;EQUITY_CURVE</div>
        <div className="font-sans mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">
          Backtest — Vol-Arb Statbook
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          24mo intraday reversion strategy, 2,847 executions. Drawdown regime-tested
          against 2022-style rate shock replays.
        </p>
        <div className="mt-6">
          <EquityChart seed={7} height={150} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Sharpe" value="2.71" />
          <Metric label="Max DD" value="-4.2%" />
          <Metric label="Hit Rate" value="58.3%" />
          <Metric label="Turnover" value="$41M/d" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[FEED]&nbsp;MARKET_DATA_STREAM</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`ES    5124.50  ▲ +0.42%
NQ    18220.75 ▲ +0.61%
ZB    118.14   ▼ -0.08%
CL    82.34    ▼ -0.22%
EXO   SIG_9σ   [OK]`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="Fill" value="94 μs" sub="edge→venue" />
          <Metric label="Slippage" value="0.4 bps" sub="median" />
        </div>
      </div>
    </div>
  );
}

function MLPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div className="border-line col-span-2 border-b p-6 md:border-r md:border-b-0">
        <div className="font-mono text-[10px] tracking-[0.3em] text-accent">[ML]&nbsp;TRAINING_RUN</div>
        <div className="font-sans mt-2 text-3xl font-semibold tracking-[-0.03em] text-fg">
          Sequence Ranker — Loss Descent
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          8-layer causal transformer over order-book deltas. Two-stage curriculum:
          masked pretrain → supervised fine-tune on labeled fills.
        </p>
        <div className="mt-6">
          <LossChart height={150} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Params" value="184M" />
          <Metric label="Tokens" value="1.2T" />
          <Metric label="p99 Lat" value="11 ms" />
          <Metric label="AUC" value="0.934" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[ARCH]&nbsp;LAYER_STACK</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`TOKENS ─→ EMBED(64)
  ├─ GQA×8  heads
  ├─ RoPE   pos
  ├─ MLP    4×   swiglu
  └─ LN     pre
RMS-55% prune`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="GPU Hrs" value="6.4K" sub="A100" />
          <Metric label="Regret" value="-3.1%" sub="vs baseline" />
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
          Low-latency Execution Fabric
        </div>
        <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
          Kernel-bypass mesh in Rust + C++ slotting strategies into colocated
          engines. Non-blocking ingest, ring-buffer state, zero-copy serialization.
        </p>
        <div className="mt-6">
          <ContributionGraph weeks={40} />
        </div>
        <div className="border-line mt-4 grid grid-cols-4 gap-4 border-t pt-4">
          <Metric label="Services" value="27" />
          <Metric label="p99 E2E" value="1.9 ms" />
          <Metric label="Uptime" value="99.98%" />
          <Metric label="CRDT Repl" value="×3" />
        </div>
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">[API]&nbsp;ENDPOINT_SCHEMA</div>
          <pre className="border-line mt-3 overflow-x-auto border p-3 font-mono text-[10px] leading-relaxed text-muted">{`POST /v1/orders
  → {venue, qty, px, tif}
  ← 201 {ack: u64, id}
  ×  ibcs_<=2.0ms

GET /v1/fill/stream
  ← ndjson, backpressure:drop`}</pre>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric label="Builds/wk" value="412" sub="green main" />
          <Metric label="Leak RR" value="0" sub="10mo window" />
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
