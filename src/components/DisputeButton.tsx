import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REASONS_CUSTOMER = [
  "Service not delivered",
  "Poor quality of work",
  "Pro didn't show up",
  "Charged the wrong amount",
  "Other",
];
const REASONS_PROVIDER = [
  "Customer unavailable",
  "Work requested beyond what was agreed",
  "Customer refuses to confirm completion",
  "Unsafe or abusive behaviour",
  "Other",
];

export function DisputedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
      <AlertTriangle className="h-3 w-3" /> Disputed · payment on hold
    </span>
  );
}

export function DisputeButton({
  bookingId,
  role,
  onOpened,
  className,
}: {
  bookingId: string;
  role: "customer" | "provider";
  onOpened?: () => void;
  className?: string;
}) {
  const reasons = role === "customer" ? REASONS_CUSTOMER : REASONS_PROVIDER;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("open_dispute", {
      _booking_id: bookingId,
      _reason: reason,
      _details: details,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    onOpened?.();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ??
          "rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
        }
      >
        Report a problem
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Report a problem</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  The payment stays safely held by Ọjà while our team reviews what happened. The other person will be told.
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-4 block text-xs font-semibold">What went wrong?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              {reasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <label className="mt-3 block text-xs font-semibold">Tell us more</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Describe what happened…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
              >
                {busy ? "Sending…" : "Open dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
