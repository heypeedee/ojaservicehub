import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

/**
 * A "back" control that actually goes back to wherever the user came from,
 * falling back to the homepage only if there's nowhere to go back to
 * (e.g. the user opened this page directly via a shared link).
 */
export function BackNav({ label = "Back", className }: { label?: string; className?: string }) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  }

  return (
    <button
      onClick={goBack}
      className={
        className ??
        "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      }
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
