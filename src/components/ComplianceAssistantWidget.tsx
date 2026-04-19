import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "@/hooks/use-toast";
import type { Circular } from "@/data/complianceAlertMock";

// ---------- Types ----------

type ChatMsg = { role: "user" | "assistant"; content: string };

export type AssistantContext = {
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
  selectedCircular?: Circular | null;
  visibleCirculars?: Circular[];
};

// ---------- Helpers ----------

const ASSIST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-assistant`;

function snapshotCircular(c: Circular) {
  return {
    id: c.id,
    country: c.country,
    regulator: c.regulator,
    title: c.title,
    severity: c.severity,
    topic: c.topic,
    publishedAt: c.publishedAt,
    deadline: c.deadline,
    summary: c.summary,
    url: c.url,
  };
}

function buildContextPayload(ctx: AssistantContext) {
  return {
    subscription: ctx.subscription ?? null,
    filters: ctx.filters ?? {},
    stats: ctx.stats ?? {},
    unreadIds: ctx.unreadIds ?? [],
    selectedCircular: ctx.selectedCircular ? snapshotCircular(ctx.selectedCircular) : null,
    visibleCirculars: (ctx.visibleCirculars ?? []).slice(0, 30).map(snapshotCircular),
  };
}

// ---------- Draggable Blob ----------

type Pos = { x: number; y: number };

const STORAGE_POS_KEY = "compliBot:pos";

function clampToViewport(p: Pos, size = 64): Pos {
  if (typeof window === "undefined") return p;
  const maxX = Math.max(8, window.innerWidth - size - 8);
  const maxY = Math.max(8, window.innerHeight - size - 8);
  return { x: Math.min(Math.max(8, p.x), maxX), y: Math.min(Math.max(8, p.y), maxY) };
}

function loadPos(): Pos {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  try {
    const raw = localStorage.getItem(STORAGE_POS_KEY);
    if (raw) return clampToViewport(JSON.parse(raw));
  } catch {
    /* noop */
  }
  // Default: bottom-right
  return clampToViewport({ x: window.innerWidth - 88, y: window.innerHeight - 120 });
}

const Blob = ({
  pos,
  onDragEnd,
  onClick,
  unreadCount,
}: {
  pos: Pos;
  onDragEnd: (p: Pos) => void;
  onClick: () => void;
  unreadCount: number;
}) => {
  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number; moved: boolean }>({
    active: false,
    offsetX: 0,
    offsetY: 0,
    moved: false,
  });
  const [livePos, setLivePos] = useState(pos);

  useEffect(() => setLivePos(pos), [pos]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      offsetX: e.clientX - livePos.x,
      offsetY: e.clientY - livePos.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const next = clampToViewport({
      x: e.clientX - dragRef.current.offsetX,
      y: e.clientY - dragRef.current.offsetY,
    });
    if (Math.abs(next.x - livePos.x) > 2 || Math.abs(next.y - livePos.y) > 2) {
      dragRef.current.moved = true;
    }
    setLivePos(next);
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    if (wasDrag) {
      onDragEnd(livePos);
    } else {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ left: livePos.x, top: livePos.y }}
      className="fixed z-50 h-16 w-16 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/60 touch-none select-none group"
      aria-label="Open CompliBot AI assistant"
    >
      {/* Animated blob */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-90 blur-md animate-pulse" />
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.6)] group-hover:scale-105 transition-transform" />
      <span className="absolute inset-1 rounded-full bg-background/10 backdrop-blur-sm" />
      <span className="relative flex h-full w-full items-center justify-center text-primary-foreground">
        <Sparkles size={22} className="drop-shadow" />
      </span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

// ---------- Chat Panel ----------

const SUGGESTED = [
  "Summarize what's in my feed right now",
  "What deadlines should I act on this week?",
  "Is the list up to date — any pending circulars?",
  "Explain the most critical AML item in plain English",
];

const ChatPanel = ({
  messages,
  isStreaming,
  input,
  setInput,
  onSend,
  onClose,
  panelPos,
}: {
  messages: ChatMsg[];
  isStreaming: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: (text?: string) => void;
  onClose: () => void;
  panelPos: Pos;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Position panel near the blob but keep it on-screen.
  const panelStyle = useMemo(() => {
    if (typeof window === "undefined") return {};
    const w = Math.min(420, window.innerWidth - 24);
    const h = Math.min(580, window.innerHeight - 120);
    let left = panelPos.x + 80;
    let top = panelPos.y - h + 60;
    if (left + w > window.innerWidth - 12) left = Math.max(12, window.innerWidth - w - 12);
    if (top < 12) top = 12;
    if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
    return { left, top, width: w, height: h };
  }, [panelPos]);

  return (
    <div
      style={panelStyle}
      className="fixed z-50 flex flex-col rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl animate-scale-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">CompliBot</div>
            <div className="text-[11px] text-muted-foreground truncate">
              Knows your subscription, feed & filters
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Close assistant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Hi 👋 I have your subscription, the circulars in your feed, and your current filters
              loaded. Ask me anything.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  disabled={isStreaming}
                  className="text-[11px] px-2.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 text-secondary-foreground border border-border/50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary/70 text-foreground rounded-bl-md border border-border/40"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-a:text-primary prose-a:underline break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2.5 bg-secondary/70 text-muted-foreground border border-border/40 inline-flex items-center gap-2 text-xs">
              <Loader2 size={12} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border/50 p-3 bg-background/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Ask about your circulars, deadlines, regulators…"
            className="flex-1 resize-none max-h-32 px-3 py-2 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90"
            aria-label="Send"
          >
            {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------- Main Widget ----------

const ComplianceAssistantWidget = ({ context }: { context: AssistantContext }) => {
  const [pos, setPos] = useState<Pos>(() => loadPos());
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Always read the freshest context at send time.
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Keep blob inside viewport on resize.
  useEffect(() => {
    const onResize = () => setPos((p) => clampToViewport(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const persistPos = useCallback((p: Pos) => {
    setPos(p);
    try {
      localStorage.setItem(STORAGE_POS_KEY, JSON.stringify(p));
    } catch {
      /* noop */
    }
  }, []);

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isStreaming) return;

      const userMsg: ChatMsg = { role: "user", content: text };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await fetch(ASSIST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: nextMessages,
            context: buildContextPayload(contextRef.current),
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          let msg = "Couldn't reach the assistant.";
          if (resp.status === 429) msg = "Rate limit reached. Try again shortly.";
          else if (resp.status === 402) msg = "AI credits exhausted. Top up in Lovable Cloud.";
          else {
            try {
              const j = await resp.json();
              if (j?.error) msg = j.error;
            } catch {
              /* noop */
            }
          }
          toast({ title: "Assistant error", description: msg, variant: "destructive" });
          setIsStreaming(false);
          return;
        }

        // Stream SSE
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantSoFar = "";
        let started = false;
        let streamDone = false;

        const upsertAssistant = (chunk: string) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            if (!started) {
              started = true;
              return [...prev, { role: "assistant", content: assistantSoFar }];
            }
            return prev.map((m, i) =>
              i === prev.length - 1 && m.role === "assistant"
                ? { ...m, content: assistantSoFar }
                : m
            );
          });
        };

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, nl);
            textBuffer = textBuffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (delta) upsertAssistant(delta);
            } catch {
              // partial JSON — put back and wait
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush leftover
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const json = raw.slice(6).trim();
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (delta) upsertAssistant(delta);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") {
          console.error("assistant stream failed", e);
          toast({
            title: "Assistant error",
            description: e instanceof Error ? e.message : "Stream failed",
            variant: "destructive",
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [input, isStreaming, messages]
  );

  return (
    <>
      <Blob
        pos={pos}
        onDragEnd={persistPos}
        onClick={() => setOpen((v) => !v)}
        unreadCount={context.stats?.unreadCount ?? 0}
      />
      {open && (
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          input={input}
          setInput={setInput}
          onSend={send}
          onClose={() => setOpen(false)}
          panelPos={pos}
        />
      )}
    </>
  );
};

export default ComplianceAssistantWidget;
