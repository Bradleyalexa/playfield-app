"use client";

import { Suspense, useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Sparkles,
  Volume2,
  Tv,
  Users,
  FastForward,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Plus,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Navbar } from "../../../components/common/Navbar";
import { CourtCard } from "../../../components/court/CourtCard";
import { PlayerRoster } from "../../../components/players/PlayerRoster";
import { WaPasteModal } from "../../../components/players/WaPasteModal";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { getTierFromSkill, Player } from "../../../core/entities/player";
import { ALGORITHM_REGISTRY, GameSession } from "../../../core/entities/session";
import { generateBalancedMatches } from "../../../core/matchmaking/balanced-queue";
import { formatRupiah } from "../../../lib/utils";
import { AudioAnnouncer } from "../../../services/audio/announcer";
import { LocalStorageAdapter } from "../../../services/storage/local-storage.adapter";

interface HostPageProps {
  params: Promise<{ sessionId: string }>;
}

function HostDashboardContent({ params }: HostPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<GameSession | null>(null);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isAllMatchesModalOpen, setIsAllMatchesModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load session dari local storage atau fallback create demo jika tidak ditemukan
  useEffect(() => {
    let current = LocalStorageAdapter.getSession(sessionId);
    if (!current) {
      current = LocalStorageAdapter.createDemoSession("badminton");
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

  if (!session) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-bold">
        Memuat sesi mabar...
      </div>
    );
  }

  // 1. Tambah Counter Shuttlecock / Bola (+1 Cock)
  const handleAddCock = () => {
    const updated: GameSession = {
      ...session,
      sportConfig: {
        ...session.sportConfig,
        equipment: {
          ...session.sportConfig.equipment,
          totalUsed: session.sportConfig.equipment.totalUsed + 1,
        },
      },
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 2. Update Skor Lapangan
  const handleUpdateScore = (courtNumber: number, scoreA: number, scoreB: number) => {
    const updatedMatches = session.matches.map((m) => {
      if (m.courtNumber === courtNumber && m.status === "in_progress") {
        return { ...m, scoreA, scoreB };
      }
      return m;
    });

    const updatedCourts = session.courts.map((c) => {
      if (c.courtNumber === courtNumber && c.currentMatch) {
        return { ...c, currentMatch: { ...c.currentMatch, scoreA, scoreB } };
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
  };

  // 3. Selesaikan Pertandingan Lapangan Ini
  const handleFinishMatch = (courtNumber: number) => {
    const currentMatch = session.matches.find((m) => m.courtNumber === courtNumber && m.status === "in_progress");
    if (!currentMatch) return;

    // Trigger selebrasi confetti jika ada yang menang
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const winnerTeam = currentMatch.scoreA > currentMatch.scoreB ? "A" : "B";
    const winners = winnerTeam === "A" ? currentMatch.teamA : currentMatch.teamB;
    AudioAnnouncer.announceWinner(courtNumber, winnerTeam, winners, currentMatch.scoreA, currentMatch.scoreB);

    // Update match status & gamesPlayed pemain
    const updatedPlayers = session.players.map((p) => {
      const playedInThis =
        currentMatch.teamA.some((t) => t.id === p.id) || currentMatch.teamB.some((t) => t.id === p.id);
      if (playedInThis) {
        return {
          ...p,
          gamesPlayed: p.gamesPlayed + 1,
          lastPlayedRound: session.currentRound,
        };
      }
      return p;
    });

    const updatedMatches = session.matches.map((m) => {
      if (m.id === currentMatch.id) {
        return { ...m, status: "completed" as const, endedAt: new Date().toISOString() };
      }
      return m;
    });

    const updatedCourts = session.courts.map((c) => {
      if (c.courtNumber === courtNumber) {
        return { ...c, currentMatch: undefined };
      }
      return c;
    });

    const updated: GameSession = {
      ...session,
      players: updatedPlayers,
      matches: updatedMatches,
      courts: updatedCourts,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 4. Mulai Ronde Berikutnya (Algoritma Penyeimbang Otomatis)
  const handleNextRound = () => {
    const nextRoundNumber = session.currentRound + 1;
    const result = generateBalancedMatches(
      session.players,
      session.courtCount,
      nextRoundNumber,
      session.algorithm || "fair_playtime",
      session.matches
    );

    if (result.matches.length === 0) {
      alert("Pemain aktif kurang dari 4 orang untuk membentuk match ganda!");
      return;
    }

    const updatedCourts = session.courts.map((c) => {
      const matchForCourt = result.matches.find((m) => m.courtNumber === c.courtNumber);
      return { ...c, currentMatch: matchForCourt };
    });

    const updated: GameSession = {
      ...session,
      currentRound: nextRoundNumber,
      matches: [...session.matches, ...result.matches],
      courts: updatedCourts,
    };

    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    // Panggil audio announcement otomatis
    AudioAnnouncer.announceGeneral(`Ronde ${nextRoundNumber} dimulai. Seluruh pemain harap bersiap di lapangan.`);
  };

  // 5. Sultan Mode (Traktiran Bos)
  const handleSultanMode = () => {
    const sponsor = prompt("Masukkan nama donatur / bos yang mentraktir mabar malam ini:", "Bos Hendra");
    if (!sponsor) return;

    const updated: GameSession = {
      ...session,
      sultanSponsor: sponsor.trim(),
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    try {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    } catch {}

    AudioAnnouncer.announceGeneral(
      `Perhatian seluruh anggota. Mabar malam ini disponsori penuh oleh ${sponsor}! Terima kasih kepada donatur.`
    );
  };

  // 6. Pause / Resume Pemain
  const handleTogglePlayerPause = (playerId: string) => {
    const updatedPlayers = session.players.map((p) => {
      if (p.id === playerId) {
        const nextStatus = p.status === "paused" ? ("active" as const) : ("paused" as const);
        return { ...p, status: nextStatus };
      }
      return p;
    });

    const updated: GameSession = { ...session, players: updatedPlayers };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 7. Tambah Pemain Manual Tunggal
  const handleAddSinglePlayer = (name: string, gender: "M" | "F", skillLevel: 1 | 2 | 3) => {
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name,
      gender,
      skillLevel,
      publicTier: getTierFromSkill(skillLevel),
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1000 + (skillLevel - 2) * 100,
      createdAt: new Date().toISOString(),
    };

    const updated: GameSession = { ...session, players: [...session.players, newPlayer] };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 8. Import Pemain dari WhatsApp
  const handleImportWaPlayers = (newPlayers: Player[]) => {
    const updated: GameSession = { ...session, players: [...session.players, ...newPlayers] };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  const handleCopySpectatorLink = () => {
    const url = `${window.location.origin}/live/${session.publicSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalEquipmentCost = session.sportConfig.equipment.totalUsed * session.sportConfig.equipment.costPerUnit;

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col selection:bg-[#ccff00] selection:text-black">
      <Navbar publicSlug={session.publicSlug} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Banner Sultan jika aktif */}
        {session.sultanSponsor && (
          <div className="flex items-center justify-between rounded-2xl bg-[#ffde00] border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-black stroke-[3]" />
              <div>
                <span className="font-black text-black text-sm uppercase tracking-wider block">
                  👑 SULTAN MODE AKTIF: Disponsori Penuh oleh {session.sultanSponsor}!
                </span>
                <p className="text-xs font-bold text-slate-800">Tagihan seluruh peserta sesi ini dipotong Rp 0.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const updated = { ...session, sultanSponsor: undefined };
                setSession(updated);
                LocalStorageAdapter.saveSession(updated);
              }}
              className="text-xs font-black uppercase tracking-wider text-black underline hover:text-slate-700"
            >
              Matikan
            </button>
          </div>
        )}

        {/* Top Control Bar: Info Sesi & Tombol Aksi Cepat */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border-3 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded bg-black px-2 py-0.5 text-xs font-black text-[#ccff00] uppercase font-mono">
                {session.sport}
              </span>
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-black ${
                  (ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"]).badgeColor
                }`}
              >
                {(ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"]).icon}{" "}
                {(ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"]).shortName}
              </span>
              <span className="text-[11px] font-mono font-bold text-black/60 bg-[#faf8f2] px-2 py-0.5 rounded border border-black">
                {session.startTime || "19:00"} ({session.durationHours || 2} Jam) • ~{session.matchDurationMinutes || 15}m/Match
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black uppercase tracking-wide">
              {session.title}
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider font-mono">
              RONDE #{session.currentRound} • {session.courtCount} LAPANGAN • {session.players.length} PEMAIN TERDAFTAR
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Lihat Jadwal & Proyeksi Match */}
            <button
              onClick={() => setIsAllMatchesModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white border-2 border-black px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#faf8f2] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4 stroke-[2.5]" />
              <span>Jadwal & Match ({session.estimatedMatchesCount || 26})</span>
            </button>

            {/* Counter Shuttlecock / Bola */}
            <button
              onClick={handleAddCock}
              className="flex items-center gap-2 rounded-xl bg-[#ffde00] border-2 border-black px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
              title="Klik tiap kali buka cock/bola baru"
            >
              <Flame className="h-4 w-4 fill-black" />
              <span>
                +1 {session.sportConfig.equipment.unitName === "shuttlecock" ? "Cock" : "Ball"} (
                {session.sportConfig.equipment.totalUsed})
              </span>
              <span className="text-[10px] font-mono text-slate-800">({formatRupiah(totalEquipmentCost)})</span>
            </button>

            {/* Sultan Mode Button */}
            <button
              onClick={handleSultanMode}
              className="flex items-center gap-1.5 rounded-xl bg-[#f472b6] border-2 border-black px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
              <span>Sultan Mode</span>
            </button>

            {/* Mulai Ronde Berikutnya */}
            <button
              onClick={handleNextRound}
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-5 py-2.5 text-xs font-black text-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <FastForward className="h-4 w-4 stroke-[3]" />
              <span>Ronde Berikutnya</span>
            </button>
          </div>
        </div>

        {/* Sub-bar Tombol Tautan Kiosk & Papan Penonton */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/kiosk/${session.publicSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3.5 py-1.5 font-black uppercase text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] transition-all"
            >
              <Tv className="h-4 w-4 stroke-[2.5]" />
              <span>Buka Mode TV GOR (Kiosk Layar Penuh)</span>
            </Link>
            <Link
              href={`/live/${session.publicSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3.5 py-1.5 font-black uppercase text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] transition-all"
            >
              <Users className="h-4 w-4 stroke-[2.5]" />
              <span>Buka Papan Penonton</span>
            </Link>
          </div>

          <button
            onClick={handleCopySpectatorLink}
            className="flex items-center gap-1.5 font-black uppercase text-black hover:text-slate-600 font-mono-sport bg-[#ccff00] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Copy className="h-3.5 w-3.5 stroke-[2.5]" />}
            <span>{copiedLink ? "Link Tersalin!" : "Salin Link Penonton"}</span>
          </button>
        </div>

        {/* Grid Lapangan (Court Cards) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Lapangan Pertandingan Aktif</span>
              <span className="text-xs text-slate-400 font-normal">
                (Tap + / - untuk update skor real-time)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {session.courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                match={court.currentMatch}
                sportConfig={session.sportConfig}
                onUpdateScore={handleUpdateScore}
                onFinishMatch={handleFinishMatch}
                onAddCockToMatch={handleAddCock}
              />
            ))}
          </div>
        </div>

        {/* Daftar Pemain & Antrean Istirahat (Roster) */}
        <PlayerRoster
          session={session}
          onTogglePlayerPause={handleTogglePlayerPause}
          onOpenWaModal={() => setIsWaModalOpen(true)}
          onAddSinglePlayer={handleAddSinglePlayer}
        />
      </main>

      {/* Modal WhatsApp Paste */}
      <WaPasteModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        onImportPlayers={handleImportWaPlayers}
      />

      {/* Modal Keseluruhan Match & Jadwal Proyeksi */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
        session={session}
      />
    </div>
  );
}

export default function HostDashboardPage({ params }: HostPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-bold">
          Memuat sesi mabar...
        </div>
      }
    >
      <HostDashboardContent params={params} />
    </Suspense>
  );
}
