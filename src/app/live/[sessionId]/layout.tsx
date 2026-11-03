import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Match Spectator",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
