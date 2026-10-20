"use client";

import { useState } from "react";
import { BookOpen, ShieldAlert, Zap, Compass, CheckCircle2 } from "lucide-react";
import { SPORT_GUIDES } from "../../core/entities/education";
import { SportType } from "../../core/entities/session";

export function SportGuideView() {
  const [activeSport, setActiveSport] = useState<SportType>("badminton");
  const guide = SPORT_GUIDES[activeSport];

  const sportsList: { type: SportType; label: string; icon: string }[] = [
    { type: "badminton", label: "Badminton", icon: "🏸" },
    { type: "tennis", label: "Tennis Lapangan", icon: "🎾" },
    { type: "padel", label: "Padel Tennis", icon: "🏓" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Sport Selector Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        {sportsList.map((s) => (
          <button
            key={s.type}
            onClick={() => setActiveSport(s.type)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeSport === s.type
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-102"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="text-lg">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Guide Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          {guide.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">{guide.title}</h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">{guide.overview}</p>
      </div>

      {/* Grid 2 Kolom: Aturan Skor & Formasi Lapangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aturan & Sistem Skor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Peraturan & Sistem Skor</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {guide.scoringRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Posisi & Formasi Ganda */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Posisi & Formasi Ganda</h3>
          </div>
          <div className="flex flex-col gap-3.5">
            {guide.courtPositions.map((pos, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{pos.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {pos.tag}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">{pos.subtitle}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{pos.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips & Trik Bermain */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Tips & Trik Pro untuk Mabar</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {guide.tipsAndTricks.map((tip, idx) => (
            <div key={idx} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {tip.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1.5">{tip.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Etika Lapangan & GOR */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Etika Lapangan & GOR</h4>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
          {guide.etiquette.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
