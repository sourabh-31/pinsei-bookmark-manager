import { Navigate } from "react-router";
import { KeyRound, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openModal } from "@/lib/modalEvent";
import { initials } from "@/lib/bookmarkUtils";
import { useSession } from "@/features/auth/hooks/useAuth";

export default function Account() {
  const { session, isLoading } = useSession();
  const user = session?.user;

  if (isLoading) return null;

  // Guests have no email/password identity to manage here.
  if (!user || user.is_anonymous) return <Navigate to="/home" replace />;

  const fullName = user.user_metadata?.full_name as string | undefined;
  const email = user.email;
  const isGoogle = user.app_metadata?.provider === "google";
  const avatarLabel = initials(fullName || email || "Account");

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-5 text-base font-semibold">Account</h1>

      <div className="mt-4 flex max-w-125 flex-col gap-3">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-3.5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground shadow-avatar-ring">
              {avatarLabel}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-foreground">
                {fullName || "Unnamed"}
              </p>
              <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                {isGoogle ? "Google account" : "Email & password"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
                <User size={15} />
              </span>
              <div className="flex min-w-0 flex-col">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </p>
                <p className="text-[13px] font-medium text-foreground-secondary">
                  {fullName || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
                <Mail size={15} />
              </span>
              <div className="flex min-w-0 flex-col">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-foreground-secondary">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
              <KeyRound size={15} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[13.5px] font-semibold text-foreground">
                Password
              </p>
              <p className="text-[11.5px] font-medium text-muted-foreground">
                Change your account password
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal("change-password-modal")}
            >
              Change password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
