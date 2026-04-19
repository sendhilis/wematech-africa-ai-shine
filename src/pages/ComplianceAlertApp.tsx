import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Bell,
  Search,
  Calendar,
  Mail,
  MessageSquare,
  Slack,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  Building2,
  Filter,
  ExternalLink,
  Clock,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AFRICAN_COUNTRIES,
  REGION_BUNDLES,
  type Circular,
  type Severity,
  type Topic,
} from "@/data/complianceAlertMock";

// Map a Supabase compliance_circulars row to the Circular shape used by the UI.
type DbCircular = {
  id: string;
  country: string;
  regulator: string;
  title: string;
  summary: string | null;
  severity: string;
  topics: string[];
  source_url: string;
  published_at: string | null;
  deadline: string | null;
  created_at: string;
};

const rowToCircular = (r: DbCircular): Circular => ({
  id: r.id,
  country: r.country,
  regulator: r.regulator,
  reference: r.id.slice(0, 8).toUpperCase(),
  title: r.title,
  publishedAt: r.published_at || r.created_at,
  deadline: r.deadline,
  severity: (r.severity as Severity) || "medium",
  topic: ((r.topics?.[0] as Topic) || "Reporting") as Topic,
  affects: [],
  summary: r.summary || "",
  actions: [],
  url: r.source_url,
});

type Step = "onboard" | "dashboard";
type View = "feed" | "deadlines" | "archive" | "channels";

type AlertConfig = {
  org: string;
  contact: string;
  email: string;
  countries: string[];
  channels: { email: boolean; whatsapp: boolean; slack: boolean };
  whatsappNumber: string;
  slackWebhook: string;
};

const LEGACY_STORAGE_KEY = "wematech_compliance_alert_config";

const DEFAULT_CONFIG: AlertConfig = {
  org: "",
  contact: "",
  email: "",
  countries: [],
  channels: { email: true, whatsapp: false, slack: false },
  whatsappNumber: "",
  slackWebhook: "",
};

