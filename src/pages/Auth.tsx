import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/microsaas/compliance-alert/app";
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate(redirectTo, { replace: true });
  }, [user, authLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: {
              full_name: fullName,
              organization,
              country,
              job_title: jobTitle,
            },
          },
        });
        if (error) throw error;
        toast({ title: "Welcome to ComplianceAlert", description: "Account created. Loading your dashboard…" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Signed in" });
      }
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      toast({
        title: mode === "signup" ? "Couldn't create account" : "Couldn't sign in",
        description: msg.includes("registered") ? "Email already in use — try signing in instead." : msg,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Helmet>
        <title>{mode === "signup" ? "Create account" : "Sign in"} · ComplianceAlert</title>
      </Helmet>

      <div className="w-full max-w-md">
        <Link
          to="/microsaas/compliance-alert"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Back to product
        </Link>

        <div className="glass-card p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">
                {mode === "signup" ? "Activate ComplianceAlert" : "Welcome back"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {mode === "signup" ? "Free 14-day trial · no card" : "Sign in to your dashboard"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Adaeze Okoro" required />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Organisation" value={organization} onChange={setOrganization} placeholder="Lagos MFB" required />
                  <Field label="Country" value={country} onChange={setCountry} placeholder="Nigeria" />
                </div>
                <Field label="Job title" value={jobTitle} onChange={setJobTitle} placeholder="Head of Compliance" />
              </>
            )}
            <Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@bank.com" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required minLength={8} />

            <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
              {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">Sign in</button>
              </>
            ) : (
              <>New here?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Create an account</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label, value, onChange, type = "text", placeholder, required, minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}{required && " *"}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
    />
  </div>
);

export default Auth;
