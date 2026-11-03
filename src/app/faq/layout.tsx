import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Tanya Jawab Host Mabar",
  description:
    "Pertanyaan yang sering diajukan mengenai cara pakai Playfield, sistem matchmaking rotasi adil, fitur display TV GOR kiosk, dan pengelolaan iuran mabar.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ & Tanya Jawab Host Mabar | Playfield",
    description:
      "Pertanyaan yang sering diajukan mengenai cara pakai Playfield, sistem matchmaking rotasi adil, dan fitur display TV GOR kiosk.",
    url: "/faq",
    images: [
      {
        url: "/playfield_banner.png",
        width: 920,
        height: 320,
        alt: "FAQ Playfield",
      },
    ],
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
