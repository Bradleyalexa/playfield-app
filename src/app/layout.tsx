import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

export const metadata: Metadata = {
  title: "Playfield — Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
  description:
    "Aplikasi pengatur game untuk host mabar olahraga (Badminton, Tennis, Padel, Tenis Meja, Pickleball, Squash) di Indonesia. Smart WhatsApp list parser, rotasi ganda seimbang, tracker shuttlecock & bola, dan mode TV GOR display.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/Playfield_icon.png", type: "image/png" },
    ],
    apple: "/Playfield_icon.png",
    shortcut: "/Playfield_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8f2] text-[#0a0a0a] font-sans selection:bg-[#ccff00] selection:text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
