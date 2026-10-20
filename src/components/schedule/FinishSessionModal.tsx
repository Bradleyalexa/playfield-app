"use client";

import { X, Trophy, Flag, AlertTriangle, Users, Package, Award } from "lucide-react";
import { GameSession, calculateEquipmentCost } from "../../core/entities/session";
import { formatRupiah } from "../../lib/utils";

interface FinishSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: () => void;
  session: GameSession;
}

export function FinishSessionModal({
  isOpen,
  onClose,
  onConfirmFinish,
  session,
}: FinishSessionModalProps) {
  if (!isOpen) return null;

  const completedMatches = session.matches.filter((m) => m.status === "completed");
  const inProgressMatches = session.matches.filter((m) => m.status === "in_progress");

  // Hitung MVP (Paling banyak menang & win rate)
  const playerStats = session.players.map((p) => {
    let won = 0;
    let played = p.gamesPlayed;
    session.matches.forEach((m) => {
      if (m.status === "completed") {
        if (m.teamA.some((pl) => pl.id === p.id) && m.scoreA > m.scoreB) won++;
        if (m.teamB.some((pl) => pl.id === p.id) && m.scoreB > m.scoreA) won++;
      }
    });
    const wr = played > 0 ? Math.round((won / played) * 100) : 0;
    return { player: p, won, played, wr };
  });

  playerStats.sort((a, b) => b.won - a.won || b.wr - a.wr);
  const mvp = playerStats[0];

  // Hitung Biaya Equipment
  const equipment = session.sportConfig.equipment;
  const totalEquipmentCost = equipment.enabled ? calculateEquipmentCost(equipment) : 0;
  const costPerPerson =
    session.players.length > 0 ? Math.ceil(totalEquipmentCost / session.players.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-rose-500 hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-[#ffde00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Flag className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              Selesaikan Mabar Hari Ini?
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Tutup sesi dan kunci klasemen podium akhir
            </p>
          </div>
        </div>

        {inProgressMatches.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              Masih ada <strong>{inProgressMatches.length} pertandingan</strong> yang belum selesai di lapangan. Jika mabar diselesaikan sekarang, pertandingan tersebut akan ditandai selesai dengan skor saat ini.
            </span>
          </div>
        )}

        {/* Rangkuman Statistik Sesi Mabar */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-center">
              <span className="text-[10px] font-black uppercase text-slate-600 block">Total Match</span>
              <span className="text-2xl font-black font-mono-sport text-black">
                {completedMatches.length} Game
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-center">
              <span className="text-[10px] font-black uppercase text-slate-600 block">Total Ronde</span>
              <span className="text-2xl font-black font-mono-sport text-black">
                #{session.currentRound} Ronde
              </span>
            </div>
          </div>

          {/* MVP Highlight */}
          {mvp && mvp.played > 0 && (
            <div className="p-3.5 rounded-xl bg-[#ccff00] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-black text-[#ccff00] flex items-center justify-center font-black">
                  <Award className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-black block">
                    👑 MVP / PEMAIN PALING GACOR
                  </span>
                  <span className="text-sm font-black text-black uppercase">{mvp.player.name}</span>
                </div>
              </div>
              <div className="text-right font-mono text-xs font-black text-black">
                <span>{mvp.won} Menang ({mvp.wr}%)</span>
              </div>
            </div>
          )}

          {/* Rekap Patungan Cock / Bola */}
          {equipment.enabled && (
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-1.5 text-xs font-bold text-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-black/10">
                <span className="flex items-center gap-1.5 font-black uppercase">
                  <Package className="h-3.5 w-3.5" />
                  <span>Rekap Kok & Biaya</span>
                </span>
                <span className="font-mono font-black text-black">
                  {equipment.pricingModel === "per_slop"
                    ? `${equipment.slopUsed || 1} Slop Terpakai`
                    : `${equipment.totalUsed || 0} Butir Terpakai`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Biaya Kok:</span>
                <span className="font-mono font-black text-black">{formatRupiah(totalEquipmentCost)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-800 font-black">
                <span>Estimasi Patungan ({session.players.length} Pemain):</span>
                <span className="font-mono bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-400">
                  {formatRupiah(costPerPerson)} / org
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Lanjut Main
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmFinish();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#ff0055] text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#e6004c] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span>Ya, Selesaikan Mabar 🏁</span>
          </button>
        </div>
      </div>
    </div>
  );
}
