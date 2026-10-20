"use client";

import { Court, Match } from "../../core/entities/match";

interface KioskCourtCardProps {
  court: Court;
  match?: Match;
}

export function KioskCourtCard({ court, match }: KioskCourtCardProps) {
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-white/20 bg-black/60 p-12 text-center">
        <span className="text-4xl font-black text-white/40 uppercase">LAPANGAN #{court.courtNumber}</span>
        <span className="text-sm font-black text-slate-500 mt-2 uppercase tracking-widest">SEDANG KOSONG</span>
      </div>
    );
  }

  const isLeadingA = match.scoreA > match.scoreB;
  const isLeadingB = match.scoreB > match.scoreA;

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#ccff00]">
      {/* Header Lapangan TV Display */}
      <div className="flex items-center justify-between pb-4 border-b-4 border-black mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccff00] text-black text-2xl font-black border-3 border-black shadow-[3px_3px_0px_#000]">
            #{court.courtNumber}
          </span>
          <span className="text-xl sm:text-2xl font-black text-black tracking-wider uppercase">
            {court.courtName}
          </span>
        </div>
        <span className="rounded-lg bg-black text-[#ccff00] px-4 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black">
          LIVE MATCH
        </span>
      </div>

      {/* Duel Tim & Skor Utama Raksasa */}
      <div className="grid grid-cols-2 gap-6 items-center">
        {/* Tim A */}
        <div
          className={`flex flex-col rounded-2xl p-6 border-3 border-black transition-all ${
            isLeadingA ? "bg-[#ccff00]/30 shadow-[5px_5px_0px_#000]" : "bg-[#faf8f2] shadow-[3px_3px_0px_#000]"
          }`}
        >
          <span className="text-xs font-black tracking-widest uppercase text-black bg-[#ccff00] px-2 py-0.5 rounded border border-black inline-block mb-3 w-fit">
            TIM A
          </span>
          <div className="flex flex-col gap-1.5 mb-4">
            {match.teamA.map((p) => (
              <span key={p.id} className="text-xl sm:text-3xl font-black text-black truncate uppercase">
                {p.name}
              </span>
            ))}
          </div>

          <div className="text-center pt-3 border-t-3 border-black">
            <span className="font-mono-sport text-7xl sm:text-8xl font-black text-black tracking-tight">
              {match.scoreA}
            </span>
          </div>
        </div>

        {/* Tim B */}
        <div
          className={`flex flex-col rounded-2xl p-6 border-3 border-black transition-all ${
            isLeadingB ? "bg-[#7dd3fc]/40 shadow-[5px_5px_0px_#000]" : "bg-[#faf8f2] shadow-[3px_3px_0px_#000]"
          }`}
        >
          <span className="text-xs font-black tracking-widest uppercase text-black bg-[#7dd3fc] px-2 py-0.5 rounded border border-black inline-block mb-3 w-fit">
            TIM B
          </span>
          <div className="flex flex-col gap-1.5 mb-4">
            {match.teamB.map((p) => (
              <span key={p.id} className="text-xl sm:text-3xl font-black text-black truncate uppercase">
                {p.name}
              </span>
            ))}
          </div>

          <div className="text-center pt-3 border-t-3 border-black">
            <span className="font-mono-sport text-7xl sm:text-8xl font-black text-black tracking-tight">
              {match.scoreB}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
