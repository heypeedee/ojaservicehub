import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Filter,
  Gift,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Wallet,
  Wrench,
} from "lucide-react";

type Category =
  | "bookings"
  | "payments"
  | "messages"
  | "reviews"
  | "withdrawals"
  | "disputes"
  | "verification"
  | "promotions"
  | "security"
  | "system";
type Channel = "email" | "sms" | "push" | "inapp";

const categoryMeta: Record<Category, { label: string; icon: typeof Calendar; tint: string; critical?: boolean }> = {
  bookings: { label: "Bookings", icon: Calendar, tint: "bg-primary/10 text-primary", critical: true },
  payments: { label: "Payments", icon: CreditCard, tint: "bg-emerald-100 text-emerald-700", critical: true },
  messages: { label: "Messages", icon: MessageSquare, tint: "bg-sky-100 text-sky-700" },
  reviews: { label: "Reviews", icon: Star, tint: "bg-amber-100 text-amber-700" },
  withdrawals: { label: "Withdrawals", icon: Wallet, tint: "bg-violet-100 text-violet-700", critical: true },
  disputes: { label: "Disputes", icon: AlertTriangle, tint: "bg-red-100 text-red-700", critical: true },
  verification: { label: "Verification", icon: ShieldCheck, tint: "bg-teal-100 text-teal-700" },
  promotions: { label: "Promotions", icon: Gift, tint: "bg-fuchsia-100 text-fuchsia-700" },
  security: { label: "Account & security", icon: Lock, tint: "bg-slate-200 text-slate-700", critical: true },
  system: { label: "System updates", icon: Wrench, tint: "bg-orange-100 text-orange-700" },
};

const channelMeta: Record<Channel, { label: string; icon: typeof Mail }> = {
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: Smartphone },
  push: { label: "Push", icon: Bell },
  inapp: { label: "In-app", icon: BellOff },
};

type Notification = {
  id: string;
  category: Category;
  title: string;
  body: string;
  when: string;
  read: boolean;
  channels: Channel[];
  cta?: { label: string; to: string };
};

const seed: Notification[] = [
  {
    id: "n1",
    category: "bookings",
    title: "New booking request",
    body: "Ada A. requested Bridal trial makeup for today at 4:00 PM in Lekki Phase 1.",
    when: "2 min ago",
    read: false,
    channels: ["push", "inapp", "email"],
    cta: { label: "Review request", to: "/provider/bookings" },
  },
  {
    id: "n2",
    category: "payments",
    title: "Escrow received — ₦90,000",
    body: "Ngozi E. paid for Full glam + gele. Funds are held in escrow until job completion.",
    when: "18 min ago",
    read: false,
    channels: ["email", "sms", "inapp"],
    cta: { label: "Open wallet", to: "/wallet" },
  },
  {
    id: "n3",
    category: "messages",
    title: "Chidera O. sent you a message",
    body: '"Hi Adaeze, can we push the trial to Saturday morning instead?"',
    when: "1 hr ago",
    read: false,
    channels: ["push", "inapp"],
    cta: { label: "Reply", to: "/messages" },
  },
  {
    id: "n4",
    category: "disputes",
    title: "Dispute opened by customer",
    body: "Emeka U. reported a mismatch on the delivered service. Please respond within 24 hours.",
    when: "3 hr ago",
    read: false,
    channels: ["email", "push", "inapp"],
    cta: { label: "Open dispute", to: "/admin" },
  },
  {
    id: "n5",
    category: "verification",
    title: "You are now verified ✓",
    body: "Your ID passed our checks. Your storefront now displays the blue trust badge.",
    when: "5 hr ago",
    read: true,
    channels: ["email", "inapp"],
    cta: { label: "See storefront", to: "/pro/adaeze" },
  },
  {
    id: "n6",
    category: "reviews",
    title: "New 5-star review",
    body: 'Kelechi M.: "On time, calm energy, gorgeous work. Photos came out stunning."',
    when: "6 hr ago",
    read: true,
    channels: ["email", "inapp"],
    cta: { label: "Open profile", to: "/pro/adaeze" },
  },
  {
    id: "n7",
    category: "security",
    title: "New sign-in from Chrome · Lagos",
    body: "If this wasn't you, sign out of all devices and reset your password immediately.",
    when: "Yesterday",
    read: false,
    channels: ["email", "sms", "inapp"],
  },
  {
    id: "n8",
    category: "withdrawals",
    title: "Withdrawal successful — ₦120,000",
    body: "Transferred to GTBank •• 4421. Should reflect within 10 minutes.",
    when: "Yesterday",
    read: true,
    channels: ["email", "sms", "inapp"],
    cta: { label: "View transaction", to: "/wallet" },
  },
  {
    id: "n9",
    category: "promotions",
    title: "Premium 20% off this month",
    body: "Unlock featured placement, AI tools and priority support with an upgraded plan.",
    when: "Yesterday",
    read: true,
    channels: ["email", "inapp"],
    cta: { label: "See plans", to: "/plans" },
  },
  {
    id: "n10",
    category: "system",
    title: "Scheduled maintenance · Sunday 2–3 AM",
    body: "Payments and messaging may be briefly unavailable during the upgrade window.",
    when: "2 days ago",
    read: true,
    channels: ["inapp", "email"],
  },
];

