"use client";

import { useState } from "react";
import { Pause, Play, Share2, ClipboardPaste, Plus } from "lucide-react";
import { getTierLabel, Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";
import { StoryCardGenerator } from "../../services/share/story-card";

interface PlayerRosterProps {
  session: GameSession;
  onTogglePlayerPause: (playerId: string) => void;
  onOpenWaModal: () => void;
  onAddSinglePlayer: (name: string, gender: "M" | "F", skillLevel: 1 | 2 | 3) => void;
}

export function PlayerRoster({
  session,
  onTogglePlayerPause,
  onOpenWaModal,
  onAddSinglePlayer,
}: PlayerRosterProps) {
  const [quickName, setQuickName] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState<string | null>(null);

  // Cari siapa saja yang sedang bermain di lapangan
  const activePlayingIds = new Set<string>();
  session.matches.forEach((m) => {
    if (m.status === "in_progress") {
      m.teamA.forEach((p) => activePlayingIds.add(p.id));
      m.teamB.forEach((p) => activePlayingIds.add(p.id));
    }
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onAddSinglePlayer(quickName.trim(), "M", 2);
    setQuickName("");
  };

  const handleGenerateStory = async (player: Player) => {
    setIsGeneratingStory(player.id);
    try {
      let matchesPlayed = player.gamesPlayed;
      let matchesWon = 0;
      let totalPoints = 0;

      session.matches.forEach((m) => {
        const inTeamA = m.teamA.some((p) => p.id === player.id);
        const inTeamB = m.teamB.some((p) => p.id === player.id);

        if (inTeamA) {
          totalPoints += m.scoreA;
          if (m.scoreA > m.scoreB && m.status === "completed") matchesWon++;
        } else if (inTeamB) {
          totalPoints += m.scoreB;
          if (m.scoreB > m.scoreA && m.status === "completed") matchesWon++;
        }
      });

      const dataUrl = await StoryCardGenerator.generateCard(session, {
        player,
        matchesPlayed: Math.max(matchesPlayed, 1),
        matchesWon,
        totalPoints,
        badgeTitle: matchesWon >= 3 ? "Suhu Lapangan GOR" : "Spesialis Reli Panjang",
        bestPartnerName: "Hendra & Budi",
      });

      StoryCardGenerator.downloadCard(dataUrl, player.name);
    } catch (err) {
      console.error("Gagal generate IG Story:", err);
    } finally {
      setIsGeneratingStory(null);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
      {/* Header Roster */}
      <div className="flex items-center justify-between pb-3 border-b-3 border-black mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-black uppercase tracking-wide">
              Daftar Pemain ({session.players.length})
            </h3>
            <span className="rounded bg-[#ccff00] px-2 py-0.5 text-[11px] font-black text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              {activePlayingIds.size} DI LAPANGAN
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Pemain cadangan otomatis dirotasi pada ronde berikutnya berdasarkan jatah main.
          </p>
        </div>

        <button
          onClick={onOpenWaModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] border-2 border-black px-3.5 py-1.5 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all"
        >
          <ClipboardPaste className="h-4 w-4 stroke-[2.5]" />
          <span>Paste Chat WA</span>
        </button>
      </div>

      {/* Form Tambah Cepat Pemain */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Ketik nama pemain dummy (contoh: Joko, Agus)..."
          className="flex-1 rounded-xl bg-[#faf8f2] border-2 border-black px-3.5 py-2 text-xs font-bold text-black placeholder-slate-500 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-xl bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah</span>
        </button>
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
                  ? "bg-slate-200/60 opacity-60 shadow-none"
                  : "bg-[#faf8f2] hover:bg-white shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs truncate text-black">{player.name}</span>
                  <span className="text-[10px] font-bold text-slate-500">({player.gender})</span>
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

              {/* Action Buttons: Pause & Story Card */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTogglePlayerPause(player.id)}
                  title={isPaused ? "Lanjutkan main (Resume)" : "Tahan pemain (Pause)"}
                  className={`h-7 w-7 rounded border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                    isPaused ? "bg-[#ffde00] text-black" : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  {isPaused ? <Play className="h-3 w-3 stroke-[3]" /> : <Pause className="h-3 w-3 stroke-[3]" />}
                </button>

                <button
                  onClick={() => handleGenerateStory(player)}
                  disabled={isGeneratingStory === player.id}
                  title="Generate Spotify-Wrapped IG Story Card"
                  className="h-7 w-7 rounded border-2 border-black bg-white flex items-center justify-center text-black hover:bg-[#ccff00] shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Share2 className="h-3 w-3 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
