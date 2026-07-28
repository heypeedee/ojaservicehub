import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck2,
  Film,
  ImagePlus,
  MapPin,
  MessageCircle,
  Repeat,
  ShieldCheck,
  Star,
  ThumbsUp,
  X,
} from "lucide-react";
import { BackNav } from "@/components/BackNav";

export const Route = createFileRoute("/pro/adaeze")({
  head: () => ({
    meta: [
      { title: "Adaeze Okoye · Platinum Pro · Ọjà" },
      {
        name: "description",
        content:
          "Verified bridal hair & makeup pro in Lekki. See trust score, background verification, 214 verified reviews with photos and videos.",
      },
      { property: "og:title", content: "Adaeze Okoye · Platinum Pro · Ọjà" },
      {
        property: "og:description",
        content: "Trust profile, verified reviews, and job history.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustProfile,
});

const pro = {
  name: "Adaeze Okoye",
  craft: "Bridal Hair & Makeup",
  area: "Lekki Phase 1, Lagos",
  memberSince: "March 2022",
  initials: "AO",
  tier: "Platinum",
  nextTier: "Elite",
  trustScore: 96,
  tierProgress: 82,
  rating: 4.98,
  reviews: 214,
  stats: {
    jobsCompleted: 486,
    repeatCustomers: "38%",
    responseTime: "8 min",
    cancellationRate: "0.4%",
    satisfaction: "98%",
  },
  verifications: [
    { label: "Government ID verified", ok: true },
    { label: "Phone & email verified", ok: true },
    { label: "Background check passed", ok: true },
    { label: "Address confirmed", ok: true },
    { label: "Professional certificate on file", ok: true },
  ],
};

const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Elite"] as const;

const ratingBreakdown = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

type Media = { type: "photo" | "video"; url: string };
type Review = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  service: string;
  body: string;
  media: Media[];
  verified: boolean;
  helpful: number;
};

const seedReviews: Review[] = [
  {
    id: "r_001",
    author: "Amaka E.",
    initials: "AE",
    rating: 5,
    date: "2 weeks ago",
    service: "Bridal glam package",
    body: "Adaeze made my wedding day unforgettable. Arrived early, calm energy, and the makeup lasted from 7am to midnight without a single touch-up. Skin looked luminous in every photo.",
    media: [
      { type: "photo", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format" },
      { type: "photo", url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format" },
      { type: "video", url: "" },
    ],
    verified: true,
    helpful: 24,
  },
  {
    id: "r_002",
    author: "Tunde B.",
    initials: "TB",
    rating: 5,
    date: "1 month ago",
    service: "Party makeup",
    body: "Booked for my sister's birthday shoot. Super professional, brought her own ring light and worked fast. Will book again.",
    media: [
      { type: "photo", url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format" },
    ],
    verified: true,
    helpful: 11,
  },
  {
    id: "r_003",
    author: "Grace N.",
    initials: "GN",
    rating: 4,
    date: "2 months ago",
    service: "Hair styling only",
    body: "Great styling and very sweet. Ran ~10 min late due to traffic but communicated clearly.",
    media: [],
    verified: true,
    helpful: 3,
  },
];

function TrustProfile() {
  const [reviews, setReviews] = useState<Review[]>(seedReviews);
  const [showForm, setShowForm] = useState(false);
  // Simulates whether the current signed-in user has a verified completed
  // booking with this pro. Only verified bookings unlock the review form.
  const [hasVerifiedBooking] = useState(true);

  function addReview(r: Review) {
    setReviews((list) => [r, ...list]);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <main className="space-y-6">
            <HeaderCard />
            <TrustScoreCard />
            <StatsGrid />
            <VerificationList />

            <section id="reviews" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Verified reviews</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Only customers with a completed, escrow-paid booking can leave a review.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      <span className="text-2xl font-semibold">{pro.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{pro.reviews} verified reviews</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
                <div className="space-y-1.5">
                  {ratingBreakdown.map((r) => (
                    <div key={r.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-muted-foreground">{r.stars}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  {hasVerifiedBooking ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">You had a completed booking with Adaeze</p>
                        <p className="text-xs text-muted-foreground">
                          Share your experience — with photos or a short video.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                      >
                        Write a review
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Book & complete a job with this pro to leave a verified review.
                    </div>
                  )}
                </div>
              </div>

              {showForm && (
                <ReviewForm onCancel={() => setShowForm(false)} onSubmit={addReview} />
              )}

              <ul className="mt-6 space-y-5">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </ul>
            </section>
          </main>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <TierCard />
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Ready to book?</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Escrow-protected. Cancel free up to 24h before.
              </p>
              <Link
                to="/search"
                search={{ q: "" }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Book Adaeze
              </Link>
              <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
                <MessageCircle className="h-4 w-4" /> Message
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BackNav label="Back to Ọjà" />
        <a href="#reviews" className="text-sm font-medium text-primary hover:underline">
          Jump to reviews
        </a>
      </div>
    </div>
  );
}

function HeaderCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="h-32"
        style={{
          background:
            "linear-gradient(120deg, oklch(0.92 0.08 190 / 0.7), oklch(0.92 0.12 75 / 0.6))",
        }}
      />
      <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
        <div className="flex items-end gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-card bg-primary text-xl font-semibold text-primary-foreground shadow">
            {pro.initials}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{pro.name}</h1>
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{pro.craft}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {pro.area}
              </span>
              <span>Member since {pro.memberSince}</span>
            </div>
          </div>
        </div>
        <TierPill tier={pro.tier} large />
      </div>
    </section>
  );
}

function TrustScoreCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Trust score</h2>
          <p className="text-sm text-muted-foreground">
            A combined signal from verifications, reviews, and job history.
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold text-primary">{pro.trustScore}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${pro.trustScore}%` }}
        />
      </div>
    </section>
  );
}

function StatsGrid() {
  const items = [
    { icon: CheckCircle2, label: "Jobs completed", value: pro.stats.jobsCompleted.toLocaleString() },
    { icon: Repeat, label: "Repeat customers", value: pro.stats.repeatCustomers },
    { icon: Clock, label: "Response time", value: pro.stats.responseTime },
    { icon: ThumbsUp, label: "Satisfaction", value: pro.stats.satisfaction },
    { icon: X, label: "Cancellation rate", value: pro.stats.cancellationRate },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <s.icon className="h-4 w-4 text-primary" />
          <p className="mt-2 text-xl font-semibold">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

function VerificationList() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <FileCheck2 className="h-5 w-5 text-primary" /> Verification
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Independently checked by Ọjà's trust & safety team.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {pro.verifications.map((v) => (
          <li
            key={v.label}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-foreground">{v.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TierCard() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest opacity-80">Provider tier</p>
        <ShieldCheck className="h-5 w-5" />
      </div>
      <p className="mt-1 text-2xl font-semibold">{pro.tier}</p>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-medium opacity-90">
          {tiers.map((t) => (
            <span key={t} className={t === pro.tier ? "opacity-100" : "opacity-60"}>
              {t}
            </span>
          ))}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pro.tierProgress}%` }} />
        </div>
        <p className="mt-2 text-xs opacity-90">
          {pro.tierProgress}% toward <span className="font-semibold">{pro.nextTier}</span> — keep 4.9+ rating for 30 more jobs.
        </p>
      </div>
    </div>
  );
}

function TierPill({ tier, large = false }: { tier: string; large?: boolean }) {
  const map: Record<string, string> = {
    Elite: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
    Platinum: "bg-slate-900 text-white",
    Gold: "bg-amber-500 text-amber-950",
    Silver: "bg-slate-200 text-slate-800",
    Bronze: "bg-orange-200 text-orange-900",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      } ${map[tier] ?? "bg-secondary text-secondary-foreground"}`}
    >
      <ShieldCheck className={large ? "h-3.5 w-3.5" : "h-3 w-3"} /> {tier} tier
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {review.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{review.author}</p>
              {review.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <BadgeCheck className="h-3 w-3" /> Verified booking
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <StarRow value={review.rating} />
              <span>·</span>
              <span>{review.service}</span>
              <span>·</span>
              <span>{review.date}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{review.body}</p>
      {review.media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.media.map((m, i) =>
            m.type === "photo" ? (
              <img
                key={i}
                src={m.url}
                alt="Review attachment"
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
            ) : (
              <div
                key={i}
                className="grid h-20 w-20 place-items-center rounded-lg border border-border bg-muted text-muted-foreground"
              >
                <Film className="h-6 w-6" />
              </div>
            ),
          )}
        </div>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <button className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 hover:bg-muted">
          <ThumbsUp className="h-3 w-3" /> Helpful · {review.helpful}
        </button>
      </div>
    </li>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= Math.round(value) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

function ReviewForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<Media[]>([]);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const next: Media[] = Array.from(list).slice(0, 6 - media.length).map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "photo",
      url: URL.createObjectURL(f),
    }));
    setMedia((m) => [...m, ...next]);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        onSubmit({
          id: `r_${Date.now()}`,
          author: "You",
          initials: "YO",
          rating,
          date: "just now",
          service: "Verified booking",
          body: body.trim(),
          media,
          verified: true,
          helpful: 0,
        });
      }}
      className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-6 w-6 ${
                  n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="How was your experience? Anything future customers should know?"
        className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
      />
      <div className="mt-3">
        <p className="text-xs font-medium text-muted-foreground">Add photos or a short video</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {media.map((m, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
              {m.type === "photo" ? (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                  <Film className="h-5 w-5" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setMedia((list) => list.filter((_, idx) => idx !== i))}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {media.length < 6 && (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-background text-[10px] text-muted-foreground hover:border-primary/50">
              <ImagePlus className="h-4 w-4" />
              Add
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Camera className="h-3.5 w-3.5" /> Public — posted with your name.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Post review
          </button>
        </div>
      </div>
    </form>
  );
}
