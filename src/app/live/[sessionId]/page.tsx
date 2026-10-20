"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Trophy, Users, ShieldCheck, Flame, Sparkles, RefreshCw, Radio, Calendar } from "lucide-react";
import { Navbar } from "../../../components/common/Navbar";
import { AllMatchesModal } from "../../../components/schedule/AllMatchesModal";
import { getTierLabel } from "../../../core/entities/player";
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
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center text-black font-mono font-bold text-base">
        MEMUAT PAPAN PERTANDINGAN...
      </div>
    );
  }

  const algo = ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"];

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar publicSlug={session.publicSlug} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Banner Sultan jika aktif */}
        {session.sultanSponsor && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#ffde00] border-[3px] border-black p-4 text-center justify-center shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-6 w-6 text-black shrink-0 animate-bounce" />
            <span className="font-black text-black text-xs sm:text-sm uppercase tracking-wider">
              👑 MABAR MALAM INI DISPONSORI PENUH OLEH {session.sultanSponsor}!
            </span>
          </div>
        )}

        {/* Header Sesi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0px_#000]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#ccff00] border-2 border-black font-black">
                {session.sport.toUpperCase()}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-black ${algo.badgeColor}`}>
                {algo.icon} {algo.shortName}
              </span>
              <span className="font-mono text-xs font-bold text-black/60">
                KODE: {session.publicSlug || session.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">{session.title}</h1>
            <p className="text-xs font-bold text-black/70 mt-1 font-mono">
              Ronde #{session.currentRound} • {session.courtCount} Lapangan • {session.players.length} Pemain • {session.startTime || "19:00"} ({session.durationHours || 2} Jam)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAllMatchesModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#ccff00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4 stroke-[2.5]" />
              <span>Semua Match & Jadwal</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000]">
              <Radio className="h-4 w-4 text-black animate-pulse" />
              <span className="text-xs font-black text-black font-mono tracking-wider">LIVE</span>
            </div>
          </div>
        </div>

        {/* Lapangan Sedang Berlangsung */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-[#ff5500] border border-black rounded-full" />
              Pertandingan Sedang Berlangsung
            </h2>
            <button
              onClick={() => setIsAllMatchesModalOpen(true)}
              className="text-xs font-mono font-black text-black underline hover:text-black/60 cursor-pointer"
            >
              Lihat Proyeksi Ronde Selanjutnya →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.courts.map((court) => {
              const match = court.currentMatch;
              if (!match) {
                return (
                  <div
                    key={court.id}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-[3px] border-dashed border-black/30 bg-white/60 text-center"
                  >
                    <span className="text-sm font-black text-black/50 uppercase font-mono">{court.courtName}</span>
                    <span className="text-xs font-bold text-black/40 mt-1">Lapangan Sedang Kosong / Istirahat</span>
                  </div>
                );
              }

              return (
                <div
                  key={court.id}
                  className="flex flex-col rounded-2xl border-[3px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]"
                >
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                    <span className="font-black text-xs uppercase px-2 py-0.5 rounded bg-[#ccff00] border-2 border-black font-mono">
                      {court.courtName}
                    </span>
                    <span className="text-xs text-black font-mono font-bold">Ronde #{match.roundNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-stretch">
                    {/* Tim A */}
                    <div className="flex flex-col justify-between rounded-xl bg-[#f0fdf4] border-2 border-black p-3.5 shadow-[2px_2px_0px_#000]">
                      <div>
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-1 block">
                          TIM A
                        </span>
                        <div className="space-y-1">
                          {match.teamA.map((p) => (
                            <p key={p.id} className="text-xs font-bold text-black truncate flex items-center justify-between">
                              <span>{p.name}</span>
                              <span className="text-[9px] font-mono text-black/60">
                                {p.gender === "M" ? "M" : "W"}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t-2 border-black/10 text-center">
                        <span className="text-4xl font-black text-black font-mono tracking-tighter">
                          {match.scoreA}
                        </span>
                      </div>
                    </div>

                    {/* Tim B */}
                    <div className="flex flex-col justify-between rounded-xl bg-[#f0f9ff] border-2 border-black p-3.5 shadow-[2px_2px_0px_#000]">
                      <div>
                        <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider mb-1 block">
                          TIM B
                        </span>
                        <div className="space-y-1">
                          {match.teamB.map((p) => (
                            <p key={p.id} className="text-xs font-bold text-black truncate flex items-center justify-between">
                              <span>{p.name}</span>
                              <span className="text-[9px] font-mono text-black/60">
                                {p.gender === "M" ? "M" : "W"}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t-2 border-black/10 text-center">
                        <span className="text-4xl font-black text-black font-mono tracking-tighter">
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
        <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-sm font-black uppercase text-black flex items-center gap-2">
              <Trophy className="h-4 w-4 text-black" />
              <span>Daftar Giliran & Jam Terbang</span>
            </h2>
            <span className="text-xs font-mono font-bold text-black/60">Prioritas Main Rata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[...session.players]
              .sort((a, b) => a.gamesPlayed - b.gamesPlayed)
              .map((p, idx) => {
                const tier = getTierLabel(p.publicTier);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f2] border-2 border-black text-xs shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-black text-black/40 text-[11px] w-4">{idx + 1}.</span>
                      <span className="font-extrabold text-black truncate">{p.name}</span>
                      <span className="text-[9px] font-mono font-bold text-black/60">
                        ({p.gender === "M" ? "M" : "W"})
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border-2 border-black ${tier.badgeColor}`}>
                        {tier.label.replace("Tier ", "")}
                      </span>
                    </div>
                    <span className="font-mono text-black font-black bg-[#ccff00] border-2 border-black px-2 py-0.5 rounded text-xs ml-2 shrink-0">
                      {p.gamesPlayed}x Main
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </main>

      {/* Modal Keseluruhan Match & Jadwal Proyeksi untuk Penonton / Pemain */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
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
