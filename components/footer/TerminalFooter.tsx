"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Line = { kind: "in" | "out" | "err"; text: string };

const HELP = [
  "/help        list commands",
  "/resume      download resume (PDF)",
  "/contact     open mail compose",
  "/github      open github profile",
  "/tracks      switch portfolio context",
  "/clear       wipe terminal",
];

export default function TerminalFooter() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "VOSS_TERMINAL v2.7.1 — type /help for commands" },
  ]);
  const [pending, setPending] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, pending]);

  const print = (arr: Line[]) => setLines((prev) => [...prev, ...arr]);

  const exec = (cmd: string) => {
    const c = cmd.trim();
    if (!c) return;
    print([{ kind: "in", text: c }]);

    switch (c.toLowerCase()) {
      case "/help":
        print(HELP.map((t) => ({ kind: "out" as const, text: t })));
        break;
      case "/resume":
        print([{ kind: "out", text: "resume.pdf → initiating download…" }]);
        window.open("/resume.pdf", "_blank");
        break;
      case "/contact":
        print([{ kind: "out", text: "opening mail compose → hello@voss.dev" }]);
        window.location.href = "mailto:hello@voss.dev";
        break;
      case "/github":
        print([{ kind: "out", text: "opening github.com/avoss…" }]);
        window.open("https://github.com", "_blank");
        break;
      case "/tracks":
        print([{ kind: "out", text: "context switch → heading to [TRK] section" }]);
        document.querySelector("#tracks")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "/clear":
        setLines([]);
        break;
      default:
        print([
          { kind: "err", text: `unknown command: ${c} — try /help` },
        ]);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = inputRef.current?.value ?? "";
    if (inputRef.current) inputRef.current.value = "";
    if (v.trim()) exec(v);
  };

  return (
    <footer
      id="contact"
      className="border-linebright relative z-10 border-t bg-base"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
          [SYS.BOOT]&nbsp;TERMINAL_ACCESS
        </div>
        <h2 className="font-sans mt-3 text-4xl font-semibold tracking-[-0.03em] text-fg md:text-5xl">
          Open a channel<span className="text-accent">.</span>
        </h2>

        <div
          ref={scrollRef}
          className="border-line mt-8 h-64 overflow-y-auto border bg-panel p-4 font-mono text-[11px] leading-[1.7] text-muted"
        >
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {l.kind === "in" && <span className="text-accent">guest@voss:~$&nbsp;</span>}
              {l.kind === "err" && (
                <span className="font-mono text-[#FF5C00]">! </span>
              )}
              <span className={l.kind === "err" ? "text-[#FF5C00]/80" : l.kind === "in" ? "text-fg" : ""}>
                {l.text}
              </span>
            </div>
          ))}
          <form onSubmit={onSubmit} className="mt-1 flex items-center">
            <span className="text-accent shrink-0">guest@voss:~$&nbsp;</span>
            <input
              ref={inputRef}
              className="w-full bg-transparent text-fg caret-[#00FF66] outline-none placeholder:text-dim"
              placeholder="type a command — /help"
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>

        <div className="border-line mt-8 flex flex-col gap-3 border-t pt-6 font-mono text-[10px] tracking-[0.2em] text-dim uppercase md:flex-row md:items-center md:justify-between">
          <span>© 2026 ADRIAN VOSS — ALL SIGNALS MONITORED</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => (window.location.href = "mailto:hello@voss.dev")}
              className="transition-colors hover:text-accent"
            >
              EMAIL ↗
            </button>
            <button
              type="button"
              onClick={() => window.open("https://github.com", "_blank")}
              className="transition-colors hover:text-accent"
            >
              GITHUB ↗
            </button>
            <button
              type="button"
              onClick={() => window.open("/resume.pdf", "_blank")}
              className="transition-colors hover:text-accent"
            >
              RESUME ↗
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
