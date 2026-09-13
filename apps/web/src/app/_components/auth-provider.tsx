"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, type ReactNode } from "react";

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  authenticated: boolean;
  identity?: string;
  login(): void;
  logout(): Promise<void>;
  getAccessToken(): Promise<string | null>;
};

const fallback: AuthContextValue = {
  configured: false,
  ready: true,
  authenticated: false,
  login() {},
  async logout() {},
  async getAccessToken() {
    return null;
  },
};

const AuthContext = createContext<AuthContextValue>(fallback);

function PrivyBridge({ children }: { children: ReactNode }) {
  const { authenticated, getAccessToken, login, logout, ready, user } =
    usePrivy();
  const identity = user?.email?.address ?? user?.wallet?.address;

  return (
    <AuthContext.Provider
      value={{
        configured: true,
        ready,
        authenticated,
        identity,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAgentDockAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId)
    return (
      <AuthContext.Provider value={fallback}>{children}</AuthContext.Provider>
    );

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#b9ff61",
        },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}
