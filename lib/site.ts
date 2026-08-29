export const site = {
  name: "Apereel",
  tagline: "Business-First Digital Growth",
  headline: "We don't chase algorithms.",
  headlineLine2: "We build businesses worth finding.",
  supporting:
    "Apereel identifies what makes a business genuinely competitive, then uses strategy, technology, and digital experience to amplify it.",
  email: "jbquelim@gmail.com",
  linkedin: "https://www.linkedin.com/in/jblim",
  founder: {
    name: "John Lim",
    title: "Founder, Apereel",
    currentRole: "Digital Marketing Strategist at Raffi Jewellers Inc.",
    bio: [
      "My approach to digital marketing was shaped by managing e-commerce growth for a retailer. I noticed that the product categories with the strongest inventory consistently had the strongest search visibility. Where competitors had better assortments, they outranked us — regardless of our SEO efforts.",
      "That observation changed everything. Instead of trying to overcome gaps with more blog posts or backlink campaigns, I focused on the business itself — getting products online faster, improving merchandising, fixing the customer experience. As the business became stronger, digital performance followed.",
      "That is the foundation of everything Apereel does. We identify what makes a business genuinely valuable to its customers, then use strategy, technology, and digital experience to make that value visible.",
    ],
    philosophy:
      "SEO should reflect the strength of the business, not manufacture it.",
  },
  capabilities: [
    "Digital & E-commerce Growth",
    "Business-First SEO",
    "Digital Advertising",
    "AI-Powered Development & Creative",
  ],
  nav: [
    { href: "/#approach", label: "Approach" },
    { href: "/#services", label: "Services" },
    { href: "/#work", label: "Work" },
    { href: "/#founder", label: "About" },
    { href: "/#perspectives", label: "Perspectives" },
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
        title: "Digital & E-commerce Growth",
        body: "Identify the commercial levers that actually move revenue — assortment, merchandising, pricing, channel mix, and the digital experience that turns demand into sales.",
      },
      {
        title: "Business-First SEO",
        body: "Rankings should follow from being the better choice for the customer. We strengthen the business case behind every page, then make that value unmistakable in search.",
      },
      {
        title: "Digital Advertising",
        body: "Paid media that compounds commercial strength — not spend that chases empty traffic. Campaigns aligned to the offers, audiences, and products that already deserve to win.",
      },
    ],
  },
  {
    label: "Technology & Experience",
    services: [
      {
        title: "AI-Powered Web Development",
        body: "Technology should remove bottlenecks. We build digital platforms with AI-assisted development so teams ship faster, stay in control, and stop waiting on external queues.",
      },
      {
        title: "Conversion Optimization",
        body: "Improve the paths customers actually take — from discovery to purchase — so the business earns more from the demand it already has.",
      },
      {
        title: "UX & Product Discovery",
        body: "Help customers find the right product, faster. Navigation, filters, merchandising, and content architecture built around how people shop — not how the catalog is stored.",
      },
    ],
  },
  {
    label: "Intelligence & Creative",
    services: [
      {
        title: "Competitive Intelligence",
        body: "Pricing, assortment, and positioning analysis that reveals where you can win — and where the current digital story is leaving value on the table.",
      },
      {
        title: "Digital Transformation",
        body: "Replace fragile, slow, outsourced workflows with systems your team can run. From inventory publishing to brand-compliant experiences for global luxury partners.",
      },
      {
        title: "AI-Powered Creative Production",
        body: "Produce premium visual content with the production value of major global brands. AI-assisted creative workflows dramatically increase output and quality at a fraction of traditional cost.",
      },
    ],
  },
] as const;

export const services = serviceGroups.flatMap(
  (g) => g.services as readonly { title: string; body: string }[],
);

export const approach = [
  {
    title: "Discover",
    body: "Map where the business actually wins customers — and where competitors are stronger. Analyze the product, pricing, customer experience, and digital presence before proposing a single tactic.",
  },
  {
    title: "Strengthen",
    body: "Address the gaps that prevent the business from being the better choice. That might mean inventory depth, pricing, product discovery, or operational speed — not more content.",
  },
  {
    title: "Translate",
    body: "Turn genuine competitive advantages into digital experiences that make those strengths obvious to customers and to search engines alike.",
  },
  {
    title: "Amplify",
    body: "Use SEO, paid media, technology, and distribution to scale what the business has already proven it does well.",
  },
  {
    title: "Optimize",
    body: "Measure against business results — revenue, conversion, market position — not traffic or rankings alone. Then improve.",
  },
] as const;

