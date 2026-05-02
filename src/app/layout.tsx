import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppShell } from "@/components/AppShell";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://claim-your-map-main.vercel.app"),
  title: "OwnMap",
  description: "Escolha um territorio, suba no ranking e deixe sua marca no mapa.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/ownmap-logo.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/ownmap-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/ownmap-logo.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "OwnMap",
    description: "Explore territorios, veja donos locais e dispute sua cidade no mapa.",
    siteName: "OwnMap",
    images: [{ url: "/ownmap-logo.svg", alt: "OwnMap" }],
  },
  twitter: {
    card: "summary",
    title: "OwnMap",
    description: "Explore territorios, veja donos locais e dispute sua cidade no mapa.",
    images: ["/ownmap-logo.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
