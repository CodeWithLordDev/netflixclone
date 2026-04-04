"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "streamflix-auth-user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (typeof window === "undefined") return;

    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) {
      persistUser(null);
      return null;
    }

    const nextUser = await res.json();
    persistUser(nextUser);
    return nextUser;
  }, [persistUser]);

  const clearUser = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
          setUser(JSON.parse(cached));
      }
    } catch {}

    async function hydrateUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });

        if (!res.ok) {
          persistUser(null);
          return;
        }

        const nextUser = await res.json();
        persistUser(nextUser);
      } catch {
        // Keep cached state if network fails.
      } finally {
        setLoading(false);
      }
    }

    hydrateUser();
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser: persistUser,
      refreshUser,
      clearUser,
    }),
    [clearUser, loading, persistUser, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
