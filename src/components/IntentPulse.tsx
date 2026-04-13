import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SectionIntent {
  sectionId: string;
  message: string;
  cta?: { label: string; to: string };
}

const defaultIntents: SectionIntent[] = [
  {
    sectionId: "stats",
    message: "You're wondering if we've actually done this at scale.",
    cta: { label: "See case studies →", to: "/about" },
  },
  {
    sectionId: "solutions-overview",
    message: "Looking for the right product? Let's narrow it down.",
    cta: { label: "Explore solutions →", to: "/solutions" },
  },
  {
    sectionId: "why-wematech",
    message: "You want to know what makes us different from the rest.",
    cta: { label: "Our story →", to: "/about" },
  },
  {
    sectionId: "seo-content",
    message: "You're doing deep research. Smart move.",
    cta: { label: "Talk to our team →", to: "/contact" },
  },
  {
    sectionId: "faq",
    message: "Still have a question we haven't answered?",
    cta: { label: "Ask us directly →", to: "/contact" },
  },
];

interface IntentPulseProps {
  intents?: SectionIntent[];
}

const IntentPulse = ({ intents = defaultIntents }: IntentPulseProps) => {
  const navigate = useNavigate();
  const [activeIntent, setActiveIntent] = useState<SectionIntent | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const sectionTimers = useRef<Record<string, number>>({});
  const currentSection = useRef<string | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissedSections = useRef<Set<string>>(new Set());

  const computeConfidence = useCallback((sectionId: string, timeSpent: number) => {
    // Confidence grows with time: 0-2s = 0%, 2-5s = ramp to 60%, 5-8s = ramp to 90%
    if (timeSpent < 2) return 0;
    if (timeSpent < 5) return ((timeSpent - 2) / 3) * 60;
    if (timeSpent < 8) return 60 + ((timeSpent - 5) / 3) * 30;
    return 90;
  }, []);

  useEffect(() => {
    const sectionIds = intents.map((i) => i.sectionId);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            currentSection.current = id;
          } else if (currentSection.current === id) {
            // User scrolled past — dismiss if was showing
            if (activeIntent?.sectionId === id) {
              setExpanded(false);
              setVisible(false);
              setConfidence(0);
              dismissedSections.current.add(id);
            }
            currentSection.current = null;
          }
        }
      },
      { threshold: [0, 0.3, 0.6] }
    );

    // Observe sections
    const elements: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    // Tick timer
    tickInterval.current = setInterval(() => {
      const section = currentSection.current;
      if (!section || dismissedSections.current.has(section)) return;

      sectionTimers.current[section] = (sectionTimers.current[section] || 0) + 0.5;
      const conf = computeConfidence(section, sectionTimers.current[section]);
      setConfidence(conf);

      if (conf >= 60 && !expanded) {
        const intent = intents.find((i) => i.sectionId === section);
        if (intent) {
          setActiveIntent(intent);
          setVisible(true);
          setTimeout(() => setExpanded(true), 100);
        }
      }
    }, 500);

    return () => {
      observer.disconnect();
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, [intents, computeConfidence, expanded, activeIntent]);

  const handleDismiss = () => {
    setExpanded(false);
    setDismissed(true);
    if (activeIntent) dismissedSections.current.add(activeIntent.sectionId);
    setTimeout(() => {
      setVisible(false);
      setDismissed(false);
    }, 400);
  };

  const handleCta = () => {
    if (activeIntent?.cta) {
      navigate(activeIntent.cta.to);
    }
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out",
        expanded ? "opacity-100" : "opacity-70"
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-3 transition-all duration-500 ease-out",
          expanded
            ? "bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg max-w-[240px] sm:max-w-[280px]"
            : "w-2 h-2"
        )}
      >
        {/* The pulse dot */}
        <div
          className={cn(
            "rounded-full bg-primary flex-shrink-0 transition-all duration-500",
            expanded ? "w-2 h-2" : "w-2 h-2 animate-pulse"
          )}
        />

        {expanded && activeIntent && (
          <div className={cn(
            "flex flex-col gap-2 transition-opacity duration-300",
            dismissed ? "opacity-0" : "opacity-100"
          )}>
            <p className="text-sm text-foreground/90 leading-snug font-medium">
              {activeIntent.message}
            </p>
            {activeIntent.cta && (
              <button
                onClick={handleCta}
                className="text-xs text-primary font-semibold hover:underline text-left w-fit"
              >
                {activeIntent.cta.label}
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-3 text-muted-foreground/50 hover:text-muted-foreground text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentPulse;
