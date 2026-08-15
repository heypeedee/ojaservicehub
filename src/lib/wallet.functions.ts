import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WalletOverview = {
  available: number;
  pendingOut: number;
  payout: { bank_name: string; account_number: string; account_name: string; ready: boolean } | null;
  ledger: Array<{ id: string; type: string; status: string; amount_ngn: number; created_at: string }>;
  withdrawals: Array<{
    id: string;
    amount_ngn: number;
    status: string;
    bank_name: string;
    account_number: string;
    failure_reason: string | null;
    created_at: string;
  }>;
};

export const getWalletOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WalletOverview> => {
    const { computeBalance } = await import("./wallet.server");
    const { supabase, userId } = context;

    const [{ data: ledger }, { data: withdrawals }, { data: payout }] = await Promise.all([
      supabase
        .from("wallet_transactions")
        .select("id, type, status, amount_ngn, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("withdrawal_requests")
        .select("id, amount_ngn, status, bank_name, account_number, failure_reason, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("provider_payout_details")
        .select("bank_name, account_number, account_name, paystack_recipient_code")
        .eq("provider_id", userId)
        .maybeSingle(),
    ]);

    const { available, pendingOut } = computeBalance(ledger ?? []);

    return {
      available,
      pendingOut,
      payout: payout
        ? {
            bank_name: payout.bank_name,
            account_number: payout.account_number,
            account_name: payout.account_name,
            ready: Boolean(payout.paystack_recipient_code),
          }
        : null,
      ledger: ledger ?? [],
      withdrawals: withdrawals ?? [],
    };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amountNgn: number }) => input)
  .handler(async ({ data, context }) => {
    const { computeBalance, paystackTransfer } = await import("./wallet.server");
    const { supabase, userId } = context;

    const amount = Math.floor(Number(data.amountNgn));
    if (!Number.isFinite(amount) || amount < 1000) {
      return { ok: false as const, error: "Minimum withdrawal is ₦1,000." };
    }

    const [{ data: ledger }, { data: payout }] = await Promise.all([
      supabase.from("wallet_transactions").select("type, status, amount_ngn").eq("user_id", userId),
      supabase
        .from("provider_payout_details")
        .select("bank_name, account_number, account_name, paystack_recipient_code")
        .eq("provider_id", userId)
        .maybeSingle(),
    ]);

    if (!payout?.paystack_recipient_code) {
      return { ok: false as const, error: "Add and verify your payout bank account first." };
    }

    const { available } = computeBalance(ledger ?? []);
    if (amount > available) {
      return { ok: false as const, error: `You can withdraw up to ₦${available.toLocaleString()}.` };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request, error: reqError } = await supabaseAdmin
      .from("withdrawal_requests")
      .insert({
        user_id: userId,
        amount_ngn: amount,
        bank_name: payout.bank_name,
        account_number: payout.account_number,
        account_name: payout.account_name,
        status: "pending",
      })
      .select("id")
      .single();
    if (reqError || !request) return { ok: false as const, error: "Could not start the withdrawal. Try again." };

    const { data: txn } = await supabaseAdmin
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        type: "withdrawal",
        status: "pending",
        amount_ngn: amount,
        reference: request.id,
        metadata: { withdrawal_request_id: request.id },
      })
      .select("id")
      .single();

    const transfer = await paystackTransfer({
      amountNgn: amount,
      recipient: payout.paystack_recipient_code,
      reason: "Ọjà wallet withdrawal",
    });

    if (!transfer.ok) {
      await supabaseAdmin
        .from("withdrawal_requests")
        .update({ status: "failed", failure_reason: transfer.error })
        .eq("id", request.id);
      if (txn) await supabaseAdmin.from("wallet_transactions").update({ status: "failed" }).eq("id", txn.id);
      return { ok: false as const, error: transfer.error };
    }

    const settled = transfer.status === "success";
    await supabaseAdmin
      .from("withdrawal_requests")
      .update({ status: settled ? "completed" : "pending", transfer_reference: transfer.reference })
      .eq("id", request.id);
    if (txn)
      await supabaseAdmin
        .from("wallet_transactions")
        .update({ status: settled ? "completed" : "pending", reference: transfer.reference ?? request.id })
        .eq("id", txn.id);

    return { ok: true as const, status: settled ? "completed" : "processing", amount };
  });
