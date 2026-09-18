// Dedicated service pages: the rankable surface for service-intent searches.
// Copy expands the positioning in lib/site.ts — same claims, same proof,
// no invented numbers (confidentiality-claims).

export type ServicePage = {
  slug: string;
  tag: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  deliverablesLabel: string;
  deliverables: { name: string; detail: string }[];
  fit: string;
  proof: string;
  faqs: { question: string; answer: string }[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "research-competitive-analysis",
    tag: "Research & Competitive Analysis",
    title: "Find out why customers aren't buying",
    metaTitle: "Research & Competitive Analysis for E-Commerce",
    metaDescription:
      "Competitive research that finds the commercial levers moving revenue: assortment gaps, pricing position, and why customers choose your competitors.",
    intro: [
      "Most agencies measure traffic. We measure why customers buy, and why they don't.",
      "Before we recommend anything, we study your market: the companies already winning, the high-demand searches driving their visibility, and where customers are still underserved. We crawl competitors' live product data — real assortment, real prices — not survey estimates.",
      "The output is not a report that flatters the data you already have. It is a map of the commercial levers that actually move revenue: assortment gaps, pricing position, merchandising, channel mix, and the experience that turns browsers into buyers.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Competitor assortment analysis",
        detail:
          "Live crawls of competitor catalogs: category depth, product counts, price ranges, and where their inventory beats yours.",
      },
      {
        name: "Pricing position",
        detail:
          "Where your prices sit against the market for comparable products, and which categories are losing on price rather than marketing.",
      },
      {
        name: "Demand mapping",
        detail:
          "The searches your market actually uses, who owns them today, and which ones your business deserves to win.",
      },
      {
        name: "Opportunity map",
        detail:
          "A ranked list of moves: what to fix, what to build, and what to amplify — each tied to a revenue case, not a vanity metric.",
      },
    ],
    fit: "For e-commerce businesses that suspect the real problem isn't marketing — and want evidence before spending another dollar on it.",
    proof:
      "This research-first method is how we found the inventory and pricing problems behind a client's flat SEO results — and drove 20X revenue growth in four years by fixing the business first.",
    faqs: [
      {
        question: "Why start with research instead of going straight to marketing?",
        answer:
          "Because marketing amplifies whatever is already true about your business. If competitors beat you on price, selection, or availability, more advertising makes that problem more expensive, not smaller. Research tells you what deserves amplification and what needs fixing first.",
      },
      {
        question: "How is this different from the audit an agency already gave us?",
        answer:
          "Most agency audits grade your website: meta tags, page speed, content gaps. We grade your business against the companies actually winning your market — real assortment, real prices, crawled from their live catalogs. The website audit tells you how to play the game slightly better. This tells you whether you're playing the right game.",
      },
      {
        question: "What data does the research use?",
        answer:
          "Live crawls of competitor product catalogs — category depth, product counts, price ranges — plus the search demand data for your market and your own analytics and sales data. Evidence, not survey estimates or industry benchmarks.",
      },
      {
        question: "What do we get at the end?",
        answer:
          "A ranked opportunity map: what to fix, what to build, and what to amplify, each tied to a revenue case. It's designed to direct your next dollar of effort — whether you spend it with us or not.",
      },
    ],
  },
  {
    slug: "seo",
    tag: "SEO",
    title: "Rank for the searches that drive revenue",
    metaTitle: "Business-First SEO for E-Commerce",
    metaDescription:
      "SEO built on inventory depth and business strength, not content volume. Rank for commercial searches because you're the better answer.",
    intro: [
      "Rankings follow from being the better choice for the customer, not from producing more content about topics no one searches.",
      "Most SEO programs produce blog posts and backlinks because those are easy to invoice. We took a different lesson from four years of e-commerce growth: the categories with stronger, deeper inventory consistently outrank those with better 'SEO'. Google rewards businesses that deserve to win the search.",
      "So we strengthen the business case behind every page — assortment, pricing, product data, shopping experience — then make that value unmistakable to search engines.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Commercial keyword strategy",
        detail:
          "Target the searches that end in purchases, ranked by revenue potential — not search volume trophies.",
      },
      {
        name: "Category and product page architecture",
        detail:
          "Structure the catalog around how customers actually shop, so every category page is a landing page that deserves to rank.",
      },
      {
        name: "Technical foundation",
        detail:
          "Crawlability, structured data, performance, and indexation handled as infrastructure — mandatory, not the strategy.",
      },
      {
        name: "Inventory-led content",
        detail:
          "Content built from what you actually sell and know, not filler produced to feed a publishing quota.",
      },
    ],
    fit: "For e-commerce businesses tired of paying for content that ranks for nothing commercial, or agencies that never once looked at the product catalog.",
    proof:
      "This approach ranked a client in the top 5 for over 1,000 keywords — including commercial searches where established national retailers struggle to appear.",
    faqs: [
      {
        question: "What does business-first SEO actually mean?",
        answer:
          "It means treating rankings as a consequence of being the better choice for the customer, not a trick played on the algorithm. We strengthen what a page offers — assortment depth, pricing, product data, shopping experience — and then make that value unmistakable to search engines. Technical SEO is handled as mandatory infrastructure, not sold as the strategy.",
      },
      {
        question: "Why didn't our previous SEO content produce revenue?",
        answer:
          "Usually because it was produced to feed a publishing quota, not to win a commercial search. Blog posts about broad topics attract visitors with no intent to buy — if they rank at all. The searches that end in purchases are won by category and product pages backed by real inventory, and that's where we put the effort.",
      },
      {
        question: "Do you write content at all?",
        answer:
          "Yes — content built from what you actually sell and know. Buying guides that reflect your real assortment, category content that answers real customer questions. What we won't do is invoice you for filler that targets keywords no buyer uses.",
      },
      {
        question: "How long does SEO take to show results?",
        answer:
          "Anyone who quotes a fixed timeline is guessing. What we can control is the order of work: commercial pages with the strongest revenue case first, technical blockers fixed early, and progress measured in rankings for searches that end in purchases — so you can see whether it's working long before it peaks.",
      },
    ],
  },
  {
    slug: "advertising",
    tag: "Advertising",
    title: "Turn ad spend into an investment",
    metaTitle: "E-Commerce Advertising Management",
    metaDescription:
      "Paid advertising built around the offers and products that already deserve to win. Ad spend as investment, not expense.",
    intro: [
      "Ad spend that chases traffic is an expense. Ad spend that amplifies genuine competitive advantage is an investment.",
      "Most underperforming ad accounts share a root cause: the ads are fine, but they point at products with no price advantage, categories with thin selection, or pages that waste the click. More budget makes that problem more expensive.",
      "We build campaigns around the offers, audiences, and products that already deserve to win — after the research has shown which those are.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Campaign strategy from competitive data",
        detail:
          "Spend concentrated where you hold a real advantage: price, selection, availability, or experience.",
      },
      {
        name: "Google & Meta management",
        detail:
          "Full-funnel campaign build and management with budgets accountable to revenue and margin, not clicks.",
      },
      {
        name: "Offer and landing alignment",
        detail:
          "Every ad lands on a page built to convert that specific intent — no generic homepage dumps.",
      },
      {
        name: "Measurement that reaches the business",
        detail:
          "Reporting on qualified traffic, sales, and margin. If performance never reaches the P&L, it isn't performance.",
      },
    ],
    fit: "For businesses spending on ads whose real question is 'why isn't this profitable' — not 'how do I spend more'.",
    proof:
      "Advertising is one lever inside the method that drove 20X e-commerce revenue growth — deployed after pricing and inventory earned the right to amplify.",
    faqs: [
      {
        question: "Our ads aren't profitable. Is the account badly managed?",
        answer:
          "Possibly — but in our experience the more common root cause sits outside the account. Ads pointing at products with no price advantage, categories with thin selection, or pages that waste the click will underperform no matter how well the campaigns are tuned. We diagnose that first, because more budget makes that problem more expensive.",
      },
      {
        question: "Which platforms do you manage?",
        answer:
          "Google and Meta, full-funnel. Platform choice matters less than what the campaigns point at: we concentrate spend where you hold a real advantage in price, selection, availability, or experience.",
      },
      {
        question: "What ad budget do we need?",
        answer:
          "The honest answer: it depends on where you have an advantage worth amplifying. We'd rather run a smaller budget against offers that deserve to win than scale spend into a broken offer. The research tells us which situation you're in before we commit your money.",
      },
      {
        question: "How do you report performance?",
        answer:
          "Against revenue and margin, not clicks. Reporting covers qualified traffic, sales, and what the spend actually returned. If performance never reaches the P&L, it isn't performance.",
      },
    ],
  },
  {
    slug: "web-development",
    tag: "Web Development",
    title: "Ship website changes in hours, not weeks",
    metaTitle: "AI-Assisted Web Development for E-Commerce",
    metaDescription:
      "Stop waiting in an agency's development queue. AI-assisted development ships website changes in hours and cuts cycles from weeks to days.",
    intro: [
      "Your last agency charged you three weeks of development to change a banner.",
      "For most e-commerce teams the constraint is not ideas or strategy — it is the inability to execute without waiting in someone else's queue. Simple UX fixes sit for weeks. Feature requests take months. The compounding cost is every improvement that never ships.",
      "We build digital platforms with AI-assisted development so changes ship in hours. In one engagement, development cycles dropped from three-to-four weeks to under 24 hours — the team shipped more in one month than the previous agency delivered in six.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "E-commerce platform development",
        detail:
          "Shopify and custom storefront work: product discovery, navigation, filtering, and the paths that turn browsing into buying.",
      },
      {
        name: "AI-assisted delivery",
        detail:
          "Modern AI tooling in the development loop — velocity without sacrificing code quality or performance budgets.",
      },
      {
        name: "Performance engineering",
        detail:
          "Core Web Vitals treated as a budget. Fast sites convert better and rank better; slow ones pay twice.",
      },
      {
        name: "Team enablement",
        detail:
          "Internal teams equipped to build, test, and ship without external dependency for every small change.",
      },
    ],
    fit: "For teams whose improvement list is long, whose agency queue is longer, and who are done paying weeks-of-development prices for hours of work.",
    proof:
      "Development cycles cut from 3–4 weeks to under 24 hours in a live engagement — more shipped in one month than the previous agency delivered in six.",
    faqs: [
      {
        question: "How can development be that fast without cutting corners?",
        answer:
          "AI-assisted tooling removes the waiting, not the standards. Every change still passes code review, performance budgets, and testing before it ships. What disappears is the queue: the three weeks a simple change spends waiting for an agency's next sprint.",
      },
      {
        question: "Which platforms do you build on?",
        answer:
          "Shopify and custom storefronts. The focus is the same either way: product discovery, navigation, filtering, and the paths that turn browsing into buying.",
      },
      {
        question: "Can you work alongside our existing team or agency?",
        answer:
          "Yes — and part of the engagement is making you less dependent on anyone, including us. We equip internal teams to build, test, and ship without waiting on an external queue for every small change.",
      },
      {
        question: "Does site speed really affect revenue?",
        answer:
          "Yes, twice over: slow sites convert worse, and Core Web Vitals feed into how search engines evaluate pages. That's why we treat performance as a budget every change must fit inside, not a cleanup project for later.",
      },
    ],
  },
  {
    slug: "conversion-optimization",
    tag: "Conversion Optimization",
    title: "Earn more from the traffic you already have",
    metaTitle: "Conversion Optimization for E-Commerce",
    metaDescription:
      "Fix the paths customers actually take from discovery to purchase. Earn more revenue from every visitor you already have.",
    intro: [
      "You already have demand. The question is how much of it you're wasting.",
      "Before buying more traffic, look at what happens to the traffic you have: where product discovery breaks, where filters fail, where the checkout leaks, and where customers give up on finding what you actually stock.",
      "We fix the paths customers take from discovery to purchase. In one engagement, rebuilding product discovery around how people actually shop improved discovery by 35% — customers found products faster, bounce rates dropped, and the assortment finally performed at the level it deserved.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Purchase-path audit",
        detail:
          "Where visitors drop between landing and order: navigation, search, filtering, product pages, cart, and checkout.",
      },
      {
        name: "Product discovery rebuilds",
        detail:
          "Navigation and filtering built around how customers shop your category — not how the org chart is structured.",
      },
      {
        name: "Decision-confidence fixes",
        detail:
          "The trust, information, and comparison gaps that stall purchases, fixed page by page.",
      },
      {
        name: "Measured iteration",
        detail:
          "Changes shipped fast, measured against revenue per visitor, kept or killed on evidence.",
      },
    ],
    fit: "For stores with real traffic and an underperforming conversion rate — especially where strong assortment is hidden behind weak product discovery.",
    proof:
      "Product discovery improved 35% in a live engagement: faster finding, lower bounce, and an assortment that finally performed to its potential.",
    faqs: [
      {
        question: "When does conversion work make more sense than buying more traffic?",
        answer:
          "When you already have real traffic and an underperforming conversion rate. Every point of conversion you recover makes every future marketing dollar work harder — fixing the leak before turning up the tap is almost always the better sequence.",
      },
      {
        question: "Is this A/B testing button colors?",
        answer:
          "No. The biggest conversion problems are structural: customers who can't find what you actually stock, filters that fail, checkouts that leak. We fix the paths customers take from discovery to purchase, then measure changes against revenue per visitor — kept or killed on evidence.",
      },
      {
        question: "How do you find what's actually broken?",
        answer:
          "A purchase-path audit: where visitors drop between landing and order, across navigation, search, filtering, product pages, cart, and checkout. The data shows where demand is being wasted; the fixes follow the evidence, not opinion.",
      },
      {
        question: "What does better product discovery actually change?",
        answer:
          "In one engagement, rebuilding product discovery around how customers actually shop improved discovery by 35% — customers found products faster, bounce rates dropped, and an assortment that was always strong finally performed like it.",
      },
    ],
  },
  {
    slug: "premium-creative",
    tag: "Premium Creative",
    title: "Compete visually without the six-figure budget",
    metaTitle: "Premium Creative Production for E-Commerce",
    metaDescription:
      "Campaign and product creative at global-brand production quality, delivered with AI-assisted workflows at a fraction of the cost.",
    intro: [
      "Customers judge your business by its creative before they read a word. Competing against companies ten times your size used to mean six-figure production budgets — or looking like the smaller player you are.",
      "AI-assisted creative workflows changed that equation. Production quality that matches global brands is now a process problem, not a budget problem — if the direction is right.",
      "We produce campaign, product, and brand creative that holds its own next to the biggest players in your market, art-directed so it looks designed, not generated.",
    ],
    deliverablesLabel: "What the work covers",
    deliverables: [
      {
        name: "Campaign creative",
        detail:
          "Hero imagery, seasonal campaigns, and ad creative produced at volume without the volume price tag.",
      },
      {
        name: "Product visualization",
        detail:
          "Product imagery and motion that makes the catalog feel premium — often the difference in a comparison shopper's decision.",
      },
      {
        name: "Brand-compliant execution",
        detail:
          "Work inside exacting brand standards — we've maintained full brand authorization across multiple global-brand partnerships.",
      },
      {
        name: "Creative direction",
        detail:
          "AI output is only as good as its direction. Every asset passes an art-direction bar before a customer sees it.",
      },
    ],
    fit: "For businesses whose creative budget can't match their competitors' — but whose creative can no longer afford to look it.",
    proof:
      "Brand-compliant storefronts and creative maintained across global-brand partnerships while contributing to 20X revenue growth.",
    faqs: [
      {
        question: "How do you keep AI-produced creative from looking generated?",
        answer:
          "Direction. AI output is only as good as the art direction behind it, so every asset passes a direction bar — composition, lighting, brand consistency — before a customer ever sees it. The tools changed the economics of production; they didn't change what good creative looks like.",
      },
      {
        question: "Can you work within strict brand guidelines?",
        answer:
          "Yes. We've maintained full brand authorization across multiple global-brand partnerships — work that gets reviewed against exacting brand standards, not just a style preference.",
      },
      {
        question: "What kinds of assets do you produce?",
        answer:
          "Campaign creative — hero imagery, seasonal campaigns, ad creative — plus product imagery and motion that makes a catalog feel premium. Volume production without the volume price tag.",
      },
      {
        question: "Does creative quality really move revenue?",
        answer:
          "Customers judge your business by its creative before they read a word. For a comparison shopper deciding between you and a bigger competitor, premium product presentation is often the difference — and it used to be the one advantage money alone could buy. Not anymore.",
      },
    ],
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((s) => s.slug === slug);
}
