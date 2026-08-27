import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Store, User } from "lucide-react";
import { useAccountType, type AccountType } from "@/hooks/useAccountType";

function Splash({ text }: { text: string }) {
  return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">{text}</div>;
}

function SignInWall() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-semibold text-foreground">Sign in to continue.</p>
        <Link
          to="/signup"
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Sign in / create account
        </Link>
      </div>
    </div>
  );
}

/**
 * Keeps the customer experience and the business-owner experience apart.
 * `allow` is the account type this area belongs to.
 */
export function RoleGate({
  allow,
  children,
  onWrongRole,
}: {
  allow: AccountType;
  children: ReactNode;
  onWrongRole?: ReactNode;
}) {
  const { loading, userId, type } = useAccountType();
  const navigate = useNavigate();
  const mismatch = !loading && !!userId && type !== allow;

  useEffect(() => {
    if (mismatch && !onWrongRole) {
      void navigate({ to: allow === "provider" ? "/dashboard" : "/pro/dashboard", replace: true });
    }
  }, [mismatch, onWrongRole, allow, navigate]);

  if (loading) return <Splash text="Loading…" />;
  if (!userId) return <SignInWall />;
  if (mismatch) return <>{onWrongRole ?? <Splash text="Taking you to your dashboard…" />}</>;
  return <>{children}</>;
}

export function WrongRoleNotice({
  title,
  body,
  toLabel,
  to,
  action,
}: {
  title: string;
  body: string;
  toLabel: string;
  to: "/dashboard" | "/pro/dashboard";
  action?: ReactNode;
}) {
  const Icon = to === "/dashboard" ? User : Store;
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="mt-3 text-lg font-semibold">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to={to}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {toLabel}
          </Link>
          {action}
        </div>
      </div>
    </div>
  );
}
