import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { closeModal } from "@/lib/modalEvent";

interface ModalShellProps {
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  z?: 50 | 60;
  blur?: boolean;
  darkOverlay?: boolean;
}

export function ModalShell({
  children,
  className,
  z = 50,
  blur = true,
  darkOverlay = false,
}: ModalShellProps) {
  return (
    <div>
      <div
        onClick={() => closeModal()}
        className={cn(
          "fixed inset-0",
          z === 50 ? "z-50" : "z-60",
          darkOverlay ? "bg-black/80" : "bg-black/55",
          blur && "backdrop-blur-[2px]",
        )}
      />
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 box-border w-full overflow-y-auto rounded-2xl border border-border bg-card",
          z === 50 ? "z-50" : "z-60",
          "max-h-[calc(100vh-32px)]",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => closeModal()}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
