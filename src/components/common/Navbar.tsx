"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Tv, Users, BookOpen, PlusCircle } from "lucide-react";

interface NavbarProps {
  sessionId?: string;
  publicSlug?: string;
}

export function Navbar({ publicSlug }: NavbarProps) {
  const pathname = usePathname();
  const currentSlug = publicSlug || "demo";

  const navLinks = [
    {
      name: "Dashboard Host",
      href: `/host/${currentSlug}`,
      icon: Trophy,
    },
    {
      name: "TV GOR Kiosk",
      href: `/kiosk/${currentSlug}`,
      icon: Tv,
    },
    {
      name: "Papan Penonton",
      href: `/live/${currentSlug}`,
      icon: Users,
    },
    {
      name: "Pojok Edukasi",
      href: "/education",
      icon: BookOpen,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white shadow-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - Neo Brutalist Stamp */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ccff00] border-3 border-black shadow-[3px_3px_0px_#000] text-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_#000] transition-all">
            <Trophy className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-black text-xl font-heading">
                CLUBCOURT
              </span>
              <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-black text-[#ccff00] uppercase tracking-wider">
                RAW v2
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
              Pocket Assistant Host Mabar
            </span>
          </div>
        </Link>

        {/* Navigation Tabs - Bold Brutalist Tabs */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const segment = link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : "/";
            const isActive = pathname.startsWith(segment);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                  isActive
                    ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white text-black hover:bg-slate-100 hover:shadow-[2px_2px_0px_#000]"
                }`}
              >
                <Icon className="h-4 w-4 stroke-[2.5]" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button - High Energy Accent */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-[#ff5500] px-4 py-2 text-xs font-black text-white uppercase tracking-wider border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-[#ff3b00] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Sesi Baru</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
