"use client";

import { MotionConfig } from "framer-motion";

/**
 * Global animation gate: automatically strips/simplifies animations when
 * the OS-level prefers-reduced-motion setting is enabled.
 */
export default function MotionGate({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
