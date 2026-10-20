"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Plus, Play, Sparkles, BookOpen, Tv, Users, ShieldCheck, Flame } from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import { SportType } from "../core/entities/session";
import { SportRegistry } from "../core/sports/sport-registry";
import { LocalStorageAdapter } from "../services/storage/local-storage.adapter";

export default function HomePage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>("badminton");
  const [sessionTitle, setSessionTitle] = useState("");
  const [courtCount, setCourtCount] = useState(2);
  const [recentSessions, setRecentSessions] = useState<
    { id: string; publicSlug: string; title: string; sport: SportType; updatedAt: string; playerCount: number }[]
  >([]);

  useEffect(() => {
    setRecentSessions(LocalStorageAdapter.listRecentSessions());
  }, []);

  const sports = SportRegistry.getAllSports();

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const title = sessionTitle.trim() || `Mabar ${selectedSport.toUpperCase()} - ${new Date().toLocaleDateString("id-ID")}`;
    const demo = LocalStorageAdapter.createDemoSession(selectedSport);
    demo.title = title;
    demo.courtCount = courtCount;
    LocalStorageAdapter.saveSession(demo);
    router.push(`/host/${demo.publicSlug}?key=${demo.adminKey}`);
  };

  const handleLaunchDemo = () => {
    const demo = LocalStorageAdapter.createDemoSession("badminton");
    router.push(`/host/${demo.publicSlug}?key=${demo.adminKey}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Asisten Pribadi Ketua Komunitas & Host Mabar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Atur Rotasi Lapangan Mabar{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Tanpa Boncos & Tanpa Ribet
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Otomatisasi pembagian pasangan seimbang, panggilan suara lapangan via speaker Bluetooth, hitung pemakaian
            shuttlecock, dan display TV GOR secara instan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 active:scale-95 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Coba Demo Langsung (1-Klik)</span>
            </button>
            <Link
              href="/education"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Panduan & Edukasi Sport</span>
            </Link>
          </div>
        </div>

        {/* Form Buat Sesi Baru */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-6">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Buat Sesi Mabar Baru</h2>
                <p className="text-xs text-slate-400">Tanpa registrasi akun, langsung siap dipakai di lapangan</p>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-5">
              {/* Pilihan Sport */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cabang Olahraga
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sports.map((s) => (
                    <button
                      type="button"
                      key={s.type}
                      onClick={() => setSelectedSport(s.type)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border transition-all text-center ${
                        selectedSport === s.type
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10 scale-102"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-xs font-bold">{s.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Sesi / Komunitas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Nama Sesi / Komunitas
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Contoh: Mabar Badminton PB Rajawali - GOR Tomang..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Jumlah Lapangan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Jumlah Lapangan yang Disewa
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setCourtCount(num)}
                      className={`h-11 w-11 rounded-xl text-sm font-bold border transition-all ${
                        courtCount === num
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 active:scale-98 shadow-xl shadow-emerald-500/20 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Mulai Atur Lapangan Sekarang</span>
              </button>
            </form>
          </div>

          {/* Sesi Terakhir (Recent Sessions) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
              Sesi Tersimpan di Browser ({recentSessions.length})
            </h3>

            {recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                Belum ada sesi yang tersimpan. Klik tombol demo untuk mencoba.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/host/${s.publicSlug}`}
                    className="flex flex-col p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white truncate">{s.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{s.sport.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {s.playerCount} Pemain • {new Date(s.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
