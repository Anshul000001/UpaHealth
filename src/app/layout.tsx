import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "UpaHealth — Your Path to Wellness",
    template: "%s · UpaHealth",
  },
  description:
    "UpaHealth — AI-enabled healthcare sourcing, quotation, procurement, and export intelligence platform. Your path to wellness.",
  keywords: [
    "healthcare",
    "procurement",
    "AI",
    "medical supplies",
    "surgical consumables",
    "export",
    "wellness",
  ],
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    apple: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
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
        <SpeedInsights />
      </body>
    </html>
  );
}