const defaultPrefs: Record<Category, Record<Channel, boolean>> = {
  bookings: { email: true, sms: true, push: true, inapp: true },
  payments: { email: true, sms: true, push: false, inapp: true },
  messages: { email: false, sms: false, push: true, inapp: true },
  reviews: { email: true, sms: false, push: true, inapp: true },
  withdrawals: { email: true, sms: true, push: false, inapp: true },
  disputes: { email: true, sms: true, push: true, inapp: true },
  verification: { email: true, sms: false, push: true, inapp: true },
  promotions: { email: false, sms: false, push: false, inapp: true },
  security: { email: true, sms: true, push: true, inapp: true },
  system: { email: true, sms: false, push: false, inapp: true },
};

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Ọjà" },
      {
        name: "description",
        content:
          "Bookings, payments, messages, reviews, withdrawals, disputes, verification, promotions and security alerts — delivered via email, SMS, push and in-app.",
      },
      { property: "og:title", content: "Notifications · Ọjà" },
      { property: "og:description", content: "One inbox for every important update." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [items, setItems] = useState<Notification[]>(seed);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [quiet, setQuiet] = useState({ on: true, from: "22:00", to: "07:00" });
  const [digest, setDigest] = useState<"instant" | "hourly" | "daily">("instant");
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = filter === "all" ? items : items.filter((n) => n.category === filter);
    if (showUnreadOnly) list = list.filter((n) => !n.read);
    return list;
  }, [items, filter, showUnreadOnly]);
  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setItems((all) => all.map((n) => ({ ...n, read: true })));
  }
  function markOne(id: string) {
    setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
  function toggle(cat: Category, ch: Channel) {
    if (categoryMeta[cat].critical && ch === "inapp") return; // critical stays on in-app
    setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [ch]: !p[cat][ch] } }));
  }
  function sendTest(ch: Channel) {
    setTestFeedback(`Test ${channelMeta[ch].label} sent — check your ${ch === "sms" ? "phone" : ch === "email" ? "inbox" : "device"}.`);
    setTimeout(() => setTestFeedback(null), 2600);
  }

  const filterOrder: ("all" | Category)[] = [
    "all",
    "bookings",
    "payments",
    "messages",
    "reviews",
    "withdrawals",
    "disputes",
    "verification",
    "promotions",
    "security",
    "system",
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Ọjà
          </Link>
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs">
            {(
              [
                { k: "inbox", l: `Inbox${unread ? ` (${unread})` : ""}` },
                { k: "settings", l: "Settings" },
              ] as const
            ).map((o) => (
              <button
                key={o.k}
                onClick={() => setTab(o.k)}
                className={`rounded-full px-3 py-1 font-semibold ${tab === o.k ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Bookings, payments, messages, reviews, withdrawals, disputes, verification, promotions, security and system updates — all in one place, delivered however you prefer.
          </p>
        </header>

        {tab === "inbox" ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Filter:</span>
                {filterOrder.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full border px-2.5 py-1 font-semibold capitalize ${
                      filter === f ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "all" ? "All" : categoryMeta[f as Category].label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  />
                  Unread only
                </label>
                <button
                  onClick={markAll}
                  disabled={unread === 0}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {filtered.map((n) => {
                const Meta = categoryMeta[n.category];
                const Icon = Meta.icon;
                return (
                  <li
                    key={n.id}
                    className={`flex gap-3 rounded-2xl border p-4 shadow-sm transition ${
                      n.read ? "border-border bg-card" : "border-primary/40 bg-primary/[0.04]"
                    }`}
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${Meta.tint}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold">
                          {!n.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />}
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{n.when}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                            {Meta.label}
                          </span>
                          {n.channels.map((c) => {
                            const CIcon = channelMeta[c].icon;
                            return (
                              <span key={c} title={channelMeta[c].label} className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                <CIcon className="h-3 w-3" /> {channelMeta[c].label}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          {!n.read && (
                            <button onClick={() => markOne(n.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                              <Check className="h-3 w-3" /> Mark read
                            </button>
                          )}
                          {n.cta && (
                            <Link to={n.cta.to} className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">
                              {n.cta.label}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">You're all caught up.</li>
              )}
            </ul>
          </>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Delivery preferences</h2>
              <p className="text-xs text-muted-foreground">
                Pick how you want to hear about each type of update. Critical alerts (payments, bookings, withdrawals, disputes, security) always appear in-app.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                      <th className="py-2">Type</th>
                      {(Object.keys(channelMeta) as Channel[]).map((c) => (
                        <th key={c} className="py-2 text-center font-semibold">{channelMeta[c].label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(categoryMeta) as Category[]).map((cat) => {
                      const Meta = categoryMeta[cat];
                      const Icon = Meta.icon;
                      return (
                        <tr key={cat} className="border-b border-border/60 last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className={`grid h-7 w-7 place-items-center rounded-lg ${Meta.tint}`}><Icon className="h-3.5 w-3.5" /></span>
                              <div>
                                <p className="font-medium">{Meta.label}</p>
                                {Meta.critical && <p className="text-[10px] text-muted-foreground">Critical — in-app always on</p>}
                              </div>
                            </div>
                          </td>
                          {(Object.keys(channelMeta) as Channel[]).map((ch) => {
                            const locked = Meta.critical && ch === "inapp";
                            return (
                              <td key={ch} className="py-3 text-center">
                                <Toggle
                                  on={prefs[cat][ch]}
                                  onChange={() => toggle(cat, ch)}
                                  disabled={locked}
                                  label={`${Meta.label} ${channelMeta[ch].label}`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Moon className="h-4 w-4" /> Quiet hours
              </div>
              <p className="text-xs text-muted-foreground">
                Silence non-critical push and SMS overnight. Critical booking, payment and security alerts still come through.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <Toggle on={quiet.on} onChange={() => setQuiet({ ...quiet, on: !quiet.on })} label="Quiet hours" />
                <span className="text-xs text-muted-foreground">From</span>
                <input
                  type="time"
                  value={quiet.from}
                  onChange={(e) => setQuiet({ ...quiet, from: e.target.value })}
                  disabled={!quiet.on}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="time"
                  value={quiet.to}
                  onChange={(e) => setQuiet({ ...quiet, to: e.target.value })}
                  disabled={!quiet.on}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Delivery frequency</h2>
              <p className="text-xs text-muted-foreground">Bundle non-critical email updates to reduce clutter.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["instant", "hourly", "daily"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDigest(d)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      digest === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === "instant" ? "Instant" : d === "hourly" ? "Hourly digest" : "Daily digest"}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Test your channels</h2>
              <p className="text-xs text-muted-foreground">Make sure notifications actually reach you — send a test through any channel.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(channelMeta) as Channel[]).map((c) => {
                  const CIcon = channelMeta[c].icon;
                  return (
                    <button
                      key={c}
                      onClick={() => sendTest(c)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      <Send className="h-3 w-3" /> <CIcon className="h-3 w-3" /> Send test {channelMeta[c].label.toLowerCase()}
                    </button>
                  );
                })}
              </div>
              {testFeedback && (
                <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">{testFeedback}</p>
              )}
            </section>

            <p className="text-[11px] text-muted-foreground">
              SMS is sent to your verified phone; email goes to your account address. You can pause non-critical channels overnight with quiet hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        on ? "bg-primary" : "bg-muted"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
