import { Approach } from "@/components/approach";
import { CaseStudies } from "@/components/case-studies";
import { Contact } from "@/components/contact";
import { CreativeShowcase } from "@/components/creative-showcase";
import { Founder } from "@/components/founder";
import { Hero } from "@/components/hero";
import { Perspectives } from "@/components/insights";
import { Philosophy } from "@/components/philosophy";
import { Principles } from "@/components/principles";
import { Services } from "@/components/services";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Philosophy />
      <Approach />
      <Services />
      <CreativeShowcase />
      <CaseStudies />
      <Founder />
      <Principles />
      <Perspectives />
      <Contact />
    </main>
  );
}
