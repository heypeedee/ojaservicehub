import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";

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

const categories = [
  { name: "Hair & Beauty", icon: Scissors, count: "2,340 pros", tint: "bg-brand-soft text-brand" },
  { name: "Home Repair", icon: Wrench, count: "1,812 pros", tint: "bg-orange/10 text-orange" },
  { name: "Cleaning", icon: Sparkles, count: "980 pros", tint: "bg-brand-soft text-brand" },
  { name: "Electrical", icon: Zap, count: "674 pros", tint: "bg-gold/15 text-charcoal" },
  { name: "Photography", icon: Camera, count: "512 pros", tint: "bg-brand-soft text-brand" },
  { name: "Private Chef", icon: ChefHat, count: "301 pros", tint: "bg-orange/10 text-orange" },
  { name: "Tailoring", icon: Paintbrush, count: "428 pros", tint: "bg-gold/15 text-charcoal" },
  { name: "Auto Care", icon: Car, count: "236 pros", tint: "bg-brand-soft text-brand" },
];

// Authentic Nigerian/African professional imagery (Unsplash)
const featured = [
  {
    name: "Adaeze Okoye",
    craft: "Bridal Hair & Makeup",
    area: "Lekki Phase 1",
    rating: 4.98,
    reviews: 214,
    price: "from ₦45,000",
    tier: "Platinum",
    image:
      "https://images.unsplash.com/photo-1595916996826-be9ad7f0aabc?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chinedu Bala",
    craft: "Certified Electrician",
    area: "Yaba",
    rating: 4.93,
    reviews: 187,
    price: "from ₦8,000",
    tier: "Gold",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kunle Adisa",
    craft: "Private Chef · Nigerian & Continental",
    area: "Victoria Island",
    rating: 4.89,
    reviews: 96,
    price: "from ₦25,000",
    tier: "Gold",
    image:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Zainab Musa",
    craft: "Tailor · Aso-Oke & Ready-to-Wear",
    area: "Ikeja GRA",
    rating: 4.96,
    reviews: 342,
    price: "from ₦15,000",
    tier: "Platinum",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
  },
];

const recentJobs = [
  { pro: "Tolu A.", job: "Repaired inverter & rewired sockets", area: "Surulere", when: "2h ago" },
  { pro: "Grace N.", job: "Bridal makeover for 4 guests", area: "Ajah", when: "5h ago" },
  { pro: "Femi O.", job: "Deep clean 3-bedroom apartment", area: "Ikoyi", when: "Yesterday" },
  { pro: "Ibrahim S.", job: "AC servicing (2 units)", area: "Magodo", when: "Yesterday" },
];

const testimonials = [
  {
    quote:
      "I described what I needed and got matched with three verified pros in under a minute. Booked, paid, done.",
    name: "Amaka E.",
    role: "Marketing Lead, Lagos",
  },
  {
    quote:
      "The escrow gave me real peace of mind. My electrician was professional and the money only released after the job.",
    name: "David O.",
    role: "Homeowner, Abuja",
  },
  {
    quote:
      "As a stylist, Ọjà tripled my bookings in three months. The dashboard tells me exactly where to improve.",
    name: "Bola A.",
    role: "Provider · Gold tier",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Categories />
      <Featured />
      <RecentJobs />
      <Testimonials />
      <DownloadApp />
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
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#app" className="transition-colors hover:text-foreground">Get the app</a>
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
            Join as a pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
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
              window.location.href = `/search?q=${encodeURIComponent(full)}`;
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
              { k: "12k+", v: "Verified pros" },
              { k: "98%", v: "Job satisfaction" },
              { k: "< 60s", v: "Instant Match" },
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
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Popular categories</h2>
          <p className="mt-3 text-muted-foreground">Hand-picked pros across the services people book most.</p>
        </div>
        <Link to="/search" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
          Browse all →
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {categories.map(({ name, icon: Icon, count, tint }) => (
          <Link
            key={name}
            to="/search"
            search={{ q: name }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_oklch(0.46_0.13_155/0.35)]"
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${tint}`}>
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{count}</p>
            </div>
          </Link>
        ))}
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
  return (
    <section id="featured" className="bg-muted/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured professionals</h2>
            <p className="mt-3 text-muted-foreground">Top-rated, background-verified pros near you.</p>
          </div>
          <Link to="/search" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.name}
              to="/book"
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_oklch(0.24_0_240/0.25)]"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={p.image}
                  alt={`${p.name}, ${p.craft}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                <div className="absolute right-3 top-3">
                  <TierBadge tier={p.tier} />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{p.craft}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {p.rating}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {p.area}
                  </span>
                  <span>{p.reviews} reviews</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-semibold text-foreground">{p.price}</span>
                  <span className="text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">Book now →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentJobs() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Recently completed jobs</h2>
          <p className="mt-3 text-muted-foreground">
            Real work, verified bookings. Every job on Ọjà is protected by escrow and eligible for review.
          </p>
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {recentJobs.map((j) => (
              <li key={j.pro + j.job} className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{j.job}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {j.pro} · {j.area}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{j.when}</span>
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

function Testimonials() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Loved by customers and pros</h2>
          <p className="mt-3 text-muted-foreground">
            A trusted marketplace built on verified identities and honest reviews.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Quote className="h-7 w-7 text-primary/70" />
              <blockquote className="mt-5 text-[15px] leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadApp() {
  return (
    <section id="app" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 sm:p-14">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            background:
              "radial-gradient(50% 60% at 82% 25%, oklch(0.94 0.12 82 / 0.55), transparent 60%), radial-gradient(50% 60% at 8% 82%, oklch(0.92 0.1 155 / 0.55), transparent 60%)",
          }}
        />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Get the app</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Ọjà in your pocket.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Book, chat, pay and track jobs on the go. Get instant push updates the moment a pro
              accepts your booking.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3.5 text-background transition hover:opacity-90"
              >
                <Apple className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] opacity-70">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3.5 text-background transition hover:opacity-90"
              >
                <Smartphone className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] opacity-70">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm justify-center">
            <div className="relative h-[440px] w-[230px] rounded-[2.75rem] border-[10px] border-foreground bg-background shadow-2xl">
              <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/60" />
              <div className="flex h-full flex-col gap-3 p-4 pt-9">
                <div className="rounded-2xl bg-primary p-3.5 text-primary-foreground">
                  <p className="text-[10px] opacity-80">Instant Match</p>
                  <p className="text-sm font-semibold">3 pros found nearby</p>
                </div>
                {featured.slice(0, 3).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 rounded-2xl border border-border p-2"
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold">{p.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{p.area}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      {p.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={36} />
          </Link>
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            Ọjà is the trusted marketplace for local African services. Verified pros, escrow
            payments, honest reviews — calm by design.
          </p>
        </div>
        {[
          { title: "Customers", links: ["How it works", "Instant Match", "Safety & escrow", "Support"] },
          { title: "Professionals", links: ["Join as a pro", "Pricing & plans", "HubPoints wallet", "Success stories"] },
          { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="transition-colors hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Ọjà. Built with care in Lagos.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