const SEVERITY_STYLES: Record<Severity, { label: string; class: string; dot: string }> = {
  critical: { label: "Critical", class: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
  high: { label: "High", class: "bg-accent/10 text-accent border-accent/30", dot: "bg-accent" },
  medium: { label: "Medium", class: "bg-primary/10 text-primary border-primary/30", dot: "bg-primary" },
  info: { label: "Info", class: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

const ALL_TOPICS: Topic[] = [
  "AML/CFT",
  "Capital",
  "Digital Lending",
  "Open Banking",
  "FX",
  "Cybersecurity",
  "Reporting",
  "Consumer Protection",
];

const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const rowToConfig = (row: any): AlertConfig => ({
  org: row.organization_name || "",
  contact: "",
  email: row.channel_email || "",
  countries: row.countries || [],
  channels: {
    email: !!row.channel_email,
    whatsapp: !!row.channel_whatsapp,
    slack: !!row.channel_slack_webhook,
  },
  whatsappNumber: row.channel_whatsapp || "",
  slackWebhook: row.channel_slack_webhook || "",
});

const configToRow = (c: AlertConfig, userId: string) => ({
  user_id: userId,
  organization_name: c.org,
  countries: c.countries,
  regulators: c.countries,
  topics: [],
  severity_threshold: "medium",
  channel_email: c.channels.email ? c.email : null,
  channel_whatsapp: c.channels.whatsapp ? c.whatsappNumber : null,
  channel_slack_webhook: c.channels.slack ? c.slackWebhook : null,
  digest_frequency: "daily",
  is_active: true,
});

const ComplianceAlertApp = () => {
  const { user, signOut } = useAuth();
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [step, setStep] = useState<Step>("onboard");
  const [view, setView] = useState<View>("feed");
  const [onboardStage, setOnboardStage] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

  // Load subscription from Supabase on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("compliance_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Load subscription failed:", error);
      }

      if (data) {
        setConfig(rowToConfig(data));
        setStep("dashboard");
      } else {
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) {
            const legacy: AlertConfig = JSON.parse(raw);
            if (legacy.org && legacy.countries?.length) {
              setConfig({ ...legacy, email: legacy.email || user.email || "" });
            }
          }
        } catch { /* noop */ }
        setConfig((prev) => ({ ...prev, email: prev.email || user.email || "" }));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const persist = async (next: AlertConfig) => {
    setConfig(next);
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("compliance_subscriptions")
      .upsert(configToRow(next, user.id), { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      console.error("Save subscription failed:", error);
      toast({ title: "Couldn't save changes", description: error.message, variant: "destructive" });
    }
  };

  const subscribedCirculars = useMemo(() => {
    return MOCK_CIRCULARS.filter((c) => config.countries.includes(c.country));
  }, [config.countries]);

  const filtered = useMemo(() => {
    return subscribedCirculars.filter((c) => {
      if (severityFilter !== "all" && c.severity !== severityFilter) return false;
      if (topicFilter !== "all" && c.topic !== topicFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.summary.toLowerCase().includes(q) &&
          !c.reference.toLowerCase().includes(q) &&
          !c.regulator.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [subscribedCirculars, severityFilter, topicFilter, searchQuery]);

  const upcomingDeadlines = useMemo(() => {
    return subscribedCirculars
      .filter((c) => c.deadline && (daysUntil(c.deadline) ?? 999) >= 0)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }, [subscribedCirculars]);

  const stats = useMemo(() => {
    const critical = subscribedCirculars.filter((c) => c.severity === "critical").length;
    const dueIn7 = subscribedCirculars.filter((c) => {
      const d = daysUntil(c.deadline);
      return d !== null && d <= 7 && d >= 0;
    }).length;
    return {
      total: subscribedCirculars.length,
      critical,
      dueIn7,
      countries: config.countries.length,
    };
  }, [subscribedCirculars, config.countries.length]);

  /* ---------------- ONBOARDING ---------------- */

  const completeOnboarding = async () => {
    if (!config.countries.length) {
      toast({ title: "Pick at least one country", variant: "destructive" });
      return;
    }
    if (!config.org || !config.email) {
      toast({ title: "Add your organisation details first", variant: "destructive" });
      return;
    }
    await persist(config);
    setStep("dashboard");
    toast({
      title: "ComplianceAlert is live ✨",
      description: `Monitoring ${config.countries.length} regulator${config.countries.length > 1 ? "s" : ""}. Live feed below.`,
    });
  };

  const renderOnboarding = () => (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/microsaas/compliance-alert"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft size={14} /> Back to product
      </Link>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                onboardStage >= n
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {onboardStage > n ? <Check size={14} /> : n}
            </div>
            {n < 3 && (
              <div
                className={`h-0.5 flex-1 ${
                  onboardStage > n ? "bg-accent" : "bg-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stage 1: org */}
      {onboardStage === 1 && (
        <div className="glass-card p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Building2 size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Tell us about your organisation
              </h1>
              <p className="text-sm text-muted-foreground">
                We'll route alerts to your compliance team.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Organisation name *
              </label>
              <input
                type="text"
                value={config.org}
                onChange={(e) => setConfig({ ...config, org: e.target.value })}
                placeholder="e.g. Lagos Microfinance Bank"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Compliance lead name
                </label>
                <input
                  type="text"
                  value={config.contact}
                  onChange={(e) => setConfig({ ...config, contact: e.target.value })}
                  placeholder="e.g. Adaeze Okoro"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Work email *
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="compliance@bank.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-7">
            <button
              onClick={() => {
                if (!config.org || !config.email) {
                  toast({ title: "Fill in organisation and email" });
                  return;
                }
                setOnboardStage(2);
              }}
              className="btn-primary"
            >
              Continue <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: countries */}
      {onboardStage === 2 && (
        <div className="glass-card p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ShieldAlert size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Pick the regulators you must comply with
              </h1>
              <p className="text-sm text-muted-foreground">
                {config.countries.length} selected · billing adapts to your selection
              </p>
            </div>
          </div>

          {/* Region bundles */}
          <div className="mt-5 mb-3">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Quick regional bundles
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REGION_BUNDLES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    const codes =
                      b.countries[0] === "*"
                        ? AFRICAN_COUNTRIES.map((c) => c.code)
                        : b.countries;
                    setConfig({ ...config, countries: codes });
                  }}
                  className="text-left p-3 rounded-lg border border-border/50 bg-secondary/30 hover:border-accent/50 hover:bg-accent/5 transition"
                >
                  <div className="text-xs font-semibold text-foreground">{b.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{b.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Country grid */}
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 mt-5">
            Or choose individual countries
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {AFRICAN_COUNTRIES.map((c) => {
              const active = config.countries.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    const next = active
                      ? config.countries.filter((x) => x !== c.code)
                      : [...config.countries, c.code];
                    setConfig({ ...config, countries: next });
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border/50 bg-secondary/30 hover:border-border"
                  }`}
                >
                  <span className="text-lg" aria-hidden>{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {c.regulator.split(" — ")[0]}
                    </div>
                  </div>
                  {active && <Check size={14} className="text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-7">
            <button onClick={() => setOnboardStage(1)} className="btn-outline">
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            <button
              onClick={() => {
                if (!config.countries.length) {
                  toast({ title: "Pick at least one country" });
                  return;
                }
                setOnboardStage(3);
              }}
              className="btn-primary"
            >
              Continue <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 3: channels */}
      {onboardStage === 3 && (
        <div className="glass-card p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bell size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                How should we alert you?
              </h1>
              <p className="text-sm text-muted-foreground">
                Pick at least one channel. We send the morning of publication.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ChannelToggle
              icon={<Mail size={18} />}
              label="Email"
              description={`To ${config.email || "your work email"}`}
              checked={config.channels.email}
              onChange={(v) =>
                setConfig({ ...config, channels: { ...config.channels, email: v } })
              }
            />
            <ChannelToggle
              icon={<MessageSquare size={18} />}
              label="WhatsApp Business"
              description="High-priority alerts only"
              checked={config.channels.whatsapp}
              onChange={(v) =>
                setConfig({ ...config, channels: { ...config.channels, whatsapp: v } })
              }
            >
              {config.channels.whatsapp && (
                <input
                  type="tel"
                  value={config.whatsappNumber}
                  onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="mt-2 w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </ChannelToggle>
            <ChannelToggle
              icon={<Slack size={18} />}
              label="Slack webhook"
              description="Push alerts into your #compliance channel"
              checked={config.channels.slack}
              onChange={(v) =>
                setConfig({ ...config, channels: { ...config.channels, slack: v } })
              }
            >
              {config.channels.slack && (
                <input
                  type="url"
                  value={config.slackWebhook}
                  onChange={(e) => setConfig({ ...config, slackWebhook: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-2 w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </ChannelToggle>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20 flex gap-3">
            <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Billing connection coming soon.</span>{" "}
              For now, your alerts run on a 14-day complimentary trial — no card required.
            </div>
          </div>

          <div className="flex justify-between mt-7">
            <button onClick={() => setOnboardStage(2)} className="btn-outline">
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            <button onClick={completeOnboarding} className="btn-primary">
              Activate ComplianceAlert <Check size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------- DASHBOARD ---------------- */

  const renderDashboard = () => {
    const NAV_ITEMS: { id: View; label: string; icon: typeof Bell; badge?: number }[] = [
      { id: "feed", label: "Live feed", icon: Bell, badge: stats.critical },
      { id: "deadlines", label: "Deadlines", icon: Calendar, badge: stats.dueIn7 },
      { id: "archive", label: "Search archive", icon: Search },
      { id: "channels", label: "Alert channels", icon: MessageSquare },
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse" />
                Live
              </span>
              <span className="text-xs text-muted-foreground">
                {config.org}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              ComplianceAlert Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start">
            {saving && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Loader2 size={12} className="animate-spin" /> Saving…
              </span>
            )}
            <button
              onClick={async () => {
                if (!user) return;
                if (!confirm("Reset your ComplianceAlert configuration? You'll redo onboarding.")) return;
                await supabase.from("compliance_subscriptions").delete().eq("user_id", user.id);
                try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* noop */ }
                setConfig({ ...DEFAULT_CONFIG, email: user.email || "" });
                setOnboardStage(1);
                setStep("onboard");
                toast({ title: "Configuration reset" });
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Reset configuration
            </button>
            <button
              onClick={async () => {
                toast({ title: "Crawler started", description: "Fetching latest circulars from your selected regulators…" });
                const { data, error } = await supabase.functions.invoke("compliance-crawler", { body: {} });
                if (error) {
                  toast({ title: "Crawler failed", description: error.message, variant: "destructive" });
                  return;
                }
                const s = (data as { stats?: { circularsInserted: number; alertsCreated: number } })?.stats;
                toast({
                  title: "Crawler finished",
                  description: s ? `${s.circularsInserted} new circulars · ${s.alertsCreated} alerts dispatched` : "Done.",
                });
              }}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Sparkles size={12} /> Run crawler now
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Active circulars" value={stats.total} accent="primary" />
          <StatCard label="Critical alerts" value={stats.critical} accent="destructive" />
          <StatCard label="Due in 7 days" value={stats.dueIn7} accent="accent" />
          <StatCard label="Regulators monitored" value={stats.countries} accent="primary" />
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/40">
          {NAV_ITEMS.map((n) => {
            const Ic = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Ic size={16} />
                {n.label}
                {n.badge !== undefined && n.badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {view === "feed" && renderFeed()}
        {view === "deadlines" && renderDeadlines()}
        {view === "archive" && renderArchive()}
        {view === "channels" && renderChannels()}

        {selectedCircular && (
          <CircularDetailModal
            circular={selectedCircular}
            onClose={() => setSelectedCircular(null)}
          />
        )}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-2 mb-5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Filter size={13} /> Filter:
      </div>
      <select
        value={severityFilter}
        onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
        className="text-xs px-3 py-1.5 rounded-md bg-secondary border border-border/50 text-foreground focus:outline-none"
      >
        <option value="all">All severity</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="info">Info</option>
      </select>
      <select
        value={topicFilter}
        onChange={(e) => setTopicFilter(e.target.value as Topic | "all")}
        className="text-xs px-3 py-1.5 rounded-md bg-secondary border border-border/50 text-foreground focus:outline-none"
      >
        <option value="all">All topics</option>
        {ALL_TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );

  const renderFeed = () => (
    <div>
      {renderFilters()}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} className="text-muted-foreground" />}
            title="No circulars match your filter"
            description="Try changing severity or topic, or add more countries to expand coverage."
          />
        ) : (
          filtered.map((c) => (
            <CircularCard
              key={c.id}
              circular={c}
              onClick={() => setSelectedCircular(c)}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderDeadlines = () => (
    <div className="space-y-3">
      {upcomingDeadlines.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} className="text-muted-foreground" />}
          title="No upcoming compliance deadlines"
          description="You're all caught up. We'll alert you 30, 14, 7 and 1 day before any deadline."
        />
      ) : (
        upcomingDeadlines.map((c) => {
          const days = daysUntil(c.deadline)!;
          const urgency =
            days <= 7
              ? "bg-destructive/10 border-destructive/40 text-destructive"
              : days <= 30
              ? "bg-accent/10 border-accent/40 text-accent"
              : "bg-primary/10 border-primary/40 text-primary";
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCircular(c)}
              className="w-full text-left glass-card-hover p-5 flex items-center gap-4"
            >
              <div
                className={`flex-shrink-0 w-20 text-center rounded-lg border p-2 ${urgency}`}
              >
                <div className="font-heading text-2xl font-bold leading-none">{days}</div>
                <div className="text-[10px] uppercase tracking-wider mt-1">
                  {days === 1 ? "day" : "days"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {c.regulator} · {c.reference}
                  </span>
                </div>
                <div className="font-semibold text-sm text-foreground truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Due {fmtDate(c.deadline!)}
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
            </button>
          );
        })
      )}
    </div>
  );

  const renderArchive = () => (
    <div>
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search circulars: "AML", "CBN open banking", "FX reporting"...'
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      {renderFilters()}
      <div className="text-xs text-muted-foreground mb-3">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
      </div>
      <div className="space-y-3">
        {filtered.map((c) => (
          <CircularCard
            key={c.id}
            circular={c}
            onClick={() => setSelectedCircular(c)}
          />
        ))}
      </div>
    </div>
  );

  const renderChannels = () => (
    <div className="max-w-2xl">
      <div className="space-y-3 mb-6">
        <ChannelToggle
          icon={<Mail size={18} />}
          label="Email"
          description={`Sent to ${config.email}`}
          checked={config.channels.email}
          onChange={(v) =>
            persist({ ...config, channels: { ...config.channels, email: v } })
          }
        />
        <ChannelToggle
          icon={<MessageSquare size={18} />}
          label="WhatsApp Business"
          description={
            config.whatsappNumber
              ? `To ${config.whatsappNumber}`
              : "High-priority alerts only"
          }
          checked={config.channels.whatsapp}
          onChange={(v) =>
            persist({ ...config, channels: { ...config.channels, whatsapp: v } })
          }
        >
          {config.channels.whatsapp && (
            <input
              type="tel"
              value={config.whatsappNumber}
              onChange={(e) => persist({ ...config, whatsappNumber: e.target.value })}
              placeholder="+234 800 000 0000"
              className="mt-2 w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
        </ChannelToggle>
        <ChannelToggle
          icon={<Slack size={18} />}
          label="Slack webhook"
          description="Push alerts into a Slack channel"
          checked={config.channels.slack}
          onChange={(v) =>
            persist({ ...config, channels: { ...config.channels, slack: v } })
          }
        >
          {config.channels.slack && (
            <input
              type="url"
              value={config.slackWebhook}
              onChange={(e) => persist({ ...config, slackWebhook: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
              className="mt-2 w-full px-3 py-2 text-sm rounded-md bg-secondary/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
        </ChannelToggle>
      </div>

      <button
        onClick={() => {
          persist(config);
          toast({
            title: "Alert preferences saved",
            description: "Changes apply to the next outgoing brief.",
          });
        }}
        className="btn-primary"
      >
        Save preferences <Check size={16} className="ml-1" />
      </button>

      <div className="mt-8 p-5 rounded-xl bg-secondary/30 border border-border/40">
        <h3 className="font-heading text-sm font-bold text-foreground mb-2">
          Monitored regulators ({config.countries.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {config.countries.map((code) => {
            const c = AFRICAN_COUNTRIES.find((x) => x.code === code);
            if (!c) return null;
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground"
              >
                <span aria-hidden>{c.flag}</span> {c.regulator.split(" — ")[0]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>ComplianceAlert — Wematech Africa</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="pt-24 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading your dashboard…
          </div>
        ) : step === "onboard" ? (
          renderOnboarding()
        ) : (
          renderDashboard()
        )}
      </main>
    </div>
  );
};

/* ---------------- Sub-components ---------------- */

const ChannelToggle = ({
  icon,
  label,
  description,
  checked,
  onChange,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) => (
  <div
    className={`p-4 rounded-xl border transition ${
      checked ? "border-accent/40 bg-accent/5" : "border-border/50 bg-secondary/20"
    }`}
  >
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 text-left"
    >
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          checked ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div
        className={`h-6 w-11 rounded-full p-0.5 transition ${
          checked ? "bg-accent" : "bg-secondary"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-background transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
    </button>
    {children}
  </div>
);

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "primary" | "accent" | "destructive";
}) => {
  const color =
    accent === "destructive"
      ? "text-destructive"
      : accent === "accent"
      ? "text-accent"
      : "text-primary";
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`font-heading text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
};

const CircularCard = ({
  circular,
  onClick,
}: {
  circular: Circular;
  onClick: () => void;
}) => {
  const sev = SEVERITY_STYLES[circular.severity];
  const days = daysUntil(circular.deadline);
  const country = AFRICAN_COUNTRIES.find((c) => c.code === circular.country);
  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-card-hover p-5 group"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0" aria-hidden>{country?.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${sev.class}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${sev.dot}`} />
              {sev.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              {circular.regulator} · {circular.reference}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {circular.topic}
            </span>
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1.5 leading-snug">
            {circular.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
            {circular.summary}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> Published {fmtDate(circular.publishedAt)}
            </span>
            {days !== null && (
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  days <= 7 ? "text-destructive" : days <= 30 ? "text-accent" : ""
                }`}
              >
                <AlertTriangle size={11} />
                {days >= 0 ? `${days}d to comply` : `Overdue ${Math.abs(days)}d`}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          size={18}
          className="text-muted-foreground flex-shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 transition"
        />
      </div>
    </button>
  );
};

const CircularDetailModal = ({
  circular,
  onClose,
}: {
  circular: Circular;
  onClose: () => void;
}) => {
  const sev = SEVERITY_STYLES[circular.severity];
  const country = AFRICAN_COUNTRIES.find((c) => c.code === circular.country);
  const days = daysUntil(circular.deadline);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-card border border-border/60 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>{country?.flag}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {circular.regulator}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${sev.class}`}>
              {sev.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {circular.topic}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {circular.reference}
            </span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 leading-tight">
            {circular.title}
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-secondary/40">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Published
              </div>
              <div className="text-sm font-semibold text-foreground">
                {fmtDate(circular.publishedAt)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/40">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Compliance deadline
              </div>
              <div className="text-sm font-semibold text-foreground">
                {circular.deadline ? (
                  <>
                    {fmtDate(circular.deadline)}
                    {days !== null && (
                      <span
                        className={`ml-2 text-xs ${
                          days <= 7 ? "text-destructive" : days <= 30 ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        ({days}d)
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[11px] uppercase tracking-widest text-primary mb-2 font-mono">
              AI summary
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{circular.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-[11px] uppercase tracking-widest text-accent mb-2 font-mono">
              Who it affects
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {circular.affects.map((a) => (
                <span
                  key={a}
                  className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[11px] uppercase tracking-widest text-accent mb-2 font-mono">
              Action items
            </h3>
            <ul className="space-y-2">
              {circular.actions.map((a, i) => (
                <li
                  key={a}
                  className="flex gap-3 text-sm text-foreground/90 p-3 rounded-lg bg-secondary/30"
                >
                  <span className="font-mono text-xs text-accent font-bold flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={circular.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full justify-center"
          >
            <ExternalLink size={14} className="mr-1.5" /> Open original circular
          </a>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="glass-card p-12 text-center">
    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/50 mb-4">
      {icon}
    </div>
    <h3 className="font-heading text-base font-bold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
  </div>
);

export default ComplianceAlertApp;
