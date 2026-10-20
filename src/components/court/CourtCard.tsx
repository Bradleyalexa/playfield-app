"use client";

import { Volume2, CheckCircle2, RotateCcw, Flame } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
          #{court.courtNumber}
        </div>
        <h3 className="font-bold text-white text-base">{court.courtName}</h3>
        <p className="text-xs text-slate-500 mt-1">Lapangan sedang kosong. Klik 'Mulai Ronde Berikutnya' untuk rotasi.</p>
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-xl transition-all hover:border-slate-700/80">
      {/* Header Lapangan */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            {court.courtNumber}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{court.courtName}</h3>
            <span className="text-[11px] text-slate-400">Ronde {match.roundNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAnnounce}
            title="Panggil lewat speaker Bluetooth"
            className="flex items-center gap-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Panggil</span>
          </button>
        </div>
      </div>

      {/* Area Pertandingan: Tim A vs Tim B */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Tim A */}
        <div className="flex flex-col rounded-xl bg-slate-800/40 border border-slate-700/40 p-3.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 mb-1.5">
            Tim A (Sisi Kiri)
          </span>
          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {match.teamA.map((p) => {
              const tier = getTierLabel(p.publicTier);
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <span className="font-medium text-white truncate">{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pengatur Skor Tim A */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <button
              onClick={() => onUpdateScore(court.courtNumber, Math.max(0, match.scoreA - 1), match.scoreB)}
              className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 text-sm"
            >
              -
            </button>
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{match.scoreA}</span>
            <button
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA + 1, match.scoreB)}
              className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 active:scale-95 text-sm shadow-md shadow-emerald-600/30"
            >
              +
            </button>
          </div>
        </div>

        {/* Tim B */}
        <div className="flex flex-col rounded-xl bg-slate-800/40 border border-slate-700/40 p-3.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400 mb-1.5">
            Tim B (Sisi Kanan)
          </span>
          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {match.teamB.map((p) => {
              const tier = getTierLabel(p.publicTier);
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <span className="font-medium text-white truncate">{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pengatur Skor Tim B */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <button
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, Math.max(0, match.scoreB - 1))}
              className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 text-sm"
            >
              -
            </button>
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{match.scoreB}</span>
            <button
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, match.scoreB + 1)}
              className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 active:scale-95 text-sm shadow-md shadow-blue-600/30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar / Deuce Info */}
      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 mb-3">
        <span className="text-slate-400 truncate text-[11px]">{validation.statusText}</span>
        {validation.isFinished && (
          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Match Selesai
          </span>
        )}
      </div>

      {/* Tombol Aksi Lapangan */}
      <div className="flex items-center gap-2 mt-auto">
        {onAddCockToMatch && (
          <button
            onClick={() => onAddCockToMatch(court.courtNumber)}
            title="Tambah pemakaian shuttlecock untuk match ini"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>+1 Cock ({match.equipmentUsedCount || 1})</span>
          </button>
        )}

        <button
          onClick={() => onFinishMatch(court.courtNumber)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all active:scale-95 ${
            validation.isFinished
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Selesaikan Match</span>
        </button>
      </div>
    </div>
  );
}
