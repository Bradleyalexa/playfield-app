"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Sparkles,
  Radio,
  Calendar,
  MapPin,
  ExternalLink,
  Timer,
  Clock,
  Share2,
  Flame,
  QrCode,
  Search,
  X,
  Lock,
  Check,
} from "lucide-react";
import { Navbar } from "../../../components/common/Navbar";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { MatchRecapModal } from "../../../components/schedule/MatchRecapModal";
import { CompletedSessionRecap } from "../../../components/schedule/CompletedSessionRecap";
import { PlayerShareModal } from "../../../components/players/PlayerShareModal";
import { SpectatorQrModal } from "../../../components/common/SpectatorQrModal";
import { getTierLabel, Player } from "../../../core/entities/player";
import { getMatchWinner } from "../../../core/entities/match";
import { ALGORITHM_REGISTRY, GameSession } from "../../../core/entities/session";
import { LocalStorageAdapter } from "../../../services/storage/local-storage.adapter";
import { calculateRentalTimeInfo, RentalTimeInfo } from "../../../lib/time-tracker";

interface LivePageProps {
  params: Promise<{ sessionId: string }>;
}

function LiveSpectatorContent({ params }: LivePageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<GameSession | null>(null);
  const [isAllMatchesModalOpen, setIsAllMatchesModalOpen] = useState(false);
  const [isMatchRecapModalOpen, setIsMatchRecapModalOpen] = useState(false);
  const [isSpectatorQrOpen, setIsSpectatorQrOpen] = useState(false);
  const [sharingPlayer, setSharingPlayer] = useState<Player | null>(null);
  const [spectatorToast, setSpectatorToast] = useState<string | null>(null);

  // Update Skor Pertandingan oleh Penonton / Wasit (Jika Diizinkan Host)
  const handleSpectatorUpdateScore = (courtNumber: number, scoreA: number, scoreB: number, winner?: "A" | "B") => {
    if (!session || !session.allowSpectatorScoreUpdate) return;
    const clampedA = Math.max(0, scoreA);
    const clampedB = Math.max(0, scoreB);

    const updatedMatches = session.matches.map((m) => {
      if (m.courtNumber === courtNumber && m.status === "in_progress") {
        const calculatedWinner = winner !== undefined ? winner : (clampedA > clampedB ? "A" : clampedB > clampedA ? "B" : m.winner);
        return { ...m, scoreA: clampedA, scoreB: clampedB, winner: calculatedWinner };
      }
      return m;
    });

    const updatedCourts = session.courts.map((c) => {
      if (c.courtNumber === courtNumber && c.currentMatch) {
        const calculatedWinner = winner !== undefined ? winner : (clampedA > clampedB ? "A" : clampedB > clampedA ? "B" : c.currentMatch.winner);
        return { ...c, currentMatch: { ...c.currentMatch, scoreA: clampedA, scoreB: clampedB, winner: calculatedWinner } };
      }
      return c;
    });

    const updated: GameSession = {
      ...session,
      matches: updatedMatches,
      courts: updatedCourts,
    };

    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
    setSpectatorToast(winner ? `Pemenang Lapangan #${courtNumber} ditandai: Tim ${winner}` : `Skor Lapangan #${courtNumber} diperbarui: ${clampedA} - ${clampedB}`);
    setTimeout(() => setSpectatorToast(null), 3000);
  };

  // Fitur Cari Giliran Saya (Match Finder)
  const [searchPlayerName, setSearchPlayerName] = useState("");
  const [selectedPlayerForFinder, setSelectedPlayerForFinder] = useState<Player | null>(null);

  const getPlayerLiveStatus = (player: Player) => {
    if (!session) return null;

    // 0. Cek apakah pemain belum tiba di lokasi (isArrived === false)
    if (player.isArrived === false) {
      return {
        type: "not_arrived" as const,
        completedCount: 0,
      };
    }

    // 1. Cek apakah sedang bertanding di lapangan aktif saat ini
    for (const court of session.courts) {
      const match = court.currentMatch;
      if (match && match.status === "in_progress") {
        const inTeamA = match.teamA.some((p) => p.id === player.id);
        const inTeamB = match.teamB.some((p) => p.id === player.id);
        if (inTeamA || inTeamB) {
          const myTeam = inTeamA ? match.teamA : match.teamB;
          const opponentTeam = inTeamA ? match.teamB : match.teamA;
          const partner = myTeam.find((p) => p.id !== player.id);
          const myScore = inTeamA ? match.scoreA : match.scoreB;
          const oppScore = inTeamA ? match.scoreB : match.scoreA;

          return {
            type: "playing" as const,
            courtNumber: court.courtNumber,
            courtName: court.courtName,
            roundNumber: match.roundNumber,
            partner,
            opponents: opponentTeam,
            myScore,
            oppScore,
            match,
          };
        }
      }
    }

    // 2. Cek apakah ada jadwal pertandingan berikutnya yang sudah antre
    const upcomingMatch = session.matches.find(
      (m) =>
        (m.status === "queued" || m.status === "in_progress") &&
        (m.teamA.some((p) => p.id === player.id) || m.teamB.some((p) => p.id === player.id))
    );

    if (upcomingMatch) {
      const inTeamA = upcomingMatch.teamA.some((p) => p.id === player.id);
      const myTeam = inTeamA ? upcomingMatch.teamA : upcomingMatch.teamB;
      const opponentTeam = inTeamA ? upcomingMatch.teamB : upcomingMatch.teamA;
      const partner = myTeam.find((p) => p.id !== player.id);

      return {
        type: "upcoming" as const,
        courtNumber: upcomingMatch.courtNumber,
        courtName: `Lapangan ${upcomingMatch.courtNumber}`,
        roundNumber: upcomingMatch.roundNumber,
        partner,
        opponents: opponentTeam,
        match: upcomingMatch,
      };
    }

    // 3. Jika tidak ada di active maupun upcoming, berarti sedang istirahat
    const completedMatches = session.matches.filter(
      (m) =>
        m.status === "completed" &&
        (m.teamA.some((p) => p.id === player.id) || m.teamB.some((p) => p.id === player.id))
    );

    return {
      type: "resting" as const,
      completedCount: completedMatches.length,
    };
  };

  // Waktu & Countdown Sewa Lapangan
  const [currentTime, setCurrentTime] = useState("");
  const [rentalInfo, setRentalInfo] = useState<RentalTimeInfo>(() =>
    calculateRentalTimeInfo(null)
  );

  useEffect(() => {
    let current = LocalStorageAdapter.getSession(sessionId);

    // Auto-heal courts jika jumlah array court kurang dari courtCount
    if (current && current.courts.length < current.courtCount) {
      const existingNumbers = new Set(current.courts.map((c) => c.courtNumber));
      const courtColors = ["Hijau", "Biru", "Merah", "Ungu", "Abu-abu", "Kuning", "Tosca", "Oranye"];
      const healedCourts = [...current.courts];
      for (let i = 1; i <= current.courtCount; i++) {
        if (!existingNumbers.has(i)) {
          const colorName = courtColors[(i - 1) % courtColors.length];
          const activeMatch = current.matches.find(
            (m) => m.courtNumber === i && m.status === "in_progress"
          );
          healedCourts.push({
            id: `c${i}-${Date.now()}`,
            courtNumber: i,
            courtName: `Lapangan ${i} (Karpet ${colorName})`,
            currentMatch: activeMatch,
          });
        }
      }
      healedCourts.sort((a, b) => a.courtNumber - b.courtNumber);
      current = { ...current, courts: healedCourts };
    }

    if (current) {
      setSession(current);
    }

    // Ambil data terbaru dari cloud (R2/D1/API)
    LocalStorageAdapter.fetchRemoteSession(sessionId).then((remote) => {
      if (remote) {
        setSession(remote);
      } else if (!current) {
        if (sessionId === "demo" || sessionId.startsWith("demo-")) {
          setSession(LocalStorageAdapter.createDemoSession("badminton"));
        } else {
          setSession(LocalStorageAdapter.createDemoSession("badminton"));
        }
      }
    });

    // Polling berkala tiap 7 detik agar penonton mendapatkan live score real-time
    const pollTimer = setInterval(() => {
      LocalStorageAdapter.fetchRemoteSession(sessionId).then((remote) => {
        if (remote) setSession(remote);
      });
    }, 7000);

    const handleSync = (e: any) => {
      if (e.detail && (e.detail.id === sessionId || e.detail.publicSlug === sessionId)) {
        setSession(e.detail);
      }
    };
    window.addEventListener("clubcourt:session_updated", handleSync);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener("clubcourt:session_updated", handleSync);
    };
  }, [sessionId]);

  // Hitung Waktu Sewa Lapangan Realtime
  useEffect(() => {
    if (!session) return;
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setRentalInfo(calculateRentalTimeInfo(session, now));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-black text-base">
        MEMUAT PAPAN PERTANDINGAN...
      </div>
    );
  }

  const isCompleted = session.status === "completed";
  const algo = ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["playfields_mix"];

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar publicSlug={session.publicSlug} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-3.5 sm:px-6 py-5 sm:py-7 pb-28 sm:pb-12 flex flex-col gap-5 sm:gap-6">
        {/* Banner Sultan jika aktif */}
        {session.sultanSponsor && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#ffde00] border-3 border-black p-3.5 sm:p-4 text-center justify-center shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-5 w-5 text-black shrink-0 animate-bounce" />
            <span className="font-black text-black text-xs sm:text-sm uppercase tracking-wider">
              👑 MABAR MALAM INI DISPONSORI PENUH OLEH {session.sultanSponsor}!
            </span>
            <Sparkles className="h-5 w-5 text-black shrink-0 animate-bounce" />
          </div>
        )}

        {/* Jika Sesi Selesai: Tampilkan Rangkuman Akhir & Podium Juara */}
        {isCompleted ? (
          <CompletedSessionRecap session={session} isHost={false} />
        ) : (
          <>
            {/* Header Sesi (Neo-Brutalism Penuh) */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-white shadow-[6px_6px_0px_#000] overflow-hidden">
              <div className="w-full min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-lg bg-[#ccff00] border-2 border-black font-black shadow-[2px_2px_0px_#000]">
                    {session.sport.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] ${algo.badgeColor}`}
                  >
                    {algo.icon} {algo.shortName}
                  </span>
                  {session.algorithm === "hybrid_2plus2" && (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] ${
                        Math.floor((session.currentRound - 1) / 2) % 2 === 0
                          ? "bg-[#d946ef] text-white"
                          : "bg-[#00e5ff] text-black"
                      }`}
                    >
                      {Math.floor((session.currentRound - 1) / 2) % 2 === 0
                        ? "🔀 Mix Level"
                        : "⚡ Level Sama"}
                    </span>
                  )}
                  <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded font-mono border border-black">
                    RONDE #{session.currentRound}
                  </span>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black text-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000]"
                    title="Realtime sync aktif tiap 7 detik"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping shrink-0" />
                    <span className="text-[10px] font-black font-mono tracking-wider">LIVE</span>
                    <span className="text-[9px] font-mono font-bold text-slate-300 hidden sm:inline">
                      • Terhubung
                    </span>
                  </div>
                </div>

                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight break-words whitespace-normal leading-tight">
                  {session.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mt-1 font-mono-sport">
                  {rentalInfo.dayDateLabel && (
                    <>
                      <span className="bg-[#ccff00] text-black px-1.5 py-0.2 rounded border border-black shadow-[1px_1px_0px_#000]">
                        📅 {rentalInfo.dayDateLabel}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{session.courtCount} LAPANGAN</span>
                  <span>•</span>
                  <span>{session.players.length} PEMAIN</span>
                  <span>•</span>
                  <span>
                    🕒 JADWAL: {rentalInfo.scheduleLabel} ({rentalInfo.durationLabel})
                  </span>
                </div>

                {session.courtLocation && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span className="truncate max-w-[260px] sm:max-w-md">{session.courtLocation}</span>
                    {session.googleMapsUrl && (
                      <a
                        href={session.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-200 border border-emerald-500 text-emerald-950 font-black text-[10px] uppercase shadow-[1px_1px_0px_#000]"
                      >
                        <span>Maps</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Status Waktu & Live Controls */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  {/* Jam Dinding Sekarang */}
                  <div
                    className="flex items-center gap-1.5 rounded-xl bg-[#ffde00] border-2 border-black px-3 py-1.5 font-mono-sport text-xs font-black shadow-[2px_2px_0px_#000]"
                    title="Waktu Lokal Sekarang"
                  >
                    <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{currentTime || "--:--:--"}</span>
                  </div>

                  {/* Sisa Waktu Sewa Lapangan */}
                  <div
                    className={`flex items-center gap-1.5 rounded-xl ${rentalInfo.bgClass} ${rentalInfo.textClass} border-2 border-black px-3 py-1.5 font-mono-sport text-xs font-black shadow-[2px_2px_0px_#000]`}
                    title={rentalInfo.description}
                  >
                    <Timer className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span className="uppercase text-[9px] font-sans font-bold">{rentalInfo.label}:</span>
                    <span>{rentalInfo.formattedTime}</span>
                  </div>
                </div>

                {/* Deskripsi Jelas Status Waktu Sewa */}
                <p className="text-[11px] font-bold text-slate-600 sm:text-right max-w-xs leading-tight">
                  ℹ️ {rentalInfo.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-0.5 w-full">
                  <button
                    onClick={() => setIsSpectatorQrOpen(true)}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-[#ffde00] text-black border-2 border-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-[#ffe640] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
                    title="Buka QR Code Penonton"
                  >
                    <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5] shrink-0" />
                    <span className="truncate">Bagikan QR</span>
                  </button>

                  <button
                    onClick={() => setIsMatchRecapModalOpen(true)}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-[#ccff00] text-black border-2 border-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
                    title="Buka Rekap Hasil Seluruh Pertandingan"
                  >
                    <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5] shrink-0" />
                    <span className="truncate">Rekap ({session.matches.filter((m) => m.status === "completed").length})</span>
                  </button>

                  <button
                    onClick={() => setIsAllMatchesModalOpen(true)}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-white text-black border-2 border-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-[#ccff00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
                  >
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5] shrink-0" />
                    <span className="truncate">Jadwal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FITUR: CARI GILIRAN MAIN SAYA (PERSONAL MATCH FINDER) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-sm shadow-[1px_1px_0px_#000]">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                      Cari Giliran Main Saya (Live Match Finder)
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-600">
                      Cek jadwal lapangan, partner ganda, dan lawan mainmu seketika
                    </p>
                  </div>
                </div>

                {selectedPlayerForFinder && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlayerForFinder(null);
                      setSearchPlayerName("");
                    }}
                    className="self-start sm:self-auto flex items-center gap-1 text-[10px] font-mono font-black text-rose-600 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span>Ganti Pemain</span>
                  </button>
                )}
              </div>

              {!selectedPlayerForFinder ? (
                <div className="flex flex-col gap-2.5">
                  <div className="relative">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000]">
                      <Search className="h-4 w-4 text-black/60 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={searchPlayerName}
                        onChange={(e) => setSearchPlayerName(e.target.value)}
                        placeholder="Ketik namamu di sini (contoh: Hendra, Kevin, Maya)..."
                        className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-black placeholder-slate-400 focus:outline-none"
                      />
                      {searchPlayerName && (
                        <button
                          type="button"
                          onClick={() => setSearchPlayerName("")}
                          className="text-slate-400 hover:text-black p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Chip Selection */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 mr-1">
                      Pilih Namamu:
                    </span>
                    {session.players
                      .filter((p) =>
                        searchPlayerName
                          ? p.name.toLowerCase().includes(searchPlayerName.toLowerCase())
                          : true
                      )
                      .slice(0, 14)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlayerForFinder(p);
                            setSearchPlayerName("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#faf8f2] hover:bg-[#ccff00] border-2 border-black text-xs font-black text-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer truncate max-w-[150px]"
                        >
                          {p.name}
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                /* Kartu Sorotan Jadwal Pemain Terpilih */
                (() => {
                  const status = getPlayerLiveStatus(selectedPlayerForFinder);
                  if (!status) return null;

                  return (
                    <div className="rounded-xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] animate-in fade-in zoom-in-95 duration-150 bg-[#faf8f2]">
                      {/* Header Pemain */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏸</span>
                          <div>
                            <span className="text-sm sm:text-base font-black text-black">
                              Halo, {selectedPlayerForFinder.name}!
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                                  selectedPlayerForFinder.gender === "M"
                                    ? "bg-blue-100 text-blue-900 border-blue-400"
                                    : "bg-pink-100 text-pink-900 border-pink-400"
                                }`}
                              >
                                {selectedPlayerForFinder.gender === "M" ? "Laki-laki (M)" : "Perempuan (W)"}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded ${getTierLabel(selectedPlayerForFinder.publicTier).badgeColor}`}>
                                {getTierLabel(selectedPlayerForFinder.publicTier).label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {status.type === "not_arrived" && (
                          <span className="flex items-center gap-1 font-mono font-black text-[10px] uppercase bg-amber-300 text-amber-950 px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                            ⏳ Belum Tiba (OTW)
                          </span>
                        )}
                        {status.type === "playing" && (
                          <span className="flex items-center gap-1 font-mono font-black text-[10px] uppercase bg-[#ccff00] text-black px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] animate-pulse">
                            🔥 Sedang Main
                          </span>
                        )}
                        {status.type === "upcoming" && (
                          <span className="flex items-center gap-1 font-mono font-black text-[10px] uppercase bg-[#ffde00] text-black px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                            ⏳ Antre Berikutnya
                          </span>
                        )}
                        {status.type === "resting" && (
                          <span className="flex items-center gap-1 font-mono font-black text-[10px] uppercase bg-white text-slate-800 px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                            ☕ Sedang Rehat
                          </span>
                        )}
                      </div>

                      {/* Konten Status Khusus */}
                      {status.type === "not_arrived" && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-black shadow-[2px_2px_0px_#000] text-xs">
                          <p className="font-black text-amber-950 mb-1 flex items-center gap-1.5 text-xs uppercase">
                            <span>📍 Status: Belum Check-in di Lokasi</span>
                          </p>
                          <p className="text-amber-900 text-[11px] leading-relaxed">
                            Kamu saat ini berstatus belum tiba di GOR. Algoritma Playfield otomatis memprioritaskan pemain yang sudah hadir di lapangan terlebih dahulu.
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-black/10 text-[11px] font-black text-black">
                            👉 Begitu kamu sampai di lokasi GOR, <strong>segera beri tahu Host mabar</strong> untuk tap check-in namamu agar langsung dijadwalkan!
                          </div>
                        </div>
                      )}

                      {status.type === "playing" && (
                        <div className="flex flex-col gap-2.5">
                          <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-600 mb-1.5">
                              <span>{status.courtName} • Ronde {status.roundNumber}</span>
                              <span className="text-emerald-700 font-mono">Live Score</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                              <div className="flex-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Tim Kamu:</span>
                                <span className="font-extrabold text-black block truncate">
                                  {selectedPlayerForFinder.name} {status.partner ? `& ${status.partner.name}` : ""}
                                </span>
                              </div>
                              <div className="px-3 py-1 rounded-lg bg-black text-[#ccff00] font-mono-sport text-lg font-black shrink-0 border border-black shadow-[1px_1px_0px_#000]">
                                {status.myScore} - {status.oppScore}
                              </div>
                              <div className="flex-1 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Lawan:</span>
                                <span className="font-extrabold text-black block truncate">
                                  {status.opponents.map((p) => p.name).join(" & ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {status.type === "upcoming" && (
                        <div className="flex flex-col gap-2.5">
                          <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                            <div className="text-xs font-black uppercase text-slate-600 mb-1.5">
                              {status.courtName} • Ronde {status.roundNumber}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Partner Ganda Kamu:</span>
                                <span className="font-extrabold text-black text-sm">
                                  {status.partner ? `🤝 ${status.partner.name}` : "Tunggal (Single)"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Lawan Tanding:</span>
                                <span className="font-extrabold text-black text-sm">
                                  ⚔️ {status.opponents.map((p) => p.name).join(" & ")}
                                </span>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold mt-2 pt-2 border-t border-black/10">
                              💡 Siap-siap di dekat lapangan begitu ronde yang sedang berjalan selesai.
                            </p>
                          </div>
                        </div>
                      )}

                      {status.type === "resting" && (
                        <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs">
                          <p className="font-bold text-black mb-1">
                            Kamu sedang dalam giliran istirahat / rehat santai. 🥤
                          </p>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Total match yang sudah kamu mainkan: <strong>{status.completedCount} match</strong>. Algoritma rotasi akan otomatis menjadwalkanmu kembali di ronde selanjutnya agar menit bermain seimbang.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Lapangan Sedang Berlangsung */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-[#ff5500] border-2 border-black rounded-full animate-ping" />
                  <span>Pertandingan Sedang Berlangsung</span>
                </h2>
                <button
                  onClick={() => setIsAllMatchesModalOpen(true)}
                  className="text-xs font-black uppercase text-black underline hover:text-slate-600 cursor-pointer"
                >
                  Lihat Ronde Berikutnya →
                </button>
              </div>

              {/* Banner Hak Akses Wasit Penonton */}
              {session.allowSpectatorScoreUpdate ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#ccff00]/25 border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🟢</span>
                    <span>Mode Wasit Aktif: Anda diizinkan Host untuk bantu update skor pertandingan!</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-black text-[#ccff00] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] shrink-0">
                    Wasit Penonton ON
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f2] border-2 border-dashed border-black/30 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Mode Baca Saja (Host belum mengaktifkan izin update skor penonton)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.courts.map((court) => {
                  const match = court.currentMatch;
                  if (!match) {
                    return (
                      <div
                        key={court.id}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-3 border-dashed border-black/40 bg-white/70 text-center min-h-[160px]"
                      >
                        <span className="text-base font-black text-black/60 uppercase font-mono">
                          {court.courtName}
                        </span>
                        <span className="text-xs font-black text-slate-500 mt-1 uppercase tracking-widest">
                          Lapangan Sedang Kosong / Rehat
                        </span>
                      </div>
                    );
                  }

                  const isLeadingA = match.scoreA > match.scoreB;
                  const isLeadingB = match.scoreB > match.scoreA;

                  return (
                    <div
                      key={court.id}
                      className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-white p-4 sm:p-5 shadow-[6px_6px_0px_#000]"
                    >
                      {/* Court Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b-3 border-black mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ccff00] text-black text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000]">
                            #{court.courtNumber}
                          </span>
                          <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-black">
                            {court.courtName}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black bg-black text-white px-2 py-0.5 rounded">
                          RONDE #{match.roundNumber}
                        </span>
                      </div>

                      {/* Teams Grid Duel */}
                      <div className="grid grid-cols-2 gap-3 items-stretch">
                        {/* Tim A */}
                        <div
                          className={`flex flex-col justify-between rounded-xl p-3 border-2 border-black transition-all ${
                            isLeadingA
                              ? "bg-[#ccff00]/30 shadow-[3px_3px_0px_#000]"
                              : "bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-black uppercase text-black bg-[#ccff00] px-1.5 py-0.2 rounded border border-black inline-block mb-1.5">
                              TIM A
                            </span>
                            <div className="space-y-1">
                              {match.teamA.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-1">
                                  <span className="text-xs sm:text-sm font-black text-black truncate uppercase">
                                    {p.name}
                                  </span>
                                  <span
                                    className={`text-[8px] font-mono font-black px-1 rounded border ${
                                      p.gender === "M"
                                        ? "bg-blue-100 text-blue-900 border-blue-400"
                                        : "bg-pink-100 text-pink-900 border-pink-400"
                                    }`}
                                  >
                                    {p.gender === "M" ? "M" : "W"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skor Tim A */}
                          {session.allowSpectatorScoreUpdate ? (
                            <div className="mt-2.5 pt-2 border-t-2 border-black flex items-center justify-center gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => handleSpectatorUpdateScore(court.courtNumber, match.scoreA - 1, match.scoreB)}
                                disabled={match.scoreA <= 0}
                                className="h-8 w-8 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-black font-black text-base border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer shrink-0"
                                title="Kurangi 1 Poin Tim A"
                              >
                                -
                              </button>
                              <span className="font-mono-sport text-3xl sm:text-5xl font-black text-black tracking-tight min-w-[42px] text-center">
                                {match.scoreA}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpectatorUpdateScore(court.courtNumber, match.scoreA + 1, match.scoreB)}
                                className="h-8 w-8 rounded-lg bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-base border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer shrink-0"
                                title="Tambah 1 Poin Tim A"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div className="mt-2.5 pt-2 border-t-2 border-black text-center">
                              <span className="font-mono-sport text-4xl sm:text-5xl font-black text-black tracking-tight">
                                {match.scoreA}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tim B */}
                        <div
                          className={`flex flex-col justify-between rounded-xl p-3 border-2 border-black transition-all ${
                            isLeadingB
                              ? "bg-[#7dd3fc]/40 shadow-[3px_3px_0px_#000]"
                              : "bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-black uppercase text-black bg-[#7dd3fc] px-1.5 py-0.2 rounded border border-black inline-block mb-1.5">
                              TIM B
                            </span>
                            <div className="space-y-1">
                              {match.teamB.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-1">
                                  <span className="text-xs sm:text-sm font-black text-black truncate uppercase">
                                    {p.name}
                                  </span>
                                  <span
                                    className={`text-[8px] font-mono font-black px-1 rounded border ${
                                      p.gender === "M"
                                        ? "bg-blue-100 text-blue-900 border-blue-400"
                                        : "bg-pink-100 text-pink-900 border-pink-400"
                                    }`}
                                  >
                                    {p.gender === "M" ? "M" : "W"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skor Tim B */}
                          {session.allowSpectatorScoreUpdate ? (
                            <div className="mt-2.5 pt-2 border-t-2 border-black flex items-center justify-center gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => handleSpectatorUpdateScore(court.courtNumber, match.scoreA, match.scoreB - 1)}
                                disabled={match.scoreB <= 0}
                                className="h-8 w-8 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-black font-black text-base border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer shrink-0"
                                title="Kurangi 1 Poin Tim B"
                              >
                                -
                              </button>
                              <span className="font-mono-sport text-3xl sm:text-5xl font-black text-black tracking-tight min-w-[42px] text-center">
                                {match.scoreB}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpectatorUpdateScore(court.courtNumber, match.scoreA, match.scoreB + 1)}
                                className="h-8 w-8 rounded-lg bg-[#7dd3fc] hover:bg-[#38bdf8] text-black font-black text-base border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer shrink-0"
                                title="Tambah 1 Poin Tim B"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div className="mt-2.5 pt-2 border-t-2 border-black text-center">
                              <span className="font-mono-sport text-4xl sm:text-5xl font-black text-black tracking-tight">
                                {match.scoreB}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shortcut 1-Tap Pemenang (Hanya Muncul Jika Host Mengizinkan Wasit Penonton) */}
                      {session.allowSpectatorScoreUpdate && (
                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t-2 border-black">
                          <button
                            type="button"
                            onClick={() => {
                              const nextWinner = match.winner === "A" ? undefined : "A";
                              handleSpectatorUpdateScore(court.courtNumber, match.scoreA, match.scoreB, nextWinner);
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer truncate ${
                              match.winner === "A" || (match.scoreA > match.scoreB && !match.winner)
                                ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                                : "bg-white hover:bg-emerald-50 text-slate-800"
                            }`}
                            title="Klik cepat: Tandai Tim A Menang (Bisa tanpa input skor)"
                          >
                            👑 Tim A Menang
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextWinner = match.winner === "B" ? undefined : "B";
                              handleSpectatorUpdateScore(court.courtNumber, match.scoreA, match.scoreB, nextWinner);
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer truncate ${
                              match.winner === "B" || (match.scoreB > match.scoreA && !match.winner)
                                ? "bg-[#7dd3fc] text-black shadow-[2px_2px_0px_#000]"
                                : "bg-white hover:bg-sky-50 text-slate-800"
                            }`}
                            title="Klik cepat: Tandai Tim B Menang (Bisa tanpa input skor)"
                          >
                            👑 Tim B Menang
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Klasemen & Jatah Bermain Pemain */}
            <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-3 border-black">
                <h2 className="text-sm sm:text-base font-black uppercase text-black flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 stroke-[2.5]" />
                  <span>Daftar Giliran & Total Main Pemain</span>
                </h2>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-black">
                  Rotasi Adil ({session.players.length} Pemain)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[...session.players]
                  .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
                  .map((p, idx) => {
                    const tier = getTierLabel(p.publicTier);
                    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 border-black text-xs transition-all ${
                          p.isArrived === false
                            ? "bg-amber-50/70 border-dashed border-amber-500 opacity-90"
                            : "bg-[#faf8f2] hover:bg-white shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-mono font-black text-xs w-5 text-center shrink-0">
                            {medal}
                          </span>
                          <span className="font-black text-black truncate uppercase">{p.name}</span>
                          <span
                            className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border shrink-0 ${
                              p.gender === "M"
                                ? "bg-blue-100 text-blue-900 border-blue-400"
                                : "bg-pink-100 text-pink-900 border-pink-400"
                            }`}
                          >
                            {p.gender === "M" ? "M" : "W"}
                          </span>
                          <span
                            className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold border border-black shrink-0 ${tier.badgeColor}`}
                          >
                            {tier.label.replace("Tier ", "")}
                          </span>
                          {p.isArrived === false && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 border border-black text-amber-950 shrink-0">
                              ⏳ OTW
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-black font-black bg-[#ccff00] border-2 border-black px-2 py-0.5 rounded text-xs shadow-[1px_1px_0px_#000]">
                            {p.gamesPlayed}x Main
                          </span>

                          {/* Tombol Share Rekap Pemain Individual */}
                          <button
                            type="button"
                            onClick={() => setSharingPlayer(p)}
                            title={`Bagikan rekap mabar ${p.name}`}
                            className="h-7 w-7 rounded-lg border-2 border-black bg-[#00e5ff] flex items-center justify-center text-black hover:bg-[#00cce6] shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Toast Feedback Update Skor Wasit Penonton */}
      {spectatorToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 p-3 rounded-xl bg-black text-[#ccff00] border-2 border-black font-black text-xs shadow-[4px_4px_0px_#000] animate-in fade-in slide-in-from-bottom-2">
          <span>⚡ {spectatorToast}</span>
        </div>
      )}

      {/* Modal Keseluruhan Match & Jadwal Proyeksi untuk Penonton / Pemain */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
        session={session}
      />

      {/* Modal Rekap Hasil Pertandingan (Match Log) */}
      <MatchRecapModal
        isOpen={isMatchRecapModalOpen}
        onClose={() => setIsMatchRecapModalOpen(false)}
        session={session}
      />

      {/* Modal QR Code Penonton */}
      <SpectatorQrModal
        isOpen={isSpectatorQrOpen}
        onClose={() => setIsSpectatorQrOpen(false)}
        publicSlug={session.publicSlug}
        sessionTitle={session.title}
        courtLocation={session.courtLocation}
      />

      {/* Modal Share Rekap Pemain (Bisa Digunakan Penonton / Pemain) */}
      <PlayerShareModal
        isOpen={!!sharingPlayer}
        onClose={() => setSharingPlayer(null)}
        player={sharingPlayer}
        session={session}
      />
    </div>
  );
}

export default function LiveSpectatorPage({ params }: LivePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-black text-base">
          MEMUAT PAPAN PENONTON...
        </div>
      }
    >
      <LiveSpectatorContent params={params} />
    </Suspense>
  );
}
