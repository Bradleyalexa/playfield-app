"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Play, Sparkles, BookOpen, Clock, Calendar, Users, Trophy, Flame, Edit3 } from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import {
  ALGORITHM_REGISTRY,
  MatchmakingAlgorithm,
  SportType,
} from "../core/entities/session";
import { SportRegistry } from "../core/sports/sport-registry";
import { LocalStorageAdapter } from "../services/storage/local-storage.adapter";

export default function HomePage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>("badminton");
  const [sessionTitle, setSessionTitle] = useState("");
  const [courtCount, setCourtCount] = useState(2);

  // Waktu sewa & Custom Input
  const [startTime, setStartTime] = useState("19:00");
  const [durationHours, setDurationHours] = useState(2);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState("2.5");

  // Estimasi durasi 1 match & Custom Input
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(15);
  const [isCustomMatchDuration, setIsCustomMatchDuration] = useState(false);
  const [customMatchDurationInput, setCustomMatchDurationInput] = useState("25");

  // Algoritma & Jumlah Match Manual
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<MatchmakingAlgorithm>("fair_playtime");
  const [customInitialMatchesCount, setCustomInitialMatchesCount] = useState(6);

  const [recentSessions, setRecentSessions] = useState<
    { id: string; publicSlug: string; title: string; sport: SportType; updatedAt: string; playerCount: number }[]
  >([]);

  useEffect(() => {
    setRecentSessions(LocalStorageAdapter.listRecentSessions());
  }, []);

  const sports = SportRegistry.getAllSports();

  // Hitung effective duration dan effective match duration
  const effectiveDurationHours = isCustomDuration
    ? Math.max(0.5, parseFloat(customDurationInput) || 2)
    : durationHours;

  const effectiveMatchDurationMinutes = isCustomMatchDuration
    ? Math.max(5, parseInt(customMatchDurationInput, 10) || 15)
    : matchDurationMinutes;

  // Kalkulasi estimasi ronde & match
  const totalRentalMinutes = effectiveDurationHours * 60;
  const estimatedRounds = Math.max(1, Math.ceil(totalRentalMinutes / effectiveMatchDurationMinutes));
  const baseMatchesCount = estimatedRounds * courtCount;
  const extraMatchesCount = 10;
  const totalProjectedMatches =
    selectedAlgorithm === "custom_manual"
      ? customInitialMatchesCount + extraMatchesCount
      : baseMatchesCount + extraMatchesCount;

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const title =
      sessionTitle.trim() ||
      `Mabar ${selectedSport.toUpperCase()} - ${new Date().toLocaleDateString("id-ID")}`;

    const demo = LocalStorageAdapter.createDemoSession(selectedSport);
    demo.title = title;
    demo.courtCount = courtCount;
    demo.startTime = startTime;
    demo.durationHours = effectiveDurationHours;
    demo.matchDurationMinutes = effectiveMatchDurationMinutes;
    demo.algorithm = selectedAlgorithm;
    demo.estimatedMatchesCount = totalProjectedMatches;

    LocalStorageAdapter.saveSession(demo);
    router.push(`/host/${demo.publicSlug}?key=${demo.adminKey}`);
  };

  const handleLaunchDemo = () => {
    const demo = LocalStorageAdapter.createDemoSession("badminton");
    router.push(`/host/${demo.publicSlug}?key=${demo.adminKey}`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col selection:bg-[#ccff00] selection:text-black font-sans">
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
            Pasangan ganda otomatis seimbang atau susun manual sesukamu, prediksi durasi sewa, panggil giliran via speaker Bluetooth,
            counter shuttlecock/bola, dan display TV GOR secara instan tanpa perlu akun pemain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3">
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000] hover:bg-[#b8e600] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
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
                <p className="text-xs font-bold text-slate-600">
                  Konfigurasikan jam sewa, durasi, dan algoritma matchmaking mabar
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-6">
              {/* 1. Pilihan Sport Neo-Brutalist */}
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
                        className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-3 border-black transition-all text-center cursor-pointer ${
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

              {/* 2. Nama Sesi / Komunitas */}
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

              {/* 3. Jumlah Lapangan */}
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
                      className={`h-12 w-12 rounded-xl text-base font-black border-3 border-black transition-all cursor-pointer ${
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

              {/* 4. Durasi Sewa Lapangan & Estimasi Match (Dukungan Preset & Custom) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                  <Clock className="h-4 w-4 stroke-[3]" />
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    4. Waktu Sewa Lapangan & Durasi Match (Preset / Custom)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Jam Mulai */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Jam Mulai Main
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl bg-white border-2 border-black px-3 py-2 text-sm font-mono font-black text-black shadow-[2px_2px_0px_#000]"
                    />
                  </div>

                  {/* Durasi Sewa (1 Jam, 2 Jam, 3 Jam, atau Custom) */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Durasi Sewa Lapangan
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3].map((hrs) => (
                        <button
                          type="button"
                          key={hrs}
                          onClick={() => {
                            setIsCustomDuration(false);
                            setDurationHours(hrs);
                          }}
                          className={`py-2 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                            !isCustomDuration && durationHours === hrs
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {hrs} Jam
                        </button>
                      ))}

                      {/* Tombol Custom Durasi Sewa */}
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(true)}
                        className={`py-2 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                          isCustomDuration
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {isCustomDuration && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={customDurationInput}
                          onChange={(e) => setCustomDurationInput(e.target.value)}
                          placeholder="Misal 2.5 atau 4"
                          className="w-full rounded-lg bg-white border-2 border-black px-2.5 py-1 text-xs font-mono font-bold text-black shadow-[1px_1px_0px_#000]"
                        />
                        <span className="text-xs font-black font-mono">Jam</span>
                      </div>
                    )}
                  </div>

                  {/* Estimasi 1 Match (12m, 15m, 20m, atau Custom) */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Estimasi 1 Match/Ronde
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[12, 15, 20].map((mins) => (
                        <button
                          type="button"
                          key={mins}
                          onClick={() => {
                            setIsCustomMatchDuration(false);
                            setMatchDurationMinutes(mins);
                          }}
                          className={`py-2 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                            !isCustomMatchDuration && matchDurationMinutes === mins
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}

                      {/* Tombol Custom Estimasi Match */}
                      <button
                        type="button"
                        onClick={() => setIsCustomMatchDuration(true)}
                        className={`py-2 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                          isCustomMatchDuration
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {isCustomMatchDuration && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="1"
                          min="5"
                          max="90"
                          value={customMatchDurationInput}
                          onChange={(e) => setCustomMatchDurationInput(e.target.value)}
                          placeholder="Misal 18 atau 25"
                          className="w-full rounded-lg bg-white border-2 border-black px-2.5 py-1 text-xs font-mono font-bold text-black shadow-[1px_1px_0px_#000]"
                        />
                        <span className="text-xs font-black font-mono">Menit</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Match & Round Prediction Preview Box */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-black text-[11px] uppercase text-emerald-800 bg-[#ccff00] px-2 py-0.5 rounded border border-black inline-block mb-1">
                      Kalkulasi Prediksi Match
                    </span>
                    <p className="font-bold text-black leading-snug">
                      Perkiraan sewa: <strong>{startTime} - {new Date(new Date(`2000-01-01T${startTime}:00`).getTime() + effectiveDurationHours * 3600000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</strong> ({effectiveDurationHours} Jam).
                    </p>
                    <p className="font-medium text-black/70">
                      {selectedAlgorithm === "custom_manual"
                        ? `Mode Susun Bebas: ${customInitialMatchesCount} Match Dibuat + 10 Match Ekstra.`
                        : `~${estimatedRounds} Ronde Reguler (${baseMatchesCount} Match) + 10 Match Cadangan Ekstra.`}
                    </p>
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-black/50 block">Total Match Disiapkan</span>
                    <span className="font-mono font-black text-2xl text-black">
                      {totalProjectedMatches} Match
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Pilihan Algoritma Mabar (Termasuk Custom Manual by Host) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2.5">
                  5. Pilih Algoritma Rotasi Lapangan & Matchmaking (7 Algoritma)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(ALGORITHM_REGISTRY).map((algo) => {
                    const isSelected = selectedAlgorithm === algo.id;
                    return (
                      <div
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id)}
                        className={`p-3.5 rounded-2xl border-3 border-black transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#ccff00]/25 shadow-[4px_4px_0px_#000] ring-2 ring-black -translate-y-0.5"
                            : "bg-[#faf8f2] hover:bg-white shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-black text-sm text-black flex items-center gap-1.5">
                              <span>{algo.icon}</span>
                              <span>{algo.shortName}</span>
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border-2 border-black ${algo.badgeColor}`}>
                              {algo.badge}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-black/80 leading-relaxed mb-2">
                            {algo.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-black/60 pt-2 border-t border-black/15">
                          🎯 Cocok untuk: {algo.bestFor}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Konfigurasi Tambahan Jika Memilih Algoritma Custom Manual */}
                {selectedAlgorithm === "custom_manual" && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-[#fef08a]/40 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 stroke-[3]" />
                      <span className="text-xs font-black uppercase tracking-wider text-black">
                        Konfigurasi Awal Mode Susun Bebas:
                      </span>
                    </div>
                    <p className="text-xs font-medium text-black/80">
                      Anda dapat menentukan sendiri pasangan pertandingan di Dashboard Host kapan saja. Berapa banyak match yang ingin di-initialize sekarang?
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {[2, 4, 6, 8, 12].map((cnt) => (
                        <button
                          type="button"
                          key={cnt}
                          onClick={() => setCustomInitialMatchesCount(cnt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black border-2 border-black transition-all cursor-pointer ${
                            customInitialMatchesCount === cnt
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {cnt} Match
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] py-4 text-sm font-black text-black uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000] hover:bg-[#b8e600] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5 stroke-[3]" />
                <span>Mulai Atur Lapangan & Tampilkan Jadwal</span>
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
