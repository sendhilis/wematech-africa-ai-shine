import { Bot, BarChart3, LineChart, Bell, Rocket, type LucideIcon } from "lucide-react";

export type Pricing = { amount: string; period: string };
export type MicroSaaSProduct = {
  slug: string;
  num: string;
  name: string;
  tagline: string;
  emoji: string;
  icon: LucideIcon;
  accentClass: string; // tailwind bg tint for icon
  iconColorClass: string;
  tags: string[];
  gap: string[];
  features: string[];
  bigStat: { value: string; label: string };
  whyImpulse: string;
  pricing: Pricing[];
  hasLiveProduct?: boolean;
  ctaLabel?: string;
};

export const microSaaSProducts: MicroSaaSProduct[] = [
  {
    slug: "bankbot",
    num: "01",
    name: "BankBot",
    tagline:
      "AI Customer Service Agent for Banks — live on any bank's website or WhatsApp in 48 hours, in African languages.",
    emoji: "🤖",
    icon: Bot,
    accentClass: "bg-emerald-500/10",
    iconColorClass: "text-emerald-400",
    tags: ["Impulse Buy", "Banks · Neobanks · MFIs", "API Plug-in"],
    gap: [
      "69% of African banks want AI but can't build it in-house",
      "Most bank chatbots are rule-based — break on anything complex",
      "Call centres overwhelmed — 80%+ queries are the same 20 questions",
      "No African-language banking AI exists at affordable price",
    ],
    features: [
      "Pre-trained on African banking FAQs — deploys in 48 hours",
      "Handles balance, loan status, disputes, branch hours, products",
      "Speaks English, Swahili, Hausa, Yoruba, Pidgin, French",
      "Plugs into website widget, WhatsApp Business API, USSD",
      "Escalates to human agent with full context transfer",
      "Dashboard: resolved queries, escalation rate, cost savings",
    ],
    bigStat: { value: "48hrs", label: "Time to live" },
    whyImpulse:
      "A Head of Digital can approve $299/month on their own authority and have it live before the next board meeting.",
    pricing: [
      { amount: "$99", period: "Starter · MFI/SACCO" },
      { amount: "$299", period: "Growth · Tier 3 Bank" },
      { amount: "$799", period: "Enterprise · Tier 1" },
      { amount: "$1,999", period: "Bank-grade · White label" },
    ],
  },
  {
    slug: "scoreai",
    num: "02",
    name: "ScoreAI",
    tagline:
      "Instant Alternative Credit Scoring API — score any African customer in under 4 seconds using mobile + behavioural data.",
    emoji: "📊",
    icon: BarChart3,
    accentClass: "bg-amber-500/10",
    iconColorClass: "text-amber-400",
    tags: ["Fast Decision", "Banks · Lenders · MFIs", "API · Per-call", "SME Focus"],
    gap: [
      "80% of African adults have no formal credit bureau history",
      "$330B SME credit demand unmet — banks say 'can't assess risk'",
      "Banks reject 60%+ of SME loan applications",
      "Building ML credit models in-house costs $500K+ and 18 months",
    ],
    features: [
      "Single API call: phone + consent → score 0–1000",
      "Signals: mobile money velocity, airtime, utility payments",
      "Score with explainability report (CBN 2026 compliance)",
      "Configurable risk bands by institution",
      "Integrates via REST API with any LOS",
      "Fraud flag — detects synthetic identities",
    ],
    bigStat: { value: "$331B", label: "SME credit gap" },
    whyImpulse:
      "Per-call pricing means zero upfront commitment. Lenders try on 100 customers, see better approvals, never turn it off.",
    pricing: [
      { amount: "$0.15", period: "Per score call" },
      { amount: "$199", period: "1,500 calls/mo" },
      { amount: "$499", period: "5,000 calls/mo" },
      { amount: "$1,499", period: "Unlimited" },
    ],
  },
  {
    slug: "sme-pulse",
    num: "03",
    name: "SME Pulse",
    tagline:
      "AI Financial Dashboard for African SMEs — white-labelled by banks, with cash flow forecasting and loan readiness.",
    emoji: "🧾",
    icon: LineChart,
    accentClass: "bg-sky-500/10",
    iconColorClass: "text-sky-400",
    tags: ["SME-facing", "Banks sell to SMEs", "Dual revenue stream"],
    gap: [
      "African SMEs manage cash flow via WhatsApp and spreadsheets",
      "Banks have no SME engagement tool — SMEs churn to fintechs",
      "MCB built one in 11 months for 1,000 businesses — demand proven",
      "SMEs have no visibility into loan readiness — 60% rejection rates",
    ],
    features: [
      "White-label — appears under any bank brand",
      "Cash flow forecast: 30/60/90-day projections",
      "Invoice tracker: paid status + overdue alerts",
      "Loan readiness score + 3 actions to improve",
      "Tax summary: quarterly VAT/income for informal SMEs",
      "WhatsApp alerts for cash flow and reminders",
    ],
    bigStat: { value: "2× MRR", label: "Bank earns + retains" },
    whyImpulse:
      "Banks pay Wematech a platform fee, then charge SMEs $5–15/mo on top. Pays for itself immediately.",
    pricing: [
      { amount: "$199", period: "Up to 500 SMEs" },
      { amount: "$499", period: "Up to 2,000 SMEs" },
      { amount: "$1,200", period: "Unlimited · white-label" },
    ],
  },
  {
    slug: "compliance-alert",
    num: "04",
    name: "ComplianceAlert",
    tagline:
      "Automated Regulatory Notification Service — AI-summarised alerts from CBN, CBK, FSCA, BoG and 30+ African central banks.",
    emoji: "🔔",
    icon: Bell,
    accentClass: "bg-purple-500/10",
    iconColorClass: "text-purple-400",
    tags: ["Zero-brainer sign-up", "Compliance Officers", "High Retention"],
    gap: [
      "African banks miss regulatory circulars — fines result",
      "Compliance teams manually monitor 10+ central bank websites",
      "CBN alone issued 47 circulars in 2025 — no human can track all",
      "No African-specific regulatory monitoring SaaS at SMB price",
      "One missed circular = $10K–$500K fine. This costs $299/mo",
    ],
    features: [
      "AI scrapes CBN, CBK, FSCA, BoG, NBE + 27 more daily",
      "AI summarises each circular: what changed, who, deadline",
      "Delivers via email + WhatsApp + Slack webhook",
      "Searchable archive across all African regulators",
      "Deadline tracker: 30/14/7/1 day alerts",
      "Available 1 country to all 54 African markets",
    ],
    bigStat: { value: "$500K", label: "Avoided fine per circular" },
    whyImpulse:
      "Compliance officers don't need a business case — they need to not get fired. Fear-driven buying = fastest yes.",
    pricing: [
      { amount: "$99", period: "1 country" },
      { amount: "$299", period: "3 countries" },
      { amount: "$599", period: "West Africa (ECOWAS)" },
      { amount: "$799", period: "All Africa (54 markets)" },
    ],
    hasLiveProduct: true,
    ctaLabel: "Launch ComplianceAlert →",
  },
  {
    slug: "launchkit",
    num: "05",
    name: "LaunchKit",
    tagline:
      "30-Day Neobank MVP Starter — BaaS APIs, KYC, mobile app template, and CBN/CBK licence guidance. One flat fee.",
    emoji: "⚡",
    icon: Rocket,
    accentClass: "bg-rose-500/10",
    iconColorClass: "text-rose-400",
    tags: ["Founder Impulse", "Fintech Founders · Corporates", "High ACV"],
    gap: [
      "Fintech founders spend 6–12 months in pre-launch limbo",
      "No Africa-specific 'starter pack' for digital banking exists",
      "Regulatory navigation alone takes 3–6 months without a guide",
      "Building even an MVP from scratch costs $200K+",
    ],
    features: [
      "Wematech BaaS API credentials (sandbox + production)",
      "Pre-built React Native mobile app template",
      "KYC integration: Smile ID or Onfido out of box",
      "CBN/CBK licence application guide + templates",
      "30-day technical onboarding (Slack + 4 video calls)",
      "Compliance checklist for NG, KE, GH, ZA",
      "First 1,000 ScoreAI credit calls included",
    ],
    bigStat: { value: "$200K+", label: "What founders save" },
    whyImpulse:
      "Founders with an idea and $5K in their pocket sign up today. They become full-platform customers within 6 months.",
    pricing: [
      { amount: "$1,999", period: "Self-serve (docs)" },
      { amount: "$4,999", period: "Full LaunchKit" },
      { amount: "$9,999", period: "+ 60-day support" },
    ],
  },
];

export const getMicroSaaSBySlug = (slug: string) =>
  microSaaSProducts.find((p) => p.slug === slug);
