// Compliance Alert — scheduled AI crawler
// Fetches regulator pages via Firecrawl, classifies with Lovable AI (Gemini),
// dedupes by fingerprint, writes circulars, fans out alerts to matching subscribers.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_URL = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Map ISO country -> regulator scrape sources.
// Keep a focused list — crawler runs weekly, costs money.
const REGULATOR_SOURCES: Record<
  string,
  { regulator: string; urls: string[] }
> = {
  NG: {
    regulator: "CBN",
    urls: ["https://www.cbn.gov.ng/Documents/circulars.asp"],
  },
  KE: {
    regulator: "CBK",
    urls: ["https://www.centralbank.go.ke/banking-circulars/"],
  },
  ZA: {
    regulator: "SARB",
    urls: ["https://www.resbank.co.za/en/home/publications/publication-detail-pages/prudential-authority/pa-public-awareness/Directives"],
  },
  GH: {
    regulator: "Bank of Ghana",
    urls: ["https://www.bog.gov.gh/news/"],
  },
  EG: { regulator: "CBE", urls: ["https://www.cbe.org.eg/en/news"] },
  TZ: { regulator: "BoT", urls: ["https://www.bot.go.tz/Publications/Filter/2"] },
  UG: { regulator: "BoU", urls: ["https://www.bou.or.ug/bouwebsite/Supervision/"] },
  RW: { regulator: "BNR", urls: ["https://www.bnr.rw/news-publications/news/"] },
  MA: { regulator: "Bank Al-Maghrib", urls: ["https://www.bkam.ma/en/Publications-and-research"] },
  ET: { regulator: "NBE", urls: ["https://nbe.gov.et/directives/"] },
};

