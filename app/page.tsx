import { GrowthProof } from "@/components/growth-proof";
import { GrowthSignal } from "@/components/growth-signal";
import { KeywordPerformance } from "@/components/keyword-performance";
import { ProofSection } from "@/components/proof-section";
import { SiteAudit } from "@/components/site-audit";

export default function Home() {
  return (
    <main id="main">
      <SiteAudit />
      <GrowthSignal />
      <ProofSection />
      <div aria-hidden className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <div className="border-t border-white/10" />
      </div>
      <KeywordPerformance />
      <GrowthProof />
    </main>
  );
}
