import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { microSaaSProducts } from "@/data/microsaas";

const MicroSaaSCatalogue = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wematech Micro-SaaS Catalogue | Plug-in AI for African Banking</title>
        <meta
          name="description"
          content="5 plug-in AI Micro-SaaS products for African banks, neobanks, MFIs and SMEs. BankBot, ScoreAI, SME Pulse, ComplianceAlert and LaunchKit. From $99/mo."
        />
        <link rel="canonical" href="https://wematech.africa/microsaas" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[180px] pointer-events-none" />
        <div className="section-container relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent mb-6">
            <Zap size={14} /> Wematech Micro-SaaS
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-5 max-w-4xl">
            Plug-in AI for African banks. <span className="glow-text">Live in 48 hours.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Five standalone subscriptions. Each solves one acute pain. Each priced
            for a department head to approve without procurement. Each expands into
            the full Wematech platform.
          </p>
        </div>
      </section>

      {/* Catalogue list */}
      <section className="pb-24">
        <div className="section-container space-y-6">
          {microSaaSProducts.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.slug}
                className="glass-card overflow-hidden border border-border/50"
              >
                {/* Header */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5 border-b border-border/40">
                  <span className="font-mono text-xs text-muted-foreground bg-secondary/50 border border-border/50 px-2.5 py-1 rounded-full flex-shrink-0">
                    {p.num}
                  </span>
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${p.accentClass}`}
                  >
                    <Icon size={26} className={p.iconColorClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                        {p.name}
                      </h2>
                      {p.hasLiveProduct && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3">
                      {p.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body 3-cols */}
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
                  <div className="p-6 sm:p-7">
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
                      The Gap It Fills
                    </h3>
                    <ul className="space-y-2.5">
                      {p.gap.map((g) => (
                        <li key={g} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                          <ArrowRight size={14} className="text-primary mt-1 flex-shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">
                      What It Does
                    </h3>
                    <ul className="space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                          <Check size={14} className="text-accent mt-1 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 sm:p-7 bg-card/30">
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
                      Why They Sign Up
                    </h3>
                    <div className="font-heading text-4xl font-bold text-foreground mb-2">
                      {p.bigStat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                      {p.bigStat.label}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.whyImpulse}
                    </p>
                  </div>
                </div>

                {/* Footer pricing + CTAs */}
                <div className="p-6 sm:p-7 bg-secondary/30 border-t border-border/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {p.pricing.map((t) => (
                      <div key={t.period}>
                        <div className="font-heading text-xl font-bold text-foreground">
                          {t.amount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {t.period}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Link
                      to={`/microsaas/${p.slug}`}
                      className="btn-outline text-xs flex-1 lg:flex-none"
                    >
                      Details
                    </Link>
                    {p.hasLiveProduct ? (
                      <Link
                        to={`/microsaas/${p.slug}/app`}
                        className="btn-primary text-xs flex-1 lg:flex-none whitespace-nowrap"
                      >
                        {p.ctaLabel ?? "Launch"}
                      </Link>
                    ) : (
                      <Link
                        to="/contact"
                        className="btn-primary text-xs flex-1 lg:flex-none whitespace-nowrap"
                      >
                        Request access →
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MicroSaaSCatalogue;
