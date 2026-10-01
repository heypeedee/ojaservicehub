import { Link } from "@tanstack/react-router";
import { useAccountType } from "@/hooks/useAccountType";

/** Links a signed-in user to the dashboard for their own account type only. */
export function DashboardLink({ className, label }: { className?: string; label?: string }) {
  const { type } = useAccountType();
  if (type === "provider") {
    return (
      <Link to="/pro/dashboard" className={className}>
        {label ?? "Business dashboard"}
      </Link>
    );
  }
  return (
    <Link to="/dashboard" className={className}>
      {label ?? "My orders"}
    </Link>
  );
}
