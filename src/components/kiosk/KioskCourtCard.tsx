"use client";

import { Court, Match } from "../../core/entities/match";

interface KioskCourtCardProps {
  court: Court;
  match?: Match;
}

export function KioskCourtCard({ court, match }: KioskCourtCardProps) {
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950/60 p-12 text-center">
        <span className="text-4xl font-black text-slate-700">LAPANGAN {court.courtNumber}</span>
        <span className="text-sm font-semibold text-slate-500 mt-2">SEDANG KOSONG</span>
      </div>
    );
  }

  const isLeadingA = match.scoreA > match.scoreB;
  const isLeadingB = match.scoreB > match.scoreA;

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-2 border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/80">
      {/* Header Nomor Lapangan */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 text-xl font-black">
            {court.courtNumber}
          </span>
          <span className="text-lg font-black text-white tracking-wider uppercase">{court.courtName}</span>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30 animate-pulse">
          Live Match
        </span>
      </div>

      {/* Duel Tim & Skor Utama */}
      <div className="grid grid-cols-2 gap-6 my-6 items-center">
        {/* Tim A */}
        <div
          className={`flex flex-col rounded-2xl p-5 border transition-all ${
            isLeadingA ? "bg-emerald-950/30 border-emerald-500/50" : "bg-slate-900/60 border-slate-800"
          }`}
        >
          <span className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-2">TIM A</span>
          <div className="flex flex-col gap-1 mb-4">
            {match.teamA.map((p) => (
              <span key={p.id} className="text-xl sm:text-2xl font-black text-white truncate">
                {p.name}
              </span>
            ))}
          </div>

          <div className="text-center pt-3 border-t border-slate-800">
            <span className="font-mono text-6xl sm:text-7xl font-black text-emerald-400 tracking-tight">
              {match.scoreA}
            </span>
          </div>
        </div>

        {/* Tim B */}
        <div
          className={`flex flex-col rounded-2xl p-5 border transition-all ${
            isLeadingB ? "bg-blue-950/30 border-blue-500/50" : "bg-slate-900/60 border-slate-800"
          }`}
        >
          <span className="text-xs font-black tracking-widest uppercase text-blue-400 mb-2">TIM B</span>
          <div className="flex flex-col gap-1 mb-4">
            {match.teamB.map((p) => (
              <span key={p.id} className="text-xl sm:text-2xl font-black text-white truncate">
                {p.name}
              </span>
            ))}
          </div>

          <div className="text-center pt-3 border-t border-slate-800">
            <span className="font-mono text-6xl sm:text-7xl font-black text-blue-400 tracking-tight">
              {match.scoreB}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
