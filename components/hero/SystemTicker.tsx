"use client";

import { useEffect, useState } from "react";

/**
 * Monospace system status ticker. Fixed to the hero's top bar.
 * Real build stats from the Project Larp repos + live local clock.
 */
export default function SystemTicker() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(
          d.getSeconds()
        ).padStart(2, "0")}`
      );
    };
    const t = setInterval(tick, 1000);
    tick();
    return () => clearInterval(t);
  }, []);

  const items = [
    "SYS.READY",
    `LOCAL ${time}`,
    "ASTER 30.8M EV/S",
    "ASTER P99 128NS",
    "RETROVM 1.85NS/OP",
    "AURATENSOR DEPS 0",
    "ASTER 100M EVENT GOLDEN",
    "REPLAY DETERMINISTIC",
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
