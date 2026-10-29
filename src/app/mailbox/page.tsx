"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Star,
  RefreshCw,
  Search,
  Calendar,
  User,
  Phone,
  ArrowLeft,
  MessageSquare,
  Activity,
} from "lucide-react";
import { SessionFeedback } from "../../core/entities/feedback";

export default function MailboxPage() {
  const [feedbacks, setFeedbacks] = useState<SessionFeedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data mailbox");
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const q = searchQuery.toLowerCase();
    const matchMessage = fb.message?.toLowerCase().includes(q);
    const matchSender = fb.senderName?.toLowerCase().includes(q);
    const matchContact = fb.senderContact?.toLowerCase().includes(q);
    const matchTitle = fb.sessionTitle?.toLowerCase().includes(q);
    return matchMessage || matchSender || matchContact || matchTitle;
  });

  const ratedItems = feedbacks.filter((fb) => typeof fb.rating === "number" && fb.rating > 0);
  const avgRating =
    ratedItems.length > 0
      ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
      : null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Top Header */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border-2 border-black bg-[#faf8f2] hover:bg-[#ccff00] text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Inbox className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight leading-none">
                  Mailbox Feedback
                </h1>
                <p className="text-[11px] font-bold text-slate-500">
                  Kotak Masuk Surat & Masukan Host Playfield
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchFeedbacks}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-zinc-100 text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Surat</div>
            <div className="text-2xl font-black mt-0.5">{feedbacks.length}</div>
          </div>
          <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rata-rata Rating</div>
            <div className="text-2xl font-black mt-0.5 flex items-center gap-1">
              {avgRating ? (
                <>
                  <span>{avgRating}</span>
                  <Star className="h-5 w-5 fill-[#ffc800] text-black stroke-[2]" />
                  <span className="text-xs font-bold text-slate-400">/ 5</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400">Belum ada</span>
              )}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border-2 border-black bg-[#ccff00] p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-center">
            <div className="text-[11px] font-black uppercase tracking-wider text-black">Penyimpanan Server</div>
            <div className="text-xs font-bold text-black/80 mt-0.5">
              Cloudflare R2 Bucket (Zero Cost)
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci pesan, nama host, kontak, atau judul sesi..."
            className="w-full rounded-2xl border-2 border-black bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ccff00] shadow-[3px_3px_0px_#000]"
          />
        </div>

        {/* Feedbacks List */}
        {isLoading ? (
          <div className="py-16 text-center text-xs sm:text-sm font-bold text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-black" />
            <span>Memuat kotak surat dari server...</span>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 text-xs font-bold">
            {error}
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl border-3 border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-2 bg-white/60">
            <MessageSquare className="h-10 w-10 text-slate-400" />
            <div className="text-sm font-black text-slate-700 uppercase tracking-wide">
              {searchQuery ? "Tidak ada surat yang sesuai pencarian" : "Belum Ada Surat Masuk"}
            </div>
            <p className="text-xs font-medium text-slate-500 max-w-sm">
              {searchQuery
                ? "Coba gunakan kata kunci pencarian yang lain."
                : "Saat host menyelesaikan sesi mabar dan mengirim feedback, suratnya akan otomatis tersimpan di sini."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-2xl border-2 sm:border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
              >
                {/* Header Card: Sender, Date, Rating */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 border border-black flex items-center justify-center text-black font-black text-xs shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-black">
                        {fb.senderName || "Host Anonim"}
                      </div>
                      {fb.senderContact && (
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{fb.senderContact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fb.rating && fb.rating > 0 && (
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg border border-black bg-[#ffde00] text-black text-xs font-black">
                        <span>{fb.rating}</span>
                        <Star className="h-3 w-3 fill-black text-black" />
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(fb.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Session Origin Info */}
                {(fb.sessionTitle || fb.sportType) && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-[#faf8f2] px-2.5 py-1 rounded-lg border border-black/10 w-fit">
                    <Activity className="h-3 w-3 text-slate-500" />
                    <span>Sesi:</span>
                    <span className="text-black font-black">{fb.sessionTitle || "Tanpa Judul"}</span>
                    {fb.sportType && (
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-black text-white font-black">
                        {fb.sportType}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap bg-zinc-50/70 p-3 rounded-xl border border-slate-200">
                  {fb.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
