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
  metadataBase: new URL("https://www.playfield.fit"),
  title: {
    default: "Playfield — Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
    template: "%s | Playfield",
  },
  description:
    "Aplikasi web pengatur game untuk host mabar olahraga (Badminton, Tennis, Padel, Tenis Meja, Pickleball, Squash) di Indonesia. Smart WhatsApp list parser, rotasi ganda seimbang, tracker shuttlecock & bola, dan mode TV GOR display.",
  applicationName: "Playfield",
  authors: [{ name: "Playfield", url: "https://www.playfield.fit" }],
  creator: "Playfield",
  publisher: "Playfield",
  keywords: [
    "Playfield",
    "aplikasi mabar olahraga",
    "pocket assistant host mabar",
    "pengatur jadwal pertandingan komunitas",
    "split bill lapangan mabar",
    "whatsapp list parser mabar",
    "kiosk score display TV GOR",

    // Badminton
    "aplikasi mabar badminton",
    "rotasi lapangan badminton otomatis",
    "badminton queue rotation app",
    "jadwal giliran main bulutangkis",
    "scoring board badminton online",

    // Tennis
    "aplikasi mabar tennis",
    "rotasi ganda tenis lapangan",
    "tennis queue matchmaking",
    "atur jadwal main tennis",

    // Padel
    "aplikasi mabar padel",
    "padel queue rotation indonesia",
    "rotasi turnamen padel ganda",
    "padel matchmaking app",

    // Pickleball
    "aplikasi mabar pickleball",
    "pickleball rotation system",
    "rotasi lapangan pickleball indonesia",

    // Tenis Meja / Pingpong
    "aplikasi mabar tenis meja",
    "pengatur giliran pingpong",
    "turnamen tenis meja komunitas",

    // Squash
    "aplikasi mabar squash",
    "rotasi lapangan squash",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Playfield — Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
    description:
      "Aplikasi web pengatur game untuk host mabar olahraga (Badminton, Tennis, Padel, Tenis Meja, Pickleball, Squash) di Indonesia. Smart WhatsApp list parser, rotasi ganda seimbang, tracker shuttlecock & bola, dan mode TV GOR display.",
    url: "https://www.playfield.fit",
    siteName: "Playfield",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/playfield_banner.png",
        width: 920,
        height: 320,
        alt: "Playfield — Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playfield — Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
    description:
      "Aplikasi web pengatur game untuk host mabar olahraga di Indonesia. Smart WhatsApp list parser, rotasi seimbang, dan mode TV GOR display.",
    images: ["/playfield_banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/Playfield_icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
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
