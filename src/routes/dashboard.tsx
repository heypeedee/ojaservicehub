import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  Heart,
  MapPin,
  MessageSquare,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard · Ọjà" },
      {
        name: "description",
        content:
          "Track your Ọjà bookings, order history, escrow, favourite pros, reviews and tips in one calm, premium dashboard.",
      },
      { property: "og:title", content: "Your dashboard · Ọjà" },
      { property: "og:description", content: "Buyer dashboard for your Ọjà bookings, orders, favourites and tips." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyerDashboard,
});

type OrderStatus = "Confirmed" | "Awaiting pro" | "Completed" | "Cancelled";

type Order = {
  id: string;
  pro: string;
  craft: string;
  when: string;
  area: string;
  amount: number;
  status: OrderStatus;
  image?: string;
  rated?: boolean;
  tipped?: number;
};

type BookingRow = {
  id: string;
  service_title: string;
  amount: number;
  status: string;
  scheduled_at: string | null;
  location: string | null;
  provider_id: string;
  provider_profiles: { business_name: string; area: string; categories: { name: string } | null } | null;
};

function mapBookingStatus(s: string): OrderStatus {
  if (s === "New") return "Awaiting pro";
  if (s === "In progress") return "Confirmed";
  if (s === "Confirmed" || s === "Completed" || s === "Cancelled") return s;
  return "Awaiting pro";
}

const initialFavourites = [
  { id: "f1", name: "Adaeze Okoye", craft: "Bridal Hair", rating: 4.98, image: "https://images.unsplash.com/photo-1595916996826-be9ad7f0aabc?auto=format&fit=crop&w=200&q=80" },
  { id: "f2", name: "Chinedu Bala", craft: "Electrician", rating: 4.93, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80" },
  { id: "f3", name: "Kunle Adisa", craft: "Private Chef", rating: 4.89, image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80" },
  { id: "f4", name: "Zainab Musa", craft: "Tailor", rating: 4.96, image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80" },
];

const spend = [12, 18, 9, 24, 16, 30, 22, 28, 34, 19, 26, 41];
const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function OrderAvatar({ name, image, className }: { name: string; image?: string; className: string }) {
  if (image) return <img src={image} alt="" className={`${className} object-cover`} />;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
  return (
    <div className={`${className} grid shrink-0 place-items-center bg-brand-soft font-semibold text-brand`}>
      {initials}
    </div>
  );
}

function BuyerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favourites, setFavourites] = useState(initialFavourites);
  const [tipTarget, setTipTarget] = useState<Order | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const name =
        (session?.user?.user_metadata?.display_name as string | undefined) ||
        (session?.user?.user_metadata?.full_name as string | undefined) ||
        "";
      setFirstName(name.split(" ")[0] || "");

      const { data: rows } = await supabase
        .from("bookings")
        .select(
          "id, service_title, amount, status, scheduled_at, location, provider_id, provider_profiles(business_name, area, categories(name))"
        )
        .eq("customer_id", uid)
        .order("created_at", { ascending: false });
      if (!active) return;

      setOrders(
        ((rows as unknown as BookingRow[]) ?? []).map((b) => ({
          id: b.id,
          pro: b.provider_profiles?.business_name ?? "Provider",
          craft: b.provider_profiles?.categories?.name ?? b.service_title,
          when: b.scheduled_at
            ? new Date(b.scheduled_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
            : "—",
          area: b.location || b.provider_profiles?.area || "—",
          amount: Number(b.amount),
          status: mapBookingStatus(b.status),
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const upcoming = orders.filter((o) => o.status === "Confirmed" || o.status === "Awaiting pro");
  const completed = orders.filter((o) => o.status === "Completed");
  const totalSpend = orders.filter((o) => o.status === "Completed").reduce((s, o) => s + o.amount, 0);
  const escrowTotal = upcoming.reduce((s, o) => s + o.amount, 0);
  const tipsGiven = orders.reduce((s, o) => s + (o.tipped ?? 0), 0);

  const applyTip = (id: string, amount: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, tipped: (o.tipped ?? 0) + amount } : o)));
    setTipTarget(null);
  };
  const applyReview = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, rated: true } : o)));
    setReviewTarget(null);
  };
  const toggleFavourite = (id: string) => {
    setFavourites((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading your dashboard…</div>;
  }

  if (!userId) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-semibold text-foreground">Sign in to view your dashboard.</p>
          <Link to="/signup" className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Sign in / create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <TopBar query={query} setQuery={setQuery} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header name={firstName} />
        <KpiRow
          bookings={orders.length}
          totalSpend={totalSpend}
          savedPros={favourites.length}
          escrowTotal={escrowTotal}
          tips={tipsGiven}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <UpcomingBookings items={upcoming} />
            <SpendChart totalSpend={totalSpend} />
            <OrderHistory
              orders={orders}
              onTip={setTipTarget}
              onReview={setReviewTarget}
            />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <EscrowCard items={upcoming} total={escrowTotal} />
            <FavouritesCard items={favourites} onRemove={toggleFavourite} />
            <TipsSummary total={tipsGiven} count={orders.filter((o) => o.tipped).length} />
          </div>
        </div>

        <ReviewsFromYou completed={completed} onReview={setReviewTarget} />
      </div>

      {tipTarget && (
        <TipModal order={tipTarget} onClose={() => setTipTarget(null)} onTip={applyTip} />
      )}
      {reviewTarget && (
        <ReviewModal order={reviewTarget} onClose={() => setReviewTarget(null)} onSubmit={applyReview} />
      )}
    </div>
  );
}

