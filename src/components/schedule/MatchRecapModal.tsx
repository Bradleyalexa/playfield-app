"use client";

import { useState, useMemo } from "react";
import { X, Trophy, Share2, Check, Clock, Filter, Calendar } from "lucide-react";
import { GameSession } from "../../core/entities/session";
import { getMatchWinner, Match } from "../../core/entities/match";
import { getTierLabel } from "../../core/entities/player";

interface MatchRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GameSession;
}

export function MatchRecapModal({ isOpen, onClose, session }: MatchRecapModalProps) {
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | "all">("all");
  const [isCopied, setIsCopied] = useState(false);

  // Ambil hanya match yang sudah berstatus 'completed'
  const completedMatches = useMemo(() => {
    return (session.matches || [])
      .filter((m) => m.status === "completed")
      .sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber);
  }, [session.matches]);

  // Daftar ronde yang memiliki match selesai
  const availableRounds = useMemo(() => {
    const rounds = Array.from(new Set(completedMatches.map((m) => m.roundNumber)));
    return rounds.sort((a, b) => a - b);
  }, [completedMatches]);

  const filteredMatches = useMemo(() => {
    if (selectedRoundFilter === "all") return completedMatches;
    return completedMatches.filter((m) => m.roundNumber === selectedRoundFilter);
  }, [completedMatches, selectedRoundFilter]);

  // Hitung berapa match yang ada skor vs yang tanpa skor
  const scoredMatchesCount = completedMatches.filter(
    (m) => m.scoreA > 0 || m.scoreB > 0
  ).length;

  if (!isOpen) return null;

  // Format ringkasan hasil match untuk WhatsApp / Clipboard
  const generateMatchRecapText = () => {
    let text = `📋 *REKAP HASIL PERTANDINGAN*\n` +
      `🏢 *Sesi:* ${session.title}\n` +
      `🏸 *Total:* ${completedMatches.length} Match Selesai\n\n`;

    // Kelompokkan per ronde
    const roundGroups: Record<number, Match[]> = {};
    completedMatches.forEach((m) => {
      if (!roundGroups[m.roundNumber]) roundGroups[m.roundNumber] = [];
      roundGroups[m.roundNumber].push(m);
    });

    Object.entries(roundGroups).forEach(([roundStr, matches]) => {
      text += `*RONDE #${roundStr}:*\n`;
      matches.forEach((m) => {
        const teamANames = m.teamA.map((p) => p.name).join("/");
        const teamBNames = m.teamB.map((p) => p.name).join("/");
        const winner = getMatchWinner(m);

        if (m.scoreA > 0 || m.scoreB > 0) {
          const winnerText = winner === "A" ? `➜ *Menang: ${teamANames}*` : winner === "B" ? `➜ *Menang: ${teamBNames}*` : "➜ *Seri*";
          text += `• Lap ${m.courtNumber}: ${teamANames} [${m.scoreA}] vs [${m.scoreB}] ${teamBNames} ${winnerText}\n`;
        } else if (winner) {
          const winnerNames = winner === "A" ? teamANames : teamBNames;
          text += `• Lap ${m.courtNumber}: ${teamANames} vs ${teamBNames} ➜ *👑 Menang: ${winnerNames}*\n`;
        } else {
          text += `• Lap ${m.courtNumber}: ${teamANames} vs ${teamBNames} ➜ *(Selesai - Tanpa Skor)*\n`;
        }
      });
      text += `\n`;
    });

    text += `_Dikelola otomatis via Playfield App_`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateMatchRecapText());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleShareWa = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generateMatchRecapText())}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-4 sm:p-6 bg-white border-b-[3px] border-black shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#ccff00] border-2 border-black font-black">
                {session.sport.toUpperCase()}
              </span>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black text-white border-2 border-black font-mono">
                {completedMatches.length} MATCH SELESAI
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
              <span>📋 Rekap Hasil Pertandingan</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
              {session.title} • Riwayat duel per ronde & lapangan
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border-[3px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <X className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Ringkasan Singkat & Filter Ronde */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:px-6 sm:py-3 bg-white/70 border-b-2 border-black shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black uppercase text-black text-[11px] flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Ronde:</span>
            </span>

            <button
              onClick={() => setSelectedRoundFilter("all")}
              className={`px-3 py-1 rounded-lg border-2 border-black text-xs transition-all cursor-pointer ${
                selectedRoundFilter === "all"
                  ? "bg-[#ccff00] font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white font-bold hover:bg-slate-100"
              }`}
            >
              Semua ({completedMatches.length})
            </button>

            {availableRounds.map((rnd) => {
              const count = completedMatches.filter((m) => m.roundNumber === rnd).length;
              return (
                <button
                  key={rnd}
                  onClick={() => setSelectedRoundFilter(rnd)}
                  className={`px-3 py-1 rounded-lg border-2 border-black text-xs transition-all cursor-pointer ${
                    selectedRoundFilter === rnd
                      ? "bg-[#ccff00] font-black shadow-[2px_2px_0px_#000]"
                      : "bg-white font-bold hover:bg-slate-100"
                  }`}
                >
                  Ronde #{rnd} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black bg-white hover:bg-slate-100 font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Salin rekap teks hasil match"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> : <span>📋</span>}
              <span>{isCopied ? "Tersalin!" : "Salin Teks"}</span>
            </button>

            <button
              onClick={handleShareWa}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Bagikan rekap hasil pertandingan ke WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Share WA</span>
            </button>
          </div>
        </div>

        {/* Scrollable List Hasil Match */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-black/30 bg-white">
              <span className="text-3xl block mb-2">🏸</span>
              <p className="font-black text-sm text-black uppercase">Belum ada match yang selesai dimainkan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Setelah pertandingan di lapangan diselesaikan (baik dengan input angka skor maupun klik tim pemenang), hasil duel akan otomatis tercatat rapi di sini.
              </p>
            </div>
          ) : (
            filteredMatches.map((match, idx) => {
              const winner = getMatchWinner(match);
              const isWinnerA = winner === "A";
              const isWinnerB = winner === "B";
              const hasScore = match.scoreA > 0 || match.scoreB > 0;

              return (
                <div
                  key={match.id || idx}
                  className="rounded-2xl border-3 border-black bg-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#000] flex flex-col gap-3"
                >
                  {/* Match Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black/15 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-black text-white">
                        RONDE #{match.roundNumber}
                      </span>
                      <span className="font-mono font-bold text-black bg-[#faf8f2] border border-black px-2 py-0.5 rounded text-[11px]">
                        Lapangan {match.courtNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasScore ? (
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          Skor Dicatat
                        </span>
                      ) : winner ? (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          ⚡ Pemenang Langsung
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Tanpa Skor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Matchup: Tim A vs Tim B */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* Tim A Card */}
                    <div
                      className={`rounded-xl border-2 border-black p-3 flex flex-col justify-between transition-all ${
                        isWinnerA
                          ? "bg-[#ccff00]/30 shadow-[3px_3px_0px_#000] ring-2 ring-[#ccff00]"
                          : "bg-slate-50/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-black">
                            TIM A
                          </span>
                          {isWinnerA && (
                            <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-black text-[#ccff00] border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1 font-mono">
                              👑 MENANG
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 mb-2">
                          {match.teamA.map((p) => {
                            const tier = getTierLabel(p.publicTier);
                            return (
                              <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                                <span className="font-extrabold text-black truncate">{p.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={`text-[8px] font-mono font-bold px-1 rounded border ${
                                      p.gender === "M"
                                        ? "bg-blue-100 text-blue-900 border-blue-400"
                                        : "bg-pink-100 text-pink-900 border-pink-400"
                                    }`}
                                  >
                                    {p.gender === "M" ? "M" : "W"}
                                  </span>
                                  <span className={`text-[8px] font-bold px-1 rounded border border-black/40 ${tier.badgeColor}`}>
                                    {tier.label.replace("Tier ", "")}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tampilan Skor Tim A */}
                      {hasScore && (
                        <div className="pt-2 border-t border-black/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Skor Akhir:</span>
                          <span className="font-mono font-black text-2xl text-black">
                            {match.scoreA}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tim B Card */}
                    <div
                      className={`rounded-xl border-2 border-black p-3 flex flex-col justify-between transition-all ${
                        isWinnerB
                          ? "bg-[#7dd3fc]/30 shadow-[3px_3px_0px_#000] ring-2 ring-[#7dd3fc]"
                          : "bg-slate-50/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-black">
                            TIM B
                          </span>
                          {isWinnerB && (
                            <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-black text-[#7dd3fc] border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1 font-mono">
                              👑 MENANG
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 mb-2">
                          {match.teamB.map((p) => {
                            const tier = getTierLabel(p.publicTier);
                            return (
                              <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                                <span className="font-extrabold text-black truncate">{p.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={`text-[8px] font-mono font-bold px-1 rounded border ${
                                      p.gender === "M"
                                        ? "bg-blue-100 text-blue-900 border-blue-400"
                                        : "bg-pink-100 text-pink-900 border-pink-400"
                                    }`}
                                  >
                                    {p.gender === "M" ? "M" : "W"}
                                  </span>
                                  <span className={`text-[8px] font-bold px-1 rounded border border-black/40 ${tier.badgeColor}`}>
                                    {tier.label.replace("Tier ", "")}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tampilan Skor Tim B */}
                      {hasScore && (
                        <div className="pt-2 border-t border-black/20 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Skor Akhir:</span>
                          <span className="font-mono font-black text-2xl text-black">
                            {match.scoreB}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Bar Bawah: Jika tanpa skor tapi ada pemenang */}
                  {!hasScore && winner && (
                    <div className="flex items-center justify-center p-2 rounded-lg bg-amber-50 border border-amber-300 text-center text-xs font-black uppercase text-amber-950 font-mono">
                      🏆 Pemenang Partai: Tim {winner} ({winner === "A" ? match.teamA.map((p) => p.name).join("/") : match.teamB.map((p) => p.name).join("/")})
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-white border-t-[3px] border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <p className="text-slate-600 font-bold text-center sm:text-left">
            ℹ️ Rekap ini mencakup seluruh duel yang telah selesai dimainkan pada sesi mabar ini.
          </p>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-black text-white font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Tutup Rekap
          </button>
        </div>
      </div>
    </div>
  );
}
