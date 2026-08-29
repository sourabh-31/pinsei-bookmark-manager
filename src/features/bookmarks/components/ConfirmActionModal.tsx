import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { closeModal } from "@/lib/modalEvent";

export interface ConfirmActionPayload {
  title: string;
  body?: string;
  label: string;
  /** Shown on the confirm button while `run`'s promise is pending. */
  pendingLabel?: string;
  /** Resolve to close the modal (typically after toasting); reject to leave it open with the button re-enabled. */
  run: () => Promise<void>;
}

interface ConfirmActionModalProps {
  payload?: unknown;
}

export function ConfirmActionModal({ payload }: ConfirmActionModalProps) {
  const data = payload as ConfirmActionPayload | undefined;
  const [pending, setPending] = useState(false);

  if (!data) return null;

  const { title, body, label, pendingLabel, run } = data;

  const confirm = () => {
    setPending(true);
    run().catch(() => setPending(false));
  };

  return (
    <ModalShell className="max-w-[min(400px,calc(100vw-20px))] p-6 flex flex-col gap-3.5">
      <span className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <AlertTriangle size={18} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
          {title}
        </h2>
        {body && (
          <p className=" text-pretty text-[13px] font-medium leading-[1.6] text-muted-foreground">
            {body}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => closeModal()}
          disabled={pending}
          size="lg"
        >
          Cancel
        </Button>
        <Button onClick={confirm} disabled={pending} size="lg">
          {pending ? (pendingLabel ?? label) : label}
        </Button>
      </div>
    </ModalShell>
  );
}
