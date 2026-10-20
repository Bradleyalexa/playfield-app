"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Play,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  Users,
  Trophy,
  Flame,
  Edit3,
  HelpCircle,
  ChevronRight,
  Minus,
  ChevronDown,
  FolderOpen,
  ArrowRight,
  Package,
} from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import { AlgorithmExplainerModal } from "../components/schedule/AlgorithmExplainerModal";
import {
  ALGORITHM_REGISTRY,
  EquipmentPricingModel,
  MatchmakingAlgorithm,
  SportType,
} from "../core/entities/session";
import { SportRegistry } from "../core/sports/sport-registry";
import { LocalStorageAdapter } from "../services/storage/local-storage.adapter";
import { Match } from "../core/entities/match";

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
  const [isCustomMatchesCountInput, setIsCustomMatchesCountInput] = useState(false);

  // Cock / Bola & Slop Pricing Settings (Customizable Host)
  const [equipmentPricingModel, setEquipmentPricingModel] = useState<EquipmentPricingModel>("per_unit");
  const [costPerUnitInput, setCostPerUnitInput] = useState<string>("12000");
  const [costPerSlopInput, setCostPerSlopInput] = useState<string>("140000");
  const [unitsPerSlopInput, setUnitsPerSlopInput] = useState<string>("12");

  // Dropdown Sesi Tersimpan (Hanya Tampilkan 2 Recent)
  const [isRecentDropdownOpen, setIsRecentDropdownOpen] = useState(false);

  // Modal Penjelasan Algoritma
  const [isAlgoExplainerOpen, setIsAlgoExplainerOpen] = useState(false);

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

  // Helper penyesuaian jam mulai (+15m / -15m)
  const adjustStartTime = (deltaMinutes: number) => {
    const [hStr, mStr] = startTime.split(":");
    const totalMinutes = (parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + deltaMinutes + 24 * 60) % (24 * 60);
    const newH = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const newM = (totalMinutes % 60).toString().padStart(2, "0");
    setStartTime(`${newH}:${newM}`);
  };

  // Kalkulasi estimasi ronde & match
  const totalRentalMinutes = effectiveDurationHours * 60;
  const estimatedRounds = Math.max(1, Math.ceil(totalRentalMinutes / effectiveMatchDurationMinutes));
  const baseMatchesCount = estimatedRounds * courtCount;
  const extraMatchesCount = 10;
  const totalProjectedMatches =
    selectedAlgorithm === "custom_manual"
      ? customInitialMatchesCount + extraMatchesCount
      : baseMatchesCount + extraMatchesCount;

  const handleSelectSport = (sport: SportType) => {
    setSelectedSport(sport);
    if (sport === "badminton") {
      setEquipmentPricingModel("per_unit");
      setCostPerUnitInput("12000");
      setCostPerSlopInput("140000");
      setUnitsPerSlopInput("12");
    } else if (sport === "tennis") {
      setEquipmentPricingModel("per_slop");
      setCostPerUnitInput("25000");
      setCostPerSlopInput("85000");
      setUnitsPerSlopInput("4");
    } else if (sport === "padel") {
      setEquipmentPricingModel("per_slop");
      setCostPerUnitInput("30000");
      setCostPerSlopInput("90000");
      setUnitsPerSlopInput("3");
    }
  };

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

    // Konfigurasi Equipment (Cock / Bola & Slop)
    demo.sportConfig.equipment = {
      unitName:
        selectedSport === "badminton"
          ? "shuttlecock"
          : selectedSport === "tennis"
          ? "ball_can"
          : "padel_ball",
      totalUsed: 0,
      costPerUnit: Math.max(
        0,
        parseInt(costPerUnitInput, 10) || (selectedSport === "badminton" ? 12000 : 25000)
      ),
      billingMode: "shared_all",
      pricingModel: equipmentPricingModel,
      costPerSlop: Math.max(0, parseInt(costPerSlopInput, 10) || 140000),
      unitsPerSlop: Math.max(1, parseInt(unitsPerSlopInput, 10) || 12),
      slopUsed: equipmentPricingModel === "per_slop" ? 1 : 0,
    };

    // Jika user memilih custom manual, buat N custom matches awal siap pakai
    if (selectedAlgorithm === "custom_manual") {
      const customMatches: Match[] = [];
      const totalToInit = customInitialMatchesCount || 4;
      for (let i = 0; i < totalToInit; i++) {
        const cNum = (i % courtCount) + 1;
        const rNum = Math.floor(i / courtCount) + 1;
        const four = demo.players.slice(0, 4);
        customMatches.push({
          id: `custom-init-${i + 1}-${Date.now()}`,
          courtNumber: cNum,
          roundNumber: rNum,
          teamA: [four[0], four[1]],
          teamB: [four[2], four[3]],
          scoreA: 0,
          scoreB: 0,
          status: "in_progress",
          startedAt: new Date().toISOString(),
          equipmentUsedCount: 1,
        });
      }
      demo.matches = customMatches;
      demo.courts = demo.courts.map((c) => ({
        ...c,
        currentMatch: customMatches.find((m) => m.courtNumber === c.courtNumber && m.roundNumber === 1),
      }));
    }

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
              Tanpa Ribet!
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-black mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
                  <Plus className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase tracking-wide">Buat Sesi Mabar Baru</h2>
                  <p className="text-xs font-bold text-slate-600">
                    Konfigurasikan jam sewa, durasi, algoritma, dan biaya cock/slop
                  </p>
                </div>
              </div>

              {/* Dropdown Akses Cepat Sesi Tersimpan (Hanya Tampilkan 2 Terakhir) */}
              {recentSessions.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) router.push(`/host/${e.target.value}`);
                    }}
                    className="rounded-xl bg-[#faf8f2] border-2 border-black px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-[#ccff00]/40 transition-colors"
                  >
                    <option value="" disabled>
                      📂 Buka Sesi (2 Terakhir)...
                    </option>
                    {recentSessions.slice(0, 2).map((s) => (
                      <option key={s.id} value={s.publicSlug}>
                        {s.title} ({s.sport.toUpperCase()} • {s.playerCount} Pemain)
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                        onClick={() => handleSelectSport(s.type)}
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

              {/* 4. Durasi Sewa Lapangan & Estimasi Match (Dukungan Preset & Custom Rapi) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                  <Clock className="h-4 w-4 stroke-[3]" />
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    4. Waktu Sewa Lapangan & Durasi Match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Jam Mulai - Klik angka langsung adjust & ada tombol step */}
                  <div className="flex flex-col justify-between">
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Jam Mulai Main (Klik untuk Atur)
                    </label>

                    {/* Input Jam Box */}
                    <div
                      onClick={(e) => {
                        const input = e.currentTarget.querySelector("input");
                        try {
                          (input as any)?.showPicker();
                        } catch {}
                      }}
                      className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-yellow-50/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <input
                        type="time"
                        value={startTime}
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            (e.currentTarget as any).showPicker();
                          } catch {}
                        }}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-transparent border-none text-xl font-mono font-black text-black focus:outline-none cursor-pointer w-full"
                      />
                      <Clock className="h-4 w-4 text-black/50 shrink-0" />
                    </div>

                    {/* Tombol Step -1 Jam & +1 Jam (Baris Sendiri Rapi, Tidak Nabrak Border) */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => adjustStartTime(-60)}
                        title="Kurangi 1 Jam"
                        className="py-1.5 px-2 rounded-lg bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs hover:bg-[#ccff00] cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        -1 Jam
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustStartTime(60)}
                        title="Tambah 1 Jam"
                        className="py-1.5 px-2 rounded-lg bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs hover:bg-[#ccff00] cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        +1 Jam
                      </button>
                    </div>

                    {/* Quick Presets Jam */}
                    <div className="flex items-center gap-1 mt-2">
                      {["18:00", "19:00", "20:00", "21:00"].map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setStartTime(t)}
                          className={`flex-1 py-1 text-[10px] font-mono font-black rounded-md border transition-all cursor-pointer ${
                            startTime === t
                              ? "bg-black text-[#ccff00] border-black"
                              : "bg-white text-black border-black/30 hover:border-black"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Durasi Sewa Lapangan (1 Jam, 2 Jam, 3 Jam, Custom) */}
                  <div className="flex flex-col justify-between">
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Durasi Sewa Lapangan
                    </label>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[1, 2, 3].map((hrs) => (
                        <button
                          type="button"
                          key={hrs}
                          onClick={() => {
                            setIsCustomDuration(false);
                            setDurationHours(hrs);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                            !isCustomDuration && durationHours === hrs
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {hrs} Jam
                        </button>
                      ))}

                      {/* Tombol Custom Durasi Sewa Rapi */}
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(true)}
                        className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isCustomDuration
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Custom</span>
                      </button>
                    </div>

                    {isCustomDuration && (
                      <div className="mt-2 p-2 rounded-xl bg-white border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
                        <span className="text-[11px] font-black uppercase text-black/60 pl-1">Durasi:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="12"
                            value={customDurationInput}
                            onChange={(e) => setCustomDurationInput(e.target.value)}
                            className="w-16 text-center font-mono font-black text-sm border-2 border-black rounded-lg p-1 bg-[#faf8f2]"
                          />
                          <span className="text-xs font-mono font-black pr-1">Jam</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estimasi 1 Match (12m, 15m, 20m, Custom) */}
                  <div className="flex flex-col justify-between">
                    <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                      Estimasi 1 Match/Ronde
                    </label>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[12, 15, 20].map((mins) => (
                        <button
                          type="button"
                          key={mins}
                          onClick={() => {
                            setIsCustomMatchDuration(false);
                            setMatchDurationMinutes(mins);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                            !isCustomMatchDuration && matchDurationMinutes === mins
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {mins} Menit
                        </button>
                      ))}

                      {/* Tombol Custom Estimasi Match Rapi */}
                      <button
                        type="button"
                        onClick={() => setIsCustomMatchDuration(true)}
                        className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isCustomMatchDuration
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Custom</span>
                      </button>
                    </div>

                    {isCustomMatchDuration && (
                      <div className="mt-2 p-2 rounded-xl bg-white border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
                        <span className="text-[11px] font-black uppercase text-black/60 pl-1">Tempo:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="1"
                            min="5"
                            max="90"
                            value={customMatchDurationInput}
                            onChange={(e) => setCustomMatchDurationInput(e.target.value)}
                            className="w-16 text-center font-mono font-black text-sm border-2 border-black rounded-lg p-1 bg-[#faf8f2]"
                          />
                          <span className="text-xs font-mono font-black pr-1">Menit</span>
                        </div>
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

              {/* 5. Pilihan Algoritma Mabar (Dengan Banner Trigger Modal Penjelasan di Tengah) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                  5. Pilih Algoritma Rotasi Lapangan & Matchmaking (7 Algoritma)
                </label>

                {/* Banner Trigger Modal Penjelasan Algoritma Lengkap */}
                <div
                  onClick={() => setIsAlgoExplainerOpen(true)}
                  className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-white border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#ccff00]/20 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-black truncate">
                          Pelajari Cara Kerja & Perbandingan Lengkap 7 Algoritma
                        </span>
                        <span className="text-[10px] font-mono font-black uppercase bg-black text-[#ccff00] px-2 py-0.2 rounded hidden sm:inline">
                          BACA DETAIL
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-black/70 truncate">
                        Klik di sini untuk melihat formula antrean, penyeimbangan skill ganda, dan simulasi kasus di GOR
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-black bg-[#faf8f2] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#000] shrink-0 group-hover:bg-[#ccff00] transition-colors">
                    Buka Panduan →
                  </span>
                </div>

                {/* Grid 7 Card Algoritma */}
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

                {/* Konfigurasi Tambahan Jika Memilih Algoritma Custom Manual: Bebas Tentukan Jumlah Match Awal */}
                {selectedAlgorithm === "custom_manual" && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-[#fef08a]/40 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 stroke-[3]" />
                      <span className="text-xs font-black uppercase tracking-wider text-black">
                        Konfigurasi Jumlah Match Awal (Mode Susun Bebas):
                      </span>
                    </div>

                    <p className="text-xs font-medium text-black/80">
                      Tentukan berapa banyak match awal yang ingin di-initialize. Anda dapat mengisinya sekarang atau menambahkan match baru sesuka hati di Dashboard Host:
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {[2, 4, 6, 8, 12].map((cnt) => (
                        <button
                          type="button"
                          key={cnt}
                          onClick={() => {
                            setIsCustomMatchesCountInput(false);
                            setCustomInitialMatchesCount(cnt);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black border-2 border-black transition-all cursor-pointer ${
                            !isCustomMatchesCountInput && customInitialMatchesCount === cnt
                              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                              : "bg-white text-black hover:bg-slate-50"
                          }`}
                        >
                          {cnt} Match
                        </button>
                      ))}

                      {/* Tombol Input Bebas Custom Jumlah Match */}
                      <button
                        type="button"
                        onClick={() => setIsCustomMatchesCountInput(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black border-2 border-black transition-all cursor-pointer ${
                          isCustomMatchesCountInput
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        Isi Bebas
                      </button>
                    </div>

                    {isCustomMatchesCountInput && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-black/70">Jumlah Match:</span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={customInitialMatchesCount}
                          onChange={(e) => setCustomInitialMatchesCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-24 text-center font-mono font-black text-sm rounded-lg bg-white border-2 border-black px-2 py-1 shadow-[1px_1px_0px_#000]"
                        />
                        <span className="text-xs font-mono font-black">Pertandingan Siap Susun</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Biaya Shuttlecock / Bola & Model Hitungan (Per Butir vs Per Slop) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      6. Biaya Shuttlecock / Bola & Model Hitungan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-black shadow-[1px_1px_0px_#000]">
                    Harga Customizable
                  </span>
                </div>

                {/* Pilihan Model: Hitung Per Butir vs Per Slop */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
                    Pilih Cara Hitung Biaya:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEquipmentPricingModel("per_unit")}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                        equipmentPricingModel === "per_unit"
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <span className="text-2xl">🏸</span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide block">
                          Hitung Per Butir (Cock / Bola)
                        </span>
                        <span className="text-[10px] font-bold text-black/70">
                          Catat pemakaian per butir per match
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEquipmentPricingModel("per_slop")}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                        equipmentPricingModel === "per_slop"
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <span className="text-2xl">📦</span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide block">
                          Hitung Per Slop (Tabung / Can)
                        </span>
                        <span className="text-[10px] font-bold text-black/70">
                          Patungan per slop yang dibuka
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Form Input Custom Harga Sesuai Pilihan */}
                {equipmentPricingModel === "per_unit" ? (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-[11px] font-black uppercase text-black block">
                          Harga Custom Per Butir Cock/Bola (Rp):
                        </label>
                        <span className="text-[10px] text-slate-600 font-bold">
                          Contoh: Rp 12.000 / kok (Setara Rp{" "}
                          {(
                            (parseInt(costPerUnitInput, 10) || 12000) * 12
                          ).toLocaleString("id-ID")}{" "}
                          / slop)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-black">Rp</span>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          value={costPerUnitInput}
                          onChange={(e) => setCostPerUnitInput(e.target.value)}
                          className="w-32 rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/10">
                      <span className="text-[10px] font-mono font-bold text-black/50">Preset Cepat:</span>
                      {[10000, 12000, 15000, 20000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCostPerUnitInput(val.toString())}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                            costPerUnitInput === val.toString()
                              ? "bg-black text-[#ccff00] border-black"
                              : "bg-[#faf8f2] text-black border-black/40 hover:border-black"
                          }`}
                        >
                          Rp {val.toLocaleString("id-ID")}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-black uppercase text-black block mb-1">
                          Harga Custom Per Slop / Tabung (Rp):
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black">Rp</span>
                          <input
                            type="number"
                            step="5000"
                            min="0"
                            value={costPerSlopInput}
                            onChange={(e) => setCostPerSlopInput(e.target.value)}
                            className="w-full rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase text-black block mb-1">
                          Isi Cock / Bola Per Slop:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={unitsPerSlopInput}
                            onChange={(e) => setUnitsPerSlopInput(e.target.value)}
                            className="w-20 text-center rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none focus:bg-white"
                          />
                          <span className="text-xs font-mono font-bold text-slate-700">
                            Butir / Slop (~Rp{" "}
                            {Math.round(
                              (parseInt(costPerSlopInput, 10) || 140000) /
                                (parseInt(unitsPerSlopInput, 10) || 12)
                            ).toLocaleString("id-ID")}
                            /butir)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Buttons Slop */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/10">
                      <span className="text-[10px] font-mono font-bold text-black/50">Preset Slop Populer:</span>
                      {[
                        { label: "Standard (Rp 120rb)", val: 120000 },
                        { label: "Samurai/JP (Rp 140rb)", val: 140000 },
                        { label: "Aeroplane (Rp 180rb)", val: 180000 },
                        { label: "Yonex AS (Rp 290rb)", val: 290000 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setCostPerSlopInput(item.val.toString())}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                            costPerSlopInput === item.val.toString()
                              ? "bg-black text-[#ccff00] border-black"
                              : "bg-[#faf8f2] text-black border-black/40 hover:border-black"
                          }`}
                        >
                          {item.label}
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

          {/* Sesi Terakhir (Recent Sessions Dropdown - Tampilkan 2 Recent Aja) */}
          <div className="rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b-3 border-black">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-black stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Sesi Tersimpan
                </h3>
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_#000]">
                2 Recent
              </span>
            </div>

            {recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500 italic">
                Belum ada sesi tersimpan. Klik tombol demo untuk mencoba.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Custom Neo-Brutalist Dropdown Selector (2 Recent Only) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRecentDropdownOpen(!isRecentDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#faf8f2] border-2 border-black font-black text-xs uppercase tracking-wide hover:bg-[#ccff00]/30 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="h-4 w-4 shrink-0 text-black/70" />
                      <span className="truncate">
                        Pilih Sesi Terakhir ({Math.min(2, recentSessions.length)})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isRecentDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Content (2 recent only) */}
                  {isRecentDropdownOpen && (
                    <div className="mt-2 flex flex-col gap-2 p-2 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-150">
                      {recentSessions.slice(0, 2).map((s) => (
                        <Link
                          key={s.id}
                          href={`/host/${s.publicSlug}`}
                          className="flex flex-col p-3 rounded-xl bg-[#faf8f2] border-2 border-black hover:bg-[#ccff00] transition-all group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-black truncate uppercase group-hover:underline">
                              {s.title}
                            </span>
                            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-black text-[#ccff00] shrink-0 ml-1.5">
                              {s.sport}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 font-mono-sport">
                            <span>{s.playerCount} Pemain</span>
                            <span>
                              {new Date(s.updatedAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct quick access preview for the 2 recent sessions */}
                <div className="space-y-2 mt-1">
                  <span className="text-[10px] font-black uppercase text-black/50 tracking-wider">
                    2 Sesi Paling Baru:
                  </span>
                  {recentSessions.slice(0, 2).map((s) => (
                    <Link
                      key={s.id}
                      href={`/host/${s.publicSlug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f2] border-2 border-black hover:bg-yellow-50 hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                      <div className="truncate pr-2">
                        <p className="font-black text-xs text-black truncate uppercase">{s.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          {s.playerCount} Pemain • {s.sport.toUpperCase()}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-black" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Popup Penjelasan Algoritma Lengkap */}
      <AlgorithmExplainerModal
        isOpen={isAlgoExplainerOpen}
        onClose={() => setIsAlgoExplainerOpen(false)}
        selectedAlgorithm={selectedAlgorithm}
        onSelectAlgorithm={(algo) => setSelectedAlgorithm(algo)}
      />
    </div>
  );
}