export const caseStudies = [
  {
    id: "inventory-seo",
    kicker: "Inventory & SEO",
    title: "Depth and speed create visibility.",
    body: [
      "Search visibility was inconsistent across product categories. Some performed well organically; others struggled despite similar SEO effort. Competitive benchmarking revealed a pattern: the categories with stronger, more complete inventory consistently outperformed in search. Where competitors had better assortments, they frequently outranked us.",
      "The response was not more blog content. The focus shifted to operational efficiency — getting products online faster, expanding depth in key categories, and restructuring the catalog around how customers actually shop. As inventory strengthened, search coverage and sales improved without additional content campaigns.",
    ],
  },
  {
    id: "ecommerce-ux",
    kicker: "E-commerce UX",
    title: "Discovery is a commercial system.",
    body: [
      "The business had a strong product assortment, but customers had difficulty finding what they wanted. Navigation was flat, filters were generic, and product discovery relied too heavily on site search. The assortment was there — the digital experience was hiding it.",
      "Product discovery was rebuilt around how people actually shop: colour swatches, sticky filtering, filter prioritization, collapsed filter groups, and a three-click navigation philosophy. Customers could find and choose faster, and the shopping experience became a closer reflection of the assortment's real strength.",
    ],
  },
  {
    id: "digital-development",
    kicker: "Development Transformation",
    title: "Control compounds faster than tickets.",
    body: [
      "The business relied on expensive external development for website changes. Simple UX improvements, merchandising updates, and feature requests sat in external queues for weeks. The constraint was not ideas or strategy — it was the ability to execute.",
      "AI-assisted development enabled the team to build, test, and ship improvements internally. Development speed increased dramatically. The team could remove bottlenecks as the business needed them gone, rather than waiting for external capacity.",
    ],
  },
  {
    id: "pricing-intelligence",
    kicker: "Pricing Intelligence",
    title: "The gap was in the market, not the traffic.",
    body: [
      "A product category was underperforming despite adequate traffic and visibility. The instinct was a marketing problem — perhaps the pages needed better content, or the category needed more advertising spend.",
      "Competitive research told a different story: the business was pricing significantly above the market for this category. Customers were comparing and choosing competitors on price. A pricing recommendation was implemented, and category performance improved substantially. The answer to the marketing problem was not more marketing.",
    ],
  },
  {
    id: "luxury-compliance",
    kicker: "Luxury Brand E-commerce",
    title: "Premium brands require premium execution.",
    body: [
      "Major global luxury brands impose strict digital requirements — imagery, typography, layout, content, and functionality must meet exacting standards. Many implementations either satisfy the brand at the expense of UX and commercial performance, or compromise standards to prioritize conversion.",
      "The work demonstrated that these are not competing objectives. E-commerce experiences were developed that maintained full brand authorization while operating commercially effective digital storefronts — balancing brand standards, technical specifications, UX best practices, and commercial goals across multiple luxury partnerships.",
    ],
  },
] as const;

export const principles = [
  "Business before algorithms.",
  "Revenue before vanity metrics.",
  "Customer experience before traffic.",
  "Technology should remove bottlenecks.",
  "SEO should amplify real competitive advantage.",
  "Marketing should make the business stronger.",
] as const;

export const perspectives = [
  {
    title: "Why Inventory May Be Your Best E-commerce SEO Strategy",
    category: "E-commerce",
  },
  {
    title: "SEO Should Reflect the Strength of the Business",
    category: "SEO",
  },
  {
    title: "Why More Traffic Isn't Always Better Marketing",
    category: "Strategy",
  },
  {
    title: "The Problem With Content-First SEO",
    category: "SEO",
  },
  {
    title: "What Years of Tracking E-commerce Rankings Taught Me",
    category: "Analytics",
  },
  {
    title: "Why Your Best SEO Opportunity Might Be an Operations Problem",
    category: "Operations",
  },
] as const;

export const creativeCapabilities = [
  "Product photography concepts",
  "Lifestyle imagery",
  "Advertising creatives",
  "Campaign visuals",
  "Website hero imagery",
  "Social media creative",
  "Commercial video concepts",
  "Motion graphics",
  "Brand storytelling",
  "Image enhancement",
  "Creative variations for advertising",
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
