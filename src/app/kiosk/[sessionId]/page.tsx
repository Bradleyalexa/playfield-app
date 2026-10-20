"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { KioskCourtCard } from "../../../components/kiosk/KioskCourtCard";
import { KioskHeader } from "../../../components/kiosk/KioskHeader";
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
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono-sport font-black text-lg">
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
    <div className="min-h-screen bg-[#faf8f2] text-black p-6 sm:p-10 flex flex-col justify-between selection:bg-[#ccff00] selection:text-black font-sans">
      <div className="flex flex-col gap-6">
        {/* Header Kiosk */}
        <KioskHeader
          session={session}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        />

        {/* Grid Lapangan (Layar TV Besar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-4">
          {session.courts.map((court) => (
            <KioskCourtCard key={court.id} court={court} match={court.currentMatch} />
          ))}
        </div>
      </div>

      {/* Sisi Bawah: Bar Antrean Bersiap (On-Deck Ticker) */}
      <div className="mt-8 rounded-2xl border-3 border-black bg-white p-5 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-[#ff5500] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Bersiap Ronde Berikutnya ({onDeckPlayers.length} Pemain):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onDeckPlayers.length === 0 ? (
              <span className="text-xs font-bold text-slate-500 italic">Semua pemain sedang berada di lapangan.</span>
            ) : (
              onDeckPlayers.map((p) => (
                <span
                  key={p.id}
                  className="rounded-lg bg-[#ccff00] border-2 border-black px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_#000]"
                >
                  {p.name}
                </span>
              ))
            )}
          </div>

          <Link
            href={`/host/${session.publicSlug}`}
            className="text-xs font-black uppercase text-black hover:text-slate-600 underline font-mono-sport transition-colors"
          >
            Kembali ke Host
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KioskDisplayPage({ params }: KioskPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono-sport font-black text-lg">
          MEMUAT TAMPILAN GOR KIOSK...
        </div>
      }
    >
      <KioskContent params={params} />
    </Suspense>
  );
}
