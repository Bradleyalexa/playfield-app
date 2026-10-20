"use client";

import { useEffect, useState } from "react";
import { Court, Match } from "../../core/entities/match";
import { Timer } from "lucide-react";

interface KioskCourtCardProps {
  court: Court;
  match?: Match;
}

export function KioskCourtCard({ court, match }: KioskCourtCardProps) {
  const [matchElapsed, setMatchElapsed] = useState<string>("");

  useEffect(() => {
    if (!match?.startedAt || match.status !== "in_progress") {
      setMatchElapsed("");
      return;
    }
    const update = () => {
      const start = new Date(match.startedAt!).getTime();
      const diffSec = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const m = Math.floor(diffSec / 60);
      const s = diffSec % 60;
      setMatchElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [match?.startedAt, match?.status]);

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 sm:border-3 border-dashed border-black/40 bg-white/70 p-4 sm:p-6 text-center h-full min-h-[140px]">
        <span className="text-base sm:text-2xl font-black text-black/50 uppercase">LAPANGAN #{court.courtNumber}</span>
        <span className="text-xs font-black text-slate-500 mt-1 uppercase tracking-widest">SEDANG KOSONG</span>
      </div>
    );
  }

  const isLeadingA = match.scoreA > match.scoreB;
  const isLeadingB = match.scoreB > match.scoreA;

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border-2 sm:border-3 border-black bg-white p-2.5 sm:p-4 md:p-5 shadow-[4px_4px_0px_#ccff00] h-full">
      {/* Header Lapangan TV Display */}
      <div className="flex items-center justify-between pb-1.5 sm:pb-2.5 border-b-2 sm:border-b-3 border-black mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#ccff00] text-black text-xs sm:text-base font-black border-2 border-black shadow-[2px_2px_0px_#000] shrink-0">
            #{court.courtNumber}
          </span>
          <span className="text-xs sm:text-base md:text-lg font-black text-black tracking-wider uppercase truncate">
            {court.courtName}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {matchElapsed && (
            <span className="inline-flex items-center gap-1 rounded bg-[#ffde00] text-black px-1.5 py-0.5 text-[10px] sm:text-xs font-black font-mono-sport border border-black shadow-[1px_1px_0px_#000]">
              <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[2.5]" />
              <span>{matchElapsed}</span>
            </span>
          )}
          <span className="rounded bg-black text-[#ccff00] px-2 py-0.5 text-[9px] sm:text-[11px] font-black uppercase tracking-wider border border-black font-mono">
            LIVE
          </span>
        </div>
      </div>

      {/* Duel Tim & Skor Utama Raksasa Responsif */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-stretch flex-1 min-h-0">
        {/* Tim A */}
        <div
          className={`flex flex-col justify-between rounded-xl p-2 sm:p-3 md:p-4 border-2 border-black transition-all ${
            isLeadingA ? "bg-[#ccff00]/30 shadow-[3px_3px_0px_#000]" : "bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
          }`}
        >
          <div>
            <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase text-black bg-[#ccff00] px-1.5 py-0.2 rounded border border-black inline-block mb-1 sm:mb-1.5">
              TIM A
            </span>
            <div className="flex flex-col gap-0.5">
              {match.teamA.map((p) => (
                <span key={p.id} className="text-xs sm:text-base md:text-xl font-extrabold text-black truncate uppercase">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center pt-1.5 sm:pt-2 border-t-2 border-black mt-1">
            <span className="font-mono-sport text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight leading-none">
              {match.scoreA}
            </span>
          </div>
        </div>

        {/* Tim B */}
        <div
          className={`flex flex-col justify-between rounded-xl p-2 sm:p-3 md:p-4 border-2 border-black transition-all ${
            isLeadingB ? "bg-[#7dd3fc]/40 shadow-[3px_3px_0px_#000]" : "bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
          }`}
        >
          <div>
            <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase text-black bg-[#7dd3fc] px-1.5 py-0.2 rounded border border-black inline-block mb-1 sm:mb-1.5">
              TIM B
            </span>
            <div className="flex flex-col gap-0.5">
              {match.teamB.map((p) => (
                <span key={p.id} className="text-xs sm:text-base md:text-xl font-extrabold text-black truncate uppercase">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center pt-1.5 sm:pt-2 border-t-2 border-black mt-1">
            <span className="font-mono-sport text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight leading-none">
              {match.scoreB}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
