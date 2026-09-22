import { GrowthProof } from "@/components/growth-proof";
import { KeywordPerformance } from "@/components/keyword-performance";
import { ProofSection } from "@/components/proof-section";
import { RealityCheck } from "@/components/reality-check";
import { SiteAudit } from "@/components/site-audit";

export default function Home() {
  return (
    <main id="main">
      <SiteAudit />
      <RealityCheck />
      <ProofSection />
      <KeywordPerformance />
      <GrowthProof />
    </main>
  );
}
