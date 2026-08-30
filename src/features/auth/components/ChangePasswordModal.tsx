import { useState } from "react";
import { KeyRound } from "lucide-react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useUpdatePassword } from "@/features/auth/hooks/useAuth";

export function ChangePasswordModal() {
  const updatePassword = useUpdatePassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSave =
    password.length >= 8 && password === confirm && !updatePassword.isPending;

  const commit = () => {
    if (!canSave) return;
    updatePassword.mutate(password, {
      onSuccess: () => {
        closeModal();
        toast({
          icon: "check",
          title: "Password updated",
          sub: "Use your new password next time you sign in",
        });
      },
      onError: (error) => {
        toast({
          icon: "alert-circle",
          title: "Couldn't update password",
          sub: error.message,
        });
      },
    });
  };

  return (
    <ModalShell
      blur={false}
      darkOverlay
      className="max-w-[min(400px,calc(100vw-20px))] p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2.75">
        <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <KeyRound size={16} />
        </span>
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
            Change password
          </h2>
          <p className=" text-[11.5px] font-medium text-muted-foreground">
            At least 8 characters
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>New password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
          autoFocus
          minLength={8}
          className="h-9 text-sm!"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Confirm password</Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") closeModal();
          }}
          aria-invalid={mismatch}
          minLength={8}
          className="h-9 text-sm!"
        />
        {mismatch && (
          <span className="text-[11px] font-medium text-destructive">
            Passwords don't match
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => closeModal()} size="lg">
          Cancel
        </Button>
        <Button onClick={commit} disabled={!canSave} size="lg">
          {updatePassword.isPending ? "Saving..." : "Update password"}
        </Button>
      </div>
    </ModalShell>
  );
}
