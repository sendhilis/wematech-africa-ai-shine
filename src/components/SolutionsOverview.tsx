import { Link } from "react-router-dom";
import { ArrowRight, Wallet, LayoutDashboard, BarChart3, Brain, Smartphone, Phone, Bot, CreditCard } from "lucide-react";

const solutions = [
  {
    icon: Wallet,
    title: "GlobalPay",
    subtitle: "AI-Powered Mobile Money Platform",
    description: "Complete enterprise wallet with 14 core modules, agent networks, merchant payments, AI micro-loans, and conversational banking. Serving 10M+ users with <0.3s latency.",
    features: ["P2P Transfers", "Agent Network", "AI Credit Scoring", "Merchant QR Payments"],
    slug: "globalpay",
    demo: "https://tesfapay.techmonk.world",
    color: "primary",
  },
  {
    icon: LayoutDashboard,
    title: "Digital Experience Platform",
    subtitle: "Multi-Portal Banking Ecosystem",
    description: "Comprehensive 5-portal financial services platform — retail, agency, merchant, internet banking & admin. Built with shadow banking architecture and regulatory compliance.",
    features: ["Retail Portal", "Agency Banking", "Corporate RBAC", "Loan Management"],
    slug: "digital-experience",
    demo: "https://nisir.techurate.world",
    color: "accent",
  },
  {
    icon: BarChart3,
    title: "AfricaOne",
    subtitle: "Pan-African Credit Intelligence",
    description: "AI-powered credit scoring for thin-file borrowers across 12+ African markets. WoE/IV logistic regression, document OCR, fairness monitoring, and bureau fusion.",
    features: ["AI Scoring (300-900)", "Smart OCR", "Fairness Auditing", "40+ Integrations"],
    slug: "africaone",
    demo: "https://africaone.techmonk.world",
    color: "primary",
  },
  {
    icon: Brain,
    title: "AI Banking Core",
    subtitle: "Intelligent Operations & Automation",
    description: "Agentic AI platform for banking operations — CDP, multi-agent runtime, orchestration, fraud detection, dormancy revival, and cross-sell automation with 9,000+ decisions/hour.",
    features: ["AI Agents", "CDP & Segments", "Fraud Detection", "Orchestration"],
    slug: "ai-banking-core",
    demo: "https://abcstudio.techmonk.world",
    color: "accent",
  },
  {
    icon: Smartphone,
    title: "Smart Wallet",
    subtitle: "Consumer Digital Wallet",
    description: "White-label digital wallet solution with multi-wallet savings, auto-save features, bill payments, and bank-grade security. Deployed across East African markets.",
    features: ["Multi-Wallets", "Auto-Save", "Bill Payments", "Diaspora Connect"],
    slug: "smart-wallet",
    demo: "https://tesfapay.techmonk.world",
    color: "primary",
  },
  {
    icon: Phone,
    title: "EximVoice",
    subtitle: "AI Voice Call Center",
    description: "Cost-effective AI voice-based call center for banks with multilingual support in English, Arabic & French. 78% AI resolution rate, real-time monitoring, and intelligent call routing.",
    features: ["Multilingual AI", "Live Dashboard", "Agent Analytics", "Knowledge Base"],
    slug: "eximvoice",
    demo: "https://eximvoice.techmonk.world",
    color: "accent",
  },
  {
    icon: Bot,
    title: "TigiVerse",
    subtitle: "AI Copilot for Banks",
    description: "Custom-built AI agent platform for commercial banks — deploy domain-specific copilots for credit, compliance, trade finance, treasury, and customer service operations.",
    features: ["Domain Agents", "Agent Builder", "Compliance AI", "Trade Finance"],
    slug: "tigiverse",
    demo: "https://tigiverseai.techurate.world",
    color: "primary",
  },
  {
    icon: CreditCard,
    title: "Digital Lending Platform",
    subtitle: "MSME Credit & Wallet Services",
    description: "End-to-end digital lending with uncollateralized credit, AI scoring, smart savings, and instant disbursement for MSMEs. Zero collateral, sub-60s disbursement.",
    features: ["Instant Credit", "AI Scoring", "Smart Savings", "MSME Dashboard"],
    slug: "digital-lending",
    demo: "https://michu2.0.wematech.in",
    color: "accent",
  },
];

const SolutionsOverview = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[200px]" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Our Solutions
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            End-to-End Digital Banking
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From mobile money infrastructure to AI-driven credit intelligence — everything Africa's financial institutions need to go digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((sol) => (
            <div key={sol.slug} className="glass-card-hover p-8 flex flex-col group">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${
                sol.color === "primary" ? "bg-primary/10" : "bg-accent/10"
              }`}>
                <sol.icon size={22} className={sol.color === "primary" ? "text-primary" : "text-accent"} />
              </div>

              <h3 className="font-heading text-xl font-bold text-foreground mb-1">{sol.title}</h3>
              <p className="text-xs text-primary font-medium mb-3">{sol.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{sol.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {sol.features.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Link to={`/solutions#${sol.slug}`} className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight size={14} />
                </Link>
                <a href={sol.demo} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  View Demo →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsOverview;
