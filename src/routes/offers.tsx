import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, Gavel, TrendingUp } from "lucide-react";
import { BackNav } from "@/components/BackNav";
import { OjaLogo } from "@/components/OjaLogo";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Bargain & bid · Ọjà" },
      {
        name: "description",
        content: "Negotiate service prices with providers or run highest-bidder auctions on Ọjà — coming soon.",
      },
      { property: "og:title", content: "Bargain & bid · Ọjà" },
      { property: "og:description", content: "Coming soon to Ọjà." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BackNav label="Back to Ọjà" />
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={28} />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <ArrowLeftRight className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Bargain & bid — coming soon</h1>
        <p className="mt-3 text-muted-foreground">
          We're building a real way to negotiate prices with providers and run highest-bidder auctions for
          larger jobs, with escrow-safe accepts and live bid tracking. It isn't live yet, so there's nothing
          fake to show you here in the meantime.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" /> Bargaining
            </div>
            <p className="text-xs text-muted-foreground">
              Send a counter-offer on a service price directly to a provider before booking.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Gavel className="h-4 w-4 text-primary" /> Reverse auctions
            </div>
            <p className="text-xs text-muted-foreground">
              Post a job and let verified pros bid for it — you pick the best offer.
            </p>
          </div>
        </div>

        <Link
          to="/search"
          search={{ q: "" }}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse pros instead
        </Link>
      </div>
    </div>
  );
}
