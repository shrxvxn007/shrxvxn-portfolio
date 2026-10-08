import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import MotionGate from "@/components/MotionGate";
import ThemeToggle from "@/components/ThemeToggle";
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
  title: "Shravan Mudduluru — Quant × ML × SWE",
  description:
    "Engineering portfolio: low-latency C++ market infrastructure, JVM LLM inference, and Python alpha research. Source in /Project Larp.",
};

// Applies the persisted light theme before first paint to avoid a flash.
const themeInit = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) mutate body attrs pre-hydration */}
      <body
        suppressHydrationWarning
        className="font-sans bg-base text-muted"
      >
        <ThemeToggle />
        <MotionGate>{children}</MotionGate>
      </body>
    </html>
  );
}
