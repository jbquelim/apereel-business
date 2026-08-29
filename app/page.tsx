import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { BusinessFirstSeo } from "@/components/business-first-seo";
import { CaseStudies } from "@/components/case-studies";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Founder } from "@/components/founder";
import { Hero } from "@/components/hero";
import { Principles } from "@/components/principles";
import { Services } from "@/components/services";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <BusinessFirstSeo />
      <Services />
      <Approach />
      <Experience />
      <CaseStudies />
      <Founder />
      <Principles />
      <Contact />
    </main>
  );
}
