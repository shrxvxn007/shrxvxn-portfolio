"use client";

import { useEffect, useRef } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Interactive canvas layer: a perspective-warped data grid (low horizon)
 * plus coarse "orbital" particle points (high horizon). Pointer moves the
 * vanishing point; scroll tilts the horizon. Monochrome, near-invisible
 * unless lit — designed to sit behind pin-styled typography.
 */
export default function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const scrollY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let reduced = prefersReducedMotion();
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // theme-aware colors: canvas can't resolve CSS vars, so read the
    // channel triplets from :root and refresh periodically (the theme
    // toggle swaps them via the html.light class)
    let ink = "255 255 255";
    let accent = "0 255 102";
    let colorTick = 0;
    const refreshColors = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = cs.getPropertyValue("--c-canvas-ink").trim() || ink;
      accent = cs.getPropertyValue("--c-accent").trim() || accent;
    };
    refreshColors();

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.tx = (e.clientX - r.left) / r.width;
      pointer.current.ty = (e.clientY - r.top) / r.height;
    };
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // orbital points (pre-computed polar-ish coordinates)
    const ORB_N = 70;
    const orbs = Array.from({ length: ORB_N }, (_, i) => ({
      seed: i * 26.5443 + 7.7,
      r: 0.18 + ((i * 7919) % 100) / 100 * 0.55, // 0.18..0.73
      a: ((i * 104729) % 6283) / 6283, // 0..2π
      s: 0.4 + ((i * 31337) % 100) / 100 * 0.8,
    }));

    let t = 0;
    const draw = () => {
      // static frame if the user prefers reduced motion (still renders layout)
      if (!reduced) t += 0.008;
      if (++colorTick % 60 === 0) refreshColors();
      const p = pointer.current;
      p.x += (p.tx - p.x) * 0.045;
      p.y += (p.ty - p.y) * 0.045;

      const horizon = h * (0.62 - Math.min(scrollY.current / 2400, 0.14));
      // vanishing point drifts with pointer
      const vpx = w * (0.32 + p.x * 0.36);
      const vpy = horizon + (p.y - 0.5) * 26;

      ctx.clearRect(0, 0, w, h);

      // ---- ground grid (perspective lines from vanishing point) ----
      ctx.lineWidth = 1;
      // radial lines
      const RADIALS = 22;
      for (let i = 0; i < RADIALS; i++) {
        const spread = ((i / (RADIALS - 1)) - 0.5) * (w * 2.6);
        ctx.strokeStyle = `rgba(${ink},0.045)`;
        ctx.beginPath();
        ctx.moveTo(vpx, vpy);
        ctx.lineTo(vpx + spread, h + 4);
        ctx.stroke();
      }
      // horizontal depth rows (non-linear spacing = perspective)
      for (let row = 1; row <= 14; row++) {
        const k = row / 14;
        const y = vpy + Math.pow(k, 1.9) * (h - vpy) * 1.1;
        if (y > h + 2) continue;
        const alpha = 0.015 + k * 0.055;
        ctx.strokeStyle = `rgba(${ink},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        // travelling "packet" accent on a few rows
        if (row % 4 === 1) {
          const speed = 110 + row * 40;
          const px = ((t * speed + row * 731) % (w + 220)) - 110;
          const g = ctx.createLinearGradient(px - 90, y, px + 90, y);
          g.addColorStop(0, `rgba(${accent},0)`);
          g.addColorStop(0.5, `rgba(${accent},0.22)`);
          g.addColorStop(1, `rgba(${accent},0)`);
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(px - 90, y);
          ctx.lineTo(px + 90, y);
          ctx.stroke();
        }
      }

      // ---- upper "orbital" layer: scattered points + faint ring arcs ----
      ctx.fillStyle = `rgba(${ink},0.5)`;
      for (const o of orbs) {
        const wob = Math.sin(t * o.s * 1.6 + o.seed) * 0.02;
        const rr = o.r + wob;
        const aa = o.a + t * 0.03 * o.s;
        const x = vpx * 0.5 + w * (0.5 + Math.cos(aa) * rr * 0.72);
        const y = vpy * 0.42 + (horizon - vpy * 0.42) * (Math.sin(aa * 2) * 0.5 + 0.5) * rr;
        const size = o.s > 0.9 ? 1.3 : 0.9;
        ctx.globalAlpha = 0.10 + 0.14 * (o.s * (Math.sin(t + o.seed) * 0.5 + 0.5));
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;

      // faint elliptical orbit arcs
      for (let ring = 0; ring < 3; ring++) {
        const rr = 0.22 + ring * 0.19;
        ctx.strokeStyle = `rgba(${ink},0.05)`;
        ctx.beginPath();
        ctx.ellipse(
          w * 0.5,
          vpy * 0.5,
          w * rr * 0.72,
          (horizon - vpy * 0.42) * rr * 0.9,
          0.22,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    // reduced motion: render one static frame, no animation loop
    if (reduced) {
      draw();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
      };
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
