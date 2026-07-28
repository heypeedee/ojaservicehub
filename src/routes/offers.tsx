import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { OjaLogo } from "@/components/OjaLogo";
import {
  ArrowLeftRight,
  Check,
  Clock,
  Crown,
  Gavel,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bargain & bid · Ọjà" },
      {
        name: "description",
        content:
          "Negotiate service prices with providers or run highest-bidder auctions on Ọjà — counter-offers, escrow-safe accepts, and live bid tracking.",
      },
      { property: "og:title", content: "Bargain & bid · Ọjà" },
      {
        property: "og:description",
        content: "Bargain prices or run highest-bidder auctions on Ọjà.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OffersPage,
});

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

type BargainSide = "customer" | "provider";
type BargainStatus = "open" | "accepted" | "declined";
type BargainMsg = {
  id: string;
  side: BargainSide;
  amount: number;
  note?: string;
  at: string;
};
type Bargain = {
  id: string;
  service: string;
  provider: string;
  craft: string;
  listPrice: number;
  status: BargainStatus;
  history: BargainMsg[];
  agreedAt?: string;
  agreedAmount?: number;
};

type Bid = { id: string; bidder: string; amount: number; at: string; badge?: string };
type Auction = {
  id: string;
  title: string;
  postedBy: string;
  area: string;
  category: string;
  budgetCap: number; // customer's max
  minStart: number;
  endsAt: number; // epoch ms
  reverse: true; // "highest-bidder" for the customer = lowest price wins, but user asked for highest-bidder-style too, so allow forward too
  bids: Bid[];
};

type ForwardAuction = {
  id: string;
  title: string;
  seller: string;
  area: string;
  category: string;
  reservePrice: number;
  endsAt: number;
  bids: Bid[];
};

const now = Date.now();
const inHours = (h: number) => now + h * 3600_000;
const agoMin = (m: number) => new Date(now - m * 60_000).toISOString();

const seedBargains: Bargain[] = [
  {
    id: "b1",
    service: "Full home deep clean · 3 bedrooms",
    provider: "SparkleHome by Chika",
    craft: "Home cleaning",
    listPrice: 45000,
    status: "open",
    history: [
      { id: "m1", side: "provider", amount: 45000, note: "List price", at: agoMin(240) },
      { id: "m2", side: "customer", amount: 32000, note: "Small flat, no kitchen work", at: agoMin(180) },
      { id: "m3", side: "provider", amount: 38000, note: "Includes windows + balcony", at: agoMin(120) },
    ],
  },
  {
    id: "b2",
    service: "Wedding makeup + gele",
    provider: "Adaeze Beauty",
    craft: "Makeup artist",
    listPrice: 120000,
    status: "accepted",
    listAccepted: 95000,
    history: [
      { id: "m1", side: "provider", amount: 120000, at: agoMin(1440) },
      { id: "m2", side: "customer", amount: 90000, at: agoMin(1200) },
      { id: "m3", side: "provider", amount: 100000, at: agoMin(1100) },
      { id: "m4", side: "customer", amount: 95000, at: agoMin(900) },
      { id: "m5", side: "provider", amount: 95000, note: "Deal ✅", at: agoMin(880) },
    ],
    agreedAmount: 95000,
    agreedAt: agoMin(880),
  } as Bargain,
];

const seedReverse: Auction[] = [
  {
    id: "a1",
    title: "Fix leaking kitchen sink today",
    postedBy: "You",
    area: "Lekki Phase 1",
    category: "Plumber",
    budgetCap: 25000,
    minStart: 25000,
    endsAt: inHours(2),
    reverse: true,
    bids: [
      { id: "x1", bidder: "Kunle · Verified", amount: 22000, at: agoMin(35) },
      { id: "x2", bidder: "PipeMaster NG", amount: 19500, at: agoMin(20), badge: "Elite" },
      { id: "x3", bidder: "QuickFix Emeka", amount: 18000, at: agoMin(6) },
    ],
  },
];

