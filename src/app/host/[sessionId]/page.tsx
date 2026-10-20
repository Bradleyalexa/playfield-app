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
  Package,
  Settings2,
  MapPin,
  ExternalLink,
  Shuffle,
  Undo2,
  Flag,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Lock,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Navbar } from "../../../components/common/Navbar";
import { CourtCard } from "../../../components/court/CourtCard";
import { EquipmentSettingsModal } from "../../../components/common/EquipmentSettingsModal";
import { AudioSettingsModal } from "../../../components/common/AudioSettingsModal";
import { PlayerRoster } from "../../../components/players/PlayerRoster";
import { WaPasteModal } from "../../../components/players/WaPasteModal";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { CreateCustomMatchModal } from "../../../components/schedule/CreateCustomMatchModal";
import { ReshuffleConsentModal } from "../../../components/schedule/ReshuffleConsentModal";
import { FinishSessionModal } from "../../../components/schedule/FinishSessionModal";
import { CompletedSessionRecap } from "../../../components/schedule/CompletedSessionRecap";
import { DonateCreatorModal } from "../../../components/common/DonateCreatorModal";
import { SpectatorQrModal } from "../../../components/common/SpectatorQrModal";
import { Match } from "../../../core/entities/match";
import { getTierFromSkill, Player } from "../../../core/entities/player";
import {
  ALGORITHM_REGISTRY,
  EquipmentConfig,
  GameSession,
  SessionBillingConfig,
  calculateEquipmentCost,
} from "../../../core/entities/session";
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
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastReshuffleSnapshot, setLastReshuffleSnapshot] = useState<GameSession | null>(null);

  // Modal Konfirmasi Alur Kocok Ulang (Consent Host)
  const [isReshuffleModalOpen, setIsReshuffleModalOpen] = useState(false);
  const [reshuffleTriggerReason, setReshuffleTriggerReason] = useState<"manual_button" | "player_added" | "player_removed">("manual_button");
  const [reshuffleExtraNotice, setReshuffleExtraNotice] = useState<string | undefined>(undefined);

  // Modal Ganti Suara Announcer / Wasit
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

  // Modal Selesaikan Mabar
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isSpectatorQrOpen, setIsSpectatorQrOpen] = useState(false);

  // Tips Praktis Host Mabar (Collapsible)
  const [isHostTipsOpen, setIsHostTipsOpen] = useState(false);

  // Otorisasi Akses Host (Mencegah Penonton Masuk ke Dashboard Kontrol)
  const [isHostAuthorized, setIsHostAuthorized] = useState<boolean | null>(null);
  const [hostKeyInput, setHostKeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Load session dari local storage atau fallback create demo jika tidak ditemukan
  useEffect(() => {
    let current = LocalStorageAdapter.getSession(sessionId);
    if (!current) {
      current = LocalStorageAdapter.createDemoSession("badminton");
    }

    // Auto-heal courts jika jumlah array court kurang dari courtCount (misal session lama terbuat hanya 2 lapangan)
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
      LocalStorageAdapter.saveSession(current);
    }

    // Cek Otorisasi Host
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get("key");
    const storedAuth = typeof window !== "undefined" ? localStorage.getItem(`playfield_host_auth_${current.id}`) : null;

    if (keyParam && current.adminKey && keyParam === current.adminKey) {
      localStorage.setItem(`playfield_host_auth_${current.id}`, keyParam);
      setIsHostAuthorized(true);
    } else if (storedAuth && current.adminKey && storedAuth === current.adminKey) {
      setIsHostAuthorized(true);
    } else if (current.id.startsWith("session-demo")) {
      setIsHostAuthorized(true);
    } else {
      const recent = LocalStorageAdapter.listRecentSessions();
      if (recent.some((r) => r.id === current.id || r.publicSlug === current.publicSlug)) {
        setIsHostAuthorized(true);
      } else {
        setIsHostAuthorized(false);
      }
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

  // Proteksi Akses: Jika penonton mencoba membuka halaman Host tanpa kunci
  if (isHostAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col selection:bg-[#ccff00] selection:text-black font-sans">
        <Navbar publicSlug={session.publicSlug} />
        <main className="flex-1 mx-auto max-w-lg w-full px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-full rounded-3xl border-3 sm:border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000] flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#ffde00] border-3 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
              🔒
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-black">
              Halaman Khusus Host
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
              Anda sedang mengakses dashboard kontrol sesi <strong>&quot;{session.title}&quot;</strong>. Untuk menjaga keamanan skor dan rotasi mabar, halaman kontrol ini hanya dapat diakses oleh penyelenggara (Host).
            </p>

            <div className="w-full flex flex-col gap-3 mt-2">
              <Link
                href={`/live/${session.publicSlug}`}
                className="w-full py-3 px-4 rounded-xl bg-[#ccff00] text-black font-black text-xs uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4 stroke-[2.5]" />
                <span>Buka Papan Penonton / Pemain</span>
              </Link>

              <div className="pt-4 border-t-2 border-black/15 flex flex-col gap-2 text-left">
                <span className="text-[11px] font-bold text-slate-600">
                  Apakah Anda adalah Host penyelenggara sesi ini?
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Masukkan Kunci Host"
                    value={hostKeyInput}
                    onChange={(e) => setHostKeyInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-black text-xs font-mono font-bold bg-[#faf8f2] focus:outline-none focus:bg-white"
                  />
                  <button
                    onClick={() => {
                      if (hostKeyInput.trim() === session.adminKey) {
                        localStorage.setItem(`playfield_host_auth_${session.id}`, hostKeyInput.trim());
                        setIsHostAuthorized(true);
                      } else {
                        setAuthError("Kunci Host salah. Silakan periksa kembali.");
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-black text-[#ccff00] font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Buka
                  </button>
                </div>
                {authError && (
                  <span className="text-xs font-bold text-rose-600">{authError}</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 1. Tambah Counter Shuttlecock / Bola (+1 Cock) atau Slop
  const handleAddCock = (delta: number = 1) => {
    if (!session) return;
    const current = session.sportConfig.equipment;
    const newTotal = Math.max(0, (current.totalUsed || 0) + delta);
    const unitsPerSlop = current.unitsPerSlop || 12;
    const updatedEquipment: EquipmentConfig = {
      ...current,
      totalUsed: newTotal,
      slopUsed:
        current.pricingModel === "per_slop"
          ? Math.max(1, Math.ceil(newTotal / unitsPerSlop))
          : current.slopUsed,
    };
    const updated: GameSession = {
      ...session,
      sportConfig: {
        ...session.sportConfig,
        equipment: updatedEquipment,
      },
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 1b. Tambah Pemakaian Shuttlecock / Bola khusus Lapangan Tertentu (Selalu +1 per klik)
  const handleAddCockToCourt = (courtNumber: number) => {
    if (!session) return;
    const current = session.sportConfig.equipment;
    const newTotal = Math.max(0, (current.totalUsed || 0) + 1);
    const unitsPerSlop = current.unitsPerSlop || 12;
    const updatedEquipment: EquipmentConfig = {
      ...current,
      totalUsed: newTotal,
      slopUsed:
        current.pricingModel === "per_slop"
          ? Math.max(1, Math.ceil(newTotal / unitsPerSlop))
          : current.slopUsed,
    };

    const updatedMatches = session.matches.map((m) => {
      if (m.courtNumber === courtNumber && m.status === "in_progress") {
        return {
          ...m,
          equipmentUsedCount: (m.equipmentUsedCount || 1) + 1,
        };
      }
      return m;
    });

    const updatedCourts = session.courts.map((c) => {
      if (c.courtNumber === courtNumber && c.currentMatch && c.currentMatch.status === "in_progress") {
        return {
          ...c,
          currentMatch: {
            ...c.currentMatch,
            equipmentUsedCount: (c.currentMatch.equipmentUsedCount || 1) + 1,
          },
        };
      }
      return c;
    });

    const updated: GameSession = {
      ...session,
      sportConfig: {
        ...session.sportConfig,
        equipment: updatedEquipment,
      },
      matches: updatedMatches,
      courts: updatedCourts,
    };

    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  const handleAddSlop = (delta: number = 1) => {
    if (!session) return;
    const current = session.sportConfig.equipment;
    const newSlop = Math.max(0, (current.slopUsed ?? 1) + delta);
    const updatedEquipment: EquipmentConfig = {
      ...current,
      slopUsed: newSlop,
    };
    const updated: GameSession = {
      ...session,
      sportConfig: {
        ...session.sportConfig,
        equipment: updatedEquipment,
      },
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  const handleSaveEquipment = (updatedEquipment: EquipmentConfig) => {
    if (!session) return;
    const updated: GameSession = {
      ...session,
      sportConfig: {
        ...session.sportConfig,
        equipment: updatedEquipment,
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
    // Pastikan seluruh lapangan terdaftar (auto-heal jika kurang dari session.courtCount)
    let currentCourts = [...session.courts];
    if (currentCourts.length < session.courtCount) {
      const existingNumbers = new Set(currentCourts.map((c) => c.courtNumber));
      const courtColors = ["Hijau", "Biru", "Merah", "Ungu", "Abu-abu", "Kuning", "Tosca", "Oranye"];
      for (let i = 1; i <= session.courtCount; i++) {
        if (!existingNumbers.has(i)) {
          const colorName = courtColors[(i - 1) % courtColors.length];
          currentCourts.push({
            id: `c${i}-${Date.now()}`,
            courtNumber: i,
            courtName: `Lapangan ${i} (Karpet ${colorName})`,
            currentMatch: undefined,
          });
        }
      }
      currentCourts.sort((a, b) => a.courtNumber - b.courtNumber);
    }

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

    // Arsipkan match in_progress sebelumnya menjadi completed jika ada
    const updatedMatches = session.matches.map((m) => {
      if (m.status === "in_progress") {
        return { ...m, status: "completed" as const, endedAt: new Date().toISOString() };
      }
      return m;
    });

    const updatedCourts = currentCourts.map((c) => {
      const matchForCourt = result.matches.find((m) => m.courtNumber === c.courtNumber);
      return { ...c, currentMatch: matchForCourt };
    });

    const updated: GameSession = {
      ...session,
      currentRound: nextRoundNumber,
      matches: [...updatedMatches, ...result.matches],
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

  // 6b. Hapus Pemain dari Roster
  const handleRemovePlayer = (playerId: string) => {
    const targetPlayer = session.players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    // Cek apakah pemain sedang bertanding di lapangan dengan skor yang sudah berjalan
    const assignedCourtWithActiveScore = session.courts.find(
      (c) =>
        c.currentMatch &&
        (c.currentMatch.teamA.some((p) => p.id === playerId) ||
          c.currentMatch.teamB.some((p) => p.id === playerId)) &&
        (c.currentMatch.scoreA > 0 || c.currentMatch.scoreB > 0)
    );

    if (assignedCourtWithActiveScore && assignedCourtWithActiveScore.currentMatch) {
      const confirmRemove = confirm(
        `Perhatian: "${targetPlayer.name}" sedang bermain di ${assignedCourtWithActiveScore.courtName} dengan skor (${assignedCourtWithActiveScore.currentMatch.scoreA} - ${assignedCourtWithActiveScore.currentMatch.scoreB}).\n\nJika dihapus, match di lapangan ini akan dibatalkan/dikosongkan.\nSemua riwayat pertandingan yang sudah selesai sebelumnya tetap aman tersimpan.\n\nYakin ingin menghapus pemain?`
      );
      if (!confirmRemove) return;
    }

    const updatedPlayers = session.players.filter((p) => p.id !== playerId);

    // Cari apakah pemain yang dihapus sedang terjadwal di lapangan yang belum bertanding (skor 0-0) atau yang dibatalkan
    const assignedCourt = session.courts.find(
      (c) =>
        c.currentMatch &&
        (c.currentMatch.teamA.some((p) => p.id === playerId) ||
          c.currentMatch.teamB.some((p) => p.id === playerId))
    );

    let updatedCourts = [...session.courts];
    let updatedMatches = [...session.matches];

    if (assignedCourt && assignedCourt.currentMatch) {
      // Hapus match yang anggotanya sudah tidak lengkap (hanya match aktif di lapangan saat ini, BUKAN match lama yang sudah selesai!)
      updatedMatches = updatedMatches.filter((m) => m.id !== assignedCourt.currentMatch!.id);
      updatedCourts = updatedCourts.map((c) =>
        c.id === assignedCourt.id ? { ...c, currentMatch: undefined } : c
      );
    }

    const updated: GameSession = {
      ...session,
      players: updatedPlayers,
      courts: updatedCourts,
      matches: updatedMatches,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    // Minta consent dari host untuk mengisi slot yang kosong
    if (assignedCourt) {
      setReshuffleTriggerReason("player_removed");
      setReshuffleExtraNotice(
        `Pemain "${targetPlayer?.name || "Pemain"}" sebelumnya terjadwal di ${assignedCourt.courtName}. Slot pemain kini kosong. Mau kocok ulang untuk mencari pengganti?`
      );
      setIsReshuffleModalOpen(true);
    }
  };

  // 6c. Buka Modal Konfirmasi Alur Kocok Ulang
  const handleOpenReshuffleModal = () => {
    setReshuffleTriggerReason("manual_button");
    setReshuffleExtraNotice(undefined);
    setIsReshuffleModalOpen(true);
  };

  // Eksekusi Kocok Ulang / Reshuffle Rotasi Pertandingan (Setelah Host Setuju di Modal)
  const executeReshuffle = () => {
    const activePlayers = session.players.filter((p) => p.status === "active");
    if (activePlayers.length < 4) {
      alert("Pemain aktif saat ini kurang dari 4 orang untuk membentuk pertandingan ganda!");
      return;
    }

    // Filter pemain yang sedang bermain di lapangan yang tidak di-reset (skor > 0)
    const lockedPlayerIds = new Set<string>();
    session.courts.forEach((c) => {
      if (c.currentMatch && (c.currentMatch.scoreA > 0 || c.currentMatch.scoreB > 0)) {
        c.currentMatch.teamA.forEach((p) => lockedPlayerIds.add(p.id));
        c.currentMatch.teamB.forEach((p) => lockedPlayerIds.add(p.id));
      }
    });

    const eligiblePool = activePlayers.filter((p) => !lockedPlayerIds.has(p.id));
    const emptyOrResetCourts = session.courts.filter(
      (c) => !c.currentMatch || (c.currentMatch.scoreA === 0 && c.currentMatch.scoreB === 0)
    );

    if (eligiblePool.length < 4 && emptyOrResetCourts.length > 0) {
      alert("Pemain yang siap dirotasi kurang dari 4 orang!");
      return;
    }

    const fresh = generateBalancedMatches(
      eligiblePool,
      emptyOrResetCourts.length,
      session.currentRound,
      session.algorithm || "fair_playtime",
      session.matches.filter((m) => m.status === "completed")
    );

    let updatedCourts = [...session.courts];
    let updatedMatches = [
      ...session.matches.filter((m) => m.status === "completed" || lockedPlayerIds.has(m.teamA[0]?.id)),
    ];

    emptyOrResetCourts.forEach((court, idx) => {
      const matchForCourt = fresh.matches[idx];
      if (matchForCourt) {
        const adjustedMatch: Match = { ...matchForCourt, courtNumber: court.courtNumber };
        updatedMatches.push(adjustedMatch);
        updatedCourts = updatedCourts.map((c) =>
          c.courtNumber === court.courtNumber ? { ...c, currentMatch: adjustedMatch } : c
        );
      } else {
        updatedCourts = updatedCourts.map((c) =>
          c.courtNumber === court.courtNumber ? { ...c, currentMatch: undefined } : c
        );
      }
    });

    const updated: GameSession = {
      ...session,
      matches: updatedMatches,
      courts: updatedCourts,
    };

    // Simpan snapshot sebelum perubahan untuk fitur Urungkan / Undo
    setLastReshuffleSnapshot(JSON.parse(JSON.stringify(session)));
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    } catch {}

    AudioAnnouncer.announceGeneral("Jadwal rotasi pemain telah dikocok ulang.");
  };

  // 6d. Urungkan Kocok Ulang / Undo Reshuffle
  const handleUndoReshuffle = () => {
    if (!lastReshuffleSnapshot) return;
    setSession(lastReshuffleSnapshot);
    LocalStorageAdapter.saveSession(lastReshuffleSnapshot);
    setLastReshuffleSnapshot(null);
    AudioAnnouncer.announceGeneral("Kocok ulang berhasil diurungkan.");
  };

  // 7. Tambah Pemain Manual Tunggal
  const handleAddSinglePlayer = (name: string, gender: "M" | "F", skillLevel: 1 | 2 | 3) => {
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
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

    const updatedPlayers = [...session.players, newPlayer];
    const updated: GameSession = {
      ...session,
      players: updatedPlayers,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    // Cek apakah ada lapangan yang kosong atau belum bermain, lalu minta consent host
    const emptyOrResetCourts = session.courts.filter(
      (c) => !c.currentMatch || (c.currentMatch.scoreA === 0 && c.currentMatch.scoreB === 0)
    );
    const activePool = updatedPlayers.filter((p) => p.status === "active");
    if (emptyOrResetCourts.length > 0 && activePool.length >= 4) {
      setReshuffleTriggerReason("player_added");
      setReshuffleExtraNotice(
        `Pemain "${name}" baru saja bergabung! Ada ${emptyOrResetCourts.length} lapangan yang belum bertanding/kosong. Mau langsung diacak agar ${name} bisa masuk lapangan sekarang?`
      );
      setIsReshuffleModalOpen(true);
    }
  };

  // 8. Import Pemain dari WhatsApp
  const handleImportWaPlayers = (newPlayers: Player[]) => {
    const updatedPlayers = [...session.players, ...newPlayers];
    const updated: GameSession = {
      ...session,
      players: updatedPlayers,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);

    // Cek apakah ada lapangan yang kosong atau belum bermain, lalu minta consent host
    const emptyOrResetCourts = session.courts.filter(
      (c) => !c.currentMatch || (c.currentMatch.scoreA === 0 && c.currentMatch.scoreB === 0)
    );
    const activePool = updatedPlayers.filter((p) => p.status === "active");
    if (emptyOrResetCourts.length > 0 && activePool.length >= 4) {
      setReshuffleTriggerReason("player_added");
      setReshuffleExtraNotice(
        `${newPlayers.length} pemain baru dari WhatsApp berhasil diimpor. Mau kocok ulang lapangan yang belum bertanding agar pemain baru langsung masuk sekarang?`
      );
      setIsReshuffleModalOpen(true);
    }
  };

  // 9. Simpan Custom Match yang disusun manual oleh host
  const handleSaveCustomMatch = (newMatch: Match, assignToCourtImmediately: boolean) => {
    let updatedCourts = [...session.courts];
    if (assignToCourtImmediately) {
      updatedCourts = updatedCourts.map((c) => {
        if (c.courtNumber === newMatch.courtNumber) {
          return { ...c, currentMatch: newMatch };
        }
        return c;
      });
    }

    const updated: GameSession = {
      ...session,
      matches: [...session.matches, newMatch],
      courts: updatedCourts,
    };

    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 9. Selesaikan Sesi Mabar Resmi & Tampilkan Podium Rekap
  const handleConfirmFinishSession = (updatedBilling?: SessionBillingConfig) => {
    const updated: GameSession = {
      ...session,
      status: "completed",
      billing: updatedBilling || session.billing,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
    setIsFinishModalOpen(false);

    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } });
    } catch {}

    AudioAnnouncer.announceGeneral("Sesi mabar hari ini resmi diselesaikan! Terima kasih semua pemain.");

    // Langsung buka popup modal donasi creator setelah konfirmasi selesaikan mabar
    setTimeout(() => {
      setIsDonateModalOpen(true);
    }, 600);
  };

  // 9b. Update Konfigurasi Biaya Billing dari Kartu Rekap
  const handleUpdateBilling = (updatedBilling: SessionBillingConfig) => {
    const updated: GameSession = {
      ...session,
      billing: updatedBilling,
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
  };

  // 10. Buka Kembali Sesi Mabar (Safety valve jika salah klik)
  const handleReopenSession = () => {
    const updated: GameSession = {
      ...session,
      status: "active",
    };
    setSession(updated);
    LocalStorageAdapter.saveSession(updated);
    AudioAnnouncer.announceGeneral("Sesi mabar telah dibuka kembali.");
  };

  const handleCopySpectatorLink = () => {
    const url = `${window.location.origin}/live/${session.publicSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalEquipmentCost = calculateEquipmentCost(session.sportConfig.equipment);

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col selection:bg-[#ccff00] selection:text-black">
      <Navbar publicSlug={session.publicSlug} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-3.5 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-8 flex flex-col gap-5 sm:gap-6">
        {/* Banner Sultan jika aktif */}
        {session.sultanSponsor && (
          <div className="flex items-center justify-between rounded-2xl bg-[#ffde00] border-3 border-black p-4 shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000]">
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

        {/* Rekap Selesai Mabar & Podium (Jika sesi berstatus completed) */}
        {session.status === "completed" && (
          <CompletedSessionRecap
            session={session}
            isHost={true}
            onReopenSession={handleReopenSession}
            onUpdateBilling={handleUpdateBilling}
          />
        )}

        {/* Top Control Bar: Info Sesi & Tombol Aksi Cepat */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-lg bg-black px-2.5 py-0.5 text-xs font-black text-white uppercase font-mono border border-black">
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
            {session.courtLocation && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-md">{session.courtLocation}</span>
                {session.googleMapsUrl && (
                  <a
                    href={session.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-950 font-black text-[10px] uppercase transition-colors"
                  >
                    <span>Maps</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            )}
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

            {/* Counter Shuttlecock / Bola & Slop Tracker (Hanya jika diaktifkan host) */}
            {session.sportConfig.equipment?.enabled !== false && (
              <div className="flex items-center rounded-xl bg-[#ffde00] border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    session.sportConfig.equipment.pricingModel === "per_slop"
                      ? handleAddSlop(1)
                      : handleAddCock(1)
                  }
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-[#ebd000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="Klik untuk tambah pemakaian"
                >
                  {session.sportConfig.equipment.pricingModel === "per_slop" ? (
                    <>
                      <Package className="h-4 w-4 stroke-[2.5]" />
                      <span>
                        +1 {session.sport === "badminton" ? "Slop" : "Can"} (
                        {session.sportConfig.equipment.slopUsed ?? 1})
                      </span>
                    </>
                  ) : (
                    <>
                      <Flame className="h-4 w-4 fill-black" />
                      <span>
                        +1 {session.sportConfig.equipment.unitName === "shuttlecock" ? "Cock" : "Ball"} (
                        {session.sportConfig.equipment.totalUsed})
                      </span>
                    </>
                  )}
                  <span className="text-[10px] font-mono text-slate-900 font-black">
                    ({formatRupiah(totalEquipmentCost)})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEquipmentModalOpen(true)}
                  className="p-2 border-l-2 border-black hover:bg-black hover:text-[#ffde00] text-black transition-colors cursor-pointer"
                  title="Atur harga custom & ganti model hitung per cock / per slop"
                >
                  <Settings2 className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            )}

            {/* Sultan Mode Button */}
            <button
              onClick={handleSultanMode}
              className="flex items-center gap-1.5 rounded-xl bg-[#f472b6] border-2 border-black px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
              <span>Sultan Mode</span>
            </button>

            {/* Tombol Susun Match Sendiri */}
            <button
              onClick={() => setIsCreateMatchModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#fef08a] border-2 border-black px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#fde047] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Susun Match</span>
            </button>

            {/* Tombol Kocok Ulang / Reshuffle Rotasi (Membuka Modal Alur & Konfirmasi) */}
            <button
              onClick={handleOpenReshuffleModal}
              className="flex items-center gap-1.5 rounded-xl bg-[#00e5ff] border-2 border-black px-3.5 sm:px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#00cce6] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
              title="Kocok ulang giliran pemain untuk lapangan yang belum bertanding atau kosong"
            >
              <Shuffle className="h-4 w-4 stroke-[2.5]" />
              <span>Kocok Ulang</span>
            </button>

            {/* Tombol Urungkan Kocok Ulang (Jika baru saja kocok ulang) */}
            {lastReshuffleSnapshot && (
              <button
                onClick={handleUndoReshuffle}
                className="flex items-center gap-1.5 rounded-xl bg-[#ffde00] border-2 border-black px-3 sm:px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer animate-in fade-in"
                title="Urungkan kocok ulang dan kembalikan susunan match sebelumnya"
              >
                <Undo2 className="h-4 w-4 stroke-[2.5]" />
                <span>Urungkan</span>
              </button>
            )}

            {/* Mulai Ronde Berikutnya */}
            <button
              onClick={handleNextRound}
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-4 sm:px-5 py-2.5 text-xs font-black text-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <FastForward className="h-4 w-4 stroke-[3]" />
              <span>Ronde Berikutnya</span>
            </button>

            {/* Selesaikan Mabar / Buka Kembali Sesi */}
            {session.status === "completed" ? (
              <button
                onClick={handleReopenSession}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-3.5 sm:px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                title="Buka kembali sesi mabar untuk menambah match"
              >
                <Undo2 className="h-4 w-4 stroke-[3]" />
                <span>Buka Kembali Sesi</span>
              </button>
            ) : (
              <button
                onClick={() => setIsFinishModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white px-3.5 sm:px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                title="Selesaikan sesi mabar hari ini, hitung rekap podium juara & pembagian biaya cock"
              >
                <Flag className="h-4 w-4 stroke-[3]" />
                <span>Selesaikan Mabar 🏁</span>
              </button>
            )}
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
            <button
              type="button"
              onClick={() => setIsAudioSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3.5 py-1.5 font-black uppercase text-black hover:bg-[#ccff00] shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
              title="Ganti karakter suara wasit / announcer speaker GOR (Cewek, Cowok, Wasit Robot)"
            >
              <Volume2 className="h-4 w-4 stroke-[2.5]" />
              <span>Ganti Suara Wasit</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Tampilkan QR Code Penonton */}
            <button
              type="button"
              onClick={() => setIsSpectatorQrOpen(true)}
              className="flex items-center gap-1.5 font-black uppercase text-black bg-[#ffde00] hover:bg-[#ebd000] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Tampilkan QR Code untuk di-scan oleh pemain atau penonton di GOR"
            >
              <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>QR Penonton</span>
            </button>

            {/* Tombol Salin Link Penonton */}
            <button
              type="button"
              onClick={handleCopySpectatorLink}
              className="flex items-center gap-1.5 font-black uppercase text-black hover:text-slate-600 font-mono bg-[#ccff00] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Copy className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span>{copiedLink ? "Link Tersalin!" : "Salin Link"}</span>
            </button>
          </div>
        </div>

        {/* Accordion / Card Tips Praktis untuk Host */}
        <div className="rounded-2xl border-3 border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsHostTipsOpen(!isHostTipsOpen)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-[#fef08a] hover:bg-[#fde047] transition-colors text-left cursor-pointer border-b-2 border-black"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[#ccff00] font-black text-xs border border-black shadow-[1px_1px_0px_#000]">
                💡
              </span>
              <div>
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-black block">
                  Tips &amp; Panduan Praktis Host Mabar
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">
                  Aturan Pause vs Hapus Pemain, Pemain Baru Datang, Kocok Ulang &amp; Selesai Mabar
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black bg-white px-2.5 py-1 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
              <span>{isHostTipsOpen ? "Tutup" : "Buka Tips"}</span>
              {isHostTipsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {isHostTipsOpen && (
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-white text-xs text-black animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl border-2 border-black bg-[#faf8f2] shadow-[2px_2px_0px_#000] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-black uppercase text-black">
                  <span className="bg-[#ffde00] px-1.5 py-0.5 rounded border border-black text-[11px]">⏸️ Pause (Rehat)</span>
                  <span>vs</span>
                  <span className="bg-rose-200 px-1.5 py-0.5 rounded border border-black text-[11px]">🗑️ Hapus Pemain</span>
                </div>
                <p className="font-bold text-slate-700 leading-relaxed text-[11px]">
                  • <strong className="text-black">Gunakan Pause (⏸️)</strong> jika pemain istirahat, ke toilet, cedera ringan, atau pulang lebih awal. Pemain akan dilewati dari antrean ronde berikutnya, <u>tetapi rekap kemenangan, total poin, dan patungan cock mereka tetap aman tercatat</u>. Klik <strong>Play (▶️)</strong> saat siap main lagi.<br />
                  • <strong className="text-black">Gunakan Hapus (🗑️)</strong> hanya jika salah ketik nama atau pemain batal hadir sama sekali.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-black bg-[#faf8f2] shadow-[2px_2px_0px_#000] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-black uppercase text-black">
                  <span className="bg-[#ccff00] px-1.5 py-0.5 rounded border border-black text-[11px]">➕ Pemain Telat Datang</span>
                </div>
                <p className="font-bold text-slate-700 leading-relaxed text-[11px]">
                  Pemain baru dapat ditambahkan kapan saja lewat form roster atau tombol WhatsApp Paste. Pemain baru otomatis tercatat dengan jam terbang <strong className="text-black">0x Main</strong>, sehingga algoritma Playfield akan <u>langsung memprioritaskan mereka masuk ke lapangan</u> pada ronde berikutnya atau saat kocok ulang.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-black bg-[#faf8f2] shadow-[2px_2px_0px_#000] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-black uppercase text-black">
                  <span className="bg-[#00e5ff] px-1.5 py-0.5 rounded border border-black text-[11px]">🔄 Kocok Ulang</span>
                  <span>vs</span>
                  <span className="bg-[#ccff00] px-1.5 py-0.5 rounded border border-black text-[11px]">⏩ Ronde Berikutnya</span>
                </div>
                <p className="font-bold text-slate-700 leading-relaxed text-[11px]">
                  • <strong className="text-black">Kocok Ulang</strong>: Dipakai jika ada pemain berhalangan mendadak di lapangan yang belum bertanding (skor 0-0), tanpa memajukan nomor ronde.<br />
                  • <strong className="text-black">Ronde Berikutnya</strong>: Dipakai setelah seluruh lapangan menyelesaikan pertandingannya untuk memutar seluruh rotasi pemain ke ronde baru.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-black bg-[#faf8f2] shadow-[2px_2px_0px_#000] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-black uppercase text-black">
                  <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded border border-black text-[11px]">🏁 Selesaikan Mabar</span>
                </div>
                <p className="font-bold text-slate-700 leading-relaxed text-[11px]">
                  Tekan tombol merah <strong>&quot;Selesaikan Mabar 🏁&quot;</strong> di akhir sesi untuk menampilkan Podium Juara 1, 2, 3, MVP mabar, pembagian patungan bola, dan generate ringkasan WhatsApp siap kirim ke grup.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Grid Lapangan (Court Cards) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-2">
              <span>Lapangan Pertandingan Aktif</span>
              <span className="text-xs text-black/60 font-mono font-bold">
                (Tap + / - untuk update skor)
              </span>
            </h2>

            <button
              onClick={() => setIsCreateMatchModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Tambah Match Manual</span>
            </button>
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
                onAddCockToMatch={handleAddCockToCourt}
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
          onRemovePlayer={handleRemovePlayer}
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

      {/* Modal Susun Match Manual (Custom Match by Host) */}
      <CreateCustomMatchModal
        isOpen={isCreateMatchModalOpen}
        onClose={() => setIsCreateMatchModalOpen(false)}
        session={session}
        onSaveCustomMatch={handleSaveCustomMatch}
      />

      {/* Modal Pengaturan Biaya Cock / Bola & Slop */}
      {isEquipmentModalOpen && (
        <EquipmentSettingsModal
          isOpen={isEquipmentModalOpen}
          onClose={() => setIsEquipmentModalOpen(false)}
          equipment={session.sportConfig.equipment}
          sport={session.sport}
          onSave={handleSaveEquipment}
        />
      )}

      {/* Modal Konfirmasi & Alur Kocok Ulang (Reshuffle Consent) */}
      <ReshuffleConsentModal
        isOpen={isReshuffleModalOpen}
        onClose={() => setIsReshuffleModalOpen(false)}
        onConfirm={executeReshuffle}
        session={session}
        triggerReason={reshuffleTriggerReason}
        extraNotice={reshuffleExtraNotice}
      />

      {/* Modal Pengaturan Karakter Suara Announcer / Wasit */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
      />

      {/* Modal Selesaikan Sesi Mabar */}
      <FinishSessionModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirmFinish={handleConfirmFinishSession}
        session={session}
      />

      {/* Modal Donasi ke Creator Playfield (Muncul setelah selesaikan mabar) */}
      <DonateCreatorModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      {/* Modal QR Code Papan Penonton */}
      <SpectatorQrModal
        isOpen={isSpectatorQrOpen}
        onClose={() => setIsSpectatorQrOpen(false)}
        publicSlug={session.publicSlug}
        sessionTitle={session.title}
        courtLocation={session.courtLocation}
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
