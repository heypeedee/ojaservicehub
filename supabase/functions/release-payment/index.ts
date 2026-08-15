import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const { bookingId } = await req.json();
    if (!bookingId) return json({ error: "bookingId is required" }, 400);

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await callerClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, provider_id, status, payment_status, payout_amount, service_title")
      .eq("id", bookingId)
      .maybeSingle();
    if (bookingError || !booking) return json({ error: "Booking not found" }, 404);
    if (booking.provider_id !== user.id) return json({ error: "Not your booking" }, 403);
    if (booking.status !== "completed") return json({ error: "Job must be marked Completed first" }, 400);
    if (booking.payment_status !== "Paid") return json({ error: "This booking hasn't been paid for yet" }, 400);

    // Release escrow into the provider's Ọjà wallet. Cash-out to the bank
    // happens separately from the Wallet page (withdrawal request).
    const { error: creditError } = await admin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "escrow_release",
      status: "completed",
      amount_ngn: Math.round(Number(booking.payout_amount)),
      reference: booking.id,
      metadata: { booking_id: booking.id, service_title: booking.service_title },
    });
    if (creditError) {
      console.error("wallet credit failed", creditError);
      return json({ error: "Could not credit your wallet. Try again." }, 500);
    }

    await admin
      .from("bookings")
      .update({
        payment_status: "Released",
        released_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return json({ ok: true, status: "credited" });
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
