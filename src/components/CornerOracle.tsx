import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, X } from "lucide-react";

interface SectionQA {
  sectionId: string;
  question: string;
  answer: string;
}

const defaultQAs: SectionQA[] = [
  {
    sectionId: "globalpay",
    question: "How long does GlobalPay integration take?",
    answer: "Typical deployment is 8–12 weeks for full integration including agent network setup, wallet infrastructure, and regulatory compliance. We handle CBS integration (T24, Flexcube, Temenos) and provide sandbox access from week one.",
  },
  {
    sectionId: "digital-experience",
    question: "Can this work with our existing core banking system?",
    answer: "Yes. The platform integrates natively with T24, Flexcube, and most major CBS platforms via pre-built API adapters. We've deployed alongside legacy systems without requiring a core swap — the portal layer sits on top.",
  },
  {
    sectionId: "africaone",
    question: "How accurate is the credit scoring for thin-file borrowers?",
    answer: "Our WoE/IV scoring engine combined with psychometric overlays achieves 82%+ accuracy on thin-file populations. We fuse bureau data where available and layer alternative signals — mobile money history, utility payments, merchant transactions — to build reliable risk profiles.",
  },
  {
    sectionId: "ai-banking-core",
    question: "What happens to our existing customer data?",
    answer: "Your data stays in your infrastructure. The CDP ingests and unifies data via secure API connectors — no data leaves your environment unless you configure external integrations. We support on-premise and private cloud deployments for regulated institutions.",
  },
  {
    sectionId: "smart-wallet",
    question: "Is this white-label? Can we brand it fully?",
    answer: "Fully white-label. You control brand identity, colour scheme, onboarding flows, and feature toggles. Your customers will never see our brand. We provide a theming SDK and design system that maps to your brand guidelines.",
  },
  {
    sectionId: "eximvoice",
    question: "What languages does the AI voice agent support?",
    answer: "Currently English, Arabic, and French with native-level fluency. The system handles context-aware language switching mid-call. We're expanding to Swahili, Amharic, and Hausa in Q3 2025 with the same accuracy benchmarks.",
  },
  {
    sectionId: "tigiverse",
    question: "How is this different from ChatGPT for banking?",
    answer: "TigiVerse agents are trained specifically on your bank's policies, products, and regulatory framework — not general knowledge. They operate within compliance boundaries, access your internal systems via secure APIs, and every response is auditable. Generic LLMs can't do that.",
  },
  {
    sectionId: "digital-lending",
    question: "What's the default rate on uncollateralized loans?",
    answer: "Our AI scoring keeps default rates under 5% across deployed portfolios. The system combines psychometric assessment, transactional history, and behavioral signals to identify creditworthy thin-file borrowers that traditional scoring would reject.",
  },
  {
    sectionId: "finiosiq",
    question: "How does FiniosIQ adapt to different African regulators?",
    answer: "The AI country adapter auto-maps any Reserve Bank's compliance directives — NBE, CBK, CBN, SARB, BOU — to report templates, validation thresholds, and submission formats. When regulations change, the engine re-configures without code changes. One deployment covers all 54 African markets.",
  },
  // Homepage sections
  {
    sectionId: "solutions-overview",
    question: "Which solution is right for my institution?",
    answer: "It depends on your primary objective. For mobile money and wallet infrastructure: GlobalPay. For credit decisioning: AfricaOne. For full digital banking portals: Digital Experience Platform. Most clients start with one and expand — we're modular by design.",
  },
  {
    sectionId: "why-wematech",
    question: "Do you work with regulators directly?",
    answer: "Yes. We've worked with central banks in Ethiopia, Kenya, Nigeria, and Rwanda on compliance frameworks. Our RegTech modules are pre-configured for CBN, CBK, NBE, and BNR requirements. We handle regulatory reporting as part of the platform.",
  },
];

interface CornerOracleProps {
  qas?: SectionQA[];
}

const CornerOracle = ({ qas = defaultQAs }: CornerOracleProps) => {
  const [currentQA, setCurrentQA] = useState<SectionQA | null>(null);
  const [open, setOpen] = useState(false);
  const [answeredSections, setAnsweredSections] = useState<Set<string>>(new Set());
  const currentSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const sectionIds = qas.map((q) => q.sectionId);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            currentSectionRef.current = entry.target.id;
            const qa = qas.find(
              (q) => q.sectionId === entry.target.id && !answeredSections.has(q.sectionId)
            );
            if (qa) {
              setCurrentQA(qa);
              setOpen(false); // Reset open state for new section
            }
          }
        }
      },
      { threshold: [0.3] }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [qas, answeredSections]);

  const handleOpen = () => {
    setOpen(true);
    if (currentQA) {
      setAnsweredSections((prev) => new Set([...prev, currentQA.sectionId]));
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!currentQA) return null;

  return (
    <div className="fixed bottom-6 right-3 sm:right-6 z-40 max-w-[calc(100vw-1.5rem)]">
      {open ? (
        <div
          className={cn(
            "bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl",
            "w-[320px] max-w-[calc(100vw-1.5rem)] transition-all duration-400 ease-out animate-in fade-in slide-in-from-bottom-2"
          )}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {currentQA.question}
              </p>
              <button
                onClick={handleClose}
                className="text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0 mt-0.5"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentQA.answer}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className={cn(
            "h-8 px-4 flex items-center gap-2 rounded-full",
            "bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg",
            "hover:bg-card hover:border-primary/30 transition-all duration-300",
            "text-xs text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles size={12} className="text-primary" />
          <span className="max-w-[200px] truncate">{currentQA.question}</span>
        </button>
      )}
    </div>
  );
};

export default CornerOracle;
