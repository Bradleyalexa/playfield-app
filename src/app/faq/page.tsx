"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "../../components/common/Navbar";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
} from "../../data/app-guide-data";
import {
  HelpCircle,
  Search,
  ChevronDown,
  BookOpen,
  Play,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

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

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-3.5 sm:px-6 py-8 sm:py-12 pb-28 sm:pb-16 flex flex-col gap-8 sm:gap-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#00e5ff] border-2 border-black px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            <HelpCircle className="h-4 w-4 stroke-[2.5]" />
            <span>PUSAT BANTUAN & TANYA JAWAB</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-[1.1] uppercase">
            Frequently Asked{" "}
            <span className="bg-[#ccff00] px-2.5 py-0.5 rounded border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] inline-block mt-1">
              Questions (FAQ)
            </span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-800 max-w-2xl leading-relaxed">
            Semua hal yang perlu kamu ketahui tentang cara kerja matchmaking, hitungan patungan, status OTW pemain, hingga live score di Playfield.
          </p>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-5 py-3 text-xs sm:text-sm font-black text-black uppercase tracking-wider border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-black stroke-[2.5]" />
              <span>Coba Demo 1-Klik</span>
            </Link>

            <Link
              href="/cara-pakai"
              className="flex items-center gap-2 rounded-xl border-2 sm:border-3 border-black bg-white px-5 py-3 text-xs sm:text-sm font-black text-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 stroke-[2.5]" />
              <span>Panduan 6 Langkah Cara Pakai</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="rounded-3xl border-3 sm:border-4 border-black bg-white p-5 sm:p-7 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan... (misal: WhatsApp, level skill, split bill, OTW, skor)"
              className="w-full rounded-2xl bg-[#faf8f2] border-2 border-black pl-12 pr-4 py-3.5 text-sm sm:text-base font-bold text-black placeholder:text-slate-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black text-[#ccff00] text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FAQ_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-black text-[#ccff00] shadow-[3px_3px_0px_#000] -translate-y-0.5"
                      : "bg-[#faf8f2] text-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <h2 className="text-lg sm:text-xl font-black uppercase text-black">
              Daftar Pertanyaan ({filteredFaqs.length})
            </h2>
            <span className="text-xs font-bold text-slate-600">
              Klik pertanyaan untuk melihat jawaban
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border-3 border-dashed border-black/40">
              <HelpCircle className="h-12 w-12 mx-auto text-slate-400 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-black uppercase text-black">
                Tidak ada pertanyaan yang sesuai dengan &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 max-w-md mx-auto">
                Coba gunakan kata kunci yang lebih umum atau klik &ldquo;Semua Pertanyaan&rdquo; di atas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#ccff00] border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border-3 border-black bg-white transition-all overflow-hidden ${
                      isExpanded
                        ? "shadow-[5px_5px_0px_#000]"
                        : "shadow-[2px_2px_0px_#000] hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFaqId(isExpanded ? null : faq.id)
                      }
                      className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 pr-2">
                        <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">
                          {faq.categoryLabel}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-black leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div
                        className={`h-8 w-8 rounded-xl border-2 border-black bg-[#faf8f2] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 bg-[#ccff00]" : ""
                        }`}
                      >
                        <ChevronDown className="h-5 w-5 stroke-[3]" />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 border-t-2 border-black/10">
                        {faq.highlight && (
                          <div className="inline-block mt-3 mb-2 px-3 py-1 rounded-lg bg-[#ccff00] text-black font-mono font-black text-xs border border-black shadow-[1px_1px_0px_#000]">
                            ⚡ {faq.highlight}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line mt-1">
                          {faq.answer}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-black/10">
                          {faq.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300"
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

        {/* Contact & Support Card */}
        <div className="rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-6 sm:p-8 shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#ffde00] text-black border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black shrink-0">
              <MessageCircle className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-black">
                Punya Pertanyaan Lain atau Request Fitur?
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Playfield terus berkembang berkat masukan dari ratusan host mabar komunitas di Indonesia.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-black text-[#ccff00] text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[3px_3px_0px_#000] shrink-0"
          >
            Mulai Buat Sesi Baru ↗
          </Link>
        </div>
      </main>
    </div>
  );
}
