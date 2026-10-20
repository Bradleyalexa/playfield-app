"use client";

import { useState } from "react";
import { BookOpen, ShieldAlert, Zap, Compass, CheckCircle2 } from "lucide-react";
import { SPORT_GUIDES } from "../../core/entities/education";
import { SportType } from "../../core/entities/session";

export function SportGuideView() {
  const [activeSport, setActiveSport] = useState<SportType>("badminton");
  const guide = SPORT_GUIDES[activeSport];

  const sportsList: { type: SportType; label: string; icon: string; accent: string }[] = [
    { type: "badminton", label: "Badminton", icon: "🏸", accent: "bg-[#ccff00]" },
    { type: "tennis", label: "Tennis Lapangan", icon: "🎾", accent: "bg-[#ff5500] text-white" },
    { type: "padel", label: "Padel Tennis", icon: "🏓", accent: "bg-[#00e5ff]" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Sport Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {sportsList.map((s) => {
          const isActive = activeSport === s.type;
          return (
            <button
              key={s.type}
              onClick={() => setActiveSport(s.type)}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-black transition-all cursor-pointer border-[3px] border-black ${
                isActive
                  ? `${s.accent} shadow-[4px_4px_0px_#000] -translate-y-0.5`
                  : "bg-white text-black hover:bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="font-heading uppercase tracking-wide">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Guide Header Banner */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
        <div className="inline-block rounded-full bg-[#ccff00] px-3.5 py-1 text-xs font-black text-black border-2 border-black font-mono uppercase tracking-wider mb-3">
          {guide.badge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
          {guide.title}
        </h2>
        <p className="text-sm sm:text-base font-medium text-black/80 leading-relaxed max-w-3xl">
          {guide.overview}
        </p>
      </div>

      {/* Grid 2 Kolom: Aturan Skor & Formasi Lapangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aturan & Sistem Skor */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6 shadow-[5px_5px_0px_#000] flex flex-col">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-black mb-4">
            <div className="p-2 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Peraturan & Sistem Skor
              </h3>
              <span className="text-[11px] font-mono font-bold text-black/50">Aturan Resmi & Variasi Mabar</span>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {guide.scoringRules.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-black bg-[#faf8f2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Posisi & Formasi Ganda */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6 shadow-[5px_5px_0px_#000] flex flex-col">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-black mb-4">
            <div className="p-2 rounded-xl bg-[#00e5ff] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Posisi & Formasi Ganda
              </h3>
              <span className="text-[11px] font-mono font-bold text-black/50">Court Positioning Guide</span>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {guide.courtPositions.map((pos, idx) => (
              <div
                key={idx}
                className="rounded-xl border-2 border-black bg-[#faf8f2] p-4 shadow-[2px_2px_0px_#000]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-black">{pos.title}</span>
                  <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-white text-black border-2 border-black shadow-[1px_1px_0px_#000]">
                    {pos.tag}
                  </span>
                </div>
                <span className="text-xs font-bold text-black/60 block mb-1 font-mono">
                  {pos.subtitle}
                </span>
                <p className="text-xs font-medium text-black/80 leading-relaxed">
                  {pos.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips & Trik Bermain */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black mb-4">
          <div className="p-2 rounded-xl bg-[#ffde00] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-wide">
              Tips & Trik Pro untuk Mabar
            </h3>
            <span className="text-[11px] font-mono font-bold text-black/50">Level Up Permainan Tim</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {guide.tipsAndTricks.map((tip, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl border-2 border-black bg-[#faf8f2] p-4 shadow-[3px_3px_0px_#000]"
            >
              <div className="mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#ffde00] border-2 border-black px-2 py-0.5 rounded font-mono inline-block">
                  {tip.category}
                </span>
              </div>
              <h4 className="font-black text-sm text-black mb-1.5">{tip.title}</h4>
              <p className="text-xs font-medium text-black/70 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Etika Lapangan & GOR */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-black">
          <div className="p-1.5 rounded-lg bg-[#ff5500] text-white border-2 border-black">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
            Etika Lapangan & Budaya GOR (Penting!)
          </h4>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-black/80">
          {guide.etiquette.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 bg-[#faf8f2] p-2.5 rounded-lg border-2 border-black"
            >
              <span className="h-2 w-2 rounded-full bg-[#ccff00] border border-black shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
