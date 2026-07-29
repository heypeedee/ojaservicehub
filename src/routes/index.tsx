import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Scissors,
  Wrench,
  Sparkles,
  Zap,
  Camera,
  ChefHat,
  Paintbrush,
  Car,
  Star,
  ShieldCheck,
  CheckCircle2,
  Apple,
  Smartphone,
  ArrowRight,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Scissors,
  Wrench,
  Sparkles,
  Zap,
  Camera,
  ChefHat,
  Paintbrush,
  Car,
};

const CATEGORY_TINTS = [
  "bg-brand-soft text-brand",
  "bg-orange/10 text-orange",
  "bg-brand-soft text-brand",
  "bg-gold/15 text-charcoal",
];

type CategoryRow = { id: string; slug: string; name: string; icon: string | null };

type ProviderRow = {
  id: string;
  business_name: string;
  tagline: string | null;
  area: string;
  price_from: number;
  tier: string;
  rating: number;
  review_count: number;
  cover_image_url: string | null;
  category_id: string | null;
  categories: { name: string } | null;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ọjà — Find trusted professionals around you" },
      {
        name: "description",
        content:
          "Ọjà connects you to verified barbers, chefs, tailors, electricians, photographers and artisans across Lagos. Escrow-protected, honest reviews, calm booking.",
      },
      { property: "og:title", content: "Ọjà — Find trusted professionals around you" },
      {
        property: "og:description",
        content:
          "Verified local professionals across Lagos. Escrow payments, Instant Match, cohesive premium experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Categories />
      <Featured />
      <RecentJobs />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <OjaLogo size={34} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#categories" className="transition-colors hover:text-foreground">Explore</a>
          <a href="#featured" className="transition-colors hover:text-foreground">Professionals</a>
          <Link to="/map" className="transition-colors hover:text-foreground">Lagos map</Link>
          <Link to="/dashboard" className="transition-colors hover:text-foreground">My dashboard</Link>
          <Link to="/pro/dashboard" className="transition-colors hover:text-foreground">For business</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/signup"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 hover:shadow-md"
          >
            Join Ọjà
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [providerCount, setProviderCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { count } = await supabase
        .from("provider_profiles")
        .select("id", { count: "exact", head: true })
        .eq("published", true);
      if (active) setProviderCount(count ?? 0);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 12% 8%, oklch(0.965 0.05 155 / 0.95), transparent 62%), radial-gradient(55% 45% at 92% 18%, oklch(0.94 0.12 78 / 0.55), transparent 60%), linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.985 0.004 155) 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Escrow-protected · Verified across Lagos
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Find trusted professionals <span className="text-primary">around you.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            From bridal stylists to electricians and private chefs — book verified experts in your
            neighborhood, in minutes.
          </p>

          <form
            className="mx-auto mt-10 flex w-full max-w-3xl flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-[0_20px_60px_-30px_oklch(0.46_0.13_155/0.35)] sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const q = String(fd.get("q") ?? "").trim();
              const where = String(fd.get("where") ?? "").trim();
              const full = [q, where && `near ${where}`].filter(Boolean).join(" ");
              navigate({ to: "/search", search: { q: full } });
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="What service do you need?"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <input
                type="text"
                name="where"
                defaultValue="Lekki, Lagos"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                placeholder="Where?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Trending:</span>
            {["Hairdresser near Lekki", "Verified electrician", "Available today", "Chef under ₦50,000"].map(
              (t) => (
                <Link
                  key={t}
                  to="/search"
                  search={{ q: t }}
                  className="rounded-full border border-border bg-card px-3 py-1 transition hover:border-primary/40 hover:text-foreground"
                >
                  {t}
                </Link>
              ),
            )}
          </div>

          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 text-left">
            {[
              { k: providerCount === null ? "—" : `${providerCount}`, v: providerCount === 1 ? "Pro on Ọjà" : "Pros on Ọjà" },
              { k: "8", v: "Service categories" },
              { k: "Lagos", v: "Where we're live" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-border bg-card/80 p-5 text-center backdrop-blur-sm">
                <dt className="text-2xl font-semibold text-foreground sm:text-3xl">{s.k}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: cats }, { data: providers }] = await Promise.all([
        supabase.from("categories").select("id, slug, name, icon").order("sort_order"),
        supabase.from("provider_profiles").select("category_id").eq("published", true),
      ]);
      if (!active) return;
      setCategories(cats ?? []);
      const tally: Record<string, number> = {};
      for (const p of providers ?? []) {
        if (p.category_id) tally[p.category_id] = (tally[p.category_id] ?? 0) + 1;
      }
      setCounts(tally);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Popular categories</h2>
          <p className="mt-3 text-muted-foreground">Hand-picked pros across the services people book most.</p>
        </div>
        <Link to="/search" search={{ q: "" }} className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
          Browse all →
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        {!loading &&
          categories.map(({ id, slug, name, icon }, i) => {
            const Icon = CATEGORY_ICONS[icon] ?? Sparkles;
            const count = counts[id] ?? 0;
            return (
              <Link
                key={slug}
                to="/search"
                search={{ q: name }}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_oklch(0.46_0.13_155/0.35)]"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${CATEGORY_TINTS[i % CATEGORY_TINTS.length]}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {count} {count === 1 ? "pro" : "pros"}
                  </p>
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    Platinum: "bg-charcoal text-background",
    Gold: "bg-gold text-charcoal",
    Silver: "bg-muted text-charcoal",
    Bronze: "bg-orange/20 text-orange",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${map[tier] ?? "bg-secondary text-secondary-foreground"}`}>
      <ShieldCheck className="h-3 w-3" /> {tier}
    </span>
  );
}

function Featured() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("provider_profiles")
        .select(
          "id, business_name, tagline, area, price_from, tier, rating, review_count, cover_image_url, category_id, categories(name)"
        )
        .eq("published", true)
        .order("rating", { ascending: false })
        .limit(4);
      if (!active) return;
      setProviders((data as unknown as ProviderRow[]) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="featured" className="bg-muted/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured professionals</h2>
            <p className="mt-3 text-muted-foreground">Top-rated, background-verified pros near you.</p>
          </div>
          <Link to="/search" search={{ q: "" }} className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all →
          </Link>
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl border border-border bg-card" />
            ))}
          </div>
        )}

        {!loading && providers.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold text-foreground">No pros have joined yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first professional on Ọjà — set up your storefront in minutes.
            </p>
            <Link
              to="/signup"
              className="mt-5 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Join as a pro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!loading && providers.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((p) => (
              <Link
                key={p.id}
                to="/book"
                search={{ providerId: p.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_oklch(0.24_0_240/0.25)]"
              >
                <div className="relative h-52 overflow-hidden bg-muted">
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt={`${p.business_name}, ${p.categories?.name ?? ""}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl font-semibold text-muted-foreground">
                      {p.business_name.slice(0, 1)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  <div className="absolute right-3 top-3">
                    <TierBadge tier={p.tier} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{p.business_name}</p>
                      <p className="truncate text-sm text-muted-foreground">{p.categories?.name ?? p.tagline}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {p.rating > 0 ? p.rating.toFixed(2) : "New"}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {p.area}
                    </span>
                    <span>{p.review_count} reviews</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-semibold text-foreground">
                      from ₦{Number(p.price_from).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                      Book now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type RecentJobRow = {
  id: string;
  service_title: string;
  updated_at: string;
  provider_profiles: { business_name: string; area: string } | null;
};

function RecentJobs() {
  const [jobs, setJobs] = useState<RecentJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("id, service_title, updated_at, provider_profiles(business_name, area)")
        .eq("status", "Completed")
        .order("updated_at", { ascending: false })
        .limit(4);
      if (!active) return;
      setJobs((data as unknown as RecentJobRow[]) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Recently completed jobs</h2>
          <p className="mt-3 text-muted-foreground">
            Real work, verified bookings. Every job on Ọjà is protected by escrow and eligible for review.
          </p>
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="h-[68px] animate-pulse bg-muted/30" />
              ))}
            {!loading && jobs.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">
                No completed jobs yet — this feed fills up as real bookings wrap up.
              </li>
            )}
            {!loading &&
              jobs.map((j) => (
                <li key={j.id} className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{j.service_title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {j.provider_profiles?.business_name ?? "A pro"} · {j.provider_profiles?.area ?? ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(j.updated_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary via-primary to-[oklch(0.36_0.11_155)] p-10 text-primary-foreground shadow-[0_30px_80px_-40px_oklch(0.46_0.13_155/0.6)]">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-orange/25 blur-3xl" />
          <h3 className="text-3xl font-semibold">Instant Match</h3>
          <p className="mt-3 max-w-md text-primary-foreground/85">
            Describe what you need in your own words. We rank the best pros by availability, distance,
            rating and price — matches in seconds.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "I need a barber at home in Lekki, tomorrow 8am",
              "Chef for 6 guests, Nigerian menu, under ₦50,000",
              "Emergency plumber tonight in Yaba",
            ].map((q) => (
              <div
                key={q}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-sm ring-1 ring-white/15 backdrop-blur"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="text-primary-foreground/95">{q}</span>
              </div>
            ))}
          </div>
          <Link
            to="/instant-match"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary shadow-lg transition hover:-translate-y-0.5"
          >
            Try Instant Match <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns: { title: string; links: { label: string; to: string; hash?: boolean }[] }[] = [
    {
      title: "Customers",
      links: [
        { label: "How it works", to: "#how", hash: true },
        { label: "Instant Match", to: "/instant-match" },
        { label: "Search pros", to: "/search" },
      ],
    },
    {
      title: "Professionals",
      links: [
        { label: "Join as a pro", to: "/signup" },
        { label: "Pricing & plans", to: "/plans" },
        { label: "HubPoints wallet", to: "/wallet" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={36} />
          </Link>
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            Ọjà is a marketplace for local African services, built in Lagos. Escrow-protected
            payments and verified pro profiles, still early — help us shape it.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) =>
                l.hash ? (
                  <li key={l.label}>
                    <a href={l.to} className="transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link to={l.to} search={l.to === "/search" ? { q: "" } : undefined} className="transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Ọjà. Built with care in Lagos.</p>
        </div>
      </div>
    </footer>
  );
}
