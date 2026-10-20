"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { KioskCourtCard } from "../../../components/kiosk/KioskCourtCard";
import { KioskHeader } from "../../../components/kiosk/KioskHeader";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { GameSession } from "../../../core/entities/session";
import { LocalStorageAdapter } from "../../../services/storage/local-storage.adapter";

interface KioskPageProps {
  params: Promise<{ sessionId: string }>;
}

function KioskContent({ params }: KioskPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<GameSession | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAllMatchesModalOpen, setIsAllMatchesModalOpen] = useState(false);

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

  if (!session) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-black text-lg">
        MEMUAT TAMPILAN GOR KIOSK...
      </div>
    );
  }

  // Cari siapa saja yang sedang istirahat (On-deck / bersiap berikutnya)
  const activePlayingIds = new Set<string>();
  session.matches.forEach((m) => {
    if (m.status === "in_progress") {
      m.teamA.forEach((p) => activePlayingIds.add(p.id));
      m.teamB.forEach((p) => activePlayingIds.add(p.id));
    }
  });
  const onDeckPlayers = session.players.filter((p) => p.status === "active" && !activePlayingIds.has(p.id));

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#faf8f2] text-black p-2 sm:p-4 md:p-6 flex flex-col justify-between selection:bg-[#ccff00] selection:text-black font-sans">
      {/* Header Kiosk */}
      <KioskHeader
        session={session}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
      />

      {/* Grid Lapangan (Layar TV Besar / Full Viewport Fit) */}
      <div className="flex-1 min-h-0 my-1.5 sm:my-3 flex flex-col justify-center overflow-hidden">
        <div
          className={`h-full w-full gap-2 sm:gap-4 items-stretch ${
            session.courts.length === 1
              ? "grid grid-cols-1 max-w-3xl mx-auto"
              : session.courts.length === 2
              ? "grid grid-cols-1 md:grid-cols-2"
              : session.courts.length === 4
              ? "grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 overflow-y-auto"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto"
          }`}
        >
          {session.courts.map((court) => (
            <KioskCourtCard key={court.id} court={court} match={court.currentMatch} />
          ))}
        </div>
      </div>

      {/* Sisi Bawah: Bar Antrean Bersiap (On-Deck Ticker Compact) */}
      <div className="shrink-0 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black bg-white p-2 sm:p-3 shadow-[3px_3px_0px_#000]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff5500] animate-ping" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black whitespace-nowrap">
              Bersiap ({onDeckPlayers.length}):
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap py-0.5 no-scrollbar max-w-full">
            {onDeckPlayers.length === 0 ? (
              <span className="text-[11px] font-bold text-slate-500 italic whitespace-nowrap">
                Semua pemain sedang bertanding di lapangan.
              </span>
            ) : (
              onDeckPlayers.map((p) => (
                <span
                  key={p.id}
                  className="rounded-lg bg-[#ccff00] border border-black px-2 py-0.5 text-[10px] sm:text-xs font-black text-black shadow-[1px_1px_0px_#000] shrink-0 whitespace-nowrap"
                >
                  {p.name} ({p.gender === "M" ? "M" : "W"})
                </span>
              ))
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <button
              onClick={() => setIsAllMatchesModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-black text-white px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar className="h-3 w-3 stroke-[2.5]" />
              <span>Jadwal</span>
            </button>

            <Link
              href={`/live/${session.publicSlug}`}
              className="text-[10px] sm:text-xs font-black uppercase text-black hover:text-slate-600 underline font-mono transition-colors whitespace-nowrap"
              title="Buka tampilan penonton di smartphone pemain"
            >
              📱 Buka di HP
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Keseluruhan Match & Prediksi Jadwal */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
        session={session}
      />
    </div>
  );
}

export default function KioskDisplayPage({ params }: KioskPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-black text-lg">
          MEMUAT TAMPILAN GOR KIOSK...
        </div>
      }
    >
      <KioskContent params={params} />
    </Suspense>
  );
}
