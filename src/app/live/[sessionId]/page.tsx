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
} from "lucide-react";
import { Navbar } from "../../../components/common/Navbar";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { CompletedSessionRecap } from "../../../components/schedule/CompletedSessionRecap";
import { PlayerShareModal } from "../../../components/players/PlayerShareModal";
import { SpectatorQrModal } from "../../../components/common/SpectatorQrModal";
import { getTierLabel, Player } from "../../../core/entities/player";
import { ALGORITHM_REGISTRY, GameSession } from "../../../core/entities/session";
import { LocalStorageAdapter } from "../../../services/storage/local-storage.adapter";

interface LivePageProps {
  params: Promise<{ sessionId: string }>;
}

function LiveSpectatorContent({ params }: LivePageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<GameSession | null>(null);
  const [isAllMatchesModalOpen, setIsAllMatchesModalOpen] = useState(false);
  const [isSpectatorQrOpen, setIsSpectatorQrOpen] = useState(false);
  const [sharingPlayer, setSharingPlayer] = useState<Player | null>(null);

  // Waktu & Countdown Sewa Lapangan
  const [currentTime, setCurrentTime] = useState("");
  const [rentalInfo, setRentalInfo] = useState<{
    status: "UPCOMING" | "IN_PROGRESS" | "OVERTIME";
    label: string;
    formattedTime: string;
    bgClass: string;
    textClass: string;
  }>({
    status: "IN_PROGRESS",
    label: "Sisa Sewa",
    formattedTime: "--:--:--",
    bgClass: "bg-[#ccff00]",
    textClass: "text-black",
  });

  useEffect(() => {
    let current = LocalStorageAdapter.getSession(sessionId);
    if (!current) {
      current = LocalStorageAdapter.createDemoSession("badminton");
    }

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

    setSession(current);

    const handleSync = (e: any) => {
      if (e.detail && (e.detail.id === sessionId || e.detail.publicSlug === sessionId)) {
        setSession(e.detail);
      }
    };
    window.addEventListener("clubcourt:session_updated", handleSync);
    return () => window.removeEventListener("clubcourt:session_updated", handleSync);
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

      try {
        const [h, m] = (session.startTime || "19:00").split(":").map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);

        const durationMs = (session.durationHours || 2) * 3600 * 1000;
        const end = new Date(start.getTime() + durationMs);

        const nowMs = now.getTime();
        const startMs = start.getTime();
        const endMs = end.getTime();

        const formatDiff = (diffMs: number) => {
          const totalSec = Math.max(0, Math.floor(diffMs / 1000));
          const hours = Math.floor(totalSec / 3600);
          const minutes = Math.floor((totalSec % 3600) / 60);
          const seconds = totalSec % 60;
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        };

        if (nowMs < startMs) {
          setRentalInfo({
            status: "UPCOMING",
            label: "Mulai dlm",
            formattedTime: formatDiff(startMs - nowMs),
            bgClass: "bg-[#00e5ff]",
            textClass: "text-black",
          });
        } else if (nowMs <= endMs) {
          setRentalInfo({
            status: "IN_PROGRESS",
            label: "Sisa Sewa",
            formattedTime: formatDiff(endMs - nowMs),
            bgClass: "bg-[#ccff00]",
            textClass: "text-black",
          });
        } else {
          setRentalInfo({
            status: "OVERTIME",
            label: "Overtime",
            formattedTime: `+${formatDiff(nowMs - endMs)}`,
            bgClass: "bg-[#ff0055]",
            textClass: "text-white animate-pulse",
          });
        }
      } catch {}
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime, session?.durationHours]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-black text-base">
        MEMUAT PAPAN PERTANDINGAN...
      </div>
    );
  }

  const isCompleted = session.status === "completed";
  const algo = ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-white shadow-[6px_6px_0px_#000]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-lg bg-[#ccff00] border-2 border-black font-black shadow-[2px_2px_0px_#000]">
                    {session.sport.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] ${algo.badgeColor}`}
                  >
                    {algo.icon} {algo.shortName}
                  </span>
                  <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded font-mono border border-black">
                    RONDE #{session.currentRound}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tight truncate">
                  {session.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mt-1 font-mono-sport">
                  <span>{session.courtCount} LAPANGAN</span>
                  <span>•</span>
                  <span>{session.players.length} PEMAIN TERDAFTAR</span>
                  <span>•</span>
                  <span>
                    JADWAL: {session.startTime || "19:00"} ({session.durationHours || 2} JAM)
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
                  <div className="flex items-center gap-1.5 rounded-xl bg-[#ffde00] border-2 border-black px-3 py-1.5 font-mono-sport text-xs font-black shadow-[2px_2px_0px_#000]">
                    <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{currentTime || "--:--:--"}</span>
                  </div>

                  {/* Sisa Waktu Sewa Lapangan */}
                  <div
                    className={`flex items-center gap-1.5 rounded-xl ${rentalInfo.bgClass} ${rentalInfo.textClass} border-2 border-black px-3 py-1.5 font-mono-sport text-xs font-black shadow-[2px_2px_0px_#000]`}
                  >
                    <Timer className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span className="uppercase text-[9px] font-sans font-bold">{rentalInfo.label}:</span>
                    <span>{rentalInfo.formattedTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setIsSpectatorQrOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffde00] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#ffe640] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    title="Buka QR Code Penonton"
                  >
                    <QrCode className="h-4 w-4 stroke-[2.5]" />
                    <span>Bagikan QR</span>
                  </button>

                  <button
                    onClick={() => setIsAllMatchesModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#ccff00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 stroke-[2.5]" />
                    <span>Jadwal Lengkap</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    <span className="text-xs font-black font-mono tracking-wider">LIVE</span>
                  </div>
                </div>
              </div>
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

                          <div className="mt-2.5 pt-2 border-t-2 border-black text-center">
                            <span className="font-mono-sport text-4xl sm:text-5xl font-black text-black tracking-tight">
                              {match.scoreA}
                            </span>
                          </div>
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

                          <div className="mt-2.5 pt-2 border-t-2 border-black text-center">
                            <span className="font-mono-sport text-4xl sm:text-5xl font-black text-black tracking-tight">
                              {match.scoreB}
                            </span>
                          </div>
                        </div>
                      </div>
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
                  <span>Daftar Giliran & Jam Terbang Pemain</span>
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
                        className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f2] border-2 border-black text-xs shadow-[2px_2px_0px_#000] hover:bg-white transition-all"
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

      {/* Modal Keseluruhan Match & Jadwal Proyeksi untuk Penonton / Pemain */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
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
