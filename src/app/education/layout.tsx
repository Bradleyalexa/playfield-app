import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panduan Aturan & Sistem Scoring Olahraga Raket",
  description:
    "Pelajari regulasi resmi, sistem perhitungan poin, format lapangan, dan etika bermain untuk Badminton, Tenis, Padel, Tenis Meja, Pickleball, dan Squash.",
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: "Panduan Aturan & Sistem Scoring Olahraga Raket | Playfield",
    description:
      "Pelajari regulasi resmi, sistem perhitungan poin, format lapangan, dan etika bermain untuk Badminton, Tenis, Padel, Tenis Meja, Pickleball, dan Squash.",
    url: "/education",
    images: [
      {
        url: "/playfield_banner.png",
        width: 920,
        height: 320,
        alt: "Panduan Olahraga Playfield",
      },
    ],
  },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
