import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QualifierStep {
  question: string;
  options: { label: string; value: string }[];
}

const steps: QualifierStep[] = [
  {
    question: "What describes you best?",
    options: [
      { label: "Bank", value: "bank" },
      { label: "Fintech", value: "fintech" },
      { label: "MFI / SACCO", value: "mfi" },
    ],
  },
  {
    question: "Your biggest priority right now?",
    options: [
      { label: "Launch digital channels", value: "digital" },
      { label: "Smarter credit decisions", value: "credit" },
      { label: "Reduce fraud & risk", value: "fraud" },
    ],
  },
  {
    question: "Primary market?",
    options: [
      { label: "East Africa", value: "east" },
      { label: "West Africa", value: "west" },
      { label: "Pan-African", value: "pan" },
    ],
  },
];

// Map answers to personalized CTA
const getPersonalizedCTA = (answers: string[]): { label: string; to: string } => {
  const [, priority] = answers;
  if (priority === "digital")
    return { label: "See GlobalPay mobile money stack →", to: "/solutions#globalpay" };
  if (priority === "credit")
    return { label: "Explore AfricaOne credit intelligence →", to: "/solutions#africaone" };
  if (priority === "fraud")
    return { label: "View AI Banking Core fraud detection →", to: "/solutions#ai-banking-core" };
  return { label: "Explore all solutions →", to: "/solutions" };
};

const SilentQualifier = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Show after user has scrolled 30% of the page
  useEffect(() => {
    if (dismissed) return;

    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPct > 0.15 && !show) setShow(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [show, dismissed]);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setComplete(true);
    }
  };

  const handleCta = () => {
    const cta = getPersonalizedCTA(answers);
    dismiss();
    navigate(cta.to);
  };

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setShow(false);
      setDismissed(true);
    }, 400);
  };

  if (!show || dismissed) return null;

  const personalCta = complete ? getPersonalizedCTA(answers) : null;
  const currentStep = steps[step];

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-40 transition-all duration-500 ease-out",
        exiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl w-[300px] overflow-hidden">
        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${complete ? 100 : ((step) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {!complete ? (
            <>
              <p className="text-xs text-muted-foreground mb-1">
                {step + 1} of {steps.length}
              </p>
              <p className="text-sm font-semibold text-foreground mb-4">
                {currentStep.question}
              </p>
              <div className="flex flex-col gap-2">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="text-left text-sm px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 text-foreground/90"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-2">Perfect match found</p>
              <button
                onClick={handleCta}
                className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                {personalCta?.label}
              </button>
            </div>
          )}

          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default SilentQualifier;
