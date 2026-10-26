"use client";

import { useMemo } from "react";
import { X, RefreshCw, Sparkles, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { Player, getTierLabel } from "../../core/entities/player";

interface SubstitutePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtNumber: number;
  targetPlayer: Player | null;
  availableSubstitutes: Player[];
  onSelectSubstitute: (substitutePlayer: Player) => void;
}

export function SubstitutePlayerModal({
  isOpen,
  onClose,
  courtNumber,
  targetPlayer,
  availableSubstitutes,
  onSelectSubstitute,
}: SubstitutePlayerModalProps) {
  // Hitung rekomendasi terbaik berdasarkan gender, tier yang setara, dan jam main terendah
  const rankedSubstitutes = useMemo(() => {
    if (!targetPlayer || availableSubstitutes.length === 0) return [];

    return [...availableSubstitutes].map((candidate) => {
      let matchScore = 100;
      const reasons: string[] = [];

      // 1. Kecocokan gender
      if (candidate.gender === targetPlayer.gender) {
        matchScore += 30;
        reasons.push("Gender Sesuai");
      }

      // 2. Kecocokan Tier / Skill level (makin dekat selisihnya, makin tinggi)
      const tierDiff = Math.abs(candidate.skillLevel - targetPlayer.skillLevel);
      if (tierDiff === 0) {
        matchScore += 25;
        reasons.push("Tier Setara");
      } else if (tierDiff === 1) {
        matchScore += 15;
        reasons.push("Tier Berdekatan");
      } else {
        matchScore -= tierDiff * 10;
      }

      // 3. Jatah main: Yang main lebih sedikit dapat prioritas
      matchScore -= candidate.gamesPlayed * 5;
      if (candidate.gamesPlayed === 0) {
        reasons.push("Belum Main");
      } else {
        reasons.push(`${candidate.gamesPlayed}x Main`);
      }

      return {
        player: candidate,
        score: matchScore,
        reasons,
      };
    }).sort((a, b) => b.score - a.score);
  }, [targetPlayer, availableSubstitutes]);

  if (!isOpen || !targetPlayer) return null;

  const targetTier = getTierLabel(targetPlayer.publicTier);
  const bestMatch = rankedSubstitutes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-lg max-h-[90vh] bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b-[3px] border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black font-black text-base shadow-[2px_2px_0px_#000]">
              #{courtNumber}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black uppercase tracking-tight">
                Ganti Pemain Lapangan #{courtNumber}
              </h2>
              <p className="text-xs font-bold text-slate-600">
                Tukar pemain agar pertandingan langsung berjalan tanpa menunggu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Pemain yang Diganti */}
        <div className="p-4 bg-amber-50/80 border-b-2 border-black shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
            Pemain yang Diganti:
          </span>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2 truncate">
              <span className="font-black text-black text-sm truncate">{targetPlayer.name}</span>
              <span
                className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                  targetPlayer.gender === "M"
                    ? "bg-blue-100 text-blue-900 border-blue-400"
                    : "bg-pink-100 text-pink-900 border-pink-400"
                }`}
              >
                {targetPlayer.gender === "M" ? "Pria" : "Wanita"}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${targetTier.badgeColor}`}>
                {targetTier.label}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 border border-amber-400 text-amber-900 shrink-0">
              {targetPlayer.isArrived === false ? "⏳ Belum Tiba / OTW" : "Sedang Diganti"}
            </span>
          </div>
        </div>

        {/* Body: Daftar Pemain Pengganti Tersedia */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {rankedSubstitutes.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border-2 border-dashed border-black bg-white flex flex-col items-center">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 stroke-[2.5]" />
              <h4 className="font-black text-black text-sm uppercase">Tidak Ada Pemain Cadangan</h4>
              <p className="text-xs font-bold text-slate-600 mt-1 max-w-xs">
                Semua pemain yang sudah hadir sedang bermain di lapangan lain, atau berstatus istirahat/jeda. Silakan check-in pemain lain terlebih dahulu.
              </p>
            </div>
          ) : (
            <>
              {/* Rekomendasi Terbaik (Smart Match) */}
              {bestMatch && (
                <div className="p-3.5 rounded-2xl bg-[#ccff00]/25 border-3 border-black shadow-[4px_4px_0px_#000] mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase text-black font-mono">
                      <Sparkles className="h-4 w-4 fill-black text-black" />
                      Rekomendasi Terbaik
                    </span>
                    <span className="text-[10px] font-bold text-slate-700">
                      Paling seimbang & siap main
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                    <div className="flex flex-col gap-0.5 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-black text-black text-sm truncate">
                          {bestMatch.player.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                            bestMatch.player.gender === "M"
                              ? "bg-blue-100 text-blue-900 border-blue-400"
                              : "bg-pink-100 text-pink-900 border-pink-400"
                          }`}
                        >
                          {bestMatch.player.gender === "M" ? "Pria" : "Wanita"}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded ${getTierLabel(bestMatch.player.publicTier).badgeColor}`}>
                          {getTierLabel(bestMatch.player.publicTier).label.replace("Tier ", "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                        <span>Main: {bestMatch.player.gamesPlayed}x</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-extrabold">
                          {bestMatch.reasons.join(", ")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSubstitute(bestMatch.player)}
                      className="px-3.5 py-2 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black border-2 border-black font-black text-xs uppercase tracking-wide shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
                    >
                      Pilih Ini
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Semua Pemain Cadangan Hadir ({rankedSubstitutes.length})
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Sudah tiba di lokasi
                </span>
              </div>

              {/* List Semua Pemain Cadangan */}
              <div className="space-y-2">
                {rankedSubstitutes.map(({ player, reasons }) => {
                  const tier = getTierLabel(player.publicTier);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-extrabold text-black text-xs sm:text-sm truncate">
                            {player.name}
                          </span>
                          <span
                            className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                              player.gender === "M"
                                ? "bg-blue-100 text-blue-900 border-blue-400"
                                : "bg-pink-100 text-pink-900 border-pink-400"
                            }`}
                          >
                            {player.gender === "M" ? "M" : "W"}
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded ${tier.badgeColor}`}>
                            {tier.label.replace("Tier ", "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {player.gamesPlayed}x main
                          </span>
                          <span>•</span>
                          <span>{reasons.join(", ")}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectSubstitute(player)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black border-2 border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
                      >
                        Pilih
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
