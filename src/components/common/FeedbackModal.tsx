"use client";

import { useState } from "react";
import { X, MessageSquare, Star, CheckCircle, Send, Loader2 } from "lucide-react";
import { GameSession } from "../../core/entities/session";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: GameSession;
}

export function FeedbackModal({ isOpen, onClose, session }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [senderContact, setSenderContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Mohon tuliskan pesan atau masukan Anda.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session?.id,
          sessionTitle: session?.title,
          sportType: session?.sport,
          rating: rating > 0 ? rating : undefined,
          message: message.trim(),
          senderName: senderName.trim() || undefined,
          senderContact: senderContact.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim feedback");
      }

      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kendala saat mengirim. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setRating(0);
    setSenderName("");
    setSenderContact("");
    setIsSubmitted(false);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-lg rounded-2xl border-3 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
              <CheckCircle className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Terima Kasih atas Masukannya</h3>
              <p className="text-sm font-medium text-slate-600 mt-1 max-w-sm">
                Feedback Anda telah kami terima dan akan menjadi pertimbangan perbaikan Playfield ke depan.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-3 px-5 py-2 rounded-xl border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Header Modal */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000] shrink-0">
                <MessageSquare className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
                  Feedback Sesi Mabar
                </h2>
                <p className="text-xs font-medium text-slate-600">
                  Bantu kami meningkatkan Playfield dengan menceritakan pengalaman Anda hari ini.
                </p>
              </div>
            </div>

            {/* Rating Bintang (Opsional) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bagaimana kelancaran rotasi & mabar hari ini? (Opsional)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Beri nilai ${star} dari 5`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          isFilled
                            ? "fill-[#ffc800] text-black stroke-[2]"
                            : "fill-transparent text-slate-400 stroke-[1.8]"
                        }`}
                      />
                    </button>
                  );
                })}
                {rating > 0 && (
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating === 5 && "Sangat Lancar"}
                    {rating === 4 && "Lancar & Nyaman"}
                    {rating === 3 && "Cukup Baik"}
                    {rating === 2 && "Ada Beberapa Kendala"}
                    {rating === 1 && "Kurang Memuaskan"}
                  </span>
                )}
              </div>
            </div>

            {/* Input Pesan / Masukan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pesan, Saran, atau Kendala <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                rows={4}
                placeholder="Ceritakan apa yang sudah bagus, kendala teknis saat rotasi, atau fitur baru yang Anda harapkan..."
                className="w-full rounded-xl border-2 border-black bg-white p-3 text-sm text-black placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ccff00] focus:border-black font-medium resize-none shadow-[2px_2px_0px_#000]"
              />
              {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}
            </div>

            {/* Input Kontak Opsional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Nama Anda (Opsional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="rounded-xl border-2 border-black bg-white px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ccff00] font-medium shadow-[2px_2px_0px_#000]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Kontak WA / Email (Opsional)
                </label>
                <input
                  type="text"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  placeholder="0812... / email"
                  className="rounded-xl border-2 border-black bg-white px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ccff00] font-medium shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border-2 border-black bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                Lewati
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2.5 rounded-xl border-2 border-black bg-[#ccff00] text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Kirim Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
