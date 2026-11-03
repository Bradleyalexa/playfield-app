import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Kiosk Display",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
