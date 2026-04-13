import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Send, Loader2, CheckCircle, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { format } from "date-fns";

type Step = "verify-email" | "enter-otp" | "book-demo" | "done";

const DemoBooking = () => {
  const [step, setStep] = useState<Step>("verify-email");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [verifyData, setVerifyData] = useState({ name: "", email: "" });
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({ organization: "", message: "" });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { name: verifyData.name, email: verifyData.email },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      const devCode = data?.devCode ? ` [DEV CODE: ${data.devCode}]` : "";
      toast({ title: "Code Sent", description: `A verification code has been sent to ${verifyData.email}${devCode}` });
      setStep("enter-otp");
    } catch (error) {
      console.error("OTP send error:", error);
      toast({ title: "Error", description: "Failed to send verification code.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email: verifyData.email, code: otpCode },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Invalid Code", description: data.error, variant: "destructive" });
        return;
      }

      toast({ title: "Verified!", description: "Your email has been verified." });
      setStep("book-demo");
    } catch (error) {
      console.error("OTP verify error:", error);
      toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast({ title: "Please select a demo date", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const bookingId = crypto.randomUUID();
      const demoDateStr = format(selectedDate, "yyyy-MM-dd");

      const { error: dbError } = await supabase.from("demo_bookings").insert({
        id: bookingId,
        name: verifyData.name,
        email: verifyData.email,
        organization: formData.organization || null,
        message: formData.message || null,
        demo_date: demoDateStr,
      });

      if (dbError) throw dbError;

      await supabase.functions.invoke("send-demo-notification", {
        body: {
          name: verifyData.name,
          email: verifyData.email,
          organization: formData.organization,
          message: formData.message,
          demoDate: format(selectedDate, "EEEE, MMMM d, yyyy"),
        },
      });

      setStep("done");
    } catch (error) {
      console.error("Error booking demo:", error);
      toast({ title: "Error", description: "Failed to book your demo. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const disabledDays = [{ before: new Date() }, { dayOfWeek: [0, 6] }];

  return (
    <section id="book-demo" className="py-24 relative">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[180px]" />
      <div className="section-container relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Book a Demo
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Schedule Your <span className="glow-text">Live Demo</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Verify your email to access our demo portal and schedule a personalized session.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { key: "verify-email", label: "Email" },
            { key: "enter-otp", label: "Verify" },
            { key: "book-demo", label: "Book" },
          ].map((s, i) => {
            const isActive = step === s.key || (step === "done" && i <= 2);
            const isPast =
              (step === "enter-otp" && i === 0) ||
              (step === "book-demo" && i <= 1) ||
              step === "done";
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${isPast ? "bg-primary" : "bg-border"}`} />}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isPast
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary/20 text-primary border border-primary"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {isPast ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${isActive || isPast ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card glow-border overflow-hidden">

            {/* Step 1: Email verification */}
            {step === "verify-email" && (
              <div className="p-8 sm:p-12 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Verify Your Email</h3>
                    <p className="text-xs text-muted-foreground">We'll send a verification code to your email</p>
                  </div>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Full Name *</label>
                    <input
                      name="name"
                      value={verifyData.name}
                      onChange={(e) => setVerifyData((p) => ({ ...p, name: e.target.value }))}
                      required
                      maxLength={100}
                      className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Official Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={verifyData.email}
                      onChange={(e) => setVerifyData((p) => ({ ...p, email: e.target.value }))}
                      required
                      maxLength={255}
                      className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="john@yourcompany.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>Sending Code... <Loader2 size={14} className="animate-spin" /></>
                    ) : (
                      <>Send Verification Code <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: OTP entry */}
            {step === "enter-otp" && (
              <div className="p-8 sm:p-12 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Enter Verification Code</h3>
                    <p className="text-xs text-muted-foreground">Check your inbox at <strong className="text-foreground">{verifyData.email}</strong></p>
                  </div>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">6-Digit Code *</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="000000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>Verifying... <Loader2 size={14} className="animate-spin" /></>
                    ) : (
                      <>Verify & Continue <ArrowRight size={14} /></>
                    )}
                  </button>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("verify-email")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp as any}
                      disabled={loading}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Demo booking */}
            {step === "book-demo" && (
              <div>
                <div className="p-6 border-b border-border/40 bg-primary/5">
                  <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <CheckCircle size={18} className="text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Verified as <strong>{verifyData.name}</strong> ({verifyData.email})
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 border-b md:border-b-0 md:border-r border-border/40 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <CalendarDays size={20} className="text-primary" />
                      <h3 className="font-heading text-lg font-semibold text-foreground">Select a Date</h3>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={disabledDays}
                      className="p-3 pointer-events-auto rounded-xl [&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-foreground",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-secondary border border-border rounded-md p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative rounded-md",
                        day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-secondary transition-colors inline-flex items-center justify-center",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent/20 text-accent-foreground font-semibold",
                        day_outside: "text-muted-foreground opacity-30",
                        day_disabled: "text-muted-foreground opacity-20",
                        day_hidden: "invisible",
                      }}
                    />
                    {selectedDate && (
                      <p className="mt-4 text-sm text-primary font-medium">
                        Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Additional Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">Organization</label>
                        <input
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          maxLength={200}
                          className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Your company"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">Message</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={3}
                          maxLength={1000}
                          className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          placeholder="What solutions are you interested in?"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !selectedDate}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>Booking... <Loader2 size={14} className="animate-spin" /></>
                        ) : (
                          <>Book Demo <Send size={14} /></>
                        )}
                      </button>
                      {!selectedDate && (
                        <p className="text-xs text-muted-foreground text-center">
                          ← Please select a date from the calendar first
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {step === "done" && (
              <div className="flex flex-col items-center justify-center text-center py-20 px-8">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle size={36} className="text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Demo Booked!</h3>
                <p className="text-muted-foreground max-w-md">
                  We've received your request for <strong className="text-foreground">{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</strong>.
                  A confirmation has been sent to <strong className="text-foreground">{verifyData.email}</strong>.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoBooking;
