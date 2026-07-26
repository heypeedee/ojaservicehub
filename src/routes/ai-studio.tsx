import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Lightbulb,
  MessageSquareQuote,
  PenLine,
  Reply,
  Sparkles,
  Store,
  Tag,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import { runAiAssist } from "@/lib/ai-assist.functions";

type Kind =
  | "business_description"
  | "service_description"
  | "pricing_suggestion"
  | "review_reply"
  | "business_tip"
  | "recommend_pros"
  | "estimate_price"
  | "suggest_services";

type Tool = {
  kind: Kind;
  icon: typeof PenLine;
  title: string;
  blurb: string;
  placeholder: string;
  example: string;
};

const providerTools: Tool[] = [
  {
    kind: "business_description",
    icon: Store,
    title: "Business description",
    blurb: "A warm 2–3 sentence bio for your profile.",
    placeholder: "Your craft, years of experience, standout specialty…",
    example: "Bridal makeup artist, 6 years, Lagos, airbrush + soft glam, weddings and photoshoots.",
  },
  {
    kind: "service_description",
    icon: PenLine,
    title: "Service description",
    blurb: "Turn a rough note into a polished service listing.",
    placeholder: "Service name + what's included + who it's for…",
    example: "Deep home cleaning, 3-bed flat, 4 hours, kitchen degreasing, windows, eco products.",
  },
  {
    kind: "pricing_suggestion",
    icon: Wallet,
    title: "Pricing suggestion",
    blurb: "Three tiered prices tuned for your market.",
    placeholder: "What you sell, your area, current price if any…",
    example: "Barber, home visits in Lekki, low fade + line up, current ₦4,000.",
  },
  {
    kind: "review_reply",
    icon: Reply,
    title: "Reply to a review",
    blurb: "A professional response that fits the tone.",
    placeholder: "Paste the review here (positive or negative)…",
    example: "Great job on my braids but you arrived 40 minutes late. — 3★",
  },
  {
    kind: "business_tip",
    icon: Lightbulb,
    title: "Business tip",
    blurb: "One targeted, actionable idea for your situation.",
    placeholder: "What's happening in your business right now…",
    example: "Bookings dropped 30% this month, mostly weekdays. I mainly do makeup.",
  },
];

const customerTools: Tool[] = [
  {
    kind: "recommend_pros",
    icon: Users,
    title: "Recommend a pro",
    blurb: "Get 3 types of pros matched to your need.",
    placeholder: "Describe what you're trying to get done…",
    example: "Hosting 20 people for a birthday dinner at home next Saturday.",
  },
  {
    kind: "estimate_price",
    icon: Tag,
    title: "Estimate a price",
    blurb: "Realistic Naira range for your job in Lagos.",
    placeholder: "Service, size/scope, location…",
    example: "Rewire a 2-bedroom flat in Surulere, standard sockets and lights.",
  },
  {
    kind: "suggest_services",
    icon: MessageSquareQuote,
    title: "Suggest add-on services",
    blurb: "Extras people usually book with your job.",
    placeholder: "The main service you're booking…",
    example: "Booking a private chef for a Saturday dinner party of 8.",
  },
];

export const Route = createFileRoute("/ai-studio")({
  head: () => ({
    meta: [
      { title: "AI Studio · Writing & recommendations · Ọjà" },
      {
        name: "description",
        content:
          "AI helps pros write descriptions, price services, and reply to reviews — and helps customers find the right pro and estimate cost.",
      },
      { property: "og:title", content: "AI Studio · Ọjà" },
      { property: "og:description", content: "Writing and recommendation help powered by AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiStudioPage,
});

function AiStudioPage() {
  const [audience, setAudience] = useState<"provider" | "customer">("provider");
  const tools = audience === "provider" ? providerTools : customerTools;
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Ọjà
          </Link>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Powered by Lovable AI
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Wand2 className="h-3.5 w-3.5" /> AI Studio
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Write, price, and recommend — with AI</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Pros polish descriptions, price services, and reply to reviews. Customers get pro recommendations and price estimates.
          </p>

          <div className="mx-auto mt-6 inline-flex rounded-full bg-muted p-1 text-sm">
            {(
              [
                { k: "provider", l: "For providers" },
                { k: "customer", l: "For customers" },
              ] as const
            ).map((o) => (
              <button
                key={o.k}
                onClick={() => setAudience(o.k)}
                className={`rounded-full px-4 py-1.5 font-semibold transition ${
                  audience === o.k ? "bg-card text-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((t) => (
            <AiToolCard key={t.kind} tool={t} />
          ))}
        </section>
      </div>
    </div>
  );
}

function AiToolCard({ tool }: { tool: Tool }) {
  const runAssist = useServerFn(runAiAssist);
  const [value, setValue] = useState("");
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const Icon = tool.icon;

  async function generate() {
    const context = value.trim() || tool.example;
    setStatus("loading");
    setOutput("");
    setError(null);
    try {
      const res = await runAssist({ data: { kind: tool.kind, context } });
      setOutput(res.text ?? "");
      setStatus("idle");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      const friendly = /402/.test(msg)
        ? "AI credits exhausted. Please top up to continue."
        : /429/.test(msg)
          ? "Too many requests. Please wait a moment and try again."
          : msg;
      setError(friendly);
      setStatus("error");
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(output); } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{tool.title}</h3>
          <p className="text-xs text-muted-foreground">{tool.blurb}</p>
        </div>
      </div>

      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={tool.placeholder}
        className="mt-4 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
      />
      <button
        onClick={() => setValue(tool.example)}
        className="mt-1 self-start text-[11px] text-muted-foreground hover:text-foreground"
      >
        Use example
      </button>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Uses Lovable AI · Free monthly quota</span>
        <button
          onClick={generate}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-70"
        >
          <Sparkles className="h-4 w-4" />
          {status === "loading" ? "Generating…" : "Generate"}
        </button>
      </div>

      {status === "error" && (
        <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Result</span>
            <button onClick={copy} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{output}</p>
        </div>
      )}
    </div>
  );
}
