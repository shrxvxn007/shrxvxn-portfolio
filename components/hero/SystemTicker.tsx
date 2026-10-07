"use client";

import { useEffect, useState } from "react";

/**
 * Monospace system status ticker. Fixed to the hero's top bar.
 * Simulated low-latency parameters + live local clock + availability.
 */
export default function SystemTicker() {
  const [time, setTime] = useState("--:--:--");
  const [params, setParams] = useState({ lat: "0.42ms", pnl: "002.14", k: "4/4" });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(
          d.getSeconds()
        ).padStart(2, "0")}`
      );
      // low-noise synthetic telemetry
      setParams((prev) => ({
        lat: (0.38 + Math.random() * 0.2).toFixed(2) + "ms",
        pnl:
          prev.pnl === "002.14"
            ? "002.09"
            : (Number(prev.pnl) + (Math.random() - 0.5) * 0.03).toFixed(2).padStart(6, "0"),
        k: Math.random() > 0.03 ? "4/4" : "3/4",
      }));
    };
    const t = setInterval(tick, 1000);
    tick();
    return () => clearInterval(t);
  }, []);

  const items = [
    "SYS.READY",
    `LOCAL ${time}`,
    `E2E.LATENCY ${params.lat}`,
    `FEED.LINKS ${params.k}`,
    `SIM.PNL Δ ${params.pnl}`,
    "AVAILABILITY 99.98%",
    "BUILD v2.7.1",
    "REGION US-EAST-1",
  ];

  return (
    <div className="border-line relative z-20 w-full overflow-hidden border-b bg-base/80 backdrop-blur-sm">
      <div className="animate-ticker-scroll flex w-max items-center whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span
                key={item + copy}
                className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase"
              >
                <span className="text-linebright mx-4 select-none">/</span>
                <span className={item.startsWith("LOCAL") ? "text-fg" : ""}>{item}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