function TopBar({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <OjaLogo size={32} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/dashboard" className="text-foreground">Overview</Link>
          <Link to="/messages" className="hover:text-foreground">Messages</Link>
          <Link to="/notifications" className="hover:text-foreground">Notifications</Link>
          <Link to="/pro/dashboard" className="hover:text-foreground">Business</Link>
        </nav>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = encodeURIComponent(query.trim());
            if (q) window.location.href = `/search?q=${q}`;
          }}
          className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-background pl-3 pr-1 py-1 w-80"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hair, chef, electrician…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            Search
          </button>
        </form>
        <Link
          to="/search"
          search={{ q: "" }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 lg:hidden"
        >
          <Search className="h-4 w-4" /> Find
        </Link>
      </div>
    </div>
  );
}

function Header({ name }: { name: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Buyer dashboard
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back{name ? `, ${name}` : ""}.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover pros, track every booking, reward great work, and rebook your favourites.
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
          to="/search"
          search={{ q: "" }}
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
  tips,
}: {
  bookings: number;
  totalSpend: number;
  savedPros: number;
  escrowTotal: number;
  tips: number;
}) {
  const cards = [
    { label: "Orders (all time)", value: bookings, sub: "3 upcoming", icon: CalendarDays, tint: "bg-brand-soft text-brand" },
    { label: "Total spend", value: formatNaira(totalSpend), sub: "Across completed jobs", icon: Receipt, tint: "bg-orange/10 text-orange" },
    { label: "In escrow now", value: formatNaira(escrowTotal), sub: "Released on completion", icon: ShieldCheck, tint: "bg-gold/15 text-charcoal" },
    { label: "Tips given", value: formatNaira(tips), sub: "Rewarding great work", icon: Gift, tint: "bg-brand-soft text-brand" },
    { label: "Saved pros", value: savedPros, sub: "Ready to rebook", icon: Heart, tint: "bg-orange/10 text-orange" },
  ];
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

function UpcomingBookings({ items }: { items: Order[] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Upcoming bookings</h2>
          <p className="text-xs text-muted-foreground">Your next confirmed and pending jobs.</p>
        </div>
        <Link to="/search" search={{ q: "" }} className="text-xs font-semibold text-primary hover:underline">
          Book another →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-muted/50 p-6 text-center text-xs text-muted-foreground">
          No upcoming bookings — <Link to="/search" search={{ q: "" }} className="text-primary underline">find a pro</Link>.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40"
            >
              <OrderAvatar name={b.pro} image={b.image} className="h-14 w-14 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{b.pro}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      b.status === "Confirmed" ? "bg-brand-soft text-brand" : "bg-gold/20 text-charcoal"
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
                <span className="text-sm font-semibold">{formatNaira(b.amount)}</span>
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
      )}
    </section>
  );
}

