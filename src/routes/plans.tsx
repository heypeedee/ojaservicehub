import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Calendar,
  Check,
  Crown,
  Globe,
  Headphones,
  LineChart,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";

type Billing = "monthly" | "yearly";
type PlanId = "free" | "premium";

const PRICE = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: "TBA" as const, yearly: "TBA" as const },
};

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans & pricing · Ọjà" },
      {
        name: "description",
        content:
          "Compare Ọjà Free and Premium. Get unlimited services, featured placement, AI tools, advanced analytics, verification badge, and booking automation.",
      },
      { property: "og:title", content: "Plans & pricing · Ọjà" },
      { property: "og:description", content: "Free forever. Upgrade to Premium to grow faster." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [current, setCurrent] = useState<PlanId>("free");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BackNav label="Ọjà" />
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Crown className="h-3 w-3" /> Plans & pricing
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Grow with Ọjà
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start free. Upgrade when you're ready to win bigger jobs.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Every provider gets a real storefront and payouts for free. Premium unlocks featured placement,
            AI tools, deeper analytics, and booking automation.
          </p>

          <div className="mt-6 inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <PlanCard
            id="free"
            title="Free"
            tagline="Everything you need to earn your first jobs"
            price={PRICE.free[billing]}
            billing={billing}
            icon={Zap}
            current={current === "free"}
            onSelect={() => setCurrent("free")}
            features={[
              { text: "Up to 3 active services", ok: true },
              { text: "Basic profile with photos", ok: true },
              { text: "Basic analytics (views, bookings)", ok: true },
              { text: "Standard search ranking", ok: true },
              { text: "Escrow-protected payments", ok: true },
              { text: "In-app messaging", ok: true },
              { text: "Featured placement", ok: false },
              { text: "AI writing & pricing tools", ok: false },
              { text: "Advanced analytics", ok: false },
              { text: "Verified badge", ok: false },
              { text: "Custom domain", ok: false },
              { text: "Booking automation", ok: false },
            ]}
          />

          <PlanCard
            id="premium"
            title="Premium"
            tagline="For pros who want to be found first"
            price={PRICE.premium[billing]}
            billing={billing}
            icon={Crown}
            highlighted
            current={current === "premium"}
            onSelect={() => setCurrent("premium")}
            features={[
              { text: "Unlimited services", ok: true, bold: true },
              { text: "Featured placement in search & home", ok: true, bold: true },
              { text: "Advanced analytics & conversion insights", ok: true },
              { text: "AI tools: descriptions, pricing, replies", ok: true },
              { text: "Verified badge (after ID check)", ok: true },
              { text: "Custom domain (yourname.com)", ok: true },
              { text: "Booking automation & auto-responder", ok: true },
              { text: "Priority customer support", ok: true },
              { text: "Lower withdrawal fee (1.5% vs 3%)", ok: true },
              { text: "Escrow-protected payments", ok: true },
              { text: "In-app messaging", ok: true },
              { text: "Everything in Free", ok: true },
            ]}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold sm:text-xl">Compare features side-by-side</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4 text-center">Free</th>
                  <th className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Crown className="h-3.5 w-3.5" /> Premium
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-border/60 last:[&>tr]:border-0">
                <CompareRow label="Active service listings" free="3" premium="Unlimited" />
                <CompareRow label="Search ranking" free="Standard" premium="Boosted + featured" />
                <CompareRow label="Home page featured placement" free={false} premium />
                <CompareRow label="Analytics" free="Basic" premium="Advanced + trends" />
                <CompareRow label="AI Studio tools" free={false} premium />
                <CompareRow label="Verified badge" free={false} premium />
                <CompareRow label="Custom domain" free={false} premium />
                <CompareRow label="Booking automation" free={false} premium />
                <CompareRow label="Instant Match eligibility" free="Ranked lower" premium="Ranked higher" />
                <CompareRow label="Withdrawal fee" free="3%" premium="1.5%" />
                <CompareRow label="Customer support" free="Email (48h)" premium="Priority (under 4h)" />
                <CompareRow label="Escrow protection" free premium />
                <CompareRow label="In-app messaging" free premium />
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold sm:text-xl">What you unlock with Premium</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Perk icon={Rocket} title="Featured placement" body="Appear at the top of category and search results with a Featured badge." />
            <Perk icon={LineChart} title="Advanced analytics" body="Funnel, cohort retention, conversion by service and traffic source." />
            <Perk icon={Bot} title="AI Studio" body="Write descriptions, price services, and reply to reviews in one click." />
            <Perk icon={BadgeCheck} title="Verified badge" body="Stand out with an identity- and background-checked trust mark." />
            <Perk icon={Globe} title="Custom domain" body="Point yourname.com straight to your Ọjà storefront." />
            <Perk icon={Calendar} title="Booking automation" body="Auto-accept trusted repeat clients, auto-decline out-of-hours." />
            <Perk icon={Headphones} title="Priority support" body="Real humans respond in under 4 hours, 7 days a week." />
            <Perk icon={Shield} title="Lower fees" body="Withdraw earnings at 1.5% instead of the standard 3%." />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold sm:text-xl">Feature access preview</h2>
          <p className="mx-auto mt-1 max-w-xl text-center text-xs text-muted-foreground">
            See exactly how each area of the app looks on your current plan. Switch plans above to compare.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <GateCard plan={current} required="premium" icon={Rocket} title="Featured placement" body="Pinned in category, search, and home page rails." />
            <GateCard plan={current} required="premium" icon={LineChart} title="Advanced analytics" body="Deep-dive charts, cohorts, and conversion funnels." />
            <GateCard plan={current} required="premium" icon={Bot} title="AI Studio" body="Auto-generate descriptions, pricing, and replies." />
            <GateCard plan={current} required="premium" icon={BadgeCheck} title="Verified badge" body="Show a trust mark next to your name." />
            <GateCard plan={current} required="premium" icon={Globe} title="Custom domain" body="Serve your storefront at yourname.com." />
            <GateCard plan={current} required="premium" icon={Calendar} title="Booking automation" body="Auto-accept, auto-decline, smart replies." />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold sm:text-xl">Frequently asked</h2>
          <div className="mx-auto mt-5 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
            <FAQ q="Can I stay on Free forever?" a="Yes. Free includes a real storefront, up to 3 active services, escrow payments, and messaging — no time limit." />
            <FAQ q="What happens if I cancel Premium?" a="You return to Free at the end of the billing period. Extra listings become inactive but are preserved, and Featured badges are removed." />
            <FAQ q="Do I need Premium to accept payments?" a="No. Escrow-protected payments and payouts are on every plan. Premium only lowers withdrawal fees." />
            <FAQ q="Is Premium worth it for new providers?" a="If you're just starting, Free is a great launchpad. Upgrade once your profile has a few reviews — featured placement compounds after that." />
            <FAQ q="Can I change billing later?" a="Yes. Switch monthly ↔ yearly anytime; we prorate the difference." />
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to be booked more?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Premium providers earn on average 3.2× more per month. Upgrade in one tap, cancel any time.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrent("premium")}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
                >
                  <Crown className="h-4 w-4" /> Upgrade to Premium
                </button>
                <Link to="/pro/dashboard" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  id, title, tagline, price, billing, icon: Icon, features, highlighted, current, onSelect,
}: {
  id: PlanId;
  title: string;
  tagline: string;
  price: number | "TBA";
  billing: Billing;
  icon: typeof Zap;
  features: { text: string; ok: boolean; bold?: boolean }[];
  highlighted?: boolean;
  current: boolean;
  onSelect: () => void;
}) {
  const fmt = (n: number) => "₦" + n.toLocaleString();
  const isTba = price === "TBA";
  return (
    <div className={`relative rounded-3xl border p-6 shadow-sm ${highlighted ? "border-primary bg-gradient-to-b from-primary/5 to-card" : "border-border bg-card"}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow">
          Most popular
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${highlighted ? "bg-primary/15 text-primary" : "bg-muted text-foreground"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-none">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{tagline}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{isTba ? "TBA" : price === 0 ? "Free" : fmt(price)}</span>
        {!isTba && price > 0 && <span className="text-xs text-muted-foreground">/{billing === "monthly" ? "month" : "year"}</span>}
      </div>
      {isTba && <p className="mt-1 text-[11px] text-muted-foreground">Pricing hasn't been finalized yet.</p>}
      {!isTba && price > 0 && billing === "yearly" && (
        <p className="mt-1 text-[11px] text-muted-foreground">Billed yearly · works out to ₦{Math.round(price / 12).toLocaleString()}/mo</p>
      )}

      <button
        onClick={onSelect}
        disabled={current || isTba}
        className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          current || isTba
            ? "cursor-default border border-border bg-muted text-muted-foreground"
            : highlighted
            ? "bg-primary text-primary-foreground hover:opacity-95"
            : "border border-border bg-card hover:bg-muted"
        }`}
      >
        {current ? "Current plan" : isTba ? "Coming soon" : id === "premium" ? "Upgrade to Premium" : "Continue on Free"}
      </button>

      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f.text} className="flex items-start gap-2">
            <span className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full ${f.ok ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {f.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <span className={`${f.ok ? "" : "text-muted-foreground line-through"} ${f.bold ? "font-semibold" : ""}`}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareRow({ label, free, premium }: { label: string; free: string | boolean; premium: string | boolean }) {
  const cell = (v: string | boolean) =>
    typeof v === "boolean" ? (
      v ? <Check className="mx-auto h-4 w-4 text-primary" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/60" />
    ) : (
      <span className="text-xs font-medium">{v}</span>
    );
  return (
    <tr>
      <td className="p-4 text-sm">{label}</td>
      <td className="p-4 text-center">{cell(free)}</td>
      <td className="p-4 text-center">{cell(premium)}</td>
    </tr>
  );
}

function Perk({ icon: Icon, title, body }: { icon: typeof Rocket; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

function GateCard({
  plan, required, icon: Icon, title, body,
}: {
  plan: PlanId;
  required: PlanId;
  icon: typeof Rocket;
  title: string;
  body: string;
}) {
  const locked = required === "premium" && plan !== "premium";
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${locked ? "border-dashed border-border bg-muted/30" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{body}</p>
      {locked ? (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Lock className="h-3 w-3" /> Premium only
          </span>
          <span className="text-[11px] font-semibold text-primary">Upgrade →</span>
        </div>
      ) : (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <Check className="h-3 w-3" /> Included
        </div>
      )}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((v) => !v)} className="w-full px-5 py-4 text-left">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold">{q}</p>
        <span className={`text-lg text-muted-foreground transition ${open ? "rotate-45" : ""}`}>+</span>
      </div>
      {open && <p className="mt-2 text-xs text-muted-foreground">{a}</p>}
    </button>
  );
}
