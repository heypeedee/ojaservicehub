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
    const { bankCode, bankName, accountNumber } = await req.json();

    if (!bankCode || !bankName || !accountNumber) {
      return json({ error: "bankCode, bankName and accountNumber are required" }, 400);
    }

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await callerClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // 1. Resolve the account number to a real account name
    const resolveRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const resolveJson = await resolveRes.json();
    if (!resolveRes.ok || !resolveJson?.status) {
      return json({ error: "Could not verify that account number", detail: resolveJson }, 400);
    }
    const accountName = resolveJson.data.account_name as string;

    // 2. Create (or Paystack will dedupe) a transfer recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });
    const recipientJson = await recipientRes.json();
    if (!recipientRes.ok || !recipientJson?.status) {
      return json({ error: "Could not register payout recipient", detail: recipientJson }, 400);
    }
    const recipientCode = recipientJson.data.recipient_code as string;

    // 3. Save it — service role, since this table has no public policy at all
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: upsertError } = await admin.from("provider_payout_details").upsert({
      provider_id: user.id,
      bank_code: bankCode,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      paystack_recipient_code: recipientCode,
    });
    if (upsertError) return json({ error: upsertError.message }, 500);

    return json({ ok: true, accountName });
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
