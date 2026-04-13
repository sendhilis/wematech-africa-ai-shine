import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DemoAccessContextType {
  isVerified: boolean;
  verifiedEmail: string;
  verifiedName: string;
  requestDemoAccess: (demoUrl: string) => void;
  pendingDemoUrl: string | null;
  clearPending: () => void;
}

const DemoAccessContext = createContext<DemoAccessContextType>({
  isVerified: false,
  verifiedEmail: "",
  verifiedName: "",
  requestDemoAccess: () => {},
  pendingDemoUrl: null,
  clearPending: () => {},
});

export const useDemoAccess = () => useContext(DemoAccessContext);

export const DemoAccessProvider = ({ children }: { children: ReactNode }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [pendingDemoUrl, setPendingDemoUrl] = useState<string | null>(null);

  const requestDemoAccess = useCallback((demoUrl: string) => {
    if (isVerified) {
      window.open(demoUrl, "_blank", "noopener,noreferrer");
    } else {
      setPendingDemoUrl(demoUrl);
    }
  }, [isVerified]);

  const clearPending = useCallback(() => setPendingDemoUrl(null), []);

  return (
    <DemoAccessContext.Provider value={{
      isVerified,
      verifiedEmail,
      verifiedName,
      requestDemoAccess,
      pendingDemoUrl,
      clearPending,
    }}>
      {children}
      {/* Verification Modal */}
      {pendingDemoUrl && !isVerified && (
        <DemoVerificationModal
          onVerified={(name, email) => {
            setIsVerified(true);
            setVerifiedName(name);
            setVerifiedEmail(email);
            window.open(pendingDemoUrl!, "_blank", "noopener,noreferrer");
            setPendingDemoUrl(null);
          }}
          onClose={() => setPendingDemoUrl(null)}
        />
      )}
    </DemoAccessContext.Provider>
  );
};

type ModalStep = "email" | "otp";

const DemoVerificationModal = ({
  onVerified,
  onClose,
}: {
  onVerified: (name: string, email: string) => void;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<ModalStep>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { name, email },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: "Code Sent", description: `Verification code sent to ${email}` });
      setStep("otp");
    } catch {
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
        body: { email, code: otpCode },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Invalid Code", description: data.error, variant: "destructive" });
        return;
      }
      onVerified(name, email);
    } catch {
      toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card glow-border p-8 max-w-md w-full animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg">✕</button>

        {step === "email" ? (
          <>
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">Verify to Access Demo</h3>
              <p className="text-sm text-muted-foreground">Enter your details to receive a verification code</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Full Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="john@yourcompany.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? "Sending..." : "Send Verification Code →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">Sent to <strong className="text-foreground">{email}</strong></p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                pattern="\d{6}"
                className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="000000"
              />
              <button type="submit" disabled={loading || otpCode.length !== 6} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Verifying..." : "Verify & Open Demo →"}
              </button>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep("email")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Change email</button>
                <button type="button" onClick={handleSendOtp as any} disabled={loading} className="text-xs text-primary hover:text-primary/80 transition-colors">Resend code</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
