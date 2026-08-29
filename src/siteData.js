export const company = {
  name: "MooreTech",
  legalName: "MooreTech Solutions LLC",
  siteUrl: "https://mooretechsolutionsllc.com",
  siteDescription:
    "The company behind Ironline Office, Ironline Budget, Ironline Launch, Ironline Rentals, and carefully scoped custom software.",
  socialImageUrl:
    "https://mooretechsolutionsllc.com/mooretech-logo.webp",
  founded: "2026",
  location: "Northeast Arkansas",
  serviceArea: "Serving businesses nationally",
  responseTime: "We aim to respond within two business days",
  email: "admin@ironlineoffice.com",
  phoneDisplay: "870-819-1018",
  phoneHref: "tel:+18708191018",
  smsHref: "sms:+18708191018",
  githubUrl: "https://github.com/wmoore19/MooreTech-Solutions-LLC",
  githubLabel: "wmoore19/MooreTech-Solutions-LLC",
};

export const navigation = [
  { label: "Products", to: "/products" },
  { label: "Custom Builds", to: "/custom-builds" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const ironline = {
  key: "office",
  number: "01",
  name: "Ironline Office",
  category: "Service operations",
  status: "Available now",
  tagline: "Run the work from first request through payment.",
  url: "https://ironlineoffice.com",
  trialUrl: "https://ironlineoffice.com/register",
  socialImageUrl: "https://ironlineoffice.com/brand/ironline-social-card.png",
  eyebrow: "Service operations",
  summary:
    "One connected operating system for owner-led service teams managing customers, estimates, schedules, field work, invoices, payments, inventory, and follow-up.",
  highlights: [
    "CRM through payment in one workflow",
    "Mobile-ready office and field tools",
    "Flat plans starting at $29 per month",
  ],
  workflow: ["Request", "Estimate", "Schedule", "Job", "Invoice", "Payment"],
  primaryLabel: "Visit Ironline Office",
  secondaryLabel: "Start a 30-day trial",
};

export const ironlineBudget = {
  key: "budget",
  number: "02",
  name: "Ironline Budget",
  category: "Financial planning",
  status: "Available now",
  tagline: "Give every dollar a job—and see the line clearly.",
  url: "https://ironlinebudget.com",
  registerUrl: "https://ironlinebudget.com/register",
  eyebrow: "Financial planning",
  summary:
    "A clear planning system for personal, family, and business money, with flexible envelopes, Safe to Spend, goals, paydays, tax reserves, and decision-ready reporting.",
  highlights: [
    "Personal, family, and business workspaces",
    "Flexible envelopes and Safe to Spend",
    "Goals, paydays, taxes, and reporting",
  ],
  primaryLabel: "Visit Ironline Budget",
  secondaryLabel: "Create a workspace",
};

export const ironlineRentals = {
  key: "rentals",
  number: "04",
  name: "Ironline Rentals",
  category: "Rental operations",
  status: "Private beta",
  tagline: "Keep every property, lease, payment, and work order on one line.",
  url: "https://ironline-rentals.base44.app",
  registerUrl: "https://ironline-rentals.base44.app/register",
  eyebrow: "Rental operations",
  summary:
    "Unit-based property management software for independent landlords and large rental communities, with portfolio oversight, leases, rent ledgers, maintenance, inspections, and resident workflows.",
  highlights: [
    "Landlord plans starting at $15 per month",
    "Portfolio and community tiers that scale by unit count",
    "One operational view from vacancy through renewal",
  ],
  primaryLabel: "Explore Ironline Rentals",
  secondaryLabel: "Join the 30-day pilot",
};

export const businessLaunch = {
  key: "launch",
  number: "03",
  name: "Ironline Launch",
  category: "Business launch",
  status: "Available now",
  tagline: "Start the business, then leave with a system to run it.",
  url: "/business-launch",
  externalUrl: "https://ironlinelaunch.com",
  price: "200",
  priceLabel: "$200 one time",
  eyebrow: "Business launch",
  summary:
    "Guided administrative and technology setup for a straightforward, one-owner Arkansas LLC, including a defined launch sequence, business-bank readiness, an Ironline QuickStart, and training.",
  highlights: [
    "Guided Arkansas LLC and EIN sequence",
    "Business-bank and tax-workflow readiness",
    "Ironline QuickStart, test workflow, and training",
  ],
  included: [
    "Official-site filing checklist and navigation",
    "Free EIN walkthrough",
    "Client-controlled ATAP navigation when applicable",
    "Business-bank readiness checklist",
    "Ironline QuickStart and one training session",
  ],
  primaryLabel: "Visit Ironline Launch",
  secondaryLabel: "Review scope and pricing",
};

export const productPortfolio = [
  {
    ...ironline,
    primaryUrl: ironline.url,
    secondaryUrl: ironline.trialUrl,
  },
  {
    ...ironlineBudget,
    primaryUrl: ironlineBudget.url,
    secondaryUrl: ironlineBudget.registerUrl,
  },
  {
    ...businessLaunch,
    primaryUrl: businessLaunch.externalUrl,
    secondaryUrl: businessLaunch.url,
  },
  {
    ...ironlineRentals,
    primaryUrl: ironlineRentals.url,
    secondaryUrl: ironlineRentals.registerUrl,
  },
];

export const leadership = [
  {
    initials: "DM",
    name: "Drew Moore",
    role: "Founder & CEO",
    bio: "Drew leads MooreTech product direction and development, with a focus on practical systems for real business operations.",
  },
  {
    initials: "TN",
    name: "Tammy Nobles",
    role: "Co-Founder & Director of Customer Success",
    bio: "Tammy helps shape onboarding, customer success, and the day-to-day experience of teams adopting MooreTech products.",
  },
];

export const customBuildEmail =
  "mailto:admin@ironlineoffice.com?subject=Custom%20build%20request%20for%20MooreTech";
export const careersEmail =
  "mailto:admin@ironlineoffice.com?subject=MooreTech%20careers%20%E2%80%94%20resume";
