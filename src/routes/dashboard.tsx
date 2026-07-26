import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  Heart,
  MapPin,
  MessageSquare,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard · Ọjà" },
      {
        name: "description",
        content:
          "Track your Ọjà bookings, escrow, favourite pros, messages and spend in one calm, premium dashboard.",
      },
      { property: "og:title", content: "Your dashboard · Ọjà" },
      { property: "og:description", content: "Buyer dashboard for your Ọjà bookings and escrow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyerDashboard,
});

const upcoming = [
  {
    id: "b1",
    pro: "Adaeze Okoye",
    craft: "Bridal Hair & Makeup",
    when: "Sat 28 Nov · 9:00am",
    area: "Lekki Phase 1",
    price: "₦45,000",
    status: "Confirmed",
    image:
      "https://images.unsplash.com/photo-1595916996826-be9ad7f0aabc?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "b2",
    pro: "Chinedu Bala",
    craft: "Electrical inspection",
    when: "Tue 1 Dec · 4:30pm",
    area: "Yaba",
    price: "₦12,500",
    status: "Awaiting pro",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80",
  },
];

const escrow = [
  { id: "e1", label: "Held for Adaeze O.", amount: 45000, releasesIn: "on completion" },
  { id: "e2", label: "Held for Chinedu B.", amount: 12500, releasesIn: "after inspection" },
];

const recent = [
  { id: "r1", pro: "Zainab Musa", job: "Aso-Oke blouse alterations", when: "3 days ago", amount: 8500, rated: true },
  { id: "r2", pro: "Kunle Adisa", job: "Private chef · 4 guests", when: "1 week ago", amount: 22000, rated: false },
  { id: "r3", pro: "Femi O.", job: "Deep clean 3-bedroom flat", when: "2 weeks ago", amount: 18000, rated: true },
];

