import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SessionContext } from "./sessionContext";

const GET_SESSION_TIMEOUT_MS = 8000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // getSession() can hang indefinitely if Supabase accepts the connection
    // but never responds (a "half down" outage) — there's no timeout inside
    // the SDK's fetch call. Without this, isLoading would stay true forever
    // and every gated route would render a blank screen with no way out.
    const timeout = setTimeout(
      () => setIsLoading(false),
      GET_SESSION_TIMEOUT_MS,
    );

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timeout);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}
