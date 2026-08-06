import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  LogOut,
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
          "Run your Ọjà shop: manage your profile, services, bookings, escrow payouts, customer chats and business insights in one dedicated app.",
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
  rawDate: string;
  amount: number;
  status: "pending" | "accepted" | "declined" | "in_progress" | "completed" | "cancelled" | "disputed";
  paymentStatus: "Unpaid" | "Paid" | "Released" | "Refunded";
  payoutAmount: number;
  platformFee: number;
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
  payment_status: string;
  payout_amount: number;
  platform_fee: number;
  scheduled_at: string | null;
  updated_at: string;
  location: string | null;
  customer_id: string;
  };
};

const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function ProDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [userId, setUserId] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>("Your shop");
  const [verified, setVerified] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [shopCategory, setShopCategory] = useState("");
  const [hasShop, setHasShop] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<CustomerMsg[]>([]);
  const [editService, setEditService] = useState<Service | null>(null);

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
        supabase.from("provider_profiles").select("business_name, verified, rating, review_count, categories(name)").eq("id", uid).maybeSingle(),
        supabase.from("services").select("*").eq("provider_id", uid).order("created_at"),
        supabase
          .from("bookings")
          .select("id, service_title, amount, status, payment_status, payout_amount, platform_fee, scheduled_at, updated_at, location, customer_id")
          .eq("provider_id", uid)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;

      if (profile) {
        setHasShop(true);
        setShopName(profile.business_name);
        setVerified(profile.verified);
        setRating(Number(profile.rating));
        setReviewCount(profile.review_count);
        setShopCategory((profile as any).categories?.name ?? "");
      }
      setServices(
        (svcRows ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          category: s.category ?? "",
          price: Number(s.price),
          duration: s.duration ?? "—",
          active: s.active,
        }))
      );
      const bookingList = ((bookingRows as unknown as BookingRow[]) ?? []);
      const customerIds = Array.from(new Set(bookingList.map((b) => b.customer_id).filter(Boolean)));
      const { data: customerProfiles } = customerIds.length
        ? await supabase.from("profiles").select("id, display_name, full_name").in("id", customerIds)
        : { data: [] as { id: string; display_name: string | null; full_name: string | null }[] };
      if (!active) return;
      const nameById = new Map((customerProfiles ?? []).map((p) => [p.id, p.display_name || p.full_name || "Customer"]));
      setBookings(
        bookingList.map((b) => ({
          id: b.id,
          customer: nameById.get(b.customer_id) ?? "Customer",
          service: b.service_title,
          when: b.scheduled_at ? new Date(b.scheduled_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—",
          rawDate: b.updated_at,
          amount: Number(b.amount),
          status: b.status as Booking["status"],
          paymentStatus: b.payment_status as Booking["paymentStatus"],
          payoutAmount: Number(b.payout_amount),
          platformFee: Number(b.platform_fee),
        }))
      );

      // Real customer inbox preview: conversations this provider is part of,
      // the other participant's name/avatar, and their latest message.
      const { data: myConvoRows } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", uid);
      const convoIds = (myConvoRows ?? []).map((r) => r.conversation_id);

      if (convoIds.length > 0) {
        const [{ data: parts }, { data: recentMsgs }] = await Promise.all([
          supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", convoIds),
          supabase
            .from("messages")
            .select("conversation_id, body, sender_id, created_at")
            .in("conversation_id", convoIds)
            .order("created_at", { ascending: false }),
        ]);
        const otherUserIds = Array.from(new Set((parts ?? []).filter((p) => p.user_id !== uid).map((p) => p.user_id)));
        const { data: otherProfiles } = otherUserIds.length
          ? await supabase.from("profiles").select("id, display_name, full_name, avatar_url").in("id", otherUserIds)
          : { data: [] as { id: string; display_name: string | null; full_name: string | null; avatar_url: string | null }[] };
        const profileById = new Map((otherProfiles ?? []).map((p) => [p.id, p]));
        const otherByConvo = new Map<string, string>();
        (parts ?? []).forEach((p) => {
          if (p.user_id !== uid) otherByConvo.set(p.conversation_id, p.user_id);
        });
        const latestByConvo = new Map<string, { body: string | null; sender_id: string; created_at: string }>();
        (recentMsgs ?? []).forEach((m) => {
          if (!latestByConvo.has(m.conversation_id)) latestByConvo.set(m.conversation_id, m);
        });

        const inbox: CustomerMsg[] = convoIds
          .map((cid) => {
            const otherId = otherByConvo.get(cid);
            const profile = otherId ? profileById.get(otherId) : undefined;
            const latest = latestByConvo.get(cid);
            if (!latest) return null;
            const name = profile?.display_name || profile?.full_name || "Customer";
            return {
              id: cid,
              customer: name,
              preview: latest.body || "Sent an image",
              when: timeAgo(latest.created_at),
              rawWhen: latest.created_at,
              unread: latest.sender_id !== uid,
              avatar: profile?.avatar_url || "",
            };
          })
          .filter((m): m is CustomerMsg & { rawWhen: string } => m !== null)
          .sort((a, b) => (a.rawWhen < b.rawWhen ? 1 : -1))
          .map(({ rawWhen, ...m }) => m);
        setMessages(inbox);
      }

      setLoadingData(false);
      if (!profile) setSection("profile");
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const completedRevenue = bookings.filter((b) => b.paymentStatus === "Released").reduce((s, b) => s + b.payoutAmount, 0);
  const pendingRevenue = bookings.filter((b) => b.paymentStatus === "Paid").reduce((s, b) => s + b.payoutAmount, 0);
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
          price_ngn: Math.round(s.price),
          duration: s.duration,
          active: s.active,
        })
        .select()
        .single();
      if (!error && data) {
        setServices((prev) => [...prev, { id: data.id, title: data.title, category: data.category ?? "", price: Number(data.price), duration: data.duration ?? "—", active: data.active }]);
      }
    } else {
      const { error } = await supabase
        .from("services")
        .update({ title: s.title, category: s.category, price: s.price, price_ngn: Math.round(s.price), duration: s.duration, active: s.active })
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

  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  async function releasePayment(id: string) {
    setReleasingId(id);
    setReleaseError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("release-payment", {
      body: { bookingId: id },
      headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
    });
    setReleasingId(null);
    const errMsg = (data as any)?.error;
    if (error || errMsg) {
      setReleaseError(errMsg || "Could not release payment. Try again.");
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, paymentStatus: "Released" } : b)));
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
              shopName={shopName}
              activeServices={activeServices}
              completedRevenue={completedRevenue}
              pendingRevenue={pendingRevenue}
              bookings={bookings}
              messages={messages}
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
                  category: shopCategory || "Other",
                  price: 0,
                  duration: "1 hr",
                  active: true,
                })
              }
            />
          )}
          {section === "orders" && (
            <OrdersPanel
              bookings={bookings}
              onStatus={updateBookingStatus}
              onRelease={releasePayment}
              releasingId={releasingId}
              releaseError={releaseError}
            />
          )}
          {section === "earnings" && (
            <EarningsPanel
              completedRevenue={completedRevenue}
              pendingRevenue={pendingRevenue}
              bookings={bookings}
              onSection={setSection}
            />
          )}
          {section === "customers" && (
            <CustomersPanel messages={messages} onReply={(m) => markRead(m.id)} />
          )}
          {section === "analytics" && (
            <AnalyticsPanel bookings={bookings} services={services} rating={rating} reviewCount={reviewCount} />
          )}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>

      {editService && <ServiceEditor service={editService} shopCategory={shopCategory} onClose={() => setEditService(null)} onSave={saveService} />}
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
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/messages"
            search={{ conversationId: "" }}
            className="relative inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Inbox
            {unread > 0 && (
              <span className="ml-1 rounded-full bg-orange px-1.5 text-[9px] font-bold text-white">{unread}</span>
            )}
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
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.assign("/"))}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

