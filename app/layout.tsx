import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import MotionGate from "@/components/MotionGate";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHRXVXN — Quant × ML × SWE",
  description:
    "Engineering portfolio: low-latency C++ market infrastructure, JVM LLM inference, and Python alpha research. Source in /Project Larp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) mutate body attrs pre-hydration */}
      <body
        suppressHydrationWarning
        className="font-sans bg-base text-muted"
      >
        <MotionGate>{children}</MotionGate>
      </body>
    </html>
  );
}
