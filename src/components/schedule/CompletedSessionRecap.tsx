"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Share2, Award, Package, RotateCcw, PlusCircle, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { GameSession, calculateEquipmentCost } from "../../core/entities/session";
import { formatRupiah } from "../../lib/utils";
import { getTierLabel } from "../../core/entities/player";

interface CompletedSessionRecapProps {
  session: GameSession;
  isHost?: boolean;
  onReopenSession?: () => void;
}

export function CompletedSessionRecap({
  session,
  isHost = false,
  onReopenSession,
}: CompletedSessionRecapProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Hitung statistik seluruh pemain
  const playerStats = session.players.map((p) => {
    let won = 0;
    let totalPoints = 0;
    session.matches.forEach((m) => {
      if (m.status === "completed") {
        if (m.teamA.some((pl) => pl.id === p.id)) {
          totalPoints += m.scoreA;
          if (m.scoreA > m.scoreB) won++;
        }
        if (m.teamB.some((pl) => pl.id === p.id)) {
          totalPoints += m.scoreB;
          if (m.scoreB > m.scoreA) won++;
        }
      }
    });
    const wr = p.gamesPlayed > 0 ? Math.round((won / p.gamesPlayed) * 100) : 0;
    return { player: p, won, played: p.gamesPlayed, wr, totalPoints };
  });

  // Sort by win rate, then wins, then points
  playerStats.sort((a, b) => b.won - a.won || b.wr - a.wr || b.totalPoints - a.totalPoints);

  const firstPlace = playerStats[0];
  const secondPlace = playerStats[1];
  const thirdPlace = playerStats[2];

  const completedMatches = session.matches.filter((m) => m.status === "completed");
  const equipment = session.sportConfig.equipment;
  const totalEquipmentCost = equipment.enabled ? calculateEquipmentCost(equipment) : 0;
  const costPerPerson =
    session.players.length > 0 ? Math.ceil(totalEquipmentCost / session.players.length) : 0;

  // Format pesan WhatsApp
  const generateWaSummary = () => {
    let text = `🏸 *HASIL AKHIR MABAR PLAYFIELD*\n` +
      `🏢 *Sesi:* ${session.title}\n` +
      `📅 *Ronde:* #${session.currentRound} (${completedMatches.length} Match Selesai)\n\n` +
      `🏆 *PODIUM JUARA MABAR:*\n`;

    if (firstPlace) {
      text += `🥇 *Juara 1:* ${firstPlace.player.name} (${firstPlace.won} Menang • WR ${firstPlace.wr}%)\n`;
    }
    if (secondPlace) {
      text += `🥈 *Juara 2:* ${secondPlace.player.name} (${secondPlace.won} Menang • WR ${secondPlace.wr}%)\n`;
    }
    if (thirdPlace) {
      text += `🥉 *Juara 3:* ${thirdPlace.player.name} (${thirdPlace.won} Menang • WR ${thirdPlace.wr}%)\n\n`;
    }

    if (equipment.enabled) {
      text += `📦 *Rekap Kok & Biaya:*\n` +
        `• Kok Terpakai: ${equipment.pricingModel === "per_slop" ? `${equipment.slopUsed || 1} Slop` : `${equipment.totalUsed || 0} Butir`}\n` +
        `• Total Biaya: ${formatRupiah(totalEquipmentCost)}\n` +
        `• Patungan / Org: *${formatRupiah(costPerPerson)}*\n\n`;
    }

    text += `Terima kasih semuanya yang sudah mabar malam ini! Sampai jumpa di mabar berikutnya! 🔥\n` +
      `_Dikelola otomatis via Playfield_`;
    return text;
  };

  const handleShareWa = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generateWaSummary())}`;
    window.open(url, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateWaSummary());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 } });
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Banner Utama Selebrasi Selesai */}
      <div className="rounded-3xl border-4 border-black bg-[#ffde00] p-6 sm:p-8 shadow-[8px_8px_0px_#000] text-center flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-2xl bg-black text-[#ccff00] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
          <Trophy className="h-10 w-10 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-black bg-[#ccff00] px-3 py-1 rounded-full border-2 border-black inline-block mb-2">
            SESI MABAR RESMI SELESAI
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            {session.title}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 max-w-md mx-auto">
            Terima kasih kepada seluruh pemain yang telah bertanding sportif. Sampai jumpa di mabar berikutnya!
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="flex items-center gap-1.5 rounded-xl bg-black text-[#ccff00] px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer mt-1"
        >
          <span>🎉 Rayakan Confetti</span>
        </button>
      </div>

      {/* Podium 3 Besar (Emas, Perak, Perunggu) */}
      <div className="rounded-3xl border-4 border-black bg-white p-5 sm:p-7 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center justify-between pb-3 border-b-3 border-black mb-6">
          <h2 className="text-base sm:text-lg font-black uppercase text-black flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600 stroke-[2.5]" />
            <span>Podium Kehormatan Mabar</span>
          </h2>
          <span className="text-xs font-mono font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-black">
            {completedMatches.length} Pertandingan
          </span>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Juara 2 (Perak) */}
          {secondPlace && (
            <div className="order-2 sm:order-1 flex flex-col items-center rounded-2xl border-3 border-black bg-[#f1f5f9] p-4 shadow-[4px_4px_0px_#000] text-center">
              <span className="text-3xl mb-1">🥈</span>
              <span className="text-xs font-black uppercase text-slate-600">JUARA 2</span>
              <h3 className="text-base sm:text-lg font-black text-black uppercase truncate max-w-full mt-1">
                {secondPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-black font-mono-sport">
                <span className="bg-white px-2 py-0.5 rounded border border-black">
                  {secondPlace.won} Menang
                </span>
                <span className="bg-[#7dd3fc] px-2 py-0.5 rounded border border-black">
                  WR {secondPlace.wr}%
                </span>
              </div>
            </div>
          )}

          {/* Juara 1 (Emas / MVP Paling Tinggi) */}
          {firstPlace && (
            <div className="order-1 sm:order-2 flex flex-col items-center rounded-2xl border-4 border-black bg-[#ccff00] p-5 sm:p-6 shadow-[6px_6px_0px_#000] text-center scale-105 sm:-translate-y-2">
              <span className="text-5xl mb-1">👑</span>
              <span className="text-xs font-black uppercase tracking-wider text-black bg-black text-[#ccff00] px-2.5 py-0.5 rounded-full mb-1">
                JUARA 1 • MVP
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-black uppercase truncate max-w-full">
                {firstPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-3 text-xs sm:text-sm font-black font-mono-sport">
                <span className="bg-white px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                  {firstPlace.won} Menang
                </span>
                <span className="bg-[#ffde00] px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                  WR {firstPlace.wr}%
                </span>
              </div>
            </div>
          )}

          {/* Juara 3 (Perunggu) */}
          {thirdPlace && (
            <div className="order-3 flex flex-col items-center rounded-2xl border-3 border-black bg-[#fef3c7] p-4 shadow-[4px_4px_0px_#000] text-center">
              <span className="text-3xl mb-1">🥉</span>
              <span className="text-xs font-black uppercase text-amber-800">JUARA 3</span>
              <h3 className="text-base sm:text-lg font-black text-black uppercase truncate max-w-full mt-1">
                {thirdPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-black font-mono-sport">
                <span className="bg-white px-2 py-0.5 rounded border border-black">
                  {thirdPlace.won} Menang
                </span>
                <span className="bg-amber-200 px-2 py-0.5 rounded border border-black">
                  WR {thirdPlace.wr}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rangkuman Finansial Patungan Cock (Jika Enabled) */}
      {equipment.enabled && (
        <div className="rounded-2xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
              <Package className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-600 block">
                REKAP PATUNGAN COCK / BOLA
              </span>
              <span className="text-sm sm:text-base font-black text-black">
                {equipment.pricingModel === "per_slop"
                  ? `${equipment.slopUsed || 1} Slop (${formatRupiah(totalEquipmentCost)})`
                  : `${equipment.totalUsed || 0} Butir (${formatRupiah(totalEquipmentCost)})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#faf8f2] border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-bold text-slate-700">Patungan per Pemain:</span>
            <span className="text-base font-black font-mono-sport text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-400">
              {formatRupiah(costPerPerson)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons: WhatsApp Summary, Copy, Reopen, Create New */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWa}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-black border-2 sm:border-3 border-black px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:bg-[#20bd5a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4 stroke-[2.5]" />
            <span>Kirim Rekap ke Grup WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white text-black border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Salin rekap teks ke clipboard"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> : <span className="text-sm">📋</span>}
            <span>{isCopied ? "Tersalin!" : "Salin"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Reopen Session Khusus Host */}
          {isHost && onReopenSession && (
            <button
              onClick={onReopenSession}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border-2 border-black px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-slate-200 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Aktifkan kembali sesi jika mabar belum benar-benar selesai"
            >
              <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Buka Kembali Sesi</span>
            </button>
          )}

          <Link
            href="/"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-black text-[#ccff00] border-2 sm:border-3 border-black px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Bikin Sesi Baru</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