const favourites = [
  { name: "Adaeze Okoye", craft: "Bridal Hair", rating: 4.98, image: "https://images.unsplash.com/photo-1595916996826-be9ad7f0aabc?auto=format&fit=crop&w=200&q=80" },
  { name: "Chinedu Bala", craft: "Electrician", rating: 4.93, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80" },
  { name: "Kunle Adisa", craft: "Private Chef", rating: 4.89, image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80" },
  { name: "Zainab Musa", craft: "Tailor", rating: 4.96, image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80" },
];

const spend = [12, 18, 9, 24, 16, 30, 22, 28, 34, 19, 26, 41];
const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function BuyerDashboard() {
  const totalSpend = 186500;
  const bookings = 14;
  const savedPros = favourites.length;
  const escrowTotal = escrow.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-muted/40">
      <TopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <KpiRow bookings={bookings} totalSpend={totalSpend} savedPros={savedPros} escrowTotal={escrowTotal} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <UpcomingBookings />
            <SpendChart />
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <EscrowCard />
            <FavouritesCard />
            <SafetyCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <OjaLogo size={32} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/dashboard" className="text-foreground">Overview</Link>
          <Link to="/messages" className="hover:text-foreground">Messages</Link>
          <Link to="/notifications" className="hover:text-foreground">Notifications</Link>
          <Link to="/pro/dashboard" className="hover:text-foreground">Business dashboard</Link>
        </nav>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Search className="h-4 w-4" /> Find a pro
        </Link>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Buyer dashboard
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, Amaka.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything on your Ọjà — upcoming bookings, escrow, favourites and spend at a glance.
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to="/instant-match"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40"
        >
          <Sparkles className="h-4 w-4 text-primary" /> Instant Match
        </Link>
        <Link
          to="/book"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Book a service <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function KpiRow({
  bookings,
  totalSpend,
  savedPros,
  escrowTotal,
}: {
  bookings: number;
  totalSpend: number;
  savedPros: number;
  escrowTotal: number;
}) {
  const cards = [
    { label: "Bookings this year", value: bookings, sub: "+3 vs last year", icon: CalendarDays, tint: "bg-brand-soft text-brand" },
    { label: "Total spend", value: formatNaira(totalSpend), sub: "Across 8 services", icon: Receipt, tint: "bg-orange/10 text-orange" },
    { label: "In escrow now", value: formatNaira(escrowTotal), sub: "Released on completion", icon: ShieldCheck, tint: "bg-gold/15 text-charcoal" },
    { label: "Saved pros", value: savedPros, sub: "Ready to rebook", icon: Heart, tint: "bg-brand-soft text-brand" },
  ];
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${c.tint}`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-[11px] font-medium text-brand">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

function UpcomingBookings() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Upcoming bookings</h2>
          <p className="text-xs text-muted-foreground">Your next confirmed and pending jobs.</p>
        </div>
        <Link to="/book" className="text-xs font-semibold text-primary hover:underline">
          Book another →
        </Link>
      </div>
      <ul className="mt-5 space-y-3">
        {upcoming.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40"
          >
            <img src={b.image} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{b.pro}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.status === "Confirmed"
                      ? "bg-brand-soft text-brand"
                      : "bg-gold/20 text-charcoal"
                  }`}
                >
                  {b.status === "Confirmed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {b.status}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{b.craft}</p>
              <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> {b.when}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {b.area}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{b.price}</span>
              <Link
                to="/messages"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground hover:border-primary/40"
              >
                Message
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpendChart() {
  const max = Math.max(...spend);
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Spend on Ọjà</h2>
          <p className="text-xs text-muted-foreground">Last 12 months, in thousands (₦).</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{formatNaira(279000)}</p>
          <p className="text-[11px] text-brand">+18% vs last year</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-12 items-end gap-2 h-40">
        {spend.map((v, i) => (
          <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary to-[oklch(0.62_0.15_155)] transition-all"
              style={{ height: `${(v / max) * 100}%` }}
              title={`₦${v}k`}
            />
            <span className="text-[10px] text-muted-foreground">{monthLabels[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivity() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="text-xs text-muted-foreground">Completed jobs — leave a review to help other buyers.</p>
        </div>
      </div>
      <ul className="mt-5 divide-y divide-border">
        {recent.map((r) => (
          <li key={r.id} className="flex items-center gap-4 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.job}</p>
              <p className="text-[11px] text-muted-foreground">
                {r.pro} · {r.when}
              </p>
            </div>
            <span className="text-sm font-semibold">{formatNaira(r.amount)}</span>
            {r.rated ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" /> Reviewed
              </span>
            ) : (
              <button className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                Leave review
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickActions() {
  const items = [
    { label: "Find a pro", to: "/search", icon: Search, tint: "bg-brand-soft text-brand" },
    { label: "Messages", to: "/messages", icon: MessageSquare, tint: "bg-orange/10 text-orange" },
    { label: "Wallet", to: "/wallet", icon: Wallet, tint: "bg-gold/15 text-charcoal" },
    { label: "Instant Match", to: "/instant-match", icon: Sparkles, tint: "bg-brand-soft text-brand" },
  ] as const;
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Quick actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.label}
              to={it.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            >
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${it.tint}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-semibold">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function EscrowCard() {
  const total = escrow.reduce((s, e) => s + e.amount, 0);
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-[oklch(0.36_0.11_155)] p-6 text-primary-foreground shadow-[0_24px_60px_-30px_oklch(0.46_0.13_155/0.55)]">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
        <ShieldCheck className="h-4 w-4" /> Escrow
      </div>
      <p className="mt-3 text-3xl font-semibold">{formatNaira(total)}</p>
      <p className="text-xs opacity-85">Held safely until your pros deliver.</p>
      <ul className="mt-4 space-y-2">
        {escrow.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15">
            <div className="min-w-0">
              <p className="truncate font-semibold">{e.label}</p>
              <p className="opacity-80">Releases {e.releasesIn}</p>
            </div>
            <span className="font-semibold">{formatNaira(e.amount)}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/wallet"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-xs font-semibold text-primary shadow-lg hover:-translate-y-0.5"
      >
        Open wallet <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

function FavouritesCard() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your favourites</h2>
        <Heart className="h-4 w-4 text-orange" />
      </div>
      <p className="text-xs text-muted-foreground">Rebook the pros you love in one tap.</p>
      <ul className="mt-4 space-y-2">
        {favourites.map((f) => (
          <li
            key={f.name}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2.5 transition hover:border-primary/40"
          >
            <img src={f.image} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{f.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{f.craft}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              <Star className="h-3 w-3 fill-gold text-gold" /> {f.rating}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SafetyCard() {
  return (
    <section className="rounded-3xl border border-dashed border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Coins className="h-4 w-4 text-primary" /> HubPoints
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Earn 1 HubPoint per ₦1,000 spent. Redeem for booking credit or gift them to a friend.
      </p>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-soft px-4 py-3">
        <span className="text-xs font-semibold text-brand">Balance</span>
        <span className="text-lg font-semibold text-primary">187 pts</span>
      </div>
    </section>
  );
}
