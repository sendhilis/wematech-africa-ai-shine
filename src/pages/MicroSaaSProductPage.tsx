import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMicroSaaSBySlug, microSaaSProducts } from "@/data/microsaas";

const MicroSaaSProductPage = () => {
  const { slug } = useParams();
  const product = slug ? getMicroSaaSBySlug(slug) : undefined;

  if (!product) return <Navigate to="/microsaas" replace />;

  const Icon = product.icon;
  const others = microSaaSProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.name} — Wematech Micro-SaaS</title>
        <meta name="description" content={product.tagline} />
        <link rel="canonical" href={`https://wematech.africa/microsaas/${product.slug}`} />
      </Helmet>

      <Navbar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full ${product.accentClass} blur-[160px] pointer-events-none opacity-60`}
        />
        <div className="section-container relative z-10">
          <Link
            to="/microsaas"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft size={14} /> All Micro-SaaS
          </Link>

          <div className="flex items-start gap-5 mb-8">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${product.accentClass}`}
            >
              <Icon size={30} className={product.iconColorClass} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  PRODUCT {product.num}
                </span>
                {product.hasLiveProduct && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    Live
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground">
                {product.name}
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground text-lg max-w-3xl mb-8 leading-relaxed">
            {product.tagline}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {product.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {product.hasLiveProduct ? (
              <Link to={`/microsaas/${product.slug}/app`} className="btn-primary">
                {product.ctaLabel ?? "Launch"} <ArrowRight size={16} className="ml-1" />
              </Link>
            ) : (
              <Link to="/contact" className="btn-primary">
                Request access <ArrowRight size={16} className="ml-1" />
              </Link>
            )}
            <a href="#pricing" className="btn-outline">
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border/30">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-7">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
              The Gap It Fills
            </h2>
            <ul className="space-y-3">
              {product.gap.map((g) => (
                <li key={g} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                  <ArrowRight size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-7">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">
              What It Does
            </h2>
            <ul className="space-y-3">
              {product.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                  <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/30">
        <div className="section-container text-center max-w-3xl mx-auto">
          <Sparkles size={20} className="text-accent mx-auto mb-4" />
          <div className="font-heading text-6xl sm:text-7xl font-bold glow-text mb-3">
            {product.bigStat.value}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
            {product.bigStat.label}
          </div>
          <p className="text-foreground/80 text-lg leading-relaxed">{product.whyImpulse}</p>
        </div>
      </section>

      <section id="pricing" className="py-16 border-t border-border/30">
        <div className="section-container">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-2">
            Pricing
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Cancel anytime. Billing connection coming soon.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {product.pricing.map((t, i) => (
              <div
                key={t.period}
                className={`glass-card p-6 text-center ${i === 1 ? "ring-1 ring-accent/40" : ""}`}
              >
                <div className="font-heading text-3xl font-bold text-foreground mb-1">
                  {t.amount}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t.period}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            {product.hasLiveProduct ? (
              <Link to={`/microsaas/${product.slug}/app`} className="btn-primary">
                {product.ctaLabel ?? "Launch product"}
              </Link>
            ) : (
              <Link to="/contact" className="btn-primary">
                Request early access
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
            Other Wematech Micro-SaaS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {others.map((o) => {
              const OIcon = o.icon;
              return (
                <Link
                  key={o.slug}
                  to={`/microsaas/${o.slug}`}
                  className="glass-card-hover p-5 group"
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${o.accentClass}`}
                  >
                    <OIcon size={18} className={o.iconColorClass} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground mb-1">
                    {o.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {o.tagline}
                  </p>
                  <span className="text-xs text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MicroSaaSProductPage;
