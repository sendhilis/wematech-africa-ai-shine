import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────
type Phase = "ignition" | "amplify" | "dominate";
type Priority = "high" | "med" | "low";
type TagType = "technical" | "content" | "outreach" | "social" | "analytics";

interface Task {
  name: string;
  desc: string;
  tags: TagType[];
  time: string;
  priority: Priority;
}

interface DayData {
  id: string;
  num: number;
  title: string;
  phase: Phase;
  date: string;
  objective: string;
  tasks: Task[];
  report?: { metrics: { label: string; value: string; change: string; color: string }[] };
}

// ── Data ───────────────────────────────────────────────────────────
const DAYS: DayData[] = [
  {
    id: "d1", num: 1, title: "Deploy & Index Sprint", phase: "ignition",
    date: "Tuesday 15 April 2026",
    objective: "Deploy optimised index.html live. Submit to Google Search Console. Achieve first index confirmation within 24hrs.",
    tasks: [
      { name: "Deploy optimised index.html to wematech.africa", desc: "Upload the optimised file. Verify mobile/desktop render. Confirm HTTPS.", tags: ["technical"], time: "09:00", priority: "high" },
      { name: "Connect Google Search Console — verify domain ownership", desc: "Add DNS TXT record or HTML meta tag. Confirm ownership.", tags: ["technical"], time: "09:30", priority: "high" },
      { name: "Submit sitemap.xml to Google Search Console", desc: "Create sitemap.xml listing all pages. Submit via GSC → Sitemaps.", tags: ["technical"], time: "10:00", priority: "high" },
      { name: "Request manual indexing via GSC URL Inspection Tool", desc: "Paste https://wematech.africa/ into URL Inspection → Request Indexing.", tags: ["technical"], time: "10:30", priority: "high" },
      { name: "Submit to Bing Webmaster Tools", desc: "Bing powers AI search tools including Copilot. Import from GSC or manual verify.", tags: ["technical"], time: "11:00", priority: "med" },
      { name: "Replace GA_MEASUREMENT_ID with real GA4 property ID", desc: "Create GA4 property. Replace placeholder in index.html.", tags: ["analytics"], time: "11:30", priority: "med" },
      { name: "Create Google Business Profile — \"Wematech Africa\"", desc: "Category: Software Company + Financial Technology. Add Lagos address.", tags: ["technical"], time: "12:00", priority: "med" },
      { name: "Create robots.txt with AI crawler allowances", desc: "Allow GPTBot, anthropic-ai, PerplexityBot, ClaudeBot, Applebot.", tags: ["technical", "content"], time: "13:00", priority: "med" },
      { name: "Set up Cloudflare for speed + security signals", desc: "Enable auto-minification and caching. Improves Core Web Vitals.", tags: ["technical"], time: "14:00", priority: "med" },
      { name: "Submit to African tech directories: Disrupt Africa, VC4A", desc: "Free listings creating early backlinks from respected African tech sources.", tags: ["outreach"], time: "15:00", priority: "low" },
      { name: "Create LinkedIn company page for Wematech Africa", desc: "Full description using keywords. LinkedIn pages rank on Google.", tags: ["social"], time: "16:00", priority: "low" },
      { name: "Write Day 1 progress notes — baseline snapshot", desc: "Record GSC indexing status, GA4 setup confirmed, baseline visibility.", tags: ["analytics"], time: "17:00", priority: "low" },
    ],
    report: {
      metrics: [
        { label: "Search Rank", value: "—", change: "Not yet indexed", color: "gold" },
        { label: "Organic Traffic", value: "0", change: "Day 0 baseline", color: "blue" },
        { label: "Backlinks", value: "0", change: "Building today", color: "green" },
        { label: "Pages Indexed", value: "0", change: "GSC submitted", color: "gold" },
        { label: "Leads", value: "0", change: "Form live", color: "green" },
        { label: "SEO Score", value: "96%", change: "✓ World Class", color: "green" },
      ],
    },
  },
  {
    id: "d2", num: 2, title: "Google Search Console", phase: "ignition",
    date: "Wed 16 Apr",
    objective: "Google Search Console showing site as verified. Zero crawl errors. Core Web Vitals measured.",
    tasks: [
      { name: "Check GSC for first crawl data & fix any errors", desc: "Look for 404s, redirect issues, or mobile usability warnings.", tags: ["technical", "analytics"], time: "09:00", priority: "high" },
      { name: "Run PageSpeed Insights — fix anything below 85", desc: "Target LCP <2.5s. Compress images. Enable caching.", tags: ["technical"], time: "10:00", priority: "high" },
      { name: "Deploy robots.txt with AI crawler permissions", desc: "Allow GPTBot, anthropic-ai, PerplexityBot, ClaudeBot, Applebot.", tags: ["technical"], time: "10:30", priority: "high" },
      { name: "Submit to Product Hunt as a product launch", desc: "Product Hunt links are high-DA backlinks.", tags: ["outreach"], time: "12:00", priority: "med" },
      { name: "Create /digital-banking-africa/ page (SEO landing page)", desc: "1,200+ words. H1: \"Digital Banking Solutions for Africa\".", tags: ["content"], time: "14:00", priority: "med" },
      { name: "Submit to Crunchbase — company profile", desc: "DA 90+ backlink. Category: FinTech, Banking Technology, AI.", tags: ["outreach"], time: "16:00", priority: "low" },
    ],
  },
  {
    id: "d3", num: 3, title: "Content Page #1 Live", phase: "ignition",
    date: "Thu 17 Apr",
    objective: "\"Digital banking Africa\" landing page live and submitted to GSC. First 3 outreach emails sent.",
    tasks: [
      { name: "Publish /digital-banking-africa/ page", desc: "1,200+ words. Include 3 internal links back to homepage.", tags: ["content"], time: "09:00", priority: "high" },
      { name: "Publish /ai-core-banking-africa/ page", desc: "800+ words targeting \"core banking Africa\".", tags: ["content"], time: "11:00", priority: "high" },
      { name: "Email outreach #1: Techpoint Africa", desc: "Request coverage. DA 60+ backlink if accepted.", tags: ["outreach"], time: "13:00", priority: "high" },
      { name: "Email outreach #2: Digital Banker Africa — guest post", desc: "700-word guest post with 2 backlinks.", tags: ["outreach"], time: "14:00", priority: "med" },
      { name: "Post launch announcement on LinkedIn", desc: "Company page post tagging 5 African fintech leaders.", tags: ["social"], time: "15:00", priority: "med" },
      { name: "Submit to FinHive Africa directory", desc: "High-relevance African backlink.", tags: ["outreach"], time: "16:00", priority: "low" },
    ],
  },
  {
    id: "d4", num: 4, title: "First Backlink Push", phase: "ignition",
    date: "Fri 18 Apr",
    objective: "5+ backlinks secured or in pipeline. Brand keyword first appears in Google.",
    tasks: [
      { name: "Submit to GitHub awesome-fintech-africa list", desc: "GitHub links are high-value. PR accepted in 24–48 hrs.", tags: ["outreach"], time: "09:00", priority: "high" },
      { name: "Submit to F6S — startup profile (DA 77)", desc: "Description must include target keywords.", tags: ["outreach"], time: "10:00", priority: "high" },
      { name: "AngelList / Wellfound company profile", desc: "DA 84 backlink. Category: FinTech, Banking, AI.", tags: ["outreach"], time: "11:00", priority: "high" },
      { name: "Write blog post draft: \"AI Banking Africa 2026\"", desc: "1,500-word post using McKinsey data. Publish Day 6.", tags: ["content"], time: "13:00", priority: "med" },
      { name: "Set up X (Twitter) account + post thread", desc: "10-tweet thread with website link.", tags: ["social"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d5", num: 5, title: "LinkedIn + Social Launch", phase: "ignition",
    date: "Sat 19 Apr",
    objective: "\"wematech africa\" appears in Google top 10. First GSC impressions recorded.",
    tasks: [
      { name: "Run first full ranking check — record baseline", desc: "Search Google incognito for all target keywords. Screenshot results.", tags: ["analytics"], time: "09:00", priority: "high" },
      { name: "Check GSC: impressions, clicks, index status", desc: "Performance → Last 7 days. Note impressions and clicks.", tags: ["analytics"], time: "10:00", priority: "high" },
      { name: "Test lead capture form end-to-end", desc: "Fill in contact form. Confirm success message and email notification.", tags: ["analytics"], time: "11:00", priority: "high" },
      { name: "LinkedIn: thought leadership post", desc: "Personal founder post. 500 words with website link.", tags: ["social"], time: "12:00", priority: "med" },
      { name: "Email outreach #3: Finhive Africa", desc: "Pitch inclusion in \"Top Digital Banking Software\" list.", tags: ["outreach"], time: "14:00", priority: "med" },
    ],
  },
  {
    id: "d6", num: 6, title: "Blog Post #1 Published", phase: "amplify",
    date: "Mon 21 Apr",
    objective: "First blog post live and indexed. 3 backlinks confirmed. LinkedIn 2,000+ impressions.",
    tasks: [
      { name: "Publish Blog #1: \"2026 State of AI Banking in Africa\"", desc: "1,500 words. Keyword 8+ times. Link to 3 solution pages.", tags: ["content"], time: "09:00", priority: "high" },
      { name: "Syndicate Blog #1 to Medium + LinkedIn Articles", desc: "Republish with canonical tag. Both rank independently.", tags: ["content", "social"], time: "11:00", priority: "high" },
      { name: "Publish /banking-technology-nigeria/ country page", desc: "800+ words targeting Nigerian banking keywords.", tags: ["content"], time: "13:00", priority: "high" },
      { name: "Submit to African Fintech Hub directory", desc: "AfDB-backed — high-authority backlink.", tags: ["outreach"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d7", num: 7, title: "Backlink Blitz + Outreach", phase: "amplify",
    date: "Tue 22 Apr",
    objective: "10 outreach emails sent. 2+ backlinks confirmed. First GSC rank position appears.",
    tasks: [
      { name: "Guest post: \"How AI Credit Scoring Works for African SMEs\"", desc: "700 words with 2 embedded links.", tags: ["content", "outreach"], time: "09:00", priority: "high" },
      { name: "Submit to Clutch.co — company profile (DA 76)", desc: "Under Banking Software + AI Development.", tags: ["outreach"], time: "11:00", priority: "high" },
      { name: "Outreach batch: 5 African fintech newsletters", desc: "Africa: The Big Deal, Techpoint Digest, etc.", tags: ["outreach"], time: "13:00", priority: "med" },
      { name: "Publish /digital-lending-africa/ solution page", desc: "800+ words on digital lending and AI credit scoring.", tags: ["content"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d8", num: 8, title: "Press Release Africa Wire", phase: "amplify",
    date: "Wed 23 Apr",
    objective: "Press release live. 10+ automatic backlinks from syndication. First qualified lead.",
    tasks: [
      { name: "Write and distribute press release via BusinessWireAfrica", desc: "400 words. Creates 20–50 auto-syndicated backlinks.", tags: ["outreach", "content"], time: "09:00", priority: "high" },
      { name: "Launch LinkedIn paid campaign", desc: "$150 for 7 days. Target: CTO, CDO in Banking, Financial Services.", tags: ["social"], time: "11:00", priority: "high" },
      { name: "Publish Blog #2: \"Why African Banks Are Replacing Legacy Core Banking\"", desc: "1,200 words. Cite competitors for \"vs\" query rankings.", tags: ["content"], time: "13:00", priority: "med" },
      { name: "Build lead magnet page", desc: "AI Banking Readiness Report — gated email capture.", tags: ["content"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d9", num: 9, title: "Blog Post #2 + Lead Magnet", phase: "amplify",
    date: "Thu 24 Apr",
    objective: "Lead magnet page live. First 5 report downloads captured.",
    tasks: [
      { name: "Create \"2026 African Banking AI Readiness Report\" PDF", desc: "10-page PDF. Gate behind email form.", tags: ["content"], time: "09:00", priority: "high" },
      { name: "Add report download CTA to all blog posts and homepage", desc: "Mid-article CTA converting readers to leads.", tags: ["content"], time: "11:00", priority: "high" },
      { name: "Publish /banking-technology-kenya/ country page", desc: "800+ words. M-Pesa integration, SACCO technology.", tags: ["content"], time: "13:00", priority: "med" },
      { name: "Follow up on all outreach emails (Days 3–7)", desc: "One follow-up to each unanswered outreach.", tags: ["outreach"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d10", num: 10, title: "Mid-Sprint Ranking Check", phase: "amplify",
    date: "Fri 25 Apr",
    objective: "8 keywords tracked. \"Wematech africa\" #1. \"AI banking technology Africa\" top 10. 3+ leads. 10+ backlinks.",
    tasks: [
      { name: "Full keyword ranking audit — all 9 target keywords", desc: "Check incognito. Record positions. Compare to Day 5.", tags: ["analytics"], time: "09:00", priority: "high" },
      { name: "Analyse GA4: top landing pages, traffic sources", desc: "Fix CTAs if conversion <2%.", tags: ["analytics"], time: "10:00", priority: "high" },
      { name: "Check Ahrefs/Moz to confirm backlinks acquired", desc: "Target: 10+ backlinks by Day 10.", tags: ["analytics"], time: "11:00", priority: "med" },
      { name: "Write Day 10 full progress report", desc: "Rankings, traffic, leads, backlinks, pages indexed.", tags: ["analytics"], time: "13:00", priority: "med" },
    ],
  },
  {
    id: "d11", num: 11, title: "Directory Submissions", phase: "dominate",
    date: "Mon 28 Apr",
    objective: "10 new directory submissions. DA score increases. \"Digital banking Africa\" enters top 20.",
    tasks: [
      { name: "Submit to: G2.com, Capterra, Software Advice", desc: "DA 90+ review sites. Under Banking Software + FinTech.", tags: ["outreach"], time: "09:00", priority: "high" },
      { name: "Submit to: SaaSHub, AlternativeTo, GetApp", desc: "Tag as alternative to Temenos, Mambu, Backbase.", tags: ["outreach"], time: "11:00", priority: "high" },
      { name: "Publish /banking-technology-south-africa/ country page", desc: "SARB, FSCA compliance. 800+ words.", tags: ["content"], time: "13:00", priority: "med" },
      { name: "Post 3 LinkedIn posts — engagement push", desc: "Stats graphic, AI explainer, client testimonial.", tags: ["social"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d12", num: 12, title: "AI Search Optimization", phase: "dominate",
    date: "Tue 29 Apr",
    objective: "Wematech cited in at least 1 Perplexity or ChatGPT query about African banking.",
    tasks: [
      { name: "Create /llm.txt — AI-optimised brand description", desc: "Plaintext for AI crawlers: who, what, key facts.", tags: ["technical", "content"], time: "09:00", priority: "high" },
      { name: "Post on Reddit: r/fintech and r/Africa", desc: "Genuine value post. Reddit ranks on Google and Perplexity.", tags: ["outreach", "social"], time: "11:00", priority: "high" },
      { name: "Add to Wikipedia \"FinTech in Africa\" article", desc: "Neutral, factual edit. Highest-trust signal.", tags: ["outreach"], time: "13:00", priority: "med" },
      { name: "Publish Blog #3: \"Wematech vs Temenos\" comparison", desc: "1,000-word honest comparison. High organic CTR.", tags: ["content"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d13", num: 13, title: "Conversion + CRO Audit", phase: "dominate",
    date: "Wed 30 Apr",
    objective: "Form conversion rate >3%. Weekly lead count hits 3. Report downloads >10.",
    tasks: [
      { name: "Review GA4 heatmap data — optimise form placement", desc: "Use Hotjar or Clarity heatmap. Add sticky CTA if needed.", tags: ["analytics"], time: "09:00", priority: "high" },
      { name: "Add HubSpot Free CRM — connect to contact form", desc: "Proper lead pipeline, auto follow-ups, lead scoring.", tags: ["analytics"], time: "10:00", priority: "high" },
      { name: "Write and schedule 5 LinkedIn posts for next 2 weeks", desc: "Content calendar: Mon–Fri themed posts.", tags: ["social"], time: "13:00", priority: "med" },
      { name: "Follow up with all form leads within 24hrs", desc: "Personalised email + Calendly link.", tags: ["analytics"], time: "15:00", priority: "med" },
    ],
  },
  {
    id: "d14", num: 14, title: "Final Content Blitz", phase: "dominate",
    date: "Thu 1 May",
    objective: "8+ pages indexed. \"Digital banking solutions Africa\" top 10. Backlinks 20+.",
    tasks: [
      { name: "Publish Blog #4: \"How to Choose a Digital Banking Platform\"", desc: "1,500-word buyer's guide. Highest commercial intent.", tags: ["content"], time: "09:00", priority: "high" },
      { name: "Final backlink push: HARO / Qwoted journalist requests", desc: "Respond with expert insights as Wematech Africa.", tags: ["outreach"], time: "11:00", priority: "high" },
      { name: "Publish /fraud-detection-ai-africa/ and /regtech-africa/", desc: "Two solution pages. 600+ words each.", tags: ["content"], time: "13:00", priority: "med" },
      { name: "Request indexing for all new pages in GSC", desc: "URL Inspection tool for every page this week.", tags: ["technical"], time: "16:00", priority: "med" },
    ],
  },
  {
    id: "d15", num: 15, title: "Final Audit + Victory Report", phase: "dominate",
    date: "Fri 2 May",
    objective: "\"Wematech africa\" #1. \"AI banking\" top 5. \"Digital banking\" top 10. 3–5 leads. 20+ backlinks.",
    tasks: [
      { name: "Full keyword position audit — all target terms", desc: "Manually check all 9 keywords. Document trajectory.", tags: ["analytics"], time: "09:00", priority: "high" },
      { name: "GA4 + GSC: Full 15-day traffic report", desc: "Impressions, clicks, CTR, position, top queries.", tags: ["analytics"], time: "10:00", priority: "high" },
      { name: "Lead pipeline review", desc: "Total leads, sources, conversion rate. Week-2 follow-ups.", tags: ["analytics"], time: "11:00", priority: "high" },
      { name: "Write 30-Day Forward Plan", desc: "2 blog posts/week. 1 solution page/week. Monthly audits.", tags: ["analytics"], time: "13:00", priority: "med" },
      { name: "🏆 Celebrate — and commit to 30-day plan", desc: "You built this in 15 days. Now the compound interest begins.", tags: ["outreach"], time: "17:00", priority: "low" },
    ],
    report: {
      metrics: [
        { label: "Brand Keyword", value: "#1", change: "\"wematech africa\"", color: "green" },
        { label: "AI Banking KW", value: "Top 5", change: "\"ai banking africa\"", color: "green" },
        { label: "Digital Banking", value: "Top 10", change: "\"digital banking africa\"", color: "gold" },
        { label: "Backlinks", value: "20+", change: "DA avg 55+", color: "green" },
        { label: "Pages Indexed", value: "8+", change: "Full site map live", color: "green" },
        { label: "Leads Captured", value: "3–7", change: "3–5 target met", color: "green" },
      ],
    },
  },
];

const KEYWORDS = [
  { keyword: "wematech africa", difficulty: "Very Easy", volume: "Brand", target: "#1 Day 4", strategy: "Brand indexing" },
  { keyword: "ai banking technology africa", difficulty: "Low", volume: "Mid", target: "#1–3 Day 10", strategy: "Homepage + Blog" },
  { keyword: "digital banking solutions africa", difficulty: "Medium", volume: "High", target: "#1–5 Day 12", strategy: "Dedicated page + backlinks" },
  { keyword: "digital banking africa", difficulty: "High", volume: "Very High", target: "#1–10 Day 15", strategy: "Full authority push" },
  { keyword: "core banking platform africa", difficulty: "Medium", volume: "Mid", target: "#1–3 Day 10", strategy: "Dedicated page" },
  { keyword: "banking technology nigeria", difficulty: "Medium", volume: "High", target: "#1–5 Day 11", strategy: "Country page + local SEO" },
  { keyword: "fintech banking solutions africa", difficulty: "Low", volume: "Mid", target: "#1–3 Day 8", strategy: "Blog + homepage" },
  { keyword: "mobile money technology africa", difficulty: "Low", volume: "Mid", target: "#1–5 Day 9", strategy: "Solution page" },
  { keyword: "open banking api africa", difficulty: "Medium", volume: "Mid", target: "#1–5 Day 10", strategy: "API page + developer hub" },
];

// ── Helpers ─────────────────────────────────────────────────────────
const phaseLabel = (p: Phase) => p === "ignition" ? "IGNITION" : p === "amplify" ? "AMPLIFY" : "DOMINATE";
const phaseTag = (p: Phase) => p === "ignition" ? "Phase 1 — Ignition" : p === "amplify" ? "Phase 2 — Amplify" : "Phase 3 — Dominate";

const colorMap: Record<string, string> = {
  green: "#00E87A", gold: "#F5C842", red: "#FF4D6A", blue: "#3D9EFF",
};
const dimMap: Record<string, string> = {
  green: "rgba(0,232,122,0.12)", gold: "rgba(245,200,66,0.12)", red: "rgba(255,77,106,0.12)", blue: "rgba(61,158,255,0.12)",
};
const tagColors: Record<TagType, { bg: string; fg: string }> = {
  technical: { bg: "rgba(245,200,66,0.12)", fg: "#F5C842" },
  content: { bg: "rgba(61,158,255,0.12)", fg: "#3D9EFF" },
  outreach: { bg: "rgba(0,232,122,0.12)", fg: "#00E87A" },
  social: { bg: "rgba(255,77,106,0.12)", fg: "#FF4D6A" },
  analytics: { bg: "rgba(180,100,255,0.12)", fg: "#B464FF" },
};
const priorityBorder: Record<Priority, string> = { high: "#FF4D6A", med: "#F5C842", low: "#3D9EFF" };

const difficultyColor = (d: string) => d.includes("Easy") || d === "Low" ? "#00E87A" : d === "Medium" ? "#F5C842" : "#FF4D6A";

// ── Component ──────────────────────────────────────────────────────
const SEOWarRoom = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("d1");
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [countdown, setCountdown] = useState({ days: 15, hrs: 0, min: 0, sec: 0 });

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin/login");
    };
    check();
  }, [navigate]);

  // Countdown
  useEffect(() => {
    const end = new Date("2026-04-29T23:59:59").getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("seo-warroom-tasks");
    if (saved) setCompletedTasks(JSON.parse(saved));
  }, []);

  const toggleTask = (key: string) => {
    setCompletedTasks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("seo-warroom-tasks", JSON.stringify(next));
      return next;
    });
  };

  const day = DAYS.find(d => d.id === activeDay)!;
  const tabId = activeTab[activeDay] || "tasks";
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const totalTasks = DAYS.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div style={{ background: "#090E1A", color: "#E8EDF8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6, minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #0D1529 0%, #090E1A 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem 2rem 1rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Syne', sans-serif", fontSize: "5rem", fontWeight: 800, color: "rgba(255,255,255,0.02)", letterSpacing: "-0.04em", pointerEvents: "none" }}>WAR ROOM</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: dimMap.green, border: "1px solid rgba(0,232,122,0.25)", color: colorMap.green, fontFamily: "monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "0.3rem 0.8rem", borderRadius: 100, marginBottom: "0.5rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: colorMap.green, display: "inline-block", animation: "blink 1.4s infinite" }} /> Mission Active
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              Wematech Africa<br /><span style={{ color: colorMap.green }}>#1 Digital Banking Africa</span>
            </h1>
            <p style={{ color: "rgba(232,237,248,0.45)", fontSize: "0.85rem", maxWidth: 500 }}>15-Day SEO Blitz — Daily schedule, task tracking, and progress. Target: rank #1 for "digital banking Africa".</p>
            <button onClick={() => navigate("/admin")} style={{ marginTop: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#E8EDF8", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>← Back to Admin</button>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)", marginBottom: "0.3rem" }}>Mission Clock</div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hrs, label: "Hrs" },
                { val: countdown.min, label: "Min" },
                { val: countdown.sec, label: "Sec" },
              ].map((u, i) => (
                <div key={u.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {i > 0 && <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", color: "rgba(232,237,248,0.45)", paddingBottom: "0.3rem" }}>:</span>}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: colorMap.gold, lineHeight: 1 }}>{String(u.val).padStart(2, "0")}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(232,237,248,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{u.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1, background: "rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { label: "Target Keyword Rank", val: "Not indexed", color: "gold", delta: "▲ Target: #1 by Day 15" },
          { label: "Domain Authority", val: "0–5", color: "blue", delta: "▲ Target: 15+" },
          { label: "Backlinks Secured", val: "0", color: "green", delta: "▲ Target: 20+" },
          { label: "Leads This Week", val: "0", color: "green", delta: "▲ Target: 3–5" },
          { label: "Tasks Done", val: `${doneTasks}/${totalTasks}`, color: "green", delta: `${Math.round((doneTasks / totalTasks) * 100)}% complete` },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "#0F1628", padding: "0.8rem 1rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)" }}>{kpi.label}</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: colorMap[kpi.color] }}>{kpi.val}</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: colorMap[kpi.color] }}>{kpi.delta}</span>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 220px)" }} className="war-main-grid">
        {/* SIDEBAR */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", background: "#0F1628", overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
          <div style={{ padding: "0.8rem 1rem 0.4rem", fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between" }}>
            <span>15-Day Schedule</span>
            <span style={{ color: colorMap.green }}>Day {activeDay.replace("d", "")}</span>
          </div>
          {(["ignition", "amplify", "dominate"] as Phase[]).map(phase => (
            <div key={phase} style={{ padding: "0.4rem 0" }}>
              <div style={{ padding: "0.3rem 1rem", fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)" }}>
                {phase === "ignition" ? "Phase 1 — IGNITION (Days 1–5)" : phase === "amplify" ? "Phase 2 — AMPLIFY (Days 6–10)" : "Phase 3 — DOMINATE (Days 11–15)"}
              </div>
              {DAYS.filter(d => d.phase === phase).map(d => {
                const dayDone = d.tasks.every((_, ti) => completedTasks[`${d.id}-${ti}`]);
                return (
                  <button
                    key={d.id}
                    onClick={() => { setActiveDay(d.id); setActiveTab(prev => ({ ...prev })); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.5rem 1rem",
                      background: activeDay === d.id ? dimMap.green : "transparent",
                      border: "none", cursor: "pointer", color: "#E8EDF8", textAlign: "left",
                      borderLeft: activeDay === d.id ? `2px solid ${colorMap.green}` : "2px solid transparent",
                      opacity: dayDone ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 600, minWidth: 36, color: activeDay === d.id ? colorMap.green : "rgba(232,237,248,0.45)" }}>DAY {d.num}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{d.title}</span>
                    <span style={{
                      fontFamily: "monospace", fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                      padding: "0.15rem 0.5rem", borderRadius: 3,
                      background: phase === "ignition" ? dimMap.blue : phase === "amplify" ? dimMap.gold : dimMap.green,
                      color: phase === "ignition" ? colorMap.blue : phase === "amplify" ? colorMap.gold : colorMap.green,
                    }}>{phaseLabel(phase)}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)", padding: "1.5rem 2rem" }}>
          {/* Panel Header */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const,
              padding: "0.25rem 0.75rem", borderRadius: 3, display: "inline-block", marginBottom: "0.5rem",
              background: day.phase === "ignition" ? dimMap.blue : day.phase === "amplify" ? dimMap.gold : dimMap.green,
              color: day.phase === "ignition" ? colorMap.blue : day.phase === "amplify" ? colorMap.gold : colorMap.green,
            }}>{phaseTag(day.phase)}</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.3rem" }}>Day {day.num} — {day.title}</h2>
            <p style={{ color: "rgba(232,237,248,0.45)", fontSize: "0.85rem" }}>{day.date}</p>
            <div style={{ marginTop: "0.7rem", padding: "0.6rem 0.8rem", background: dimMap.gold, border: "1px solid rgba(245,200,66,0.2)", borderRadius: 6, fontSize: "0.8rem", color: colorMap.gold, fontFamily: "monospace" }}>
              ⚡ {day.objective}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.2rem" }}>
            {["tasks", ...(day.report ? ["report"] : []), ...(day.id === "d1" ? ["keywords"] : [])].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(prev => ({ ...prev, [activeDay]: tab }))}
                style={{
                  padding: "0.5rem 1rem", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.06em",
                  textTransform: "uppercase" as const, cursor: "pointer",
                  borderBottom: (tabId === tab) ? `2px solid ${colorMap.green}` : "2px solid transparent",
                  color: tabId === tab ? colorMap.green : "rgba(232,237,248,0.45)",
                  background: "transparent", border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                }}
              >
                {tab === "tasks" ? "Tasks" : tab === "report" ? `Day ${day.num} Report` : "Keyword Targets"}
              </button>
            ))}
          </div>

          {/* Tasks Tab */}
          {tabId === "tasks" && (
            <div>
              {(["high", "med", "low"] as Priority[]).map(p => {
                const tasks = day.tasks.filter(t => t.priority === p);
                if (tasks.length === 0) return null;
                return (
                  <div key={p} style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {p === "high" ? "🔴 Priority: Critical" : p === "med" ? "🟡 Priority: High" : "🔵 Priority: Standard"}
                      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {tasks.map((t, ti) => {
                        const globalIdx = day.tasks.indexOf(t);
                        const key = `${day.id}-${globalIdx}`;
                        const done = !!completedTasks[key];
                        return (
                          <div key={ti} style={{
                            display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.6rem 0.8rem", borderRadius: 8,
                            background: "#141D35", border: "1px solid rgba(255,255,255,0.07)",
                            borderLeft: `3px solid ${priorityBorder[t.priority]}`,
                          }}>
                            <button
                              onClick={() => toggleTask(key)}
                              style={{
                                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                                border: done ? `1.5px solid ${colorMap.green}` : "1.5px solid rgba(255,255,255,0.2)",
                                background: done ? colorMap.green : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#000", fontSize: 9, fontWeight: 700,
                              }}
                            >{done ? "✓" : ""}</button>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "0.15rem", textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>{t.name}</div>
                              <div style={{ fontSize: 11, color: "rgba(232,237,248,0.45)", lineHeight: 1.5 }}>{t.desc}</div>
                              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                                {t.tags.map(tag => (
                                  <span key={tag} style={{
                                    fontFamily: "monospace", fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const,
                                    letterSpacing: "0.06em", padding: "0.15rem 0.5rem", borderRadius: 3,
                                    background: tagColors[tag].bg, color: tagColors[tag].fg,
                                  }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(232,237,248,0.45)", flexShrink: 0, paddingTop: 2 }}>{t.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Report Tab */}
          {tabId === "report" && day.report && (
            <div style={{ background: "#141D35", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "1.2rem" }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800, marginBottom: "1rem" }}>📊 Day {day.num} Report</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.6rem" }}>
                {day.report.metrics.map(m => (
                  <div key={m.label} style={{ background: "#0F1628", borderRadius: 6, padding: "0.7rem", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)", marginBottom: "0.2rem" }}>{m.label}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: colorMap[m.color] }}>{m.value}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 9, marginTop: "0.15rem", color: colorMap[m.color] }}>{m.change}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Tab */}
          {tabId === "keywords" && (
            <div style={{ background: "#141D35", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "1.2rem" }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800, marginBottom: "0.8rem" }}>🎯 15-Day Keyword Battle Plan</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Keyword", "Difficulty", "Volume", "Day 1 Rank", "Target", "Strategy"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.4rem 0.6rem", fontFamily: "monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(232,237,248,0.45)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {KEYWORDS.map(kw => (
                      <tr key={kw.keyword}>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{kw.keyword}</td>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)", color: difficultyColor(kw.difficulty) }}>{kw.difficulty}</td>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{kw.volume}</td>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ display: "inline-block", padding: "0.15rem 0.55rem", borderRadius: 4, fontFamily: "monospace", fontSize: 10, fontWeight: 600, background: dimMap.blue, color: colorMap.blue }}>Not yet</span>
                        </td>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)", color: colorMap.green }}>{kw.target}</td>
                        <td style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(232,237,248,0.45)", fontSize: 11 }}>{kw.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "0.8rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F1628", fontFamily: "monospace", fontSize: 9, color: "rgba(232,237,248,0.45)", letterSpacing: "0.06em", flexWrap: "wrap", gap: "0.5rem" }}>
        <span>WEMATECH AFRICA — SEO WAR ROOM — 15-DAY MISSION</span>
        <span>YOUR SEO MANAGER • <span style={{ color: colorMap.green }}>MISSION ACTIVE</span> • Today: {today}</span>
        <span>TARGET: #1 DIGITAL BANKING AFRICA</span>
      </div>

      {/* Responsive + animation styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media(max-width: 768px) {
          .war-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default SEOWarRoom;