const seedForward: ForwardAuction[] = [
  {
    id: "f1",
    title: "Prime Saturday afternoon slot · Elite barber",
    seller: "Cuts by Tunde (Elite)",
    area: "Ikeja GRA",
    category: "Barber",
    reservePrice: 8000,
    endsAt: inHours(6),
    bids: [
      { id: "y1", bidder: "Anon buyer #4291", amount: 9000, at: agoMin(90) },
      { id: "y2", bidder: "Anon buyer #7712", amount: 11500, at: agoMin(45) },
      { id: "y3", bidder: "Anon buyer #1120", amount: 13000, at: agoMin(9), badge: "Top bidder" },
    ],
  },
];

function OffersPage() {
  const [tab, setTab] = useState<"bargain" | "reverse" | "forward">("bargain");

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={32} />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/search" search={{ q: "" }} className="hover:text-foreground">Search</Link>
            <Link to="/instant-match" className="hover:text-foreground">Instant Match</Link>
            <Link to="/offers" className="text-foreground">Offers</Link>
            <Link to="/messages" className="hover:text-foreground">Messages</Link>
          </nav>
          <Link to="/dashboard" className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            My dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Bargain-friendly marketplace
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Negotiate a fair price. Or let bidders compete.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Send counter-offers to any provider, or turn on <b>Highest Bidder</b> mode so the market names your price —
              agreed amounts move straight into escrow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-full border border-border bg-card p-1 text-xs font-semibold">
            {[
              { key: "bargain", label: "Bargain chats", icon: ArrowLeftRight },
              { key: "reverse", label: "My job · pros bid", icon: TrendingDown },
              { key: "forward", label: "Highest-bidder slots", icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as typeof tab)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
                  tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {tab === "bargain" && <BargainList />}
          {tab === "reverse" && <ReverseAuctions />}
          {tab === "forward" && <ForwardAuctions />}
        </div>

        <HowItWorks />
      </section>
    </div>
  );
}

// ---------- Bargain ----------

function BargainList() {
  const [items, setItems] = useState<Bargain[]>(seedBargains);
  const [activeId, setActiveId] = useState<string>(items[0].id);
  const active = items.find((i) => i.id === activeId) ?? items[0];

  function update(next: Bargain) {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-2 rounded-3xl border border-border bg-card p-3 shadow-sm">
        {items.map((b) => {
          const last = b.history[b.history.length - 1];
          const active = b.id === activeId;
          return (
            <button
              key={b.id}
              onClick={() => setActiveId(b.id)}
              className={`flex w-full flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                active ? "border-primary bg-brand-soft" : "border-transparent bg-background hover:border-border"
              }`}
            >
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{b.provider}</span>
                <StatusPill status={b.status} />
              </div>
              <p className="text-sm">{b.service}</p>
              <div className="flex w-full items-center justify-between text-[11px]">
                <span className="text-muted-foreground">List {naira(b.listPrice)}</span>
                <span className="font-semibold text-brand">
                  {last.side === "customer" ? "You" : "Pro"}: {naira(last.amount)}
                </span>
              </div>
            </button>
          );
        })}
      </aside>

      <BargainThread bargain={active} onUpdate={update} />
    </div>
  );
}

function StatusPill({ status }: { status: BargainStatus }) {
  const map = {
    open: { label: "In negotiation", cls: "bg-amber-100 text-amber-800" },
    accepted: { label: "Deal ✓", cls: "bg-emerald-100 text-emerald-800" },
    declined: { label: "Declined", cls: "bg-rose-100 text-rose-800" },
  } as const;
  const v = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.cls}`}>{v.label}</span>;
}

function BargainThread({ bargain, onUpdate }: { bargain: Bargain; onUpdate: (b: Bargain) => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const last = bargain.history[bargain.history.length - 1];
  const nextSide: BargainSide = last.side === "customer" ? "provider" : "customer";
  const discount = Math.round(((bargain.listPrice - last.amount) / bargain.listPrice) * 100);

  function send(side: BargainSide) {
    if (!amount || amount <= 0) return;
    onUpdate({
      ...bargain,
      status: "open",
      history: [
        ...bargain.history,
        { id: crypto.randomUUID(), side, amount, note: note || undefined, at: new Date().toISOString() },
      ],
    });
    setAmount(0);
    setNote("");
  }

  function accept() {
    onUpdate({
      ...bargain,
      status: "accepted",
      agreedAmount: last.amount,
      agreedAt: new Date().toISOString(),
      history: [
        ...bargain.history,
        { id: crypto.randomUUID(), side: nextSide, amount: last.amount, note: "Accepted ✅", at: new Date().toISOString() },
      ],
    });
  }

  function decline() {
    onUpdate({ ...bargain, status: "declined" });
  }

  return (
    <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-5 py-4">
        <div>
          <p className="text-sm font-semibold">{bargain.service}</p>
          <p className="text-xs text-muted-foreground">
            with {bargain.provider} · {bargain.craft}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-muted px-3 py-1 font-semibold">
            List: {naira(bargain.listPrice)}
          </span>
          <span className={`rounded-full px-3 py-1 font-semibold ${
            discount > 0 ? "bg-brand-soft text-brand" : "bg-amber-100 text-amber-800"
          }`}>
            Current: {naira(last.amount)} ({discount > 0 ? `-${discount}%` : `+${Math.abs(discount)}%`})
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-5 py-6">
        {bargain.history.map((m) => {
          const mine = m.side === "customer";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-background"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                  {mine ? "You (customer)" : "Provider"}
                </p>
                <p className="mt-1 text-lg font-semibold">{naira(m.amount)}</p>
                {m.note && <p className="mt-1 text-xs opacity-90">{m.note}</p>}
                <p className={`mt-2 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        {bargain.status === "accepted" && (
          <div className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-xs text-emerald-800">
            <ShieldCheck className="mx-auto mb-1 h-4 w-4" />
            Deal at <b>{naira(bargain.agreedAmount ?? 0)}</b> · funds ready to move to escrow.
          </div>
        )}
        {bargain.status === "declined" && (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-xs text-rose-800">
            Negotiation closed. Start a new one anytime.
          </div>
        )}
      </div>

      {bargain.status === "open" && (
        <div className="space-y-3 border-t border-border bg-background/60 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Quick offers:</span>
            {[0.95, 0.9, 0.85, 0.8].map((f) => (
              <button
                key={f}
                onClick={() => setAmount(Math.round((bargain.listPrice * f) / 100) * 100)}
                className="rounded-full border border-border bg-card px-3 py-1 font-semibold hover:border-primary/40"
              >
                {Math.round(f * 100)}% · {naira(Math.round((bargain.listPrice * f) / 100) * 100)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₦
              </span>
              <input
                type="number"
                min={0}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Your counter-offer"
                className="w-full rounded-full border border-border bg-background py-2.5 pl-8 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="flex-1 min-w-[180px] rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => send("customer")}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Send counter
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Waiting on <b className="capitalize text-foreground">{nextSide}</b> · last offer: {naira(last.amount)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={decline}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 font-semibold text-rose-600 hover:border-rose-300"
              >
                <X className="h-3.5 w-3.5" /> Decline
              </button>
              <button
                onClick={accept}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 font-semibold text-white"
              >
                <Check className="h-3.5 w-3.5" /> Accept {naira(last.amount)}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Reverse auctions (pros bid lower to win the job) ----------

function ReverseAuctions() {
  const [items, setItems] = useState<Auction[]>(seedReverse);
  const [showNew, setShowNew] = useState(false);
  const active = items[0];
  const best = useMemo(
    () => (active ? [...active.bids].sort((a, b) => a.amount - b.amount)[0] : null),
    [active],
  );

  function addBid(auctionId: string, bid: Bid) {
    setItems((prev) =>
      prev.map((a) => (a.id === auctionId ? { ...a, bids: [...a.bids, bid] } : a)),
    );
  }

  function createAuction(a: Auction) {
    setItems((prev) => [a, ...prev]);
    setShowNew(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Your open jobs · providers bid to win</p>
          <p className="text-xs text-muted-foreground">
            Set a max budget. Verified pros compete — the lowest qualified bid wins.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Post a job
        </button>
      </div>

      {items.map((a) => (
        <ReverseCard key={a.id} auction={a} onBid={(b) => addBid(a.id, b)} winner={a.id === active.id ? best : null} />
      ))}

      {showNew && <NewJobDialog onClose={() => setShowNew(false)} onCreate={createAuction} />}
    </div>
  );
}

function ReverseCard({ auction, onBid, winner }: { auction: Auction; onBid: (b: Bid) => void; winner: Bid | null }) {
  const sorted = [...auction.bids].sort((a, b) => a.amount - b.amount);
  const [bidderAmount, setBidderAmount] = useState<number>(0);
  const [bidderName, setBidderName] = useState("");

  const ms = Math.max(0, auction.endsAt - Date.now());
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const timeLeft = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;

  function submit() {
    if (!bidderAmount || !bidderName.trim()) return;
    if (bidderAmount >= sorted[0]?.amount) return;
    onBid({
      id: crypto.randomUUID(),
      bidder: bidderName.trim(),
      amount: bidderAmount,
      at: new Date().toISOString(),
    });
    setBidderAmount(0);
  }

  return (
    <article className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800">
            <Clock className="h-3 w-3" /> {timeLeft} left
          </span>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            Reverse auction
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold">{auction.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {auction.category} · {auction.area} · posted by {auction.postedBy}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Your max budget" value={naira(auction.budgetCap)} />
          <Stat label="Best bid" value={sorted[0] ? naira(sorted[0].amount) : "—"} accent />
        </div>
        {winner && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <b>{winner.bidder}</b> is currently winning at <b>{naira(winner.amount)}</b> — that's{" "}
            {Math.round(((auction.budgetCap - winner.amount) / auction.budgetCap) * 100)}% below your cap.
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-dashed border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground">
            Provider view · place a lower bid (demo)
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              placeholder="Your business name"
              className="flex-1 min-w-[160px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₦
              </span>
              <input
                type="number"
                value={bidderAmount || ""}
                onChange={(e) => setBidderAmount(Number(e.target.value))}
                placeholder="Bid"
                className="w-32 rounded-full border border-border bg-background py-2 pl-6 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={submit}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Gavel className="h-4 w-4" /> Bid
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Must undercut the current best of {sorted[0] ? naira(sorted[0].amount) : "—"}.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live bids</p>
        <ol className="mt-3 space-y-2">
          {sorted.map((b, i) => (
            <li
              key={b.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                i === 0 ? "border border-emerald-200 bg-emerald-50" : "bg-background"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{b.bidder}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(b.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{naira(b.amount)}</p>
                {i === 0 && <p className="text-[10px] font-semibold text-emerald-700">Winning</p>}
              </div>
            </li>
          ))}
        </ol>
        <button className="mt-4 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">
          Award to {sorted[0]?.bidder ?? "top bidder"}
        </button>
      </div>
    </article>
  );
}

// ---------- Forward auctions (buyers bid highest for scarce slots/services) ----------

function ForwardAuctions() {
  const [items, setItems] = useState<ForwardAuction[]>(seedForward);

  function placeBid(id: string, amount: number, name: string) {
    setItems((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              bids: [
                ...a.bids,
                { id: crypto.randomUUID(), bidder: name || `Anon buyer #${Math.floor(Math.random() * 9000) + 1000}`, amount, at: new Date().toISOString() },
              ],
            },
      ),
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((a) => (
        <ForwardCard key={a.id} auction={a} onBid={(amt, name) => placeBid(a.id, amt, name)} />
      ))}
    </div>
  );
}

function ForwardCard({ auction, onBid }: { auction: ForwardAuction; onBid: (amount: number, name: string) => void }) {
  const sorted = [...auction.bids].sort((a, b) => b.amount - a.amount);
  const top = sorted[0];
  const minNext = (top?.amount ?? auction.reservePrice) + 500;
  const [amount, setAmount] = useState<number>(minNext);
  const [name, setName] = useState("");

  const ms = Math.max(0, auction.endsAt - Date.now());
  const hrs = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);

  function submit() {
    if (amount < minNext) return;
    onBid(amount, name);
    setAmount(amount + 500);
    setName("");
  }

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-charcoal">
          <Crown className="h-3 w-3" /> Highest bidder wins
        </span>
        <span className="text-[11px] text-muted-foreground">
          <Clock className="mr-1 inline h-3 w-3" /> {hrs}h {mins}m left
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold">{auction.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {auction.category} · {auction.area} · offered by {auction.seller}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Reserve" value={naira(auction.reservePrice)} />
        <Stat label="Top bid" value={top ? naira(top.amount) : "—"} accent />
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top bidders</p>
        <ol className="mt-2 space-y-1.5">
          {sorted.slice(0, 3).map((b, i) => (
            <li key={b.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold ${
                    i === 0 ? "bg-gold text-charcoal" : "bg-background text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                {b.bidder}
              </span>
              <span className={`font-semibold ${i === 0 ? "text-brand" : ""}`}>{naira(b.amount)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bid as (optional)"
          className="flex-1 min-w-[140px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            ₦
          </span>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder={`Min ${naira(minNext)}`}
            className="w-32 rounded-full border border-border bg-background py-2 pl-6 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={submit}
          disabled={amount < minNext}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Gavel className="h-4 w-4" /> Place bid
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Must beat {top ? naira(top.amount) : naira(auction.reservePrice)} by ₦500 or more. Funds only capture if you win.
      </p>
    </article>
  );
}

// ---------- Shared bits ----------

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${accent ? "border-primary/30 bg-brand-soft" : "border-border bg-background"}`}>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}

function NewJobDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Auction) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cleaner");
  const [area, setArea] = useState("Lekki");
  const [budget, setBudget] = useState(20000);
  const [hours, setHours] = useState(4);

  function submit() {
    if (!title.trim()) return;
    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      postedBy: "You",
      area,
      category,
      budgetCap: budget,
      minStart: budget,
      endsAt: inHours(hours),
      reverse: true,
      bids: [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Post a job for bids</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Providers will compete under your budget cap until the timer runs out.
        </p>
        <div className="mt-4 space-y-3">
          <Field label="What do you need?">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Move a 3-seater sofa from Yaba to Ikeja"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {["Cleaner", "Plumber", "Electrician", "Mover", "Painter", "Handyman", "Barber", "Chef"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Area">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {["Lekki", "Ikeja", "Yaba", "Surulere", "Victoria Island", "Ajah", "Maryland"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Max budget (₦)">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Auction length (hours)">
              <input
                type="number"
                min={1}
                max={72}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Post job
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function HowItWorks() {
  return (
    <section className="mt-14 grid gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm md:grid-cols-3">
      {[
        {
          icon: ArrowLeftRight,
          title: "Bargain 1-on-1",
          body: "Send a counter-offer on any listed price. The provider can accept, decline, or counter back.",
        },
        {
          icon: TrendingDown,
          title: "Reverse auctions",
          body: "Post a job with a max budget. Verified pros compete by bidding lower — you award the winner.",
        },
        {
          icon: Crown,
          title: "Highest bidder",
          body: "Providers list scarce slots (Elite barber Saturday, top MUA wedding day). Bidders push the price up until the timer ends.",
        },
      ].map(({ icon: Icon, title, body }) => (
        <div key={title}>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-3 font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
      ))}
    </section>
  );
}
