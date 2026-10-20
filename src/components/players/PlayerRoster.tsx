"use client";

import { useState } from "react";
import { Pause, Play, Share2, ClipboardPaste, Plus, UserCheck, Shield, Trash2 } from "lucide-react";
import { getTierLabel, Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";
import { PlayerShareModal } from "./PlayerShareModal";

interface PlayerRosterProps {
  session: GameSession;
  onTogglePlayerPause: (playerId: string) => void;
  onOpenWaModal: () => void;
  onAddSinglePlayer: (name: string, gender: "M" | "F", skillLevel: 1 | 2 | 3) => void;
  onRemovePlayer?: (playerId: string) => void;
}

export function PlayerRoster({
  session,
  onTogglePlayerPause,
  onOpenWaModal,
  onAddSinglePlayer,
  onRemovePlayer,
}: PlayerRosterProps) {
  const [quickName, setQuickName] = useState("");
  const [selectedGender, setSelectedGender] = useState<"M" | "F">("M");
  const [selectedSkill, setSelectedSkill] = useState<1 | 2 | 3>(2);
  const [sharingPlayer, setSharingPlayer] = useState<Player | null>(null);

  // Cari siapa saja yang sedang bermain di lapangan
  const activePlayingIds = new Set<string>();
  session.matches.forEach((m) => {
    if (m.status === "in_progress") {
      m.teamA.forEach((p) => activePlayingIds.add(p.id));
      m.teamB.forEach((p) => activePlayingIds.add(p.id));
    }
  });

  const maleCount = session.players.filter((p) => p.gender === "M").length;
  const femaleCount = session.players.filter((p) => p.gender === "F").length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onAddSinglePlayer(quickName.trim(), selectedGender, selectedSkill);
    setQuickName("");
  };

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleTogglePauseWithFeedback = (playerId: string) => {
    const target = session.players.find((p) => p.id === playerId);
    if (!target) return;
    const isNowPaused = target.status !== "paused";
    onTogglePlayerPause(playerId);
    setToastMsg(
      isNowPaused
        ? `⏸️ ${target.name} diistirahatkan (dilewati rotasi ronde depan)`
        : `▶️ ${target.name} siap main kembali di ronde depan!`
    );
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="flex flex-col rounded-2xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
      {/* Toast Feedback Aksi Pemain untuk Mobile */}
      {toastMsg && (
        <div className="mb-3 rounded-xl bg-black text-[#ccff00] px-3.5 py-2 text-xs font-black border-2 border-black shadow-[3px_3px_0px_#ccff00] flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-white hover:text-rose-400 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Roster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black mb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-black uppercase tracking-wide">
              Daftar Pemain ({session.players.length})
            </h3>
            <span className="rounded bg-[#ccff00] px-2 py-0.5 text-[11px] font-black text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              {activePlayingIds.size} DI LAPANGAN
            </span>
            <span className="font-mono text-xs font-bold text-black/70 bg-[#faf8f2] px-2 py-0.5 rounded border border-black">
              {maleCount} Men (M) • {femaleCount} Women (W)
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Pemain cadangan otomatis dirotasi pada ronde berikutnya berdasarkan algoritma mabar.
          </p>
        </div>

        <button
          onClick={onOpenWaModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] border-2 border-black px-3.5 py-1.5 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer shrink-0"
        >
          <ClipboardPaste className="h-4 w-4 stroke-[2.5]" />
          <span>Paste Chat WA</span>
        </button>
      </div>

      {/* Panduan Ikon Aksi Pemain (Sangat Membantu di Smartphone karena Tidak Bisa Hover) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 p-2 rounded-xl bg-[#faf8f2] border-2 border-black text-[10px] sm:text-xs font-bold text-slate-800 shadow-[2px_2px_0px_#000]">
        <span className="font-black uppercase bg-[#ccff00] text-black px-2.5 py-0.5 rounded-lg border-2 border-black text-[10px] font-mono tracking-wider shadow-[1.5px_1.5px_0px_#000]">
          PANDUAN IKON
        </span>
        <span className="inline-flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">⏸️ Pause:</span> Rehatkan (Dilewati rotasi)
        </span>
        <span className="inline-flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">▶️ Play:</span> Siap main lagi
        </span>
        <span className="inline-flex items-center gap-1 bg-[#00e5ff]/40 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">🔄 Share:</span> Rekap WA / Story IG
        </span>
        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-400 text-rose-800 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">🗑️ Hapus:</span> Keluar grup
        </span>
      </div>

      {/* Form Tambah Pemain dengan Pilihan Gender (Men/Women) & Skill Tier */}
      <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2 mb-4 p-3 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000]">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Ketik nama pemain dummy (contoh: Joko, Maya, Dedi)..."
            className="flex-1 rounded-lg bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Gender Toggle: Men (M) vs Women (W) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedGender("M")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
              selectedGender === "M"
                ? "bg-blue-200 text-blue-950 shadow-[2px_2px_0px_#000]"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            👦 Men (M)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("F")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
              selectedGender === "F"
                ? "bg-pink-200 text-pink-950 shadow-[2px_2px_0px_#000]"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            👧 Women (W)
          </button>
        </div>

        {/* Skill Tier Selector */}
        <div className="flex items-center gap-1">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(Number(e.target.value) as 1 | 2 | 3)}
            className="rounded-lg bg-white border-2 border-black px-2.5 py-1.5 text-xs font-bold text-black cursor-pointer shadow-[1px_1px_0px_#000]"
          >
            <option value={1}>Tier Kentang (Pemula)</option>
            <option value={2}>Tier Hore (Menengah)</option>
            <option value={3}>Tier Suhu (Mahir/Pro)</option>
          </select>

          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-black text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {/* Grid Pemain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {session.players.map((player) => {
          const isPlaying = activePlayingIds.has(player.id);
          const isPaused = player.status === "paused";
          const tier = getTierLabel(player.publicTier);

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black transition-all ${
                isPlaying
                  ? "bg-[#ccff00]/25 shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : isPaused
                  ? "bg-slate-200/80 border-dashed opacity-80 shadow-none"
                  : "bg-[#faf8f2] hover:bg-white shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs truncate text-black">{player.name}</span>
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                      player.gender === "M"
                        ? "bg-blue-100 text-blue-900 border-blue-400"
                        : "bg-pink-100 text-pink-900 border-pink-400"
                    }`}
                  >
                    {player.gender === "M" ? "M" : "W"}
                  </span>
                  {/* Status Badge Langsung Terlihat di HP */}
                  {isPaused ? (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#ffde00] border border-black text-black">
                      ⏸️ Rehat
                    </span>
                  ) : isPlaying ? (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#ccff00] border border-black text-black">
                      🔥 Di Lapangan
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 font-mono-sport">
                    {player.gamesPlayed}x Main
                  </span>
                </div>
              </div>

              {/* Action Buttons: Pause, Share Story Card & Remove */}
              <div className="flex items-center gap-1.5 sm:gap-1 shrink-0">
                {/* Tombol Play/Pause (Tahan / Lanjutkan Pemain) */}
                <button
                  onClick={() => handleTogglePauseWithFeedback(player.id)}
                  title={
                    isPaused
                      ? "Play: Aktifkan pemain kembali siap masuk lapangan"
                      : "Pause: Rehatkan pemain (toilet/cedera/lelah) agar dilewati rotasi ronde depan"
                  }
                  className={`h-8 w-8 sm:h-7 sm:w-7 rounded-lg border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                    isPaused ? "bg-[#ffde00] text-black" : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5 stroke-[3]" /> : <Pause className="h-3.5 w-3.5 stroke-[3]" />}
                </button>

                {/* Tombol Share (Buka Modal Share Rekap Pemain) */}
                <button
                  onClick={() => setSharingPlayer(player)}
                  title={`Bagikan rekap mabar & Story Card ${player.name}`}
                  className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg border-2 border-black bg-[#00e5ff] flex items-center justify-center text-black hover:bg-[#00cce6] shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>

                {/* Tombol Remove Player (Hapus Pemain dari Roster) */}
                {onRemovePlayer && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus ${player.name} dari daftar pemain mabar?`)) {
                        onRemovePlayer(player.id);
                      }
                    }}
                    title={`Hapus ${player.name} dari daftar pemain`}
                    className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg border-2 border-black bg-white flex items-center justify-center text-rose-600 hover:bg-rose-500 hover:text-white shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Share Pemain (Neo-Brutalism & WhatsApp Share) */}
      <PlayerShareModal
        isOpen={!!sharingPlayer}
        onClose={() => setSharingPlayer(null)}
        player={sharingPlayer}
        session={session}
      />
    </div>
  );
}
