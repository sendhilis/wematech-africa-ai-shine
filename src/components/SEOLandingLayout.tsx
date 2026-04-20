import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export interface SEOStat {
  value: string;
  label: string;
}

export interface SEOSolutionCard {
  title: string;
  description: string;
}

export interface SEOFAQ {
  question: string;
  answer: string;
}

export interface SEORelatedLink {
  to: string;
  label: string;
}

export interface SEOLandingLayoutProps {
  // SEO
  title: string;
  description: string;
  canonical: string;
  jsonLd?: object | object[];
  // Hero
  tag: string;
  badge?: string;
  heading: ReactNode; // can include <em>
  lead: string;
  stats: SEOStat[];
  // Meta line (optional, for blog-style posts)
  meta?: { author?: string; date?: string; readTime?: string };
  // Body
  children: ReactNode;
  // Footer / CTA
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  related?: SEORelatedLink[];
}

const SEOLandingLayout = ({
  title,
  description,
  canonical,
  jsonLd,
  tag,
  badge,
  heading,
  lead,
  stats,
  meta,
  children,
  ctaTitle,
  ctaText,
  ctaButtonText,
  related,
}: SEOLandingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        {jsonLd &&
          (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((obj, i) => (
            <script key={i} type="application/ld+json">
              {JSON.stringify(obj)}
            </script>
          ))}
      </Helmet>
      <Navbar />

      <article className="pt-32 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[200px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary px-2.5 py-1 rounded-md bg-primary/10">
                {tag}
              </span>
              {badge && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-accent/15 text-accent border border-accent/30">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {heading}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {lead}
            </p>
            {meta && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {meta.author && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> {meta.author}
                  </span>
                )}
                {meta.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {meta.date}
                  </span>
                )}
                {meta.readTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {meta.readTime}
                  </span>
                )}
              </div>
            )}

            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-heading text-2xl font-bold text-primary mb-1">
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>

          <div className="seo-prose space-y-6">{children}</div>

          {related && related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border/40">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Related reading
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/40 hover:bg-card/70 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {r.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 border border-primary/20 p-8 sm:p-10 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {ctaText}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-semibold text-sm transition-colors"
            >
              {ctaButtonText} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>

      <CTASection />
      <Footer />
    </div>
  );
};

/* ---------- Reusable section building blocks ---------- */

export const SEOSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section>
    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4 pb-3 border-b border-border/40">
      {title}
    </h2>
    <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

export const SEOSubheading = ({ children }: { children: ReactNode }) => (
  <h3 className="font-heading text-xl font-bold text-primary mt-6 mb-2">
    {children}
  </h3>
);

export const SEOHighlight = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl bg-primary/5 border-l-4 border-primary p-5 my-6 text-foreground/90 text-base leading-relaxed">
    {children}
  </div>
);

export const SEOSolutionGrid = ({ items }: { items: SEOSolutionCard[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
    {items.map((it) => (
      <div
        key={it.title}
        className="rounded-xl border border-border/40 bg-card/40 p-5"
      >
        <h4 className="font-heading text-sm font-semibold text-foreground mb-2">
          {it.title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {it.description}
        </p>
      </div>
    ))}
  </div>
);

export const SEOFAQList = ({ items }: { items: SEOFAQ[] }) => (
  <div className="my-6">
    {items.map((q) => (
      <div key={q.question} className="border-b border-border/40 py-5">
        <p className="font-semibold text-foreground mb-2">{q.question}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {q.answer}
        </p>
      </div>
    ))}
  </div>
);

export const SEOList = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground leading-relaxed">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

export default SEOLandingLayout;