type ExtractedCircular = {
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "info";
  topics: string[];
  deadline: string | null; // ISO or null
  reference: string | null;
  published_at: string | null;
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function firecrawlScrape(
  url: string,
  apiKey: string
): Promise<{ markdown: string; sourceUrl: string } | null> {
  try {
    const r = await fetch(`${FIRECRAWL_URL}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Firecrawl error", r.status, data);
      return null;
    }
    const md =
      data.markdown ?? data.data?.markdown ?? "";
    if (!md) return null;
    return { markdown: md, sourceUrl: url };
  } catch (e) {
    console.error("Firecrawl threw", e);
    return null;
  }
}

async function classifyWithAI(
  markdown: string,
  regulator: string,
  country: string,
  lovableKey: string
): Promise<ExtractedCircular[]> {
  const systemPrompt = `You are a financial-regulation analyst. From the page below (regulator: ${regulator}, country: ${country}), extract every distinct regulatory circular, directive, notice, or guideline that appears. Ignore navigation, footers, and unrelated marketing. Return a strict list — no commentary.`;

  const userPrompt = `Extract circulars from this page content:\n\n${markdown.slice(0, 20000)}`;

  const tool = {
    type: "function",
    function: {
      name: "submit_circulars",
      description: "Submit the list of extracted regulatory circulars.",
      parameters: {
        type: "object",
        properties: {
          circulars: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string", description: "2-3 sentence plain-English summary." },
                severity: { type: "string", enum: ["critical", "high", "medium", "info"] },
                topics: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["AML/CFT", "Capital", "Digital Lending", "Open Banking", "FX", "Cybersecurity", "Reporting", "Consumer Protection"],
                  },
                },
                deadline: { type: "string", description: "ISO date if a compliance deadline is mentioned, else empty string." },
                reference: { type: "string", description: "Circular reference / number if visible, else empty string." },
                published_at: { type: "string", description: "ISO date of publication if visible, else empty string." },
              },
              required: ["title", "summary", "severity", "topics", "deadline", "reference", "published_at"],
              additionalProperties: false,
            },
          },
        },
        required: ["circulars"],
        additionalProperties: false,
      },
    },
  };

  const r = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "submit_circulars" } },
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    console.error("AI gateway error", r.status, t);
    return [];
  }

  const data = await r.json();
  const args =
    data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return [];
  try {
    const parsed = JSON.parse(args);
    return (parsed.circulars ?? []).map((c: ExtractedCircular & { deadline: string; published_at: string; reference: string }) => ({
      ...c,
      deadline: c.deadline && c.deadline.trim() ? c.deadline : null,
      published_at: c.published_at && c.published_at.trim() ? c.published_at : null,
      reference: c.reference && c.reference.trim() ? c.reference : null,
    }));
  } catch (e) {
    console.error("Failed to parse AI args", e);
    return [];
  }
}

const SEVERITY_RANK: Record<string, number> = {
  info: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Optional body: { countries?: string[], dryRun?: boolean, sync?: boolean }
  let body: { countries?: string[]; dryRun?: boolean; sync?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // GET / cron call — empty body fine
  }

  // Main crawl work — extracted so we can run it in the background via EdgeRuntime.waitUntil
  const runCrawl = async () => {
    // Find which countries to crawl: union of all active subscriptions, or override.
  let targetCountries: string[];
  if (body.countries && body.countries.length > 0) {
    targetCountries = body.countries;
  } else {
    const { data: subs, error } = await supabase
      .from("compliance_subscriptions")
      .select("countries")
      .eq("is_active", true);
    if (error) {
      console.error("Failed to load subs", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const set = new Set<string>();
    (subs ?? []).forEach((s: { countries: string[] }) =>
      s.countries.forEach((c) => set.add(c))
    );
    targetCountries = Array.from(set);
  }

  // Filter to countries we know how to crawl.
  targetCountries = targetCountries.filter((c) => REGULATOR_SOURCES[c]);

  console.log("Crawl plan:", targetCountries);

  const stats = {
    countries: targetCountries.length,
    pagesScraped: 0,
    circularsExtracted: 0,
    circularsInserted: 0,
    alertsCreated: 0,
    errors: [] as string[],
  };

  for (const country of targetCountries) {
    const src = REGULATOR_SOURCES[country];
    for (const url of src.urls) {
      const scraped = await firecrawlScrape(url, FIRECRAWL_API_KEY);
      if (!scraped) {
        stats.errors.push(`scrape failed: ${url}`);
        continue;
      }
      stats.pagesScraped++;

      const extracted = await classifyWithAI(
        scraped.markdown,
        src.regulator,
        country,
        LOVABLE_API_KEY
      );
      stats.circularsExtracted += extracted.length;

      for (const c of extracted) {
        const fingerprint = await sha256Hex(
          `${country}|${src.regulator}|${c.title.toLowerCase().trim()}`
        );

        if (body.dryRun) continue;

        // Dedup: skip if already present
        const { data: existing } = await supabase
          .from("compliance_circulars")
          .select("id")
          .eq("fingerprint", fingerprint)
          .maybeSingle();

        if (existing) continue;

        const { data: inserted, error: insErr } = await supabase
          .from("compliance_circulars")
          .insert({
            fingerprint,
            country,
            regulator: src.regulator,
            title: c.title,
            summary: c.summary,
            severity: c.severity,
            topics: c.topics,
            source_url: url,
            published_at: c.published_at,
            deadline: c.deadline,
            body: null,
          })
          .select("id, severity, topics, country, regulator")
          .single();

        if (insErr || !inserted) {
          stats.errors.push(`insert failed: ${insErr?.message}`);
          continue;
        }
        stats.circularsInserted++;

        // Find matching subscriptions and create alerts
        const { data: matchSubs } = await supabase
          .from("compliance_subscriptions")
          .select("user_id, countries, regulators, topics, severity_threshold")
          .eq("is_active", true)
          .contains("countries", [country]);

        const incomingRank = SEVERITY_RANK[inserted.severity] ?? 2;

        const alertRows = (matchSubs ?? [])
          .filter((s: { regulators: string[]; topics: string[]; severity_threshold: string }) => {
            // Severity threshold
            const minRank = SEVERITY_RANK[s.severity_threshold] ?? 2;
            if (incomingRank < minRank) return false;
            // Regulator filter: only enforced if the user explicitly listed a regulator NAME
            // (not a country code). Country filter above is authoritative.
            const hasRegulatorNameFilter = s.regulators.some(
              (r) => r.length > 2 && !/^[A-Z]{2}$/.test(r)
            );
            if (hasRegulatorNameFilter && !s.regulators.includes(src.regulator)) return false;
            // Topic filter (empty = all)
            if (s.topics.length > 0) {
              const overlap = s.topics.some((t) => inserted.topics.includes(t));
              if (!overlap) return false;
            }
            return true;
          })
          .map((s: { user_id: string }) => ({
            user_id: s.user_id,
            circular_id: inserted.id,
          }));

        if (alertRows.length > 0) {
          const { error: alertErr } = await supabase
            .from("compliance_alerts")
            .insert(alertRows);
          if (alertErr) {
            stats.errors.push(`alert insert failed: ${alertErr.message}`);
          } else {
            stats.alertsCreated += alertRows.length;
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, stats }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
