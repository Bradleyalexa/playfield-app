import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/common/Navbar";
import {
  CARA_PAKAI_STEPS,
} from "../../data/app-guide-data";
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Play,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ClipboardCheck,
  Cpu,
  PlayCircle,
  Tv,
  Share2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cara Pakai Playfield • Panduan Lengkap Host Mabar Tanpa Ribet",
  description:
    "Pelajari cara mengoperasikan Playfield untuk mengatur rotasi lapangan mabar, copy-paste list WhatsApp, display TV GOR kiosk, live scoring, dan split bill otomatis.",
  keywords: [
    "cara pakai playfield",
    "panduan host mabar",
    "aplikasi mabar badminton",
    "rotasi lapangan badminton otomatis",
    "rekap mabar whatsapp",
    "matchmaking mabar",
  ],
};

const ICON_MAP: Record<string, React.ElementType> = {
  Sliders,
  ClipboardCheck,
  Cpu,
  PlayCircle,
  Tv,
  Share2,
};

export default function CaraPakaiPage() {
  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-3.5 sm:px-6 py-8 sm:py-12 pb-28 sm:pb-16 flex flex-col gap-8 sm:gap-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#ccff00] border-2 border-black px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            <BookOpen className="h-4 w-4 stroke-[2.5]" />
            <span>PANDUAN LENGKAP APLIKASI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-[1.1] uppercase">
            Cara Pakai Playfield:{" "}
            <span className="bg-[#ccff00] px-2.5 py-0.5 rounded border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] inline-block mt-1">
              Host Mabar Anti Ribet
            </span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-800 max-w-2xl leading-relaxed">
            Mulai dari copy-paste list WhatsApp, rotasi lapangan otomatis berimbang, display TV GOR, hingga rekap patungan transparan siap kirim ke grup.
          </p>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-5 py-3 text-xs sm:text-sm font-black text-black uppercase tracking-wider border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-black stroke-[2.5]" />
              <span>Mulai Buat Sesi Baru</span>
            </Link>

            <Link
              href="/faq"
              className="flex items-center gap-2 rounded-xl border-2 sm:border-3 border-black bg-white px-5 py-3 text-xs sm:text-sm font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Buka Halaman FAQ</span>
            </Link>
          </div>
        </div>

        {/* Highlight Banner Neo-Brutalist */}
        <div className="rounded-3xl border-3 sm:border-4 border-black bg-white p-5 sm:p-7 shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#00e5ff] text-black border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black shrink-0">
              <Sparkles className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-black">
                Kenapa Mabar Harus Pakai Playfield?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                100% Berbasis Web. Peserta tidak perlu bikin akun, tidak perlu download aplikasi, tinggal scan QR code.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-black text-[#ccff00] text-xs font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[2px_2px_0px_#000] shrink-0"
          >
            Coba Demo 1-Klik ↗
          </Link>
        </div>

        {/* 6 Steps Detailed Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
              6 Langkah Mengatur Mabar di Playfield
            </h2>
            <span className="text-xs font-mono font-black uppercase px-2.5 py-1 rounded bg-black text-[#ccff00]">
              Langkah 1 - 6
            </span>
          </div>

          <div className="space-y-6">
            {CARA_PAKAI_STEPS.map((step) => {
              const Icon = ICON_MAP[step.iconName] || BookOpen;
              return (
                <div
                  key={step.step}
                  id={`langkah-${step.step}`}
                  className="rounded-3xl border-3 sm:border-4 border-black bg-white p-5 sm:p-8 shadow-[6px_6px_0px_#000] flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-black text-[#ccff00] flex items-center justify-center font-mono font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                        #{step.step}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded border border-black font-mono tracking-wider inline-block ${step.badgeColor}`}
                        >
                          {step.badge}
                        </span>
                        <h3 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight mt-1">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-[#faf8f2] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                      <Icon className="h-5 w-5 stroke-[2.5]" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-600">
                    {step.subtitle}
                  </p>

                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bullet points of features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {step.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[#faf8f2] p-3 sm:p-3.5 rounded-2xl border-2 border-black/20 text-xs font-bold text-slate-900 shadow-[1px_1px_0px_#000]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[3] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip Box */}
                  <div className="p-3.5 rounded-2xl bg-[#ccff00]/30 border-2 border-black text-xs sm:text-sm font-bold text-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                    <span>{step.tips}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA & FAQ Cross-link */}
        <div className="rounded-3xl border-3 sm:border-4 border-black bg-[#ffde00] p-6 sm:p-10 shadow-[8px_8px_0px_#000] text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-black tracking-tight">
            Siap Bikin Sesi Mabar Pertamamu?
          </h2>
          <p className="text-sm sm:text-base font-bold text-black/80 max-w-xl">
            Tinggalkan kertas coret-coretan dan drama lapangan sewa. Jalankan mabar komunitasmu dengan cerdas, adil, dan transparan sekarang juga.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-black text-[#ccff00] px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <span>Buka Playfield Sekarang</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>

            <Link
              href="/faq"
              className="flex items-center gap-2 rounded-xl bg-white text-black px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-slate-100 transition-all cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Lihat FAQ Mabar</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
