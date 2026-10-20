"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Play, Sparkles, BookOpen } from "lucide-react";
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
    const title =
      sessionTitle.trim() || `Mabar ${selectedSport.toUpperCase()} - ${new Date().toLocaleDateString("id-ID")}`;
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
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Hero Section - Athletic Neo-Brutalism */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#ccff00] border-2 border-black px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            <span>Pocket Assistant Host Mabar & Ketua Komunitas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-[1.05] uppercase">
            Atur Rotasi Lapangan Mabar{" "}
            <span className="bg-[#ccff00] px-2 py-0.5 rounded border-2 border-black shadow-[4px_4px_0px_#000] inline-block mt-1">
              Tanpa Boncos!
            </span>
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-800 max-w-2xl leading-relaxed mt-2">
            Pasangan ganda otomatis seimbang, panggil giliran via speaker Bluetooth, counter shuttlecock/bola,
            dan display TV GOR secara instan tanpa perlu akun pemain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3">
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000] hover:bg-[#b8e600] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all"
            >
              <Play className="h-5 w-5 fill-black stroke-[2.5]" />
              <span>Coba Demo Langsung (1-Klik)</span>
            </button>
            <Link
              href="/education"
              className="flex items-center gap-2 rounded-xl border-3 border-black bg-white px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider shadow-[5px_5px_0px_#000] hover:bg-slate-100 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all"
            >
              <BookOpen className="h-5 w-5 stroke-[2.5]" />
              <span>Panduan & Edukasi Sport</span>
            </Link>
          </div>
        </div>

        {/* Form Buat Sesi Baru */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 rounded-3xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
            <div className="flex items-center gap-3 pb-4 border-b-3 border-black mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
                <Plus className="h-6 w-6 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black uppercase tracking-wide">Buat Sesi Mabar Baru</h2>
                <p className="text-xs font-bold text-slate-600">Tanpa registrasi akun, langsung siap dipakai di lapangan</p>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-6">
              {/* Pilihan Sport Neo-Brutalist */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2.5">
                  1. Pilih Cabang Olahraga
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sports.map((s) => {
                    const isSelected = selectedSport === s.type;
                    const bgAccent =
                      s.type === "badminton"
                        ? "bg-[#ccff00]"
                        : s.type === "tennis"
                        ? "bg-[#ff5500] text-white"
                        : "bg-[#00e5ff]";

                    return (
                      <button
                        type="button"
                        key={s.type}
                        onClick={() => setSelectedSport(s.type)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-3 border-black transition-all text-center ${
                          isSelected
                            ? `${bgAccent} shadow-[4px_4px_0px_#000] translate-x-[-1px] translate-y-[-1px]`
                            : "bg-[#faf8f2] text-black hover:bg-white hover:shadow-[3px_3px_0px_#000]"
                        }`}
                      >
                        <span className="text-3xl">{s.emoji}</span>
                        <span className="text-xs font-black uppercase tracking-wider">{s.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nama Sesi / Komunitas */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2.5">
                  2. Nama Sesi / Komunitas
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Contoh: Mabar Badminton PB Rajawali - GOR Tomang..."
                  className="w-full rounded-xl bg-[#faf8f2] border-3 border-black px-4 py-3.5 text-sm font-bold text-black placeholder-slate-400 focus:outline-none focus:bg-white shadow-[3px_3px_0px_#000]"
                />
              </div>

              {/* Jumlah Lapangan */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2.5">
                  3. Jumlah Lapangan yang Disewa
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setCourtCount(num)}
                      className={`h-12 w-12 rounded-xl text-base font-black border-3 border-black transition-all ${
                        courtCount === num
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                          : "bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] py-4 text-sm font-black text-black uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000] hover:bg-[#b8e600] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all"
              >
                <Plus className="h-5 w-5 stroke-[3]" />
                <span>Mulai Atur Lapangan Sekarang</span>
              </button>
            </form>
          </div>

          {/* Sesi Terakhir (Recent Sessions) */}
          <div className="rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4 pb-2 border-b-3 border-black">
              Sesi Tersimpan ({recentSessions.length})
            </h3>

            {recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500 italic">
                Belum ada sesi tersimpan. Klik tombol demo untuk mencoba.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/host/${s.publicSlug}`}
                    className="flex flex-col p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black hover:bg-[#ccff00]/20 hover:shadow-[3px_3px_0px_#000] transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-black truncate uppercase">{s.title}</span>
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-black text-[#ccff00]">
                        {s.sport}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 font-mono-sport">
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
