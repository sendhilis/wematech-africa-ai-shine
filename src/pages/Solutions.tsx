import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Wallet, LayoutDashboard, BarChart3, Brain, Smartphone, ArrowRight, ExternalLink, Phone, Bot, CreditCard } from "lucide-react";

const solutions = [
  {
    id: "globalpay",
    icon: Wallet,
    title: "GlobalPay",
    subtitle: "The World's Most Advanced AI-Powered Mobile Money Platform",
    demo: "https://tesfapay.techmonk.world",
    hero: "Complete enterprise wallet ecosystem with 14 core modules, 50+ AI features, and infrastructure to serve 10M+ users across African markets.",
    modules: [
      { name: "Customer Wallet", desc: "P2P transfers, bill payments, merchant QR, airtime top-up, smart savings goals" },
      { name: "AI Copilot", desc: "Conversational banking, fraud detection (99.7% accuracy), predictive analytics, behavioral biometrics" },
      { name: "AI Credit Scoring", desc: "WoE/IV scorecards with psychometric overlays, document OCR, alternative data signals" },
      { name: "Agent Network", desc: "4-tier hierarchy (Super → Master → Agent → Sub-Agent), AI float prediction, commission engine" },
      { name: "Merchant Portal", desc: "QR payments, inventory management, dynamic pricing, customer segmentation" },
      { name: "Enterprise Admin", desc: "KYC/AML center, transaction monitoring, e-money management, regulatory reporting" },
    ],
    stats: [
      { value: "14", label: "Core Modules" },
      { value: "50+", label: "AI Features" },
      { value: "<0.3s", label: "Avg Latency" },
      { value: "99.99%", label: "Uptime SLA" },
    ],
  },
  {
    id: "digital-experience",
    icon: LayoutDashboard,
    title: "Digital Experience Platform",
    subtitle: "Comprehensive Multi-Portal Financial Services Ecosystem",
    demo: "https://nisir.techurate.world",
    hero: "Five independent portals unified under a single platform — retail banking, agency banking, merchant payments, internet banking, and centralized admin console.",
    modules: [
      { name: "Retail Portal", desc: "Mobile-first individual banking — savings, payments, loans, tiered KYC compliance" },
      { name: "Agency Banking", desc: "Balance inquiry, customer transfer, savings collection, commission tracking, EOD reconciliation" },
      { name: "Merchant Portal", desc: "Payment acceptance, settlement management, business analytics, inventory integration" },
      { name: "Internet Banking", desc: "Corporate RBAC, maker-checker authorization, vendor payments, cash management, scheduled payments" },
      { name: "Loan Management", desc: "Full lifecycle — origination, disbursement, interest accruals, penalties, waivers, collections" },
      { name: "Admin Console", desc: "Corporate onboarding, entity registration, user/role assignment, document management" },
    ],
    stats: [
      { value: "5", label: "Portals" },
      { value: "100%", label: "Bilingual" },
      { value: "T24/Flexcube", label: "CBS Integration" },
      { value: "NBE", label: "Compliant" },
    ],
  },
  {
    id: "africaone",
    icon: BarChart3,
    title: "AfricaOne",
    subtitle: "Pan-African Credit Intelligence Platform",
    demo: "https://africaone.techmonk.world",
    hero: "AI-powered credit scoring, document intelligence, and production-grade integrations for Africa's financial future. Serving 12+ markets with thin-file friendly scoring.",
    modules: [
      { name: "AI Scoring Engine", desc: "WoE + IV logistic regression, 300-900 score range, 5 risk bands (A-E), bureau fusion, <2s latency" },
      { name: "Smart Document OCR", desc: "Gemini-powered extraction (92%+ confidence), 3-month period validation, salary auto-mapping" },
      { name: "Fairness Monitoring", desc: "Gender/age/regional tracking, ≤5% disparity thresholds, transparent feature contributions" },
      { name: "Grace AI Assistant", desc: "Natural language Q&A, score justification, policy recommendations, session persistence" },
      { name: "Integration Pipeline", desc: "Encrypted credential vault, sandbox→production promotion, API proxy gateway, 40+ entities" },
      { name: "Psychometric Assessment", desc: "Remote SMS/WhatsApp delivery, in-branch guided sessions, feeds into decisioning model" },
    ],
    stats: [
      { value: "12+", label: "Markets" },
      { value: "300-900", label: "Score Range" },
      { value: "<2s", label: "Latency" },
      { value: "40+", label: "Integrations" },
    ],
  },
  {
    id: "ai-banking-core",
    icon: Brain,
    title: "AI Banking Core",
    subtitle: "Intelligent Operations & Customer Engagement Platform",
    demo: "https://abcstudio.techmonk.world",
    hero: "Agentic AI platform for banking operations — Customer Data Platform, multi-agent runtime, orchestration engine, and autonomous decision-making at scale.",
    modules: [
      { name: "Customer Data Platform", desc: "2.4M+ profiles, 12,847 events/sec, real-time segmentation, 96.8% data quality" },
      { name: "AI Agent Runtime", desc: "8 active agents, 9,013 decisions/hr, co-pilot & autonomous modes, performance scoring" },
      { name: "Orchestration Engine", desc: "Multi-channel campaigns, event-driven triggers, A/B testing, conversion tracking" },
      { name: "Fraud Detection", desc: "Real-time anomaly detection, ML models trained on regional patterns, automated alerting" },
      { name: "Dormancy Revival", desc: "AI-powered re-engagement of dormant accounts, personalized win-back campaigns" },
      { name: "Pipeline Studio", desc: "Visual workflow builder, drag-and-drop orchestration, real-time monitoring" },
    ],
    stats: [
      { value: "9K+", label: "Decisions/hr" },
      { value: "2.4M+", label: "Profiles" },
      { value: "8", label: "AI Agents" },
      { value: "96.8%", label: "Data Quality" },
    ],
  },
  {
    id: "smart-wallet",
    icon: Smartphone,
    title: "Smart Wallet",
    subtitle: "White-Label Consumer Digital Wallet",
    demo: "https://tesfapay.techmonk.world",
    hero: "Ready-to-deploy digital wallet with multi-wallet savings, auto-save features, bill payments, and diaspora connectivity. Bank-grade security for all transactions.",
    modules: [
      { name: "Multi-Wallets", desc: "Education, Medical, Holiday & Retirement purpose-built savings wallets" },
      { name: "Auto-Save", desc: "Automatic 5% savings on every transaction, round-up deposits, AI-suggested targets" },
      { name: "Bill Payments", desc: "Utilities, telecom, school fees — 200+ billers via single API gateway" },
      { name: "P2P Transfers", desc: "Instant transfers via phone number, QR code, or NFC tap with multi-currency support" },
      { name: "Diaspora Connect", desc: "Cross-border remittance, multi-currency wallets, family support features" },
      { name: "Loyalty Engine", desc: "Earn rewards on every transaction, tiered benefits, gamification" },
    ],
    stats: [
      { value: "50K+", label: "Active Users" },
      { value: "KES 2B+", label: "Transactions" },
      { value: "99.9%", label: "Uptime" },
      { value: "3s", label: "Avg Transfer" },
    ],
  },
  {
    id: "eximvoice",
    icon: Phone,
    title: "EximVoice",
    subtitle: "AI-Powered Voice Call Center for Banks",
    demo: "https://eximvoice.techmonk.world",
    hero: "Versatile, cost-effective AI voice-based call center solution for banks. Experience multilingual support in English, Arabic, and French with real-time AI resolution, intelligent call routing, and comprehensive agent performance analytics.",
    modules: [
      { name: "AI Voice Agent", desc: "Handles routine inquiries — mobile banking, card issues, balance checks — with 78% AI resolution rate" },
      { name: "Live Call Dashboard", desc: "Real-time monitoring of active calls, queue management, priority tagging, and agent assignment" },
      { name: "Multilingual Support", desc: "Native support for English, Arabic, and French with context-aware language switching" },
      { name: "Agent Management", desc: "Performance scoring, call routing, workload balancing, and real-time coaching tools" },
      { name: "Knowledge Base", desc: "AI-curated knowledge repository for instant answers, policy lookups, and compliance scripts" },
      { name: "Analytics & Reporting", desc: "Call volume trends, resolution rates, customer satisfaction tracking, and issue categorization" },
    ],
    stats: [
      { value: "78%", label: "AI Resolution" },
      { value: "45s", label: "Avg Wait Time" },
      { value: "4.6/5", label: "CSAT Score" },
      { value: "3", label: "Languages" },
    ],
  },
  {
    id: "tigiverse",
    icon: Bot,
    title: "TigiVerse",
    subtitle: "AI Copilot Platform for Commercial Banks",
    demo: "https://tigiverseai.techurate.world",
    hero: "Custom-built AI agent platform for commercial banks — deploy domain-specific copilots for credit analysis, compliance, customer service, trade finance, and treasury operations. Each agent is trained on your bank's policies, products, and regulatory framework.",
    modules: [
      { name: "Credit Analysis Agent", desc: "Automated financial statement analysis, risk assessment, covenant monitoring, and credit memo generation" },
      { name: "Compliance Copilot", desc: "Real-time regulatory screening, AML/KYC automation, suspicious activity reporting, and policy updates" },
      { name: "Customer Service Agent", desc: "Intelligent ticket routing, context-aware responses, escalation management, and feedback loops" },
      { name: "Trade Finance Agent", desc: "LC processing, document verification, trade risk assessment, and cross-border compliance checks" },
      { name: "Treasury Copilot", desc: "Liquidity forecasting, FX exposure management, investment recommendations, and ALM support" },
      { name: "Agent Builder Studio", desc: "No-code agent creation, domain knowledge ingestion, testing sandbox, and deployment pipeline" },
    ],
    stats: [
      { value: "6+", label: "Domain Agents" },
      { value: "85%", label: "Task Automation" },
      { value: "< 3s", label: "Response Time" },
      { value: "Custom", label: "Bank-Trained" },
    ],
  },
  {
    id: "digital-lending",
    icon: CreditCard,
    title: "Digital Lending Platform",
    subtitle: "Uncollateralized MSME Credit & Wallet Services",
    demo: "https://michu2.0.wematech.in",
    hero: "End-to-end digital lending platform delivering uncollateralized credit, wallet services, and smart savings for MSMEs. AI-powered credit decisioning with alternative data scoring, instant disbursement, and automated collections.",
    modules: [
      { name: "Instant Credit", desc: "Uncollateralized micro-loans with AI credit scoring, alternative data signals, and real-time disbursement" },
      { name: "Smart Wallet", desc: "Integrated digital wallet for repayments, savings, and merchant transactions" },
      { name: "Savings Goals", desc: "Purpose-built savings products with auto-deduction, target tracking, and interest accrual" },
      { name: "Credit Scoring Engine", desc: "Psychometric + transactional scoring for thin-file borrowers, 300-900 range with instant decisions" },
      { name: "Collections & Recovery", desc: "Automated SMS/push reminders, grace period management, restructuring workflows" },
      { name: "MSME Dashboard", desc: "Business health monitoring, cash flow analytics, credit limit management, and repayment tracking" },
    ],
    stats: [
      { value: "< 60s", label: "Disbursement" },
      { value: "Zero", label: "Collateral" },
      { value: "95%", label: "Repayment Rate" },
      { value: "MSME", label: "Focused" },
    ],
  },
];

const Solutions = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="section-container text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Solutions Portfolio
          </span>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Digital Banking <span className="glow-text">Solutions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive go-to-market solutions engineered for Africa's financial institutions — from mobile money to credit intelligence.
          </p>
        </div>
      </section>

      {solutions.map((sol, idx) => (
        <section key={sol.id} id={sol.id} className="py-20 relative">
          {idx % 2 === 0 && (
            <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[180px]" />
          )}
          <div className="section-container relative z-10">
            <div className="glass-card glow-border overflow-hidden">
              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <sol.icon size={26} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="font-heading text-3xl font-bold text-foreground">{sol.title}</h2>
                        <p className="text-sm text-primary font-medium">{sol.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">{sol.hero}</p>
                  </div>
                  <a
                    href={sol.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 flex-shrink-0"
                  >
                    View Demo <ExternalLink size={14} />
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {sol.stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-4 text-center">
                      <p className="font-heading text-2xl font-bold glow-text">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Modules */}
                <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Core Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sol.modules.map((mod) => (
                    <div key={mod.name} className="glass-card-hover p-5">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ArrowRight size={12} className="text-primary" />
                        {mod.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTASection />
      <Footer />
    </div>
  );
};

export default Solutions;
