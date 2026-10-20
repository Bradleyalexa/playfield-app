"use client";

import { useState, useMemo } from "react";
import { X, Clock, Calendar, Users, Trophy, ChevronRight, Sparkles, Filter } from "lucide-react";
import { ALGORITHM_REGISTRY, GameSession } from "../../core/entities/session";
import { generateProjectedSchedule, ProjectedRound } from "../../core/matchmaking/balanced-queue";
import { getTierLabel } from "../../core/entities/player";

interface AllMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GameSession;
}

export function AllMatchesModal({ isOpen, onClose, session }: AllMatchesModalProps) {
  const [filterMode, setFilterMode] = useState<"all" | "active_past" | "upcoming">("all");

  const projectedRounds = useMemo(() => {
    if (!isOpen) return [];
    return generateProjectedSchedule(session);
  }, [isOpen, session]);

  if (!isOpen) return null;

  const algoDetails =
    ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"];

  const filteredRounds = projectedRounds.filter((r) => {
    if (filterMode === "active_past") return r.isCompleted || r.isCurrent;
    if (filterMode === "upcoming") return !r.isCompleted && !r.isCurrent;
    return true;
  });

  const totalMatchesCount = projectedRounds.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b-[3px] border-black shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#ccff00] border-2 border-black font-black">
                {session.sport.toUpperCase()}
              </span>
              <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-black ${algoDetails.badgeColor}`}>
                {algoDetails.icon} {algoDetails.shortName}
              </span>
              <span className="text-[11px] font-mono font-bold text-black/60">
                KODE: {session.publicSlug || session.id.slice(0, 8)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Jadwal Lengkap & Proyeksi Pertandingan
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70 mt-0.5">
              {session.title} • {session.courtCount} Lapangan
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border-[3px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <X className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Info Strip: Durasi Sewa, Estimasi 1 Match, dan Extra Match */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-white/70 border-b-2 border-black shrink-0 text-xs">
          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black/50">Jam Mulai / Sewa</span>
            <span className="font-mono font-black text-black text-sm">
              {session.startTime || "19:00"} ({session.durationHours || 2} Jam)
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black/50">Estimasi 1 Match</span>
            <span className="font-mono font-black text-black text-sm">
              ~{session.matchDurationMinutes || 15} Menit
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black/50">Total Match Disiapkan</span>
            <span className="font-mono font-black text-black text-sm">
              {totalMatchesCount} Match (+10 Extra)
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-[#ffde00] border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black">Status Saat Ini</span>
            <span className="font-mono font-black text-black text-sm">
              Ronde #{session.currentRound} (LIVE)
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#faf8f2] border-b-2 border-black shrink-0">
          <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Daftar Ronde ({filteredRounds.length} Ronde)
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg border-2 border-black transition-all ${
                filterMode === "all"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterMode("active_past")}
              className={`px-3 py-1 rounded-lg border-2 border-black transition-all ${
                filterMode === "active_past"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Live & Selesai
            </button>
            <button
              onClick={() => setFilterMode("upcoming")}
              className={`px-3 py-1 rounded-lg border-2 border-black transition-all ${
                filterMode === "upcoming"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Prediksi Berikutnya
            </button>
          </div>
        </div>

        {/* Scrollable Body: Daftar Ronde & Match */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredRounds.length === 0 ? (
            <div className="py-12 text-center font-bold text-black/60 italic">
              Tidak ada ronde yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            filteredRounds.map((round) => {
              const isCurrent = round.isCurrent;
              const isPast = round.isCompleted;

              return (
                <div
                  key={round.roundNumber}
                  className={`rounded-2xl border-[3px] border-black p-4 sm:p-5 transition-all ${
                    isCurrent
                      ? "bg-white shadow-[6px_6px_0px_#000] ring-3 ring-[#ccff00]"
                      : isPast
                      ? "bg-white/80 shadow-[4px_4px_0px_#000]"
                      : "bg-[#faf8f2] shadow-[3px_3px_0px_#000]"
                  }`}
                >
                  {/* Round Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded bg-black text-white">
                        RONDE #{round.roundNumber}
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-black flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {round.timeRange}
                      </span>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-full bg-[#ccff00] text-black border-2 border-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                          SEDANG MAIN (LIVE)
                        </span>
                      ) : isPast ? (
                        <span className="px-3 py-0.5 rounded-full bg-neutral-200 text-black border-2 border-black font-bold text-xs font-mono">
                          SELESAI DIMAINKAN
                        </span>
                      ) : (
                        <span className="px-3 py-0.5 rounded-full bg-white text-black border-2 border-black font-bold text-xs font-mono">
                          PREDIKSI JADWAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Matches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className="rounded-xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-black/20 mb-2.5">
                          <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-[#faf8f2] border border-black">
                            Lapangan {match.courtNumber}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-black/60">
                            {match.estimatedStartTime} - {match.estimatedEndTime}
                          </span>
                        </div>

                        {/* Teams 2v2 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* Tim A */}
                          <div className="rounded-lg bg-emerald-50/80 border border-black p-2.5 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block mb-1">
                                Tim A
                              </span>
                              <div className="space-y-1">
                                {match.teamA.map((p) => {
                                  const tier = getTierLabel(p.publicTier);
                                  return (
                                    <div key={p.id} className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-black truncate">{p.name}</span>
                                      <span
                                        className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                          p.gender === "M"
                                            ? "bg-blue-100 text-blue-900 border-blue-400"
                                            : "bg-pink-100 text-pink-900 border-pink-400"
                                        }`}
                                      >
                                        {p.gender === "M" ? "M" : "W"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {typeof match.scoreA === "number" && (
                              <div className="mt-2 pt-1 border-t border-emerald-300 text-center font-mono font-black text-xl text-emerald-900">
                                {match.scoreA}
                              </div>
                            )}
                          </div>

                          {/* Tim B */}
                          <div className="rounded-lg bg-sky-50/80 border border-black p-2.5 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider block mb-1">
                                Tim B
                              </span>
                              <div className="space-y-1">
                                {match.teamB.map((p) => {
                                  return (
                                    <div key={p.id} className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-black truncate">{p.name}</span>
                                      <span
                                        className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                          p.gender === "M"
                                            ? "bg-blue-100 text-blue-900 border-blue-400"
                                            : "bg-pink-100 text-pink-900 border-pink-400"
                                        }`}
                                      >
                                        {p.gender === "M" ? "M" : "W"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {typeof match.scoreB === "number" && (
                              <div className="mt-2 pt-1 border-t border-sky-300 text-center font-mono font-black text-xl text-sky-900">
                                {match.scoreB}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resting Players On-Deck */}
                  {round.restingPlayers.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-black/20 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-mono font-black text-[11px] text-black/60 uppercase">
                        🏖️ Istirahat ({round.restingPlayers.length}):
                      </span>
                      {round.restingPlayers.map((p) => (
                        <span
                          key={p.id}
                          className="font-bold text-black/80 bg-white border border-black px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                        >
                          {p.name}
                          <span className="text-[9px] text-black/50">({p.gender === "M" ? "M" : "W"})</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-white border-t-[3px] border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <p className="text-black/70 font-semibold text-center sm:text-left">
            💡 <span className="font-black text-black">Catatan Algoritma:</span> Prediksi ronde masa depan disimulasikan otomatis berdasarkan algoritma <strong>{algoDetails.name}</strong>. Jadwal akan adaptif menyesuaikan jika ada pemain yang pause/kram.
          </p>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-black text-white font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Tutup Jadwal
          </button>
        </div>
      </div>
    </div>
  );
}
