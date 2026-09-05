export const site = {
  name: "Apereel",
  tagline: "Business-First Digital Growth",
  headline: "The method behind",
  headlineLine2: "20X revenue growth.",
  supporting:
    "Digital growth consultancy that drove 20X e-commerce revenue growth in four years. We fix what's actually limiting your business: pricing, inventory, product discovery. Then amplify it with SEO, advertising, and conversion optimization.",
  email: "john@apereel.com",
  linkedin: "https://www.linkedin.com/in/jblim",
  founder: {
    name: "John Lim",
    title: "Founder, Apereel",
    bio: [
      "In four years, I grew an e-commerce operation by 20X. Not by following the standard agency playbook, but by ignoring most of it. I did everything the agencies recommended first: content calendars, backlink campaigns, keyword strategies. Some of it worked. Most of it didn't move the needle.",
      "Then I noticed something no agency had mentioned. The product categories with stronger, deeper inventory consistently outranked the competition, regardless of our SEO effort. Where competitors had better assortments, they won. The answer to our ranking problem was not more SEO. It was a better business.",
      "I stopped taking agency advice at face value and started asking: what would actually make this business the better choice? That question drove 20X revenue growth in four years. Apereel exists to ask that question for every client.",
    ],
    philosophy:
      "If your agency never asks why customers should choose you, they are answering the wrong question.",
  },
  capabilities: [
    "Digital & E-commerce Growth",
    "Business-First SEO",
    "Digital Advertising",
    "AI-Powered Development & Creative",
  ],
  nav: [
    { href: "/#proof", label: "Proof" },
    { href: "/#approach", label: "Approach" },
    { href: "/#services", label: "Services" },
    { href: "/#work", label: "Work" },
    { href: "/#founder", label: "About" },
    { href: "/#audit", label: "Free Audit" },
    { href: "/#contact", label: "Contact" },
  ],
} as const;

export const traditionalChain = [
  { title: "Keyword Research", color: "muted" },
  { title: "Content Production", color: "muted" },
  { title: "Traffic", color: "muted" },
  { title: "Hope for Conversion", color: "signal" },
] as const;

export const apereelChain = [
  { title: "Business Strength", color: "electric" },
  { title: "Customer Value", color: "electric" },
  { title: "Digital Experience", color: "electric" },
  { title: "Visibility", color: "electric" },
  { title: "Revenue", color: "signal" },
] as const;

export const serviceGroups = [
  {
    label: "Growth Strategy",
    services: [
      {
        tag: "Research & Competitive Analysis",
        title: "Find out why customers aren't buying",
        body: "Most agencies measure traffic. We measure why customers buy, and why they don't. We find the commercial levers that actually move revenue: assortment gaps, pricing, merchandising, channel mix, and the experience that turns browsers into buyers.",
      },
      {
        tag: "SEO",
        title: "Rank for the searches that drive revenue",
        body: "Rankings follow from being the better choice for the customer, not from producing more content about topics no one searches. We strengthen the business case behind every page, then make that value unmistakable to search engines.",
      },
      {
        tag: "Advertising",
        title: "Turn ad spend into an investment",
        body: "Ad spend that chases traffic is an expense. Ad spend that amplifies genuine competitive advantage is an investment. We build campaigns around the offers, audiences, and products that already deserve to win.",
      },
    ],
  },
  {
    label: "Technology & Creative",
    services: [
      {
        tag: "Web Development",
        title: "Ship website changes in hours, not weeks",
        body: "Your last agency charged you three weeks of development to change a banner. We build digital platforms with AI-assisted development so your team ships in hours, not weeks, and stops waiting in someone else's queue.",
      },
      {
        tag: "Conversion Optimization",
        title: "Earn more from the traffic you already have",
        body: "You already have demand. The question is how much of it you're wasting. We fix the paths customers actually take, from discovery to purchase, so the business earns more from every visitor it already has.",
      },
      {
        tag: "Premium Creative",
        title: "Compete visually without the six-figure budget",
        body: "Premium creative at the production quality of global brands, without the six-figure budget. AI-assisted workflows dramatically increase output and quality, so you compete visually with companies ten times your size.",
      },
    ],
  },
] as const;

export const services = serviceGroups.flatMap(
  (g) => g.services as readonly { tag: string; title: string; body: string }[],
);

export const approach = [
  {
    title: "Research",
    body: "Before we optimize anything, we study the market.\n\nWe analyze the companies already winning, the high-demand searches driving their visibility, and most importantly, why customers choose them.\n\nThe goal is not to copy the leader. It is to understand why they win, where customers are still underserved, and where your business has an opportunity to compete.",
    services: [
      {
        tag: "Research & Competitive Analysis",
        title: "Find out why customers aren't buying",
      },
    ],
  },
  {
    title: "Build the Advantage",
    body: "Research reveals the gap. Then we build around it.\n\nFor e-commerce, the opportunity is often better pricing, deeper inventory, a more specialized assortment, faster availability, stronger product discovery, or a better shopping experience.\n\nIf there is a weakness that marketing cannot hide, we address it.\n\nBefore we ask Google to choose you, we give customers a reason to choose you.",
    services: [],
  },
  {
    title: "Translate",
    body: "Once the competitive advantage is clear, we make it visible online.\n\nYour product pages, category navigation, merchandising, search filtering, creative, and the entire shopping experience should communicate the same reason customers should choose you.\n\nThe goal is simple:\n\nMake the strength of the business impossible to miss.",
    services: [
      {
        tag: "Web Development",
        title: "Ship website changes in hours, not weeks",
      },
      {
        tag: "Conversion Optimization",
        title: "Earn more from the traffic you already have",
      },
      {
        tag: "Premium Creative",
        title: "Compete visually without the six-figure budget",
      },
    ],
  },
  {
    title: "Amplify",
    body: "Now we use SEO, paid advertising, web development, AI, and creative content to scale what the business already does well.\n\nInstead of using marketing to cover weaknesses, we use it to make a strong business easier to find, easier to understand, and easier to choose.\n\nThat is where digital marketing becomes a real growth engine.",
    services: [
      {
        tag: "SEO",
        title: "Rank for the searches that drive revenue",
      },
      {
        tag: "Advertising",
        title: "Turn ad spend into an investment",
      },
    ],
  },
  {
    title: "Measure & Improve",
    body: "We measure what changed for the business.\n\nVisibility and traffic matter, but they are not the finish line.\n\nWe look at qualified traffic, leads, conversions, sales, revenue, margin, and competitive position, then use those results to decide what to improve next.\n\nIf marketing performance never reaches the business, it is not enough.",
    services: [],
  },
] as const;

