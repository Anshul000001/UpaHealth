"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Auth session provider — optimized to:
 * - Disable refetch on window focus (default fires every focus → noisy)
 * - Disable interval polling (default polls every minute)
 * - Disable refetch when offline
 *
 * Server components always have fresh session via auth() so client polling
 * is unnecessary unless the user is on a long-lived page that depends on it.
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
