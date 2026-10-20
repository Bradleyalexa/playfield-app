"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Tv, Users, BookOpen, PlusCircle, Home } from "lucide-react";

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
      shortName: "Host",
      href: `/host/${currentSlug}`,
      icon: Trophy,
    },
    {
      name: "TV GOR Kiosk",
      shortName: "Kiosk",
      href: `/kiosk/${currentSlug}`,
      icon: Tv,
    },
    {
      name: "Papan Penonton",
      shortName: "Live",
      href: `/live/${currentSlug}`,
      icon: Users,
    },
    {
      name: "Pojok Edukasi",
      shortName: "Edukasi",
      href: "/education",
      icon: BookOpen,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-3 sm:border-b-4 border-black bg-white shadow-sm">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Brand Logo - Playfield Stamp */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#ccff00] border-2 sm:border-3 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] overflow-hidden group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_#000] transition-all">
              <Image
                src="/Playfield_icon.png"
                alt="Playfield Logo"
                width={40}
                height={40}
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black tracking-tight text-black text-lg sm:text-2xl font-heading uppercase">
                  PLAYFIELD
                </span>
                <span className="rounded bg-black px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black text-[#ccff00] uppercase tracking-wider">
                  MABAR APP
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 tracking-wide uppercase line-clamp-1">
                Pocket Assistant Host Mabar
              </span>
            </div>
          </Link>

          {/* Navigation Tabs - Desktop */}
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
              className="flex items-center gap-1.5 rounded-xl bg-[#ff5500] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-black text-white uppercase tracking-wider border-2 sm:border-3 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:bg-[#ff3b00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span className="font-mono">Sesi Baru</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly untuk Smartphone) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-black shadow-[0_-4px_12px_rgba(0,0,0,0.15)] px-2 py-1.5 pb-safe flex items-center justify-around"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
            pathname === "/"
              ? "bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
              : "text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Home className="h-4 w-4 mb-0.5 stroke-[2.5]" />
          <span>Home</span>
        </Link>

        {navLinks.map((link) => {
          const Icon = link.icon;
          const segment = link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : "/";
          const isActive = pathname.startsWith(segment);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                isActive
                  ? "bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                  : "text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5 stroke-[2.5]" />
              <span>{link.shortName}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