export const caseStudies = [
  {
    id: "inventory-seo",
    kicker: "Inventory & SEO",
    title: "The SEO problem that SEO couldn't fix.",
    services: ["Research & Competitive Analysis", "SEO"],
    body: [
      "Search visibility was inconsistent across product categories. Some performed well; others struggled despite identical SEO effort. Every recommendation pointed to more content: more blog posts, more backlinks. Nobody looked at the product catalog.",
      "We did. The categories with stronger, deeper inventory consistently outranked those with better SEO. The answer was not content. It was getting products online faster, expanding depth in key categories, and restructuring the catalog around how customers actually shop.",
      "Categories with stronger inventory saw 40 to 60% ranking improvements within the first month. Without a single content campaign.",
    ],
  },
  {
    id: "ecommerce-ux",
    kicker: "E-commerce UX",
    title: "The business had the products. Customers couldn't find them.",
    services: ["Conversion Optimization", "Web Development"],
    body: [
      "Strong product assortment. Weak product discovery. Navigation was flat, filters were generic, and customers relied on site search to find what they wanted. The inventory was there. The digital experience was hiding it.",
      "Product discovery was rebuilt around how people actually shop: color swatches, sticky filtering, three-click navigation.",
      "Product discovery improved by 35%. Customers found products faster, bounce rates dropped, and the assortment performed at the level it deserved.",
    ],
  },
  {
    id: "digital-development",
    kicker: "Development Transformation",
    title: "Every improvement waited in someone else's queue.",
    services: ["Web Development"],
    body: [
      "Simple UX fixes sat in an external development queue for weeks. Feature requests took months. The constraint was not ideas or strategy. It was the inability to execute without external dependency.",
      "AI-assisted development gave the team the ability to build, test, and ship internally.",
      "Development cycles dropped from 3 to 4 weeks to under 24 hours. The team shipped more in one month than the previous agency delivered in six.",
    ],
  },
  {
    id: "pricing-intelligence",
    kicker: "Pricing Intelligence",
    title: "Everyone said it was a marketing problem. It wasn't.",
    services: ["Research & Competitive Analysis"],
    body: [
      "A product category was underperforming. The agency recommended more ad spend. The SEO team recommended more content. Everyone had a marketing solution for what turned out to be a pricing problem.",
      "Competitive research revealed the business was priced significantly above market for this category. Customers were comparing and buying elsewhere.",
      "A single pricing adjustment outperformed six months of marketing spend. The budget never changed.",
    ],
  },
  {
    id: "luxury-compliance",
    kicker: "Brand Compliance & E-commerce",
    title: "Brand standards and commercial performance are not opposing goals.",
    services: ["SEO", "Advertising", "Conversion Optimization"],
    body: [
      "Global brands impose exacting digital requirements: imagery, typography, layout, and functionality must meet precise standards. Most implementations either satisfy the brand at the expense of commercial performance, or compromise standards to prioritize conversion.",
      "We proved these are not competing objectives.",
      "Full brand authorization maintained across multiple partnerships, while operating as commercially effective digital storefronts that contributed to the 20X revenue growth.",
    ],
  },
] as const;

export const principles = [
  "If the business doesn't deserve to rank, no amount of SEO will fix it.",
  "Traffic is a vanity metric. Revenue is the only one that matters.",
  "A better customer experience will outperform a bigger ad budget.",
  "If your team waits weeks for website changes, technology is the bottleneck.",
  "SEO should amplify a real advantage, not manufacture one.",
  "Marketing that doesn't make the business stronger is a waste of money.",
] as const;

export const perspectives = [
  {
    title: "Your Best SEO Strategy Might Be a Warehouse Problem",
    answer: "If product categories with weak inventory never rank, no matter how much content you produce, then the SEO problem is an operations problem. Get the products online first.",
    category: "E-commerce",
  },
  {
    title: "More Traffic Is Not the Answer.",
    answer: "Traffic is easy to buy. The harder part is giving people a reason to stay, trust you, and choose your business.\n\nWithout that, more traffic only means more wasted spend.",
    category: "Strategy",
  },
  {
    title: "The SEO Opportunity Your Agency Will Never Recommend",
    answer: "Fixing the business itself: pricing, assortment, merchandising, customer experience. No agency recommends this because they can't bill for it.",
    category: "Operations",
  },
] as const;

export const creativeCapabilities = [
  "Product & lifestyle photography",
  "Advertising & campaign visuals",
  "Brand storytelling & video",
  "Visual content for web, social, and paid media",
] as const;

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
