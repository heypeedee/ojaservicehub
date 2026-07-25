import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChefHat,
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
} from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account · ServiceHub" },
      {
        name: "description",
        content:
          "Join ServiceHub as a customer or list your services as a verified pro. Providers get an instant storefront the moment onboarding finishes.",
      },
      { property: "og:title", content: "Create your account · ServiceHub" },
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

const categories = [
  { name: "Hair & Beauty", icon: Scissors },
  { name: "Home Repair", icon: Wrench },
  { name: "Cleaning", icon: Sparkles },
  { name: "Electrical", icon: Zap },
  { name: "Photography", icon: Camera },
  { name: "Private Chef", icon: ChefHat },
  { name: "Painting", icon: Paintbrush },
  { name: "Handyman", icon: Briefcase },
];

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
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);

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

  function submit() {
    if (role === "provider") {
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

  // Role picker
  if (!role) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Join ServiceHub</h1>
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
            Already have an account? <span className="font-semibold text-foreground">Sign in</span>
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
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={inputCls} placeholder="At least 8 characters" />
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
                {categories.map((c) => {
                  const on = interests.includes(c.name);
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.name}
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
                <span>I agree to ServiceHub's terms of service, community guidelines and privacy policy.</span>
              </label>
              <button
                onClick={submit}
                disabled={!agree}
                className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Create my account <ArrowRight className="h-4 w-4" />
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
                    {categories.map((c) => (
                      <button
                        key={c.name}
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
              <button
                onClick={submit}
                disabled={!agree}
                className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Create my storefront <ArrowRight className="h-4 w-4" />
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
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> ServiceHub
          </Link>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
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
  };
}) {
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
            <NextStep title="Preview it" body="See how customers will find and book you." to="/pro/adaeze" cta="Open preview" />
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
