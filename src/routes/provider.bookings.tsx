import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Star,
  X,
} from "lucide-react";

export const Route = createFileRoute("/provider/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings · Provider · Ọjà" },
      {
        name: "description",
        content:
          "Accept or decline booking requests, view your upcoming jobs, and track completed work.",
      },
      { property: "og:title", content: "Provider bookings · Ọjà" },
      {
        property: "og:description",
        content: "Manage incoming bookings, upcoming jobs, and completed work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProviderBookings,
});

type Status = "pending" | "upcoming" | "completed" | "declined";

type Booking = {
  id: string;
  customer: string;
  initials: string;
  service: string;
  date: string;
  time: string;
  location: string;
  price: number;
  notes?: string;
  photos?: number;
  status: Status;
  rating?: number;
};

const seed: Booking[] = [
  {
    id: "bk_1024",
    customer: "Amaka Eze",
    initials: "AE",
    service: "Bridal glam package",
    date: "Sat, 12 Oct",
    time: "08:00",
    location: "Lekki Phase 1",
    price: 65000,
    notes: "Soft glam, dewy finish. Bride + 2 maids.",
    photos: 3,
    status: "pending",
  },
  {
    id: "bk_1025",
    customer: "Tunde Bakare",
    initials: "TB",
    service: "Party makeup",
    date: "Sun, 13 Oct",
    time: "14:00",
    location: "Ikoyi",
    price: 25000,
    notes: "Birthday shoot at 4pm.",
    photos: 1,
    status: "pending",
  },
  {
    id: "bk_1018",
    customer: "Grace Ndu",
    initials: "GN",
    service: "Hair styling only",
    date: "Fri, 11 Oct",
    time: "10:00",
    location: "Ajah",
    price: 15000,
    status: "upcoming",
  },
  {
    id: "bk_1015",
    customer: "Ibrahim S.",
    initials: "IS",
    service: "Trial session",
    date: "Wed, 09 Oct",
    time: "16:00",
    location: "Yaba",
    price: 12000,
    status: "upcoming",
  },
  {
    id: "bk_1002",
    customer: "Zainab M.",
    initials: "ZM",
    service: "Bridal glam package",
    date: "Sat, 28 Sep",
    time: "07:00",
    location: "Victoria Island",
    price: 65000,
    status: "completed",
    rating: 5,
  },
  {
    id: "bk_0999",
    customer: "Kunle A.",
    initials: "KA",
    service: "Hair styling only",
    date: "Fri, 20 Sep",
    time: "12:00",
    location: "Magodo",
    price: 15000,
    status: "completed",
    rating: 4.8,
  },
];

const tabs: { key: Status | "all"; label: string }[] = [
  { key: "pending", label: "Requests" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
];

function ProviderBookings() {
  const [bookings, setBookings] = useState<Booking[]>(seed);
  const [tab, setTab] = useState<Status | "all">("pending");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const b of bookings) c[b.status] = (c[b.status] ?? 0) + 1;
    return c;
  }, [bookings]);

  const visible = bookings.filter((b) => tab === "all" || b.status === tab);

  function update(id: string, status: Status) {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Ọjà
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              AO
            </div>
            <div className="text-xs leading-tight">
              <p className="font-medium">Adaeze Okoye</p>
              <p className="text-muted-foreground">Platinum pro</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Bookings</h1>
            <p className="mt-1 text-muted-foreground">
              Accept requests fast — your response time affects your search ranking.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative -mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {counts[t.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Nothing here yet.
            </div>
          ) : (
            visible.map((b) => (
              <BookingCard key={b.id} booking={b} onAction={update} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onAction,
}: {
  booking: Booking;
  onAction: (id: string, status: Status) => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {booking.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{booking.customer}</p>
            <p className="truncate text-sm text-muted-foreground">{booking.service}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" /> {booking.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {booking.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {booking.location}
              </span>
              {booking.rating && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {booking.rating}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={booking.status} />
          <span className="text-lg font-semibold">₦{booking.price.toLocaleString()}</span>
        </div>
      </div>

      {booking.notes && (
        <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm text-foreground">
          <span className="font-medium">Notes:</span> {booking.notes}
          {booking.photos ? (
            <span className="ml-2 text-xs text-muted-foreground">
              · {booking.photos} photo{booking.photos > 1 ? "s" : ""} attached
            </span>
          ) : null}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <MessageCircle className="h-4 w-4" /> Message
        </button>
        {booking.status === "pending" && (
          <>
            <button
              onClick={() => onAction(booking.id, "declined")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" /> Decline
            </button>
            <button
              onClick={() => onAction(booking.id, "upcoming")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Check className="h-4 w-4" /> Accept
            </button>
          </>
        )}
        {booking.status === "upcoming" && (
          <button
            onClick={() => onAction(booking.id, "completed")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Check className="h-4 w-4" /> Mark complete
          </button>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
    upcoming: { label: "Upcoming", cls: "bg-primary/10 text-primary" },
    completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800" },
    declined: { label: "Declined", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}
