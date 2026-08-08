import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Filter,
  Gift,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Wallet,
  Wrench,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";

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

const channelMeta: Record<Channel, { label: string; icon: typeof Mail; available: boolean; note: string }> = {
  inapp: { label: "In-app", icon: BellOff, available: true, note: "Delivered right here, in real time." },
  email: { label: "Email", icon: Mail, available: false, note: "Needs an email sending service connected." },
  sms: { label: "SMS", icon: Smartphone, available: false, note: "Needs an SMS provider connected." },
  push: { label: "Push", icon: Bell, available: false, note: "Needs web-push keys configured." },
};

const channelOrder: Channel[] = ["inapp", "email", "sms", "push"];

type ChannelMatrix = Record<Category, Record<Channel, boolean>>;

const defaultPrefs: ChannelMatrix = {
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

function normaliseCategory(value: string): Category {
  return (Object.keys(categoryMeta) as Category[]).includes(value as Category) ? (value as Category) : "system";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Ọjà" },
      {
        name: "description",
        content:
          "Live in-app alerts for bookings, payments, messages, reviews, withdrawals and account activity on Ọjà.",
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
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <Bell className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-3 text-lg font-semibold">Sign in to see your notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking, payment and message alerts are tied to your Ọjà account.
          </p>
          <Link
            to="/messages"
            search={{ conversationId: "" }}
            className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return <NotificationsShell userId={session.user.id} />;
}

function NotificationsShell({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { items, loading, unread, markRead, markAllRead, remove } = useNotifications(userId);

  const filtered = useMemo(() => {
    let list = filter === "all" ? items : items.filter((n) => normaliseCategory(n.category) === filter);
    if (showUnreadOnly) list = list.filter((n) => !n.is_read);
    return list;
  }, [items, filter, showUnreadOnly]);

  const filterOrder: ("all" | Category)[] = ["all", ...(Object.keys(categoryMeta) as Category[])];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BackNav label="Ọjà" />
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
            Live alerts for bookings, payments, messages, reviews and withdrawals — delivered in-app the moment they happen.
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
                  onClick={markAllRead}
                  disabled={unread === 0}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((n) => {
                  const cat = normaliseCategory(n.category);
                  const Meta = categoryMeta[cat];
                  const Icon = Meta.icon;
                  return (
                    <li
                      key={n.id}
                      className={`flex gap-3 rounded-2xl border p-4 shadow-sm transition ${
                        n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/[0.04]"
                      }`}
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${Meta.tint}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="truncate text-sm font-semibold">
                            {!n.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />}
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(n.created_at)}</span>
                        </div>
                        {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                            {Meta.label}
                          </span>
                          <div className="flex items-center gap-3">
                            {!n.is_read && (
                              <button onClick={() => markRead(n.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                                <Check className="h-3 w-3" /> Mark read
                              </button>
                            )}
                            <button onClick={() => remove(n.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                            {n.link && (
                              <a
                                href={n.link}
                                onClick={() => markRead(n.id)}
                                className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    You're all caught up.
                  </li>
                )}
              </ul>
            )}
          </>
        ) : (
          <SettingsPanel userId={userId} />
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ userId }: { userId: string }) {
  const [prefs, setPrefs] = useState<ChannelMatrix>(defaultPrefs);
  const [quiet, setQuiet] = useState({ on: true, from: "22:00", to: "07:00" });
  const [digest, setDigest] = useState<"instant" | "hourly" | "daily">("instant");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          const channels = (data.channels ?? {}) as Partial<ChannelMatrix>;
          setPrefs({ ...defaultPrefs, ...channels } as ChannelMatrix);
          setQuiet({ on: data.quiet_enabled, from: data.quiet_from, to: data.quiet_to });
          setDigest((data.digest as "instant" | "hourly" | "daily") ?? "instant");
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function save() {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase.from("notification_preferences").upsert(
      {
        user_id: userId,
        channels: JSON.parse(JSON.stringify(prefs)),
        quiet_enabled: quiet.on,
        quiet_from: quiet.from,
        quiet_to: quiet.to,
        digest,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  function toggle(cat: Category, ch: Channel) {
    if (!channelMeta[ch].available) return;
    if (categoryMeta[cat].critical && ch === "inapp") return;
    setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [ch]: !p[cat][ch] } }));
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Delivery preferences</h2>
        <p className="text-xs text-muted-foreground">
          In-app is live today. Email, SMS and push are switched off platform-wide until a sending provider is connected — those columns are shown so you can see what's coming, but they don't deliver yet.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                <th className="py-2">Type</th>
                {channelOrder.map((c) => (
                  <th key={c} className="py-2 text-center font-semibold">
                    {channelMeta[c].label}
                    {!channelMeta[c].available && (
                      <span className="mt-0.5 block text-[9px] font-medium normal-case text-muted-foreground/70">Not available yet</span>
                    )}
                  </th>
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
                    {channelOrder.map((ch) => {
                      const locked = !channelMeta[ch].available || (Meta.critical && ch === "inapp");
                      return (
                        <td key={ch} className="py-3 text-center">
                          <Toggle
                            on={channelMeta[ch].available ? prefs[cat][ch] : false}
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

        <ul className="mt-4 space-y-1 text-[11px] text-muted-foreground">
          {channelOrder.map((c) => (
            <li key={c}>
              <b className="text-foreground">{channelMeta[c].label}:</b> {channelMeta[c].note}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Moon className="h-4 w-4" /> Quiet hours
        </div>
        <p className="text-xs text-muted-foreground">
          Saved with your account. Once push and SMS go live, non-critical alerts will be held during these hours.
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
        <p className="text-xs text-muted-foreground">Applies to bundled email updates once email is connected.</p>
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

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save preferences
        </button>
        {saved && <span className="text-xs font-semibold text-brand">Saved.</span>}
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
      } ${disabled ? "opacity-40" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
