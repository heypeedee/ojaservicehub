import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/pro/dashboard")({
  head: () => ({
    meta: [
      { title: "Provider dashboard · ServiceHub" },
      {
        name: "description",
        content:
          "Track bookings, revenue, profile views, conversion, ratings, reviews, upcoming jobs and calendar — all in one dashboard.",
      },
      { property: "og:title", content: "Provider dashboard · ServiceHub" },
      { property: "og:description", content: "Bookings, revenue and calendar in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProviderDashboard,
});

type Range = "7d" | "30d" | "90d";

const revenueByRange: Record<Range, number[]> = {
  "7d": [45, 62, 40, 78, 90, 120, 105],
  "30d": [30, 42, 51, 44, 60, 72, 68, 75, 84, 92, 88, 100, 96, 110, 118, 105, 122, 128, 134, 130, 140, 152, 148, 160, 172, 168, 180, 192, 205, 214],
  "90d": Array.from({ length: 12 }, (_, i) => 60 + Math.round(Math.sin(i / 2) * 20) + i * 8),
};

const rangeLabels: Record<Range, { series: string; unit: string }> = {
  "7d": { series: "Last 7 days", unit: "Day" },
  "30d": { series: "Last 30 days", unit: "Day" },
  "90d": { series: "Last 90 days", unit: "Week" },
};

const bookingsByRange: Record<Range, number> = { "7d": 14, "30d": 62, "90d": 187 };
const viewsByRange: Record<Range, number> = { "7d": 412, "30d": 1834, "90d": 5210 };
const conversionByRange: Record<Range, number> = { "7d": 3.4, "30d": 3.9, "90d": 3.6 };

const upcoming = [
  { id: "u1", when: "Today · 4:00 PM", who: "Ada A.", service: "Bridal trial makeup", where: "Lekki Phase 1", amount: 45000 },
  { id: "u2", when: "Tomorrow · 10:00 AM", who: "Ngozi E.", service: "Full glam + gele", where: "Ikoyi", amount: 90000 },
  { id: "u3", when: "Fri · 2:00 PM", who: "Chidera O.", service: "Soft glam", where: "Victoria Island", amount: 55000 },
  { id: "u4", when: "Sat · 7:00 AM", who: "Bola T.", service: "Bridal party (4)", where: "Ajah", amount: 220000 },
];

const recentReviews = [
  { id: "r1", who: "Ngozi E.", rating: 5, text: "Adaeze was incredible. Airbrush lasted all night — booking her for the reception too.", when: "2d ago" },
  { id: "r2", who: "Kelechi M.", rating: 5, text: "On time, calm energy, gorgeous work. Photos came out stunning.", when: "5d ago" },
  { id: "r3", who: "Sade O.", rating: 4, text: "Great look overall, wish the lashes were a touch fuller.", when: "1w ago" },
];

const calendarBookings: Record<number, { title: string; time: string }[]> = {
  3: [{ title: "Trial", time: "10:00" }],
  7: [{ title: "Bridal", time: "07:00" }],
  12: [{ title: "Photoshoot", time: "14:00" }, { title: "Soft glam", time: "18:00" }],
  15: [{ title: "Wedding", time: "06:00" }],
  18: [{ title: "Party (4)", time: "16:00" }],
  22: [{ title: "Trial", time: "11:00" }],
  25: [{ title: "Bridal", time: "07:30" }],
  28: [{ title: "Corporate", time: "09:00" }],
};

function ProviderDashboard() {
  const [range, setRange] = useState<Range>("30d");
  const [monthOffset, setMonthOffset] = useState(0);

  const rev = revenueByRange[range];
  const totalRevenue = useMemo(() => rev.reduce((a, b) => a + b, 0) * 1000, [rev]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> ServiceHub
          </Link>
          <div className="inline-flex rounded-full bg-muted p-0.5 text-xs">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 font-semibold ${range === r ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, Adaeze</h1>
            <p className="text-sm text-muted-foreground">Here's how your business is doing · {rangeLabels[range].series}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/messages" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
              <MessageSquare className="h-3.5 w-3.5" /> Messages
            </Link>
            <Link to="/wallet" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <Wallet className="h-3.5 w-3.5" /> Wallet
            </Link>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={DollarSign} label="Revenue" value={`₦${totalRevenue.toLocaleString()}`} delta={+18.2} />
          <Kpi icon={CalendarDays} label="Bookings" value={String(bookingsByRange[range])} delta={+12.4} />
          <Kpi icon={Eye} label="Profile views" value={viewsByRange[range].toLocaleString()} delta={+24.6} />
          <Kpi icon={TrendingUp} label="Conversion rate" value={`${conversionByRange[range]}%`} delta={+0.4} suffix="pts" />
          <Kpi icon={Users} label="Customer growth" value="+38" delta={+9.1} caption="new customers" />
          <Kpi icon={Star} label="Average rating" value="4.98" delta={+0.02} caption="214 reviews" />
          <Kpi icon={Clock} label="Response time" value="4 min" delta={-1.2} deltaGood="down" caption="avg first reply" />
          <Kpi icon={Wallet} label="Escrow held" value="₦145,000" delta={+6.0} caption="clears on completion" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Revenue trend</h2>
              <span className="text-xs text-muted-foreground">{rangeLabels[range].series} · ₦'000</span>
            </div>
            <RevenueChart data={rev} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Bookings by service</h2>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Bridal glam", pct: 46, count: 28 },
                { label: "Soft glam", pct: 28, count: 17 },
                { label: "Photoshoot", pct: 16, count: 10 },
                { label: "Party/Events", pct: 10, count: 7 },
              ].map((s) => (
                <li key={s.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">{s.count} · {s.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Calendar</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setMonthOffset((o) => o - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
                <span className="min-w-24 text-center text-xs font-semibold">{monthLabel(monthOffset)}</span>
                <button onClick={() => setMonthOffset((o) => o + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <Calendar monthOffset={monthOffset} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Upcoming jobs</h2>
              <Link to="/provider/bookings" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            <ul className="mt-3 space-y-3">
              {upcoming.map((u) => (
                <li key={u.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.service}</p>
                    <p className="text-[11px] text-muted-foreground">{u.who} · <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {u.where}</span></p>
                    <p className="text-[11px] text-muted-foreground">{u.when}</p>
                  </div>
                  <p className="text-sm font-semibold">₦{u.amount.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent reviews</h2>
            <Link to="/pro/adaeze" className="text-xs font-medium text-primary hover:underline">Open profile</Link>
          </div>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {recentReviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.who}</p>
                  <span className="text-[11px] text-muted-foreground">{r.when}</span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`} />
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">"{r.text}"</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  suffix = "%",
  caption,
  deltaGood = "up",
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  delta: number;
  suffix?: string;
  caption?: string;
  deltaGood?: "up" | "down";
}) {
  const positive = deltaGood === "up" ? delta >= 0 : delta <= 0;
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          <Arrow className="h-3 w-3" />
          {Math.abs(delta).toFixed(1)}{suffix}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold">{value}</p>
      {caption && <p className="mt-0.5 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  );
}

function RevenueChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const w = 600;
  const h = 160;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 20) - 5}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#rev)" />
        <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={i * step} cy={h - (v / max) * (h - 20) - 5} r={2.5} fill="var(--color-primary)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>start</span><span>now</span>
      </div>
    </div>
  );
}

function monthLabel(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString("en-NG", { month: "long", year: "numeric" });
}

function Calendar({ monthOffset }: { monthOffset: number }) {
  const today = new Date();
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const startDow = view.getDay();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isCurrentMonth = monthOffset === 0;
  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const bookings = day && isCurrentMonth ? calendarBookings[day] ?? [] : [];
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg border p-1 text-left text-[10px] ${
                day == null
                  ? "border-transparent"
                  : isToday
                    ? "border-primary bg-primary/5"
                    : bookings.length
                      ? "border-border bg-muted/40"
                      : "border-border"
              }`}
            >
              {day && (
                <>
                  <div className={`text-[10px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>{day}</div>
                  <div className="mt-0.5 space-y-0.5">
                    {bookings.slice(0, 2).map((b, k) => (
                      <div key={k} className="truncate rounded bg-primary/15 px-1 text-[9px] font-semibold text-primary">
                        {b.time} {b.title}
                      </div>
                    ))}
                    {bookings.length > 2 && <div className="text-[9px] text-muted-foreground">+{bookings.length - 2}</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
