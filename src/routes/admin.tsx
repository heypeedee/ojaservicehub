import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  Check,
  DollarSign,
  Eye,
  FileText,
  Flag,
  Folder,
  Gavel,
  LayoutGrid,
  ListChecks,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";
import { supabase } from "@/integrations/supabase/client";

type Section =
  | "overview"
  | "users"
  | "providers"
  | "verification"
  | "listings"
  | "disputes"
  | "payouts"
  | "categories"
  | "reports"
  | "fraud"
  | "settings";

const sections: { id: Section; label: string; icon: typeof Shield }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "users", label: "Users", icon: Users },
  { id: "providers", label: "Providers", icon: BadgeCheck },
  { id: "verification", label: "Verification queue", icon: ShieldCheck },
  { id: "listings", label: "Listings", icon: ListChecks },
  { id: "disputes", label: "Disputes", icon: Gavel },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "categories", label: "Categories", icon: Folder },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "fraud", label: "Fraud detection", icon: ShieldAlert },
  { id: "settings", label: "Platform settings", icon: Settings2 },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel · Ọjà" },
      {
        name: "description",
        content:
          "Moderate users and providers, verify identities, resolve disputes, approve payouts, and monitor fraud across the Ọjà platform.",
      },
      { property: "og:title", content: "Admin panel · Ọjà" },
      { property: "og:description", content: "Trust & safety, payouts, and platform operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const [section, setSection] = useState<Section>("overview");
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      setSignedIn(!!session);
      if (!session) {
        setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!!profile?.is_admin);
      setChecking(false);
    }
    check();
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!signedIn || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">Admin access only</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {signedIn ? "Your account doesn't have admin access." : "Sign in with an admin account to continue."}
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Back to Ọjà
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BackNav label="Ọjà" />
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Shield className="h-3 w-3" /> Admin
            </span>
          </div>
          <div className="hidden max-w-sm flex-1 sm:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full rounded-full border border-border bg-card pl-9 pr-3 py-1.5 text-sm outline-none focus:border-primary"
                placeholder="Search users, providers, bookings…"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-0.5 rounded-2xl border border-border bg-card p-2 shadow-sm">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                    active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap gap-1 lg:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  section === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {section === "overview" && <Overview onGo={setSection} />}
          {section === "users" && <UsersView />}
          {section === "providers" && <ProvidersView />}
          {section === "verification" && <VerificationView />}
          {section === "listings" && <ListingsView />}
          {section === "disputes" && <DisputesView />}
          {section === "payouts" && <PayoutsView />}
          {section === "categories" && <CategoriesView />}
          {section === "reports" && <ReportsView />}
          {section === "fraud" && <FraudView />}
          {section === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, right }: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        {sub && <span className="text-[10px] font-semibold uppercase text-muted-foreground">{sub}</span>}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Overview({ onGo }: { onGo: (s: Section) => void }) {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [providerCount, setProviderCount] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(0);
  const [gmv, setGmv] = useState(0);
  const [payoutsPending, setPayoutsPending] = useState(0);
  const [payoutsPendingCount, setPayoutsPendingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<{ id: string; label: string; when: string }[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const [
        { count: users },
        { count: providers },
        { count: unverified },
        { data: paidBookings },
        { data: recent },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("provider_profiles").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("provider_profiles").select("id", { count: "exact", head: true }).eq("published", true).eq("verified", false),
        supabase.from("bookings").select("amount, payment_status").in("payment_status", ["Paid", "Released"]),
        supabase
          .from("bookings")
          .select("id, service_title, status, created_at, provider_profiles(business_name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      if (!active) return;
      setUserCount(users ?? 0);
      setProviderCount(providers ?? 0);
      setPendingVerification(unverified ?? 0);
      const paid = paidBookings ?? [];
      setGmv(paid.reduce((s, b) => s + Number(b.amount), 0));
      const pendingPaid = paid.filter((b) => b.payment_status === "Paid");
      setPayoutsPending(pendingPaid.reduce((s, b) => s + Number(b.amount), 0));
      setPayoutsPendingCount(pendingPaid.length);
      setRecentBookings(
        ((recent as any[]) ?? []).map((b) => ({
          id: b.id,
          label: `${b.provider_profiles?.business_name ?? "A pro"} · ${b.service_title} (${b.status})`,
          when: new Date(b.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Section title="Platform overview" subtitle="A live snapshot of Ọjà — no synthetic numbers.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={loading ? "—" : String(userCount)} />
        <StatCard icon={BadgeCheck} label="Published providers" value={loading ? "—" : String(providerCount)} />
        <StatCard icon={ShieldCheck} label="Awaiting verification" value={loading ? "—" : String(pendingVerification)} />
        <StatCard icon={DollarSign} label="GMV (paid + released)" value={loading ? "—" : `₦${gmv.toLocaleString()}`} />
        <StatCard
          icon={Wallet}
          label="Held in escrow"
          value={loading ? "—" : `₦${payoutsPending.toLocaleString()}`}
          sub={loading ? undefined : `${payoutsPendingCount} booking${payoutsPendingCount === 1 ? "" : "s"}`}
        />
        <StatCard icon={TrendingUp} label="Platform commission" value="5%" sub="fixed, set in Edge Functions" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Needs your attention</h2>
          </div>
          <ul className="space-y-2 text-sm">
            <QueueRow
              tint="bg-amber-100 text-amber-700"
              icon={ShieldCheck}
              title={`${pendingVerification} provider${pendingVerification === 1 ? "" : "s"} awaiting verification`}
              body="Review and mark verified"
              onOpen={() => onGo("verification")}
            />
            <QueueRow
              tint="bg-primary/10 text-primary"
              icon={Wallet}
              title={`${payoutsPendingCount} booking${payoutsPendingCount === 1 ? "" : "s"} held in escrow`}
              body={`Totalling ₦${payoutsPending.toLocaleString()}`}
              onOpen={() => onGo("payouts")}
            />
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Recent bookings</h2>
          <ul className="space-y-3 text-sm">
            {recentBookings.length === 0 && <li className="text-xs text-muted-foreground">No bookings yet.</li>}
            {recentBookings.map((b) => (
              <ActionRow key={b.id} who={b.label} what="" when={b.when} />
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function QueueRow({ tint, icon: Icon, title, body, onOpen }: { tint: string; icon: typeof Shield; title: string; body: string; onOpen: () => void }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[11px] text-muted-foreground">{body}</p>
        </div>
      </div>
      <button onClick={onOpen} className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">Review</button>
    </li>
  );
}

function ActionRow({ who, what, when }: { who: string; what: string; when: string }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="text-sm"><span className="font-semibold">{who}</span> {what}</p>
      </div>
      <span className="shrink-0 text-[11px] text-muted-foreground">{when}</span>
    </li>
  );
}

type UserRow = {
  id: string;
  name: string;
  role: "Customer" | "Provider";
  joined: string;
  suspended: boolean;
};

function UsersView() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: profiles }, { data: providerIds }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, full_name, created_at, suspended").order("created_at", { ascending: false }),
        supabase.from("provider_profiles").select("id"),
      ]);
      if (!active) return;
      const providerSet = new Set((providerIds ?? []).map((p) => p.id));
      setRows(
        (profiles ?? []).map((p) => ({
          id: p.id,
          name: p.display_name || p.full_name || "Unnamed user",
          role: providerSet.has(p.id) ? "Provider" : "Customer",
          joined: new Date(p.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }),
          suspended: p.suspended,
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  async function toggle(id: string, suspended: boolean) {
    setBusyId(id);
    const { error } = await supabase.from("profiles").update({ suspended: !suspended }).eq("id", id);
    setBusyId(null);
    if (!error) setRows((all) => all.map((r) => (r.id === id ? { ...r, suspended: !suspended } : r)));
  }

  return (
    <Section title="Users" subtitle="Every account on the platform.">
      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name"
          className="w-full max-w-sm rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">No users found.</td></tr>
            )}
            {!loading &&
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3">
                    <p className="font-semibold">{u.name}</p>
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-muted-foreground">{u.joined}</td>
                  <td className="p-3">
                    <StatusPill status={u.suspended ? "Suspended" : "Active"} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => toggle(u.id, u.suspended)}
                        disabled={busyId === u.id}
                        title={u.suspended ? "Reactivate" : "Suspend"}
                        className={`grid h-7 w-7 place-items-center rounded-full border disabled:opacity-50 ${u.suspended ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-rose-200 text-rose-700 hover:bg-rose-50"}`}
                      >
                        {u.suspended ? <Check className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Active" ? "bg-emerald-100 text-emerald-700"
    : status === "Suspended" ? "bg-rose-100 text-rose-700"
    : status === "Pending" ? "bg-amber-100 text-amber-700"
    : status === "Approved" ? "bg-emerald-100 text-emerald-700"
    : status === "Rejected" ? "bg-rose-100 text-rose-700"
    : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

type ProviderRow = {
  id: string;
  name: string;
  cat: string;
  rating: number;
  reviewCount: number;
  tier: string;
  published: boolean;
};

function ProvidersView() {
  const [pros, setPros] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("provider_profiles")
        .select("id, business_name, rating, review_count, tier, published, categories(name)")
        .order("rating", { ascending: false });
      if (!active) return;
      setPros(
        ((data as any[]) ?? []).map((p) => ({
          id: p.id,
          name: p.business_name,
          cat: p.categories?.name ?? "—",
          rating: p.rating,
          reviewCount: p.review_count,
          tier: p.tier,
          published: p.published,
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function toggleSuspend(id: string, published: boolean) {
    setBusyId(id);
    const { error } = await supabase.from("provider_profiles").update({ published: !published }).eq("id", id);
    setBusyId(null);
    if (!error) setPros((all) => all.map((p) => (p.id === id ? { ...p, published: !published } : p)));
  }

  return (
    <Section title="Providers" subtitle="Every published and draft provider shop on Ọjà.">
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && pros.length === 0 && <p className="text-sm text-muted-foreground">No providers yet.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pros.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.name}</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.tier}</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.cat}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span>★ {p.rating > 0 ? p.rating.toFixed(2) : "New"}</span>
              <span>{p.reviewCount} reviews</span>
              <StatusPill status={p.published ? "Active" : "Suspended"} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toggleSuspend(p.id, p.published)}
                disabled={busyId === p.id}
                className={`flex-1 rounded-full border py-1 text-xs font-semibold disabled:opacity-50 ${
                  p.published ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {p.published ? "Suspend" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function VerificationView() {
  const [rows, setRows] = useState<{ id: string; name: string; cat: string; joined: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("provider_profiles")
        .select("id, business_name, created_at, categories(name)")
        .eq("verified", false)
        .order("created_at");
      if (!active) return;
      setRows(
        ((data as any[]) ?? []).map((r) => ({
          id: r.id,
          name: r.business_name,
          cat: r.categories?.name ?? "—",
          joined: new Date(r.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function approve(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("provider_profiles").update({ verified: true }).eq("id", id);
    setBusyId(null);
    if (!error) setRows((all) => all.filter((r) => r.id !== id));
  }

  return (
    <Section title="Verification queue" subtitle="Providers waiting on a verified badge.">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Provider</th><th className="p-3">Category</th><th className="p-3">Joined</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">Nothing pending — everyone's verified.</td></tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-semibold">{r.name}</td>
                  <td className="p-3">{r.cat}</td>
                  <td className="p-3 text-muted-foreground">{r.joined}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => approve(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Mark verified
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

type ServiceRow = { id: string; title: string; by: string; price: number; active: boolean };

function ListingsView() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("services")
        .select("id, title, price, active, provider_profiles(business_name)")
        .order("created_at", { ascending: false });
      if (!active) return;
      setRows(
        ((data as any[]) ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          by: s.provider_profiles?.business_name ?? "—",
          price: Number(s.price),
          active: s.active,
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function toggle(id: string, active: boolean) {
    setBusyId(id);
    const { error } = await supabase.from("services").update({ active: !active }).eq("id", id);
    setBusyId(null);
    if (!error) setRows((all) => all.map((r) => (r.id === id ? { ...r, active: !active } : r)));
  }

  return (
    <Section title="Listings" subtitle="Every service listed across all providers.">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="p-3">Listing</th><th className="p-3">Provider</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">No listings yet.</td></tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-semibold">{r.title}</td>
                  <td className="p-3">{r.by}</td>
                  <td className="p-3">₦{r.price.toLocaleString()}</td>
                  <td className="p-3"><StatusPill status={r.active ? "Active" : "Suspended"} /></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => toggle(r.id, r.active)}
                        disabled={busyId === r.id}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold disabled:opacity-50 ${r.active ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                      >
                        {r.active ? "Take down" : "Restore"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function NotBuiltYet({ title, subtitle, note }: { title: string; subtitle: string; note: string }) {
  return (
    <Section title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold text-foreground">Not built yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{note}</p>
      </div>
    </Section>
  );
}

function DisputesView() {
  return (
    <NotBuiltYet
      title="Disputes"
      subtitle="Resolve escrow disputes between customers and providers."
      note="There's no dispute-filing flow yet — customers and providers can't raise a dispute from the app, so there's nothing real to show here. This needs its own data model before it can go live."
    />
  );
}

function PayoutsView() {
  const [rows, setRows] = useState<
    { id: string; who: string; amount: number; payoutAmount: number; status: string; when: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("id, amount, payout_amount, payment_status, updated_at, provider_profiles(business_name)")
        .in("payment_status", ["Paid", "Released"])
        .order("updated_at", { ascending: false });
      if (!active) return;
      setRows(
        ((data as any[]) ?? []).map((b) => ({
          id: b.id,
          who: b.provider_profiles?.business_name ?? "—",
          amount: Number(b.amount),
          payoutAmount: Number(b.payout_amount),
          status: b.payment_status,
          when: new Date(b.updated_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
        }))
      );
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const pending = rows.filter((r) => r.status === "Paid");
  const total = pending.reduce((a, b) => a + b.payoutAmount, 0);

  return (
    <Section title="Payouts" subtitle={loading ? "Loading…" : `${pending.length} held in escrow · ₦${total.toLocaleString()}`}>
      <p className="mb-3 text-xs text-muted-foreground">
        Payout release is triggered by the provider from their dashboard once a job is marked complete — this is a
        read-only view for oversight.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="p-3">Provider</th><th className="p-3">Booking amount</th><th className="p-3">Payout (after fee)</th><th className="p-3">Status</th><th className="p-3">Updated</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">No paid bookings yet.</td></tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-semibold">{r.who}</td>
                  <td className="p-3">₦{r.amount.toLocaleString()}</td>
                  <td className="p-3">₦{r.payoutAmount.toLocaleString()}</td>
                  <td className="p-3"><StatusPill status={r.status === "Released" ? "Active" : "Pending"} /></td>
                  <td className="p-3 text-muted-foreground">{r.when}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function CategoriesView() {
  const [cats, setCats] = useState<{ id: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: categories }, { data: providers }] = await Promise.all([
        supabase.from("categories").select("id, name").order("sort_order"),
        supabase.from("provider_profiles").select("category_id").eq("published", true),
      ]);
      if (!active) return;
      const tally: Record<string, number> = {};
      for (const p of providers ?? []) if (p.category_id) tally[p.category_id] = (tally[p.category_id] ?? 0) + 1;
      setCats((categories ?? []).map((c) => ({ id: c.id, name: c.name, count: tally[c.id] ?? 0 })));
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function addCategory() {
    if (!draft.trim()) return;
    setAdding(true);
    setError(null);
    const slug = draft.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({ name: draft.trim(), slug, sort_order: cats.length + 1 })
      .select("id, name")
      .single();
    setAdding(false);
    if (insertError || !data) {
      setError(insertError?.message ?? "Could not add category");
      return;
    }
    setCats((prev) => [...prev, { id: data.id, name: data.name, count: 0 }]);
    setDraft("");
  }

  async function removeCategory(id: string) {
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);
    if (!deleteError) setCats((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <Section title="Categories" subtitle="Add, rename, or archive service categories.">
      <div className="mb-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={addCategory}
          disabled={adding}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <ul className="grid gap-2 sm:grid-cols-2">
        {!loading &&
          cats.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
              <div><p className="font-medium">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.count} providers</p></div>
              <button onClick={() => removeCategory(c.id)} className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
      </ul>
    </Section>
  );
}

function ReportsView() {
  return (
    <NotBuiltYet
      title="Reports"
      subtitle="Downloadable operational and financial reports."
      note="No report generation exists yet — this would need scheduled exports built and stored somewhere real before there's anything to download."
    />
  );
}

function FraudView() {
  return (
    <NotBuiltYet
      title="Fraud detection"
      subtitle="Auto-detected risk signals."
      note="There's no fraud-detection logic running yet (device fingerprinting, velocity checks, etc.). This needs real signal collection before it can flag anything."
    />
  );
}

function SettingsView() {
  return (
    <Section title="Platform settings" subtitle="Current fixed rules — not yet configurable from here.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Marketplace commission</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Fixed at <span className="font-semibold text-foreground">5%</span>, deducted from the pro's payout when
            you release escrow. Hardcoded in the Supabase Edge Functions (<code>verify-payment</code>,{" "}
            <code>paystack-webhook</code>) — changing it means editing those functions, not a setting here yet.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Escrow release</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            There's no auto-release timer. A provider must mark a job <span className="font-semibold">Completed</span> and
            press <span className="font-semibold">Release payment</span> themselves — funds don't move automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Provider verification</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Fully manual — an admin marks a provider verified from the Verification queue. There's no automated
            identity/document check yet.
          </p>
        </div>
      </div>
    </Section>
  );
}
