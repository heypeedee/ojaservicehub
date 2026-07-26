import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layout,
  Layers,
  Megaphone,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Users,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner control panel · Ọjà" },
      {
        name: "description",
        content:
          "Platform owner controls: toggle features, pages and banners visible to customers, providers and admins in one place.",
      },
      { property: "og:title", content: "Owner control panel · Ọjà" },
      { property: "og:description", content: "Edit what each user type sees on Ọjà." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerPanel,
});

type Audience = "customer" | "provider" | "admin";
type FeatureKey =
  | "instantMatch"
  | "aiStudio"
  | "wallet"
  | "reviews"
  | "messages"
  | "search"
  | "notifications"
  | "plans"
  | "storefront"
  | "dashboard"
  | "verificationQueue"
  | "disputes"
  | "payouts"
  | "fraudDetection"
  | "categoryManager"
  | "reports";

const featureCatalog: {
  key: FeatureKey;
  label: string;
  blurb: string;
  audiences: Audience[];
  group: "Discovery" | "Money" | "Communication" | "Ops" | "Growth";
}[] = [
  { key: "search", label: "Search & filters", blurb: "Full search page with natural queries and filters.", audiences: ["customer", "provider"], group: "Discovery" },
  { key: "instantMatch", label: "Instant Match", blurb: "Describe-a-need matching that ranks the best pros.", audiences: ["customer"], group: "Discovery" },
  { key: "storefront", label: "Public storefronts", blurb: "Provider profile pages open to customers.", audiences: ["customer", "provider"], group: "Discovery" },
  { key: "aiStudio", label: "AI Studio", blurb: "AI writing and recommendation tools.", audiences: ["customer", "provider"], group: "Growth" },
  { key: "plans", label: "Plans & upgrades", blurb: "Free vs Premium plans page.", audiences: ["provider"], group: "Growth" },
  { key: "wallet", label: "Wallet & withdrawals", blurb: "HubPoints wallet, escrow, bank withdrawals.", audiences: ["provider"], group: "Money" },
  { key: "payouts", label: "Payouts queue", blurb: "Admin view for processing withdrawals.", audiences: ["admin"], group: "Money" },
  { key: "messages", label: "Messaging", blurb: "Real-time chat with images and voice notes.", audiences: ["customer", "provider"], group: "Communication" },
  { key: "notifications", label: "Notifications center", blurb: "Inbox and delivery preferences.", audiences: ["customer", "provider", "admin"], group: "Communication" },
  { key: "reviews", label: "Reviews", blurb: "Verified-booking-only reviews with photos.", audiences: ["customer", "provider"], group: "Communication" },
  { key: "dashboard", label: "Provider dashboard", blurb: "KPIs, calendar, charts and upcoming jobs.", audiences: ["provider"], group: "Ops" },
  { key: "verificationQueue", label: "Verification queue", blurb: "Approve pending provider IDs and badges.", audiences: ["admin"], group: "Ops" },
  { key: "disputes", label: "Disputes desk", blurb: "Handle refund and behavior disputes.", audiences: ["admin"], group: "Ops" },
  { key: "fraudDetection", label: "Fraud detection", blurb: "Signals list for risky users and payouts.", audiences: ["admin"], group: "Ops" },
  { key: "categoryManager", label: "Category manager", blurb: "Add, rename, retire service categories.", audiences: ["admin"], group: "Ops" },
  { key: "reports", label: "Reports", blurb: "Exportable platform analytics.", audiences: ["admin"], group: "Ops" },
];

const defaultVisibility: Record<Audience, Record<FeatureKey, boolean>> = {
  customer: featureCatalog.reduce((acc, f) => {
    acc[f.key] = f.audiences.includes("customer");
    return acc;
  }, {} as Record<FeatureKey, boolean>),
  provider: featureCatalog.reduce((acc, f) => {
    acc[f.key] = f.audiences.includes("provider");
    return acc;
  }, {} as Record<FeatureKey, boolean>),
  admin: featureCatalog.reduce((acc, f) => {
    acc[f.key] = f.audiences.includes("admin");
    return acc;
  }, {} as Record<FeatureKey, boolean>),
};

