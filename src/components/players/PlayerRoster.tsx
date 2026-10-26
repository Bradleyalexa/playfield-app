"use client";

import { useState } from "react";
import { Pause, Play, Share2, ClipboardPaste, Plus, UserCheck, Trash2, Clock, Pencil, X } from "lucide-react";
import { getTierLabel, getTierFromSkill, Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";
import { PlayerShareModal } from "./PlayerShareModal";

interface PlayerRosterProps {
  session: GameSession;
  onTogglePlayerPause: (playerId: string) => void;
  onOpenWaModal: () => void;
  onAddSinglePlayer: (name: string, gender: "M" | "F", skillLevel: 1 | 2 | 3) => void;
  onRemovePlayer?: (playerId: string) => void;
  onTogglePlayerArrival?: (playerId: string) => void;
  onMarkAllArrived?: () => void;
  onMarkAllNotArrived?: () => void;
  onUpdatePlayer?: (player: Player) => void;
}

export function PlayerRoster({
  session,
  onTogglePlayerPause,
  onOpenWaModal,
  onAddSinglePlayer,
  onRemovePlayer,
  onTogglePlayerArrival,
  onMarkAllArrived,
  onMarkAllNotArrived,
  onUpdatePlayer,
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
  const arrivedCount = session.players.filter((p) => p.isArrived !== false).length;
  const notArrivedCount = session.players.filter((p) => p.isArrived === false).length;

  // Filter Tab Roster
  const [filterTab, setFilterTab] = useState<"all" | "playing" | "resting" | "paused" | "not_arrived">("all");
  const restingCount = session.players.filter(
    (p) => !activePlayingIds.has(p.id) && p.status !== "paused" && p.isArrived !== false
  ).length;
  const pausedCount = session.players.filter((p) => p.status === "paused").length;

  const filteredPlayers = session.players.filter((p) => {
    if (filterTab === "playing") return activePlayingIds.has(p.id);
    if (filterTab === "resting") return !activePlayingIds.has(p.id) && p.status !== "paused" && p.isArrived !== false;
    if (filterTab === "paused") return p.status === "paused";
    if (filterTab === "not_arrived") return p.isArrived === false;
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onAddSinglePlayer(quickName.trim(), selectedGender, selectedSkill);
    setQuickName("");
  };

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Edit Player State
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<"M" | "F">("M");
  const [editSkill, setEditSkill] = useState<1 | 2 | 3>(2);
  const [editArrived, setEditArrived] = useState(true);

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditGender(player.gender);
    setEditSkill(player.skillLevel);
    setEditArrived(player.isArrived !== false);
  };

  const handleSaveEditPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !editName.trim()) return;
    const updated: Player = {
      ...editingPlayer,
      name: editName.trim(),
      gender: editGender,
      skillLevel: editSkill,
      publicTier: getTierFromSkill(editSkill),
      eloRating: 1000 + (editSkill - 2) * 100,
      isArrived: editArrived,
    };
    onUpdatePlayer?.(updated);
    setToastMsg(`✅ Data "${updated.name}" berhasil diperbarui!`);
    setTimeout(() => setToastMsg(null), 3500);
    setEditingPlayer(null);
  };

  // 1-Click Fast Toggle Gender (M <-> W)
  const handleTogglePlayerGender = (player: Player) => {
    const nextGender = player.gender === "M" ? "F" : "M";
    const updated: Player = { ...player, gender: nextGender };
    onUpdatePlayer?.(updated);
    setToastMsg(`Gender ${player.name} diubah jadi ${nextGender === "M" ? "👦 Men (M)" : "👧 Women (W)"}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1-Click Fast Cycle Skill Level (Beginner -> Intermediate -> Advanced)
  const handleCyclePlayerSkill = (player: Player) => {
    const nextSkill = (player.skillLevel === 1 ? 2 : player.skillLevel === 2 ? 3 : 1) as 1 | 2 | 3;
    const updated: Player = {
      ...player,
      skillLevel: nextSkill,
      publicTier: getTierFromSkill(nextSkill),
      eloRating: 1000 + (nextSkill - 2) * 100,
    };
    onUpdatePlayer?.(updated);
    const tier = getTierLabel(updated.publicTier);
    setToastMsg(`Level ${player.name} diubah jadi ${tier.label}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

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

  const handleToggleArrivalWithFeedback = (playerId: string) => {
    const target = session.players.find((p) => p.id === playerId);
    if (!target) return;
    const willBeArrived = target.isArrived === false;
    onTogglePlayerArrival?.(playerId);
    setToastMsg(
      willBeArrived
        ? `✅ ${target.name} telah check-in hadir (siap masuk jadwal rotasi)!`
        : `⏳ ${target.name} ditandai belum tiba (OTW).`
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
              {arrivedCount} Hadir {notArrivedCount > 0 ? `• ${notArrivedCount} OTW` : ""}
            </span>
            <span className="font-mono text-xs font-bold text-black/60 bg-[#faf8f2] px-2 py-0.5 rounded border border-black">
              {maleCount} M • {femaleCount} W
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Hanya pemain yang sudah check-in hadir yang dirotasi ke lapangan oleh algoritma mabar.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {notArrivedCount > 0 && onMarkAllArrived && (
            <button
              type="button"
              onClick={onMarkAllArrived}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-300 border-2 border-black px-3 py-1.5 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer shrink-0 hover:bg-emerald-400"
              title="Tandai semua pemain sudah tiba di lokasi GOR"
            >
              <UserCheck className="h-4 w-4 stroke-[2.5]" />
              <span>Hadir Semua ({notArrivedCount})</span>
            </button>
          )}

          {arrivedCount > 0 && onMarkAllNotArrived && (
            <button
              type="button"
              onClick={onMarkAllNotArrived}
              className="flex items-center gap-1.5 rounded-lg bg-[#ffde00] border-2 border-black px-3 py-1.5 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer shrink-0 hover:bg-amber-300"
              title="Setel semua pemain berstatus belum tiba (OTW)"
            >
              <Clock className="h-4 w-4 stroke-[2.5]" />
              <span>Semua OTW ({arrivedCount})</span>
            </button>
          )}

          <button
            onClick={onOpenWaModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#ccff00] border-2 border-black px-3.5 py-1.5 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer shrink-0"
          >
            <ClipboardPaste className="h-4 w-4 stroke-[2.5]" />
            <span>Paste Chat WA</span>
          </button>
        </div>
      </div>

      {/* Panduan Ikon Aksi Pemain */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 p-2 rounded-xl bg-[#faf8f2] border-2 border-black text-[10px] sm:text-xs font-bold text-slate-800 shadow-[2px_2px_0px_#000]">
        <span className="font-black uppercase bg-[#ccff00] text-black px-2.5 py-0.5 rounded-lg border-2 border-black text-[10px] font-mono tracking-wider shadow-[1.5px_1.5px_0px_#000]">
          PANDUAN IKON
        </span>
        <span className="inline-flex items-center gap-1 bg-blue-100 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">👦/👧 M/W:</span> Klik ubah Gender
        </span>
        <span className="inline-flex items-center gap-1 bg-[#fef08a] border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">🏆 Level ▾:</span> Klik ganti Level
        </span>
        <span className="inline-flex items-center gap-1 bg-amber-100 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">⏳ OTW:</span> Belum tiba di GOR
        </span>
        <span className="inline-flex items-center gap-1 bg-emerald-100 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">✅ Hadir:</span> Sudah siap main
        </span>
        <span className="inline-flex items-center gap-1 bg-amber-200 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">✏️ Edit:</span> Ubah Nama/Data
        </span>
        <span className="inline-flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">⏸️ Pause:</span> Rehatkan
        </span>
        <span className="inline-flex items-center gap-1 bg-[#00e5ff]/40 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">🔄 Share:</span> Story Card
        </span>
        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-400 text-rose-800 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          <span className="font-black">🗑️ Hapus:</span> Keluar
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
            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Advanced</option>
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

      {/* Tab Filter Roster */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-2 border-b border-black/10">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
            filterTab === "all"
              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
              : "bg-white text-black hover:bg-slate-50"
          }`}
        >
          Semua ({session.players.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("playing")}
          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
            filterTab === "playing"
              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
              : "bg-white text-black hover:bg-slate-50"
          }`}
        >
          🔥 Sedang Main ({activePlayingIds.size})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("resting")}
          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
            filterTab === "resting"
              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
              : "bg-white text-black hover:bg-slate-50"
          }`}
        >
          ☕ Istirahat ({restingCount})
        </button>
        {pausedCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterTab("paused")}
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              filterTab === "paused"
                ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                : "bg-white text-black hover:bg-slate-50"
            }`}
          >
            ⏸️ Rehat ({pausedCount})
          </button>
        )}
        {notArrivedCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterTab("not_arrived")}
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              filterTab === "not_arrived"
                ? "bg-[#ffde00] text-black shadow-[2px_2px_0px_#000]"
                : "bg-amber-100 text-amber-950 hover:bg-amber-200"
            }`}
          >
            ⏳ Belum Tiba ({notArrivedCount})
          </button>
        )}
      </div>

      {/* Grid Pemain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs font-bold text-slate-500 italic bg-[#faf8f2] rounded-xl border-2 border-dashed border-black/30">
            Tidak ada pemain dalam kategori ini.
          </div>
        ) : (
          filteredPlayers.map((player) => {
          const isPlaying = activePlayingIds.has(player.id);
          const isPaused = player.status === "paused";
          const isArrived = player.isArrived !== false;
          const tier = getTierLabel(player.publicTier);

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black transition-all ${
                !isArrived
                  ? "bg-amber-50/70 border-dashed border-amber-500 shadow-none"
                  : isPlaying
                  ? "bg-[#ccff00]/25 shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : isPaused
                  ? "bg-slate-200/80 border-dashed opacity-80 shadow-none"
                  : "bg-[#faf8f2] hover:bg-white shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs truncate text-black">{player.name}</span>
                  {/* Tombol Toggle Gender (M <-> W) 1-Click */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlayerGender(player)}
                    title={`Klik untuk ganti Gender ${player.name} (${player.gender === "M" ? "Pria/Men" : "Wanita/Women"})`}
                    className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border-2 border-black transition-all cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:scale-105 ${
                      player.gender === "M"
                        ? "bg-blue-200 text-blue-950 hover:bg-blue-300"
                        : "bg-pink-200 text-pink-950 hover:bg-pink-300"
                    }`}
                  >
                    {player.gender === "M" ? "👦 M" : "👧 W"}
                  </button>

                  {/* Selector Kehadiran: Hadir vs OTW (Bisa Diubah Kapan Saja) */}
                  <div className="flex items-center rounded-lg border-2 border-black bg-white overflow-hidden shadow-[1px_1px_0px_#000] shrink-0">
                    <button
                      type="button"
                      onClick={() => !isArrived && handleToggleArrivalWithFeedback(player.id)}
                      className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all cursor-pointer ${
                        isArrived
                          ? "bg-[#ccff00] text-black"
                          : "bg-white text-slate-400 hover:text-black hover:bg-slate-50"
                      }`}
                      title={`Tandai ${player.name} Hadir di GOR`}
                    >
                      ✅ Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => isArrived && handleToggleArrivalWithFeedback(player.id)}
                      className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all border-l border-black cursor-pointer ${
                        !isArrived
                          ? "bg-[#ffde00] text-black"
                          : "bg-white text-slate-400 hover:text-black hover:bg-slate-50"
                      }`}
                      title={`Tandai ${player.name} Belum Tiba (OTW)`}
                    >
                      ⏳ OTW
                    </button>
                  </div>

                  {/* Status Lapangan / Rehat */}
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
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {/* Tombol Cycle Level: Beg -> Int -> Adv 1-Click */}
                  <button
                    type="button"
                    onClick={() => handleCyclePlayerSkill(player)}
                    title={`Klik untuk ubah Level ${player.name}: saat ini ${tier.label} (Beginner → Intermediate → Advanced)`}
                    className={`text-[9px] px-2 py-0.5 rounded border-2 border-black font-black uppercase shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer hover:brightness-105 ${tier.badgeColor}`}
                  >
                    {tier.label.replace("Tier ", "")} ▾
                  </button>
                  <span className="text-[10px] font-bold text-slate-700 font-mono-sport">
                    {player.gamesPlayed}x Main
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit, Check-in, Pause, Share Story Card & Remove */}
              <div className="flex items-center gap-1.5 sm:gap-1 shrink-0">
                {/* Tombol Edit Player (Modal Lengkap) */}
                <button
                  type="button"
                  onClick={() => openEditModal(player)}
                  title={`Edit data lengkap ${player.name} (Nama, Gender, Level, Status)`}
                  className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg border-2 border-black bg-amber-200 flex items-center justify-center text-black hover:bg-amber-300 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>

                {!isArrived ? (
                  /* Tombol Quick Check-in untuk Pemain yang Baru Datang */
                  <button
                    type="button"
                    onClick={() => handleToggleArrivalWithFeedback(player.id)}
                    title={`Tandai ${player.name} sudah tiba di GOR`}
                    className="h-8 sm:h-7 px-2.5 rounded-lg border-2 border-black bg-[#ccff00] text-black font-black text-xs flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer hover:bg-[#b8e600]"
                  >
                    <UserCheck className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Check-in</span>
                  </button>
                ) : (
                  /* Tombol Play/Pause (Tahan / Lanjutkan Pemain) */
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
                )}

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
        }))}
      </div>

      {/* Modal Edit Detail Pemain */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-white p-5 shadow-[8px_8px_0px_#000] relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-black">
                  ✏️
                </span>
                <h3 className="text-base font-black text-black uppercase tracking-wide">
                  Edit Data Pemain
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="h-8 w-8 rounded-lg border-2 border-black bg-white hover:bg-slate-100 flex items-center justify-center text-black font-black cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Nama Pemain
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3.5 py-2 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditGender("M")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editGender === "M"
                        ? "bg-blue-200 text-blue-950 shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>👦</span>
                    <span>Men (Pria)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender("F")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editGender === "F"
                        ? "bg-pink-200 text-pink-950 shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>👧</span>
                    <span>Women (Wanita)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Level Kemampuan (Skill Tier)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSkill(1)}
                    className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer text-center ${
                      editSkill === 1
                        ? "bg-[#fef08a] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Beginner
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSkill(2)}
                    className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer text-center ${
                      editSkill === 2
                        ? "bg-[#a7f3d0] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Intermediate
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSkill(3)}
                    className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer text-center ${
                      editSkill === 3
                        ? "bg-[#7dd3fc] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Status Kehadiran di GOR
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditArrived(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editArrived
                        ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>✅</span>
                    <span>Sudah Hadir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditArrived(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !editArrived
                        ? "bg-[#ffde00] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>⏳</span>
                    <span>Belum Tiba (OTW)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-black border-2 border-black bg-white hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer hover:bg-[#b8e600]"
                >
                  💾 Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
