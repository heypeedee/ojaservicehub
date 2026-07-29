import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    const expected = await hmacSha512Hex(PAYSTACK_SECRET_KEY, rawBody);
    if (expected !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data?.reference as string | undefined;
      const paidKobo = event.data?.amount as number | undefined;
      if (!reference) return new Response("ok", { status: 200 });

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: booking } = await admin
        .from("bookings")
        .select("id, amount, payment_status")
        .eq("paystack_reference", reference)
        .maybeSingle();

      if (booking && booking.payment_status === "Unpaid") {
        const expectedKobo = Math.round(Number(booking.amount) * 100);
        if (paidKobo === expectedKobo) {
          const platformFee = Math.round(Number(booking.amount) * 0.05 * 100) / 100;
          const payoutAmount = Number(booking.amount) - platformFee;
          await admin
            .from("bookings")
            .update({
              payment_status: "Paid",
              platform_fee: platformFee,
              payout_amount: payoutAmount,
              paid_at: new Date().toISOString(),
            })
            .eq("id", booking.id);
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});

async function hmacSha512Hex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
