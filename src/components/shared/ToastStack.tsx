import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { iconFor } from "@/lib/iconMap";
import { dismissToast } from "@/lib/toastEvent";
import type { Toast } from "@/types/common.type";

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const handleShow = (event: Event) => {
      const t = (event as CustomEvent<Toast>).detail;
      setToasts((s) => [...s, t]);
      timers.current[t.id] = setTimeout(() => dismissToast(t.id), 5000);
    };

    const handleDismiss = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (timers.current[id]) {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
      setToasts((s) => s.filter((t) => t.id !== id));
    };

    window.addEventListener("show-toast", handleShow);
    window.addEventListener("dismiss-toast", handleDismiss);

    return () => {
      window.removeEventListener("show-toast", handleShow);
      window.removeEventListener("dismiss-toast", handleDismiss);
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-80 flex flex-col gap-2.5">
      {toasts.map((t) => {
        const Icon = iconFor(t.icon);
        return (
          <div
            key={t.id}
            className=" pointer-events-auto flex min-w-75 max-w-[min(392px,calc(100vw-20px))] items-center gap-2.75 rounded-2xl border border-border bg-card px-3.25 py-2.75 shadow-toast"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-accent text-accent-foreground">
              <Icon size={15} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-foreground">
                {t.title}
              </span>
              {t.sub && (
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {t.sub}
                </span>
              )}
            </span>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.action?.();
                  dismissToast(t.id);
                }}
                className="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1.5 font-sans text-[11.5px] font-semibold text-accent-foreground cursor-pointer hover:border-[oklch(0.85_0.07_6)] hover:bg-[oklch(0.978_0.008_5)]"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
              className="flex shrink-0 rounded-md border-0 bg-transparent p-0.75 text-muted-foreground/70 cursor-pointer hover:text-foreground-secondary"
            >
              <X size={13} strokeWidth={2.4} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
