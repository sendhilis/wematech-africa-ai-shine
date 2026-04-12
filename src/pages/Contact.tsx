import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
              Get In Touch
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground mb-6">
              Let's Build <span className="glow-text">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Ready to deploy AI-powered banking infrastructure? Schedule a demo or reach out to our team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <div className="glass-card glow-border p-8 mb-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">info@wematech.io</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Offices</p>
                      <p className="text-sm text-muted-foreground">Nairobi, Kenya</p>
                      <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "We partner with financial institutions at every stage — from proof of concept 
                  to continent-wide deployments. Let us show you what AI-powered banking looks like."
                </p>
              </div>
            </div>

            <div className="glass-card glow-border p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Send size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">Request a Demo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">First Name</label>
                      <input required className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Last Name</label>
                      <input required className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                    <input type="email" required className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Organization</label>
                    <input className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Solution Interest</label>
                    <select className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>GlobalPay - Mobile Money</option>
                      <option>Digital Experience Platform</option>
                      <option>AfricaOne - Credit Intelligence</option>
                      <option>AI Banking Core</option>
                      <option>Smart Wallet</option>
                      <option>Full Platform Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Message</label>
                    <textarea rows={3} className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    Send Message <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
