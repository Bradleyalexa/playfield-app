"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  MapPin,
  ExternalLink,
  ClipboardPaste,
  Trash2,
  X,
  UserPlus,
  Shuffle,
} from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import { AlgorithmExplainerModal } from "../components/schedule/AlgorithmExplainerModal";
import { WaPasteModal } from "../components/players/WaPasteModal";
import { Player, getTierFromSkill, getTierLabel } from "../core/entities/player";
import { generateBalancedMatches, addMinutesToTimeString } from "../core/matchmaking/balanced-queue";
import {
  ALGORITHM_REGISTRY,
  BillingModel,
  EquipmentPricingModel,
  MatchmakingAlgorithm,
  SportType,
} from "../core/entities/session";
import { SportRegistry } from "../core/sports/sport-registry";
import { LocalStorageAdapter } from "../services/storage/local-storage.adapter";
import { Court, Match } from "../core/entities/match";
import { formatIndonesianDate } from "../lib/time-tracker";

export default function HomePage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>("badminton");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [courtLocation, setCourtLocation] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
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

  // Pengaturan Biaya & Patungan (Nomor 6)
  const [billingModelChoice, setBillingModelChoice] = useState<BillingModel>("track_equipment");
  const [fixedPriceInput, setFixedPriceInput] = useState<string>("40000");
  const [courtRentalFeeInput, setCourtRentalFeeInput] = useState<string>("160000");
  const [equipmentPricingModel, setEquipmentPricingModel] = useState<EquipmentPricingModel>("per_unit");
  const [costPerUnitInput, setCostPerUnitInput] = useState<string>("12000");
  const [costPerSlopInput, setCostPerSlopInput] = useState<string>("140000");
  const [unitsPerSlopInput, setUnitsPerSlopInput] = useState<string>("12");
  const [bankNameInput, setBankNameInput] = useState<string>("BCA");
  const [accountNumberInput, setAccountNumberInput] = useState<string>("");
  const [accountHolderInput, setAccountHolderInput] = useState<string>("");

  // Dropdown Sesi Tersimpan (Hanya Tampilkan 2 Recent)
  const [isRecentDropdownOpen, setIsRecentDropdownOpen] = useState(false);

  // Modal Penjelasan Algoritma
  const [isAlgoExplainerOpen, setIsAlgoExplainerOpen] = useState(false);

  // Daftar Pemain Awal (Bisa Diisi Sebelum Sesi Dimulai / Paste WA)
  const [initialPlayers, setInitialPlayers] = useState<Player[]>([
    {
      id: "p1",
      name: "Hendra Setiawan",
      gender: "M",
      skillLevel: 3,
      publicTier: "suhu",
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1250,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "p2",
      name: "Kevin Sanjaya",
      gender: "M",
      skillLevel: 3,
      publicTier: "suhu",
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1300,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "p3",
      name: "Greysia Polii",
      gender: "F",
      skillLevel: 3,
      publicTier: "suhu",
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1290,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "p4",
      name: "Apriyani Rahayu",
      gender: "F",
      skillLevel: 3,
      publicTier: "suhu",
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1280,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [quickPlayerName, setQuickPlayerName] = useState("");
  const [quickGender, setQuickGender] = useState<"M" | "F">("M");
  const [quickSkill, setQuickSkill] = useState<1 | 2 | 3>(2);

  const handleAddQuickPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickPlayerName.trim()) return;
    const newP: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: quickPlayerName.trim(),
      gender: quickGender,
      skillLevel: quickSkill,
      publicTier: getTierFromSkill(quickSkill),
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1000 + (quickSkill - 2) * 100,
      createdAt: new Date().toISOString(),
    };
    setInitialPlayers((prev) => [...prev, newP]);
    setQuickPlayerName("");
  };

  const handleImportWaPlayers = (newPlayers: Player[]) => {
    setInitialPlayers((prev) => [...prev, ...newPlayers]);
  };

  const handleRemoveInitialPlayer = (id: string) => {
    setInitialPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadDemo4Players = () => {
    setInitialPlayers([
      { id: `p-${Date.now()}-1`, name: "Hendra Setiawan", gender: "M", skillLevel: 3, publicTier: "suhu", gamesPlayed: 0, lastPlayedRound: 0, status: "active", eloRating: 1300, createdAt: new Date().toISOString() },
      { id: `p-${Date.now()}-2`, name: "Kevin Sanjaya", gender: "M", skillLevel: 3, publicTier: "suhu", gamesPlayed: 0, lastPlayedRound: 0, status: "active", eloRating: 1320, createdAt: new Date().toISOString() },
      { id: `p-${Date.now()}-3`, name: "Greysia Polii", gender: "F", skillLevel: 3, publicTier: "suhu", gamesPlayed: 0, lastPlayedRound: 0, status: "active", eloRating: 1290, createdAt: new Date().toISOString() },
      { id: `p-${Date.now()}-4`, name: "Apriyani Rahayu", gender: "F", skillLevel: 3, publicTier: "suhu", gamesPlayed: 0, lastPlayedRound: 0, status: "active", eloRating: 1280, createdAt: new Date().toISOString() },
    ]);
  };

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
    demo.sessionDate = sessionDate.trim() || undefined;
    demo.courtCount = courtCount;
    demo.startTime = startTime;
    demo.durationHours = effectiveDurationHours;
    demo.matchDurationMinutes = effectiveMatchDurationMinutes;
    demo.algorithm = selectedAlgorithm;
    demo.estimatedMatchesCount = totalProjectedMatches;
    demo.courtLocation = courtLocation.trim() || undefined;
    demo.googleMapsUrl = googleMapsUrl.trim() || undefined;
    demo.players = initialPlayers;

    // Konfigurasi Equipment (Cock / Bola & Slop)
    const isTrackingEquipment = billingModelChoice === "track_equipment";
    demo.sportConfig.equipment = {
      enabled: isTrackingEquipment,
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

    // Konfigurasi Billing & Split Bill Mabar
    demo.billing = {
      model: billingModelChoice,
      fixedPricePerPerson:
        billingModelChoice === "fixed_per_person"
          ? Math.max(0, parseInt(fixedPriceInput, 10) || 40000)
          : undefined,
      courtRentalFee:
        billingModelChoice === "track_equipment"
          ? Math.max(0, parseInt(courtRentalFeeInput, 10) || 160000)
          : undefined,
      bankName: bankNameInput.trim() || undefined,
      accountNumber: accountNumberInput.trim() || undefined,
      accountHolder: accountHolderInput.trim() || undefined,
    };

    // Inisialisasi seluruh lapangan (demo.courts) sesuai jumlah courtCount yang dipilih host
    const courtColors = ["Hijau", "Biru", "Merah", "Ungu", "Abu-abu", "Kuning", "Tosca", "Oranye"];
    const generatedCourts: Court[] = [];
    for (let i = 1; i <= courtCount; i++) {
      const colorName = courtColors[(i - 1) % courtColors.length];
      generatedCourts.push({
        id: `c${i}-${Date.now()}`,
        courtNumber: i,
        courtName: `Lapangan ${i} (Karpet ${colorName})`,
        currentMatch: undefined,
      });
    }
    demo.courts = generatedCourts;

    // Shuffle & Matchmaking Ronde 1 berdasarkan algoritma yang dipilih
    if (selectedAlgorithm === "custom_manual") {
      const customMatches: Match[] = [];
      const totalToInit = customInitialMatchesCount || (courtCount * 2);
      if (initialPlayers.length >= 4) {
        for (let i = 0; i < totalToInit; i++) {
          const cNum = (i % courtCount) + 1;
          const rNum = Math.floor(i / courtCount) + 1;
          const four = initialPlayers.slice(0, 4);
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
        demo.courts = generatedCourts.map((c) => ({
          ...c,
          currentMatch: customMatches.find((m) => m.courtNumber === c.courtNumber && m.roundNumber === 1),
        }));
      } else {
        demo.matches = [];
        demo.courts = generatedCourts;
      }
    } else if (initialPlayers.length >= 4) {
      const initialMatches = generateBalancedMatches(initialPlayers, courtCount, 1, selectedAlgorithm);
      demo.matches = initialMatches.matches;
      demo.courts = generatedCourts.map((c) => ({
        ...c,
        currentMatch: initialMatches.matches.find((m) => m.courtNumber === c.courtNumber) || undefined,
      }));
    } else {
      demo.matches = [];
      demo.courts = generatedCourts;
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

      <main className="flex-1 mx-auto max-w-6xl w-full px-3.5 sm:px-6 py-6 sm:py-12 pb-28 sm:pb-12 flex flex-col gap-8 sm:gap-10">
        {/* Playfield Official Banner Card - Neo Brutalist */}
        <div className="w-full max-w-2xl mx-auto rounded-3xl border-3 sm:border-4 border-black bg-white p-2.5 sm:p-4 shadow-[5px_5px_0px_#000] sm:shadow-[8px_8px_0px_#000]">
          <div className="relative w-full h-32 sm:h-52 rounded-2xl overflow-hidden border-2 border-black bg-black">
            <Image
              src="/playfield_banner.png"
              alt="Playfield Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Hero Section - Athletic Neo-Brutalism */}
        <div className="flex flex-col items-center text-center gap-3.5 max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#ccff00] border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            <span>Pocket Assistant Host Mabar & Matchmaker</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.08] uppercase">
            Atur Rotasi Lapangan Mabar{" "}
            <span className="bg-[#ccff00] px-2 py-0.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] inline-block mt-1">
              Tanpa Ribet!
            </span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-800 max-w-2xl leading-relaxed">
            Pasangan ganda otomatis seimbang atau susun manual sesukamu, prediksi durasi sewa, panggil giliran via speaker Bluetooth,
            counter shuttlecock/bola, dan display TV GOR secara instan tanpa perlu akun pemain.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto mt-2">
            <button
              onClick={handleLaunchDemo}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer min-h-[48px]"
            >
              <Play className="h-5 w-5 fill-black stroke-[2.5]" />
              <span>Coba Demo Langsung (1-Klik)</span>
            </button>
            <Link
              href="/education"
              className="flex items-center justify-center gap-2 rounded-xl border-3 border-black bg-white px-6 py-3.5 text-sm font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all min-h-[48px]"
            >
              <BookOpen className="h-5 w-5 stroke-[2.5]" />
              <span>Panduan & Edukasi Sport</span>
            </Link>
          </div>
        </div>

        {/* Form Buat Sesi Baru */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 rounded-3xl border-3 sm:border-4 border-black bg-white p-4 sm:p-8 shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000]">
            <div className="flex items-center gap-3 pb-4 border-b-3 border-black mb-6">
              <div className="h-11 w-11 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black shrink-0">
                <Plus className="h-6 w-6 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-wide">Buat Sesi Mabar Baru</h2>
                <p className="text-xs font-bold text-slate-600">
                  Konfigurasikan jam sewa, durasi, algoritma, dan opsional biaya bola
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

              {/* 2b. Hari & Tanggal Mabar (Opsional) */}
              <div className="p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[3px_3px_0px_#000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                    <span>Hari & Tanggal Mabar (Opsional)</span>
                  </label>
                  {sessionDate && (
                    <span className="text-xs font-mono font-black text-black bg-[#ccff00] px-2.5 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
                      📅 {formatIndonesianDate(sessionDate)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="flex-1 min-w-[180px] rounded-xl bg-white border-2 border-black px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000] font-mono cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const yyyy = now.getFullYear();
                        const mm = String(now.getMonth() + 1).padStart(2, "0");
                        const dd = String(now.getDate()).padStart(2, "0");
                        setSessionDate(`${yyyy}-${mm}-${dd}`);
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmr = new Date(Date.now() + 86400000);
                        const yyyy = tmr.getFullYear();
                        const mm = String(tmr.getMonth() + 1).padStart(2, "0");
                        const dd = String(tmr.getDate()).padStart(2, "0");
                        setSessionDate(`${yyyy}-${mm}-${dd}`);
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      Besok
                    </button>
                    {sessionDate && (
                      <button
                        type="button"
                        onClick={() => setSessionDate("")}
                        className="px-3 py-2 rounded-xl bg-rose-200 hover:bg-rose-300 border-2 border-black text-xs font-black text-rose-900 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        title="Hapus tanggal"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2c. Alamat Lapangan & Link Google Maps (Opsional untuk Penonton & Kiosk) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[3px_3px_0px_#000]">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-600" />
                    <span>Nama / Alamat GOR Lapangan (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={courtLocation}
                    onChange={(e) => setCourtLocation(e.target.value)}
                    placeholder="Contoh: GOR Tomang Barat, Lapangan 1-2..."
                    className="w-full rounded-xl bg-white border-2 border-black px-3.5 py-2.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    <span>Link Google Maps Lapangan (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="Contoh: https://maps.app.goo.gl/..."
                    className="w-full rounded-xl bg-white border-2 border-black px-3.5 py-2.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>
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

              {/* 5. Daftar Pemain Mabar (Bisa Diisi Sekarang / Nanti di Dashboard) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      5. Masukkan Daftar Pemain Mabar (Opsional Diisi Sekarang)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_#000]">
                      {initialPlayers.length} Pemain (
                      {initialPlayers.filter((p) => p.gender === "M").length} M •{" "}
                      {initialPlayers.filter((p) => p.gender === "F").length} W)
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-700">
                  Host dapat mengisi daftar nama pemain sekarang agar <strong>Ronde 1 langsung dikocok & diatur otomatis</strong> oleh algoritma begitu mabar dimulai, atau bisa juga diisi/ditambahkan nanti saat di Dashboard.
                </p>

                {/* Action Bar Pemain: Paste WA & Preset */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWaModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#ccff00] border-2 border-black px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <ClipboardPaste className="h-4 w-4 stroke-[2.5]" />
                    <span>Paste List WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadDemo4Players}
                    className="flex items-center gap-1 rounded-xl bg-white border-2 border-black px-3 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <span>⚡ Isi 4 Pemain Contoh</span>
                  </button>

                  {initialPlayers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setInitialPlayers([])}
                      className="flex items-center gap-1 rounded-xl bg-white border-2 border-black px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                </div>

                {/* Quick Add Form Mini */}
                <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={quickPlayerName}
                    onChange={(e) => setQuickPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddQuickPlayer();
                      }
                    }}
                    placeholder="Ketik nama pemain (contoh: Joko, Maya, Dedi)..."
                    className="flex-1 rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:bg-white"
                  />

                  {/* Gender Selector: M vs W */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickGender("M")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                        quickGender === "M"
                          ? "bg-blue-200 text-blue-950 shadow-[2px_2px_0px_#000]"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      👦 M
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickGender("F")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                        quickGender === "F"
                          ? "bg-pink-200 text-pink-950 shadow-[2px_2px_0px_#000]"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      👧 W
                    </button>
                  </div>

                  {/* Skill Tier Selector */}
                  <select
                    value={quickSkill}
                    onChange={(e) => setQuickSkill(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                    className="rounded-lg bg-[#faf8f2] border-2 border-black px-2.5 py-1.5 text-xs font-black text-black cursor-pointer"
                  >
                    <option value={1}>Kentang (Beginner)</option>
                    <option value={2}>Hore (Intermediate)</option>
                    <option value={3}>Suhu (Advanced)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddQuickPlayer}
                    className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg bg-black text-[#ccff00] text-xs font-black uppercase tracking-wider hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Tambah</span>
                  </button>
                </div>

                {/* List Chips Pemain */}
                {initialPlayers.length === 0 ? (
                  <div className="py-4 text-center rounded-xl bg-white border-2 border-dashed border-black/40 text-xs font-bold text-slate-600">
                    Belum ada pemain. Kamu bisa paste dari WhatsApp sekarang atau nanti saat mabar dimulai.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1">
                    {initialPlayers.map((player) => {
                      const tier = getTierLabel(player.publicTier);
                      return (
                        <div
                          key={player.id}
                          className="flex items-center gap-1.5 rounded-xl bg-white border-2 border-black px-2.5 py-1 text-xs shadow-[2px_2px_0px_#000]"
                        >
                          <span className="font-extrabold text-black">{player.name}</span>
                          <span
                            className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                              player.gender === "M"
                                ? "bg-blue-100 text-blue-900 border-blue-400"
                                : "bg-pink-100 text-pink-900 border-pink-400"
                            }`}
                          >
                            {player.gender === "M" ? "M" : "W"}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded ${tier.badgeColor}`}>
                            {tier.label.replace("Tier ", "")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInitialPlayer(player.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                            title="Hapus"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Pilihan Algoritma Mabar (Dengan Banner Trigger Modal Penjelasan di Tengah) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                  6. Pilih Algoritma Rotasi Lapangan & Matchmaking (7 Algoritma)
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

              {/* 6. Biaya Shuttlecock / Bola (Opsional Host) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      6. Model Pembayaran &amp; Biaya Mabar (Cock &amp; Sewa Lapangan)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
                    billingModelChoice === "fixed_per_person"
                      ? "bg-[#ccff00] text-black"
                      : billingModelChoice === "track_equipment"
                      ? "bg-[#ffde00] text-black"
                      : "bg-white text-slate-700"
                  }`}>
                    {billingModelChoice === "fixed_per_person"
                      ? "Fixed Price"
                      : billingModelChoice === "track_equipment"
                      ? "Hitung Cock + Split Bill"
                      : "Tanpa Biaya (Gratis)"}
                  </span>
                </div>

                {/* 3 Pilihan Model: Fixed Price, Itung Cock, atau Tanpa Biaya */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
                    Pilih Skema Patungan / Biaya Mabar:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Opsi 1: Fixed Price */}
                    <button
                      type="button"
                      onClick={() => setBillingModelChoice("fixed_per_person")}
                      className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                        billingModelChoice === "fixed_per_person"
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🎯</span>
                        <span className="text-xs font-black uppercase tracking-wide">
                          Fixed Price
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 leading-tight">
                        Tarif tetap per orang all-in (misal Rp 40rb). Tanpa hitung cock.
                      </span>
                    </button>

                    {/* Opsi 2: Itung Cock + Split Bill */}
                    <button
                      type="button"
                      onClick={() => setBillingModelChoice("track_equipment")}
                      className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                        billingModelChoice === "track_equipment"
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🏸</span>
                        <span className="text-xs font-black uppercase tracking-wide">
                          Itung Cock &amp; Sewa
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 leading-tight">
                        Catat cock &amp; sewa lapangan. Split bill otomatis di akhir.
                      </span>
                    </button>

                    {/* Opsi 3: Tanpa Biaya / Bebas */}
                    <button
                      type="button"
                      onClick={() => setBillingModelChoice("none")}
                      className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                        billingModelChoice === "none"
                          ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">✨</span>
                        <span className="text-xs font-black uppercase tracking-wide">
                          Tanpa Biaya
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-black/70 leading-tight">
                        Sesi santai / gratis. Tidak ada counter bola atau tagihan.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sub-form Opsi 1: Fixed Price */}
                {billingModelChoice === "fixed_per_person" && (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-[11px] font-black uppercase text-black block">
                          Harga Mabar Tetap Per Orang (All-In):
                        </label>
                        <span className="text-[10px] text-slate-600 font-bold">
                          Tagihan per peserta yang akan ditampilkan di rekap akhir
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-black">Rp</span>
                        <input
                          type="number"
                          step="5000"
                          min="0"
                          value={fixedPriceInput}
                          onChange={(e) => setFixedPriceInput(e.target.value)}
                          className="w-32 rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none focus:bg-white"
                          placeholder="40000"
                        />
                        <span className="text-xs font-bold text-slate-600">/org</span>
                      </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/10">
                      <span className="text-[10px] font-mono font-bold text-black/50">Preset Cepat:</span>
                      {[25000, 30000, 35000, 40000, 50000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFixedPriceInput(val.toString())}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                            fixedPriceInput === val.toString()
                              ? "bg-black text-[#ccff00] border-black"
                              : "bg-[#faf8f2] text-black border-black/40 hover:border-black"
                          }`}
                        >
                          Rp {val.toLocaleString("id-ID")}
                        </button>
                      ))}
                    </div>

                    {/* Form Rekening Pembayaran */}
                    <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase text-black block">
                        💳 Info Rekening Transfer Host (Opsional - Muncul di Pesan WhatsApp):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Bank / E-Wallet (misal: BCA)"
                          value={bankNameInput}
                          onChange={(e) => setBankNameInput(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
                        />
                        <input
                          type="text"
                          placeholder="No. Rekening / No. HP"
                          value={accountNumberInput}
                          onChange={(e) => setAccountNumberInput(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-bold bg-[#faf8f2]"
                        />
                        <input
                          type="text"
                          placeholder="Atas Nama Rekening"
                          value={accountHolderInput}
                          onChange={(e) => setAccountHolderInput(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form Opsi 2: Itung Cock + Split Bill */}
                {billingModelChoice === "track_equipment" && (
                  <div className="flex flex-col gap-3 animate-in fade-in">
                    {/* Pilihan Model: Hitung Per Butir vs Per Slop */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
                        Pilih Cara Hitung Biaya Shuttlecock/Bola:
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

                    {/* Form Input Custom Harga Cock */}
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
                                Butir (~Rp{" "}
                                {Math.round(
                                  (parseInt(costPerSlopInput, 10) || 140000) /
                                    (parseInt(unitsPerSlopInput, 10) || 12)
                                ).toLocaleString("id-ID")}{" "}
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

                    {/* Estimasi Sewa Lapangan & Info Rekening Transfer */}
                    <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-[11px] font-black uppercase text-black block">
                            Estimasi Total Sewa Lapangan (Rp):
                          </label>
                          <span className="text-[10px] text-slate-600 font-bold">
                            Bisa diubah kembali saat selesai mabar untuk split bill
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black">Rp</span>
                          <input
                            type="number"
                            step="10000"
                            min="0"
                            value={courtRentalFeeInput}
                            onChange={(e) => setCourtRentalFeeInput(e.target.value)}
                            className="w-36 rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none focus:bg-white"
                            placeholder="160000"
                          />
                        </div>
                      </div>

                      {/* Info Rekening */}
                      <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
                        <label className="text-[11px] font-black uppercase text-black block">
                          💳 Info Rekening Transfer Host (Untuk Pesan WhatsApp):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Bank / E-Wallet (misal: BCA)"
                            value={bankNameInput}
                            onChange={(e) => setBankNameInput(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
                          />
                          <input
                            type="text"
                            placeholder="No. Rekening / No. HP"
                            value={accountNumberInput}
                            onChange={(e) => setAccountNumberInput(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-bold bg-[#faf8f2]"
                          />
                          <input
                            type="text"
                            placeholder="Atas Nama Rekening"
                            value={accountHolderInput}
                            onChange={(e) => setAccountHolderInput(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form Opsi 3: Tanpa Biaya */}
                {billingModelChoice === "none" && (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-dashed border-black/50 text-xs font-bold text-slate-700 flex items-center gap-2.5 animate-in fade-in">
                    <span className="text-base">✨</span>
                    <span>
                      Mode santai: Dashboard Host dan Papan Penonton akan tampil bersih tanpa tombol hitung bola maupun tagihan biaya.
                    </span>
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

      {/* Modal WhatsApp Paste untuk Input Awal Pemain */}
      <WaPasteModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        onImportPlayers={handleImportWaPlayers}
      />
    </div>
  );
}
