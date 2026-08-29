import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
}

export const SessionContext = createContext<SessionState | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx)
    throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
