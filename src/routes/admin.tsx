import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
      { title: "Admin panel · ServiceHub" },
      {
        name: "description",
        content:
          "Moderate users and providers, verify identities, resolve disputes, approve payouts, and monitor fraud across the ServiceHub platform.",
      },
      { property: "og:title", content: "Admin panel · ServiceHub" },
      { property: "og:description", content: "Trust & safety, payouts, and platform operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const [section, setSection] = useState<Section>("overview");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> ServiceHub
            </Link>
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
  return (
    <Section title="Platform overview" subtitle="A snapshot of trust & safety and financial health across ServiceHub.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value="12,481" sub="+128 / 7d" />
        <StatCard icon={BadgeCheck} label="Active providers" value="1,942" sub="+34 / 7d" />
        <StatCard icon={ShieldCheck} label="Verification queue" value="17" sub="pending" />
        <StatCard icon={Gavel} label="Open disputes" value="6" sub="3 escalated" />
        <StatCard icon={DollarSign} label="GMV (30d)" value="₦186.4M" sub="+22.1%" />
        <StatCard icon={Wallet} label="Payouts pending" value="₦12.9M" sub="8 requests" />
        <StatCard icon={ShieldAlert} label="Fraud flags" value="9" sub="4 high-risk" />
        <StatCard icon={TrendingUp} label="Take rate" value="12.5%" sub="platform fee" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Needs your attention</h2>
            <span className="text-[11px] text-muted-foreground">Updated just now</span>
          </div>
          <ul className="space-y-2 text-sm">
            <QueueRow tint="bg-amber-100 text-amber-700" icon={ShieldCheck} title="17 provider verifications" body="6 waiting > 24 hours" onOpen={() => onGo("verification")} />
            <QueueRow tint="bg-rose-100 text-rose-700" icon={Gavel} title="6 open disputes" body="3 escalated to admin" onOpen={() => onGo("disputes")} />
            <QueueRow tint="bg-primary/10 text-primary" icon={Wallet} title="8 payout requests" body="Totalling ₦12.9M" onOpen={() => onGo("payouts")} />
            <QueueRow tint="bg-sky-100 text-sky-700" icon={Flag} title="12 flagged listings" body="Auto-flagged by policy checks" onOpen={() => onGo("listings")} />
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Recent admin actions</h2>
          <ul className="space-y-3 text-sm">
            <ActionRow who="You" what="Approved verification for Adaeze O." when="2 min ago" />
            <ActionRow who="Ola (admin)" what="Refunded ₦45,000 escrow to Ada A." when="27 min ago" />
            <ActionRow who="System" what="Auto-suspended account for velocity fraud" when="1 hr ago" />
            <ActionRow who="Tobi (admin)" what="Approved payout ₦180,000 to GTBank" when="3 hr ago" />
            <ActionRow who="You" what="Added new category: Pet grooming" when="Yesterday" />
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
  email: string;
  role: "Customer" | "Provider" | "Admin";
  joined: string;
  status: "Active" | "Suspended" | "Pending";
  jobs: number;
};

const usersSeed: UserRow[] = [
  { id: "u_001", name: "Ada Adegoke", email: "ada@mail.com", role: "Customer", joined: "Jul 12, 2025", status: "Active", jobs: 14 },
  { id: "u_002", name: "Adaeze Okafor", email: "adaeze@mail.com", role: "Provider", joined: "Feb 04, 2024", status: "Active", jobs: 214 },
  { id: "u_003", name: "Kelechi Musa", email: "kelechi@mail.com", role: "Customer", joined: "May 22, 2025", status: "Active", jobs: 5 },
  { id: "u_004", name: "Tobi Balogun", email: "tobi@mail.com", role: "Provider", joined: "Jan 09, 2025", status: "Suspended", jobs: 3 },
  { id: "u_005", name: "Ngozi Eze", email: "ngozi@mail.com", role: "Customer", joined: "Sep 01, 2025", status: "Active", jobs: 22 },
  { id: "u_006", name: "Chidera Obi", email: "chidera@mail.com", role: "Provider", joined: "Mar 14, 2025", status: "Pending", jobs: 0 },
];

function UsersView() {
  const [rows, setRows] = useState(usersSeed);
  const [q, setQ] = useState("");
  const filtered = rows.filter((r) => (r.name + r.email).toLowerCase().includes(q.toLowerCase()));

  function toggle(id: string) {
    setRows((all) => all.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Suspended" : "Active" } : r)));
  }
  return (
    <Section title="Users" subtitle="Manage every account on the platform.">
      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="w-full max-w-sm rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Jobs</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="p-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground">{u.email}</p>
                </td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 text-muted-foreground">{u.joined}</td>
                <td className="p-3">{u.jobs}</td>
                <td className="p-3">
                  <StatusPill status={u.status} />
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted" title="View"><Eye className="h-3.5 w-3.5" /></button>
                    <button
                      onClick={() => toggle(u.id)}
                      title={u.status === "Active" ? "Suspend" : "Reactivate"}
                      className={`grid h-7 w-7 place-items-center rounded-full border ${u.status === "Active" ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                    >
                      {u.status === "Active" ? <Ban className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
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

function ProvidersView() {
  const pros = [
    { id: "p1", name: "Adaeze Okafor", cat: "Bridal makeup", rating: 4.98, jobs: 214, tier: "Elite" },
    { id: "p2", name: "James Ekene", cat: "Electrician", rating: 4.82, jobs: 96, tier: "Platinum" },
    { id: "p3", name: "Chef Bola", cat: "Private chef", rating: 4.91, jobs: 132, tier: "Gold" },
    { id: "p4", name: "Zainab Ali", cat: "Home cleaning", rating: 4.70, jobs: 58, tier: "Silver" },
  ];
  return (
    <Section title="Providers" subtitle="Featured, verified, and top-earning providers.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pros.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.name}</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.tier}</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.cat}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span>★ {p.rating}</span><span>{p.jobs} jobs</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-full border border-border py-1 text-xs font-semibold hover:bg-muted">Feature</button>
              <button className="flex-1 rounded-full border border-rose-200 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">Suspend</button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function VerificationView() {
  const [rows, setRows] = useState([
    { id: "v1", name: "Chidera Obi", type: "ID + Selfie", submitted: "12 hrs ago", risk: "Low", status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "v2", name: "Bright Osas", type: "Business permit", submitted: "1 day ago", risk: "Medium", status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "v3", name: "Kemi Adeoye", type: "ID + Address", submitted: "2 days ago", risk: "Low", status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "v4", name: "Ifeanyi N.", type: "Background check", submitted: "3 days ago", risk: "High", status: "Pending" as "Pending" | "Approved" | "Rejected" },
  ]);
  function decide(id: string, approved: boolean) {
    setRows((all) => all.map((r) => (r.id === id ? { ...r, status: approved ? "Approved" : "Rejected" } : r)));
  }
  return (
    <Section title="Verification queue" subtitle="Approve or reject identity and business verifications.">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Provider</th><th className="p-3">Type</th><th className="p-3">Submitted</th><th className="p-3">Risk</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3 text-muted-foreground">{r.submitted}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.risk === "High" ? "bg-rose-100 text-rose-700" : r.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{r.risk}</span>
                </td>
                <td className="p-3"><StatusPill status={r.status} /></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {r.status === "Pending" ? (
                      <>
                        <button onClick={() => decide(r.id, true)} className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90">Approve</button>
                        <button onClick={() => decide(r.id, false)} className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Reject</button>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Decided</span>
                    )}
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

function ListingsView() {
  const rows = [
    { id: "l1", title: "Same-day gele styling", by: "Adaeze O.", flags: 0, status: "Live" },
    { id: "l2", title: "Emergency electrician (24h)", by: "James E.", flags: 2, status: "Flagged" },
    { id: "l3", title: "Weekend private chef", by: "Chef Bola", flags: 0, status: "Live" },
    { id: "l4", title: "Deep home cleaning", by: "Zainab A.", flags: 1, status: "Flagged" },
  ];
  return (
    <Section title="Listings" subtitle="Auto-flagged and manually reported listings.">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="p-3">Listing</th><th className="p-3">Provider</th><th className="p-3">Flags</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="p-3 font-semibold">{r.title}</td>
                <td className="p-3">{r.by}</td>
                <td className="p-3">{r.flags}</td>
                <td className="p-3"><StatusPill status={r.status === "Flagged" ? "Pending" : "Active"} /></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Approve</button>
                    <button className="rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">Take down</button>
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

function DisputesView() {
  const rows = [
    { id: "d1", ref: "BK-8821", parties: "Ada A. vs Adaeze O.", amount: 45000, reason: "Provider late by 40 min", status: "Open", age: "2 hr" },
    { id: "d2", ref: "BK-8756", parties: "Ngozi E. vs Chef Bola", amount: 120000, reason: "Dispute on menu delivered", status: "Escalated", age: "1 day" },
    { id: "d3", ref: "BK-8629", parties: "Tobi B. vs Zainab A.", amount: 35000, reason: "No-show claim", status: "Open", age: "4 hr" },
  ];
  return (
    <Section title="Disputes" subtitle="Resolve escrow disputes between customers and providers.">
      <ul className="space-y-3">
        {rows.map((d) => (
          <li key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{d.ref}</p>
                <p className="text-sm font-semibold">{d.parties}</p>
                <p className="text-xs text-muted-foreground">{d.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">₦{d.amount.toLocaleString()}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.status === "Escalated" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  <AlertTriangle className="h-3 w-3" /> {d.status} · {d.age}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">Refund customer</button>
              <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Release to provider</button>
              <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Partial split</button>
              <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Request evidence</button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function PayoutsView() {
  const [rows, setRows] = useState([
    { id: "w1", who: "Adaeze O.", bank: "GTBank •• 4421", amount: 180000, status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "w2", who: "Chef Bola", bank: "Access •• 9012", amount: 240000, status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "w3", who: "James E.", bank: "Zenith •• 3388", amount: 95000, status: "Pending" as "Pending" | "Approved" | "Rejected" },
    { id: "w4", who: "Zainab A.", bank: "UBA •• 7712", amount: 60000, status: "Pending" as "Pending" | "Approved" | "Rejected" },
  ]);
  function decide(id: string, approve: boolean) {
    setRows((all) => all.map((r) => (r.id === id ? { ...r, status: approve ? "Approved" : "Rejected" } : r)));
  }
  const pending = rows.filter((r) => r.status === "Pending");
  const total = pending.reduce((a, b) => a + b.amount, 0);
  return (
    <Section
      title="Payouts"
      subtitle={`${pending.length} pending · ₦${total.toLocaleString()}`}
      right={<button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">Approve all</button>}
    >
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="p-3">Provider</th><th className="p-3">Destination</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="p-3 font-semibold">{r.who}</td>
                <td className="p-3 text-muted-foreground">{r.bank}</td>
                <td className="p-3">₦{r.amount.toLocaleString()}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {r.status === "Pending" ? (
                      <>
                        <button onClick={() => decide(r.id, true)} className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90">Approve</button>
                        <button onClick={() => decide(r.id, false)} className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Reject</button>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Decided</span>
                    )}
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

function CategoriesView() {
  const [cats, setCats] = useState([
    { name: "Beauty & wellness", count: 412 },
    { name: "Home services", count: 386 },
    { name: "Events & catering", count: 274 },
    { name: "Automotive", count: 108 },
    { name: "Tutoring", count: 96 },
    { name: "Health & fitness", count: 133 },
  ]);
  const [draft, setDraft] = useState("");
  return (
    <Section title="Categories" subtitle="Add, rename, or archive service categories.">
      <div className="mb-3 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New category name" className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
        <button
          onClick={() => { if (draft.trim()) { setCats([...cats, { name: draft.trim(), count: 0 }]); setDraft(""); } }}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >Add</button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cats.map((c, i) => (
          <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
            <div><p className="font-medium">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.count} listings</p></div>
            <button onClick={() => setCats(cats.filter((_, k) => k !== i))} className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"><Trash2 className="h-3.5 w-3.5" /></button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ReportsView() {
  const reports = [
    { name: "Monthly GMV report — Sep 2026", size: "1.2 MB" },
    { name: "Verification throughput — Sep 2026", size: "312 KB" },
    { name: "Dispute resolution SLA — Q3 2026", size: "890 KB" },
    { name: "Fraud detection summary — Sep 2026", size: "540 KB" },
  ];
  return (
    <Section title="Reports" subtitle="Downloadable operational and financial reports.">
      <ul className="grid gap-2 sm:grid-cols-2">
        {reports.map((r, i) => (
          <li key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted"><FileText className="h-4 w-4" /></span>
              <div><p className="text-sm font-semibold">{r.name}</p><p className="text-[11px] text-muted-foreground">CSV · {r.size}</p></div>
            </div>
            <button className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">Download</button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FraudView() {
  const rows = [
    { who: "u_984 · new account", signal: "Payment velocity — 8 chargebacks in 24h", risk: "High" },
    { who: "u_812 · Tobi B.", signal: "IP + device shared with suspended account", risk: "Medium" },
    { who: "u_774 · Chidera O.", signal: "Multiple accounts from same device", risk: "Medium" },
    { who: "listing l_2201", signal: "Off-platform payment terms detected", risk: "Low" },
  ];
  return (
    <Section title="Fraud detection" subtitle="Auto-detected risks. Review and take action.">
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold">{r.who}</p>
              <p className="text-xs text-muted-foreground">{r.signal}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.risk === "High" ? "bg-rose-100 text-rose-700" : r.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{r.risk}</span>
              <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold hover:bg-muted">Investigate</button>
              <button className="rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">Suspend</button>
              <button title="Dismiss" className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SettingsView() {
  const [fee, setFee] = useState(12.5);
  const [holdDays, setHoldDays] = useState(2);
  const [autoApprove, setAutoApprove] = useState(false);
  return (
    <Section title="Platform settings" subtitle="Global controls for fees, escrow, and trust policies.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Marketplace fee</h2>
          <p className="text-xs text-muted-foreground">Platform take rate applied to every booking.</p>
          <div className="mt-4 flex items-center gap-3">
            <input type="range" min={5} max={25} step={0.5} value={fee} onChange={(e) => setFee(Number(e.target.value))} className="flex-1" />
            <span className="w-16 rounded-lg border border-border bg-muted px-2 py-1 text-right text-sm font-semibold">{fee}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Escrow hold</h2>
          <p className="text-xs text-muted-foreground">Days funds are held after job completion before auto-release.</p>
          <div className="mt-4 flex items-center gap-3">
            <input type="range" min={0} max={7} step={1} value={holdDays} onChange={(e) => setHoldDays(Number(e.target.value))} className="flex-1" />
            <span className="w-20 rounded-lg border border-border bg-muted px-2 py-1 text-right text-sm font-semibold">{holdDays} day{holdDays === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Auto-approve low-risk verifications</h2>
              <p className="text-xs text-muted-foreground">Providers with clean device + email domain skip manual review.</p>
            </div>
            <button
              role="switch"
              aria-checked={autoApprove}
              onClick={() => setAutoApprove((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${autoApprove ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${autoApprove ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Support & escalation</h2>
          <p className="text-xs text-muted-foreground">Disputes escalated beyond 24h are auto-routed to senior admins.</p>
          <button className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">Save changes</button>
        </div>
      </div>
    </Section>
  );
}
