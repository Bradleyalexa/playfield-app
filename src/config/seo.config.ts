const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.playfield.fit").replace(/\/+$/, "");

export const seoConfig = {
  siteName: "Playfield",
  siteUrl,
  tagline: "Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan",
  description:
    "Aplikasi web pengatur game untuk host mabar olahraga (Badminton, Tennis, Padel, Tenis Meja, Pickleball, Squash) di Indonesia. Smart WhatsApp list parser, rotasi ganda seimbang, tracker shuttlecock & bola, dan mode TV GOR display.",

  author: {
    name: "Playfield",
    url: siteUrl,
  },

  social: {
    github: "https://github.com/Bradleyalexa/playfield-app",
  },

  primaryKeywords: [
    "Playfield",
    "aplikasi mabar olahraga",
    "pocket assistant host mabar",
    "pengatur jadwal pertandingan komunitas",
    "split bill lapangan mabar",
    "whatsapp list parser mabar",
    "kiosk score display TV GOR",

    // Badminton / Bulutangkis
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
  ] as const,

  supportedSports: [
    "Badminton",
    "Tennis",
    "Padel",
    "Table Tennis (Pingpong)",
    "Pickleball",
    "Squash",
  ] as const,
} as const;

export function generateOGMetadata(
  title: string,
  description: string,
  image?: string,
  url?: string
) {
  return {
    title,
    description,
    url: url || seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    locale: "id_ID",
    type: "website" as const,
    images: [
      {
        url: image || `${seoConfig.siteUrl}/playfield_banner.png`,
        width: 920,
        height: 320,
        alt: title,
      },
    ],
  };
}

export function generateTwitterMetadata(title: string, description: string, image?: string) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [image || `${seoConfig.siteUrl}/playfield_banner.png`],
  };
}
