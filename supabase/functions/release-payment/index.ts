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

    const { data: payout } = await admin
      .from("provider_payout_details")
      .select("paystack_recipient_code")
      .eq("provider_id", user.id)
      .maybeSingle();

    if (!payout?.paystack_recipient_code) {
      return json({ error: "Add your payout bank details in Settings before releasing payment" }, 400);
    }

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(Number(booking.payout_amount) * 100),
        recipient: payout.paystack_recipient_code,
        reason: `Ọjà payout — ${booking.service_title}`,
      }),
    });
    const transferJson = await transferRes.json();
    console.log("paystack transfer response", transferRes.status, JSON.stringify(transferJson));

    if (!transferRes.ok || !transferJson?.status) {
      const reason = transferJson?.message ?? "Transfer failed";
      console.error("paystack transfer rejected:", reason);
      return json({ error: `Paystack: ${reason}`, detail: transferJson }, 400);
    }

    const transferStatus = transferJson.data?.status; // 'success' | 'pending' | 'otp'
    if (transferStatus === "otp") {
      return json({
        error:
          "Your Paystack account requires OTP confirmation for transfers. Disable 'OTP for transfers' in your Paystack dashboard settings, or finalize this transfer manually from the Paystack dashboard.",
      }, 400);
    }

    await admin
      .from("bookings")
      .update({
        payment_status: "Released",
        transfer_reference: transferJson.data?.transfer_code ?? null,
        released_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return json({ ok: true, status: transferStatus });
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
