import { Approach } from "@/components/approach";
import { CaseStudies } from "@/components/case-studies";
import { Contact } from "@/components/contact";
import { CreativeShowcase } from "@/components/creative-showcase";
import { Founder } from "@/components/founder";
import { GrowthProof } from "@/components/growth-proof";
import { Hero } from "@/components/hero";
import { RealityCheck } from "@/components/reality-check";
import { KeywordPerformance } from "@/components/keyword-performance";
import { Perspectives } from "@/components/insights";
import { ProofSection } from "@/components/proof-section";
import { Services } from "@/components/services";
import { SiteAudit } from "@/components/site-audit";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <SiteAudit />
      <RealityCheck />
      <CaseStudies />
      <Approach />
      <Services />
      <ProofSection />
      <KeywordPerformance />
      <GrowthProof />
      <CreativeShowcase />
      <Founder />
      <Perspectives />
      <Contact />
    </main>
  );
}
