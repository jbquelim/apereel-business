import { GrowthSignal } from "@/components/growth-signal";
import { ProofScroll } from "@/components/proof-scroll";
import { RankingExplorer } from "@/components/ranking-explorer";
import { ResultsScroll } from "@/components/results-scroll";
import { SiteAudit } from "@/components/site-audit";

export default function Home() {
  return (
    <main id="main">
      <SiteAudit />
      <GrowthSignal />
      <ProofScroll />
      <div aria-hidden className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <div className="border-t border-white/10" />
      </div>
      <RankingExplorer />
      <ResultsScroll />
    </main>
  );
}
