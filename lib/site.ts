export const site = {
  name: "Apereel",
  tagline: "Business-First Digital Growth",
  headline:
    "Digital marketing is about growing businesses, not chasing algorithms.",
  supporting:
    "Apereel helps businesses identify their competitive strengths and turn them into stronger digital experiences, better visibility, and sustainable growth.",
  secondary:
    "We identify what makes your business valuable and use digital strategy, technology, customer experience, and search visibility to amplify it.",
  email: "jbquelim@gmail.com",
  linkedin: "https://www.linkedin.com/in/jblim",
  founder: {
    name: "John Lim",
    title: "Founder, Apereel",
    roles: [
      "Digital Marketing Strategist",
      "Digital Growth and E-commerce Specialist",
    ],
    currentRole: "Digital Marketing Strategist at Raffi Jewellers Inc.",
    bio: [
      "I believe digital marketing is about growing businesses, not chasing algorithms.",
      "My work combines e-commerce, SEO, digital advertising, web development, AI, and UX to create better customer experiences and sustainable growth.",
      "I focus on understanding what makes a business valuable to its customers and translating those strengths into digital experiences that drive results.",
    ],
  },
  capabilities: [
    "Digital & E-commerce Growth",
    "Business-First SEO",
    "Digital Advertising",
    "AI-Powered Web Development",
  ],
  nav: [
    { href: "/#approach", label: "Approach" },
    { href: "/#services", label: "Services" },
    { href: "/#work", label: "Work" },
    { href: "/#founder", label: "About" },
    { href: "/#contact", label: "Contact" },
  ],
} as const;

export const seoChain = [
  {
    title: "Business Strength",
    body: "The real advantages in product, service, operations, pricing, and brand.",
  },
  {
    title: "Customer Value",
    body: "Why a customer should choose you over every other option.",
  },
  {
    title: "Digital Experience",
    body: "How that value is made clear, findable, and easy to act on.",
  },
  {
    title: "Visibility",
    body: "Search, advertising, and discovery that reflect genuine relevance.",
  },
  {
    title: "Growth",
    body: "Revenue and relationships that compound because the business is stronger.",
  },
] as const;

export const services = [
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
  {
    title: "AI-Powered Web Development",
    body: "Technology should remove bottlenecks. We design and build digital platforms with AI-assisted development so teams ship faster, stay in control, and stop waiting on external queues.",
  },
  {
    title: "Conversion Optimization",
    body: "Turn attention into action. We improve the paths customers actually take — from discovery to purchase — so the business earns more from the demand it already has.",
  },
  {
    title: "UX & Product Discovery",
    body: "Help customers find the right product, faster. Navigation, filters, merchandising, and content architecture built around how people shop — not how the catalog is stored.",
  },
  {
    title: "Competitive Intelligence",
    body: "See the market clearly. Pricing, assortment, and positioning analysis that reveals where you can win — and where the current digital story is leaving value on the table.",
  },
  {
    title: "Digital Transformation",
    body: "Replace fragile, slow, outsourced workflows with systems your team can run. From inventory publishing to brand-compliant experiences for global luxury partners.",
  },
] as const;

export const approach = [
  {
    title: "Discover",
    body: "Identify the real strengths, weaknesses, and opportunities within the business.",
  },
  {
    title: "Strengthen",
    body: "Improve the areas that directly affect customer value, conversion, and competitiveness.",
  },
  {
    title: "Translate",
    body: "Turn those strengths into better digital experiences, stronger visibility, and more effective marketing.",
  },
  {
    title: "Scale",
    body: "Use technology, advertising, SEO, and automation to grow what already works.",
  },
] as const;

export const experience = [
  "Multi-year e-commerce growth",
  "Major reduction in external development dependency",
  "Improved product category sales through pricing and competitive analysis",
  "Faster inventory-to-website workflows",
  "Improved product discovery and navigation",
  "AI-assisted development and digital transformation",
  "Brand compliance and digital implementation for global luxury partners",
] as const;

export const caseStudies = [
  {
    id: "inventory-seo",
    kicker: "Inventory & SEO",
    title: "Depth and speed create visibility.",
    body: "Stronger product depth and faster inventory publishing improved search coverage and sales opportunity. When the catalog is complete, current, and structured around how customers buy, visibility follows the business — it is not manufactured around it.",
  },
  {
    id: "ecommerce-ux",
    kicker: "E-commerce UX Transformation",
    title: "Discovery is a commercial system.",
    body: "Navigation, filters, colour swatches, sticky controls, and clearer product discovery made it easier for customers to find and choose. The shopping experience became a closer reflection of the assortment — and a stronger path to conversion.",
  },
  {
    id: "digital-development",
    kicker: "Digital Development Transformation",
    title: "Control compounds faster than tickets.",
    body: "AI-assisted web development increased speed, ownership, and efficiency while reducing reliance on external development. The result was not more features for their own sake — it was a team able to remove bottlenecks as the business needed them gone.",
  },
  {
    id: "pricing-intelligence",
    kicker: "Pricing & Competitive Intelligence",
    title: "The gap was in the market, not the traffic.",
    body: "Identifying a market pricing gap helped significantly improve performance in an underperforming product category. Competitive clarity changed the offer. Digital performance followed the stronger commercial position.",
  },
] as const;

export const principles = [
  "Business before algorithms.",
  "Revenue before vanity metrics.",
  "Customer experience before traffic.",
  "Technology should remove bottlenecks.",
  "SEO should amplify real competitive advantage.",
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
