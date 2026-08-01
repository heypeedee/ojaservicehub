import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  MapPin,
  MessageCircle,
  Mic,
  Radar,
  Sparkles,
  Star,
  Wallet,
  Wand2,
  Zap,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/instant-match")({
  head: () => ({
    meta: [
      { title: "Instant Match · Describe it, get matched · Ọjà" },
      {
        name: "description",
        content:
          "Describe what you need in plain English. Instant Match ranks nearby, available, top-rated pros by fit — in seconds.",
      },
      { property: "og:title", content: "Instant Match · Ọjà" },
      {
        property: "og:description",
        content: "Skip the scroll — describe your need and get the best pros in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstantMatchPage,
});

type Pro = {
  id: string;
  name: string;
  initials: string;
  craft: string;
  area: string;
  rating: number;
  reviews: number;
  priceFrom: number;
  availableToday: boolean;
  openNow: boolean;
  verified: boolean;
  tier: string;
};

type ProviderRow = {
  id: string;
  business_name: string;
  area: string;
  rating: number;
  review_count: number;
  price_from: number;
  available_today: boolean;
  open_now: boolean;
  verified: boolean;
  tier: string;
  categories: { name: string } | null;
};

const chips = [
  "Barber near Yaba, today",
  "Bridal makeup Saturday morning, budget ₦100k",
  "Deep clean 3-bed flat in Ikoyi this weekend",
  "Certified electrician tomorrow for AC install",
];

// Pull a location phrase out of free text like "barber near Yaba this evening"
// or "deep clean in Ikoyi this weekend" — this is a plain substring match
// against each provider's real `area` text, not real geocoding/distance,
// since providers only have a free-text area on file right now.
function extractLocationPhrase(q: string): string | null {
  const m = q.match(/\b(?:near|in|around)\s+([a-z\s]+?)(?:,|\bthis\b|\btoday\b|\btomorrow\b|\bfor\b|$)/i);
  const phrase = m?.[1]?.trim();
  return phrase && phrase.length >= 3 ? phrase : null;
}

function InstantMatchPage() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(50000);
  const [when, setWhen] = useState<"asap" | "today" | "week">("asap");
  const [status, setStatus] = useState<"idle" | "searching" | "done">("idle");
  const [matches, setMatches] = useState<(Pro & { score: number; why: string[] })[]>([]);
  const [noLocationMatch, setNoLocationMatch] = useState<string | null>(null);

  async function run(q: string) {
    setQuery(q);
    setStatus("searching");
    setMatches([]);
    setNoLocationMatch(null);

    const { data } = await supabase
      .from("provider_profiles")
      .select(
        "id, business_name, area, rating, review_count, price_from, available_today, open_now, verified, tier, categories(name)"
      )
      .eq("published", true);

    const pool: Pro[] = ((data as unknown as ProviderRow[]) ?? []).map((p) => ({
      id: p.id,
      name: p.business_name,
      initials: p.business_name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?",
      craft: p.categories?.name ?? "Service provider",
      area: p.area,
      rating: p.rating,
      reviews: p.review_count,
      priceFrom: Number(p.price_from),
      availableToday: p.available_today,
      openNow: p.open_now,
      verified: p.verified,
      tier: p.tier,
    }));

    const words = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const locationPhrase = extractLocationPhrase(q);
    const locationWords = locationPhrase?.toLowerCase().split(/\s+/).filter((w) => w.length >= 3) ?? [];

    let candidates = pool;
    if (locationWords.length > 0) {
      const inArea = pool.filter((p) => locationWords.some((w) => p.area.toLowerCase().includes(w)));
      if (inArea.length === 0) {
        setNoLocationMatch(locationPhrase);
        setMatches([]);
        setStatus("done");
        return;
      }
      candidates = inArea;
    }

    setTimeout(() => {
      const ranked = candidates
        .map((p) => {
          const keyword = words.reduce((s, w) => s + (p.craft.toLowerCase().includes(w) ? 1 : 0), 0);
          const availabilityBoost = when === "asap" ? (p.openNow ? 1.2 : p.availableToday ? 0.9 : 0.4) : 0.8;
          const locationBoost = locationWords.some((w) => p.area.toLowerCase().includes(w)) ? 1 : 0;
          const ratingScore = p.rating > 0 ? (p.rating - 4.5) * 2 : 0;
          const priceFit = p.priceFrom === 0 ? 0.5 : p.priceFrom <= budget ? 1 : Math.max(0, 1 - (p.priceFrom - budget) / budget);
          const verifiedBoost = p.verified ? 0.15 : 0;
          const score = Math.round(
            (keyword * 2 + availabilityBoost + locationBoost + ratingScore + priceFit + verifiedBoost) * 12
          );
          const why: string[] = [];
          if (keyword > 0) why.push("Matches your description");
          if (p.openNow) why.push("Open now");
          else if (p.availableToday) why.push("Available today");
          if (locationBoost > 0) why.push(`Located in ${p.area}`);
          if (p.rating >= 4.5) why.push(`Top-rated (${p.rating.toFixed(2)}★)`);
          if (p.priceFrom > 0 && p.priceFrom <= budget) why.push("Within your budget");
          return { ...p, score, why: why.slice(0, 3) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      setMatches(ranked);
      setStatus("done");
    }, 900);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Instant Match
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Describe it. Get matched in seconds.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Skip the endless scroll. Tell us what you need and we notify nearby, available, top-rated pros — ranked by fit.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground sm:grid">
              <Wand2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">What do you need?</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Barber near Yaba this evening for a low fade, under ₦8,000"
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => run(c)}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Budget</span>
                    <span className="font-semibold text-foreground">up to ₦{budget.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={200000}
                    step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-2 w-full accent-[color:var(--color-primary)]"
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">When</span>
                  <div className="mt-1 grid grid-cols-3 gap-1 rounded-full bg-muted p-1 text-xs">
                    {(
                      [
                        { k: "asap", l: "ASAP" },
                        { k: "today", l: "Today" },
                        { k: "week", l: "This week" },
                      ] as const
                    ).map((o) => (
                      <button
                        key={o.k}
                        onClick={() => setWhen(o.k)}
                        className={`rounded-full py-1.5 font-semibold ${
                          when === o.k ? "bg-card text-foreground shadow" : "text-muted-foreground"
                        }`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  aria-label="Voice input"
                >
                  <Mic className="h-4 w-4" /> Voice
                </button>
                <button
                  onClick={() => run(query || chips[0])}
                  disabled={status === "searching"}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-70"
                >
                  <Sparkles className="h-4 w-4" />
                  {status === "searching" ? "Matching…" : "Find matches"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {status === "idle" && <HowItWorks />}
          {status === "searching" && <Searching query={query || chips[0]} />}
          {status === "done" && noLocationMatch && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm font-semibold text-foreground">No pros found near "{noLocationMatch}" yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a nearby area, or{" "}
                <Link to="/search" search={{ q: "" }} className="font-semibold text-primary hover:underline">
                  browse all pros
                </Link>{" "}
                instead.
              </p>
            </div>
          )}
          {status === "done" && !noLocationMatch && <Results matches={matches} />}
        </section>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BackNav label="Back to Ọjà" />
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" /> Avg match time · 4s
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Wand2, title: "Describe it", body: "Say what you need in your own words — no forms." },
    { icon: Radar, title: "We ping nearby pros", body: "Available, verified, top-rated pros get notified instantly." },
    { icon: Sparkles, title: "Ranked in seconds", body: "You get 3–4 best matches by fit, distance, price, and rating." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s) => (
        <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <s.icon className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{s.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function Searching({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Radar className="h-5 w-5" />
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">Pinging nearby pros…</p>
          <p className="text-xs text-muted-foreground line-clamp-1">"{query}"</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Results({ matches }: { matches: (Pro & { score: number; why: string[] })[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm font-semibold text-foreground">No pros match this yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ọjà is early — new pros join every week.{" "}
          <Link to="/search" search={{ q: "" }} className="font-semibold text-primary hover:underline">
            Browse everyone
          </Link>{" "}
          in the meantime.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your best matches</h2>
        <span className="text-xs text-muted-foreground">Ranked by fit</span>
      </div>
      <ul className="space-y-3">
        {matches.map((m, i) => (
          <MatchCard key={m.id} match={m} rank={i + 1} />
        ))}
      </ul>
    </div>
  );
}

function MatchCard({ match, rank }: { match: Pro & { score: number; why: string[] }; rank: number }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {match.initials}
          </div>
          <span className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
            #{rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold">{match.name}</p>
            {match.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {match.tier}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{match.craft}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.area}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {match.openNow ? "Open now" : match.availableToday ? "Available today" : "Check availability"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {match.rating > 0 ? match.rating.toFixed(2) : "New"} ({match.reviews})
            </span>
            <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> from ₦{match.priceFrom.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.why.map((w) => (
              <span key={w} className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Match score</p>
            <p className="text-2xl font-semibold text-primary">{match.score}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/messages"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </Link>
            <Link
              to="/book"
              search={{ providerId: match.id }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
