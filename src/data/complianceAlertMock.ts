export type Country = {
  code: string;
  name: string;
  flag: string;
  regulator: string;
  region: "West Africa" | "East Africa" | "Southern Africa" | "North Africa" | "Central Africa";
};

export const AFRICAN_COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", regulator: "CBN — Central Bank of Nigeria", region: "West Africa" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", regulator: "CBK — Central Bank of Kenya", region: "East Africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", regulator: "FSCA / SARB", region: "Southern Africa" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", regulator: "Bank of Ghana", region: "West Africa" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", regulator: "NBE — National Bank of Ethiopia", region: "East Africa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", regulator: "CBE — Central Bank of Egypt", region: "North Africa" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", regulator: "BoT — Bank of Tanzania", region: "East Africa" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", regulator: "BoU — Bank of Uganda", region: "East Africa" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", regulator: "BNR — National Bank of Rwanda", region: "East Africa" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", regulator: "Bank Al-Maghrib", region: "North Africa" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", regulator: "BCEAO", region: "West Africa" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", regulator: "BCEAO", region: "West Africa" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", regulator: "Bank of Zambia", region: "Southern Africa" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", regulator: "RBZ", region: "Southern Africa" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", regulator: "Bank of Botswana", region: "Southern Africa" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", regulator: "Bank of Mauritius", region: "Southern Africa" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", regulator: "Bank of Namibia", region: "Southern Africa" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", regulator: "Banco de Moçambique", region: "Southern Africa" },
  { code: "AO", name: "Angola", flag: "🇦🇴", regulator: "BNA — Banco Nacional de Angola", region: "Central Africa" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", regulator: "BEAC", region: "Central Africa" },
];

export const REGION_BUNDLES = [
  { id: "ecowas", label: "West Africa (ECOWAS)", countries: ["NG", "GH", "SN", "CI"], price: "$599/mo" },
  { id: "eac", label: "East African Community", countries: ["KE", "TZ", "UG", "RW", "ET"], price: "$499/mo" },
  { id: "sadc", label: "Southern Africa (SADC)", countries: ["ZA", "ZM", "ZW", "BW", "MU", "NA", "MZ"], price: "$499/mo" },
  { id: "all", label: "All Africa (54 markets)", countries: ["*"], price: "$799/mo" },
];

export type Severity = "critical" | "high" | "medium" | "info";
export type Topic = "AML/CFT" | "Capital" | "Digital Lending" | "Open Banking" | "FX" | "Cybersecurity" | "Reporting" | "Consumer Protection";

export type Circular = {
  id: string;
  country: string; // ISO code
  regulator: string;
  reference: string;
  title: string;
  publishedAt: string; // ISO date
  deadline: string | null;
  severity: Severity;
  topic: Topic;
  affects: string[];
  summary: string;
  actions: string[];
  url: string;
};

