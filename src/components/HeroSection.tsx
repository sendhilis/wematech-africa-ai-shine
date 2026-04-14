import { Link } from "react-router-dom";
import { ArrowRight, Shield, Cpu, Globe } from "lucide-react";
import heroImage from "@/assets/hero-africa.webp";

const HeroSection = () => {
  return (
    <header role="banner" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Digital Africa" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] animate-float-delayed" />

      <div className="section-container relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-4xl">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              Africa's Leading AI Banking Technology Partner
            </span>
          </div>

          <h1 className="animate-slide-up font-heading text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-4 sm:mb-6">
            AI-Powered
            <br />
            <span className="glow-text">Banking Technology</span>
            <br />
            Solutions for Africa
          </h1>

          <p className="animate-slide-up-delayed text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8 sm:mb-10">
            End-to-end digital financial infrastructure — from mobile money platforms and credit intelligence 
            to AI-driven customer engagement. Built for Africa's fastest-growing markets.
          </p>

          <div className="animate-slide-up-delayed-2 flex flex-wrap gap-4 mb-16">
            <Link to="/solutions" className="btn-primary flex items-center gap-2">
              Explore Solutions <ArrowRight size={16} />
            </Link>
            <Link to="/solutions#book-demo" className="btn-outline">
              Request Demo
            </Link>
          </div>

          <div className="animate-slide-up-delayed-2 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
            {[
              { icon: Globe, label: "12+ Markets", sub: "Pan-African" },
              { icon: Cpu, label: "50+ AI Features", sub: "Intelligent" },
              { icon: Shield, label: "99.99% Uptime", sub: "Enterprise" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{stat.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
