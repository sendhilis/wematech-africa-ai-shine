import { Bot, BarChart3, LineChart, Bell, Rocket, type LucideIcon } from "lucide-react";

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
      "African-language banking AI is difficult to build in-house",
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
      "Help digital banking teams resolve customer queries in African languages and reduce repetitive work.",
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
    tags: ["Fast Decision", "Banks · Lenders · MFIs", "API Integration", "SME Focus"],
    gap: [
      "80% of African adults have no formal credit bureau history",
      "$330B SME credit demand unmet — banks say 'can't assess risk'",
      "Banks reject 60%+ of SME loan applications",
      "Building ML credit models in-house requires specialist teams and lengthy development",
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
      "Give lenders explainable credit insights using alternative data, helping them assess customers beyond traditional bureau history.",
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
      "Banks can strengthen SME relationships through cash flow insights and loan-readiness tools.",
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
      "Teams need African-specific regulatory monitoring tools",
      "Missed circulars can expose institutions to penalties and compliance risk",
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
    hasLiveProduct: true,
    ctaLabel: "Launch ComplianceAlert →",
  },
  {
    slug: "launchkit",
    num: "05",
    name: "LaunchKit",
    tagline:
      "30-Day Neobank MVP Starter — BaaS APIs, KYC, mobile app template, and CBN/CBK licence guidance.",
    emoji: "⚡",
    icon: Rocket,
    accentClass: "bg-rose-500/10",
    iconColorClass: "text-rose-400",
    tags: ["Founder Impulse", "Fintech Founders · Corporates", "High ACV"],
    gap: [
      "Fintech founders spend 6–12 months in pre-launch limbo",
      "No Africa-specific 'starter pack' for digital banking exists",
      "Regulatory navigation alone takes 3–6 months without a guide",
      "Building an MVP from scratch requires significant development effort",
    ],
    features: [
      "Katimoja BaaS API credentials (sandbox + production)",
      "Pre-built React Native mobile app template",
      "KYC integration: Smile ID or Onfido out of box",
      "CBN/CBK licence application guide + templates",
      "30-day technical onboarding (Slack + 4 video calls)",
      "Compliance checklist for NG, KE, GH, ZA",
      "First 1,000 ScoreAI credit calls included",
    ],
    bigStat: { value: "30 days", label: "MVP starter programme" },
    whyImpulse:
      "Founders can focus on their customers with a starter toolkit for banking infrastructure, onboarding, and regulatory navigation.",
  },
];

export const getMicroSaaSBySlug = (slug: string) =>
  microSaaSProducts.find((p) => p.slug === slug);
