import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Building2,
  Clock,
  Landmark,
  Lock,
  Search,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Ọjà" },
      {
        name: "description",
        content: "Track escrow-held payments and released earnings from your real bookings.",
      },
      { property: "og:title", content: "Wallet · Ọjà" },
      { property: "og:description", content: "Escrow and payout history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

type Tx = {
  id: string;
  status: "Paid" | "Released";
  title: string;
  when: string;
  amount: number;
};

function WalletPage() {
  const [tab, setTab] = useState<"all" | "released" | "escrow">("all");
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [payout, setPayout] = useState<{ bank_name: string; account_number: string; account_name: string } | null>(null);

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
      const [{ data: bookings }, { data: payoutRow }] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, service_title, payout_amount, payment_status, updated_at")
          .eq("provider_id", uid)
          .in("payment_status", ["Paid", "Released"])
          .order("updated_at", { ascending: false }),
        supabase
          .from("provider_payout_details")
          .select("bank_name, account_number, account_name")
          .eq("provider_id", uid)
          .maybeSingle(),
      ]);
      if (!active) return;
      setTxs(
        (bookings ?? []).map((b) => ({
          id: b.id,
          status: b.payment_status as "Paid" | "Released",
          title: b.service_title,
          when: new Date(b.updated_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
          amount: Number(b.payout_amount),
        }))
      );
      setPayout(payoutRow ?? null);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const available = txs.filter((t) => t.status === "Released").reduce((s, t) => s + t.amount, 0);
    const escrow = txs.filter((t) => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
    return { available, escrow };
  }, [txs]);

  const visible = txs.filter((t) => {
    if (tab === "released" && t.status !== "Released") return false;
    if (tab === "escrow" && t.status !== "Paid") return false;
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  if (!loading && !userId) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-semibold text-foreground">Sign in to view your wallet.</p>
          <Link to="/signup" className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Sign in / create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <WalletIcon className="h-3.5 w-3.5" /> Wallet
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your real earnings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every paid booking sits in escrow until you mark the job complete and release it.
            </p>
          </div>
          <Link
            to="/pro/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
          >
            Go release a payment →
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <BalanceCard featured icon={WalletIcon} label="Paid out to you" value={totals.available} hint="All time, released" />
          <BalanceCard icon={Clock} label="Held in escrow" value={totals.escrow} hint="Release from Orders once complete" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { k: "all", label: "All" },
                    { k: "released", label: "Released" },
                    { k: "escrow", label: "In escrow" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                      tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by service"
                  className="w-56 rounded-full border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <ul className="divide-y divide-border">
              {loading && <li className="px-5 py-14 text-center text-sm text-muted-foreground">Loading…</li>}
              {!loading &&
                visible.map((t) => (
                  <TxRow key={t.id} tx={t} />
                ))}
              {!loading && visible.length === 0 && (
                <li className="px-5 py-14 text-center text-sm text-muted-foreground">
                  Nothing here yet — paid bookings will show up once customers book you.
                </li>
              )}
            </ul>
          </div>

          <aside className="space-y-4">
            <EscrowCard />
            <BanksCard payout={payout} />
          </aside>
        </section>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BackNav label="Back to Ọjà" />
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Escrow via Paystack
        </div>
      </div>
    </div>
  );
}

function BalanceCard({
  icon: Icon,
  label,
  value,
  hint,
  featured = false,
}: {
  icon: typeof WalletIcon;
  label: string;
  value: number;
  hint: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        featured ? "border-primary/40 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${featured ? "opacity-90" : "text-muted-foreground"}`}>{label}</p>
        <Icon className={`h-4 w-4 ${featured ? "opacity-90" : "text-primary"}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">₦{value.toLocaleString()}</p>
      <p className={`mt-1 text-xs ${featured ? "opacity-80" : "text-muted-foreground"}`}>{hint}</p>
    </div>
  );
}

function TxRow({ tx }: { tx: Tx }) {
  const released = tx.status === "Released";
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${released ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {released ? <ArrowDownLeft className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{tx.title}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${released ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {released ? "Released" : "In escrow"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{tx.when}</p>
      </div>
      <p className={`text-sm font-semibold ${released ? "text-emerald-600" : "text-muted-foreground"}`}>
        {released ? "+" : ""}₦{tx.amount.toLocaleString()}
      </p>
    </li>
  );
}

function EscrowCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">How escrow works</h3>
      </div>
      <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
        <li className="flex gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">1</span>
          Customer pays via Paystack at booking.
        </li>
        <li className="flex gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">2</span>
          Funds sit in escrow until you mark the job Completed.
        </li>
        <li className="flex gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">3</span>
          You press Release payment in Orders — it's not automatic.
        </li>
      </ol>
    </div>
  );
}

function BanksCard({ payout }: { payout: { bank_name: string; account_number: string; account_name: string } | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <Landmark className="h-4 w-4 text-primary" /> Payout account
        </h3>
        <Link to="/pro/dashboard" className="text-xs font-semibold text-primary hover:underline">
          {payout ? "Update" : "Add"}
        </Link>
      </div>
      {payout ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{payout.bank_name}</p>
              <p className="text-[10px] text-muted-foreground">
                {payout.account_name} · ••••{payout.account_number.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No payout account on file yet — add one in your dashboard's Settings tab before you can release a payment.
        </p>
      )}
    </div>
  );
}