const defaultNav: Record<Audience, { label: string; on: boolean }[]> = {
  customer: [
    { label: "Home", on: true },
    { label: "Search", on: true },
    { label: "Instant Match", on: true },
    { label: "Messages", on: true },
    { label: "Notifications", on: true },
  ],
  provider: [
    { label: "Dashboard", on: true },
    { label: "Bookings", on: true },
    { label: "Wallet", on: true },
    { label: "AI Studio", on: true },
    { label: "Plans", on: true },
  ],
  admin: [
    { label: "Overview", on: true },
    { label: "Users", on: true },
    { label: "Providers", on: true },
    { label: "Verification", on: true },
    { label: "Payouts", on: true },
    { label: "Reports", on: true },
  ],
};

const audienceMeta: Record<Audience, { label: string; icon: typeof User; tint: string; sub: string }> = {
  customer: { label: "Customers", icon: User, tint: "bg-sky-100 text-sky-700", sub: "People booking services." },
  provider: { label: "Providers", icon: Store, tint: "bg-emerald-100 text-emerald-700", sub: "People offering services." },
  admin: { label: "Admins", icon: ShieldCheck, tint: "bg-violet-100 text-violet-700", sub: "Your moderation team." },
};

type Banner = { id: string; audience: Audience | "all"; message: string; tone: "info" | "success" | "warning"; on: boolean };

