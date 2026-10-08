import Hero from "@/components/hero/Hero";
import BentoStats from "@/components/BentoStats";
import TrackSwitcher from "@/components/tracks/TrackSwitcher";
import ProjectDeck from "@/components/projects/ProjectDeck";
import TerminalFooter from "@/components/footer/TerminalFooter";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Hero />
      <BentoStats />

      <section id="tracks" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10">
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
            [03]&nbsp;//&nbsp;TRIPLE_TRACK_MATRIX
          </div>
          <h2 className="font-sans mt-3 text-4xl font-semibold tracking-[-0.04em] text-fg md:text-5xl">
            One practice. <span className="text-muted">Three disciplines.</span>
          </h2>
        </div>
        <TrackSwitcher />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-10">
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
            [04]&nbsp;//&nbsp;PROJECT_ARCHIVE
          </div>
          <h2 className="font-sans mt-3 text-4xl font-semibold tracking-[-0.04em] text-fg md:text-5xl">
            Four builds, <span className="text-muted">all open source.</span>
          </h2>
        </div>
        <ProjectDeck />
      </section>

      <TerminalFooter />
    </main>
  );
}
