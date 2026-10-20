"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Trophy, Users, ShieldCheck, Flame, Sparkles, RefreshCw } from "lucide-react";
import { Navbar } from "../../../components/common/Navbar";
import { getTierLabel } from "../../../core/entities/player";
import { GameSession } from "../../../core/entities/session";
import { LocalStorageAdapter } from "../../../services/storage/local-storage.adapter";

interface LivePageProps {
  params: Promise<{ sessionId: string }>;
}

function LiveSpectatorContent({ params }: LivePageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<GameSession | null>(null);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Memuat papan pertandingan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar publicSlug={session.publicSlug} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Banner Sultan jika aktif */}
        {session.sultanSponsor && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 p-4 text-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm uppercase tracking-wide">
              👑 Mabar Malam Ini Disponsori Penuh oleh {session.sultanSponsor}!
            </span>
          </div>
        )}

        {/* Header Sesi */}
        <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-800 bg-slate-900/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{session.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Ronde {session.currentRound} • {session.courtCount} Lapangan • {session.players.length} Pemain
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 font-mono">LIVE MATCH</span>
          </div>
        </div>

        {/* Lapangan Sedang Berlangsung */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Pertandingan Berjalan di Lapangan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.courts.map((court) => {
              const match = court.currentMatch;
              if (!match) {
                return (
                  <div
                    key={court.id}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center"
                  >
                    <span className="text-sm font-bold text-slate-400">{court.courtName}</span>
                    <span className="text-xs text-slate-600 mt-1">Sedang Istirahat</span>
                  </div>
                );
              }

              return (
                <div
                  key={court.id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                    <span className="font-bold text-xs text-emerald-400 uppercase tracking-wide">
                      {court.courtName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Ronde {match.roundNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Tim A */}
                    <div className="flex flex-col rounded-xl bg-slate-800/40 p-3">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Tim A</span>
                      {match.teamA.map((p) => (
                        <span key={p.id} className="text-xs font-semibold text-white truncate">
                          {p.name}
                        </span>
                      ))}
                      <span className="mt-2 text-3xl font-black text-emerald-400 font-mono">{match.scoreA}</span>
                    </div>

                    {/* Tim B */}
                    <div className="flex flex-col rounded-xl bg-slate-800/40 p-3">
                      <span className="text-[10px] font-bold text-blue-400 uppercase mb-1">Tim B</span>
                      {match.teamB.map((p) => (
                        <span key={p.id} className="text-xs font-semibold text-white truncate">
                          {p.name}
                        </span>
                      ))}
                      <span className="mt-2 text-3xl font-black text-blue-400 font-mono">{match.scoreB}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Klasemen & Jatah Bermain Pemain */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
            <span>Daftar Giliran & Jatah Main</span>
            <span className="text-xs text-slate-400 font-normal">Diurutkan berdasarkan jatah main</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...session.players]
              .sort((a, b) => a.gamesPlayed - b.gamesPlayed)
              .map((p) => {
                const tier = getTierLabel(p.publicTier);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${tier.badgeColor}`}>
                        {tier.label.replace("Tier ", "")}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{p.gamesPlayed}x Main</span>
                  </div>
                );
              })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LiveSpectatorPage({ params }: LivePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono">
          Memuat papan penonton...
        </div>
      }
    >
      <LiveSpectatorContent params={params} />
    </Suspense>
  );
}
