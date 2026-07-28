import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { OjaLogo } from "@/components/OjaLogo";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages · Ọjà" },
      {
        name: "description",
        content:
          "Real-time chat between customers and providers on Ọjà — live typing, image sharing, read receipts.",
      },
      { property: "og:title", content: "Messages · Ọjà" },
      { property: "og:description", content: "Real-time chat on Ọjà." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username?: string | null;
  full_name?: string | null;
  shop_name?: string | null;
};
type Conversation = { id: string; title: string | null; updated_at: string; created_by: string | null };
type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

function nameFor(p: Profile | null | undefined): string {
  if (!p) return "Someone";
  return p.username ? `@${p.username}` : p.display_name ?? "Ọjà member";
}

function nameWithShop(p: Profile | null | undefined): string {
  if (!p) return "Someone";
  const primary = nameFor(p);
  return p.shop_name ? `${primary} · ${p.shop_name}` : primary;
}

function MessagesPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <AuthGate />;
  return <ChatShell userId={session.user.id} email={session.user.email ?? ""} />;
}

function AuthGate() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const usernameOk = /^[a-zA-Z][a-zA-Z0-9_]{2,23}$/.test(username);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        if (!usernameOk) throw new Error("Username must be 3–24 chars, letters/numbers/underscore, start with a letter.");
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        // Pre-check uniqueness (case-insensitive)
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", username)
          .limit(1);
        if (taken && taken.length) throw new Error("That username is taken. Try another.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: fullName.trim(),
              full_name: fullName.trim(),
              shop_name: isOwner && shopName.trim() ? shopName.trim() : null,
            },
            emailRedirectTo: `${window.location.origin}/messages`,
          },
        });
        if (error) throw error;
        setNotice("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <OjaLogo size={36} />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to Ọjà" : "Claim your Ọjà @username"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to chat, bargain and manage your bookings."
            : "Your @username is your public identity across reviews, chats, bookings and offers."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <div>
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-background focus-within:border-primary">
                  <span className="grid place-items-center border-r border-border bg-muted/60 px-3 text-sm font-semibold text-muted-foreground">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                    placeholder="yourname"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>
                <p className={`mt-1 text-[11px] ${username && !usernameOk ? "text-destructive" : "text-muted-foreground"}`}>
                  3–24 chars, letters/numbers/underscore, must start with a letter.
                </p>
              </div>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name (kept private on your profile)"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <label className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs">
                <input
                  type="checkbox"
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="h-4 w-4 accent-[oklch(var(--primary))]"
                />
                <span>I'm a market owner / service provider — add a shop name</span>
              </label>
              {isOwner && (
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Shop name (shown next to @username)"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              )}
            </>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
          {notice && <p className="rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand">{notice}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
            setNotice(null);
          }}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "New to Ọjà? Create an account →"
            : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}

function ChatShell({ userId, email }: { userId: string; email: string }) {
  const [me, setMe] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [participantsByConvo, setParticipantsByConvo] = useState<Record<string, Profile[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  // Load profile + conversations + participant profiles
  async function refresh() {
    setLoading(true);
    const [{ data: profile }, { data: convos }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("conversations")
        .select("id, title, updated_at, created_by")
        .order("updated_at", { ascending: false }),
    ]);
    if (profile) setMe(profile as Profile);
    const convoList = (convos as Conversation[] | null) ?? [];
    setConversations(convoList);

    if (convoList.length) {
      const ids = convoList.map((c) => c.id);
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", ids);
      const userIds = Array.from(new Set((parts ?? []).map((p: any) => p.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, username, full_name, shop_name")
        .in("id", userIds);
      const profileMap = new Map<string, Profile>((profs ?? []).map((p: any) => [p.id, p]));
      const grouped: Record<string, Profile[]> = {};
      (parts ?? []).forEach((p: any) => {
        (grouped[p.conversation_id] ??= []).push(
          profileMap.get(p.user_id) ?? { id: p.user_id, display_name: null, avatar_url: null },
        );
      });
      setParticipantsByConvo(grouped);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // Realtime: bump when conversations change (new messages/updates)
    const channel = supabase
      .channel("convo-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;
  const activeOthers = activeConvo
    ? (participantsByConvo[activeConvo.id] ?? []).filter((p) => p.id !== userId)
    : [];

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={32} />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link to="/messages" className="text-foreground">Messages</Link>
            <Link to="/notifications" className="hover:text-foreground">Notifications</Link>
          </nav>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden text-muted-foreground sm:inline">{email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 font-semibold hover:border-primary/40"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <ConvoList
          me={me}
          conversations={conversations}
          participantsByConvo={participantsByConvo}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={() => setShowNewChat(true)}
          loading={loading}
          userId={userId}
        />

        <ChatPane
          userId={userId}
          conversation={activeConvo}
          others={activeOthers}
          participantsByConvo={participantsByConvo}
        />
      </div>

      {showNewChat && (
        <NewChatDialog
          userId={userId}
          onClose={() => setShowNewChat(false)}
          onCreated={(id) => {
            setShowNewChat(false);
            refresh().then(() => setActiveId(id));
          }}
        />
      )}
    </div>
  );
}

function ConvoList({
  me,
  conversations,
  participantsByConvo,
  activeId,
  onSelect,
  onNewChat,
  loading,
  userId,
}: {
  me: Profile | null;
  conversations: Conversation[];
  participantsByConvo: Record<string, Profile[]>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  loading: boolean;
  userId: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return conversations;
    const needle = q.toLowerCase();
    return conversations.filter((c) => {
      const others = (participantsByConvo[c.id] ?? []).filter((p) => p.id !== userId);
      const names = others.map((o) => `${o.display_name ?? ""} ${o.username ?? ""} ${o.shop_name ?? ""}`).join(" ").toLowerCase();
      return (c.title ?? "").toLowerCase().includes(needle) || names.includes(needle);
    });
  }, [q, conversations, participantsByConvo, userId]);

  return (
    <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{nameFor(me)}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {me?.shop_name ? me.shop_name : me?.full_name ?? "Complete your profile below"}
          </p>
        </div>
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" /> New
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search chats"
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
      </div>
      <ul className="mt-4 max-h-[70vh] space-y-1 overflow-auto pr-1">
        {loading && (
          <li className="grid place-items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </li>
        )}
        {!loading && filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No chats yet. Tap <b>New</b> to start a conversation.
          </li>
        )}
        {filtered.map((c) => {
          const others = (participantsByConvo[c.id] ?? []).filter((p) => p.id !== userId);
          const title = c.title || others.map((o) => o.display_name ?? "Someone").join(", ") || "New chat";
          const initials = (title || "?").slice(0, 1).toUpperCase();
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                  active
                    ? "border-primary bg-brand-soft"
                    : "border-transparent bg-background hover:border-border"
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {new Date(c.updated_at).toLocaleString()}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function ChatPane({
  userId,
  conversation,
  others,
  participantsByConvo,
}: {
  userId: string;
  conversation: Conversation | null;
  others: Profile[];
  participantsByConvo: Record<string, Profile[]>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const convoId = conversation?.id ?? null;

  useEffect(() => {
    if (!convoId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled) {
          setMessages((data as ChatMessage[] | null) ?? []);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`msg-${convoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convoId}` },
        (payload) => {
          setMessages((prev) => {
            const m = payload.new as ChatMessage;
            if (prev.some((p) => p.id === m.id)) return prev;
            return [...prev, m];
          });
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [convoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const profileMap = useMemo(() => {
    const m = new Map<string, Profile>();
    Object.values(participantsByConvo).forEach((list) => list.forEach((p) => m.set(p.id, p)));
    return m;
  }, [participantsByConvo]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!convoId) return;
    const body = input.trim();
    if (!body && !imageUrl.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: convoId,
      sender_id: userId,
      body: body || null,
      image_url: imageUrl.trim() || null,
    });
    setSending(false);
    if (!error) {
      setInput("");
      setImageUrl("");
    } else {
      alert(error.message);
    }
  }

  if (!conversation) {
    return (
      <section className="grid min-h-[60vh] place-items-center rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <div>
          <MessageSquarePlus className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-lg font-semibold">Start a real-time chat</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tap <b>New</b> to invite someone to a live conversation. Messages sync instantly across all their devices.
          </p>
        </div>
      </section>
    );
  }

  const title = conversation.title || others.map((o) => o.display_name ?? "Someone").join(", ") || "Chat";

  return (
    <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-background/60 px-5 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {(title || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="flex items-center gap-1 text-[11px] text-brand">
            <ShieldCheck className="h-3 w-3" /> Encrypted in transit · Live
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-6">
        {loading && (
          <div className="grid place-items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">Say hi — this is a brand-new chat.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const sender = profileMap.get(m.sender_id);
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-background text-foreground"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {sender?.display_name ?? "Someone"}
                  </p>
                )}
                {m.image_url && (
                  <img
                    src={m.image_url}
                    alt=""
                    className="mb-2 max-h-56 rounded-xl object-cover"
                  />
                )}
                {m.body && <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>}
                <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t border-border bg-background/60 px-4 py-3">
        {imageUrl && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs">
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">Image attached</span>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Paste an image URL");
              if (url) setImageUrl(url);
            }}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40"
            title="Attach image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && !imageUrl.trim())}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
      </form>
    </section>
  );
}

function NewChatDialog({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const h = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${q.trim()}%`)
        .neq("id", userId)
        .limit(10);
      setResults((data as Profile[] | null) ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(h);
  }, [q, userId]);

  async function startChat(other: Profile) {
    setErr(null);
    setCreating(true);
    try {
      const { data: convo, error: convoErr } = await supabase
        .from("conversations")
        .insert({ created_by: userId, title: null })
        .select()
        .single();
      if (convoErr || !convo) throw convoErr ?? new Error("Could not create conversation");
      const { error: pErr } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: convo.id, user_id: userId },
          { conversation_id: convo.id, user_id: other.id },
        ]);
      if (pErr) throw pErr;
      onCreated(convo.id);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to start chat");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold">Start a new chat</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Search for someone on Ọjà by their display name.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Adaeze"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <ul className="mt-4 max-h-64 space-y-1 overflow-auto pr-1">
          {loading && (
            <li className="grid place-items-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </li>
          )}
          {!loading && q.trim() && results.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              No one matches "{q}". Ask them to sign up on Ọjà first.
            </li>
          )}
          {results.map((p) => (
            <li key={p.id}>
              <button
                disabled={creating}
                onClick={() => startChat(p)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-2.5 text-left hover:border-primary/40 disabled:opacity-60"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {(p.display_name ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.display_name ?? "Ọjà member"}</p>
                </div>
                {creating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </button>
            </li>
          ))}
        </ul>
        {err && <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
      </div>
    </div>
  );
}
