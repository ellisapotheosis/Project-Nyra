"use client";

import * as React from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

type AuthContextValue = {
  configured: boolean;
  signOut: () => Promise<void>;
  user: User | null;
  loading: boolean;
};

const AuthContext = React.createContext<AuthContextValue>({
  configured: false,
  signOut: async () => {},
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = Boolean(getSupabasePublicConfig());
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(configured);

  React.useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!cancelled) {
        setUser(result.data.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signOut = React.useCallback(async () => {
    if (!configured) {
      return;
    }

    await createSupabaseBrowserClient().auth.signOut();
    setUser(null);
  }, [configured]);

  return (
    <AuthContext.Provider value={{ configured, loading, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
