import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Filter,
  MapPin,
  Search as SearchIcon,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search professionals · ServiceHub" },
      {
        name: "description",
        content:
          "Search verified pros by service, location, price, availability, rating and distance — hairdressers, chefs, electricians and more.",
      },
      { property: "og:title", content: "Search professionals · ServiceHub" },
      { property: "og:description", content: "Find the right pro fast, with powerful filters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

type Provider = {
  id: string;
  name: string;
  initials: string;
  category: string;
  area: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  priceFrom: number;
  availableToday: boolean;
  openNow: boolean;
  verified: boolean;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";
};

const categories = ["Hair & Beauty", "Chefs", "Cleaning", "Electrical", "Plumbing", "DJs & Events", "Tutoring", "Fitness"];
const areas = ["Any area", "Lekki", "Victoria Island", "Ikoyi", "Yaba", "Surulere", "Ikeja", "Ajah"];

const providers: Provider[] = [
  { id: "p1", name: "Adaeze Okoye", initials: "AO", category: "Hair & Beauty", area: "Lekki", distanceKm: 2.1, rating: 4.98, reviews: 214, priceFrom: 65000, availableToday: true, openNow: true, verified: true, tier: "Platinum" },
  { id: "p2", name: "Chef Ifeanyi", initials: "CI", category: "Chefs", area: "Victoria Island", distanceKm: 3.8, rating: 4.9, reviews: 128, priceFrom: 40000, availableToday: false, openNow: false, verified: true, tier: "Gold" },
  { id: "p3", name: "Michael O.", initials: "MO", category: "Hair & Beauty", area: "Yaba", distanceKm: 1.2, rating: 4.85, reviews: 302, priceFrom: 4000, availableToday: true, openNow: true, verified: true, tier: "Elite" },
  { id: "p4", name: "Bola Electric", initials: "BE", category: "Electrical", area: "Surulere", distanceKm: 5.4, rating: 4.8, reviews: 187, priceFrom: 8000, availableToday: true, openNow: false, verified: true, tier: "Gold" },
  { id: "p5", name: "Sparkle Cleaners", initials: "SC", category: "Cleaning", area: "Ikoyi", distanceKm: 4.2, rating: 4.76, reviews: 411, priceFrom: 22000, availableToday: true, openNow: true, verified: true, tier: "Platinum" },
  { id: "p6", name: "Femi Tunes", initials: "FT", category: "DJs & Events", area: "Lekki", distanceKm: 3.1, rating: 4.72, reviews: 96, priceFrom: 90000, availableToday: false, openNow: false, verified: false, tier: "Gold" },
  { id: "p7", name: "Chef Amara", initials: "CA", category: "Chefs", area: "Lekki", distanceKm: 2.6, rating: 4.82, reviews: 74, priceFrom: 35000, availableToday: true, openNow: true, verified: true, tier: "Silver" },
  { id: "p8", name: "PipeFix NG", initials: "PF", category: "Plumbing", area: "Ajah", distanceKm: 8.6, rating: 4.6, reviews: 143, priceFrom: 6500, availableToday: true, openNow: true, verified: true, tier: "Gold" },
  { id: "p9", name: "Tutor Lara", initials: "TL", category: "Tutoring", area: "Ikeja", distanceKm: 11.4, rating: 4.95, reviews: 58, priceFrom: 12000, availableToday: false, openNow: false, verified: true, tier: "Silver" },
  { id: "p10", name: "FitWith Tobi", initials: "FT", category: "Fitness", area: "Victoria Island", distanceKm: 3.9, rating: 4.7, reviews: 89, priceFrom: 15000, availableToday: true, openNow: true, verified: false, tier: "Bronze" },
];

type Sort = "relevance" | "rating" | "price_asc" | "price_desc" | "distance";

function parseNL(q: string) {
  const s = q.toLowerCase();
  const cat = categories.find((c) => s.includes(c.toLowerCase().split(" ")[0])) ?? null;
  const area = areas.slice(1).find((a) => s.includes(a.toLowerCase())) ?? null;
  const verified = /verified/.test(s);
  const today = /\btoday\b|available today/.test(s);
  const openNow = /open now|now\b/.test(s);
  const topRated = /highest rated|top rated|best rated/.test(s);
  const nearby = /near(by| me)?/.test(s);
  const under = s.match(/under\s*₦?\s*([\d,]+)\s*(k)?/);
  const maxPrice = under ? Number(under[1].replace(/,/g, "")) * (under[2] === "k" ? 1000 : 1) : null;
  const map: Record<string, string> = {
    hairdresser: "Hair & Beauty", barber: "Hair & Beauty", makeup: "Hair & Beauty",
    chef: "Chefs", cook: "Chefs",
    clean: "Cleaning", cleaner: "Cleaning",
    electrician: "Electrical", electric: "Electrical",
    plumber: "Plumbing", plumbing: "Plumbing",
    dj: "DJs & Events", event: "DJs & Events",
    tutor: "Tutoring", teacher: "Tutoring",
    fitness: "Fitness", trainer: "Fitness",
  };
  let category = cat;
  for (const k of Object.keys(map)) if (s.includes(k)) { category = map[k]; break; }
  return { category, area, verified, today, openNow, topRated, nearby, maxPrice };
}

function SearchPage() {
  const initial = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(initial.q);
  const nl = useMemo(() => parseNL(q), [q]);

  const [category, setCategory] = useState<string>("Any");
  const [area, setArea] = useState<string>("Any area");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const effCategory = category === "Any" ? nl.category ?? null : category;
  const effArea = area === "Any area" ? nl.area ?? null : area;
  const effVerified = verifiedOnly || nl.verified;
  const effToday = todayOnly || nl.today;
  const effOpen = openNowOnly || nl.openNow;
  const effMaxPrice = Math.min(maxPrice, nl.maxPrice ?? Infinity);
  const effSort: Sort =
    sort !== "relevance" ? sort : nl.topRated ? "rating" : nl.nearby ? "distance" : "relevance";

  const results = useMemo(() => {
    const words: string[] = String(q).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    let list = providers.filter((p) => {
      if (effCategory && p.category !== effCategory) return false;
      if (effArea && p.area !== effArea) return false;
      if (effVerified && !p.verified) return false;
      if (effToday && !p.availableToday) return false;
      if (effOpen && !p.openNow) return false;
      if (p.priceFrom > effMaxPrice) return false;
      if (p.distanceKm > maxDistance) return false;
      if (p.rating < minRating) return false;
      return true;
    });
    const scored = list.map((p) => {
      let kw = 0;
      for (const w of words) {
        if (p.name.toLowerCase().includes(w) || p.category.toLowerCase().includes(w) || p.area.toLowerCase().includes(w)) kw += 1;
      }
      const rel = kw * 5 + (p.rating - 4) * 3 + (p.verified ? 1 : 0) + Math.max(0, 1 - p.distanceKm / 10);
      return { p, rel };
    });
    scored.sort((a, b) => {
      switch (effSort) {
        case "rating": return b.p.rating - a.p.rating;
        case "price_asc": return a.p.priceFrom - b.p.priceFrom;
        case "price_desc": return b.p.priceFrom - a.p.priceFrom;
        case "distance": return a.p.distanceKm - b.p.distanceKm;
        default: return b.rel - a.rel;
      }
    });
    return scored.map((s) => s.p);
  }, [q, effCategory, effArea, effVerified, effToday, effOpen, effMaxPrice, maxDistance, minRating, effSort]);

  const activeChips: { label: string; onClear: () => void }[] = [];
  if (category !== "Any") activeChips.push({ label: category, onClear: () => setCategory("Any") });
  if (area !== "Any area") activeChips.push({ label: area, onClear: () => setArea("Any area") });
  if (verifiedOnly) activeChips.push({ label: "Verified only", onClear: () => setVerifiedOnly(false) });
  if (todayOnly) activeChips.push({ label: "Available today", onClear: () => setTodayOnly(false) });
  if (openNowOnly) activeChips.push({ label: "Open now", onClear: () => setOpenNowOnly(false) });
  if (maxPrice < 200000) activeChips.push({ label: `≤ ₦${maxPrice.toLocaleString()}`, onClear: () => setMaxPrice(200000) });
  if (maxDistance < 15) activeChips.push({ label: `≤ ${maxDistance} km`, onClear: () => setMaxDistance(15) });
  if (minRating > 0) activeChips.push({ label: `${minRating}★+`, onClear: () => setMinRating(0) });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: { q } });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> ServiceHub
          </Link>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <SearchIcon className="ml-2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: hairdresser near Lekki · chef under ₦50,000 · verified electrician available today"
              className="flex-1 bg-transparent py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Search
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 px-2">
            {["Hairdresser near Lekki", "Chef under ₦50,000", "Verified electrician", "Available today", "Highest rated", "Open now", "Nearby"].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => { setQ(s); navigate({ search: { q: s } }); }}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeChips.map((c) => (
              <button key={c.label} onClick={c.onClear} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15">
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4" /> Filters</h2>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setCategory("Any"); setArea("Any area"); setMaxPrice(200000); setMaxDistance(15); setMinRating(0); setVerifiedOnly(false); setTodayOnly(false); setOpenNowOnly(false); }}
                >Reset</button>
              </div>

              <FilterGroup label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm">
                  <option>Any</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Location">
                <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm">
                  {areas.map((a) => <option key={a}>{a}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label={`Price · up to ₦${maxPrice.toLocaleString()}`}>
                <input type="range" min={2000} max={200000} step={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
              </FilterGroup>

              <FilterGroup label={`Distance · within ${maxDistance} km`}>
                <input type="range" min={1} max={15} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
              </FilterGroup>

              <FilterGroup label="Minimum rating">
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5, 4.8].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`flex-1 rounded-lg border px-2 py-1 text-xs ${minRating === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                      {r === 0 ? "Any" : `${r}★`}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Availability">
                <Toggle checked={todayOnly} onChange={setTodayOnly} label="Available today" />
                <Toggle checked={openNowOnly} onChange={setOpenNowOnly} label="Open now" />
              </FilterGroup>

              <FilterGroup label="Trust">
                <Toggle checked={verifiedOnly} onChange={setVerifiedOnly} label="Verified only" />
              </FilterGroup>
            </div>
          </aside>

          <main>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span> pros match
                {q ? <> for "<span className="text-foreground">{q}</span>"</> : null}
              </p>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                Sort:
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                  <option value="relevance">Best match</option>
                  <option value="rating">Highest rated</option>
                  <option value="distance">Nearest</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>
            </div>

            <ul className="mt-4 space-y-3">
              {results.map((p) => (
                <li key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 font-semibold text-primary">{p.initials}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        {p.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><BadgeCheck className="h-3 w-3" /> Verified</span>}
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.tier}</span>
                        {p.openNow && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Open now</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.area} · {p.distanceKm} km</span>
                        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {p.rating} ({p.reviews})</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.availableToday ? "Available today" : "Later this week"}</span>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end">
                      <p className="text-right text-sm font-semibold">from ₦{p.priceFrom.toLocaleString()}</p>
                      <Link to="/book" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">Book</Link>
                    </div>
                  </div>
                </li>
              ))}
              {results.length === 0 && (
                <li className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  No pros match these filters. Try loosening price, distance, or rating.
                </li>
              )}
            </ul>
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[color:var(--color-primary)]" />
    </label>
  );
}
