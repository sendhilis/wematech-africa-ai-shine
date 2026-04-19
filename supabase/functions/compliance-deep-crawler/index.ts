// Compliance Deep Crawler — paginated archive walker with PDF following + audit trail.
// Strategy:
//   1. For each regulator, use Firecrawl /map to discover ALL pages on the directives archive
//      (handles pagination, subdomains optional).
//   2. Filter discovered URLs to plausible directive/circular detail pages + PDFs.
//   3. For each candidate URL: scrape -> SHA-256 the markdown -> if hash unseen, upload markdown
//      to compliance-artifacts bucket -> classify with Lovable AI -> insert circular + artifact row.
//   4. Track everything in crawl_runs for observability.
//
// Designed to run weekly. Costs more Firecrawl credits than the shallow crawler but provides
// a defensible audit trail of exactly what each regulator's site said at extraction time.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_URL = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const BUCKET = "compliance-artifacts";

// Regulator archives — broader than the shallow crawler's index pages.
// `root` is what we hand to /map; `urlFilter` keeps us on relevant detail/PDF pages.
const REGULATOR_SOURCES: Record<
  string,
  {
    regulator: string;
    root: string;
    urlFilter: (u: string) => boolean;
  }
> = {
  NG: {
    regulator: "CBN",
    root: "https://www.cbn.gov.ng/Documents/circulars.asp",
    urlFilter: (u) =>
      /cbn\.gov\.ng\/(out|documents)/i.test(u) &&
      (/\.pdf$/i.test(u) || /circular|guideline|directive/i.test(u)),
  },
  KE: {
    regulator: "CBK",
    root: "https://www.centralbank.go.ke/banking-circulars/",
    urlFilter: (u) =>
      /centralbank\.go\.ke/i.test(u) &&
      (/\.pdf$/i.test(u) || /circular|guideline|prudential/i.test(u)),
  },
  ZA: {
    regulator: "SARB",
    root: "https://www.resbank.co.za/en/home/publications/publication-detail-pages/prudential-authority/pa-public-awareness/Directives",
    urlFilter: (u) =>
      /resbank\.co\.za/i.test(u) &&
      (/\.pdf$/i.test(u) || /directive|guidance|notice/i.test(u)),
  },
  GH: {
    regulator: "Bank of Ghana",
    root: "https://www.bog.gov.gh/news/",
    urlFilter: (u) =>
      /bog\.gov\.gh/i.test(u) && (/\.pdf$/i.test(u) || /news|notice|directive/i.test(u)),
  },
  EG: {
    regulator: "CBE",
    root: "https://www.cbe.org.eg/en/news",
    urlFilter: (u) =>
      /cbe\.org\.eg/i.test(u) && (/\.pdf$/i.test(u) || /news|circular/i.test(u)),
  },
  TZ: {
    regulator: "BoT",
    root: "https://www.bot.go.tz/Publications/Filter/2",
    urlFilter: (u) =>
      /bot\.go\.tz/i.test(u) && (/\.pdf$/i.test(u) || /publication|circular/i.test(u)),
  },
  UG: {
    regulator: "BoU",
    root: "https://www.bou.or.ug/bouwebsite/Supervision/",
    urlFilter: (u) =>
      /bou\.or\.ug/i.test(u) && (/\.pdf$/i.test(u) || /supervision|circular/i.test(u)),
  },
  RW: {
    regulator: "BNR",
    root: "https://www.bnr.rw/news-publications/news/",
    urlFilter: (u) =>
      /bnr\.rw/i.test(u) && (/\.pdf$/i.test(u) || /news|publication/i.test(u)),
  },
  MA: {
    regulator: "Bank Al-Maghrib",
    root: "https://www.bkam.ma/en/Publications-and-research",
    urlFilter: (u) =>
      /bkam\.ma/i.test(u) && (/\.pdf$/i.test(u) || /publication|circular/i.test(u)),
  },
  ET: {
    regulator: "NBE",
    root: "https://nbe.gov.et/directives/",
    urlFilter: (u) =>
      /nbe\.gov\.et/i.test(u) && (/\.pdf$/i.test(u) || /directive|circular/i.test(u)),
  },
};

type ExtractedCircular = {
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "info";
  topics: string[];
  deadline: string | null;
  reference: string | null;
  published_at: string | null;
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function firecrawlMap(
  url: string,
  apiKey: string,
  limit = 500
): Promise<string[]> {
  try {
    const r = await fetch(`${FIRECRAWL_URL}/map`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, limit, includeSubdomains: false }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Firecrawl /map error", r.status, data);
      return [];
    }
    return (data.links ?? data.data?.links ?? []) as string[];
  } catch (e) {
    console.error("firecrawlMap threw", e);
    return [];
  }
}

async function firecrawlScrape(
  url: string,
  apiKey: string
): Promise<{ markdown: string; isPdf: boolean } | null> {
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
      console.error("Firecrawl /scrape error", r.status, url);
      return null;
    }
    const md = data.markdown ?? data.data?.markdown ?? "";
    if (!md || md.length < 100) return null;
    return { markdown: md, isPdf: /\.pdf$/i.test(url) };
  } catch (e) {
    console.error("firecrawlScrape threw", e, url);
    return null;
  }
}

