"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!appId) return <>{children}</>;

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
      {children}
    </PrivyProvider>
  );
}
