import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./_components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentDock — Govern agent spend. Verify every delivery.",
  description:
    "Policy-controlled agent commerce on testnet. ENS-identified services, Hedera x402 payments, signed evidence, and Chainlink CRE policy evaluation.",
  openGraph: {
    title: "AgentDock — Govern agent spend. Verify every delivery.",
    description:
      "Policy-controlled agent commerce. Discover ENS-identified services, settle on Hedera, and receive signed auditable evidence.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
