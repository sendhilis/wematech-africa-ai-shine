import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Target, Globe, Cpu, Shield, Users, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Wematech Africa | Engineering Africa's Financial Future with AI</title>
        <meta name="description" content="Wematech Africa is an AI-first banking technology company serving 12+ African markets with core banking, credit intelligence, mobile money, and agentic AI solutions." />
        <link rel="canonical" href="https://www.wematech.in/about" />
      </Helmet>
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="section-container">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
              About Wematech
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground mb-6">
              Engineering Africa's
              <br />
              <span className="glow-text">Financial Future</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wematech is an Africa-focused digital banking solutions provider specializing in AI-powered 
              financial infrastructure. We build ground-up for the continent's unique markets — from 
              mobile money platforms and credit intelligence to autonomous banking operations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card glow-border p-8">
              <Target size={24} className="text-primary mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To democratize access to world-class financial technology across Africa. We believe every 
                institution — from central banks to microfinance — deserves AI-powered infrastructure that 
                can scale from thousands to millions of users.
              </p>
            </div>
            <div className="glass-card glow-border p-8">
              <Globe size={24} className="text-accent mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">Our Reach</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Operating across 12+ African markets with localized solutions for East Africa, 
                Southern Africa, and West Africa. Purpose-built integrations with regional bureaus, 
                mobile money providers, and regulatory frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-10 text-center">
            Core Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Cpu, title: "AI & Machine Learning", desc: "50+ AI features including credit scoring, fraud detection, conversational banking, and autonomous agent operations." },
              { icon: Shield, title: "Regulatory Compliance", desc: "Built-in KYC/AML, fairness auditing, maker-checker workflows, and central bank reporting across multiple jurisdictions." },
              { icon: Users, title: "Agent Networks", desc: "Hierarchical agent management supporting 50K+ agents with AI-powered float prediction and commission engines." },
              { icon: TrendingUp, title: "Credit Intelligence", desc: "Thin-file scoring using alternative data — mobile money, utilities, psychometrics — for first-time borrowers." },
            ].map((cap) => (
              <div key={cap.title} className="glass-card-hover p-6">
                <cap.icon size={22} className="text-primary mb-4" />
                <h3 className="font-heading text-sm font-bold text-foreground mb-2">{cap.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default About;
