import { MapPin, Zap, Lock, Users, TrendingUp, Layers } from "lucide-react";

const reasons = [
  {
    icon: MapPin,
    title: "Africa-First Architecture",
    description: "Purpose-built for African markets with localized ID types, mobile money integrations, multi-currency support, and regulatory frameworks across 12+ countries.",
  },
  {
    icon: Zap,
    title: "AI-Native Platform",
    description: "50+ AI features spanning credit scoring, fraud detection, conversational banking, predictive analytics, and autonomous agent operations.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "RLS-enforced multi-tenancy, encrypted credential vaults, SOC2-ready audit trails, behavioral biometrics, and maker-checker authorization workflows.",
  },
  {
    icon: Users,
    title: "Agent & Merchant Networks",
    description: "Hierarchical agent management with float prediction, commission engines, and 50K+ agent network support extending financial services to last-mile communities.",
  },
  {
    icon: TrendingUp,
    title: "Thin-File Credit Intelligence",
    description: "Alternative data scoring using mobile money, utilities, and psychometrics — enabling credit access for first-time borrowers across emerging markets.",
  },
  {
    icon: Layers,
    title: "Modular & Scalable",
    description: "Cloud-native microservices architecture. Deploy individual modules or the full stack. Scale from startup to 10M+ users with 99.99% uptime SLA.",
  },
];

const WhyWematech = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[180px]" />
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
              Why Wematech
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Built for Africa.
              <br />
              <span className="text-primary">Powered by AI.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We don't adapt western fintech for Africa — we build ground-up for the continent's unique 
              financial landscape. From tiered KYC to mobile money interoperability, every feature is 
              designed for the markets we serve.
            </p>
            <div className="glass-card p-6">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Our platform processes over 9,000 AI-driven decisions per hour — from credit scoring 
                and fraud detection to autonomous customer engagement — enabling financial institutions 
                to serve millions with the agility of a startup."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason) => (
              <div key={reason.title} className="glass-card-hover p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <reason.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-heading text-sm font-bold text-foreground mb-2">{reason.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWematech;
