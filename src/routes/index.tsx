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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceHub — Find trusted professionals around you" },
      {
        name: "description",
        content:
          "Book verified hairdressers, electricians, chefs, cleaners and more in your neighborhood. Escrow-protected payments, real reviews, instant match.",
      },
      { property: "og:title", content: "ServiceHub — Find trusted professionals around you" },
      {
        property: "og:description",
        content:
          "Verified local pros, escrow payments, and Instant Match. Find help in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const categories = [
  { name: "Hair & Beauty", icon: Scissors, count: "2,340 pros" },
  { name: "Home Repair", icon: Wrench, count: "1,812 pros" },
  { name: "Cleaning", icon: Sparkles, count: "980 pros" },
  { name: "Electrical", icon: Zap, count: "674 pros" },
  { name: "Photography", icon: Camera, count: "512 pros" },
  { name: "Private Chef", icon: ChefHat, count: "301 pros" },
  { name: "Painting", icon: Paintbrush, count: "428 pros" },
  { name: "Auto Care", icon: Car, count: "236 pros" },
];

const featured = [
  {
    name: "Adaeze Okoye",
    craft: "Bridal Hair & Makeup",
    area: "Lekki Phase 1",
    rating: 4.98,
    reviews: 214,
    price: "from ₦45,000",
    tier: "Platinum",
    initials: "AO",
    tone: "from-rose-100 to-amber-100",
  },
  {
    name: "Chinedu Bala",
    craft: "Certified Electrician",
    area: "Yaba",
    rating: 4.93,
    reviews: 187,
    price: "from ₦8,000",
    tier: "Gold",
    initials: "CB",
    tone: "from-teal-100 to-cyan-100",
  },
  {
    name: "Kunle Adisa",
    craft: "Private Chef · Nigerian & Continental",
    area: "Victoria Island",
    rating: 4.89,
    reviews: 96,
    price: "from ₦25,000",
    tier: "Gold",
    initials: "KA",
    tone: "from-amber-100 to-orange-100",
  },
  {
    name: "Zainab Musa",
    craft: "Deep Clean Specialist",
    area: "Ikeja GRA",
    rating: 4.96,
    reviews: 342,
    price: "from ₦15,000",
    tier: "Platinum",
    initials: "ZM",
    tone: "from-emerald-100 to-teal-100",
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
      "As a stylist, ServiceHub tripled my bookings in three months. The dashboard tells me exactly where to improve.",
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-sm font-bold">SH</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">ServiceHub</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#categories" className="hover:text-foreground">Explore</a>
          <a href="#featured" className="hover:text-foreground">Professionals</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#app" className="hover:text-foreground">Get the app</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex">
            Sign in
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
            Join as a pro
            <ArrowRight className="h-4 w-4" />
          </button>
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
            "radial-gradient(80% 60% at 15% 10%, oklch(0.95 0.05 190 / 0.9), transparent 60%), radial-gradient(60% 50% at 90% 20%, oklch(0.94 0.08 75 / 0.7), transparent 60%), linear-gradient(180deg, oklch(0.99 0.005 95) 0%, oklch(0.995 0.005 95) 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Escrow-protected payments · Verified pros
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Find trusted professionals <span className="text-primary">around you.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            From bridal stylists to electricians and private chefs — book verified experts in your
            neighborhood, in minutes.
          </p>

          <form
            className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 sm:flex-row sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="What service do you need?"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                defaultValue="Lekki, Lagos"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                placeholder="Where?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Trending:</span>
            {["Hairdresser near Lekki", "Verified electrician", "Available today", "Chef under ₦50,000"].map(
              (t) => (
                <a
                  key={t}
                  href="#"
                  className="rounded-full border border-border bg-card px-3 py-1 hover:border-primary/40 hover:text-foreground"
                >
                  {t}
                </a>
              ),
            )}
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 text-left">
            {[
              { k: "12k+", v: "Verified pros" },
              { k: "98%", v: "Job satisfaction" },
              { k: "< 60s", v: "Instant Match" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                <dt className="text-2xl font-semibold text-foreground">{s.k}</dt>
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
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Popular categories</h2>
          <p className="mt-2 text-muted-foreground">Hand-picked pros across the services people book most.</p>
        </div>
        <a href="#" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
          Browse all →
        </a>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {categories.map(({ name, icon: Icon, count }) => (
          <a
            key={name}
            href="#"
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{count}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    Platinum: "bg-slate-900 text-white",
    Gold: "bg-amber-500 text-amber-950",
    Silver: "bg-slate-200 text-slate-800",
    Bronze: "bg-orange-200 text-orange-900",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[tier] ?? "bg-secondary text-secondary-foreground"}`}>
      <ShieldCheck className="h-3 w-3" /> {tier}
    </span>
  );
}

function Featured() {
  return (
    <section id="featured" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Featured professionals</h2>
            <p className="mt-2 text-muted-foreground">Top-rated, background-verified pros near you.</p>
          </div>
          <a href="#" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all →
          </a>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <a
              key={p.name}
              href="#"
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`relative h-40 bg-gradient-to-br ${p.tone}`}>
                <div className="absolute right-3 top-3">
                  <TierBadge tier={p.tier} />
                </div>
                <div className="absolute -bottom-6 left-4 grid h-14 w-14 place-items-center rounded-2xl border-4 border-card bg-primary text-lg font-semibold text-primary-foreground shadow">
                  {p.initials}
                </div>
              </div>
              <div className="p-4 pt-8">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{p.craft}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {p.rating}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {p.area}
                  </span>
                  <span>{p.reviews} reviews</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold text-foreground">{p.price}</span>
                  <span className="text-xs font-medium text-primary group-hover:underline">Book now →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentJobs() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Recently completed jobs</h2>
          <p className="mt-2 text-muted-foreground">
            Real work, verified bookings. Every job on ServiceHub is protected by escrow and eligible for review.
          </p>
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {recentJobs.map((j) => (
              <li key={j.pro + j.job} className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
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
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/95 to-primary p-8 text-primary-foreground shadow-xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
          <h3 className="text-2xl font-semibold">Instant Match</h3>
          <p className="mt-2 text-primary-foreground/80">
            Describe what you need in your own words. We rank the best pros by availability, distance, rating and
            price — and return matches in seconds.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "I need a barber at home in Lekki, tomorrow 8am",
              "Chef for 6 guests, Nigerian menu, under ₦50,000",
              "Emergency plumber tonight in Yaba",
            ].map((q) => (
              <div
                key={q}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground/90">{q}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
            Try Instant Match <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Loved by customers and pros</h2>
          <p className="mt-2 text-muted-foreground">
            A trusted marketplace built on verified identities and honest reviews.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Quote className="h-6 w-6 text-primary/60" />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
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
    <section id="app" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(50% 60% at 80% 30%, oklch(0.92 0.1 75 / 0.6), transparent 60%), radial-gradient(50% 60% at 10% 80%, oklch(0.9 0.08 190 / 0.6), transparent 60%)",
          }}
        />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Get the app</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              ServiceHub in your pocket.
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Book, chat, pay and track jobs on the go. Get instant push updates when a pro accepts your booking.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-foreground px-5 py-3 text-background transition hover:opacity-90"
              >
                <Apple className="h-6 w-6" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] opacity-70">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl bg-foreground px-5 py-3 text-background transition hover:opacity-90"
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
            <div className="relative h-[420px] w-[220px] rounded-[2.5rem] border-8 border-foreground bg-background shadow-2xl">
              <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/60" />
              <div className="flex h-full flex-col gap-3 p-4 pt-8">
                <div className="rounded-xl bg-primary p-3 text-primary-foreground">
                  <p className="text-[10px] opacity-80">Instant Match</p>
                  <p className="text-sm font-semibold">3 pros found nearby</p>
                </div>
                {featured.slice(0, 3).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 rounded-xl border border-border p-2"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold">{p.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{p.area}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
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
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-sm font-bold">SH</span>
            </div>
            <span className="text-lg font-semibold">ServiceHub</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The trusted marketplace for local services. Verified pros, escrow payments, honest reviews.
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
                  <a href="#" className="hover:text-foreground">
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
          <p>© {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
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
