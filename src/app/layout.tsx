import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "UpaHealth — AI Procurement Intelligence Platform",
    template: "%s · UpaHealth",
  },
  description:
    "India's first AI-enabled healthcare sourcing, quotation, procurement, and export intelligence platform.",
  keywords: [
    "healthcare",
    "procurement",
    "AI",
    "medical supplies",
    "surgical consumables",
    "export",
  ],
  metadataBase: new URL("http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased bg-slate-950 text-white font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
