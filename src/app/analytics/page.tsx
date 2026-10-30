"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  RefreshCw,
  Search,
  Calendar,
  Users,
  Trophy,
  ExternalLink,
  ArrowLeft,
  Tv,
  Eye,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Flame,
  Lock,
} from "lucide-react";
import { AnalyticsResponse, DayGroup, DailySessionSummary } from "../../core/entities/analytics";
import { AdminPinGate, lockAdminSession } from "../../components/common/AdminPinGate";

const SPORT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  badminton: { label: "Badminton", icon: "🏸", color: "bg-[#ccff00] text-black" },
  tennis: { label: "Tennis", icon: "🎾", color: "bg-[#7dd3fc] text-black" },
  padel: { label: "Padel", icon: "🎾", color: "bg-[#fde047] text-black" },
  table_tennis: { label: "Tenis Meja", icon: "🏓", color: "bg-[#fdba74] text-black" },
  pickleball: { label: "Pickleball", icon: "🏓", color: "bg-[#d8b4fe] text-black" },
  squash: { label: "Squash", icon: "🏸", color: "bg-[#f472b6] text-black" },
};

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [onlyRealSessions, setOnlyRealSessions] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const fetchAnalytics = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const pin = typeof window !== "undefined" ? sessionStorage.getItem("playfield_admin_pin") || "4137" : "4137";
      const url = force ? `/api/analytics?refresh=true&pin=${pin}` : `/api/analytics?pin=${pin}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "x-admin-pin": pin },
      });
      if (!res.ok) throw new Error("Gagal mengambil data analitik dari server.");
      const json: AnalyticsResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(false);
  }, []);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // Filtered Daily Groups
  const filteredGroups = useMemo(() => {
    if (!data || !data.dailyGroups) return [];

    const query = searchQuery.trim().toLowerCase();

    return data.dailyGroups
      .filter((day) => {
        if (selectedDate !== "all" && day.date !== selectedDate) {
          return false;
        }
        return true;
      })
      .map((day) => {
        const filteredSessions = day.sessions.filter((s) => {
          // Filter quality: only real sessions (playerCount >= 4 or matchCount >= 1 or playerCount > 0)
          if (onlyRealSessions && !s.isRealSession && s.playerCount === 0) {
            return false;
          }

          // Filter sport
          if (selectedSport !== "all" && s.sport !== selectedSport) {
            return false;
          }

          // Search query
          if (query) {
            const matchTitle = s.title.toLowerCase().includes(query);
            const matchSlug = s.slug.toLowerCase().includes(query);
            const matchLocation = (s.courtLocation || "").toLowerCase().includes(query);
            const matchPlayer = s.players.some((p) => p.toLowerCase().includes(query));
            if (!matchTitle && !matchSlug && !matchLocation && !matchPlayer) {
              return false;
            }
          }

          return true;
        });

        return {
          ...day,
          sessions: filteredSessions,
        };
      })
      .filter((day) => day.sessions.length > 0);
  }, [data, selectedDate, selectedSport, onlyRealSessions, searchQuery]);

  // Total sessions today
  const todaySessionsCount = useMemo(() => {
    if (!data?.dailyGroups?.length) return 0;
    const today = data.dailyGroups.find((g) => g.relativeLabel === "Hari Ini");
    return today ? today.totalSessions : 0;
  }, [data]);

  const todayRealSessionsCount = useMemo(() => {
    if (!data?.dailyGroups?.length) return 0;
    const today = data.dailyGroups.find((g) => g.relativeLabel === "Hari Ini");
    return today ? today.realSessionsCount : 0;
  }, [data]);

  return (
    <AdminPinGate pageTitle="Analitik Sesi Mabar">
      <div className="min-h-screen bg-[#faf8f2] text-black font-sans selection:bg-[#ccff00] selection:text-black pb-24">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-40 border-b-3 sm:border-b-4 border-black bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 sm:p-2.5 rounded-xl border-2 border-black bg-[#faf8f2] hover:bg-[#ccff00] text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                title="Kembali ke Beranda Playfield"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] text-black shrink-0">
                  <BarChart3 className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-black leading-none">
                      Analitik Harian Mabar
                    </h1>
                    <span className="hidden sm:inline-block rounded-md bg-black px-1.5 py-0.5 text-[10px] font-black uppercase text-[#ccff00] tracking-wider">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">
                    Rekap pembuatan sesi & aktivitas pemain per hari (Waktu Indonesia Barat)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/mailbox"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-black bg-white hover:bg-[#faf8f2] text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Mailbox</span>
              </Link>

              <button
                onClick={() => fetchAnalytics(true)}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
              </button>

              <button
                onClick={lockAdminSession}
                title="Kunci Akses Admin (Logout)"
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border-2 border-black bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kunci</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Sesi */}
            <div className="rounded-2xl border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Total Sesi Terbuat
                </div>
                <div className="text-2xl sm:text-4xl font-black mt-1 text-black font-mono">
                  {isLoading ? "..." : data?.totalAllTimeSessions || 0}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-400 px-2.5 py-1 rounded-lg w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>+{todaySessionsCount} hari ini</span>
              </div>
            </div>

            {/* Card 2: Sesi Riil Aktif */}
            <div className="rounded-2xl border-3 border-black bg-[#ccff00] p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-black/70">
                  Sesi Riil (Ada Pemain/Match)
                </div>
                <div className="text-2xl sm:text-4xl font-black mt-1 text-black font-mono">
                  {isLoading ? "..." : data?.totalRealSessions || 0}
                </div>
              </div>
              <div className="mt-3 text-xs font-bold text-black/80">
                {todayRealSessionsCount} sesi aktif hari ini
              </div>
            </div>

            {/* Card 3: Total Partisipasi Pemain */}
            <div className="rounded-2xl border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Total Jatah Pemain Terdata
                </div>
                <div className="text-2xl sm:text-4xl font-black mt-1 text-black font-mono">
                  {isLoading ? "..." : data?.totalAllTimePlayers?.toLocaleString("id-ID") || 0}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>Di seluruh cabor</span>
              </div>
            </div>

            {/* Card 4: Total Pertandingan */}
            <div className="rounded-2xl border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Total Pertandingan
                </div>
                <div className="text-2xl sm:text-4xl font-black mt-1 text-black font-mono">
                  {isLoading ? "..." : data?.totalAllTimeMatches?.toLocaleString("id-ID") || 0}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Trophy className="h-3.5 w-3.5 text-slate-500" />
                <span>Tergelontor di lapangan</span>
              </div>
            </div>
          </div>

          {/* Sports Overview Chips */}
          {data?.sportsOverview && Object.keys(data.sportsOverview).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1 mr-1">
                Cabor:
              </span>
              <button
                onClick={() => setSelectedSport("all")}
                className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedSport === "all"
                    ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                    : "bg-zinc-100 text-black hover:bg-zinc-200"
                }`}
              >
                Semua ({data.totalAllTimeSessions})
              </button>
              {Object.entries(data.sportsOverview).map(([sport, count]) => {
                const info = SPORT_LABELS[sport] || {
                  label: sport,
                  icon: "🏅",
                  color: "bg-zinc-100 text-black",
                };
                const isSelected = selectedSport === sport;
                return (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? `${info.color} shadow-[2px_2px_0px_#000] scale-105`
                        : "bg-white text-black hover:bg-slate-100"
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Filters & Search Control Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000]">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul sesi, nama pemain (cth: Owen, Kevin), atau lokasi GOR..."
                className="w-full rounded-xl border-2 border-black bg-[#faf8f2] pl-10 pr-4 py-2 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ccff00]"
              />
            </div>

            {/* Quick Date Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border-2 border-black bg-[#faf8f2] px-3 py-2 text-xs font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-[#ccff00]"
                >
                  <option value="all">Semua Tanggal ({data?.dailyGroups?.length || 0} Hari)</option>
                  {data?.dailyGroups?.map((g) => (
                    <option key={g.date} value={g.date}>
                      {g.date} ({g.relativeLabel}) — {g.totalSessions} sesi
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Real Sessions Only */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-black bg-[#faf8f2] cursor-pointer select-none text-xs font-bold hover:bg-zinc-100">
                <input
                  type="checkbox"
                  checked={onlyRealSessions}
                  onChange={(e) => setOnlyRealSessions(e.target.checked)}
                  className="h-4 w-4 accent-black rounded cursor-pointer"
                />
                <span className="hidden sm:inline">Hanya Sesi Riil (Pemain &gt; 0)</span>
                <span className="sm:hidden">Sesi Riil</span>
              </label>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-black" />
              <div className="text-sm font-black uppercase tracking-wider text-black">
                Mengambil & Mengelompokkan Sesi dari Cloudflare R2...
              </div>
              <p className="text-xs font-medium text-slate-500 max-w-sm">
                Sistem sedang memfilter dan mengurutkan sesi mabar berdasarkan tanggal lokal WIB.
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl border-3 border-rose-500 bg-rose-50 text-rose-800 text-sm font-bold shadow-[4px_4px_0px_#000]">
              {error}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-16 px-4 rounded-3xl border-3 border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-2 bg-white/70">
              <Activity className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-black text-slate-700 uppercase tracking-wide">
                Tidak Ada Sesi yang Sesuai Filter
              </div>
              <p className="text-xs font-medium text-slate-500 max-w-md">
                Coba sesuaikan kata kunci pencarian, ubah filter cabor, atau nonaktifkan centang &quot;Hanya Sesi Riil&quot;.
              </p>
            </div>
          ) : (
            /* Daily Groups Timeline */
            <div className="flex flex-col gap-6">
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedDates.has(group.date);
                const isToday = group.relativeLabel === "Hari Ini";

                return (
                  <section
                    key={group.date}
                    className={`rounded-3xl border-3 sm:border-4 border-black bg-white overflow-hidden shadow-[6px_6px_0px_#000] transition-all`}
                  >
                    {/* Group Header (Date, Totals, Collapse toggle) */}
                    <div
                      onClick={() => toggleDateCollapse(group.date)}
                      className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer border-b-2 sm:border-b-3 border-black ${
                        isToday ? "bg-[#ccff00]" : "bg-[#faf8f2]"
                      } hover:brightness-95 transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000]">
                          <Calendar className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black text-black">
                              {group.formattedDate}
                            </h2>
                            <span
                              className={`px-2 py-0.5 rounded-lg border border-black text-[11px] font-black uppercase tracking-wider ${
                                isToday
                                  ? "bg-black text-[#ccff00]"
                                  : group.relativeLabel === "Kemarin"
                                  ? "bg-sky-200 text-black"
                                  : "bg-white text-black"
                              }`}
                            >
                              {group.relativeLabel}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mt-1">
                            <span>{group.sessions.length} Sesi Terfilter</span>
                            <span>•</span>
                            <span>{group.totalPlayers} Pemain</span>
                            <span>•</span>
                            <span>{group.totalMatches} Pertandingan</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Sports Mini Breakdown Badges */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          {Object.entries(group.sportsBreakdown).map(([sport, cnt]) => {
                            const info = SPORT_LABELS[sport] || { label: sport, icon: "🏅" };
                            return (
                              <span
                                key={sport}
                                className="px-2 py-0.5 rounded-lg border border-black bg-white text-[11px] font-bold flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                              >
                                <span>{info.icon}</span>
                                <span>{cnt}</span>
                              </span>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_#000]"
                          aria-label="Toggle Collapse"
                        >
                          {isCollapsed ? (
                            <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                          ) : (
                            <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sessions Content Card List */}
                    {!isCollapsed && (
                      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/50">
                        {group.sessions.map((session) => {
                          const sportInfo = SPORT_LABELS[session.sport] || {
                            label: session.sport,
                            icon: "🏅",
                            color: "bg-zinc-100 text-black",
                          };

                          const hasLocation = !!session.courtLocation;
                          const hasPlayers = session.playerCount > 0;

                          return (
                            <div
                              key={session.id || session.slug}
                              className="rounded-2xl border-2 sm:border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform"
                            >
                              {/* Card Top: Title, Sport Badge, Time */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-lg border border-black text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 ${sportInfo.color}`}
                                    >
                                      <span>{sportInfo.icon}</span>
                                      <span>{sportInfo.label}</span>
                                    </span>
                                    {session.isRealSession && (
                                      <span className="px-2 py-0.5 rounded-lg border border-black bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <Flame className="h-3 w-3 text-emerald-700" />
                                        <span>Aktif</span>
                                      </span>
                                    )}
                                    {session.status === "completed" && (
                                      <span className="px-2 py-0.5 rounded-lg border border-black bg-zinc-200 text-black text-[10px] font-black uppercase tracking-wider">
                                        Selesai
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    <span>{session.wibTime} WIB</span>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-sm sm:text-base font-black text-black tracking-tight leading-snug">
                                    {session.title}
                                  </h3>
                                  <div className="text-[11px] font-mono font-bold text-slate-500">
                                    Slug: <span className="text-black font-bold">{session.slug}</span>
                                  </div>
                                </div>

                                {/* GOR Location */}
                                {hasLocation && (
                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-[#faf8f2] px-2 py-1 rounded-lg border border-black/10">
                                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                    <span className="truncate">{session.courtLocation}</span>
                                  </div>
                                )}
                              </div>

                              {/* Card Middle: Key Stats Row */}
                              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 text-center font-mono">
                                <div className="bg-zinc-50 p-2 rounded-xl border border-slate-200">
                                  <div className="text-[10px] uppercase font-bold text-slate-500">
                                    Pemain
                                  </div>
                                  <div className="text-base font-black text-black">
                                    {session.playerCount}
                                  </div>
                                </div>
                                <div className="bg-zinc-50 p-2 rounded-xl border border-slate-200">
                                  <div className="text-[10px] uppercase font-bold text-slate-500">
                                    Lapangan
                                  </div>
                                  <div className="text-base font-black text-black">
                                    {session.courtCount}
                                  </div>
                                </div>
                                <div className="bg-zinc-50 p-2 rounded-xl border border-slate-200">
                                  <div className="text-[10px] uppercase font-bold text-slate-500">
                                    Match
                                  </div>
                                  <div className="text-base font-black text-black">
                                    {session.matchCount}
                                    {session.completedMatchCount > 0 && (
                                      <span className="text-[10px] text-emerald-600 block">
                                        ({session.completedMatchCount} beres)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Player Preview Names */}
                              {hasPlayers ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Daftar Pemain ({session.players.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                    {session.players.slice(0, 10).map((name, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-slate-700 border border-slate-200 truncate max-w-[120px]"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                    {session.players.length > 10 && (
                                      <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-[10px] font-black text-slate-800">
                                        +{session.players.length - 10} lainnya
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[11px] font-bold text-slate-400 italic">
                                  Belum ada pemain terdaftar (sesi inisial)
                                </div>
                              )}

                              {/* Card Bottom: Action Links */}
                              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Algo: <span className="text-black">{session.algorithm}</span>
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/live/${session.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-zinc-100 text-[11px] font-bold shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                                    title="Lihat Papan Penonton Live"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Live</span>
                                  </Link>

                                  <Link
                                    href={`/host/${session.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] text-[11px] font-black text-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                                    title="Buka Dashboard Host Mabar"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Host</span>
                                  </Link>

                                  <Link
                                    href={`/kiosk/${session.slug}`}
                                    target="_blank"
                                    className="p-1 rounded-lg border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                                    title="Mode TV Kiosk GOR"
                                  >
                                    <Tv className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AdminPinGate>
  );
}
