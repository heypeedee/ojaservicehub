import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, FileUp, Loader2, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DocType = "selfie" | "nin" | "address" | "bank";

type KycDoc = {
  id: string;
  doc_type: string;
  file_path: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

const DOCS: Array<{ key: DocType; label: string; hint: string; accept: string }> = [
  { key: "selfie", label: "Live selfie", hint: "A clear photo of your face, good lighting.", accept: "image/*" },
  { key: "nin", label: "Government ID (NIN)", hint: "NIN slip, driver's licence or int'l passport.", accept: "image/*,application/pdf" },
  { key: "address", label: "Proof of address", hint: "Utility bill or bank statement, last 3 months.", accept: "image/*,application/pdf" },
  { key: "bank", label: "Business bank account", hint: "Screenshot or statement header showing the account name.", accept: "image/*,application/pdf" },
];

const MAX_MB = 10;

export function KycPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, KycDoc>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", uid);
      if (!active) return;
      setDocs(Object.fromEntries((data ?? []).map((d) => [d.doc_type, d as KycDoc])));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const approved = DOCS.filter((d) => docs[d.key]?.status === "approved").length;

  return (
    <section className="rounded-3xl border border-primary/20 bg-brand-soft/40 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand">
          <ShieldCheck className="h-4 w-4" /> Business verification (KYC)
        </div>
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {approved}/{DOCS.length} approved
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Upload each document once. Our team reviews them — verified businesses rank higher and can withdraw faster.
      </p>

      {loading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading…</p>
      ) : !userId ? (
        <p className="mt-4 text-xs text-muted-foreground">Sign in to upload your documents.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {DOCS.map((d) => (
            <KycRow
              key={d.key}
              userId={userId}
              def={d}
              doc={docs[d.key] ?? null}
              onChange={(next) =>
                setDocs((prev) => {
                  const copy = { ...prev };
                  if (next) copy[d.key] = next;
                  else delete copy[d.key];
                  return copy;
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function KycRow({
  userId,
  def,
  doc,
  onChange,
}: {
  userId: string;
  def: (typeof DOCS)[number];
  doc: KycDoc | null;
  onChange: (doc: KycDoc | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = doc?.status ?? "none";

  async function upload(file: File) {
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large — keep it under ${MAX_MB}MB.`);
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${def.key}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("kyc-docs").upload(path, file, { upsert: true });
    if (upErr) {
      setBusy(false);
      setError("Upload failed. Check your connection and try again.");
      return;
    }
    const { data, error: dbErr } = await supabase
      .from("kyc_documents")
      .upsert(
        { user_id: userId, doc_type: def.key, file_path: path, status: "pending", rejection_reason: null },
        { onConflict: "user_id,doc_type" }
      )
      .select("*")
      .single();
    setBusy(false);
    if (dbErr || !data) {
      setError("Could not save the document. Try again.");
      return;
    }
    onChange(data as KycDoc);
  }

  async function view() {
    if (!doc) return;
    const { data } = await supabase.storage.from("kyc-docs").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove() {
    if (!doc) return;
    setBusy(true);
    await supabase.storage.from("kyc-docs").remove([doc.file_path]);
    await supabase.from("kyc_documents").delete().eq("id", doc.id);
    setBusy(false);
    onChange(null);
  }

  return (
    <div className="rounded-2xl bg-background p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{def.label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{def.hint}</p>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={def.accept}
          capture={def.key === "selfie" ? "user" : undefined}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void upload(f);
          }}
        />
        {status !== "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3" />}
            {busy ? "Uploading…" : doc ? "Replace" : "Upload"}
          </button>
        )}
        {doc && (
          <button
            type="button"
            onClick={() => void view()}
            className="rounded-full border border-border px-3.5 py-1.5 text-[11px] font-semibold"
          >
            View file
          </button>
        )}
        {doc && status !== "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground disabled:opacity-60"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      {status === "rejected" && doc?.rejection_reason && (
        <p className="mt-2 text-[11px] text-destructive">Rejected: {doc.rejection_reason}</p>
      )}
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
        <CheckCircle2 className="h-3 w-3" /> Verified
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        <Clock className="h-3 w-3" /> In review
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
  return <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Not uploaded</span>;
}
