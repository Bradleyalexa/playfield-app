"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  Users,
  Trophy,
  ChevronRight,
  Sparkles,
  Filter,
  FastForward,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { ALGORITHM_REGISTRY, GameSession } from "../../core/entities/session";
import {
  generateProjectedSchedule,
  ProjectedRound,
  ProjectedMatch,
} from "../../core/matchmaking/balanced-queue";
import { getTierLabel } from "../../core/entities/player";
import { getMatchWinner, Match } from "../../core/entities/match";

interface AllMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GameSession;
  onFastTrackMatch?: (match: ProjectedMatch, targetCourtNumber: number) => void;
}

export function AllMatchesModal({
  isOpen,
  onClose,
  session,
  onFastTrackMatch,
}: AllMatchesModalProps) {
  const [filterMode, setFilterMode] = useState<"all" | "active_past" | "upcoming">("all");

  const initialProjectedRounds = useMemo(() => {
    if (!isOpen) return [];
    return generateProjectedSchedule(session);
  }, [isOpen, session]);

  const [scheduleRounds, setScheduleRounds] = useState<ProjectedRound[]>([]);
  const [isCustomOrder, setIsCustomOrder] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchTargetIndex, setTouchTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    setScheduleRounds(initialProjectedRounds);
    setIsCustomOrder(false);
  }, [initialProjectedRounds]);

  if (!isOpen) return null;

  const algoDetails =
    ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["playfields_mix"];

  // Swap Ronde Masa Depan
  const handleSwapRounds = (indexA: number, indexB: number) => {
    if (
      indexA < 0 ||
      indexB < 0 ||
      indexA >= scheduleRounds.length ||
      indexB >= scheduleRounds.length
    ) {
      return;
    }

    const roundA = scheduleRounds[indexA];
    const roundB = scheduleRounds[indexB];

    // Tidak boleh menukar ronde yang sudah selesai atau sedang berlangsung
    if (
      roundA.isCompleted ||
      roundA.isCurrent ||
      roundB.isCompleted ||
      roundB.isCurrent
    ) {
      return;
    }

    const newRounds = [...scheduleRounds];

    // Swap matches & resting players, mempertahankan timeline jam & nomor ronde di tempatnya
    const newMatchesForA = roundB.matches.map((m) => ({
      ...m,
      roundNumber: roundA.roundNumber,
      estimatedStartTime: roundA.matches[0]?.estimatedStartTime || m.estimatedStartTime,
      estimatedEndTime: roundA.matches[0]?.estimatedEndTime || m.estimatedEndTime,
    }));

    const newMatchesForB = roundA.matches.map((m) => ({
      ...m,
      roundNumber: roundB.roundNumber,
      estimatedStartTime: roundB.matches[0]?.estimatedStartTime || m.estimatedStartTime,
      estimatedEndTime: roundB.matches[0]?.estimatedEndTime || m.estimatedEndTime,
    }));

    newRounds[indexA] = {
      ...roundA,
      matches: newMatchesForA,
      restingPlayers: roundB.restingPlayers,
      isSameTierRound: roundB.isSameTierRound,
    };

    newRounds[indexB] = {
      ...roundB,
      matches: newMatchesForB,
      restingPlayers: roundA.restingPlayers,
      isSameTierRound: roundA.isSameTierRound,
    };

    setScheduleRounds(newRounds);
    setIsCustomOrder(true);
  };

  const handleResetOrder = () => {
    setScheduleRounds(initialProjectedRounds);
    setIsCustomOrder(false);
  };

  // Drag and Drop Handlers (Desktop Mouse)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleSwapRounds(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  // Touch Handlers (Mobile Smartphone Hold & Drag)
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchDragIndex(index);
    setTouchTargetIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDragIndex === null) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const roundCard = elem?.closest("[data-round-index]");
    if (roundCard) {
      const targetIdx = Number(roundCard.getAttribute("data-round-index"));
      if (!isNaN(targetIdx) && targetIdx !== touchTargetIndex) {
        setTouchTargetIndex(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (
      touchDragIndex !== null &&
      touchTargetIndex !== null &&
      touchDragIndex !== touchTargetIndex
    ) {
      handleSwapRounds(touchDragIndex, touchTargetIndex);
    }
    setTouchDragIndex(null);
    setTouchTargetIndex(null);
  };

  const filteredRounds = scheduleRounds.filter((r) => {
    if (filterMode === "active_past") return r.isCompleted || r.isCurrent;
    if (filterMode === "upcoming") return !r.isCompleted && !r.isCurrent;
    return true;
  });

  const totalMatchesCount = scheduleRounds.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-4xl h-[86dvh] max-h-[86dvh] sm:h-auto sm:max-h-[88vh] bg-[#faf8f2] border-[3px] sm:border-[4px] border-black rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#000] sm:shadow-[10px_10px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Dibuat Hemat Ruang di Mobile */}
        <div className="flex items-start justify-between p-3 sm:p-5 bg-white border-b-2 sm:border-b-[3px] border-black shrink-0">
          <div className="pr-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-full bg-[#ccff00] border border-black font-black">
                {session.sport.toUpperCase()}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-black uppercase px-2 py-0.5 rounded-full border border-black ${algoDetails.badgeColor}`}
              >
                {algoDetails.icon} {algoDetails.shortName}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-black/60">
                KODE: {session.publicSlug || session.id.slice(0, 8)}
              </span>
            </div>

            <h2 className="text-base sm:text-2xl font-black text-black uppercase tracking-tight leading-tight">
              Jadwal Lengkap & Proyeksi Pertandingan
            </h2>
            <p className="text-[11px] sm:text-sm font-bold text-black/70 mt-0.5">
              {session.title} • {session.courtCount} Lapangan
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl border-[2px] sm:border-[3px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" />
          </button>
        </div>

        {/* Info Strip - Versi Mobile Compact (Satu Baris Chip) & Versi Desktop (Grid) */}
        {/* 1. Mobile Compact Strip (< sm) */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto px-3 py-2 bg-white/90 border-b-2 border-black shrink-0 text-[10px] font-mono font-bold scrollbar-none">
          <span className="px-2 py-0.5 rounded-md bg-[#faf8f2] border border-black whitespace-nowrap">
            ⏰ {session.startTime || "19:00"} ({session.durationHours || 2}J)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#faf8f2] border border-black whitespace-nowrap">
            ⏱️ ~{session.matchDurationMinutes || 15}m
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#faf8f2] border border-black whitespace-nowrap">
            🏸 {totalMatchesCount} Match
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#ffde00] border border-black whitespace-nowrap text-black font-black">
            🔴 R#{session.currentRound} LIVE
          </span>
        </div>

        {/* 2. Desktop Grid (>= sm) */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-2.5 p-4 bg-white/70 border-b-2 border-black shrink-0 text-xs">
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

        {/* Filter Bar & Reorder Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-[#faf8f2] border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Daftar Ronde ({filteredRounds.length})
            </span>
            {isCustomOrder && (
              <span className="px-2 py-0.5 rounded-full bg-[#ffde00] border border-black text-[9px] sm:text-[10px] font-black uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1">
                ✨ Urutan Kustom
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isCustomOrder && (
              <button
                onClick={handleResetOrder}
                className="px-2 py-1 rounded-lg border border-black bg-white hover:bg-slate-100 text-[10px] font-bold text-black flex items-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Kembalikan urutan rekomendasi algoritma asli"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset Urutan Algo</span>
              </button>
            )}

            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg border-2 border-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterMode("active_past")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg border-2 border-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                filterMode === "active_past"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Live & Selesai
            </button>
            <button
              onClick={() => setFilterMode("upcoming")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg border-2 border-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                filterMode === "upcoming"
                  ? "bg-[#ccff00] text-black font-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
            >
              Prediksi
            </button>
          </div>
        </div>

        {/* Banner Info Hold & Drag untuk Host */}
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-[#ffde00]/30 border-b-2 border-black text-xs font-bold text-black shrink-0">
          <span className="text-base shrink-0">💡</span>
          <span className="text-[10px] sm:text-[11px] leading-tight">
            <strong>Info Host:</strong> Ronde masa depan (prediksi) bisa ditukar urutannya! Anda bisa <strong>Tahan & Geser (Hold & Drag)</strong> pada pegangan <span className="bg-white px-1.5 py-0.5 rounded border border-black font-mono font-black text-[9px] shadow-[1px_1px_0px_#000]">⋮⋮ Tahan & Geser</span> di HP/Desktop, atau tekan tombol <strong>🔼 Naik / 🔽 Turun</strong>.
          </span>
        </div>

        {/* Scrollable Body: Daftar Ronde & Match - DIBERIKAN RUANG MAKSIMAL & PROPORSI CEPAT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-5 space-y-3 sm:space-y-4">
          {filteredRounds.length === 0 ? (
            <div className="py-12 text-center font-bold text-black/60 italic">
              Tidak ada ronde yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            filteredRounds.map((round) => {
              const actualIndex = scheduleRounds.findIndex(
                (r) => r.roundNumber === round.roundNumber
              );
              const isCurrent = round.isCurrent;
              const isPast = round.isCompleted;
              const isUpcoming = !isCurrent && !isPast;

              const prevRound = actualIndex > 0 ? scheduleRounds[actualIndex - 1] : null;
              const nextRound =
                actualIndex < scheduleRounds.length - 1
                  ? scheduleRounds[actualIndex + 1]
                  : null;

              const canMoveUp = isUpcoming && prevRound && !prevRound.isCurrent && !prevRound.isCompleted;
              const canMoveDown = isUpcoming && nextRound && !nextRound.isCurrent && !nextRound.isCompleted;

              return (
                <div
                  key={round.roundNumber}
                  data-round-index={actualIndex}
                  draggable={isUpcoming}
                  onDragStart={(e) => handleDragStart(e, actualIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, actualIndex)}
                  className={`rounded-xl sm:rounded-2xl border-2 sm:border-[3px] border-black p-2.5 sm:p-4 transition-all ${
                    touchTargetIndex === actualIndex && touchDragIndex !== actualIndex
                      ? "ring-4 ring-[#ccff00] scale-[1.01] bg-[#ffde00]/25"
                      : isCurrent
                      ? "bg-white shadow-[4px_4px_0px_#000] ring-2 sm:ring-3 ring-[#ccff00]"
                      : isPast
                      ? "bg-white/80 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
                      : "bg-[#faf8f2] shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:border-black"
                  }`}
                >
                  {/* Round Header */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b-2 border-black mb-2.5 sm:mb-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                      {isUpcoming && (
                        <div
                          onTouchStart={(e) => handleTouchStart(e, actualIndex)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className="flex items-center gap-1 cursor-grab active:cursor-grabbing px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-black text-black shadow-[1px_1px_0px_#000] select-none touch-none"
                          title="Tahan & Geser untuk menukar urutan ronde"
                        >
                          <GripVertical className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span className="text-[9px] font-black uppercase font-mono">Tahan & Geser</span>
                        </div>
                      )}

                      <span className="font-mono text-xs sm:text-sm font-black px-2 sm:px-2.5 py-0.5 rounded bg-black text-white">
                        RONDE #{round.roundNumber}
                      </span>

                      <span className="font-mono font-bold text-[11px] sm:text-xs text-black flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {round.timeRange}
                      </span>

                      {/* Badge Tipe Ronde: Level Imbang vs Mix */}
                      {round.isSameTierRound ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-[#ffde00] text-black shadow-[1px_1px_0px_#000] flex items-center gap-1">
                          ⚡ Level Imbang
                        </span>
                      ) : session.algorithm === "playfields_mix" && session.courtCount >= 2 ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-[#ccff00]/60 text-black">
                          🔀 Mix Harmonis
                        </span>
                      ) : session.algorithm === "hybrid_2plus2" ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-[#d946ef] text-white">
                          🔀 Mix Level
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Kontrol Tukar Urutan Ronde (Khusus Ronde Prediksi yang belum main) */}
                      {isUpcoming && (
                        <div className="flex items-center gap-1 bg-white border border-black rounded-lg p-0.5 shadow-[1px_1px_0px_#000]">
                          <button
                            type="button"
                            onClick={() => handleSwapRounds(actualIndex, actualIndex - 1)}
                            disabled={!canMoveUp}
                            className="px-1.5 py-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-[10px] font-black flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed"
                            title="Tukar urutan ronde ke atas"
                          >
                            <ArrowUp className="h-3 w-3 stroke-[3]" />
                            <span className="text-[9px]">Naik</span>
                          </button>
                          <div className="h-3 w-[1px] bg-black/20" />
                          <button
                            type="button"
                            onClick={() => handleSwapRounds(actualIndex, actualIndex + 1)}
                            disabled={!canMoveDown}
                            className="px-1.5 py-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-[10px] font-black flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed"
                            title="Tukar urutan ronde ke bawah"
                          >
                            <ArrowDown className="h-3 w-3 stroke-[3]" />
                            <span className="text-[9px]">Turun</span>
                          </button>
                        </div>
                      )}

                      {isCurrent ? (
                        <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-[#ccff00] text-black border-2 border-black font-black text-[10px] sm:text-xs font-mono uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_#000] animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                          SEDANG MAIN (LIVE)
                        </span>
                      ) : isPast ? (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-neutral-200 text-black border border-black font-bold text-[10px] sm:text-xs font-mono">
                          SELESAI
                        </span>
                      ) : (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white text-black border border-black font-bold text-[10px] sm:text-xs font-mono">
                          PREDIKSI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Matches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
                    {round.matches.map((match) => {
                      const hasScore =
                        typeof match.scoreA === "number" &&
                        (match.scoreA > 0 || (match.scoreB || 0) > 0);
                      const winner = getMatchWinner({
                        scoreA: match.scoreA ?? 0,
                        scoreB: match.scoreB ?? 0,
                        winner: match.winner,
                      });
                      const isWinnerA = winner === "A";
                      const isWinnerB = winner === "B";

                      const matchPlayersLive = [...match.teamA, ...match.teamB].map(
                        (p) => session.players.find((sp) => sp.id === p.id) || p
                      );
                      const unarrivedCount = matchPlayersLive.filter(
                        (p) => p.isArrived === false
                      ).length;
                      const isAllArrived = unarrivedCount === 0;

                      return (
                        <div
                          key={match.id}
                          className="rounded-lg sm:rounded-xl border border-black bg-white p-2 sm:p-3 shadow-[1.5px_1.5px_0px_#000] sm:shadow-[2px_2px_0px_#000] flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-black/15 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] sm:text-xs font-black uppercase px-1.5 py-0.2 rounded bg-[#faf8f2] border border-black">
                                Lapangan {match.courtNumber}
                              </span>
                              {!isCurrent && !isPast && (
                                isAllArrived ? (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#ccff00] text-black border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                                    <Sparkles className="h-2 w-2 fill-black" />
                                    Semua Hadir
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-400 px-1.5 py-0.2 rounded-full">
                                    ⏳ {unarrivedCount} OTW
                                  </span>
                                )
                              )}
                            </div>
                            <span className="font-mono text-[10px] font-bold text-black/60">
                              {match.estimatedStartTime} - {match.estimatedEndTime}
                            </span>
                          </div>

                          {/* Teams 2v2 */}
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                            {/* Tim A */}
                            <div
                              className={`rounded-md sm:rounded-lg border border-black p-1.5 sm:p-2.5 flex flex-col justify-between ${
                                isWinnerA
                                  ? "bg-[#ccff00]/30 shadow-[1px_1px_0px_#000]"
                                  : "bg-emerald-50/80"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                                    Tim A
                                  </span>
                                  {isWinnerA && (
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-black font-mono">
                                      👑 MENANG
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {match.teamA.map((p) => {
                                    const liveP =
                                      session.players.find((sp) => sp.id === p.id) || p;
                                    const isLate = liveP.isArrived === false;
                                    return (
                                      <div
                                        key={p.id}
                                        className="flex items-center justify-between gap-1"
                                      >
                                        <span
                                          className={`font-bold text-[11px] sm:text-xs truncate ${
                                            isLate ? "text-amber-900" : "text-black"
                                          }`}
                                        >
                                          {p.name}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span
                                            className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                              p.gender === "M"
                                                ? "bg-blue-100 text-blue-900 border-blue-400"
                                                : "bg-pink-100 text-pink-900 border-pink-400"
                                            }`}
                                          >
                                            {p.gender === "M" ? "M" : "W"}
                                          </span>
                                          {isLate && (
                                            <span className="text-[7px] font-mono font-black px-1 py-0.2 rounded bg-amber-200 text-amber-950 border border-amber-400">
                                              OTW
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {hasScore ? (
                                <div className="mt-1.5 pt-1 border-t border-emerald-300 text-center font-mono font-black text-lg sm:text-xl text-emerald-900">
                                  {match.scoreA}
                                </div>
                              ) : isWinnerA ? (
                                <div className="mt-1.5 pt-1 border-t border-emerald-300 text-center font-mono font-black text-[10px] sm:text-xs text-emerald-900 uppercase">
                                  👑 Menang
                                </div>
                              ) : null}
                            </div>

                            {/* Tim B */}
                            <div
                              className={`rounded-md sm:rounded-lg border border-black p-1.5 sm:p-2.5 flex flex-col justify-between ${
                                isWinnerB
                                  ? "bg-[#7dd3fc]/30 shadow-[1px_1px_0px_#000]"
                                  : "bg-sky-50/80"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-sky-800 tracking-wider">
                                    Tim B
                                  </span>
                                  {isWinnerB && (
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-black font-mono">
                                      👑 MENANG
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {match.teamB.map((p) => {
                                    const liveP =
                                      session.players.find((sp) => sp.id === p.id) || p;
                                    const isLate = liveP.isArrived === false;
                                    return (
                                      <div
                                        key={p.id}
                                        className="flex items-center justify-between gap-1"
                                      >
                                        <span
                                          className={`font-bold text-[11px] sm:text-xs truncate ${
                                            isLate ? "text-amber-900" : "text-black"
                                          }`}
                                        >
                                          {p.name}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span
                                            className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                              p.gender === "M"
                                                ? "bg-blue-100 text-blue-900 border-blue-400"
                                                : "bg-pink-100 text-pink-900 border-pink-400"
                                            }`}
                                          >
                                            {p.gender === "M" ? "M" : "W"}
                                          </span>
                                          {isLate && (
                                            <span className="text-[7px] font-mono font-black px-1 py-0.2 rounded bg-amber-200 text-amber-950 border border-amber-400">
                                              OTW
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {hasScore ? (
                                <div className="mt-1.5 pt-1 border-t border-sky-300 text-center font-mono font-black text-lg sm:text-xl text-sky-900">
                                  {match.scoreB}
                                </div>
                              ) : isWinnerB ? (
                                <div className="mt-1.5 pt-1 border-t border-sky-300 text-center font-mono font-black text-[10px] sm:text-xs text-sky-900 uppercase">
                                  👑 Menang
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Tombol Tarik Maju Match jika belum berlangsung */}
                          {!isCurrent && !isPast && onFastTrackMatch && (
                            <div className="mt-2 pt-1.5 border-t border-black/15 flex items-center justify-between gap-1.5">
                              <span className="text-[9px] font-black uppercase text-slate-600 font-mono">
                                {isAllArrived
                                  ? "⚡ Siap di GOR"
                                  : `⏳ ${unarrivedCount} OTW`}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const emptyCourt = session.courts.find(
                                    (c) => !c.currentMatch
                                  );
                                  const targetCourt = emptyCourt
                                    ? emptyCourt.courtNumber
                                    : match.courtNumber;
                                  onFastTrackMatch(match, targetCourt);
                                  onClose();
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ccff00] hover:bg-[#b8e600] text-black border border-black font-black text-[9px] sm:text-[10px] uppercase shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                title="Tarik match ini sekarang ke lapangan"
                              >
                                <FastForward className="h-3 w-3 stroke-[3]" />
                                <span>Tarik Maju ⏩</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Resting Players On-Deck */}
                  {round.restingPlayers.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/20 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-mono font-black text-[10px] sm:text-[11px] text-black/60 uppercase">
                        🏖️ Istirahat ({round.restingPlayers.length}):
                      </span>
                      {round.restingPlayers.map((p) => (
                        <span
                          key={p.id}
                          className="font-bold text-black/80 bg-white border border-black px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] flex items-center gap-1"
                        >
                          {p.name}
                          <span className="text-[8px] sm:text-[9px] text-black/50">
                            ({p.gender === "M" ? "M" : "W"})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal - Compact & Clean */}
        <div className="p-3 sm:p-4 bg-white border-t-[3px] border-black flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs shrink-0">
          <p className="hidden sm:block text-black/70 font-semibold text-center sm:text-left text-xs">
            💡 <span className="font-black text-black">Catatan Algoritma:</span> Prediksi disimulasikan otomatis berdasarkan algoritma <strong>{algoDetails.name}</strong>. Anda dapat menukar urutan ronde prediksi dengan tombol 🔼 / 🔽.
          </p>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-xl bg-black text-white font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-xs"
          >
            Tutup Jadwal
          </button>
        </div>
      </div>
    </div>
  );
}
