import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Filter,
  Mail,
  MessageSquare,
  Smartphone,
  Star,
  Wallet,
} from "lucide-react";

type Category = "bookings" | "payments" | "messages" | "reviews" | "withdrawals";
type Channel = "email" | "sms" | "push" | "inapp";

const categoryMeta: Record<Category, { label: string; icon: typeof Calendar; tint: string }> = {
  bookings: { label: "Bookings", icon: Calendar, tint: "bg-primary/10 text-primary" },
  payments: { label: "Payments", icon: CreditCard, tint: "bg-emerald-100 text-emerald-700" },
  messages: { label: "Messages", icon: MessageSquare, tint: "bg-sky-100 text-sky-700" },
  reviews: { label: "Reviews", icon: Star, tint: "bg-amber-100 text-amber-700" },
  withdrawals: { label: "Withdrawals", icon: Wallet, tint: "bg-violet-100 text-violet-700" },
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
    category: "reviews",
    title: "New 5-star review",
    body: 'Kelechi M.: "On time, calm energy, gorgeous work. Photos came out stunning."',
    when: "5 hr ago",
    read: true,
    channels: ["email", "inapp"],
    cta: { label: "Open profile", to: "/pro/adaeze" },
  },
  {
    id: "n5",
    category: "withdrawals",
    title: "Withdrawal successful — ₦120,000",
    body: "Transferred to GTBank •• 4421. Should reflect within 10 minutes.",
    when: "Yesterday",
    read: true,
    channels: ["email", "sms", "inapp"],
    cta: { label: "View transaction", to: "/wallet" },
  },
  {
    id: "n6",
    category: "bookings",
    title: "Booking completed",
    body: "Sade O. marked the job as completed. ₦55,000 moved from pending to available.",
    when: "Yesterday",
    read: true,
    channels: ["push", "inapp"],
  },
  {
    id: "n7",
    category: "payments",
    title: "Payment released to your wallet",
    body: "₦45,000 for Soft glam has cleared escrow.",
    when: "2 days ago",
    read: true,
    channels: ["email", "inapp"],
  },
];

const defaultPrefs: Record<Category, Record<Channel, boolean>> = {
  bookings: { email: true, sms: true, push: true, inapp: true },
  payments: { email: true, sms: true, push: false, inapp: true },
  messages: { email: false, sms: false, push: true, inapp: true },
  reviews: { email: true, sms: false, push: true, inapp: true },
  withdrawals: { email: true, sms: true, push: false, inapp: true },
};

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · ServiceHub" },
      {
        name: "description",
        content:
          "Bookings, payments, messages, reviews and withdrawals — delivered via email, SMS, push and in-app.",
      },
      { property: "og:title", content: "Notifications · ServiceHub" },
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
  const [prefs, setPrefs] = useState(defaultPrefs);

  const filtered = filter === "all" ? items : items.filter((n) => n.category === filter);
  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setItems((all) => all.map((n) => ({ ...n, read: true })));
  }
  function markOne(id: string) {
    setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
  function toggle(cat: Category, ch: Channel) {
    setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [ch]: !p[cat][ch] } }));
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> ServiceHub
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
            Stay on top of bookings, payments, messages, reviews and withdrawals — however you prefer to be reached.
          </p>
        </header>

        {tab === "inbox" ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Filter:</span>
                {(["all", "bookings", "payments", "messages", "reviews", "withdrawals"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full border px-2.5 py-1 font-semibold capitalize ${
                      filter === f ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={markAll}
                disabled={unread === 0}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </button>
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
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Delivery preferences</h2>
            <p className="text-xs text-muted-foreground">Pick how you want to hear about each type of update. Critical payment and booking alerts always appear in-app.</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
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
                            <span className="font-medium">{Meta.label}</span>
                          </div>
                        </td>
                        {(Object.keys(channelMeta) as Channel[]).map((ch) => (
                          <td key={ch} className="py-3 text-center">
                            <Toggle
                              on={prefs[cat][ch]}
                              onChange={() => toggle(cat, ch)}
                              label={`${Meta.label} ${channelMeta[ch].label}`}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              SMS is sent to your verified phone; email goes to your account address. You can quiet non-critical notifications overnight in your profile.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