const today = new Date();
const daysFromNow = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export const MOCK_CIRCULARS: Circular[] = [
  {
    id: "c-001",
    country: "NG",
    regulator: "CBN",
    reference: "CBN/BSD/DIR/PUB/LAB/018/047",
    title: "Mandatory AI-driven Transaction Monitoring for Tier-1 & Tier-2 Banks",
    publishedAt: daysFromNow(-1),
    deadline: daysFromNow(45),
    severity: "critical",
    topic: "AML/CFT",
    affects: ["Commercial Banks", "Merchant Banks", "Payment Service Banks"],
    summary:
      "All Tier-1 and Tier-2 deposit money banks must deploy AI-based transaction monitoring covering structuring, smurfing and synthetic identity within 45 days. Quarterly model performance audits required.",
    actions: [
      "Procure or build AI/ML monitoring engine before Day 45",
      "Submit deployment attestation to BSD by deadline",
      "Schedule first quarterly model audit within 90 days",
    ],
    url: "https://cbn.gov.ng/Out/2026/BSD/CBN-BSD-DIR-PUB-LAB-018.pdf",
  },
  {
    id: "c-002",
    country: "KE",
    regulator: "CBK",
    reference: "CBK/PG/15/2026",
    title: "Digital Credit Provider Pricing Disclosure Standard",
    publishedAt: daysFromNow(-2),
    deadline: daysFromNow(30),
    severity: "high",
    topic: "Digital Lending",
    affects: ["Digital Credit Providers", "MFBs", "Fintechs"],
    summary:
      "All licensed Digital Credit Providers must display Total Cost of Credit, APR, and full fee breakdown before loan acceptance. Non-compliance attracts KES 5M penalty per occurrence.",
    actions: [
      "Update loan origination UI with mandatory disclosure card",
      "File APR calculation methodology to CBK by Day 30",
      "Train customer service on new disclosure script",
    ],
    url: "https://centralbank.go.ke/uploads/banking_circulars/PG-15-2026.pdf",
  },
  {
    id: "c-003",
    country: "ZA",
    regulator: "FSCA",
    reference: "FSCA Notice 47 of 2026",
    title: "Open Finance Conduct Standard — Phase 2 Data Sharing",
    publishedAt: daysFromNow(-3),
    deadline: daysFromNow(120),
    severity: "high",
    topic: "Open Banking",
    affects: ["Banks", "Insurers", "Investment Managers"],
    summary:
      "Phase 2 of Open Finance requires banks to expose investment & insurance data via standardised API spec. SLA: 99.5% uptime, < 2s response.",
    actions: [
      "Map data fields to FSCA Open Finance schema",
      "Stand up sandbox by Day 60 — production by Day 120",
      "Register API endpoints with FSCA conformance suite",
    ],
    url: "https://www.fsca.co.za/Notices/Notice-47-2026.pdf",
  },
  {
    id: "c-004",
    country: "GH",
    regulator: "BoG",
    reference: "BG/GOV/SEC/2026/04",
    title: "Cybersecurity & Cyber-Resilience Directive — Annex on Cloud",
    publishedAt: daysFromNow(-4),
    deadline: daysFromNow(60),
    severity: "high",
    topic: "Cybersecurity",
    affects: ["Banks", "PSPs", "EMIs"],
    summary:
      "All regulated entities running core systems on public cloud must submit a Cloud Concentration Risk Assessment and exit plan within 60 days.",
    actions: [
      "Complete cloud concentration risk template",
      "Document exit / portability plan per workload",
      "Board approval before BoG submission",
    ],
    url: "https://bog.gov.gh/news/cybersecurity-annex-cloud/",
  },
  {
    id: "c-005",
    country: "NG",
    regulator: "CBN",
    reference: "CBN/TED/FEM/PUB/006",
    title: "Revised FX Rate Reporting for Authorised Dealers",
    publishedAt: daysFromNow(-5),
    deadline: daysFromNow(7),
    severity: "critical",
    topic: "FX",
    affects: ["Authorised Dealer Banks"],
    summary:
      "Daily FX position reporting moves from end-of-day to T+0 hourly snapshots. Effective in 7 days. Penalties: NGN 10M per missed snapshot.",
    actions: [
      "Switch reporting connector to hourly schedule",
      "Validate with TED test environment within 5 days",
      "Assign back-up officer for hourly attestation",
    ],
    url: "https://cbn.gov.ng/Out/2026/TED/FEM-PUB-006.pdf",
  },
  {
    id: "c-006",
    country: "KE",
    regulator: "CBK",
    reference: "CBK/MFB/CIR/04/2026",
    title: "Capital Adequacy Update for Microfinance Banks",
    publishedAt: daysFromNow(-7),
    deadline: daysFromNow(180),
    severity: "medium",
    topic: "Capital",
    affects: ["Microfinance Banks"],
    summary:
      "Minimum core capital for MFBs raised to KES 250M (community) and KES 750M (nationwide), phased over 180 days.",
    actions: [
      "Run capital plan vs new floor — identify gap",
      "Board-approved capital raise / merger plan",
      "Submit phased compliance plan to CBK",
    ],
    url: "https://centralbank.go.ke/uploads/mfb-circular-04-2026.pdf",
  },
  {
    id: "c-007",
    country: "GH",
    regulator: "BoG",
    reference: "BG/GOV/CONS/2026/02",
    title: "Consumer Protection — Mandatory Complaint Resolution SLA",
    publishedAt: daysFromNow(-9),
    deadline: daysFromNow(90),
    severity: "medium",
    topic: "Consumer Protection",
    affects: ["Banks", "EMIs", "Specialised Deposit Institutions"],
    summary:
      "Customer complaints must be acknowledged within 24h and resolved within 10 business days. Quarterly complaints register filed with BoG.",
    actions: [
      "Implement 24h SLA in CRM workflow",
      "Build quarterly complaints register template",
      "Designate Consumer Protection Officer",
    ],
    url: "https://bog.gov.gh/news/consumer-protection-2026-02/",
  },
  {
    id: "c-008",
    country: "ZA",
    regulator: "SARB",
    reference: "SARB Directive 4/2026",
    title: "Climate Risk Stress Testing for D-SIBs",
    publishedAt: daysFromNow(-12),
    deadline: daysFromNow(150),
    severity: "info",
    topic: "Reporting",
    affects: ["D-SIBs"],
    summary:
      "Domestic Systemically Important Banks must run a climate stress test using SARB scenarios and report results within 150 days.",
    actions: [
      "Onboard SARB climate scenarios",
      "Tag credit exposures by climate sector",
      "Prepare narrative report to PA",
    ],
    url: "https://www.resbank.co.za/Directive-4-2026",
  },
];
