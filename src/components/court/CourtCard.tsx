"use client";

import { Volume2, CheckCircle2, Flame } from "lucide-react";
import { Court, Match } from "../../core/entities/match";
import { getTierLabel } from "../../core/entities/player";
import { SportConfig } from "../../core/entities/session";
import { SportRegistry } from "../../core/sports/sport-registry";
import { AudioAnnouncer } from "../../services/audio/announcer";

interface CourtCardProps {
  court: Court;
  match?: Match;
  sportConfig: SportConfig;
  onUpdateScore: (courtNumber: number, scoreA: number, scoreB: number) => void;
  onFinishMatch: (courtNumber: number) => void;
  onAddCockToMatch?: (courtNumber: number) => void;
}

export function CourtCard({
  court,
  match,
  sportConfig,
  onUpdateScore,
  onFinishMatch,
  onAddCockToMatch,
}: CourtCardProps) {
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-3 border-dashed border-black bg-white/70 p-8 text-center shadow-[4px_4px_0px_#000]">
        <div className="h-14 w-14 rounded-xl bg-black flex items-center justify-center text-[#ccff00] font-black text-xl mb-3 border-2 border-black">
          #{court.courtNumber}
        </div>
        <h3 className="font-black text-black text-lg uppercase tracking-wide">{court.courtName}</h3>
        <p className="text-xs font-bold text-slate-600 mt-1">Lapangan sedang kosong. Klik &apos;Ronde Berikutnya&apos; untuk rotasi.</p>
      </div>
    );
  }

  // Cek validasi skor menggunakan sport strategy
  const strategy = SportRegistry.getStrategy(
    sportConfig.equipment.unitName === "shuttlecock"
      ? "badminton"
      : sportConfig.equipment.unitName === "ball_can"
      ? "tennis"
      : "padel"
  );
  const validation = strategy.validateScore(match.scoreA, match.scoreB, sportConfig);

  const handleAnnounce = () => {
    AudioAnnouncer.announceMatch(court.courtNumber, match.teamA, match.teamB);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-3 border-black bg-white p-5 shadow-[6px_6px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]">
      {/* Header Lapangan Neo-Brutalist */}
      <div className="flex items-center justify-between pb-3 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ccff00] text-sm font-black text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            #{court.courtNumber}
          </span>
          <div>
            <h3 className="text-sm font-black text-black tracking-wide uppercase">{court.courtName}</h3>
            <span className="text-[11px] font-bold text-slate-700 uppercase font-mono-sport">
              RONDE #{match.roundNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnnounce}
            title="Panggil via Bluetooth Speaker GOR"
            className="flex items-center gap-1.5 rounded-lg bg-black text-[#ccff00] px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Panggil</span>
          </button>
        </div>
      </div>

      {/* Grid Tim: Duel Lapangan */}
      <div className="grid grid-cols-2 gap-3.5 my-4">
        {/* Tim A */}
        <div className="flex flex-col rounded-xl bg-[#e6fffa] border-2 border-black p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#ccff00] px-1.5 py-0.5 rounded border border-black">
              TIM A
            </span>
            <span className="text-[10px] font-bold text-slate-600">Sisi Kiri</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {match.teamA.map((p) => {
              const tier = getTierLabel(p.publicTier);
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-black truncate">{p.name}</span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                        p.gender === "M"
                          ? "bg-blue-100 text-blue-900 border-blue-400"
                          : "bg-pink-100 text-pink-900 border-pink-400"
                      }`}
                    >
                      {p.gender === "M" ? "M" : "W"}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Skor Tim A (Bisa Ditik Langsung & Tombol +/-) */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-black gap-1">
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, Math.max(0, match.scoreA - 1), match.scoreB)}
              className="h-9 w-9 rounded-lg bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="Kurang 1 Poin"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="99"
              value={match.scoreA}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateScore(court.courtNumber, val, match.scoreB);
              }}
              className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-black font-mono-sport tracking-tight bg-white border-2 border-black rounded-lg py-0.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000]"
              title="Ketik angka skor langsung atau gunakan tombol +/-"
            />
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA + 1, match.scoreB)}
              className="h-9 w-9 rounded-lg bg-[#ccff00] text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="Tambah 1 Poin"
            >
              +
            </button>
          </div>
        </div>

        {/* Tim B */}
        <div className="flex flex-col rounded-xl bg-[#eff6ff] border-2 border-black p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#7dd3fc] px-1.5 py-0.5 rounded border border-black">
              TIM B
            </span>
            <span className="text-[10px] font-bold text-slate-600">Sisi Kanan</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {match.teamB.map((p) => {
              const tier = getTierLabel(p.publicTier);
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-black truncate">{p.name}</span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                        p.gender === "M"
                          ? "bg-blue-100 text-blue-900 border-blue-400"
                          : "bg-pink-100 text-pink-900 border-pink-400"
                      }`}
                    >
                      {p.gender === "M" ? "M" : "W"}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Skor Tim B (Bisa Ditik Langsung & Tombol +/-) */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-black gap-1">
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, Math.max(0, match.scoreB - 1))}
              className="h-9 w-9 rounded-lg bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="Kurang 1 Poin"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="99"
              value={match.scoreB}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateScore(court.courtNumber, match.scoreA, val);
              }}
              className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-black font-mono-sport tracking-tight bg-white border-2 border-black rounded-lg py-0.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000]"
              title="Ketik angka skor langsung atau gunakan tombol +/-"
            />
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, match.scoreB + 1)}
              className="h-9 w-9 rounded-lg bg-[#7dd3fc] text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#38bdf8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="Tambah 1 Poin"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#faf8f2] border-2 border-black mb-3">
        <span className="font-bold text-slate-800 text-[11px] truncate uppercase">{validation.statusText}</span>
        {validation.isFinished && (
          <span className="flex items-center gap-1 font-black text-black text-[11px] bg-[#ccff00] px-2 py-0.5 rounded border border-black">
            <CheckCircle2 className="h-3 w-3 stroke-[3]" />
            SELESAI
          </span>
        )}
      </div>

      {/* Tombol Aksi Lapangan */}
      <div className="flex items-center gap-2 mt-auto">
        {onAddCockToMatch && (
          <button
            onClick={() => onAddCockToMatch(court.courtNumber)}
            title="Tambah pemakaian shuttlecock untuk match ini"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-[#ffde00] py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Flame className="h-3.5 w-3.5 fill-black" />
            <span>
              +1 {sportConfig.equipment.unitName === "shuttlecock" ? "Cock" : "Ball"} (
              {match.equipmentUsedCount || 1})
            </span>
          </button>
        )}

        <button
          onClick={() => onFinishMatch(court.courtNumber)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
            validation.isFinished
              ? "bg-[#ccff00] text-black"
              : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Selesaikan Match</span>
        </button>
      </div>
    </div>
  );
}
