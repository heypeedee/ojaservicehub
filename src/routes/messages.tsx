import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  ImagePlus,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Play,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Square,
  Video as VideoIcon,
  X,
} from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages · ServiceHub" },
      {
        name: "description",
        content:
          "Chat live with pros and customers. Read receipts, typing indicators, image sharing, voice notes, and booking updates in one thread.",
      },
      { property: "og:title", content: "Messages · ServiceHub" },
      { property: "og:description", content: "Real-time chat between customers and providers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

type Thread = {
  id: string;
  name: string;
  initials: string;
  role: "Pro" | "Customer";
  online: boolean;
  service: string;
  unread: number;
  lastPreview: string;
  lastAt: string;
};

type MsgType = "text" | "image" | "voice" | "system";
type Msg = {
  id: string;
  from: "me" | "them";
  type: MsgType;
  text?: string;
  imageUrl?: string;
  voiceSec?: number;
  at: string;
  status?: "sent" | "delivered" | "read";
};

const threads: Thread[] = [
  {
    id: "t_ada",
    name: "Adaeze Okoye",
    initials: "AO",
    role: "Pro",
    online: true,
    service: "Bridal glam · Sat 10:00 AM",
    unread: 2,
    lastPreview: "I'll bring the airbrush kit — see you Saturday!",
    lastAt: "2m",
  },
  {
    id: "t_chef",
    name: "Chef Ifeanyi",
    initials: "CI",
    role: "Pro",
    online: false,
    service: "Private dinner · Fri 7:00 PM",
    unread: 0,
    lastPreview: "Voice message",
    lastAt: "1h",
  },
  {
    id: "t_grace",
    name: "Grace N.",
    initials: "GN",
    role: "Customer",
    online: true,
    service: "Hair styling · Today 4:00 PM",
    unread: 0,
    lastPreview: "Photo",
    lastAt: "3h",
  },
  {
    id: "t_kunle",
    name: "Kunle B.",
    initials: "KB",
    role: "Customer",
    online: false,
    service: "AC repair · Mon 11:00 AM",
    unread: 4,
    lastPreview: "How much for a full service?",
    lastAt: "Yest.",
  },
];

const seedByThread: Record<string, Msg[]> = {
  t_ada: [
    {
      id: "m1",
      from: "them",
      type: "system",
      text: "Booking confirmed · Bridal glam · Sat, Nov 23 · 10:00 AM",
      at: "Mon 09:00",
    },
    {
      id: "m2",
      from: "them",
      type: "text",
      text: "Hi love! Congrats on the wedding 🎉 sending over the mood board.",
      at: "Mon 09:12",
    },
    {
      id: "m3",
      from: "them",
      type: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format",
      at: "Mon 09:12",
    },
    {
      id: "m4",
      from: "me",
      type: "text",
      text: "Love it! Can we lean a bit more soft-glam than dewy?",
      at: "Mon 09:20",
      status: "read",
    },
    {
      id: "m5",
      from: "them",
      type: "voice",
      voiceSec: 24,
      at: "Mon 09:31",
    },
    {
      id: "m6",
      from: "me",
      type: "text",
      text: "Perfect — see you Saturday 🙌",
      at: "Just now",
      status: "delivered",
    },
    {
      id: "m7",
      from: "them",
      type: "text",
      text: "I'll bring the airbrush kit — see you Saturday!",
      at: "Just now",
    },
  ],
  t_chef: [
    { id: "c1", from: "them", type: "voice", voiceSec: 41, at: "1h" },
    { id: "c2", from: "me", type: "text", text: "Sounds great, chef.", at: "1h", status: "read" },
  ],
  t_grace: [
    {
      id: "g1",
      from: "them",
      type: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format",
      at: "3h",
    },
  ],
  t_kunle: [
    { id: "k1", from: "them", type: "text", text: "How much for a full service?", at: "Yest." },
  ],
};

function MessagesPage() {
  const [activeId, setActiveId] = useState(threads[0].id);
  const [store, setStore] = useState(seedByThread);
  const [q, setQ] = useState("");
  const [openThreadMobile, setOpenThreadMobile] = useState(false);

  const active = threads.find((t) => t.id === activeId)!;
  const msgs = store[activeId] ?? [];

  function send(next: Msg) {
    setStore((s) => ({ ...s, [activeId]: [...(s[activeId] ?? []), next] }));
    // simulate delivery -> read + typing reply
    setTimeout(() => {
      setStore((s) => ({
        ...s,
        [activeId]: (s[activeId] ?? []).map((m) =>
          m.id === next.id ? { ...m, status: "read" } : m,
        ),
      }));
    }, 900);
  }

  const filtered = threads.filter((t) =>
    (t.name + t.service).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <TopBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-2 py-4 sm:px-4 lg:px-8">
        <aside
          className={`w-full max-w-sm shrink-0 rounded-2xl border border-border bg-card shadow-sm md:block ${
            openThreadMobile ? "hidden" : "block"
          } md:!block`}
        >
          <div className="border-b border-border p-4">
            <h1 className="text-lg font-semibold">Messages</h1>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search chats"
                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto">
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => {
                    setActiveId(t.id);
                    setOpenThreadMobile(true);
                  }}
                  className={`flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors ${
                    t.id === activeId ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.initials}
                    </div>
                    {t.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{t.name}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{t.lastAt}</span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{t.service}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.lastPreview}</p>
                  </div>
                  {t.unread > 0 && (
                    <span className="mt-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {t.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section
          className={`flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
            openThreadMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <ThreadHeader thread={active} onBack={() => setOpenThreadMobile(false)} />
          <MessageList messages={msgs} />
          <Composer onSend={send} />
        </section>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to ServiceHub
        </Link>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> End-to-end encrypted
        </span>
      </div>
    </div>
  );
}

function ThreadHeader({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
      <button
        onClick={onBack}
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="relative">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {thread.initials}
        </div>
        {thread.online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{thread.name}</p>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {thread.role}
          </span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {thread.online ? "Active now" : "Last seen recently"} · {thread.service}
        </p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <IconBtn label="Voice call"><Phone className="h-4 w-4" /></IconBtn>
        <IconBtn label="Video"><VideoIcon className="h-4 w-4" /></IconBtn>
        <IconBtn label="More"><MoreHorizontal className="h-4 w-4" /></IconBtn>
      </div>
    </header>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
    >
      {children}
    </button>
  );
}

function MessageList({ messages }: { messages: Msg[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-6">
      {messages.map((m) =>
        m.type === "system" ? (
          <SystemBanner key={m.id} msg={m} />
        ) : (
          <Bubble key={m.id} msg={m} />
        ),
      )}
      <TypingIndicator />
      <div ref={endRef} />
    </div>
  );
}

function SystemBanner({ msg }: { msg: Msg }) {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-medium text-primary">
      <Calendar className="h-3.5 w-3.5" />
      {msg.text}
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.from === "me";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`overflow-hidden rounded-2xl px-3 py-2 text-sm shadow-sm ${
            mine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card text-foreground"
          }`}
        >
          {msg.type === "text" && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
          {msg.type === "image" && msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="Shared attachment"
              className="-mx-3 -my-2 max-h-72 w-[280px] object-cover"
            />
          )}
          {msg.type === "voice" && <VoiceNote seconds={msg.voiceSec ?? 0} mine={mine} />}
        </div>
        <div
          className={`flex items-center gap-1 px-1 text-[10px] text-muted-foreground ${
            mine ? "justify-end" : "justify-start"
          }`}
        >
          <span>{msg.at}</span>
          {mine && msg.status && (
            <span
              className={
                msg.status === "read"
                  ? "text-primary"
                  : msg.status === "delivered"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
              }
              aria-label={`Message ${msg.status}`}
            >
              {msg.status === "sent" && <Check className="h-3 w-3" />}
              {msg.status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {msg.status === "read" && <CheckCheck className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceNote({ seconds, mine }: { seconds: number; mine: boolean }) {
  const bars = Array.from({ length: 22 }, (_, i) => 6 + ((i * 37) % 18));
  return (
    <div className="flex min-w-[220px] items-center gap-3 py-1">
      <button
        className={`grid h-8 w-8 place-items-center rounded-full ${
          mine ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
        }`}
        aria-label="Play voice note"
      >
        <Play className="h-3.5 w-3.5" />
      </button>
      <div className="flex flex-1 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`rounded-full ${mine ? "bg-primary-foreground/60" : "bg-primary/60"}`}
            style={{ width: 2, height: h }}
          />
        ))}
      </div>
      <span className={`text-[10px] tabular-nums ${mine ? "opacity-80" : "text-muted-foreground"}`}>
        0:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1.5 shadow-sm">
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </div>
      <span>Adaeze is typing…</span>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
      style={{ animationDelay: `${delay}s`, animationDuration: "1s" }}
    />
  );
}

function Composer({ onSend }: { onSend: (m: Msg) => void }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  useEffect(() => {
    if (!recording) return;
    setRecSec(0);
    const id = setInterval(() => setRecSec((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  function sendText() {
    if (!text.trim() && !pendingImage) return;
    if (pendingImage) {
      onSend({
        id: `m_${Date.now()}`,
        from: "me",
        type: "image",
        imageUrl: pendingImage,
        at: "Just now",
        status: "sent",
      });
      setPendingImage(null);
    }
    if (text.trim()) {
      onSend({
        id: `m_${Date.now() + 1}`,
        from: "me",
        type: "text",
        text: text.trim(),
        at: "Just now",
        status: "sent",
      });
      setText("");
    }
  }

  function handleFile(f: File | undefined) {
    if (!f) return;
    setPendingImage(URL.createObjectURL(f));
  }

  function stopAndSendVoice() {
    onSend({
      id: `m_${Date.now()}`,
      from: "me",
      type: "voice",
      voiceSec: recSec || 1,
      at: "Just now",
      status: "sent",
    });
    setRecording(false);
  }

  return (
    <div className="border-t border-border bg-card px-3 pb-3 pt-2">
      {pendingImage && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2">
          <img src={pendingImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
          <p className="flex-1 text-xs text-muted-foreground">Photo ready to send</p>
          <button
            onClick={() => setPendingImage(null)}
            aria-label="Remove"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-3 rounded-full bg-primary/5 px-3 py-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          <p className="flex-1 text-xs font-medium text-foreground">
            Recording · 0:{String(recSec).padStart(2, "0")}
          </p>
          <button
            onClick={() => setRecording(false)}
            className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={stopAndSendVoice}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Square className="h-3 w-3" /> Send
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Attach photo">
            <ImagePlus className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          <button
            aria-label="Attach file"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-end gap-1 rounded-2xl border border-border bg-background px-3 py-1.5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              rows={1}
              placeholder="Message"
              className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none"
            />
            <button
              aria-label="Emoji"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>
          {text.trim() || pendingImage ? (
            <button
              onClick={sendText}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setRecording(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
              aria-label="Record voice note"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
