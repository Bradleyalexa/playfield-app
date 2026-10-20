"use client";

import { X, Shuffle, ShieldCheck, Users, ArrowRight, AlertTriangle, Undo2, CheckCircle2 } from "lucide-react";
import { GameSession, ALGORITHM_REGISTRY } from "../../core/entities/session";

interface ReshuffleConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: GameSession;
  triggerReason?: "manual_button" | "player_added" | "player_removed";
  extraNotice?: string;
}

export function ReshuffleConsentModal({
  isOpen,
  onClose,
  onConfirm,
  session,
  triggerReason = "manual_button",
  extraNotice,
}: ReshuffleConsentModalProps) {
  if (!isOpen) return null;

  const activePlayers = session.players.filter((p) => p.status === "active");
  const algo = ALGORITHM_REGISTRY[session.algorithm] || ALGORITHM_REGISTRY["fair_playtime"];

  // Filter pemain & lapangan
  const lockedCourts = session.courts.filter(
    (c) => c.currentMatch && (c.currentMatch.scoreA > 0 || c.currentMatch.scoreB > 0)
  );

  const lockedPlayerIds = new Set<string>();
  lockedCourts.forEach((c) => {
    c.currentMatch?.teamA.forEach((p) => lockedPlayerIds.add(p.id));
    c.currentMatch?.teamB.forEach((p) => lockedPlayerIds.add(p.id));
  });

  const emptyOrResetCourts = session.courts.filter(
    (c) => !c.currentMatch || (c.currentMatch.scoreA === 0 && c.currentMatch.scoreB === 0)
  );

  const eligiblePool = activePlayers.filter((p) => !lockedPlayerIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-rose-500 hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-[#00e5ff] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Shuffle className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              {triggerReason === "player_added"
                ? "Pemain Baru Ditambahkan: Kocok Ulang?"
                : triggerReason === "player_removed"
                ? "Pemain Dikeluarkan: Atur Ulang Lapangan?"
                : "Alur & Konfirmasi Kocok Ulang"}
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Cek alur rotasi sebelum sistem mengacak pasangan lapangan
            </p>
          </div>
        </div>

        {extraNotice && (
          <div className="p-3 rounded-xl bg-[#ffde00]/40 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>{extraNotice}</span>
          </div>
        )}

        {/* Alur Kerja Kocok Ulang Step-by-Step */}
        <div className="flex flex-col gap-2.5">
          {/* Step 1: Status Lapangan & Proteksi Match */}
          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/10 text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>1. Proteksi Match Berjalan</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                Aman & Anti-Kacau
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-1.5 text-xs">
              {lockedCourts.length > 0 ? (
                lockedCourts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-950"
                  >
                    <span>
                      {c.courtName} (Skor {c.currentMatch?.scoreA} - {c.currentMatch?.scoreB})
                    </span>
                    <span className="font-mono font-black text-[10px] bg-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400">
                      🔒 DIKUNCI (Tetap Main)
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] font-bold text-slate-600">
                  Tidak ada pertandingan berjalan dengan poin. Seluruh lapangan siap diacak segar.
                </p>
              )}

              {emptyOrResetCourts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-sky-50 border border-sky-300 text-[11px] font-bold text-sky-950"
                >
                  <span>
                    {c.courtName} ({c.currentMatch ? "Skor 0 - 0" : "Lapangan Kosong"})
                  </span>
                  <span className="font-mono font-black text-[10px] bg-[#00e5ff] text-black px-1.5 py-0.2 rounded border border-black">
                    🔄 AKAN DIKOCOK
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Algoritma yang Digunakan */}
          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/10 text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <span>⚖️</span>
                <span>2. Aturan Algoritma: {algo.name}</span>
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded border border-black ${algo.badgeColor}`}>
                {algo.shortName}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 mt-2">
              {algo.description}
            </p>
          </div>

          {/* Step 3: Pool Pemain yang Masuk Undian */}
          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/10 text-xs font-black uppercase">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-black" />
                <span>3. Pool Pemain ({eligiblePool.length} Siap Dirotasi)</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
              {eligiblePool.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded-lg bg-[#faf8f2] border border-black text-[10px] font-bold text-black"
                >
                  {p.name} ({p.gender === "M" ? "M" : "W"} • {p.gamesPlayed}x)
                </span>
              ))}
            </div>
          </div>

          {/* Step 4: Jaminan Tombol Urungkan (Undo) */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-700">
            <Undo2 className="h-4 w-4 text-black shrink-0" />
            <span>
              <strong>Tenang:</strong> Jika hasil kocokan kurang disukai, tombol <strong>Urungkan</strong> akan otomatis tersedia untuk membatalkan.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {triggerReason === "player_added" ? "Nanti Saja (Ronde Depan)" : "Batal"}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={emptyOrResetCourts.length === 0 || eligiblePool.length < 4}
            className="flex-1 py-2.5 rounded-xl bg-[#00e5ff] border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] hover:bg-[#00cce6] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Ya, Kocok Sekarang 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
