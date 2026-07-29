import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const { bookingId, reference } = await req.json();

    if (!bookingId || !reference) {
      return json({ error: "bookingId and reference are required" }, 400);
    }

    // Identify the caller from their JWT (RLS-scoped client, not privileged)
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await callerClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // Privileged client for the actual write (booking payment status)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, customer_id, amount, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) return json({ error: "Booking not found" }, 404);
    if (booking.customer_id !== user.id) return json({ error: "Not your booking" }, 403);
    if (booking.payment_status === "Paid" || booking.payment_status === "Released") {
      return json({ ok: true, alreadyPaid: true });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok || verifyJson?.data?.status !== "success") {
      return json({ error: "Payment not verified", detail: verifyJson }, 400);
    }

    const paidKobo = verifyJson.data.amount as number;
    const expectedKobo = Math.round(Number(booking.amount) * 100);
    if (paidKobo !== expectedKobo) {
      return json({ error: "Amount mismatch — refusing to mark as paid" }, 400);
    }

    const platformFee = Math.round(Number(booking.amount) * 0.05 * 100) / 100;
    const payoutAmount = Number(booking.amount) - platformFee;

    const { error: updateError } = await admin
      .from("bookings")
      .update({
        payment_status: "Paid",
        paystack_reference: reference,
        platform_fee: platformFee,
        payout_amount: payoutAmount,
        paid_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) return json({ error: updateError.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