async function classifyWithAI(
  markdown: string,
  regulator: string,
  country: string,
  lovableKey: string
): Promise<ExtractedCircular | null> {
  const systemPrompt = `You are a financial-regulation analyst. The following content is a single regulatory circular, directive, notice, or guideline page from ${regulator} (${country}). Extract its details. If the content does NOT describe a specific regulatory directive (e.g. it's a navigation page, generic news, or not regulatory), set title to empty string.`;

  const userPrompt = `Page content:\n\n${markdown.slice(0, 24000)}`;

  const tool = {
    type: "function",
    function: {
      name: "submit_circular",
      description: "Submit the extracted circular details.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Empty string if not a regulatory directive." },
          summary: { type: "string" },
          severity: { type: "string", enum: ["critical", "high", "medium", "info"] },
          topics: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "AML/CFT",
                "Capital",
                "Digital Lending",
                "Open Banking",
                "FX",
                "Cybersecurity",
                "Reporting",
                "Consumer Protection",
              ],
            },
          },
          deadline: { type: "string" },
          reference: { type: "string" },
          published_at: { type: "string" },
        },
        required: ["title", "summary", "severity", "topics", "deadline", "reference", "published_at"],
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
      tool_choice: { type: "function", function: { name: "submit_circular" } },
    }),
  });

  if (!r.ok) {
    console.error("AI gateway error", r.status, await r.text());
    return null;
  }
  const data = await r.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return null;
  try {
    const c = JSON.parse(args);
    if (!c.title || !c.title.trim()) return null;
    return {
      title: c.title,
      summary: c.summary,
      severity: c.severity,
      topics: c.topics ?? [],
      deadline: c.deadline?.trim() || null,
      reference: c.reference?.trim() || null,
      published_at: c.published_at?.trim() || null,
    };
  } catch {
    return null;
  }
}

