"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sigma, BrainCircuit, Boxes, Cpu } from "lucide-react";

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
    id: "aster",
    index: "01",
    title: "Aster",
    track: "QUANT",
    summary:
      "C++20 low-latency matching engine, ITCH replay harness and Avellaneda–Stoikov market-making backtester.",
    narrative: [
      "Event-driven limit order book with price-time priority, multi-symbol books and a pre-allocated OrderPool — zero heap allocation on the hot path.",
      "100M-event deterministic replay pipeline captured as a regenerable JSON golden; engine-only p50 is 32ns at 30.85M events/sec on Apple silicon, with a CI perf floor of 10M events/s.",
      "Queue-position-aware quoting with Poisson fill probability, toxicity-driven spread widening, and a risk manager enforcing position limits, order throttling and a drawdown kill-switch.",
    ],
    metrics: [
      { label: "THROUGHPUT", value: "30.8M/s" },
      { label: "P50", value: "32ns" },
      { label: "P99", value: "128ns" },
      { label: "GOLDEN", value: "100M ev" },
    ],
    stack: ["C++20", "CMake", "ITCH L2/L3", "HDR histogram", "clang-tidy"],
    code: `// Avellaneda-Stoikov reservation price
double sigma = p.gamma * p.sigma * p.sigma * time_remaining;
double reservation = mid_price - (double)inventory * sigma;
double half_spread = p.base_spread +
  0.5 * (sigma + (1.0 / p.kappa) * log(1.0 + p.gamma / p.kappa));
// fixed-point tick snap, compiler-independent
bid_px = (bid_px / tick_px) * tick_px;`,
    icon: Sigma,
  },
  {
    id: "vesper",
    index: "02",
    title: "Vesper",
    track: "QUANT",
    summary:
      "Alternative-data statistical-arbitrage engine: weekly cross-sectional alpha from SEC filings and a supply-chain graph.",
    narrative: [
      "SEC EDGAR ingestion with a compliant User-Agent, then MD&A extraction (10-Q Item 2 / 10-K Item 7) via BeautifulSoup with regex-anchored heading detection.",
      "Information-decay factor from TF-IDF cosine similarity between consecutive quarterly filings, plus 1-step directed shock propagation across the customer/supplier graph.",
      "Institutional-grade allocator: PurgedGroupTimeSeriesSplit + L2 Ridge alpha model, sector factor neutralization, and a cvxpy convex optimizer with dollar-neutrality and ±3% name caps.",
    ],
    metrics: [
      { label: "SIGNALS", value: "EDGAR+graph" },
      { label: "ALLOCATOR", value: "convex" },
      { label: "NAME CAP", value: "±3%" },
      { label: "TESTS", value: "unit+integ" },
    ],
    stack: ["Python", "cvxpy", "pandas", "BeautifulSoup", "scikit-learn"],
    code: `# information decay between consecutive MD&A filings
sim = cosine(tfidf(mda[q]), tfidf(mda[q - 1]))
decay = clip(1.0 - sim, 0.0, 1.0)

# cross-sectional allocation
w = cp.Variable(n)
cp.Problem(cp.Minimize(risk(w) + tc(w)),
  [cp.sum(w) == 0, cp.abs(w) <= 0.03]).solve()`,
    icon: BrainCircuit,
  },
  {
    id: "auratensor",
    index: "03",
    title: "AuraTensor",
    track: "ML",
    summary:
      "Zero-dependency, off-heap, SIMD-accelerated LLM inference engine in pure Java — runs GGUF Llama/Mistral without JNI or a GPU.",
    narrative: [
      "Off-heap tensor engine on the Foreign Function & Memory API: weights are memory-mapped straight from GGUF v3 files, so the JVM never copies them.",
      "SIMD kernel suite on the JDK Vector API — hardware-accelerated GEMM, RMSNorm, Softmax, RoPE and SiLU — with a fused Q4_0/Q8_0 dequantization inner loop that unpacks nibbles straight into vector registers.",
      "OpenAI-compatible HTTP server on virtual threads with SSE streaming, an 8,192-token off-heap KV-cache that never triggers GC, and 49 JUnit tests green on the CI matrix.",
    ],
    metrics: [
      { label: "DEPS", value: "0" },
      { label: "TESTS", value: "49" },
      { label: "CTX", value: "8,192" },
      { label: "QUANT", value: "Q4_0/Q8_0" },
    ],
    stack: ["Java 21+", "Vector API", "FFM MemorySegment", "GGUF v3", "JMH"],
    code: `// SIMD sgemv over raw MemorySegments — y = A·x
for (int m = 0; m < M; m++) {
  var acc = FloatVector.zero(SPEC);
  for (int k = 0; k < K; k += SPEC.length())
    acc = acc.add(a.getVector(m, k).mul(b.getVector(k)));
  y[m] = acc.reduceLanes(ADD);
}`, 
    icon: Boxes,
  },
  {
    id: "retrovm",
    index: "04",
    title: "RetroVM",
    track: "SWE",
    summary:
      "Deterministic record-and-replay virtual machine with a time-travel debugger, written from scratch in C++20.",
    narrative: [
      "Token-threaded interpreter using labels-as-values with a single indirect branch per opcode — measured 1.85ns per instruction (540 MIPS) on a 12-opcode ISA.",
      "Record/replay via mmap-backed .trace logs with cycle-level divergence detection; non-deterministic IN/RAND events are re-injected byte-for-byte on replay.",
      "Time-travel debugging over a 256-deep snapshot ring: mid-program 64-byte state checkpoints and sub-millisecond rewind (~3µs per back-step, bench-gated in CI).",
    ],
    metrics: [
      { label: "DISPATCH", value: "540 MIPS" },
      { label: "PER OP", value: "1.85ns" },
      { label: "REWIND", value: "~3µs" },
      { label: "CHECKPOINT", value: "64 B" },
    ],
    stack: ["C++20", "labels-as-values", "mmap", "POSIX", "ctest"],
    code: `; demo.asm — assembled to a 32-bit fixed encoding
LI    R0, 5
LI    R1, 7
ADD   R2, R0, R1      ; R2 = 12
STORE R2, [0x100]
LOAD  R3, [0x100]
JNZ   R3, done
HALT`,
    icon: Cpu,
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
                    "linear-gradient(rgb(var(--c-line)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-line)) 1px, transparent 1px)",
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
                    style={{ padding: "3px 8px", border: "1px solid rgb(var(--c-linebright))" }}
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
