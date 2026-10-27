"use client";

import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Plus,
  Users,
  Clock,
  Sparkles,
  Shuffle,
  BookOpen,
  Calendar,
  MapPin,
  ClipboardPaste,
  Trash2,
  X,
  User,
  Sliders,
  Receipt,
  ShieldCheck,
  Check,
  Flame,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { Player, SkillLevel, getTierLabel } from "../../core/entities/player";
import {
  ALGORITHM_REGISTRY,
  BillingModel,
  EquipmentPricingModel,
  MatchmakingAlgorithm,
  MatchType,
  SportType,
} from "../../core/entities/session";
import { formatIndonesianDate } from "../../lib/time-tracker";

interface SportMetaItem {
  tagline: string;
  equipmentBadge: string;
  bgSelected: string;
  colorAccent: string;
  courtName: string;
}

interface SessionWizardFormProps {
  sports: { type: SportType; displayName: string; emoji: string }[];
  sportMeta: Record<SportType, SportMetaItem>;
  selectedSport: SportType;
  onSelectSport: (sport: SportType, index?: number) => void;
  matchType: MatchType;
  setMatchType: (type: MatchType) => void;

  courtCount: number;
  setCourtCount: (count: number) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  adjustStartTime: (deltaMinutes: number) => void;
  durationHours: number;
  setDurationHours: (hours: number) => void;
  isCustomDuration: boolean;
  setIsCustomDuration: (val: boolean) => void;
  customDurationInput: string;
  setCustomDurationInput: (val: string) => void;

  matchDurationMinutes: number;
  setMatchDurationMinutes: (mins: number) => void;
  isCustomMatchDuration: boolean;
  setIsCustomMatchDuration: (val: boolean) => void;
  customMatchDurationInput: string;
  setCustomMatchDurationInput: (val: string) => void;

  effectiveDurationHours: number;
  effectiveMatchDurationMinutes: number;
  estimatedRounds: number;
  baseMatchesCount: number;
  totalProjectedMatches: number;

  selectedAlgorithm: MatchmakingAlgorithm;
  setSelectedAlgorithm: (algo: MatchmakingAlgorithm) => void;
  customInitialMatchesCount: number;
  setCustomInitialMatchesCount: (count: number) => void;
  onOpenAlgoExplainer: () => void;

  initialPlayers: Player[];
  quickPlayerName: string;
  setQuickPlayerName: (name: string) => void;
  quickGender: "M" | "F";
  setQuickGender: (gender: "M" | "F") => void;
  quickSkill: SkillLevel;
  setQuickSkill: (skill: SkillLevel) => void;
  onAddQuickPlayer: (e?: React.FormEvent) => void;
  onOpenWaModal: () => void;
  onLoadDemoPlayers: () => void;
  onRemovePlayer: (id: string) => void;
  onToggleGender: (id: string) => void;
  onCycleSkill: (id: string) => void;
  onToggleArrival: (id: string) => void;

  sessionTitle: string;
  setSessionTitle: (title: string) => void;
  sessionDate: string;
  setSessionDate: (date: string) => void;
  courtLocation: string;
  setCourtLocation: (location: string) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (url: string) => void;

  billingModelChoice: BillingModel;
  setBillingModelChoice: (model: BillingModel) => void;
  fixedPriceInput: string;
  setFixedPriceInput: (val: string) => void;
  courtRentalFeeInput: string;
  setCourtRentalFeeInput: (val: string) => void;
  equipmentPricingModel: EquipmentPricingModel;
  setEquipmentPricingModel: (model: EquipmentPricingModel) => void;
  costPerUnitInput: string;
  setCostPerUnitInput: (val: string) => void;
  costPerSlopInput: string;
  setCostPerSlopInput: (val: string) => void;
  unitsPerSlopInput: string;
  setUnitsPerSlopInput: (val: string) => void;
  bankNameInput: string;
  setBankNameInput: (val: string) => void;
  accountNumberInput: string;
  setAccountNumberInput: (val: string) => void;
  accountHolderInput: string;
  setAccountHolderInput: (val: string) => void;

  allowSpectatorScoreUpdate: boolean;
  setAllowSpectatorScoreUpdate: (allow: boolean) => void;

  isLocationDropdownOpen: boolean;
  setIsLocationDropdownOpen: (open: boolean) => void;
  isBillingDropdownOpen: boolean;
  setIsBillingDropdownOpen: (open: boolean) => void;
  isAdvancedDropdownOpen: boolean;
  setIsAdvancedDropdownOpen: (open: boolean) => void;

  onSubmit: (e: React.FormEvent) => void;
  onSwitchToFullForm: () => void;
}

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Cabor & Format",
  "Lapangan & Jam",
  "Sistem Rotasi",
  "Daftar Pemain",
  "Nama & Konfirmasi",
];

