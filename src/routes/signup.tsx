import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChefHat,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Paintbrush,
  Scissors,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { BackNav } from "@/components/BackNav";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account · Ọjà" },
      {
        name: "description",
        content:
          "Join Ọjà as a customer or list your services as a verified pro. Providers get an instant storefront the moment onboarding finishes.",
      },
      { property: "og:title", content: "Create your account · Ọjà" },
      {
        property: "og:description",
        content: "Customer or provider signup with instant storefront creation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

type Role = "customer" | "provider";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Hair & Beauty": Scissors,
  "Home Repair": Wrench,
  Cleaning: Sparkles,
  Electrical: Zap,
  Photography: Camera,
  "Private Chef": ChefHat,
  Tailoring: Paintbrush,
  "Auto Care": Briefcase,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function SignupPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login" | "forgot" | "reset">("signup");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Login-only fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  async function routeToDashboard(userId: string) {
    const { data: providerRow } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    navigate({ to: providerRow ? "/pro/dashboard" : "/dashboard", replace: true });
  }

  useEffect(() => {
    let active = true;
    async function init() {
      const [{ data: cats }, { data: sessionData }] = await Promise.all([
        supabase.from("categories").select("id, name").order("sort_order"),
        supabase.auth.getSession(),
      ]);
      if (!active) return;
      setDbCategories(cats ?? []);
      if (sessionData.session) {
        // Already signed in — no need to go through signup again.
        routeToDashboard(sessionData.session.user.id);
        return;
      }
      setCheckingSession(false);
    }
    init();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogin() {
    setAuthError(null);
    if (!loginEmail || !loginPassword) {
      setAuthError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setSubmitting(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data.user) await routeToDashboard(data.user.id);
  }

  async function handleGoogleSignIn() {
    setAuthError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: typeof window !== "undefined" ? `${window.location.origin}/signup` : undefined,
    });
    if (result.error) {
      setAuthError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await routeToDashboard(data.user.id);
  }


  async function handleSendReset() {
    setAuthError(null);
    if (!forgotEmail) {
      setAuthError("Enter your email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/signup` : undefined,
    });
    setSubmitting(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setForgotSent(true);
  }

  async function handleUpdatePassword() {
    setAuthError(null);
    if (newPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setResetDone(true);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setCheckingSession(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Common
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Lagos");
  const [area, setArea] = useState("");
  const [agree, setAgree] = useState(false);

  // Customer
  const [interests, setInterests] = useState<string[]>([]);

  // Provider
  const [bizName, setBizName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState<string>("");
  const [services, setServices] = useState<{ name: string; price: number }[]>([]);
  const [idType, setIdType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [created, setCreated] = useState<null | {
    slug: string;
    name: string;
    category: string;
    area: string;
    tagline: string;
    services: { name: string; price: number }[];
    pendingEmailConfirm?: boolean;
  }>(null);

  const slug = useMemo(() => slugify(bizName || fullName || "your-shop"), [bizName, fullName]);
  const totalSteps = role === "provider" ? 4 : 3;

  function toggleInterest(name: string) {
    setInterests((v) => (v.includes(name) ? v.filter((x) => x !== name) : [...v, name]));
  }
  function addService() {
    const price = Number(servicePrice);
    if (!serviceName.trim() || !price) return;
    setServices((s) => [...s, { name: serviceName.trim(), price }]);
    setServiceName("");
    setServicePrice("");
  }

  async function submit() {
    setAuthError(null);
    setSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setAuthError(signUpError.message);
      return;
    }

    const userId = signUpData.session?.user?.id ?? signUpData.user?.id ?? null;

    if (!signUpData.session) {
      // Email confirmation is required before a session exists — can't create
      // the provider profile yet (RLS requires an authenticated user).
      setSubmitting(false);
      setStep(totalSteps);
      setCreated({
        slug,
        name: bizName || fullName,
        category: category || "Services",
        area: `${area || "your area"}, ${city}`,
        tagline: tagline || "Trusted local professional",
        services: services.length
          ? services
          : priceFrom
            ? [{ name: "Starter service", price: Number(priceFrom) }]
            : [],
        pendingEmailConfirm: true,
      });
      return;
    }

    if (role === "provider" && userId) {
      const matchedCategory = dbCategories.find((c) => c.name === category);
      const computedPrice =
        services.length > 0 ? Math.min(...services.map((s) => s.price)) : priceFrom ? Number(priceFrom) : 0;

      const { error: profileError } = await supabase.from("provider_profiles").upsert({
        id: userId,
        business_name: bizName || fullName,
        tagline: tagline || null,
        category_id: matchedCategory?.id ?? null,
        area: `${area || "your area"}, ${city}`,
        phone: phone || null,
        price_from: computedPrice,
        published: true,
      });

      setSubmitting(false);
      if (profileError) {
        setAuthError(profileError.message);
        return;
      }

      setCreated({
        slug,
        name: bizName || fullName,
        category: category || "Services",
        area: `${area || "your area"}, ${city}`,
        tagline: tagline || "Trusted local professional",
        services: services.length
          ? services
          : priceFrom
            ? [{ name: "Starter service", price: Number(priceFrom) }]
            : [],
      });
      setStep(totalSteps);
    } else {
      setSubmitting(false);
      setStep(totalSteps);
    }
  }

  // Success / storefront view
  if (created && step >= totalSteps && role === "provider") {
    return <StorefrontLive created={created} />;
  }
  if (step >= totalSteps && role === "customer") {
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Welcome, {fullName.split(" ")[0] || "friend"}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account is ready. Start with Instant Match or browse trusted pros near {area || city}.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => navigate({ to: "/instant-match" })}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Try Instant Match <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/search"
              search={{ q: "" }}
              className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Browse pros
            </Link>
          </div>
          {interests.length > 0 && (
            <p className="mt-4 text-[11px] text-muted-foreground">
              We'll show you more of: {interests.join(" · ")}
            </p>
          )}
        </div>
      </Shell>
    );
  }

  if (checkingSession) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-20 text-center text-sm text-muted-foreground">Loading…</div>
      </Shell>
    );
  }

  // Forgot password
  if (mode === "forgot") {
    return (
      <Shell>
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-muted-foreground">We'll email you a link to set a new one.</p>
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            {forgotSent ? (
              <p className="text-sm text-foreground">
                Check <span className="font-semibold">{forgotEmail}</span> for a reset link. It can take a
                minute to arrive — check spam too.
              </p>
            ) : (
              <>
                <Field label="Email">
                  <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" className={inputCls} placeholder="you@email.com" />
                </Field>
                {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
                <button
                  onClick={handleSendReset}
                  disabled={submitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </button>
              </>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <button onClick={() => { setMode("login"); setAuthError(null); }} className="font-semibold text-foreground hover:underline">
              Back to sign in
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  // Reset password (arrived here via the emailed recovery link)
  if (mode === "reset") {
    return (
      <Shell>
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            {resetDone ? (
              <>
                <p className="text-sm text-foreground">Your password has been updated.</p>
                <button
                  onClick={() => { setMode("login"); setResetDone(false); }}
                  className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <Field label="New password">
                  <PasswordInput value={newPassword} onChange={setNewPassword} className={inputCls} placeholder="At least 8 characters" />
                </Field>
                {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
                <button
                  onClick={handleUpdatePassword}
                  disabled={submitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Updating…" : "Update password"}
                </button>
              </>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // Login
  if (mode === "login") {
    return (
      <Shell>
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-muted-foreground">Welcome back to Ọjà.</p>
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <GoogleIcon /> Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3">
              <Field label="Email">
                <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" className={inputCls} placeholder="you@email.com" />
              </Field>
              <Field label="Password">
                <PasswordInput value={loginPassword} onChange={setLoginPassword} className={inputCls} placeholder="Your password" />
              </Field>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setAuthError(null); setForgotSent(false); }}
                className="justify-self-end text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
            <button
              onClick={handleLogin}
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            New here?{" "}
            <button onClick={() => { setMode("signup"); setAuthError(null); }} className="font-semibold text-foreground hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  // Role picker
  if (!role) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Join Ọjà</h1>
          <p className="mt-2 text-muted-foreground">Pick how you want to start. You can switch later.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <RoleCard
              icon={User}
              title="I need a service"
              blurb="Book verified pros, chat, pay in escrow, and leave real reviews."
              onClick={() => setRole("customer")}
              cta="Continue as customer"
            />
            <RoleCard
              icon={Store}
              title="I offer services"
              blurb="Get a free storefront the moment you finish onboarding — bookings, payments and reviews included."
              onClick={() => setRole("provider")}
              cta="Continue as provider"
              highlight
            />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => { setMode("login"); setAuthError(null); }} className="font-semibold text-foreground hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? setRole(null) : setStep((s) => s - 1))}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </span>
        </div>

        <Progress step={step} total={totalSteps} />

        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <>
              <StepHead title="Your details" sub="We'll use these to secure your account and send booking updates." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Adaeze Okoye" />
                </Field>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputCls} pl-9`} placeholder="you@email.com" />
                  </div>
                </Field>
                <Field label="Phone">
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputCls} pl-9`} placeholder="+234 801 234 5678" />
                  </div>
                </Field>
                <Field label="Password">
                  <PasswordInput value={password} onChange={setPassword} className={inputCls} placeholder="At least 8 characters" />
                </Field>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="City">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
                    {["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Neighborhood / area">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={area} onChange={(e) => setArea(e.target.value)} className={`${inputCls} pl-9`} placeholder="Lekki Phase 1" />
                  </div>
                </Field>
              </div>
              <Continue
                disabled={!fullName || !email || password.length < 8}
                onClick={() => setStep(1)}
              />
            </>
          )}

          {step === 1 && role === "customer" && (
            <>
              <StepHead title="What are you looking for?" sub="Pick a few — we'll personalize your home feed. You can change this anytime." />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dbCategories.map((c) => {
                  const on = interests.includes(c.name);
                  const Icon = CATEGORY_ICONS[c.name] ?? Store;
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleInterest(c.name)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                        on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{c.name}</span>
                      {on && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
              <Continue onClick={() => setStep(2)} />
            </>
          )}

          {step === 2 && role === "customer" && (
            <>
              <StepHead title="One last thing" sub="Agree to the community rules — kindness, honesty, and safety for everyone." />
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                <span>I agree to Ọjà's terms of service, community guidelines and privacy policy.</span>
              </label>
              {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
              <button
                onClick={submit}
                disabled={!agree || submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Creating account…" : <>Create my account <ArrowRight className="h-4 w-4" /></>}
              </button>
            </>
          )}

          {step === 1 && role === "provider" && (
            <>
              <StepHead title="About your business" sub="This becomes the top of your storefront. Keep it clear and specific." />
              <div className="mt-4 grid gap-3">
                <Field label="Business name">
                  <input value={bizName} onChange={(e) => setBizName(e.target.value)} className={inputCls} placeholder="Adaeze Beauty Studio" />
                </Field>
                <Field label="Main category">
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.name)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          category === c.name ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Short tagline">
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} placeholder="Bridal & event glam — calm energy, gorgeous work" />
                </Field>
                <Field label="About (2–3 sentences)">
                  <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} className={inputCls} placeholder="What you do, who you serve, what makes your work different." />
                </Field>
                <Field label="Storefront URL preview">
                  <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    servicehub.app/<span className="font-semibold text-foreground">{slug}</span>
                  </div>
                </Field>
              </div>
              <Continue disabled={!bizName || !category} onClick={() => setStep(2)} />
            </>
          )}

          {step === 2 && role === "provider" && (
            <>
              <StepHead title="Add your services" sub="You need at least one. You can edit prices, add photos and more after your storefront is live." />
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <div className="min-w-[180px] flex-1">
                  <label className="text-xs font-semibold text-muted-foreground">Service name</label>
                  <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className={inputCls} placeholder="Bridal trial makeup" />
                </div>
                <div className="w-32">
                  <label className="text-xs font-semibold text-muted-foreground">Price (₦)</label>
                  <input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} inputMode="numeric" className={inputCls} placeholder="45000" />
                </div>
                <button onClick={addService} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Add
                </button>
              </div>
              {services.length > 0 ? (
                <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                  {services.map((s, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="font-medium">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₦{s.price.toLocaleString()}</span>
                        <button
                          onClick={() => setServices((v) => v.filter((_, j) => j !== i))}
                          className="text-xs font-semibold text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No services yet. Add your most popular one first.
                </div>
              )}
              <div className="mt-4">
                <Field label="Or set a starting price (₦)">
                  <input value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} inputMode="numeric" className={inputCls} placeholder="15000" />
                </Field>
              </div>
              <Continue disabled={services.length === 0 && !priceFrom} onClick={() => setStep(3)} />
            </>
          )}

          {step === 3 && role === "provider" && (
            <>
              <StepHead title="Verify to earn the trust badge" sub="Verification unlocks the blue check, better search ranking, and payouts to your bank." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="ID type">
                  <select value={idType} onChange={(e) => setIdType(e.target.value)} className={inputCls}>
                    {["NIN", "Driver's licence", "International passport", "Voter's card"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ID number">
                  <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputCls} placeholder="XXX-XXXX-XXXX" />
                </Field>
              </div>
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                <span>I agree to the provider terms, escrow rules and community guidelines.</span>
              </label>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  We verify quickly — most pros get their badge within 24 hours. You can start taking bookings immediately.
                </span>
              </div>
              {authError && <p className="mt-3 text-sm text-destructive">{authError}</p>}
              <button
                onClick={submit}
                disabled={!agree || submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Creating storefront…" : <>Create my storefront <ArrowRight className="h-4 w-4" /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BackNav label="Ọjà" />
          <span className="text-xs font-semibold text-muted-foreground">Create your account</span>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  blurb,
  cta,
  onClick,
  highlight,
}: {
  icon: typeof User;
  title: string;
  blurb: string;
  cta: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        highlight ? "border-primary/40 bg-primary/[0.04]" : "border-border bg-card"
      }`}
    >
      {highlight && (
        <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Free storefront
        </span>
      )}
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.73z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.29 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3v-3.1H1.27A11.96 11.96 0 000 12c0 1.93.46 3.76 1.27 5.4l4-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.25 2.7 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Continue({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
    >
      Continue <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function StorefrontLive({
  created,
}: {
  created: {
    slug: string;
    name: string;
    category: string;
    area: string;
    tagline: string;
    services: { name: string; price: number }[];
    pendingEmailConfirm?: boolean;
  };
}) {
  if (created.pendingEmailConfirm) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Confirm your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to your inbox. Once confirmed, sign in and finish publishing{" "}
            <span className="font-semibold text-foreground">{created.name}</span> from your business dashboard.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-primary/30 bg-primary/[0.04] p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-5 w-5" /> Your storefront is live
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {created.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {created.tagline} · {created.category} · {created.area}
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-background px-3 py-2 text-sm">
            <span className="text-muted-foreground">Your storefront:</span>{" "}
            <span className="font-semibold">servicehub.app/{created.slug}</span>
          </div>

          {created.services.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Services</h2>
              <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
                {created.services.map((s, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-semibold">₦{s.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <NextStep title="See yourself live" body="Find your listing the way customers will." to="/search" cta="Open search" />
            <NextStep title="Set up dashboard" body="Track bookings, revenue and reviews." to="/pro/dashboard" cta="Open dashboard" />
            <NextStep title="Get discovered" body="Boost placement in search and Instant Match." to="/plans" cta="See Premium" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function NextStep({ title, body, to, cta }: { title: string; body: string; to: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      <Link to={to} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
