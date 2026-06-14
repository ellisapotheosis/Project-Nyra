"use client";

import * as React from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { identifyMixpanelUser, resetMixpanel } from "@/lib/mixpanel";
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

  const syncMixpanelIdentity = React.useCallback((nextUser: User | null) => {
    if (nextUser) {
      identifyMixpanelUser(nextUser, {
        auth_provider: nextUser.app_metadata?.provider ?? "email",
      });
      return;
    }

    resetMixpanel();
  }, []);

  React.useEffect(() => {
    if (!configured) {
      setLoading(false);
      resetMixpanel();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!cancelled) {
        const nextUser = result.data.user ?? null;
        setUser(nextUser);
        syncMixpanelIdentity(nextUser);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        syncMixpanelIdentity(nextUser);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured, syncMixpanelIdentity]);

  const signOut = React.useCallback(async () => {
    if (!configured) {
      resetMixpanel();
      return;
    }

    await createSupabaseBrowserClient().auth.signOut();
    resetMixpanel();
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
