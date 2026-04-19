import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Clock } from "lucide-react";
import { microSaaSProducts } from "@/data/microsaas";

const MicroSaaSShowcase = () => {
  // Duplicate for seamless marquee
  const loop = [...microSaaSProducts, ...microSaaSProducts];

  return (
    <section
      id="microsaas"
      className="py-24 relative overflow-hidden"
      aria-labelledby="microsaas-heading"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-accent/5 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent mb-6">
            <Sparkles size={14} />
            New · Wematech Micro-SaaS
          </span>
          <h2
            id="microsaas-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            5 plug-in AI services.{" "}
            <span className="glow-text">Live in 48 hours.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Standalone AI subscriptions for African banks, neobanks, MFIs and SMEs.
            Pick one. See value tomorrow. No procurement committee required.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <Clock size={12} className="text-primary" /> 48-hour deploy
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <Zap size={12} className="text-accent" /> From $99/mo
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <Sparkles size={12} className="text-primary" /> No platform lock-in
            </span>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-12 group">
          <div
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"
            aria-hidden
          />
          <div className="overflow-hidden py-2">
            <div
              className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]"
              style={{ width: "max-content" }}
            >
              {loop.map((p, i) => (
                <div
                  key={`${p.slug}-${i}`}
                  className="flex items-center gap-3 px-5 py-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm whitespace-nowrap"
                >
                  <span className="text-xl" aria-hidden>{p.emoji}</span>
                  <span className="font-heading font-semibold text-foreground text-sm">
                    {p.name}
                  </span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">
                    from {p.pricing[0].amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {microSaaSProducts.map((p, idx) => {
            const Icon = p.icon;
            const isLive = p.hasLiveProduct;
            const featured = idx === 3; // ComplianceAlert featured
            return (
              <Link
                key={p.slug}
                to={`/microsaas/${p.slug}`}
                className={`relative glass-card-hover p-6 flex flex-col group ${
                  featured ? "lg:col-span-1 ring-1 ring-accent/30" : ""
                }`}
              >
                {featured && (
                  <span className="absolute -top-2.5 left-6 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    Live now
                  </span>
                )}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center ${p.accentClass}`}
                  >
                    <Icon size={20} className={p.iconColorClass} />
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                    {p.num}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground mb-1.5">
                  {p.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1 line-clamp-3">
                  {p.tagline}
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-border/40">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      From
                    </div>
                    <div className="font-heading text-xl font-bold text-foreground">
                      {p.pricing[0].amount}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        /{p.pricing[0].period.includes("call") ? "call" : "mo"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                      isLive ? "text-accent" : "text-primary"
                    } group-hover:gap-2`}
                  >
                    {isLive ? "Try it" : "Learn more"}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA strip */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Explore the full Micro-SaaS catalogue
            </h3>
            <p className="text-sm text-muted-foreground">
              Pricing, features, the gap each one fills, and live demos where available.
            </p>
          </div>
          <Link to="/microsaas" className="btn-primary whitespace-nowrap">
            View Catalogue <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default MicroSaaSShowcase;
