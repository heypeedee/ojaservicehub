import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { OjaLogo } from "@/components/OjaLogo";

/** Tap the logo 3 times quickly to open the admin console; a single tap goes home. */
export function AdminTapLogo({ size = 34 }: { size?: number }) {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1200), now];
    if (timer.current) clearTimeout(timer.current);
    if (taps.current.length >= 3) {
      taps.current = [];
      void navigate({ to: "/admin" });
      return;
    }
    timer.current = setTimeout(() => {
      taps.current = [];
      void navigate({ to: "/" });
    }, 450);
  }

  return (
    <button type="button" onClick={onTap} aria-label="Ọjà home" className="flex items-center gap-2 select-none">
      <OjaLogo size={size} />
    </button>
  );
}
