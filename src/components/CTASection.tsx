import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-[150px]" />

      <div className="section-container relative z-10 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Ready to Transform
          <br />
          <span className="glow-text">Digital Banking in Africa?</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
          Partner with Wematech to deploy world-class financial infrastructure 
          tailored for African markets.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/solutions#book-demo" className="btn-primary flex items-center gap-2 text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4">
            Schedule a Demo <ArrowRight size={18} />
          </Link>
          <Link to="/solutions" className="btn-outline text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4">
            View Solutions
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
