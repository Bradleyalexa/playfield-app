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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">
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
    <div className="min-h-screen bg-[#040711] text-white p-6 sm:p-10 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
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
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Bersiap Ronde Berikutnya ({onDeckPlayers.length} Pemain):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onDeckPlayers.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Semua pemain sedang berada di lapangan.</span>
            ) : (
              onDeckPlayers.map((p) => (
                <span
                  key={p.id}
                  className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-bold text-slate-200"
                >
                  {p.name}
                </span>
              ))
            )}
          </div>

          <Link
            href={`/host/${session.publicSlug}`}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-mono transition-colors"
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
        <div className="min-h-screen bg-[#040711] flex items-center justify-center text-slate-500 font-mono">
          MEMUAT TAMPILAN GOR KIOSK...
        </div>
      }
    >
      <KioskContent params={params} />
    </Suspense>
  );
}
