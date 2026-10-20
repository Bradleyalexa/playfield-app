"use client";

import { useState } from "react";
import { UserCheck, Pause, Play, Share2, ClipboardPaste, Plus, UserMinus } from "lucide-react";
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
      // Hitung statistik player dari riwayat matches
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
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      {/* Header Roster */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Daftar Pemain ({session.players.length})</h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              {activePlayingIds.size} Di Lapangan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pemain cadangan otomatis dirotasi pada ronde berikutnya berdasarkan jatah main.
          </p>
        </div>

        <button
          onClick={onOpenWaModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 active:scale-95 transition-all"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          <span>Paste Chat WA</span>
        </button>
      </div>

      {/* Form Tambah Cepat Pemain */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Tambah nama pemain (contoh: Joko, Agus)..."
          className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-colors border border-slate-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah</span>
        </button>
      </form>

      {/* List Pemain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {session.players.map((player) => {
          const isPlaying = activePlayingIds.has(player.id);
          const isPaused = player.status === "paused";
          const tier = getTierLabel(player.publicTier);

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isPlaying
                  ? "bg-emerald-950/20 border-emerald-500/30 text-white"
                  : isPaused
                  ? "bg-slate-950/60 border-slate-800/80 opacity-60 text-slate-500"
                  : "bg-slate-800/40 border-slate-700/40 text-slate-200 hover:border-slate-600"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs truncate text-white">{player.name}</span>
                  <span className="text-[10px] text-slate-400">({player.gender})</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${tier.badgeColor}`}>
                    {tier.label.replace("Tier ", "")}
                  </span>
                  <span className="text-[10px] text-slate-400">{player.gamesPlayed}x Main</span>
                </div>
              </div>

              {/* Action Buttons: Pause & Story Card */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTogglePlayerPause(player.id)}
                  title={isPaused ? "Lanjutkan main (Resume)" : "Tahan pemain (Pause: kram/telat/istirahat)"}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                    isPaused
                      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>

                <button
                  onClick={() => handleGenerateStory(player)}
                  disabled={isGeneratingStory === player.id}
                  title="Generate Spotify-Wrapped IG Story Card"
                  className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                >
                  <Share2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