export function SessionWizardForm(props: SessionWizardFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [algoViewMode, setAlgoViewMode] = useState<"carousel" | "grid">("carousel");
  const sportCarouselRef = useRef<HTMLDivElement>(null);
  const algoCarouselRef = useRef<HTMLDivElement>(null);

  const scrollSportCarousel = (direction: "left" | "right") => {
    if (sportCarouselRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      sportCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollAlgoCarousel = (direction: "left" | "right") => {
    if (algoCarouselRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      algoCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const activeSportMeta = props.sportMeta[props.selectedSport] || {
    tagline: "Raket & Bola",
    equipmentBadge: "🏸",
    bgSelected: "bg-[#ccff00] text-black",
    colorAccent: "#ccff00",
    courtName: "Lapangan",
  };

  const activeAlgo = ALGORITHM_REGISTRY[props.selectedAlgorithm] || ALGORITHM_REGISTRY.playfields_mix;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress Bar & Step Navigation */}
      <div className="flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[3px_3px_0px_#000]">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase bg-black text-[#ccff00] px-2 py-0.5 rounded border border-black">
              Langkah {currentStep} dari {TOTAL_STEPS}
            </span>
            <span className="text-black uppercase tracking-wider hidden sm:inline">
              {STEP_LABELS[currentStep - 1]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={props.onSwitchToFullForm}
              className="text-[10px] font-mono font-bold text-slate-700 hover:text-black underline cursor-pointer"
            >
              Lihat Versi 1 Halaman
            </button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full h-3 bg-white rounded-full border-2 border-black overflow-hidden flex shadow-[1px_1px_0px_#000]">
          <div
            className="h-full bg-[#ccff00] border-r-2 border-black transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Mini Step Pills (Clickable to jump) */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isPassed = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                type="button"
                key={label}
                onClick={() => setCurrentStep(stepNum)}
                className={`py-1 px-0.5 rounded-lg text-[9px] font-mono font-black uppercase border text-center transition-all truncate cursor-pointer ${
                  isCurrent
                    ? "bg-black text-[#ccff00] border-black shadow-[1px_1px_0px_#000]"
                    : isPassed
                    ? "bg-[#ccff00] text-black border-black"
                    : "bg-white text-black/50 border-black/20 hover:border-black"
                }`}
                title={`Loncat ke ${label}`}
              >
                {stepNum}. {label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="min-h-[340px] flex flex-col justify-between">
        {/* ============================================================== */}
        {/* LANGKAH 1: CABOR & FORMAT PERTANDINGAN */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Pilih Cabang Olahraga ({props.sports.length} Cabor)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-black/60 hidden sm:inline">
                    • Geser untuk memilih
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollSportCarousel("left")}
                    className="h-8 w-8 rounded-lg bg-white hover:bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    title="Geser ke Kiri"
                    aria-label="Geser ke Kiri"
                  >
                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSportCarousel("right")}
                    className="h-8 w-8 rounded-lg bg-white hover:bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    title="Geser ke Kanan"
                    aria-label="Geser ke Kanan"
                  >
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Slider Track */}
              <div
                ref={sportCarouselRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 px-1 -mx-1 select-none no-scrollbar touch-pan-x"
              >
                {props.sports.map((s, idx) => {
                  const isSelected = props.selectedSport === s.type;
                  const meta = props.sportMeta[s.type] || {
                    tagline: "Raket & Bola",
                    equipmentBadge: s.emoji,
                    bgSelected: "bg-[#ccff00] text-black",
                    colorAccent: "#ccff00",
                    courtName: "Lapangan",
                  };

                  return (
                    <div
                      key={s.type}
                      onClick={() => props.onSelectSport(s.type, idx)}
                      className={`w-[170px] sm:w-[190px] shrink-0 snap-start p-3.5 sm:p-4 rounded-2xl border-3 border-black transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? `${meta.bgSelected} shadow-[5px_5px_0px_#000] translate-x-[-1px] translate-y-[-1px]`
                          : "bg-[#faf8f2] text-black hover:bg-white hover:shadow-[3px_3px_0px_#000]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
                              isSelected ? "bg-black text-white" : "bg-white text-black"
                            }`}
                          >
                            {meta.equipmentBadge}
                          </span>
                        </div>

                        <div className="flex flex-col items-center text-center my-2">
                          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-150 inline-block drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
                            {s.emoji}
                          </span>
                          <span className="text-sm sm:text-base font-black uppercase tracking-wider mt-2">
                            {s.displayName}
                          </span>
                          <span
                            className={`text-[10px] font-bold mt-1 line-clamp-1 ${
                              isSelected ? "opacity-90" : "text-slate-600"
                            }`}
                          >
                            {meta.tagline}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t-2 border-black/20 flex items-center justify-center">
                        <span
                          className={`w-full py-1 text-center text-[10px] font-mono font-black uppercase rounded-lg border transition-all ${
                            isSelected
                              ? "bg-black text-white border-black shadow-[1px_1px_0px_#000]"
                              : "bg-white/80 text-black border-black/40 group-hover:border-black group-hover:bg-white"
                          }`}
                        >
                          {isSelected ? "Sedang Dipilih" : "Pilih Cabor"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Format Pertandingan */}
            <div className="p-4 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[3px_3px_0px_#000] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Format Pertandingan
                  </label>
                  <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                    Tentukan jumlah pemain per lapangan
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 border-black bg-[#ffde00] text-black shadow-[1px_1px_0px_#000]">
                  {props.matchType === "doubles" ? "👥 4 Pemain / Lapangan" : "👤 2 Pemain / Lapangan (1v1)"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => props.setMatchType("doubles")}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-3 border-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    props.matchType === "doubles"
                      ? "bg-[#ccff00] text-black shadow-[4px_4px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-white text-black hover:bg-slate-50 hover:shadow-[3px_3px_0px_#000]"
                  }`}
                >
                  <Users className="h-4 w-4 stroke-[2.5]" />
                  <span>Ganda (2 vs 2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => props.setMatchType("singles")}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-3 border-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    props.matchType === "singles"
                      ? "bg-[#ccff00] text-black shadow-[4px_4px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-white text-black hover:bg-slate-50 hover:shadow-[3px_3px_0px_#000]"
                  }`}
                >
                  <User className="h-4 w-4 stroke-[2.5]" />
                  <span>Tunggal (1 vs 1)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 2: LAPANGAN & WAKTU SEWA */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Jumlah Lapangan */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2.5">
                Jumlah Lapangan / Meja Disewa
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => props.setCourtCount(num)}
                    className={`h-12 rounded-xl text-base font-black border-3 border-black transition-all cursor-pointer flex items-center justify-center ${
                      props.courtCount === num
                        ? "bg-[#ccff00] text-black shadow-[4px_4px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000]"
                    }`}
                  >
                    #{num} Lapangan
                  </button>
                ))}
              </div>
            </div>

            {/* Waktu & Durasi Sewa */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <Clock className="h-4 w-4 stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Jam Mulai &amp; Durasi Sewa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jam Mulai */}
                <div className="flex flex-col justify-between">
                  <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                    Jam Mulai Main
                  </label>

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
                      value={props.startTime}
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          (e.currentTarget as any).showPicker();
                        } catch {}
                      }}
                      onChange={(e) => props.setStartTime(e.target.value)}
                      className="bg-transparent border-none text-xl font-mono font-black text-black focus:outline-none cursor-pointer w-full"
                    />
                    <Clock className="h-4 w-4 text-black/50 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => props.adjustStartTime(-60)}
                      className="py-1.5 px-2 rounded-lg bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs hover:bg-[#ccff00] cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      -1 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => props.adjustStartTime(60)}
                      className="py-1.5 px-2 rounded-lg bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs hover:bg-[#ccff00] cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      +1 Jam
                    </button>
                  </div>
                </div>

                {/* Durasi Sewa */}
                <div className="flex flex-col justify-between">
                  <label className="block text-[11px] font-black uppercase text-black/70 mb-1.5">
                    Total Durasi Sewa
                  </label>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3].map((hrs) => (
                      <button
                        type="button"
                        key={hrs}
                        onClick={() => {
                          props.setIsCustomDuration(false);
                          props.setDurationHours(hrs);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                          !props.isCustomDuration && props.durationHours === hrs
                            ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-black hover:bg-slate-50"
                        }`}
                      >
                        {hrs} Jam
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => props.setIsCustomDuration(true)}
                      className={`py-2 px-1 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                        props.isCustomDuration
                          ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                          : "bg-white text-black hover:bg-slate-50"
                      }`}
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Custom</span>
                    </button>
                  </div>

                  {props.isCustomDuration && (
                    <div className="mt-2 p-2 rounded-xl bg-white border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
                      <span className="text-[11px] font-black uppercase text-black/60 pl-1">Durasi:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={props.customDurationInput}
                          onChange={(e) => props.setCustomDurationInput(e.target.value)}
                          className="w-16 text-center font-mono font-black text-sm border-2 border-black rounded-lg p-1 bg-[#faf8f2]"
                        />
                        <span className="text-xs font-mono font-black pr-1">Jam</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-black/30">
                    <span>Estimasi Match:</span>
                    <span className="font-mono font-black text-black">
                      ~{props.estimatedRounds} Ronde ({props.baseMatchesCount} Match)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 3: SISTEM ROTASI MATCHMAKING */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Pilih Algoritma Rotasi Lapangan
                </label>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Tersedia {Object.keys(ALGORITHM_REGISTRY).length} formula rotasi otomatis
                </p>
              </div>

              {/* Switch Mode Tampilan: Carousel vs Grid */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAlgoViewMode("carousel")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
                    algoViewMode === "carousel"
                      ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                      : "bg-white text-black hover:bg-slate-50"
                  }`}
                  title="Tampilan Carousel Geser (Lebih Hemat Ruang)"
                >
                  <span>🎠 Geser / Slider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlgoViewMode("grid")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
                    algoViewMode === "grid"
                      ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
                      : "bg-white text-black hover:bg-slate-50"
                  }`}
                  title="Tampilan Grid (Lihat Semua Pilihan)"
                >
                  <span>⊞ Grid Semua</span>
                </button>
              </div>
            </div>

            {/* Banner Trigger Modal Penjelasan Algoritma Lengkap */}
            <div
              onClick={props.onOpenAlgoExplainer}
              className="p-2.5 sm:p-3 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#ccff00]/20 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#ccff00] text-black border-2 border-black shadow-[1px_1px_0px_#000] flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform text-sm">
                  <BookOpen className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-tight text-black truncate">
                      Pelajari Cara Kerja &amp; Perbandingan {Object.keys(ALGORITHM_REGISTRY).length} Algoritma
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase bg-black text-[#ccff00] px-1.5 py-0.2 rounded hidden sm:inline">
                      PANDUAN
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-black/70 truncate">
                    Lihat formula antrean, penyeimbang skill ganda, dan rekomendasi kasus GOR
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-black text-black bg-[#faf8f2] border-2 border-black px-2.5 py-1 rounded-lg shadow-[1px_1px_0px_#000] shrink-0 group-hover:bg-[#ccff00] transition-colors">
                Detail →
              </span>
            </div>

            {/* TAMPILAN 1: MODE CAROUSEL / SLIDER */}
            {algoViewMode === "carousel" ? (
              <div className="relative flex flex-col gap-2">
                <div
                  ref={algoCarouselRef}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 pt-1 px-1 -mx-1 no-scrollbar select-none"
                >
                  {Object.values(ALGORITHM_REGISTRY).map((algo, idx) => {
                    const isSelected = props.selectedAlgorithm === algo.id;
                    return (
                      <div
                        key={algo.id}
                        onClick={() => props.setSelectedAlgorithm(algo.id)}
                        className={`w-[260px] sm:w-[290px] shrink-0 snap-start p-3.5 rounded-2xl border-3 border-black transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#ccff00]/25 shadow-[4px_4px_0px_#000] ring-2 ring-black -translate-y-0.5"
                            : "bg-white hover:bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="font-black text-sm text-black flex items-center gap-1.5 truncate">
                              <span>{algo.icon}</span>
                              <span className="truncate">{algo.shortName}</span>
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-black shrink-0 ${algo.badgeColor}`}>
                              {algo.badge}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-black/80 leading-relaxed mb-2 line-clamp-3">
                            {algo.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-black/15 flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-black/60 truncate mr-2">
                            🎯 {algo.bestFor.replace("Mabar ", "")}
                          </span>
                          {isSelected ? (
                            <span className="text-[9px] font-mono font-black text-black bg-[#ccff00] px-1.5 py-0.5 rounded border border-black shrink-0 shadow-[1px_1px_0px_#000]">
                              ✓ DIPILIH
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-slate-500 hover:text-black shrink-0">
                              Pilih →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dots & Nav Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {Object.values(ALGORITHM_REGISTRY).map((algo, idx) => (
                      <button
                        key={algo.id}
                        type="button"
                        onClick={() => {
                          props.setSelectedAlgorithm(algo.id);
                          if (algoCarouselRef.current) {
                            const card = algoCarouselRef.current.children[idx] as HTMLElement;
                            card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                          }
                        }}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          props.selectedAlgorithm === algo.id
                            ? "w-6 bg-black"
                            : "w-2 bg-black/25 hover:bg-black/60"
                        }`}
                        title={algo.shortName}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 mr-1 hidden sm:inline">
                      Geser kartu
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollAlgoCarousel("left")}
                      className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center font-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-sm"
                      title="Geser ke Kiri"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollAlgoCarousel("right")}
                      className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black hover:bg-[#b8e600] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-sm"
                      title="Geser ke Kanan"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAMPILAN 2: MODE GRID SEMUA (NO MAX-HEIGHT RESTRICTION) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(ALGORITHM_REGISTRY).map((algo) => {
                  const isSelected = props.selectedAlgorithm === algo.id;
                  return (
                    <div
                      key={algo.id}
                      onClick={() => props.setSelectedAlgorithm(algo.id)}
                      className={`p-3.5 rounded-2xl border-3 border-black transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#ccff00]/25 shadow-[4px_4px_0px_#000] ring-2 ring-black -translate-y-0.5"
                          : "bg-white hover:bg-[#faf8f2] shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-black text-sm text-black flex items-center gap-1.5">
                            <span>{algo.icon}</span>
                            <span>{algo.shortName}</span>
                          </span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-black shrink-0 ${algo.badgeColor}`}>
                            {algo.badge}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-black/80 leading-relaxed mb-2">
                          {algo.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-black/15 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-slate-600 truncate mr-2">
                          🎯 {algo.bestFor.replace("Mabar ", "")}
                        </span>
                        {isSelected ? (
                          <span className="text-[9px] font-mono font-black text-black bg-[#ccff00] px-1.5 py-0.5 rounded border border-black shrink-0 shadow-[1px_1px_0px_#000]">
                            ✓ DIPILIH
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 hover:text-black shrink-0">
                            Pilih →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Callout Ringkas Algoritma yang Sedang Dipilih */}
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{activeAlgo.icon}</span>
                <div className="min-w-0">
                  <span className="font-black text-black block truncate">
                    {activeAlgo.name} ({activeAlgo.badge})
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    {activeAlgo.bestFor}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#ccff00] text-black border border-black shrink-0">
                Formula Aktif
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 4: DAFTAR PEMAIN (OPSIONAL) */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-black">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Daftar Pemain Mabar (Opsional)
                </label>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Bisa diisi sekarang atau nanti saat mabar dimulai di dashboard
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_#000]">
                  {props.initialPlayers.length} Pemain
                </span>
                <button
                  type="button"
                  onClick={props.onOpenWaModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#20ba5a] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Paste Chat WA</span>
                </button>
                <button
                  type="button"
                  onClick={props.onLoadDemoPlayers}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  title="Muat 4 Pemain Contoh"
                >
                  <span>⚡ 4 Contoh</span>
                </button>
              </div>
            </div>

            {/* Form Input Cepat 1 Pemain */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
              <input
                type="text"
                placeholder="Ketik Nama Pemain..."
                value={props.quickPlayerName}
                onChange={(e) => props.setQuickPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    props.onAddQuickPlayer();
                  }
                }}
                className="flex-1 min-w-[140px] rounded-lg bg-[#faf8f2] border-2 border-black px-3 py-1.5 text-xs font-bold text-black focus:outline-none"
              />

              <div className="flex items-center rounded-lg border-2 border-black overflow-hidden font-mono text-xs font-black">
                <button
                  type="button"
                  onClick={() => props.setQuickGender("M")}
                  className={`px-2 py-1.5 ${
                    props.quickGender === "M"
                      ? "bg-blue-300 text-blue-950 shadow-[1px_1px_0px_#000]"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  👦 M
                </button>
                <button
                  type="button"
                  onClick={() => props.setQuickGender("F")}
                  className={`px-2 py-1.5 ${
                    props.quickGender === "F"
                      ? "bg-pink-200 text-pink-950 shadow-[1px_1px_0px_#000]"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  👧 W
                </button>
              </div>

              <select
                value={props.quickSkill}
                onChange={(e) => props.setQuickSkill(parseInt(e.target.value, 10) as SkillLevel)}
                className="rounded-lg bg-[#faf8f2] border-2 border-black px-2.5 py-1.5 text-xs font-black text-black cursor-pointer"
              >
                <option value={1}>Newbie</option>
                <option value={2}>Beginner</option>
                <option value={3}>Intermediate</option>
                <option value={4}>Advanced</option>
                <option value={5}>Pro</option>
              </select>

              <button
                type="button"
                onClick={props.onAddQuickPlayer}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-black text-[#ccff00] text-xs font-black uppercase tracking-wider hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Chips Pemain */}
            {props.initialPlayers.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-white border-2 border-dashed border-black/40 text-xs font-bold text-slate-600">
                Belum ada pemain. Kamu bisa langsung lanjut ke langkah berikutnya dan mengisi pemain di dashboard nanti.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1 bg-white rounded-xl border-2 border-black p-2 shadow-[2px_2px_0px_#000]">
                {props.initialPlayers.map((player) => {
                  const tier = getTierLabel(player.publicTier);
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-2.5 py-1 text-xs shadow-[1.5px_1.5px_0px_#000] ${
                        player.isArrived === false ? "bg-amber-50/80 border-dashed border-amber-500" : "bg-[#faf8f2]"
                      }`}
                    >
                      <span className="font-extrabold text-black">{player.name}</span>

                      <button
                        type="button"
                        onClick={() => props.onToggleGender(player.id)}
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black cursor-pointer ${
                          player.gender === "M" ? "bg-blue-100 text-blue-950" : "bg-pink-100 text-pink-950"
                        }`}
                        title="Ubah Gender"
                      >
                        {player.gender === "M" ? "👦 M" : "👧 W"}
                      </button>

                      <button
                        type="button"
                        onClick={() => props.onCycleSkill(player.id)}
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black cursor-pointer ${tier.badgeColor}`}
                        title="Ubah Tier Level"
                      >
                        {tier.label.replace("Tier ", "")} ▾
                      </button>

                      <button
                        type="button"
                        onClick={() => props.onToggleArrival(player.id)}
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black cursor-pointer ${
                          player.isArrived === false ? "bg-[#ffde00] text-black" : "bg-[#ccff00] text-black"
                        }`}
                        title="Status Hadir/OTW"
                      >
                        {player.isArrived === false ? "⏳ OTW" : "✅ Hadir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => props.onRemovePlayer(player.id)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                        title="Hapus Pemain"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 5: NAMA SESI & KONFIRMASI MULAI */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Input Nama Sesi */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Nama Sesi / Komunitas Mabar
              </label>
              <input
                type="text"
                value={props.sessionTitle}
                onChange={(e) => props.setSessionTitle(e.target.value)}
                placeholder={`Contoh: Mabar ${props.selectedSport.toUpperCase()} PB Rajawali`}
                className="w-full rounded-xl bg-white border-3 border-black px-4 py-3 text-sm font-bold text-black placeholder-slate-400 focus:outline-none shadow-[3px_3px_0px_#000]"
              />
            </div>

            {/* Kartu Ringkasan Konfigurasi Mabar */}
            <div className="p-4 rounded-2xl bg-[#faf8f2] border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col gap-3">
              <span className="font-mono text-xs font-black uppercase bg-[#ccff00] text-black px-2 py-0.5 rounded border border-black self-start">
                Ringkasan Sesi Mabar
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-black uppercase text-black/50 block">Cabang Olahraga</span>
                  <span className="font-black text-sm text-black">
                    {props.sports.find((s) => s.type === props.selectedSport)?.emoji} {props.sports.find((s) => s.type === props.selectedSport)?.displayName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5">
                    {props.matchType === "doubles" ? "Ganda (2v2)" : "Tunggal (1v1)"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-black uppercase text-black/50 block">Lapangan &amp; Waktu</span>
                  <span className="font-black text-sm text-black">
                    #{props.courtCount} Lapangan
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5">
                    {props.startTime} ({props.effectiveDurationHours} Jam)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-black uppercase text-black/50 block">Algoritma Match</span>
                  <span className="font-black text-sm text-black truncate block">
                    {activeAlgo.icon} {activeAlgo.shortName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5 truncate">
                    {activeAlgo.badge}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-black uppercase text-black/50 block">Peserta Mabar</span>
                  <span className="font-black text-sm text-black">
                    {props.initialPlayers.length} Pemain
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5">
                    {props.initialPlayers.length >= (props.matchType === "singles" ? 2 : 4)
                      ? "Siap Langsung Rotasi"
                      : "Bisa Ditambah Nanti"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Accordion Opsional: Lokasi GOR, Patungan Biaya, dan Izin Skor Penonton */}
            <div className="flex flex-col gap-3">
              {/* DROPDOWN 1: Hari, Tanggal & Lokasi GOR (Opsional) */}
              <div className="rounded-2xl border-2 sm:border-3 border-black bg-[#faf8f2] shadow-[3px_3px_0px_#000] overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => props.setIsLocationDropdownOpen(!props.isLocationDropdownOpen)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-yellow-50/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                      <Calendar className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-black truncate">
                          Hari, Tanggal &amp; Lokasi GOR
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-black/40 shrink-0">
                          Opsional
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate mt-0.5">
                        {props.courtLocation || props.sessionDate
                          ? `📍 ${props.courtLocation || "GOR"} • 📅 ${props.sessionDate ? formatIndonesianDate(props.sessionDate) : "Hari Ini"}`
                          : "Atur jadwal kalender & alamat venue mabar"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-black text-black hidden sm:inline">
                      {props.isLocationDropdownOpen ? "Tutup" : "Buka"}
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                      <ChevronDown
                        className={`h-4 w-4 text-black transition-transform duration-200 ${
                          props.isLocationDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {props.isLocationDropdownOpen && (
                  <div className="p-4 pt-3 border-t-2 border-black bg-white flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Input Tanggal */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-black uppercase text-black/70 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-emerald-600" />
                          <span>Tanggal Sesi Mabar:</span>
                        </label>
                        {props.sessionDate && (
                          <span className="text-xs font-mono font-black text-black bg-[#ccff00] px-2.5 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
                            📅 {formatIndonesianDate(props.sessionDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          value={props.sessionDate}
                          onChange={(e) => props.setSessionDate(e.target.value)}
                          className="flex-1 min-w-[180px] rounded-xl bg-[#faf8f2] border-2 border-black px-3.5 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_#000] font-mono cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              const yyyy = now.getFullYear();
                              const mm = String(now.getMonth() + 1).padStart(2, "0");
                              const dd = String(now.getDate()).padStart(2, "0");
                              props.setSessionDate(`${yyyy}-${mm}-${dd}`);
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
                              props.setSessionDate(`${yyyy}-${mm}-${dd}`);
                            }}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                          >
                            Besok
                          </button>
                          {props.sessionDate && (
                            <button
                              type="button"
                              onClick={() => props.setSessionDate("")}
                              className="px-3 py-2 rounded-xl bg-rose-200 hover:bg-rose-300 border-2 border-black text-xs font-black text-rose-900 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                              title="Hapus tanggal"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alamat Lapangan & Link Maps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/10">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-rose-600" />
                          <span>Nama / Alamat GOR Lapangan</span>
                        </label>
                        <input
                          type="text"
                          value={props.courtLocation}
                          onChange={(e) => props.setCourtLocation(e.target.value)}
                          placeholder="Contoh: GOR Tomang Barat, Lapangan 1-2..."
                          className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_#000]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                          <span>Link Google Maps Lapangan</span>
                        </label>
                        <input
                          type="url"
                          value={props.googleMapsUrl}
                          onChange={(e) => props.setGoogleMapsUrl(e.target.value)}
                          placeholder="Contoh: https://maps.app.goo.gl/..."
                          className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_#000]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: Patungan Biaya & Split Bill Shuttlecock/Bola (Opsional) */}
              <div className="rounded-2xl border-2 sm:border-3 border-black bg-[#faf8f2] shadow-[3px_3px_0px_#000] overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => props.setIsBillingDropdownOpen(!props.isBillingDropdownOpen)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-yellow-50/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                      <Flame className="h-4 w-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-black truncate">
                          Patungan Biaya &amp; Hitung Cock/Bola
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-black/40 shrink-0">
                          Opsional
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate mt-0.5">
                        {props.billingModelChoice === "track_equipment"
                          ? `🏸 Hitung Cock (Rp ${parseInt(props.costPerUnitInput || "12000").toLocaleString("id-ID")}/butir) + Sewa Lapangan`
                          : props.billingModelChoice === "fixed_per_person"
                          ? `🎯 Fixed Price (Rp ${parseInt(props.fixedPriceInput || "40000").toLocaleString("id-ID")}/orang)`
                          : "✨ Tanpa Biaya (Sesi Gratis / Santai)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-black text-black hidden sm:inline">
                      {props.isBillingDropdownOpen ? "Tutup" : "Buka"}
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                      <ChevronDown
                        className={`h-4 w-4 text-black transition-transform duration-200 ${
                          props.isBillingDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {props.isBillingDropdownOpen && (
                  <div className="p-4 pt-3 border-t-2 border-black bg-white flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
                        Pilih Skema Patungan / Biaya Mabar:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Opsi 1: Fixed Price */}
                        <button
                          type="button"
                          onClick={() => props.setBillingModelChoice("fixed_per_person")}
                          className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                            props.billingModelChoice === "fixed_per_person"
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
                          onClick={() => props.setBillingModelChoice("track_equipment")}
                          className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                            props.billingModelChoice === "track_equipment"
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
                          onClick={() => props.setBillingModelChoice("none")}
                          className={`flex flex-col p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                            props.billingModelChoice === "none"
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
                    {props.billingModelChoice === "fixed_per_person" && (
                      <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-3 animate-in fade-in">
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
                              value={props.fixedPriceInput}
                              onChange={(e) => props.setFixedPriceInput(e.target.value)}
                              className="w-32 rounded-lg bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none"
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
                              onClick={() => props.setFixedPriceInput(val.toString())}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                                props.fixedPriceInput === val.toString()
                                  ? "bg-black text-[#ccff00] border-black"
                                  : "bg-white text-black border-black/40 hover:border-black"
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
                              value={props.bankNameInput}
                              onChange={(e) => props.setBankNameInput(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                            />
                            <input
                              type="text"
                              placeholder="No. Rekening / No. HP"
                              value={props.accountNumberInput}
                              onChange={(e) => props.setAccountNumberInput(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-bold bg-white"
                            />
                            <input
                              type="text"
                              placeholder="Atas Nama Rekening"
                              value={props.accountHolderInput}
                              onChange={(e) => props.setAccountHolderInput(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-form Opsi 2: Itung Cock + Split Bill */}
                    {props.billingModelChoice === "track_equipment" && (
                      <div className="flex flex-col gap-3 animate-in fade-in">
                        {/* Pilihan Model: Hitung Per Butir vs Per Slop */}
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
                            Pilih Cara Hitung Biaya Shuttlecock/Bola:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => props.setEquipmentPricingModel("per_unit")}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                                props.equipmentPricingModel === "per_unit"
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
                              onClick={() => props.setEquipmentPricingModel("per_slop")}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                                props.equipmentPricingModel === "per_slop"
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
                        {props.equipmentPricingModel === "per_unit" ? (
                          <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <label className="text-[11px] font-black uppercase text-black block">
                                  Harga Custom Per Butir Cock/Bola (Rp):
                                </label>
                                <span className="text-[10px] text-slate-600 font-bold">
                                  Contoh: Rp 12.000 / kok (Setara Rp{" "}
                                  {(
                                    (parseInt(props.costPerUnitInput, 10) || 12000) * 12
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
                                  value={props.costPerUnitInput}
                                  onChange={(e) => props.setCostPerUnitInput(e.target.value)}
                                  className="w-32 rounded-lg bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none"
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
                                  onClick={() => props.setCostPerUnitInput(val.toString())}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                                    props.costPerUnitInput === val.toString()
                                      ? "bg-black text-[#ccff00] border-black"
                                      : "bg-white text-black border-black/40 hover:border-black"
                                  }`}
                                >
                                  Rp {val.toLocaleString("id-ID")}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
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
                                    value={props.costPerSlopInput}
                                    onChange={(e) => props.setCostPerSlopInput(e.target.value)}
                                    className="w-full rounded-lg bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none"
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
                                    value={props.unitsPerSlopInput}
                                    onChange={(e) => props.setUnitsPerSlopInput(e.target.value)}
                                    className="w-20 text-center rounded-lg bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none"
                                  />
                                  <span className="text-xs font-mono font-bold text-slate-700">
                                    Butir (~Rp{" "}
                                    {Math.round(
                                      (parseInt(props.costPerSlopInput, 10) || 140000) /
                                        (parseInt(props.unitsPerSlopInput, 10) || 12)
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
                                  onClick={() => props.setCostPerSlopInput(item.val.toString())}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                                    props.costPerSlopInput === item.val.toString()
                                      ? "bg-black text-[#ccff00] border-black"
                                      : "bg-white text-black border-black/40 hover:border-black"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Estimasi Sewa Lapangan & Info Rekening Transfer */}
                        <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-2.5">
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
                                value={props.courtRentalFeeInput}
                                onChange={(e) => props.setCourtRentalFeeInput(e.target.value)}
                                className="w-36 rounded-lg bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black focus:outline-none"
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
                                value={props.bankNameInput}
                                onChange={(e) => props.setBankNameInput(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                              />
                              <input
                                type="text"
                                placeholder="No. Rekening / No. HP"
                                value={props.accountNumberInput}
                                onChange={(e) => props.setAccountNumberInput(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-bold bg-white"
                              />
                              <input
                                type="text"
                                placeholder="Atas Nama Rekening"
                                value={props.accountHolderInput}
                                onChange={(e) => props.setAccountHolderInput(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-form Opsi 3: Tanpa Biaya */}
                    {props.billingModelChoice === "none" && (
                      <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-dashed border-black/50 text-xs font-bold text-slate-700 flex items-center gap-2.5 animate-in fade-in">
                        <span className="text-base">✨</span>
                        <span>
                          Mode santai: Dashboard Host dan Papan Penonton akan tampil bersih tanpa tombol hitung bola maupun tagihan biaya.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 3: Izin Skor Penonton & Akses Tambahan (Opsional) */}
              <div className="rounded-2xl border-2 sm:border-3 border-black bg-[#faf8f2] shadow-[3px_3px_0px_#000] overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => props.setIsAdvancedDropdownOpen(!props.isAdvancedDropdownOpen)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-yellow-50/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-black truncate">
                          Izin Skor Penonton &amp; Akses Tambahan
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-black/40 shrink-0">
                          Opsional
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate mt-0.5">
                        {props.allowSpectatorScoreUpdate
                          ? "✅ Penonton diizinkan bantu input skor dari HP"
                          : "🔒 Mode Baca Saja (Hanya Host yang bisa update skor)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-black text-black hidden sm:inline">
                      {props.isAdvancedDropdownOpen ? "Tutup" : "Buka"}
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                      <ChevronDown
                        className={`h-4 w-4 text-black transition-transform duration-200 ${
                          props.isAdvancedDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {props.isAdvancedDropdownOpen && (
                  <div className="p-4 pt-3 border-t-2 border-black bg-white flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between p-3 rounded-xl border-2 border-black bg-[#faf8f2]">
                      <div className="pr-3">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-black text-xs uppercase text-black">
                            📱 Izinkan Penonton/Wasit Bantu Input Skor (Scan QR)
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 leading-tight">
                          Bila dicentang, penonton yang scan QR code bisa bantu ketik skor &amp; klik tim pemenang dari HP mereka. Jika tidak, hanya bisa melihat jadwal (read-only).
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={props.allowSpectatorScoreUpdate}
                          onChange={(e) => props.setAllowSpectatorScoreUpdate(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-2 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ccff00] border-2 border-black shadow-[1px_1px_0px_#000]"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS & NAVIGATION BUTTONS */}
      <div className="pt-4 border-t-3 border-black flex items-center justify-between gap-3">
        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-1.5 py-3 px-4 rounded-xl border-3 border-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
            currentStep === 1
              ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-white text-black hover:bg-slate-100 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          }`}
        >
          <ChevronLeft className="h-4 w-4 stroke-[3]" />
          <span>Kembali</span>
        </button>

        {/* Tombol Kanan (Lanjut atau Submit) */}
        <div className="flex items-center gap-2">
          {currentStep === 4 && props.initialPlayers.length === 0 && (
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-3.5 rounded-xl border-2 border-black bg-[#faf8f2] hover:bg-white text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Lewati Dulu
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 py-3 px-5 sm:px-6 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black border-3 border-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <span>Lanjut: {STEP_LABELS[currentStep]}</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={props.onSubmit}
              className="flex items-center gap-2 py-3 px-5 sm:px-8 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black border-3 border-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[5px_5px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[3]" />
              <span>Mulai Sesi Permainan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
