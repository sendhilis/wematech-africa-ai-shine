// Compliance Alert AI assistant — streaming via Lovable AI Gateway (Gemini).
// Receives chat history + rich dashboard context (subscription, visible circulars,
// unread alerts, current search/filters, optional selected circular) and streams
// markdown answers back to the client over SSE.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type ChatMsg = { role: "user" | "assistant"; content: string };

type CircularSnapshot = {
  id: string;
  country: string;
  regulator: string;
  title: string;
  severity: string;
  topic: string;
  publishedAt: string | null;
  deadline: string | null;
  summary: string;
  url: string;
};

type DashboardContext = {
  subscription?: {
    organization?: string;
    countries?: string[];
    regulators?: string[];
    topics?: string[];
    severityThreshold?: string;
    digestFrequency?: string;
  } | null;
  filters?: {
    severity?: string;
    topic?: string;
    search?: string;
    view?: string;
  };
  stats?: {
    totalVisible?: number;
    unreadCount?: number;
    upcomingDeadlines?: number;
  };
  unreadIds?: string[];
  selectedCircular?: CircularSnapshot | null;
  visibleCirculars?: CircularSnapshot[];
};

function buildSystemPrompt(ctx: DashboardContext): string {
  const sub = ctx.subscription;
  const visible = ctx.visibleCirculars ?? [];
  const unreadSet = new Set(ctx.unreadIds ?? []);

  const subBlock = sub
    ? [
        `Organization: ${sub.organization ?? "—"}`,
        `Subscribed countries (ISO): ${(sub.countries ?? []).join(", ") || "—"}`,
        `Regulators of interest: ${(sub.regulators ?? []).join(", ") || "(all in subscribed countries)"}`,
        `Topics of interest: ${(sub.topics ?? []).join(", ") || "(all topics)"}`,
        `Minimum severity: ${sub.severityThreshold ?? "medium"}`,
        `Digest cadence: ${sub.digestFrequency ?? "daily"}`,
      ].join("\n")
    : "No subscription configured yet.";

  const filterBlock = ctx.filters
    ? `Current view: ${ctx.filters.view ?? "feed"} · severity=${ctx.filters.severity ?? "all"} · topic=${ctx.filters.topic ?? "all"} · search=${ctx.filters.search ? `"${ctx.filters.search}"` : "(none)"}`
    : "";

  const statsBlock = ctx.stats
    ? `Stats: ${ctx.stats.totalVisible ?? 0} circulars currently visible, ${ctx.stats.unreadCount ?? 0} unread, ${ctx.stats.upcomingDeadlines ?? 0} upcoming deadlines.`
    : "";

  const selectedBlock = ctx.selectedCircular
    ? `User has the following circular OPEN right now:
- Title: ${ctx.selectedCircular.title}
- Regulator: ${ctx.selectedCircular.regulator} (${ctx.selectedCircular.country})
- Severity: ${ctx.selectedCircular.severity} · Topic: ${ctx.selectedCircular.topic}
- Published: ${ctx.selectedCircular.publishedAt ?? "—"} · Deadline: ${ctx.selectedCircular.deadline ?? "—"}
- Summary: ${ctx.selectedCircular.summary}
- Source: ${ctx.selectedCircular.url}`
    : "";

  // Limit visible circulars sent to the model — keep the prompt small.
  const top = visible.slice(0, 30);
  const circularList = top.length
    ? top
        .map((c, i) => {
          const unread = unreadSet.has(c.id) ? " [UNREAD]" : "";
          const deadline = c.deadline ? ` · deadline ${c.deadline.slice(0, 10)}` : "";
          return `${i + 1}. [${c.severity.toUpperCase()}]${unread} ${c.regulator} (${c.country}) — ${c.title}${deadline}\n   ${c.summary.slice(0, 220)}${c.summary.length > 220 ? "…" : ""}\n   ${c.url}`;
        })
        .join("\n")
    : "(no circulars currently match the user's filters)";

  return `You are CompliBot — an in-app AI assistant embedded in the WemaTech "Compliance Alert" dashboard. You help African banks, fintechs, and microfinance institutions stay on top of regulatory circulars from central banks (CBN, CBK, SARB, NBE, BoG, etc.).

Be concise, accurate, and practical. Use markdown (lists, **bold**, short tables). When you reference a circular, cite it as **{"Regulator — Title"}** and include its source URL as a markdown link. Never invent circulars or deadlines that aren't in the context. If the user asks something you can't answer from context, say so plainly and suggest what they could do (e.g. "Run crawler now" to refresh, broaden their country filter, etc.).

When asked about freshness ("is this up to date?", "any pending circulars?"), explain: the crawler runs weekly and on demand via the "Run crawler now" button; new items stream in via realtime. The list shown is the latest indexed by our crawler — there may be newer items on the regulator's site that haven't been indexed yet.

────────── DASHBOARD CONTEXT (live) ──────────
${subBlock}

${filterBlock}
${statsBlock}

${selectedBlock ? selectedBlock + "\n\n" : ""}Circulars currently visible to the user (after their filters/search), max 30:
${circularList}
────────────────────────────────────────────────`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages: ChatMsg[] = Array.isArray(body.messages) ? body.messages : [];
    const context: DashboardContext = body.context ?? {};

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(context);

    const upstream = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Lovable Cloud → Settings → Workspace → Usage.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await upstream.text();
      console.error("AI gateway error", upstream.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("compliance-assistant error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