function SpendChart({ totalSpend }: { totalSpend: number }) {
  const max = Math.max(...spend);
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Spend on Ọjà</h2>
          <p className="text-xs text-muted-foreground">Last 12 months, in thousands (₦).</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{formatNaira(totalSpend)}</p>
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

function OrderHistory({
  orders,
  onTip,
  onReview,
}: {
  orders: Order[];
  onTip: (o: Order) => void;
  onReview: (o: Order) => void;
}) {
  const [tab, setTab] = useState<"all" | "completed" | "upcoming" | "cancelled">("all");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const byTab = orders.filter((o) => {
      if (tab === "all") return true;
      if (tab === "completed") return o.status === "Completed";
      if (tab === "cancelled") return o.status === "Cancelled";
      return o.status === "Confirmed" || o.status === "Awaiting pro";
    });
    if (!q.trim()) return byTab;
    const t = q.toLowerCase();
    return byTab.filter((o) => o.pro.toLowerCase().includes(t) || o.craft.toLowerCase().includes(t));
  }, [orders, tab, q]);

  const tabs = [
    { key: "all", label: `All (${orders.length})` },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ] as const;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Order history</h2>
          <p className="text-xs text-muted-foreground">Every job you've booked on Ọjà. Tip and review completed jobs.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders…"
            className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs font-semibold transition ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-border">
        {filtered.length === 0 && (
          <li className="py-8 text-center text-xs text-muted-foreground">No orders here yet.</li>
        )}
        {filtered.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-4 py-4">
            <OrderAvatar name={o.pro} image={o.image} className="h-12 w-12 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{o.pro}</p>
                <StatusPill status={o.status} />
                {o.tipped ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold text-orange">
                    <Gift className="h-3 w-3" /> Tipped {formatNaira(o.tipped)}
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">{o.craft} · {o.when} · {o.area}</p>
            </div>
            <span className="text-sm font-semibold">{formatNaira(o.amount)}</span>
            {o.status === "Completed" && (
              <div className="flex flex-wrap items-center gap-2">
                {o.rated ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    <Star className="h-3 w-3 fill-gold text-gold" /> Reviewed
                  </span>
                ) : (
                  <button
                    onClick={() => onReview(o)}
                    className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Leave review
                  </button>
                )}
                <button
                  onClick={() => onTip(o)}
                  className="inline-flex items-center gap-1 rounded-full border border-orange/40 bg-orange/10 px-3 py-1.5 text-[10px] font-semibold text-orange hover:bg-orange/15"
                >
                  <Gift className="h-3 w-3" /> {o.tipped ? "Add tip" : "Tip pro"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Confirmed: "bg-brand-soft text-brand",
    "Awaiting pro": "bg-gold/20 text-charcoal",
    Completed: "bg-muted text-foreground",
    Cancelled: "bg-red-500/10 text-red-600",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status]}`}>
      {status}
    </span>
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

function EscrowCard({ items, total }: { items: Order[]; total: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-[oklch(0.36_0.11_155)] p-6 text-primary-foreground shadow-[0_24px_60px_-30px_oklch(0.46_0.13_155/0.55)]">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
        <ShieldCheck className="h-4 w-4" /> Escrow
      </div>
      <p className="mt-3 text-3xl font-semibold">{formatNaira(total)}</p>
      <p className="text-xs opacity-85">Held safely until your pros deliver.</p>
      <ul className="mt-4 space-y-2">
        {items.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15">
            <div className="min-w-0">
              <p className="truncate font-semibold">Held for {e.pro}</p>
              <p className="opacity-80">Releases on completion</p>
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

function FavouritesCard({
  items,
  onRemove,
}: {
  items: { id: string; name: string; craft: string; rating: number; image: string }[];
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your favourites</h2>
        <Heart className="h-4 w-4 text-orange" />
      </div>
      <p className="text-xs text-muted-foreground">Rebook the pros you love in one tap.</p>
      {items.length === 0 && (
        <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-center text-xs text-muted-foreground">
          No saved pros yet.
        </p>
      )}
      <ul className="mt-4 space-y-2">
        {items.map((f) => (
          <li
            key={f.id}
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
            <Link
              to="/search"
              search={{ q: "" }}
              className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground"
            >
              Book
            </Link>
            <button
              onClick={() => onRemove(f.id)}
              aria-label={`Remove ${f.name}`}
              className="text-muted-foreground transition hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TipsSummary({ total, count }: { total: number; count: number }) {
  return (
    <section className="rounded-3xl border border-dashed border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Coins className="h-4 w-4 text-primary" /> HubPoints & tipping
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Earn 1 HubPoint per ₦1,000 spent. Tips go instantly to your pro — no platform cut.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-brand-soft px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">Points</p>
          <p className="text-lg font-semibold text-primary">187 pts</p>
        </div>
        <div className="rounded-2xl bg-orange/10 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-orange">Tips given</p>
          <p className="text-lg font-semibold text-orange">{formatNaira(total)}</p>
          <p className="text-[10px] text-muted-foreground">{count} pros rewarded</p>
        </div>
      </div>
    </section>
  );
}

function ReviewsFromYou({
  completed,
  onReview,
}: {
  completed: Order[];
  onReview: (o: Order) => void;
}) {
  const pending = completed.filter((o) => !o.rated);
  if (pending.length === 0) return null;
  return (
    <section className="mt-6 rounded-3xl border border-primary/20 bg-brand-soft/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand">You have {pending.length} pending review{pending.length > 1 ? "s" : ""}</h2>
          <p className="text-xs text-muted-foreground">Only verified bookings can leave reviews — help other buyers pick great pros.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pending.map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-2xl bg-background p-3">
            <OrderAvatar name={o.pro} image={o.image} className="h-10 w-10 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{o.pro}</p>
              <p className="truncate text-[11px] text-muted-foreground">{o.craft}</p>
            </div>
            <button
              onClick={() => onReview(o)}
              className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function TipModal({
  order,
  onClose,
  onTip,
}: {
  order: Order;
  onClose: () => void;
  onTip: (id: string, amount: number) => void;
}) {
  const presets = [500, 1000, 2000, 5000];
  const [custom, setCustom] = useState("");
  const [selected, setSelected] = useState<number | null>(1000);
  const amount = selected ?? Number(custom) ?? 0;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-3 py-1 text-[11px] font-semibold text-orange">
              <Gift className="h-3.5 w-3.5" /> Tip your pro
            </div>
            <h3 className="mt-3 text-xl font-semibold">Send {order.pro} a thank-you</h3>
            <p className="mt-1 text-xs text-muted-foreground">{order.craft} · Tips transfer instantly, 100% to the pro.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelected(p);
                setCustom("");
              }}
              className={`rounded-2xl border px-2 py-3 text-sm font-semibold transition ${
                selected === p
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-border bg-card hover:border-orange/40"
              }`}
            >
              ₦{p.toLocaleString()}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold text-muted-foreground">Custom amount (₦)</label>
        <input
          type="number"
          min={100}
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setSelected(null);
          }}
          placeholder="e.g. 1500"
          className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-orange"
        />

        <button
          disabled={!amount || amount < 100}
          onClick={() => onTip(order.id, amount)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-orange px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Gift className="h-4 w-4" /> Send {amount ? formatNaira(amount) : "tip"}
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Tips are debited from your wallet or default payment method.
        </p>
      </div>
    </div>
  );
}

function ReviewModal({
  order,
  onClose,
  onSubmit,
}: {
  order: Order;
  onClose: () => void;
  onSubmit: (id: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
              <Star className="h-3.5 w-3.5" /> Leave a review
            </div>
            <h3 className="mt-3 text-xl font-semibold">Rate {order.pro}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{order.craft}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star
                className={`h-8 w-8 transition ${
                  n <= rating ? "fill-gold text-gold" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="What did they do well? Anything to improve?"
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <button
          onClick={() => onSubmit(order.id)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          Post review
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Only verified bookings can leave reviews on Ọjà.
        </p>
      </div>
    </div>
  );
}
