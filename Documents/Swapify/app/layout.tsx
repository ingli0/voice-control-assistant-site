import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swapify — Discover Music, Swipe by Swipe",
  description:
    "Tinder-style music discovery powered by Spotify. Swipe right to save tracks you love.",
  keywords: ["music", "spotify", "discovery", "swipe", "playlist"],
  openGraph: {
    title: "Swapify",
    description: "Discover music through swipes",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
