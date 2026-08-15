// Server-only wallet helpers (Paystack transfers + balance math).

export type LedgerRow = {
  type: string;
  status: string;
  amount_ngn: number;
};

const CREDIT_TYPES = new Set(["escrow_release", "tip", "refund", "topup"]);

export function computeBalance(rows: LedgerRow[]) {
  let available = 0;
  let pendingOut = 0;
  for (const r of rows) {
    if (CREDIT_TYPES.has(r.type) && r.status === "completed") available += Number(r.amount_ngn);
    if (r.type === "withdrawal" && r.status !== "failed") {
      available -= Number(r.amount_ngn);
      if (r.status === "pending") pendingOut += Number(r.amount_ngn);
    }
  }
  return { available: Math.max(0, Math.round(available)), pendingOut: Math.round(pendingOut) };
}

export async function paystackTransfer(opts: { amountNgn: number; recipient: string; reason: string }) {
  const key = process.env['PAYSTACK_SECRET_KEY'];
  if (!key) return { ok: false as const, error: "Payouts are not configured yet." };

  const res = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(opts.amountNgn * 100),
      recipient: opts.recipient,
      reason: opts.reason,
    }),
  });
  const body = (await res.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: { status?: string; transfer_code?: string } }
    | null;

  if (!res.ok || !body?.status) {
    return { ok: false as const, error: body?.message ?? "Paystack rejected the transfer." };
  }
  if (body.data?.status === "otp") {
    return {
      ok: false as const,
      error:
        "Your Paystack account requires OTP confirmation for transfers. Disable 'OTP for transfers' in Paystack settings and try again.",
    };
  }
  return { ok: true as const, status: body.data?.status ?? "pending", reference: body.data?.transfer_code ?? null };
}
