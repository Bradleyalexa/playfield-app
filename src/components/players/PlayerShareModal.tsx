"use client";

import { useState } from "react";
import { X, Download, Share2, Copy, Check, Sparkles, Trophy, Flame } from "lucide-react";
import { Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";
import { StoryCardGenerator } from "../../services/share/story-card";
import { getTierLabel } from "../../core/entities/player";
import { getMatchWinner } from "../../core/entities/match";

interface PlayerShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  session: GameSession;
}

export function PlayerShareModal({ isOpen, onClose, player, session }: PlayerShareModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [customGelar, setCustomGelar] = useState<string>("");

  if (!isOpen || !player) return null;

  // Hitung statistik pemain dari riwayat match di sesi ini
  let matchesPlayed = player.gamesPlayed;
  let matchesWon = 0;
  let totalPoints = 0;
  const partnerCounts: Record<string, number> = {};

  session.matches.forEach((m) => {
    const inTeamA = m.teamA.some((p) => p.id === player.id);
    const inTeamB = m.teamB.some((p) => p.id === player.id);
    const winner = getMatchWinner(m);

    if (inTeamA) {
      totalPoints += m.scoreA;
      if (winner === "A" && m.status === "completed") matchesWon++;
      m.teamA.forEach((partner) => {
        if (partner.id !== player.id) {
          partnerCounts[partner.name] = (partnerCounts[partner.name] || 0) + 1;
        }
      });
    } else if (inTeamB) {
      totalPoints += m.scoreB;
      if (winner === "B" && m.status === "completed") matchesWon++;
      m.teamB.forEach((partner) => {
        if (partner.id !== player.id) {
          partnerCounts[partner.name] = (partnerCounts[partner.name] || 0) + 1;
        }
      });
    }
  });

  // Partner paling sering main bareng
  let bestPartner = "Belum ada partner";
  let maxPartnerCount = 0;
  Object.entries(partnerCounts).forEach(([name, count]) => {
    if (count > maxPartnerCount) {
      maxPartnerCount = count;
      bestPartner = `${name} (${count}x duet)`;
    }
  });

  const effectivePlayed = Math.max(matchesPlayed, 1);
  const winRate = Math.round((matchesWon / effectivePlayed) * 100);
  const tier = getTierLabel(player.publicTier);

  const defaultBadgeTitle =
    matchesWon >= 3
      ? "Suhu Lapangan GOR"
      : winRate >= 60
      ? "Reli Panas Tak Terkalahkan"
      : "Spesialis Penguras Stamina";

  const effectiveGelar = customGelar.trim() || defaultBadgeTitle;

  // Unduh gambar Story Card
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await StoryCardGenerator.generateCard(session, {
        player,
        matchesPlayed: effectivePlayed,
        matchesWon,
        totalPoints,
        badgeTitle: effectiveGelar,
        bestPartnerName: bestPartner !== "Belum ada partner" ? bestPartner : undefined,
      });
      StoryCardGenerator.downloadCard(dataUrl, player.name);
    } catch (err) {
      console.error("Gagal generate kartu story:", err);
      alert("Gagal membuat gambar rekap. Coba lagi!");
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate Teks WhatsApp
  const shareText = `🏸 *PLAYFIELD MABAR RECAP*\n` +
    `👤 *Pemain:* ${player.name} (${player.gender === "M" ? "Men" : "Women"})\n` +
    `🏢 *Sesi:* ${session.title}\n` +
    `🏆 *Tier:* ${tier.label.replace("Tier ", "")} • ${effectiveGelar}\n` +
    `🎮 *Main:* ${effectivePlayed} Match\n` +
    `🥇 *Win Rate:* ${winRate}% (${matchesWon} Menang)\n` +
    `⭐ *Total Poin:* ${totalPoints} Poin\n` +
    `✨ *Partner:* ${bestPartner}\n\n` +
    `Pantau live score & rotasi mabar: ${typeof window !== "undefined" ? window.location.origin : ""}/live/${session.publicSlug}\n` +
    `_Dibuat otomatis via Playfield_`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("Gagal menyalin teks ke clipboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-rose-500 hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-[#00e5ff] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Share2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              Bagikan Rekap Pemain
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Format Neo-Brutalism siap share untuk IG Story & WhatsApp
            </p>
          </div>
        </div>

        {/* Card Preview Neo-Brutalist */}
        <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-black bg-[#ccff00] px-2 py-0.5 rounded border border-black">
              ⚡ PLAYFIELD RECAP
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase truncate max-w-[180px]">
              {session.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-black uppercase">{player.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded border ${
                    player.gender === "M"
                      ? "bg-blue-100 text-blue-900 border-blue-400"
                      : "bg-pink-100 text-pink-900 border-pink-400"
                  }`}
                >
                  {player.gender === "M" ? "👦 MEN (M)" : "👧 WOMEN (W)"}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${tier.badgeColor}`}>
                  {tier.label}
                </span>
              </div>
            </div>

            <div className="h-12 w-12 rounded-xl bg-[#ffde00] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000]">
              <Trophy className="h-6 w-6 stroke-[2]" />
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-xl border-2 border-black bg-[#ccff00]/40 p-2 text-center shadow-[1px_1px_0px_#000]">
              <span className="text-[9px] font-black uppercase text-slate-700 block">Main</span>
              <span className="text-lg font-black font-mono-sport text-black">{effectivePlayed}</span>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#00e5ff]/40 p-2 text-center shadow-[1px_1px_0px_#000]">
              <span className="text-[9px] font-black uppercase text-slate-700 block">Win Rate</span>
              <span className="text-lg font-black font-mono-sport text-black">{winRate}%</span>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#ffde00]/40 p-2 text-center shadow-[1px_1px_0px_#000]">
              <span className="text-[9px] font-black uppercase text-slate-700 block">Poin</span>
              <span className="text-lg font-black font-mono-sport text-black">{totalPoints}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 bg-rose-50 border border-rose-300 rounded-lg p-2">
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Gelar: {effectiveGelar}</span>
          </div>
        </div>

        {/* Form Edit Gelar / Badge Pemain (Host Bisa Rewrite) */}
        <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>✏️ Edit Gelar / Julukan Pemain:</span>
            </label>
            {customGelar && (
              <button
                type="button"
                onClick={() => setCustomGelar("")}
                className="text-[10px] font-bold text-slate-500 hover:text-black underline cursor-pointer"
              >
                Reset Default
              </button>
            )}
          </div>
          <input
            type="text"
            value={customGelar}
            onChange={(e) => setCustomGelar(e.target.value)}
            placeholder={defaultBadgeTitle}
            className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3 py-1.5 text-xs font-black text-black placeholder:text-slate-400 focus:outline-none focus:bg-white"
          />

          {/* Quick Preset Gelar Pills */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[
              "👑 Raja Smash Geledek",
              "🥔 Juara Bertahan Kentang",
              "🏸 Spesialis Reli Panjang",
              "⚡ Paling Gacor Malam Ini",
              "🎯 Raja Netting Tipis",
              "🛡️ Tembok Pertahanan Kokoh",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomGelar(preset)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  customGelar === preset
                    ? "bg-[#ccff00] text-black border-2 border-black font-black shadow-[1px_1px_0px_#000]"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-black"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: WhatsApp, Download IG Story, Copy Text */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Kirim ke WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-black border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#20bd5a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4 stroke-[2.5]" />
            <span>Kirim Rekap ke WhatsApp</span>
          </button>

          {/* Download 1080x1920 Story Card */}
          <button
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] text-black border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>{isDownloading ? "Membuat Gambar..." : "Download Story Card (IG / WA)"}</span>
          </button>

          {/* Salin Teks Rekap */}
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 rounded-xl bg-white text-black border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> : <Copy className="h-4 w-4 stroke-[2.5]" />}
            <span>{isCopied ? "Tersalin ke Clipboard!" : "Salin Teks Rekap"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
