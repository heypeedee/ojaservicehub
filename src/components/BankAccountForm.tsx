import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "Opay", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

export function BankAccountForm({ onSaved }: { onSaved?: () => void }) {
  const [bankCode, setBankCode] = useState(NIGERIAN_BANKS[0]!.code);
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  async function save() {
    setError(null);
    if (accountNumber.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }
    setSaving(true);
    const bankName = NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name ?? "";
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error: fnError } = await supabase.functions.invoke("create-recipient", {
      body: { bankCode, bankName, accountNumber },
      headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
    });
    setSaving(false);
    const errMsg = (data as { error?: string } | null)?.error;
    if (fnError || errMsg) {
      setError(errMsg || "Could not verify that account. Check the details and try again.");
      return;
    }
    setSavedName((data as { accountName?: string }).accountName ?? "Account verified");
    onSaved?.();
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-muted-foreground">
        Bank
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {NIGERIAN_BANKS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-muted-foreground">
        Account number
        <input
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="0123456789"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {savedName && <p className="text-xs text-emerald-600">Verified: {savedName}</p>}
      <button
        disabled={saving}
        onClick={() => void save()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saving ? "Verifying…" : "Verify & save account"}
      </button>
    </div>
  );
}