/* ---------- Overview ---------- */

function Overview({
  shopName,
  activeServices,
  completedRevenue,
  pendingRevenue,
  bookings,
  messages,
  onSection,
}: {
  shopName: string;
  activeServices: number;
  completedRevenue: number;
  pendingRevenue: number;
  bookings: Booking[];
  messages: CustomerMsg[];
  onSection: (s: Section) => void;
}) {
  const upcoming = bookings.filter((b) => b.status === "accepted" || b.status === "pending" || b.status === "in_progress").slice(0, 4);
  const kpis = [
    { label: "Paid out to you", value: formatNaira(completedRevenue), sub: "All time", icon: TrendingUp, tint: "bg-brand-soft text-brand" },
    { label: "Pending payout", value: formatNaira(pendingRevenue), sub: "Escrow held", icon: Wallet, tint: "bg-orange/10 text-orange" },
    { label: "Active services", value: activeServices, sub: "Live on your shop", icon: Package, tint: "bg-gold/15 text-charcoal" },
    { label: "Total bookings", value: bookings.length, sub: "All time", icon: Coins, tint: "bg-brand-soft text-brand" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            <Store className="h-3.5 w-3.5" /> Market owner
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{shopName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's how your shop is performing today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSection("orders")}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Wallet className="h-4 w-4" /> View payouts
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
              <p className="text-xs text-muted-foreground">Released payouts only.</p>
            </div>
            <span className="text-2xl font-semibold">{formatNaira(completedRevenue)}</span>
          </div>
          {(() => {
            const now = new Date();
            const months = Array.from({ length: 12 }).map((_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
              return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabels[d.getMonth()] };
            });
            const totals = months.map((m) =>
              bookings
                .filter((b) => b.paymentStatus === "Released" && `${new Date(b.rawDate).getFullYear()}-${new Date(b.rawDate).getMonth()}` === m.key)
                .reduce((s, b) => s + b.payoutAmount, 0)
            );
            const max = Math.max(1, ...totals);
            const hasAny = totals.some((v) => v > 0);
            return (
              <>
                {!hasAny && (
                  <p className="mt-4 rounded-2xl bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                    No released payouts yet — this fills in as you complete jobs and release payment.
                  </p>
                )}
                <div className="mt-6 grid h-48 grid-cols-12 items-end gap-2">
                  {totals.map((v, i) => (
                    <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
                      <div
                        className={`w-full rounded-t-md ${v > 0 ? "bg-gradient-to-t from-primary to-[oklch(0.62_0.15_155)]" : "bg-muted"}`}
                        style={{ height: v > 0 ? `${(v / max) * 100}%` : "3%" }}
                        title={v > 0 ? `₦${v.toLocaleString()}` : undefined}
                      />
                      <span className="text-[10px] text-muted-foreground">{months[i].label}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
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
  const [isNewShop, setIsNewShop] = useState(false);

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
          setIsNewShop(true);
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
      {isNewShop && (
        <div className="rounded-3xl border border-primary/20 bg-brand-soft/40 p-5">
          <p className="font-semibold text-foreground">Welcome — let's set up your shop 👋</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You don't have a business profile yet. Fill in the details below and hit Publish to start
            showing up in search. Just here to book a service instead? Head back to your{" "}
            <Link to="/dashboard" className="font-semibold text-primary hover:underline">buyer dashboard</Link>.
          </p>
        </div>
      )}
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

function ServiceEditor({
  service,
  shopCategory,
  onClose,
  onSave,
}: {
  service: Service;
  shopCategory: string;
  onClose: () => void;
  onSave: (s: Service) => void;
}) {
  const [draft, setDraft] = useState({ ...service, category: shopCategory || service.category });
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
              <div className={`${inputClass} flex items-center bg-muted/50 text-muted-foreground`}>
                {draft.category || "Set your shop category in Business profile first"}
              </div>
            </Field>
            <Field label="Duration">
              <input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <p className="-mt-1 text-[11px] text-muted-foreground">
            Services are listed under your shop's category. To change it, update your Business profile.
          </p>
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

function OrdersPanel({
  bookings,
  onStatus,
  onRelease,
  releasingId,
  releaseError,
}: {
  bookings: Booking[];
  onStatus: (id: string, s: Booking["status"]) => void;
  onRelease: (id: string) => void;
  releasingId: string | null;
  releaseError: string | null;
}) {
  const [tab, setTab] = useState<Booking["status"] | "all">("all");
  const filtered = useMemo(() => (tab === "all" ? bookings : bookings.filter((b) => b.status === tab)), [tab, bookings]);
  const statusValues: Booking["status"][] = ["pending", "accepted", "declined", "in_progress", "completed", "cancelled", "disputed"];
  const tabs: (Booking["status"] | "all")[] = ["all", ...statusValues];
  const statusLabel = (s: Booking["status"]) => (s === "in_progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <div className="space-y-6">
      <PanelHeader title="Orders & bookings" desc="Accept new requests, keep customers updated, and mark jobs complete to release escrow." />
      {releaseError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{releaseError}</div>
      )}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-semibold capitalize ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "all" ? "All" : statusLabel(t)}
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
              <div className="text-right">
                <p className="text-sm font-semibold">{formatNaira(b.amount)}</p>
                <PaymentBadge status={b.paymentStatus} />
              </div>
              <select
                value={b.status}
                onChange={(e) => onStatus(b.id, e.target.value as Booking["status"])}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                {statusValues.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
              {b.status === "completed" && b.paymentStatus === "Paid" && (
                <button
                  onClick={() => onRelease(b.id)}
                  disabled={releasingId === b.id}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {releasingId === b.id ? "Releasing…" : `Release ${formatNaira(b.payoutAmount)}`}
                </button>
              )}
              <Link to="/messages" search={{ conversationId: "" }} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
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

function PaymentBadge({ status }: { status: Booking["paymentStatus"] }) {
  const styles: Record<Booking["paymentStatus"], string> = {
    Unpaid: "bg-muted text-muted-foreground",
    Paid: "bg-gold/15 text-charcoal",
    Released: "bg-brand-soft text-brand",
    Refunded: "bg-destructive/10 text-destructive",
  };
  const labels: Record<Booking["paymentStatus"], string> = {
    Unpaid: "Awaiting payment",
    Paid: "Held in escrow",
    Released: "Paid out",
    Refunded: "Refunded",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

/* ---------- Earnings ---------- */

function EarningsPanel({
  completedRevenue,
  pendingRevenue,
  bookings,
  onSection,
}: {
  completedRevenue: number;
  pendingRevenue: number;
  bookings: Booking[];
  onSection: (s: Section) => void;
}) {
  const history = bookings
    .filter((b) => b.paymentStatus === "Paid" || b.paymentStatus === "Released")
    .map((b) => ({
      id: b.id,
      label: b.paymentStatus === "Released" ? `Paid out · ${b.customer}` : `Held in escrow · ${b.customer}`,
      amount: b.paymentStatus === "Released" ? b.payoutAmount : 0,
      when: b.when,
      status: b.paymentStatus,
    }));

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Earnings & wallet"
        desc="Available balance, pending escrow, and payout history."
        action={
          <button
            onClick={() => onSection("orders")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Wallet className="h-4 w-4" /> Go to Orders to release
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <BalanceCard title="Paid out to you" value={formatNaira(completedRevenue)} hint="All time" gradient />
        <BalanceCard title="Pending in escrow" value={formatNaira(pendingRevenue)} hint="Releases when you mark a job complete" />
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Transaction history</h2>
        <ul className="mt-4 divide-y divide-border">
          {history.length === 0 && (
            <li className="py-8 text-center text-xs text-muted-foreground">No paid bookings yet.</li>
          )}
          {history.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <span>{t.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground">{t.when}</span>
                <span className={`font-semibold ${t.status === "Released" ? "text-brand" : "text-muted-foreground"}`}>
                  {t.status === "Released" ? `+${formatNaira(t.amount)}` : "Held"}
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
        {messages.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No messages yet — they'll show up here once a customer reaches out.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-4">
                {m.avatar ? (
                  <img src={m.avatar} className="h-11 w-11 rounded-full object-cover" alt="" />
                ) : (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                    {m.customer.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.customer}</p>
                    {m.unread && <span className="rounded-full bg-orange px-1.5 text-[9px] font-bold text-white">NEW</span>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{m.preview}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{m.when}</span>
                <Link
                  to="/messages"
                  search={{ conversationId: m.id }}
                  onClick={() => onReply(m)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <Reply className="h-3 w-3" /> Reply
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */

function AnalyticsPanel({
  bookings,
  services,
  rating,
  reviewCount,
}: {
  bookings: Booking[];
  services: Service[];
  rating: number;
  reviewCount: number;
}) {
  const statusOrder: Booking["status"][] = ["pending", "accepted", "in_progress", "completed", "cancelled", "declined", "disputed"];
  const statusCounts = statusOrder
    .map((s) => ({ label: s === "in_progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1), value: bookings.filter((b) => b.status === s).length }))
    .filter((s) => s.value > 0);
  const max = Math.max(1, ...statusCounts.map((f) => f.value));

  const revenueByService = new Map<string, { bookings: number; revenue: number }>();
  bookings.forEach((b) => {
    const cur = revenueByService.get(b.service) ?? { bookings: 0, revenue: 0 };
    cur.bookings += 1;
    if (b.paymentStatus === "Paid" || b.paymentStatus === "Released") cur.revenue += b.amount;
    revenueByService.set(b.service, cur);
  });
  const topServices = Array.from(revenueByService.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const customerCounts = new Map<string, number>();
  bookings.forEach((b) => customerCounts.set(b.customer, (customerCounts.get(b.customer) ?? 0) + 1));
  const repeatCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;
  const totalCustomers = customerCounts.size;
  const repeatPct = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  return (
    <div className="space-y-6">
      <PanelHeader title="Analytics & insights" desc="Real numbers from your actual bookings — no estimates." />
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Bookings by status</h2>
        {statusCounts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No bookings yet — this fills in once customers start booking you.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {statusCounts.map((f) => (
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
        )}
      </section>
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Top services</h2>
        {topServices.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {services.length === 0 ? "Add a service to start tracking performance." : "No bookings yet for your services."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {topServices.map((t) => (
              <li key={t.name} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.bookings} booking{t.bookings === 1 ? "" : "s"}</p>
                </div>
                <span className="text-sm font-semibold">{formatNaira(t.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <MiniStat label="Average rating" value={rating > 0 ? rating.toFixed(2) : "New"} hint={`Across ${reviewCount} review${reviewCount === 1 ? "" : "s"}`} icon={<Star className="h-4 w-4 fill-gold text-gold" />} />
        <MiniStat label="Total bookings" value={String(bookings.length)} hint="All time" icon={<MessageSquare className="h-4 w-4 text-brand" />} />
        <MiniStat label="Repeat customers" value={totalCustomers > 0 ? `${repeatPct}%` : "—"} hint={totalCustomers > 0 ? `${repeatCustomers} of ${totalCustomers} customers` : "No customers yet"} icon={<Gift className="h-4 w-4 text-orange" />} />
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

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "Opay", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

function SettingsPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);

  const [bankCode, setBankCode] = useState(NIGERIAN_BANKS[0].code);
  const [accountNumber, setAccountNumber] = useState("");
  const [existingPayout, setExistingPayout] = useState<{ bank_name: string; account_number: string; account_name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSaved, setPayoutSaved] = useState(false);

  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const [{ data: profile }, { data: payout }] = await Promise.all([
        supabase.from("provider_profiles").select("published").eq("id", uid).maybeSingle(),
        supabase
          .from("provider_payout_details")
          .select("bank_name, account_number, account_name")
          .eq("provider_id", uid)
          .maybeSingle(),
      ]);
      if (!active) return;
      if (profile) setPublished(profile.published);
      if (payout) setExistingPayout(payout);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function savePayoutDetails() {
    if (!userId) return;
    if (accountNumber.replace(/\D/g, "").length !== 10) {
      setPayoutError("Enter a valid 10-digit account number.");
      return;
    }
    setSaving(true);
    setPayoutError(null);
    const bankName = NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name ?? "";
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("create-recipient", {
      body: { bankCode, bankName, accountNumber },
      headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
    });
    setSaving(false);
    const errMsg = (data as any)?.error;
    if (error || errMsg) {
      setPayoutError(errMsg || "Could not verify that account. Please check the details.");
      return;
    }
    setExistingPayout({ bank_name: bankName, account_number: accountNumber, account_name: (data as any).accountName });
    setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2000);
  }

  async function toggleShopActive() {
    if (!userId) return;
    setDeactivating(true);
    const nextPublished = !published;
    const { error } = await supabase.from("provider_profiles").update({ published: nextPublished }).eq("id", userId);
    setDeactivating(false);
    if (!error) setPublished(nextPublished);
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <PanelHeader title="Settings" desc="Payout details and shop visibility." />

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Payout bank account</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Where escrow payments land when you release a completed booking.
          </p>
        </div>

        {existingPayout && (
          <div className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-4 text-sm">
            <p className="font-semibold text-foreground">{existingPayout.account_name}</p>
            <p className="text-xs text-muted-foreground">
              {existingPayout.bank_name} · ••••{existingPayout.account_number.slice(-4)}
            </p>
          </div>
        )}

        <Field label={existingPayout ? "Update bank" : "Bank"}>
          <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className={inputClass}>
            {NIGERIAN_BANKS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Account number" hint="10 digits, no dashes or spaces">
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={inputClass}
            placeholder="0123456789"
          />
        </Field>
        {payoutError && <p className="text-sm text-destructive">{payoutError}</p>}
        <div className="flex items-center gap-3">
          {payoutSaved && <span className="text-xs text-brand">Saved ✓</span>}
          <button
            onClick={savePayoutDetails}
            disabled={saving}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Verifying…" : existingPayout ? "Update payout account" : "Verify & save"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-700">{published ? "Deactivate shop" : "Reactivate shop"}</h2>
        <p className="mt-1 text-xs text-red-700/80">
          {published
            ? "Hides your shop from search until you reactivate."
            : "Your shop is currently hidden from search."}
        </p>
        <button
          onClick={toggleShopActive}
          disabled={deactivating}
          className="mt-3 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
        >
          {deactivating ? "Working…" : published ? "Deactivate shop" : "Reactivate shop"}
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
