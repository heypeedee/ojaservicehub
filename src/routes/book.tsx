import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  Clock,
  ImagePlus,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BackNav } from "@/components/BackNav";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    providerId: typeof search.providerId === "string" ? search.providerId : "",
  }),
  head: () => ({
    meta: [
      { title: "Book a pro · Ọjà" },
      {
        name: "description",
        content:
          "Pick a service, date and time, add instructions and photos, and send your booking request to a verified professional.",
      },
      { property: "og:title", content: "Book a pro · Ọjà" },
      { property: "og:description", content: "Escrow-protected bookings in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

type ProviderInfo = {
  id: string;
  name: string;
  craft: string;
  area: string;
  rating: number;
  reviews: number;
  tier: string;
  initials: string;
};

type ServiceOption = { id: string; name: string; duration: string; price: number };

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const steps = ["Service", "Date & time", "Details", "Review"] as const;

function BookPage() {
  const { providerId } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!providerId) {
        setLoading(false);
        return;
      }
      const [{ data: pp }, { data: svc }, { data: sessionData }] = await Promise.all([
        supabase
          .from("provider_profiles")
          .select("id, business_name, area, rating, review_count, tier, categories(name)")
          .eq("id", providerId)
          .eq("published", true)
          .maybeSingle(),
        supabase
          .from("services")
          .select("id, title, duration, price")
          .eq("provider_id", providerId)
          .eq("active", true)
          .order("created_at"),
        supabase.auth.getSession(),
      ]);
      if (!active) return;
      setUserId(sessionData.session?.user?.id ?? null);
      if (pp) {
        setProvider({
          id: pp.id,
          name: pp.business_name,
          craft: pp.categories?.name ?? "Service provider",
          area: pp.area,
          rating: pp.rating,
          reviews: pp.review_count,
          tier: pp.tier,
          initials: pp.business_name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?",
        });
      }
      setServiceOptions((svc ?? []).map((s) => ({ id: s.id, name: s.title, duration: s.duration ?? "—", price: Number(s.price) })));
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [providerId]);

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId && serviceOptions.length > 0) setServiceId(serviceOptions[0].id);
  }, [serviceOptions, serviceId]);

  const service = useMemo(
    () => serviceOptions.find((s) => s.id === serviceId) ?? serviceOptions[0],
    [serviceId, serviceOptions]
  );
  const total = service?.price ?? 0;
  const escrowFee = Math.round(total * 0.03);
  const grand = total + escrowFee;

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!date && !!time) ||
    step === 2 ||
    step === 3;

  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1);
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submitBooking() {
    if (!provider || !service) return;
    if (!userId) {
      setSubmitError("Sign in to send a booking request.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const scheduledAt = date && time ? new Date(`${date}T${time}:00`).toISOString() : null;
    const { error } = await supabase.from("bookings").insert({
      provider_id: provider.id,
      customer_id: userId,
      service_id: service.id,
      service_title: service.name,
      amount: total,
      scheduled_at: scheduledAt,
      location: provider.area,
      notes: notes || null,
      status: "New",
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  }

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).slice(0, 6 - photos.length).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setPhotos((p) => [...p, ...next]);
  }

  function removePhoto(idx: number) {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!providerId || !provider) {
    return (
      <div className="min-h-screen bg-muted/30">
        <TopBar />
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <p className="font-semibold text-foreground">We couldn't find that pro.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a pro from search to start a booking.
          </p>
          <Link
            to="/search"
            search={{ q: "" }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse pros <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (serviceOptions.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <TopBar />
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <p className="font-semibold text-foreground">{provider.name} hasn't listed any services yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon, or message them directly.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <BookingSuccess provider={provider} service={service!} date={date} time={time} total={grand} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <main>
          <Stepper step={step} />
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {step === 0 && (
              <ServiceStep provider={provider} serviceOptions={serviceOptions} serviceId={serviceId} onChange={setServiceId} />
            )}
            {step === 1 && (
              <DateTimeStep
                date={date}
                time={time}
                onDate={setDate}
                onTime={setTime}
              />
            )}
            {step === 2 && (
              <DetailsStep
                notes={notes}
                onNotes={setNotes}
                photos={photos}
                onFiles={handleFiles}
                onRemove={removePhoto}
              />
            )}
            {step === 3 && service && (
              <ReviewStep
                provider={provider}
                service={service}
                date={date}
                time={time}
                notes={notes}
                photos={photos}
                total={total}
                escrowFee={escrowFee}
                grand={grand}
              />
            )}

            {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <button
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={submitting || !service}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sending…" : <>Send booking request <Check className="h-4 w-4" /></>}
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {service && (
            <SummaryCard
              provider={provider}
              service={service}
              date={date}
              time={time}
              total={total}
              escrowFee={escrowFee}
              grand={grand}
            />
          )}
        </aside>
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
          <ShieldCheck className="h-4 w-4 text-primary" />
          Escrow-protected · Cancel free up to 24h before
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-accent text-accent-foreground ring-2 ring-accent/40"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-2 hidden h-px w-8 bg-border sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ServiceStep({
  provider,
  serviceOptions,
  serviceId,
  onChange,
}: {
  provider: ProviderInfo;
  serviceOptions: ServiceOption[];
  serviceId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Choose a service</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick what you'd like {provider.name.split(" ")[0]} to do.
      </p>
      <div className="mt-5 grid gap-3">
        {serviceOptions.map((s) => {
          const selected = s.id === serviceId;
          return (
            <label
              key={s.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="service"
                  value={s.id}
                  checked={selected}
                  onChange={() => onChange(s.id)}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.duration}
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold">₦{s.price.toLocaleString()}</div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DateTimeStep({
  date,
  time,
  onDate,
  onTime,
}: {
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <h2 className="text-xl font-semibold">Pick a date & time</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Availability updates in real time as pros accept jobs.
      </p>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Date</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => onDate(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Available time slots</label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {timeSlots.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTime(t)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  time === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsStep({
  notes,
  onNotes,
  photos,
  onFiles,
  onRemove,
}: {
  notes: string;
  onNotes: (v: string) => void;
  photos: { name: string; url: string }[];
  onFiles: (files: FileList | null) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Special instructions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add anything the pro should know: style, location details, allergies, etc.
      </p>
      <textarea
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        rows={5}
        placeholder="e.g. Soft glam, dewy finish. Address is 12A Admiralty Way, gate code 1234."
        className="mt-4 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
      />

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Reference photos (optional)</p>
        <p className="text-xs text-muted-foreground">Up to 6 images. Helpful for hair, decor, damages, etc.</p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {photos.map((p, i) => (
            <div key={p.url} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              <button
                onClick={() => onRemove(i)}
                type="button"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              <ImagePlus className="h-5 w-5" />
              Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  provider,
  service,
  date,
  time,
  notes,
  photos,
  total,
  escrowFee,
  grand,
}: {
  provider: ProviderInfo;
  service: ServiceOption;
  date: string;
  time: string;
  notes: string;
  photos: { name: string; url: string }[];
  total: number;
  escrowFee: number;
  grand: number;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Review your booking</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your funds will be held in escrow and released after the job is completed.
      </p>
      <dl className="mt-5 divide-y divide-border rounded-xl border border-border">
        <Row label="Service" value={`${service.name} · ${service.duration}`} />
        <Row label="Date" value={date || "—"} />
        <Row label="Time" value={time || "—"} />
        <Row label="Location" value={provider.area} />
        <Row label="Notes" value={notes || "No special instructions"} />
        <Row
          label="Photos"
          value={
            photos.length ? `${photos.length} attached` : "None"
          }
        />
      </dl>
      <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-muted-foreground">Escrow protection (3%)</span>
          <span>₦{escrowFee.toLocaleString()}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>Total held in escrow</span>
          <span>₦{grand.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SummaryCard({
  provider,
  service,
  date,
  time,
  total,
  escrowFee,
  grand,
}: {
  provider: ProviderInfo;
  service: ServiceOption;
  date: string;
  time: string;
  total: number;
  escrowFee: number;
  grand: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold">
          {provider.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{provider.name}</p>
          <p className="truncate text-xs text-muted-foreground">{provider.craft}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {provider.rating} · {provider.reviews}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {provider.area}
        </span>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
        <ShieldCheck className="h-3 w-3" /> {provider.tier}
      </span>

      <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service</span>
          <span className="font-medium">{service.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">When</span>
          <span className="font-medium">
            {date || "Pick a date"} {time && `· ${time}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{service.duration}</span>
        </div>
      </div>

      <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Escrow fee</span>
          <span>₦{escrowFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-2 text-base font-semibold">
          <span>Total</span>
          <span>₦{grand.toLocaleString()}</span>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs text-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Funds are held safely and only released once you confirm the job is done.
      </p>
    </div>
  );
}

function BookingSuccess({
  provider,
  service,
  date,
  time,
  total,
}: {
  provider: ProviderInfo;
  service: ServiceOption;
  date: string;
  time: string;
  total: number;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Booking request sent!</h1>
        <p className="mt-2 text-muted-foreground">
          {provider.name} typically replies within 15 minutes. You'll get a push notification when
          they accept.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left text-sm shadow-sm">
          <Row label="Service" value={service.name} />
          <Row label="When" value={`${date} · ${time}`} />
          <Row label="Held in escrow" value={`₦${total.toLocaleString()}`} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/provider/bookings"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            View as provider
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