const SEVERITY_RANK: Record<string, number> = {
  info: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  let body: {
    countries?: string[];
    triggeredBy?: string;
    maxUrlsPerRegulator?: number;
    sync?: boolean;
  } = {};
  try {
    body = await req.json();
  } catch {
    // empty body fine for cron
  }

  const runDeepCrawl = async () => {
    let targetCountries: string[];
    if (body.countries && body.countries.length > 0) {
      targetCountries = body.countries;
    } else {
      const { data: subs } = await supabase
        .from("compliance_subscriptions")
        .select("countries")
        .eq("is_active", true);
      const set = new Set<string>();
      (subs ?? []).forEach((s: { countries: string[] }) =>
        s.countries.forEach((c) => set.add(c))
      );
      targetCountries = Array.from(set);
    }
    targetCountries = targetCountries.filter((c) => REGULATOR_SOURCES[c]);

    // Create the run record up front
    const { data: run } = await supabase
      .from("crawl_runs")
      .insert({
        mode: "deep",
        triggered_by: body.triggeredBy ?? "cron",
        countries: targetCountries,
        status: "running",
      })
      .select("id")
      .single();

    const runId = run?.id as string | undefined;
    const stats = {
      runId,
      pagesScraped: 0,
      pdfsScraped: 0,
      artifactsStored: 0,
      circularsInserted: 0,
      alertsCreated: 0,
      errors: [] as string[],
    };

    const cap = body.maxUrlsPerRegulator ?? 60;

    for (const country of targetCountries) {
      const src = REGULATOR_SOURCES[country];
      console.log(`[${country}] Mapping ${src.root}`);

      const allLinks = await firecrawlMap(src.root, FIRECRAWL_API_KEY, 500);
      const candidates = Array.from(new Set(allLinks.filter(src.urlFilter))).slice(0, cap);
      console.log(`[${country}] ${allLinks.length} mapped, ${candidates.length} candidates`);

      for (const url of candidates) {
        try {
          const scraped = await firecrawlScrape(url, FIRECRAWL_API_KEY);
          if (!scraped) continue;
          if (scraped.isPdf) stats.pdfsScraped++;
          else stats.pagesScraped++;

          const hash = await sha256Hex(scraped.markdown);

          // Dedup by content hash + url — if same bytes already captured, skip everything
          const { data: existingArtifact } = await supabase
            .from("crawl_artifacts")
            .select("id, circular_id")
            .eq("content_sha256", hash)
            .eq("source_url", url)
            .maybeSingle();

          if (existingArtifact) {
            // Refresh last_crawled_at on the linked circular for freshness signal
            if (existingArtifact.circular_id) {
              await supabase
                .from("compliance_circulars")
                .update({ last_crawled_at: new Date().toISOString() })
                .eq("id", existingArtifact.circular_id);
            }
            continue;
          }

          // Upload markdown to storage
          const storagePath = `${country}/${src.regulator}/${hash}.md`;
          const upload = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, new Blob([scraped.markdown], { type: "text/markdown" }), {
              upsert: true,
              contentType: "text/markdown",
            });
          if (upload.error) {
            stats.errors.push(`upload failed ${url}: ${upload.error.message}`);
            continue;
          }

          // Classify
          const extracted = await classifyWithAI(
            scraped.markdown,
            src.regulator,
            country,
            LOVABLE_API_KEY
          );

          // Insert artifact (even if no circular extracted — we still want the audit trail)
          const { data: artifactRow, error: artErr } = await supabase
            .from("crawl_artifacts")
            .insert({
              country,
              regulator: src.regulator,
              source_url: url,
              source_type: scraped.isPdf ? "pdf" : "html",
              content_sha256: hash,
              byte_size: scraped.markdown.length,
              storage_path: storagePath,
              crawl_run_id: runId,
            })
            .select("id")
            .single();

          if (artErr || !artifactRow) {
            stats.errors.push(`artifact insert ${url}: ${artErr?.message}`);
            continue;
          }
          stats.artifactsStored++;

          if (!extracted) continue;

          // Circular fingerprint based on regulator + reference (if any) + title
          const fingerprint = await sha256Hex(
            `${country}|${src.regulator}|${extracted.reference ?? extracted.title.toLowerCase().trim()}`
          );

          const { data: existingCirc } = await supabase
            .from("compliance_circulars")
            .select("id")
            .eq("fingerprint", fingerprint)
            .maybeSingle();

          let circularId: string;
          if (existingCirc) {
            circularId = existingCirc.id;
            await supabase
              .from("compliance_circulars")
              .update({
                last_artifact_id: artifactRow.id,
                last_crawled_at: new Date().toISOString(),
              })
              .eq("id", circularId);
          } else {
            const { data: inserted, error: insErr } = await supabase
              .from("compliance_circulars")
              .insert({
                fingerprint,
                country,
                regulator: src.regulator,
                title: extracted.title,
                summary: extracted.summary,
                severity: extracted.severity,
                topics: extracted.topics,
                source_url: url,
                published_at: extracted.published_at,
                deadline: extracted.deadline,
                body: null,
                last_artifact_id: artifactRow.id,
                last_crawled_at: new Date().toISOString(),
              })
              .select("id, severity, topics")
              .single();
            if (insErr || !inserted) {
              stats.errors.push(`circular insert ${url}: ${insErr?.message}`);
              continue;
            }
            circularId = inserted.id;
            stats.circularsInserted++;

            // Fan out alerts to matching subscribers
            const { data: matchSubs } = await supabase
              .from("compliance_subscriptions")
              .select("user_id, regulators, topics, severity_threshold")
              .eq("is_active", true)
              .contains("countries", [country]);

            const incomingRank = SEVERITY_RANK[inserted.severity] ?? 2;
            const alertRows = (matchSubs ?? [])
              .filter(
                (s: {
                  regulators: string[];
                  topics: string[];
                  severity_threshold: string;
                }) => {
                  const minRank = SEVERITY_RANK[s.severity_threshold] ?? 2;
                  if (incomingRank < minRank) return false;
                  const hasRegulatorNameFilter = s.regulators.some(
                    (r) => r.length > 2 && !/^[A-Z]{2}$/.test(r)
                  );
                  if (hasRegulatorNameFilter && !s.regulators.includes(src.regulator))
                    return false;
                  if (s.topics.length > 0) {
                    const overlap = s.topics.some((t) => inserted.topics.includes(t));
                    if (!overlap) return false;
                  }
                  return true;
                }
              )
              .map((s: { user_id: string }) => ({
                user_id: s.user_id,
                circular_id: circularId,
              }));

            if (alertRows.length > 0) {
              await supabase.from("compliance_alerts").insert(alertRows);
              stats.alertsCreated += alertRows.length;
            }
          }

          // Link the artifact to the circular
          await supabase
            .from("crawl_artifacts")
            .update({ circular_id: circularId })
            .eq("id", artifactRow.id);
        } catch (e) {
          stats.errors.push(`${url}: ${(e as Error).message}`);
        }
      }
    }

    // Finalize run
    if (runId) {
      await supabase
        .from("crawl_runs")
        .update({
          finished_at: new Date().toISOString(),
          pages_scraped: stats.pagesScraped,
          pdfs_scraped: stats.pdfsScraped,
          artifacts_stored: stats.artifactsStored,
          circulars_inserted: stats.circularsInserted,
          errors: stats.errors,
          status: stats.errors.length > 0 && stats.artifactsStored === 0 ? "failed" : "completed",
        })
        .eq("id", runId);
    }

    console.log("Deep crawl finished", stats);
    return { ok: true, stats };
  };

  if (body.sync) {
    const result = await runDeepCrawl();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // @ts-expect-error EdgeRuntime is provided by Supabase Edge runtime
  EdgeRuntime.waitUntil(
    runDeepCrawl().catch((e) => console.error("Background deep crawl failed", e))
  );

  return new Response(
    JSON.stringify({
      ok: true,
      accepted: true,
      message: "Deep crawler started in background. This may take 5-15 minutes.",
    }),
    {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
