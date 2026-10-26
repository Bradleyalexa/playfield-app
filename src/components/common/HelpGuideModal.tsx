"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  X,
  BookOpen,
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Sliders,
  ClipboardCheck,
  Cpu,
  PlayCircle,
  Tv,
  Share2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  CARA_PAKAI_STEPS,
  FAQ_CATEGORIES,
  FAQ_ITEMS,
} from "../../data/app-guide-data";

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "cara-pakai" | "faq";
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sliders,
  ClipboardCheck,
  Cpu,
  PlayCircle,
  Tv,
  Share2,
};

export function HelpGuideModal({
  isOpen,
  onClose,
  defaultTab = "cara-pakai",
}: HelpGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"cara-pakai" | "faq">(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Filtered FAQ items
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        (item.highlight && item.highlight.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b-[3px] border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black shrink-0">
              {activeTab === "cara-pakai" ? (
                <BookOpen className="h-6 w-6 stroke-[2.5]" />
              ) : (
                <HelpCircle className="h-6 w-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black text-[#ccff00]">
                  PANDUAN & BANTUAN
                </span>
                <span className="text-xs font-bold text-black/60 hidden sm:inline">
                  Playfield Mabar Pocket Assistant
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight">
                {activeTab === "cara-pakai"
                  ? "Cara Pakai Playfield App"
                  : "Frequently Asked Questions (FAQ)"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-xl border-[3px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
            aria-label="Tutup modal"
          >
            <X className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab Switcher: Cara Pakai vs FAQ */}
        <div className="flex items-center gap-2 p-3 bg-white border-b-2 border-black shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("cara-pakai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "cara-pakai"
                ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                : "bg-[#faf8f2] text-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
            }`}
          >
            <BookOpen className="h-4 w-4 stroke-[2.5]" />
            <span>📖 Cara Pakai App (6 Langkah)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faq"
                ? "bg-[#00e5ff] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                : "bg-[#faf8f2] text-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
            }`}
          >
            <HelpCircle className="h-4 w-4 stroke-[2.5]" />
            <span>❓ FAQ & Tanya Jawab ({FAQ_ITEMS.length})</span>
          </button>

          <div className="ml-auto hidden md:flex items-center gap-2">
            <Link
              href={activeTab === "cara-pakai" ? "/cara-pakai" : "/faq"}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-[#ccff00] text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all border border-black"
            >
              <span>Buka Halaman Penuh</span>
              <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "cara-pakai" ? (
            /* TAB 1: CARA PAKAI APP */
            <div className="space-y-4">
              {/* Intro Box */}
              <div className="p-4 rounded-2xl bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-black shrink-0">
                    <Sparkles className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase text-black">
                      Panduan Kilat Host Mabar Bebas Drama
                    </h3>
                    <p className="text-xs font-bold text-slate-700">
                      Ikuti 6 langkah mudah ini untuk mengurus rotasi lapangan, live scoring, dan split bill otomatis.
                    </p>
                  </div>
                </div>

                <Link
                  href="/cara-pakai"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ccff00] border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 cursor-pointer"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                </Link>
              </div>

              {/* Step Cards List */}
              <div className="grid grid-cols-1 gap-4">
                {CARA_PAKAI_STEPS.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || BookOpen;
                  return (
                    <div
                      key={item.step}
                      className="rounded-2xl border-[3px] border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-black text-[#ccff00] flex items-center justify-center font-mono font-black text-sm shrink-0 border border-black">
                            #{item.step}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded border border-black font-mono tracking-wider ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <div className="h-7 w-7 rounded-lg bg-slate-100 border border-black/30 flex items-center justify-center text-slate-700">
                          <Icon className="h-4 w-4 stroke-[2.5]" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-black text-black uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs font-bold text-slate-600 mb-2">
                          {item.subtitle}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-1.5 pt-1">
                        {item.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-start gap-2 text-xs font-bold text-slate-800 bg-[#faf8f2] p-2.5 rounded-xl border border-black/20"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[3] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Quick Pro-Tip Box */}
                      <div className="p-2.5 rounded-xl bg-[#ccff00]/25 border border-black/40 text-xs font-bold text-black">
                        {item.tips}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: FAQ TANYA JAWAB */
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 stroke-[2.5]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pertanyaan... (misal: WhatsApp, level, patungan, OTW, skor)"
                    className="w-full rounded-xl bg-white border-2 border-black pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-black placeholder:text-slate-400 focus:outline-none shadow-[2px_2px_0px_#000]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-black cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {FAQ_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? "bg-black text-[#ccff00] shadow-[2px_2px_0px_#000]"
                          : "bg-white text-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion List */}
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-black/40">
                  <HelpCircle className="h-10 w-10 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-black uppercase text-black">
                    Tidak ditemukan jawaban untuk &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    Coba kata kunci lain atau pilih kategori &ldquo;Semua Pertanyaan&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border-2 sm:border-3 border-black bg-white transition-all overflow-hidden ${
                          isExpanded
                            ? "shadow-[4px_4px_0px_#000]"
                            : "shadow-[2px_2px_0px_#000] hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFaqId(isExpanded ? null : faq.id)
                          }
                          className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex flex-col gap-1 pr-1">
                            <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">
                              {faq.categoryLabel}
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-black leading-snug">
                              {faq.question}
                            </h4>
                          </div>
                          <div
                            className={`h-7 w-7 rounded-lg border-2 border-black bg-[#faf8f2] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 bg-[#ccff00]" : ""
                            }`}
                          >
                            <ChevronDown className="h-4 w-4 stroke-[3]" />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-black/10">
                            {faq.highlight && (
                              <div className="inline-block mt-3 mb-2 px-2.5 py-1 rounded-md bg-[#ccff00] text-black font-mono font-black text-xs border border-black shadow-[1px_1px_0px_#000]">
                                ⚡ {faq.highlight}
                              </div>
                            )}
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line mt-1">
                              {faq.answer}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-black/10">
                              {faq.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-white border-t-[3px] border-black flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href="/cara-pakai"
              onClick={onClose}
              className="font-black text-black underline underline-offset-2 hover:text-[#ff5500]"
            >
              Halaman Cara Pakai ↗
            </Link>
            <span className="text-slate-400">•</span>
            <Link
              href="/faq"
              onClick={onClose}
              className="font-black text-black underline underline-offset-2 hover:text-[#ff5500]"
            >
              Halaman FAQ ↗
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
