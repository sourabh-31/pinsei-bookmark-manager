import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useAnonymousSignIn,
  useGoogleSignIn,
  useSession,
  useSignIn,
  useSignUp,
} from "@/features/auth/hooks/useAuth";
import { toast } from "@/lib/toastEvent";

type Mode = "signin" | "signup";

const fieldInput =
  "h-11 w-full box-border rounded-[10px] border border-transparent bg-muted pl-9 pr-3.5 font-sans text-[13.5px] font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/15";

const tabButton =
  "flex-1 cursor-pointer rounded-[10px] border-0 py-2.25 font-sans text-[12.5px] font-semibold";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [reveal, setReveal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = useSignUp();
  const signIn = useSignIn();
  const anonymousSignIn = useAnonymousSignIn();
  const googleSignIn = useGoogleSignIn();
  const { session, isLoading } = useSession();

  const isSignUp = mode === "signup";
  const pending = isSignUp ? signUp.isPending : signIn.isPending;

  if (isLoading) return null;

  if (session) {
    return <Navigate to="/home" replace />;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const onError = (error: Error) => {
      toast({
        icon: "alert-circle",
        title: isSignUp ? "Couldn't create account" : "Couldn't sign in",
        sub: error.message,
      });
    };
    const onSuccess = () => navigate("/home");

    if (isSignUp) {
      signUp.mutate({ fullName, email, password }, { onSuccess, onError });
    } else {
      signIn.mutate({ email, password }, { onSuccess, onError });
    }
  }

  function handleGoogleSignIn() {
    googleSignIn.mutate(undefined, {
      onError: (error) =>
        toast({
          icon: "alert-circle",
          title: "Couldn't sign in with Google",
          sub: error.message,
        }),
    });
  }

  function handleAnonymousSignIn() {
    anonymousSignIn.mutate(undefined, {
      onSuccess: () => navigate("/home"),
      onError: (error) =>
        toast({
          icon: "alert-circle",
          title: "Couldn't start a session",
          sub: error.message,
        }),
    });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-app-shell px-4.5 py-8 md:px-7.5">
      <div className="flex w-full max-w-100 flex-col items-stretch">
        <div className="mb-6.5 flex flex-col items-center gap-4.5">
          <span className="grid size-13 place-items-center rounded-2xl bg-card shadow-card">
            <svg
              width="20"
              height="24"
              viewBox="1 1 17 20.5"
              fill="none"
              aria-label="Pinsei"
              className="block"
            >
              <defs>
                <linearGradient id="auth-logo" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="oklch(0.72 0.19 22)" />
                  <stop offset="1" stopColor="oklch(0.55 0.216 4)" />
                </linearGradient>
              </defs>
              <path
                d="M13.4 1.5H18v17.2l-4.6-3.4V1.5Z"
                fill="oklch(0.55 0.216 4)"
                opacity="0.28"
              />
              <path
                d="M1 2.4A1.4 1.4 0 0 1 2.4 1h8.9a1.4 1.4 0 0 1 1.4 1.4v19.1l-5.85-4.3L1 21.5V2.4Z"
                fill="url(#auth-logo)"
              />
            </svg>
          </span>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="m-0 text-[26px] leading-[1.15] font-bold text-foreground">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="m-0 max-w-[29em] text-[13.5px] leading-[1.55] text-muted-foreground font-medium">
              {isSignUp
                ? "Two details and your first folder is ready."
                : "Your folders are exactly where you left them."}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-card/55 p-2 shadow-modal-lg ring-1 ring-border/90">
          <div className="rounded-[17px] border border-border-subtle bg-card p-4.5 shadow-[0_1px_2px_oklch(0_0_0/0.03)] sm:p-6">
            <div className="mb-4.5 flex gap-0.75 rounded-[13px] bg-muted p-0.75">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={cn(
                  tabButton,
                  !isSignUp
                    ? "bg-card text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.07)] ring-1 ring-border"
                    : "bg-transparent text-muted-foreground",
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  tabButton,
                  isSignUp
                    ? "bg-card text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.07)] ring-1 ring-border"
                    : "bg-transparent text-muted-foreground",
                )}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {isSignUp && (
                <label className="flex flex-col gap-1.75">
                  <span className="text-[12px] font-semibold text-foreground-secondary">
                    Full name
                  </span>
                  <span className="relative flex items-center">
                    <User
                      size={15}
                      className="pointer-events-none absolute left-3.5 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Ada Lovelace"
                      className={fieldInput}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </span>
                </label>
              )}

              <label className="flex flex-col gap-1.75">
                <span className="text-[12px] font-semibold text-foreground-secondary">
                  Email
                </span>
                <span className="relative flex items-center">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 text-muted-foreground"
                  />
                  <input
                    type="email"
                    placeholder="You@studio.com"
                    className={fieldInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="flex flex-col gap-1.75">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-semibold text-foreground-secondary">
                    Password
                  </span>
                </span>
                <span className="relative flex items-center">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 text-muted-foreground"
                  />
                  <input
                    type={reveal ? "text" : "password"}
                    placeholder={
                      isSignUp ? "At least 8 characters" : "Your password"
                    }
                    className={cn(fieldInput, "pr-10")}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((r) => !r)}
                    aria-label="Toggle password visibility"
                    className="absolute right-1 grid size-8 cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent text-muted-foreground"
                  >
                    {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="mt-1 w-full"
                disabled={pending}
              >
                {pending
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>

            <div className="my-4.25 flex items-center gap-2.75">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={googleSignIn.isPending}
              onClick={handleGoogleSignIn}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 48 48"
                className="block shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="mt-2.5 w-full"
              disabled={anonymousSignIn.isPending}
              onClick={handleAnonymousSignIn}
            >
              <Zap size={15} />
              {anonymousSignIn.isPending
                ? "Starting..."
                : "Continue as guest user"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
