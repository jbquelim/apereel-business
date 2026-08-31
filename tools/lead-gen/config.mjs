import "dotenv/config";

export const config = {
  exclude: [
    "raffi jewellers",
    "raffi",
    "raffi and co",
    "raffi & co",
  ],

  indeed: {
    baseUrl: "https://ca.indeed.com",
    queries: [
      "digital marketing manager",
      "SEO specialist",
      "SEO manager",
      "e-commerce manager",
      "ecommerce marketing",
      "marketing director",
      "digital marketing specialist",
      "online marketing manager",
      "growth marketing manager",
      "performance marketing",
    ],
    locations: [
      "Toronto, ON",
      "Vaughan, ON",
      "Mississauga, ON",
      "Vancouver, BC",
      "Montreal, QC",
      "Calgary, AB",
    ],
    maxPages: 3,
    delayMs: 3000,
  },

  linkedin: {
    queries: [
      "digital marketing manager",
      "SEO manager",
      "e-commerce director",
      "marketing director ecommerce",
      "head of digital marketing",
    ],
    geoIds: {
      Canada: "101174742",
      Toronto: "100025096",
    },
  },

  outreach: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    },
    from: {
      name: process.env.OUTREACH_FROM_NAME || "John Lim",
      email: process.env.OUTREACH_FROM_EMAIL || "",
    },
    replyTo: process.env.OUTREACH_REPLY_TO || "john@apereel.com",
    maxPerHour: 30,
    maxPerDay: 100,
    delayBetweenMs: 5000,
    followUpDays: [3, 7],
  },

  hunterApiKey: process.env.HUNTER_API_KEY || "",

  paths: {
    leads: decodeURIComponent(new URL("./data/leads.json", import.meta.url).pathname),
    sent: decodeURIComponent(new URL("./data/sent.json", import.meta.url).pathname),
    templates: decodeURIComponent(new URL("./templates", import.meta.url).pathname),
  },
};
