import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Session Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HostSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
