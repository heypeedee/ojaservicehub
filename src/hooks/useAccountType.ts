import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = "customer" | "provider";

export type AccountState = {
  loading: boolean;
  userId: string | null;
  type: AccountType | null;
};

/**
 * A signed-in user is a business owner when they own a provider_profiles row.
 * Everyone else signed in is a customer.
 */
export function useAccountType(): AccountState {
  const [state, setState] = useState<AccountState>({ loading: true, userId: null, type: null });

  useEffect(() => {
    let active = true;

    async function resolve() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      if (!uid) {
        if (active) setState({ loading: false, userId: null, type: null });
        return;
      }
      const { data } = await supabase
        .from("provider_profiles")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (active) setState({ loading: false, userId: uid, type: data ? "provider" : "customer" });
    }

    void resolve();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void resolve();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
