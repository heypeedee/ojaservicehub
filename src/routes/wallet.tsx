import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  Filter,
  Info,
  Landmark,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet as WalletIcon,
  X,
} from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "HubPoints Wallet · ServiceHub" },
      {
        name: "description",
        content:
          "Manage your HubPoints earnings, track escrow-held payments, and withdraw to your bank in seconds.",
      },
      { property: "og:title", content: "HubPoints Wallet · ServiceHub" },
      {
        property: "og:description",
        content: "Escrow, earnings, withdrawals, and full transaction history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

type TxType = "earning" | "pending" | "withdrawal" | "refund" | "bonus";
type TxStatus = "completed" | "pending" | "processing" | "failed";
type Tx = {
  id: string;
  type: TxType;
  status: TxStatus;
  title: string;
  counterparty: string;
  amount: number; // in HP; negative for outflows
  date: string;
  ref: string;
};

const HP_TO_NGN = 1; // 1 HubPoint = ₦1

const seedTx: Tx[] = [
  {
    id: "t_1024",
    type: "earning",
    status: "completed",
    title: "Bridal glam · Amaka E.",
    counterparty: "Escrow release",
    amount: 82500,
    date: "Today, 09:14",
    ref: "HP-1024",
  },
  {
    id: "t_1023",
    type: "pending",
    status: "pending",
    title: "Party makeup · Tunde B.",
    counterparty: "Escrow hold (24h)",
    amount: 35000,
    date: "Today, 08:02",
    ref: "HP-1023",
  },
  {
    id: "t_1022",
    type: "withdrawal",
    status: "processing",
    title: "Withdraw to GTBank ****4421",
    counterparty: "Bank transfer",
    amount: -120000,
    date: "Yesterday, 18:30",
    ref: "WD-0442",
  },
  {
    id: "t_1021",
    type: "earning",
    status: "completed",
    title: "Hair styling · Grace N.",
    counterparty: "Escrow release",
    amount: 18000,
    date: "Mon, Nov 18",
    ref: "HP-1021",
  },
  {
    id: "t_1020",
    type: "bonus",
    status: "completed",
    title: "5-review streak bonus",
    counterparty: "ServiceHub",
    amount: 2500,
    date: "Sun, Nov 17",
    ref: "BN-018",
  },
  {
    id: "t_1019",
    type: "refund",
    status: "completed",
    title: "Refund · booking cancelled",
    counterparty: "Chika A.",
    amount: -12000,
    date: "Sat, Nov 16",
    ref: "RF-007",
  },
];

const banks = [
  { id: "gt", name: "GTBank", masked: "****4421", primary: true },
  { id: "op", name: "Opay", masked: "****9930", primary: false },
];

function WalletPage() {
  const [tab, setTab] = useState<"all" | "earning" | "pending" | "withdrawal">("all");
  const [q, setQ] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txs, setTxs] = useState<Tx[]>(seedTx);

  const totals = useMemo(() => {
    const available = txs
      .filter((t) => t.status === "completed" || t.status === "processing")
      .reduce((s, t) => s + t.amount, 0);
    const pending = txs
      .filter((t) => t.status === "pending" || t.status === "processing")
      .reduce((s, t) => s + Math.abs(Math.min(t.amount, 0)) + Math.max(t.amount, 0) * (t.status === "pending" ? 1 : 0), 0);
    const completedIn = txs
      .filter((t) => t.status === "completed" && t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const withdrawn = txs
      .filter((t) => t.type === "withdrawal")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { available, pending, completedIn, withdrawn };
  }, [txs]);

  const visible = txs.filter((t) => {
    if (tab === "earning" && !(t.type === "earning" || t.type === "bonus")) return false;
    if (tab === "pending" && t.status !== "pending") return false;
    if (tab === "withdrawal" && t.type !== "withdrawal") return false;
    if (q && !`${t.title} ${t.counterparty} ${t.ref}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  function handleWithdraw(amount: number, bankId: string) {
    const bank = banks.find((b) => b.id === bankId)!;
    setTxs((list) => [
      {
        id: `t_${Date.now()}`,
        type: "withdrawal",
        status: "processing",
        title: `Withdraw to ${bank.name} ${bank.masked}`,
        counterparty: "Bank transfer",
        amount: -amount,
        date: "Just now",
        ref: `WD-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      },
      ...list,
    ]);
    setShowWithdraw(false);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Coins className="h-3.5 w-3.5" /> HubPoints Wallet
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your earnings, protected end-to-end
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every booking is held in ServiceHub escrow. Funds release to you 24h after job completion.
            </p>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
          >
            <Banknote className="h-4 w-4" /> Withdraw to bank
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BalanceCard
            featured
            icon={WalletIcon}
            label="Available balance"
            value={totals.available}
            hint="Ready to withdraw"
          />
          <BalanceCard
            icon={Clock}
            label="Pending"
            value={totals.pending}
            hint="Escrow + processing"
          />
          <BalanceCard
            icon={CheckCircle2}
            label="Completed earnings"
            value={totals.completedIn}
            hint="This month"
          />
          <BalanceCard
            icon={ArrowUpRight}
            label="Total withdrawn"
            value={totals.withdrawn}
            hint="All time"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { k: "all", label: "All" },
                    { k: "earning", label: "Earnings" },
                    { k: "pending", label: "Pending" },
                    { k: "withdrawal", label: "Withdrawals" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                      tab === t.k
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search reference or name"
                    className="w-56 rounded-full border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                  aria-label="Export CSV"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                  aria-label="Filter"
                >
                  <Filter className="h-3.5 w-3.5" /> Filter
                </button>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {visible.map((t) => (
                <TxRow key={t.id} tx={t} />
              ))}
              {visible.length === 0 && (
                <li className="px-5 py-14 text-center text-sm text-muted-foreground">
                  No transactions match your view.
                </li>
              )}
            </ul>
          </div>

          <aside className="space-y-4">
            <EscrowCard />
            <BanksCard />
            <RateCard />
          </aside>
        </section>
      </div>

      {showWithdraw && (
        <WithdrawSheet
          available={totals.available}
          onClose={() => setShowWithdraw(false)}
          onSubmit={handleWithdraw}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to ServiceHub
        </Link>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Escrow secured by ServiceHub Trust
        </div>
      </div>
    </div>
  );
}

function formatHP(v: number) {
  const sign = v < 0 ? "-" : "";
  return `${sign}${Math.abs(v).toLocaleString()} HP`;
}
function formatNGN(v: number) {
  return `₦${Math.abs(v * HP_TO_NGN).toLocaleString()}`;
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
        featured
          ? "border-primary/40 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${featured ? "opacity-90" : "text-muted-foreground"}`}>
          {label}
        </p>
        <Icon className={`h-4 w-4 ${featured ? "opacity-90" : "text-primary"}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{formatHP(value)}</p>
      <p className={`mt-1 text-xs ${featured ? "opacity-80" : "text-muted-foreground"}`}>
        ≈ {formatNGN(value)} · {hint}
      </p>
    </div>
  );
}

function TxRow({ tx }: { tx: Tx }) {
  const isOut = tx.amount < 0;
  const iconMap: Record<TxType, typeof WalletIcon> = {
    earning: ArrowDownLeft,
    pending: Clock,
    withdrawal: ArrowUpRight,
    refund: ArrowUpRight,
    bonus: Sparkles,
  };
  const Icon = iconMap[tx.type];
  const tone =
    tx.status === "completed"
      ? isOut
        ? "text-muted-foreground"
        : "text-emerald-600"
      : tx.status === "pending"
        ? "text-amber-600"
        : tx.status === "processing"
          ? "text-sky-600"
          : "text-rose-600";

  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          isOut ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{tx.title}</p>
          <StatusPill status={tx.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {tx.counterparty} · {tx.date} · {tx.ref}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${tone}`}>
          {isOut ? "-" : "+"}
          {Math.abs(tx.amount).toLocaleString()} HP
        </p>
        <p className="text-[10px] text-muted-foreground">≈ {formatNGN(tx.amount)}</p>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-sky-50 text-sky-700",
    failed: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[status]}`}
    >
      {status}
    </span>
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
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            1
          </span>
          Customer pays into ServiceHub escrow at booking.
        </li>
        <li className="flex gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            2
          </span>
          Funds sit in escrow until the job is marked complete.
        </li>
        <li className="flex gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            3
          </span>
          You receive HubPoints 24h later — no chargeback risk.
        </li>
      </ol>
    </div>
  );
}

function BanksCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <Landmark className="h-4 w-4 text-primary" /> Payout accounts
        </h3>
        <button className="text-xs font-semibold text-primary hover:underline">Add</button>
      </div>
      <ul className="mt-3 space-y-2">
        {banks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-[10px] text-muted-foreground">{b.masked}</p>
              </div>
            </div>
            {b.primary && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Primary
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RateCard() {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex items-center gap-2 text-primary">
        <Info className="h-4 w-4" />
        <h3 className="text-sm font-semibold">HubPoints rate</h3>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        1 HP = ₦1. Withdrawals settle instantly to Nigerian banks (₦50 flat fee, waived above 100,000 HP).
      </p>
    </div>
  );
}

function WithdrawSheet({
  available,
  onClose,
  onSubmit,
}: {
  available: number;
  onClose: () => void;
  onSubmit: (amount: number, bankId: string) => void;
}) {
  const [amount, setAmount] = useState<string>("50000");
  const [bank, setBank] = useState(banks[0].id);
  const num = Number(amount) || 0;
  const fee = num >= 100000 ? 0 : 50;
  const receive = Math.max(0, num - fee);
  const invalid = num <= 0 || num > available;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (invalid) return;
          onSubmit(num, bank);
        }}
        className="relative m-3 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Withdraw to bank</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Amount (HP)</label>
              <button
                type="button"
                onClick={() => setAmount(String(available))}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Use max · {available.toLocaleString()}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full bg-transparent text-lg font-semibold outline-none"
                placeholder="0"
              />
              <span className="text-xs text-muted-foreground">HP</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ≈ {formatNGN(num)} · fee {formatHP(fee)} · you receive{" "}
              <span className="font-semibold text-foreground">{formatHP(receive)}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Payout to</p>
            <div className="mt-2 space-y-2">
              {banks.map((b) => (
                <label
                  key={b.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                    bank === b.id ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bank"
                      className="accent-primary"
                      checked={bank === b.id}
                      onChange={() => setBank(b.id)}
                    />
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {b.name} <span className="text-muted-foreground">{b.masked}</span>
                    </span>
                  </span>
                  {b.primary && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Primary
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {num > available && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Amount exceeds available balance ({formatHP(available)}).
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Bank transfers usually arrive in under 60 seconds.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={invalid}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow disabled:opacity-50"
            >
              Withdraw {num > 0 ? formatHP(num) : ""}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
