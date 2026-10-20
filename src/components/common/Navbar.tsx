"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Tv, Users, BookOpen, ShieldCheck, PlusCircle } from "lucide-react";

interface NavbarProps {
  sessionId?: string;
  publicSlug?: string;
}

export function Navbar({ publicSlug }: NavbarProps) {
  const pathname = usePathname();
  const currentSlug = publicSlug || "demo";

  const navLinks = [
    {
      name: "Host Dashboard",
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-lg">ClubCourt</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Pocket Assistant Host Mabar</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-inner"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Sesi Baru</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