function OwnerPanel() {
  const [tab, setTab] = useState<"features" | "navigation" | "banners" | "branding">("features");
  const [audience, setAudience] = useState<Audience>("customer");
  const [visibility, setVisibility] = useState(defaultVisibility);
  const [nav, setNav] = useState(defaultNav);
  const [banners, setBanners] = useState<Banner[]>([
    { id: "b1", audience: "customer", message: "New: Instant Match — describe what you need and get top pros in seconds.", tone: "info", on: true },
    { id: "b2", audience: "provider", message: "Premium is 20% off this month — unlock featured placement and AI tools.", tone: "success", on: true },
  ]);
  const [brand, setBrand] = useState({ name: "Ọjà", tagline: "Find trusted professionals around you", accent: "teal" });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof featureCatalog> = {};
    featureCatalog
      .filter((f) => f.audiences.includes(audience))
      .forEach((f) => {
        (groups[f.group] ||= []).push(f);
      });
    return groups;
  }, [audience]);

  function toggleFeature(key: FeatureKey) {
    setVisibility((v) => ({ ...v, [audience]: { ...v[audience], [key]: !v[audience][key] } }));
    mark();
  }
  function toggleNav(i: number) {
    setNav((n) => ({ ...n, [audience]: n[audience].map((x, j) => (j === i ? { ...x, on: !x.on } : x)) }));
    mark();
  }
  function mark() {
    setDirty(true);
    setSaved(false);
  }
  function save() {
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  const visibleCount = Object.values(visibility[audience]).filter(Boolean).length;
  const totalForAudience = featureCatalog.filter((f) => f.audiences.includes(audience)).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Ọjà
          </Link>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-semibold text-emerald-600">Saved ✓</span>}
            <button
              onClick={save}
              disabled={!dirty}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Publish changes
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Owner only
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Owner control panel</h1>
          <p className="text-sm text-muted-foreground">
            Edit what each type of user sees across Ọjà — features, navigation, banners and branding. Changes go live the moment you publish.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-1 rounded-2xl border border-border bg-card p-2 text-sm">
            {(
              [
                { k: "features", l: "Features & visibility", i: Layers },
                { k: "navigation", l: "Navigation & menus", i: Layout },
                { k: "banners", l: "Announcements", i: Megaphone },
                { k: "branding", l: "Branding", i: Palette },
              ] as const
            ).map((o) => {
              const on = tab === o.k;
              const Icon = o.i;
              return (
                <button
                  key={o.k}
                  onClick={() => setTab(o.k)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium ${
                    on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {o.l}
                </button>
              );
            })}
          </nav>

          <div>
            {tab !== "branding" && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full bg-muted p-0.5 text-xs">
                  {(["customer", "provider", "admin"] as Audience[]).map((a) => {
                    const M = audienceMeta[a];
                    const Icon = M.icon;
                    const on = audience === a;
                    return (
                      <button
                        key={a}
                        onClick={() => setAudience(a)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
                          on ? "bg-card text-foreground shadow" : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" /> {M.label}
                      </button>
                    );
                  })}
                </div>
                {tab === "features" && (
                  <span className="text-xs text-muted-foreground">
                    {visibleCount} of {totalForAudience} features visible
                  </span>
                )}
              </div>
            )}

            {tab === "features" && (
              <div className="space-y-6">
                <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  {audienceMeta[audience].sub} Turn features off to hide them from every {audienceMeta[audience].label.toLowerCase().slice(0, -1)} on Ọjà — pages, nav entries and cross-links all disappear together.
                </p>
                {Object.entries(grouped).map(([group, feats]) => (
                  <section key={group} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-sm font-semibold">{group}</h2>
                    <ul className="mt-3 divide-y divide-border">
                      {feats.map((f) => {
                        const on = visibility[audience][f.key];
                        return (
                          <li key={f.key} className="flex items-start justify-between gap-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{f.label}</p>
                              <p className="text-xs text-muted-foreground">{f.blurb}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">
                                {on ? "Visible" : "Hidden"}
                              </span>
                              <Switch on={on} onChange={() => toggleFeature(f.key)} label={`${f.label} visibility`} />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {tab === "navigation" && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Layout className="h-4 w-4" /> {audienceMeta[audience].label} navigation
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose which entries appear in the top nav for this user type. Hidden pages still exist by URL — hide them under Features to remove them entirely.
                </p>
                <ul className="mt-4 divide-y divide-border">
                  {nav[audience].map((n, i) => (
                    <li key={n.label} className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium">{n.label}</span>
                      <div className="flex items-center gap-2">
                        {n.on ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        <Switch on={n.on} onChange={() => toggleNav(i)} label={`${n.label} nav entry`} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "banners" && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Megaphone className="h-4 w-4" /> Announcements
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Show a message at the top of the app for a specific audience. Great for launches, maintenance windows and promos.
                  </p>
                </div>
                <ul className="space-y-3">
                  {banners.map((b) => (
                    <li key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className={`rounded-full px-2 py-0.5 capitalize ${audienceMeta[(b.audience === "all" ? "customer" : b.audience) as Audience].tint}`}>
                            {b.audience === "all" ? "Everyone" : audienceMeta[b.audience].label}
                          </span>
                          <select
                            value={b.tone}
                            onChange={(e) => {
                              setBanners((v) => v.map((x) => (x.id === b.id ? { ...x, tone: e.target.value as Banner["tone"] } : x)));
                              mark();
                            }}
                            className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]"
                          >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                          </select>
                        </div>
                        <Switch
                          on={b.on}
                          onChange={() => {
                            setBanners((v) => v.map((x) => (x.id === b.id ? { ...x, on: !x.on } : x)));
                            mark();
                          }}
                          label="Banner active"
                        />
                      </div>
                      <textarea
                        value={b.message}
                        onChange={(e) => {
                          setBanners((v) => v.map((x) => (x.id === b.id ? { ...x, message: e.target.value } : x)));
                          mark();
                        }}
                        rows={2}
                        className="mt-3 w-full rounded-xl border border-border bg-background p-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => {
                            setBanners((v) => v.filter((x) => x.id !== b.id));
                            mark();
                          }}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setBanners((v) => [...v, { id: `b${Date.now()}`, audience: audience, message: "New announcement", tone: "info", on: true }]);
                    mark();
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  + Add announcement for {audienceMeta[audience].label}
                </button>
              </section>
            )}

            {tab === "branding" && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" /> Branding
                </div>
                <p className="text-xs text-muted-foreground">
                  Change the name, tagline and accent everyone sees.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Product name</span>
                    <input
                      value={brand.name}
                      onChange={(e) => {
                        setBrand({ ...brand, name: e.target.value });
                        mark();
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Accent color</span>
                    <select
                      value={brand.accent}
                      onChange={(e) => {
                        setBrand({ ...brand, accent: e.target.value });
                        mark();
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    >
                      {["teal", "amber", "violet", "emerald", "rose"].map((c) => (
                        <option key={c} className="capitalize">
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">Hero tagline</span>
                    <input
                      value={brand.tagline}
                      onChange={(e) => {
                        setBrand({ ...brand, tagline: e.target.value });
                        mark();
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Live preview</p>
                  <p className="mt-1 text-lg font-semibold">{brand.name}</p>
                  <p className="text-sm text-muted-foreground">{brand.tagline}</p>
                </div>
              </section>
            )}

            <p className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" /> Owner-only surface. Regular admins can moderate content in{" "}
              <Link to="/admin" className="font-semibold text-primary">
                the admin panel
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
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
