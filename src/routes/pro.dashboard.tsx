import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Coins,
  Edit3,
  Eye,
  Gift,
  Home,
  LayoutDashboard,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Reply,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pro/dashboard")({
  head: () => ({
    meta: [
      { title: "Business dashboard · Ọjà" },
      {
        name: "description",
        content:
          "Run your Ọjà shop: manage your profile, services, bookings, earnings, HubPoints withdrawals, customer chats and business insights in one dedicated app.",
      },
      { property: "og:title", content: "Business dashboard · Ọjà" },
      { property: "og:description", content: "Dedicated market owner control centre on Ọjà." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProDashboard,
});

type Section =
  | "overview"
  | "profile"
  | "services"
  | "orders"
  | "earnings"
  | "customers"
  | "analytics"
  | "settings";

type Service = {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  active: boolean;
};

type Booking = {
  id: string;
  customer: string;
  service: string;
  when: string;
  amount: number;
  status: "New" | "Confirmed" | "In progress" | "Completed" | "Cancelled";
};

type CustomerMsg = {
  id: string;
  customer: string;
  preview: string;
  when: string;
  unread: boolean;
  avatar: string;
};

type BookingRow = {
  id: string;
  service_title: string;
  amount: number;
  status: string;
  scheduled_at: string | null;
  location: string | null;
  customer_id: string;
  profiles: { display_name: string | null; full_name: string | null } | null;
};

const initialMessages: CustomerMsg[] = [
  { id: "m1", customer: "Amaka N.", preview: "Can we move the trial to 10am?", when: "12m", unread: true, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" },
  { id: "m2", customer: "Tolu B.", preview: "Thanks! Sent the reference photos.", when: "1h", unread: true, avatar: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?auto=format&fit=crop&w=100&q=80" },
  { id: "m3", customer: "Ijeoma R.", preview: "See you tomorrow 🙌", when: "3h", unread: false, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" },
];

const revenueSeries = [180, 210, 165, 240, 220, 280, 260, 310, 340, 300, 355, 410];
const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function ProDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [userId, setUserId] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>("Your shop");
  const [verified, setVerified] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<CustomerMsg[]>(initialMessages);
  const [editService, setEditService] = useState<Service | null>(null);
  const [replyTarget, setReplyTarget] = useState<CustomerMsg | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);

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
        setLoadingData(false);
        return;
      }

      const [{ data: profile }, { data: svcRows }, { data: bookingRows }] = await Promise.all([
        supabase.from("provider_profiles").select("business_name, verified").eq("id", uid).maybeSingle(),
        supabase.from("services").select("*").eq("provider_id", uid).order("created_at"),
        supabase
          .from("bookings")
          .select("id, service_title, amount, status, scheduled_at, location, customer_id, profiles(display_name, full_name)")
          .eq("provider_id", uid)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;

      if (profile) {
        setShopName(profile.business_name);
        setVerified(profile.verified);
      }
      setServices(
        (svcRows ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          category: s.category,
          price: Number(s.price),
          duration: s.duration ?? "—",
          active: s.active,
        }))
      );
      setBookings(
        ((bookingRows as unknown as BookingRow[]) ?? []).map((b) => ({
          id: b.id,
          customer: b.profiles?.display_name || b.profiles?.full_name || "Customer",
          service: b.service_title,
          when: b.scheduled_at ? new Date(b.scheduled_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—",
          amount: Number(b.amount),
          status: b.status as Booking["status"],
        }))
      );
      setLoadingData(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const completedRevenue = bookings.filter((b) => b.status === "Completed").reduce((s, b) => s + b.amount, 0);
  const pendingRevenue = bookings.filter((b) => b.status !== "Completed" && b.status !== "Cancelled").reduce((s, b) => s + b.amount, 0);
  const activeServices = services.filter((s) => s.active).length;
  const unread = messages.filter((m) => m.unread).length;

  async function saveService(s: Service) {
    if (!userId) return;
    const isNew = !services.find((p) => p.id === s.id);
    if (isNew) {
      const { data, error } = await supabase
        .from("services")
        .insert({
          provider_id: userId,
          title: s.title,
          category: s.category,
          price: s.price,
          duration: s.duration,
          active: s.active,
        })
        .select()
        .single();
      if (!error && data) {
        setServices((prev) => [...prev, { id: data.id, title: data.title, category: data.category, price: Number(data.price), duration: data.duration ?? "—", active: data.active }]);
      }
    } else {
      const { error } = await supabase
        .from("services")
        .update({ title: s.title, category: s.category, price: s.price, duration: s.duration, active: s.active })
        .eq("id", s.id)
        .eq("provider_id", userId);
      if (!error) {
        setServices((prev) => prev.map((p) => (p.id === s.id ? s : p)));
      }
    }
    setEditService(null);
  }

  async function deleteService(id: string) {
    if (!userId) return;
    const { error } = await supabase.from("services").delete().eq("id", id).eq("provider_id", userId);
    if (!error) setServices((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleActive(id: string) {
    if (!userId) return;
    const current = services.find((p) => p.id === id);
    if (!current) return;
    const { error } = await supabase
      .from("services")
      .update({ active: !current.active })
      .eq("id", id)
      .eq("provider_id", userId);
    if (!error) setServices((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }

  async function updateBookingStatus(id: string, status: Booking["status"]) {
    if (!userId) return;
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id).eq("provider_id", userId);
    if (!error) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const markRead = (id: string) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));

  if (loadingData) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading your dashboard…</div>;
  }

  if (!userId) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-semibold text-foreground">Sign in to view your business dashboard.</p>
          <Link to="/signup" className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Sign in / create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Topbar unread={unread} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <Sidebar section={section} setSection={setSection} unread={unread} shopName={shopName} verified={verified} />
        <main className="min-w-0">
          {section === "overview" && (
            <Overview
              activeServices={activeServices}
              completedRevenue={completedRevenue}
              pendingRevenue={pendingRevenue}
              bookings={bookings}
              messages={messages}
              onWithdraw={() => setShowWithdraw(true)}
              onSection={setSection}
            />
          )}
          {section === "profile" && <ProfilePanel />}
          {section === "services" && (
            <ServicesPanel
              services={services}
              onEdit={setEditService}
              onDelete={deleteService}
              onToggle={toggleActive}
              onNew={() =>
                setEditService({
                  id: crypto.randomUUID(),
                  title: "",
                  category: "Beauty",
                  price: 0,
                  duration: "1 hr",
                  active: true,
                })
              }
            />
          )}
          {section === "orders" && <OrdersPanel bookings={bookings} onStatus={updateBookingStatus} />}
          {section === "earnings" && (
            <EarningsPanel
              completedRevenue={completedRevenue}
              pendingRevenue={pendingRevenue}
              onWithdraw={() => setShowWithdraw(true)}
            />
          )}
          {section === "customers" && (
            <CustomersPanel messages={messages} onReply={(m) => { markRead(m.id); setReplyTarget(m); }} />
          )}
          {section === "analytics" && <AnalyticsPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>

      {editService && <ServiceEditor service={editService} onClose={() => setEditService(null)} onSave={saveService} />}
      {replyTarget && <ReplyModal message={replyTarget} onClose={() => setReplyTarget(null)} />}
      {showWithdraw && <WithdrawModal available={completedRevenue} onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}

function Topbar({ unread }: { unread: number }) {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <OjaLogo size={32} />
          <span className="hidden text-[11px] font-semibold uppercase tracking-widest text-brand sm:inline">
            Business
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/pro/dashboard" className="text-foreground">Business</Link>
          <Link to="/dashboard" className="hover:text-foreground">Buyer view</Link>
          <Link to="/pro/adaeze" className="hover:text-foreground">Public shop</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/messages"
            className="relative inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Inbox
            {unread > 0 && (
              <span className="ml-1 rounded-full bg-orange px-1.5 text-[9px] font-bold text-white">{unread}</span>
            )}
          </Link>
          <Link
            to="/pro/adaeze"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Eye className="h-3.5 w-3.5" /> View shop
          </Link>
        </div>
      </div>
    </div>
  );
}

const NAV: { key: Section; label: string; icon: typeof Home }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "Business profile", icon: Store },
  { key: "services", label: "Services", icon: Package },
  { key: "orders", label: "Orders & bookings", icon: Briefcase },
  { key: "earnings", label: "Earnings & wallet", icon: Wallet },
  { key: "customers", label: "Customer inbox", icon: MessageSquare },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

function Sidebar({
  section,
  setSection,
  unread,
  shopName,
  verified,
}: {
  section: Section;
  setSection: (s: Section) => void;
  unread: number;
  shopName: string;
  verified: boolean;
}) {
  return (
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-2 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your shop</p>
          <p className="mt-1 truncate text-sm font-semibold">{shopName}</p>
          {verified ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              Not verified yet
            </span>
          )}
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = section === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setSection(n.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{n.label}</span>
                {n.key === "customers" && unread > 0 && (
                  <span className="rounded-full bg-orange px-1.5 text-[9px] font-bold text-white">{unread}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/* ---------- Overview ---------- */

function Overview({
  activeServices,
  completedRevenue,
  pendingRevenue,
  bookings,
  messages,
  onWithdraw,
  onSection,
}: {
  activeServices: number;
  completedRevenue: number;
  pendingRevenue: number;
  bookings: Booking[];
  messages: CustomerMsg[];
  onWithdraw: () => void;
  onSection: (s: Section) => void;
}) {
  const upcoming = bookings.filter((b) => b.status === "Confirmed" || b.status === "New" || b.status === "In progress").slice(0, 4);
  const kpis = [
    { label: "This month revenue", value: formatNaira(completedRevenue), sub: "+18% MoM", icon: TrendingUp, tint: "bg-brand-soft text-brand" },
    { label: "Pending payout", value: formatNaira(pendingRevenue), sub: "Escrow held", icon: Wallet, tint: "bg-orange/10 text-orange" },
    { label: "Active services", value: activeServices, sub: "Live on your shop", icon: Package, tint: "bg-gold/15 text-charcoal" },
    { label: "HubPoints", value: "1,240 pts", sub: "≈ ₦12,400 redeemable", icon: Coins, tint: "bg-brand-soft text-brand" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            <Store className="h-3.5 w-3.5" /> Market owner
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, Adaeze.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's how your shop is performing today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onWithdraw}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Wallet className="h-4 w-4" /> Withdraw
          </button>
          <button
            onClick={() => onSection("services")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New service
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${k.tint}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-[11px] font-medium text-brand">{k.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Revenue · last 12 months</h2>
              <p className="text-xs text-muted-foreground">Completed bookings only, in thousands ₦.</p>
            </div>
            <span className="text-2xl font-semibold">{formatNaira(revenueSeries.reduce((a, b) => a + b, 0) * 1000)}</span>
          </div>
          <div className="mt-6 grid h-48 grid-cols-12 items-end gap-2">
            {revenueSeries.map((v, i) => (
              <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-[oklch(0.62_0.15_155)]"
                  style={{ height: `${(v / Math.max(...revenueSeries)) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming jobs</h2>
            <button onClick={() => onSection("orders")} className="text-xs font-semibold text-primary hover:underline">
              See all →
            </button>
          </div>
          <ul className="mt-4 space-y-2.5">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.service}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{b.customer} · {b.when}</p>
                </div>
                <span className="text-xs font-semibold">{formatNaira(b.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">New messages</h2>
            <p className="text-xs text-muted-foreground">Respond fast — response time affects your search ranking.</p>
          </div>
          <button onClick={() => onSection("customers")} className="text-xs font-semibold text-primary hover:underline">
            Open inbox →
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {messages.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
              <img src={m.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{m.customer}</p>
                  {m.unread && <span className="h-2 w-2 rounded-full bg-orange" />}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{m.preview}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{m.when}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Profile ---------- */

type CategoryOption = { id: string; name: string };

function ProfilePanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [published, setPublished] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: cats } = await supabase.from("categories").select("id, name").order("sort_order");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      setCategoryOptions(cats ?? []);
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: existing } = await supabase
          .from("provider_profiles")
          .select("business_name, tagline, category_id, area, phone, price_from, published")
          .eq("id", uid)
          .maybeSingle();
        if (!active) return;
        if (existing) {
          setName(existing.business_name ?? "");
          setTagline(existing.tagline ?? "");
          setCategoryId(existing.category_id ?? "");
          setArea(existing.area ?? "");
          setPhone(existing.phone ?? "");
          setPriceFrom(existing.price_from ? String(existing.price_from) : "");
          setPublished(existing.published);
        } else if (cats && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(nextPublished?: boolean) {
    if (!userId) {
      setError("You need to be signed in to save a business profile.");
      return;
    }
    if (!name.trim() || !area.trim() || !categoryId) {
      setError("Shop name, category, and service area are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: upsertError } = await supabase.from("provider_profiles").upsert({
      id: userId,
      business_name: name.trim(),
      tagline: tagline.trim() || null,
      category_id: categoryId,
      area: area.trim(),
      phone: phone.trim() || null,
      price_from: priceFrom ? Number(priceFrom) : 0,
      published: nextPublished ?? published,
    });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    if (nextPublished !== undefined) setPublished(nextPublished);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PanelHeader title="Business profile" desc="This is what buyers see on your public shop and search results." />
        <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <PanelHeader title="Business profile" desc="This is what buyers see on your public shop and search results." />
        <section className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-semibold text-foreground">Sign in to set up your shop</p>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an Ọjà account before you can publish a business profile.
          </p>
          <Link
            to="/signup"
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Sign in / create account
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelHeader title="Business profile" desc="This is what buyers see on your public shop and search results." />
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand text-xl font-bold">
            {name.trim().slice(0, 1).toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Status: {published ? <span className="text-brand">Live in search</span> : <span className="text-orange">Draft (not visible yet)</span>}
            </p>
            <p className="text-xs text-muted-foreground">Publish once your details look right.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Shop name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Adaeze O. Bridal Beauty" />
          </Field>
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service area">
            <input value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} placeholder="e.g. Lekki Phase 1" />
          </Field>
          <Field label="Phone / WhatsApp">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+234 800 000 0000" />
          </Field>
          <Field label="Starting price (₦)">
            <input
              type="number"
              min={0}
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className={inputClass}
              placeholder="e.g. 15000"
            />
          </Field>
          <Field label="Tagline" hint="Shown under your shop name.">
            <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={3} className={inputClass} />
          </Field>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {saved && <span className="text-xs text-brand">Saved ✓</span>}
          <button
            disabled={saving}
            onClick={() => saveProfile()}
            className="rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            disabled={saving}
            onClick={() => saveProfile(!published)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {published ? "Unpublish" : "Publish to search"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-brand-soft/40 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand">
          <ShieldCheck className="h-4 w-4" /> Verification status
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ID and address verification aren't wired up yet — this section is still a placeholder.
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          <VerifyItem label="Live selfie" done={false} />
          <VerifyItem label="Government ID (NIN)" done={false} />
          <VerifyItem label="Proof of address" done={false} />
          <VerifyItem label="Business bank account" done={false} />
        </div>
      </section>
    </div>
  );
}

function VerifyItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-2.5">
      <span className="text-sm">{label}</span>
      {done ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      ) : (
        <button className="rounded-full bg-orange px-3 py-1 text-[11px] font-semibold text-white">Upload</button>
      )}
    </div>
  );
}

/* ---------- Services ---------- */

function ServicesPanel({
  services,
  onEdit,
  onDelete,
  onToggle,
  onNew,
}: {
  services: Service[];
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Services"
        desc="Upload, edit and price the services you offer."
        action={
          <button onClick={onNew} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> New service
          </button>
        }
      />
      <div className="grid gap-3">
        {services.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{s.title || "Untitled service"}</p>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">{s.category}</span>
                {!s.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Hidden</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Duration {s.duration}</p>
            </div>
            <span className="text-sm font-semibold">{formatNaira(s.price)}</span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" checked={s.active} onChange={() => onToggle(s.id)} className="h-4 w-4 accent-[oklch(0.46_0.13_155)]" />
              Active
            </label>
            <button onClick={() => onEdit(s)} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button onClick={() => onDelete(s.id)} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceEditor({ service, onClose, onSave }: { service: Service; onClose: () => void; onSave: (s: Service) => void }) {
  const [draft, setDraft] = useState(service);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{service.title ? "Edit service" : "New service"}</h3>
            <p className="text-xs text-muted-foreground">These changes go live instantly on your shop.</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 grid gap-3">
          <Field label="Title">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Bridal Hair & Makeup" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inputClass}>
                {["Beauty", "Food", "Home", "Fashion", "Repairs", "Events", "Add-on", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Price (₦)">
            <input type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold">Cancel</button>
          <button onClick={() => onSave(draft)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save service</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */

function OrdersPanel({ bookings, onStatus }: { bookings: Booking[]; onStatus: (id: string, s: Booking["status"]) => void }) {
  const [tab, setTab] = useState<Booking["status"] | "all">("all");
  const filtered = useMemo(() => (tab === "all" ? bookings : bookings.filter((b) => b.status === tab)), [tab, bookings]);
  const tabs: (Booking["status"] | "all")[] = ["all", "New", "Confirmed", "In progress", "Completed", "Cancelled"];

  return (
    <div className="space-y-6">
      <PanelHeader title="Orders & bookings" desc="Accept new requests, keep customers updated, and mark jobs complete to release escrow." />
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-semibold capitalize ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <ul className="mt-2 divide-y divide-border">
          {filtered.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{b.customer}</p>
                <p className="truncate text-xs text-muted-foreground">{b.service} · {b.when}</p>
              </div>
              <span className="text-sm font-semibold">{formatNaira(b.amount)}</span>
              <select
                value={b.status}
                onChange={(e) => onStatus(b.id, e.target.value as Booking["status"])}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                {["New", "Confirmed", "In progress", "Completed", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <Link to="/messages" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
                Message
              </Link>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-8 text-center text-xs text-muted-foreground">No orders in this tab.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Earnings ---------- */

function EarningsPanel({
  completedRevenue,
  pendingRevenue,
  onWithdraw,
}: {
  completedRevenue: number;
  pendingRevenue: number;
  onWithdraw: () => void;
}) {
  const history = [
    { id: "t1", label: "Payout · Kuda Bank ••4421", amount: -50000, when: "22 Nov" },
    { id: "t2", label: "Escrow released · Blessing K.", amount: 25000, when: "23 Nov" },
    { id: "t3", label: "Escrow released · Fikayo A.", amount: 45000, when: "21 Nov" },
    { id: "t4", label: "Tip received · Blessing K.", amount: 2000, when: "23 Nov" },
    { id: "t5", label: "Booking · Amaka N.", amount: 45000, when: "20 Nov" },
  ];
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Earnings & wallet"
        desc="Available balance, pending escrow, HubPoints and payout history."
        action={
          <button onClick={onWithdraw} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Wallet className="h-4 w-4" /> Withdraw to bank
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <BalanceCard title="Available balance" value={formatNaira(completedRevenue)} hint="Ready to withdraw" gradient />
        <BalanceCard title="Pending in escrow" value={formatNaira(pendingRevenue)} hint="Releases on completion" />
        <BalanceCard title="HubPoints" value="1,240 pts" hint="≈ ₦12,400 · redeem for fees" tint="bg-gold/15" icon={<Coins className="h-5 w-5 text-charcoal" />} />
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Transaction history</h2>
        <ul className="mt-4 divide-y divide-border">
          {history.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <span>{t.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground">{t.when}</span>
                <span className={`font-semibold ${t.amount < 0 ? "text-red-600" : "text-brand"}`}>
                  {t.amount < 0 ? "-" : "+"}{formatNaira(Math.abs(t.amount))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BalanceCard({
  title,
  value,
  hint,
  gradient,
  tint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  gradient?: boolean;
  tint?: string;
  icon?: React.ReactNode;
}) {
  if (gradient) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-[oklch(0.36_0.11_155)] p-6 text-primary-foreground shadow-[0_24px_60px_-30px_oklch(0.46_0.13_155/0.55)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/25 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-90">{title}</p>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
        <p className="text-xs opacity-85">{hint}</p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {tint && <div className={`mt-3 h-1 rounded-full ${tint}`} />}
    </div>
  );
}

/* ---------- Customers ---------- */

function CustomersPanel({ messages, onReply }: { messages: CustomerMsg[]; onReply: (m: CustomerMsg) => void }) {
  return (
    <div className="space-y-6">
      <PanelHeader title="Customer inbox" desc="Respond to buyers directly. Fast replies boost your Instant Match ranking." />
      <div className="rounded-3xl border border-border bg-card p-2 shadow-sm">
        <ul className="divide-y divide-border">
          {messages.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-4">
              <img src={m.avatar} className="h-11 w-11 rounded-full object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.customer}</p>
                  {m.unread && <span className="rounded-full bg-orange px-1.5 text-[9px] font-bold text-white">NEW</span>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{m.preview}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{m.when}</span>
              <button
                onClick={() => onReply(m)}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReplyModal({ message, onClose }: { message: CustomerMsg; onClose: () => void }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <img src={message.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
          <div className="flex-1">
            <p className="font-semibold">{message.customer}</p>
            <p className="text-xs text-muted-foreground">{message.preview}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Write a reply…"
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        {sent ? (
          <p className="mt-3 rounded-2xl bg-brand-soft px-3 py-2 text-xs font-semibold text-brand">Reply sent ✓</p>
        ) : (
          <button
            onClick={() => setSent(true)}
            disabled={!text.trim()}
            className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Send reply
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */

function AnalyticsPanel() {
  const funnel = [
    { label: "Shop views", value: 3820 },
    { label: "Enquiries", value: 412 },
    { label: "Bookings", value: 178 },
    { label: "Completed", value: 164 },
    { label: "5★ reviews", value: 141 },
  ];
  const topServices = [
    { name: "Bridal Hair & Makeup", bookings: 62, revenue: 2790000 },
    { name: "Signature party glam", bookings: 74, revenue: 1850000 },
    { name: "Bridal trial", bookings: 42, revenue: 630000 },
  ];
  const max = Math.max(...funnel.map((f) => f.value));
  return (
    <div className="space-y-6">
      <PanelHeader title="Analytics & insights" desc="Understand where your customers come from and what makes them book." />
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Conversion funnel · last 30 days</h2>
        <ul className="mt-4 space-y-3">
          {funnel.map((f) => (
            <li key={f.label}>
              <div className="flex items-center justify-between text-sm">
                <span>{f.label}</span>
                <span className="font-semibold">{f.value.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.15_155)]" style={{ width: `${(f.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Top services</h2>
        <ul className="mt-4 divide-y divide-border">
          {topServices.map((t) => (
            <li key={t.name} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.bookings} bookings</p>
              </div>
              <span className="text-sm font-semibold">{formatNaira(t.revenue)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <MiniStat label="Average rating" value="4.98" hint="Across 141 reviews" icon={<Star className="h-4 w-4 fill-gold text-gold" />} />
        <MiniStat label="Response time" value="6 min" hint="Faster than 92% of pros" icon={<MessageSquare className="h-4 w-4 text-brand" />} />
        <MiniStat label="Repeat customers" value="38%" hint="+9% MoM" icon={<Gift className="h-4 w-4 text-orange" />} />
      </section>
    </div>
  );
}

function MiniStat({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-[11px] text-brand">{hint}</p>
    </div>
  );
}

/* ---------- Settings ---------- */

function SettingsPanel() {
  const [payoutSchedule, setPayoutSchedule] = useState("Weekly");
  const [autoAccept, setAutoAccept] = useState(false);
  const [outOfOffice, setOutOfOffice] = useState(false);
  return (
    <div className="space-y-6">
      <PanelHeader title="Settings" desc="Shop preferences, payout schedule and availability." />
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <Field label="Payout schedule">
          <select value={payoutSchedule} onChange={(e) => setPayoutSchedule(e.target.value)} className={inputClass}>
            {["Daily", "Weekly", "Monthly"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <ToggleRow
          label="Auto-accept repeat customers"
          hint="Instantly confirm bookings from customers you've served before."
          value={autoAccept}
          onChange={setAutoAccept}
        />
        <ToggleRow
          label="Out of office"
          hint="Pause new bookings while you're unavailable. Existing bookings stay confirmed."
          value={outOfOffice}
          onChange={setOutOfOffice}
        />
      </section>
      <section className="rounded-3xl border border-red-200 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700/80">Deactivating hides your shop from search until you reactivate.</p>
        <button className="mt-3 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700">
          Deactivate shop
        </button>
      </section>
    </div>
  );
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
        aria-pressed={value}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

/* ---------- Withdraw Modal ---------- */

function WithdrawModal({ available, onClose }: { available: number; onClose: () => void }) {
  const [amount, setAmount] = useState(available);
  const [account, setAccount] = useState("Kuda Bank ••4421");
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Withdraw to bank</h3>
            <p className="text-xs text-muted-foreground">Payouts arrive within minutes.</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {done ? (
          <div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-brand" />
            <p className="mt-2 text-sm font-semibold">Withdrawal sent</p>
            <p className="text-xs text-muted-foreground">{formatNaira(amount)} to {account}.</p>
            <button onClick={onClose} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Done</button>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-2xl bg-brand-soft/50 p-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Available</p>
              <p className="text-2xl font-semibold text-primary">{formatNaira(available)}</p>
            </div>
            <div className="mt-4 grid gap-3">
              <Field label="Amount (₦)">
                <input type="number" min={100} max={available} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="To account">
                <select value={account} onChange={(e) => setAccount(e.target.value)} className={inputClass}>
                  <option>Kuda Bank ••4421</option>
                  <option>GTBank ••0031</option>
                  <option>+ Add new account</option>
                </select>
              </Field>
            </div>
            <button
              onClick={() => setDone(true)}
              className="mt-5 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Withdraw {formatNaira(amount)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */

const inputClass = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function PanelHeader({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      {action}
    </header>
  );
}
