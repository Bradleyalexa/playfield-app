"use client";

import { useState } from "react";
import {
  X,
  Trophy,
  Flag,
  AlertTriangle,
  Users,
  Package,
  Award,
  CreditCard,
  Building2,
} from "lucide-react";
import {
  GameSession,
  SessionBillingConfig,
  calculateEquipmentCost,
} from "../../core/entities/session";
import { formatRupiah } from "../../lib/utils";

interface FinishSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: (updatedBilling?: SessionBillingConfig) => void;
  session: GameSession;
}

export function FinishSessionModal({
  isOpen,
  onClose,
  onConfirmFinish,
  session,
}: FinishSessionModalProps) {
  const currentBilling = session.billing || {
    model: session.sportConfig.equipment.enabled ? "track_equipment" : "none",
  };

  const [courtRentalFee, setCourtRentalFee] = useState<number>(
    currentBilling.courtRentalFee ??
      (session.sportConfig.equipment.enabled ? 160000 : 0),
  );
  const [fixedPrice, setFixedPrice] = useState<number>(
    currentBilling.fixedPricePerPerson ?? 40000,
  );
  const [otherFee, setOtherFee] = useState<number>(
    currentBilling.otherFee ?? 0,
  );
  const [otherFeeDesc, setOtherFeeDesc] = useState<string>(
    currentBilling.otherFeeDescription ?? "Air Mineral",
  );
  const [bankName, setBankName] = useState<string>(
    currentBilling.bankName ?? "BCA",
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    currentBilling.accountNumber ?? "",
  );
  const [accountHolder, setAccountHolder] = useState<string>(
    currentBilling.accountHolder ?? "",
  );

  if (!isOpen) return null;

  const completedMatches = session.matches.filter(
    (m) => m.status === "completed",
  );
  const inProgressMatches = session.matches.filter(
    (m) => m.status === "in_progress",
  );

  // Hitung MVP (Paling banyak menang & win rate)
  const playerStats = session.players.map((p) => {
    let won = 0;
    let played = p.gamesPlayed;
    session.matches.forEach((m) => {
      if (m.status === "completed") {
        if (m.teamA.some((pl) => pl.id === p.id) && m.scoreA > m.scoreB) won++;
        if (m.teamB.some((pl) => pl.id === p.id) && m.scoreB > m.scoreA) won++;
      }
    });
    const wr = played > 0 ? Math.round((won / played) * 100) : 0;
    return { player: p, won, played, wr };
  });

  playerStats.sort((a, b) => b.won - a.won || b.wr - a.wr);
  const mvp = playerStats[0];

  // Hitung Biaya Equipment
  const equipment = session.sportConfig.equipment;
  const equipmentCost = equipment.enabled
    ? calculateEquipmentCost(equipment)
    : 0;
  const playerCount = session.players.length;

  // Hitung Split Bill
  const isFixed = currentBilling.model === "fixed_per_person";
  const isTrack = currentBilling.model === "track_equipment";
  const totalCost = isFixed
    ? fixedPrice * playerCount
    : courtRentalFee + equipmentCost + otherFee;
  const costPerPerson = isFixed
    ? fixedPrice
    : playerCount > 0
      ? Math.ceil(totalCost / playerCount)
      : 0;

  const handleConfirm = () => {
    const updatedBilling: SessionBillingConfig = {
      ...currentBilling,
      fixedPricePerPerson: isFixed ? fixedPrice : undefined,
      courtRentalFee: isTrack ? courtRentalFee : undefined,
      otherFee: isTrack && otherFee > 0 ? otherFee : undefined,
      otherFeeDescription: isTrack && otherFee > 0 ? otherFeeDesc : undefined,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountHolder: accountHolder.trim() || undefined,
    };
    onConfirmFinish(updatedBilling);
    onClose();
  };

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
          <div className="h-10 w-10 rounded-xl bg-[#ffde00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Flag className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              Selesaikan Mabar Hari Ini?
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Kunci klasemen podium &amp; hitung split bill patungan
            </p>
          </div>
        </div>

        {/* Peringatan jika ada match sedang berjalan */}
        {inProgressMatches.length > 0 && (
          <div className="rounded-xl border-2 border-amber-600 bg-amber-50 p-3 text-xs font-bold text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase block">
                Perhatian: Ada {inProgressMatches.length} Lapangan Sedang
                Bermain!
              </span>
              <span>
                Jika diselesaikan sekarang, skor yang tercatat saat ini akan
                langsung dianggap sebagai hasil akhir pertandingan.
              </span>
            </div>
          </div>
        )}

        {/* Ringkasan Statistik Pertandingan */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500">
              Total Match Selesai
            </span>
            <span className="text-lg font-black font-mono-sport text-black mt-0.5">
              {completedMatches.length} Match
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col">
            <span className="text-[10px] font-black uppercase text-black/70">
              Kandidat MVP
            </span>
            <span className="text-sm font-black text-black truncate mt-0.5">
              🏆 {mvp ? mvp.player.name : "-"}
            </span>
            <span className="text-[10px] font-bold text-black/80 font-mono-sport">
              {mvp ? `${mvp.won} Menang (${mvp.wr}%)` : ""}
            </span>
          </div>
        </div>

        {/* Form Split Bill & Sewa Lapangan */}
        <div className="rounded-xl bg-white border-2 border-black p-3.5 shadow-[3px_3px_0px_#000] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span>&amp; Split Bill Patungan</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#faf8f2] px-2 py-0.5 rounded border border-black">
              {playerCount} Peserta
            </span>
          </div>

          {/* Jika Model: Itung Cock & Sewa Lapangan */}
          {isTrack && (
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-black block">
                    Biaya Sewa Lapangan:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Total sewa seluruh lapangan
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    value={courtRentalFee}
                    onChange={(e) =>
                      setCourtRentalFee(
                        Math.max(0, parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="w-28 text-right font-mono font-black rounded-lg border-2 border-black px-2 py-1 bg-[#faf8f2]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-black block">
                    Shuttlecock / Bola Terpakai:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {equipment.pricingModel === "per_slop"
                      ? `${equipment.slopUsed || 1} Slop`
                      : `${equipment.totalUsed || 0} Butir`}
                  </span>
                </div>
                <span className="font-mono font-black text-black">
                  {formatRupiah(equipmentCost)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-black block">
                    Biaya Lain-lain (Opsional):
                  </span>
                  <input
                    type="text"
                    value={otherFeeDesc}
                    onChange={(e) => setOtherFeeDesc(e.target.value)}
                    placeholder="misal: Air Mineral"
                    className="text-[10px] px-1.5 py-0.5 rounded border border-black/40 font-bold w-24 bg-[#faf8f2]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={otherFee}
                    onChange={(e) =>
                      setOtherFee(
                        Math.max(0, parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="w-28 text-right font-mono font-black rounded-lg border-2 border-black px-2 py-1 bg-[#faf8f2]"
                  />
                </div>
              </div>

              {/* Total & Split Per Orang */}
              <div className="pt-2 border-t-2 border-black flex items-center justify-between bg-[#ccff00]/20 p-2 rounded-lg border border-black">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-700 block">
                    Total Biaya:
                  </span>
                  <span className="font-mono font-black text-sm text-black">
                    {formatRupiah(totalCost)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-emerald-900 block">
                    Patungan Per Orang:
                  </span>
                  <span className="font-mono font-black text-base text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded border border-emerald-500">
                    {formatRupiah(costPerPerson)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Jika Model: Fixed Price */}
          {isFixed && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black">
                  Tarif Tetap Per Orang:
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={fixedPrice}
                    onChange={(e) =>
                      setFixedPrice(
                        Math.max(0, parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="w-28 text-right font-mono font-black rounded-lg border-2 border-black px-2 py-1 bg-[#faf8f2]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-700 text-[11px]">
                <span>Total Terkumpul ({playerCount} Peserta):</span>
                <span className="font-mono font-bold">
                  {formatRupiah(totalCost)}
                </span>
              </div>
            </div>
          )}

          {/* Form Rekening Bank Host untuk Transfer */}
          <div className="pt-2 border-t border-black/15 flex flex-col gap-1.5 text-xs">
            <span className="text-[11px] font-black uppercase text-slate-700 block">
              💳 Rekening Bank / E-Wallet Host (Untuk Format Pesan WhatsApp):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Bank (BCA/Mandiri)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="px-2 py-1 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
              />
              <input
                type="text"
                placeholder="No. Rekening"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="px-2 py-1 rounded-lg border-2 border-black text-xs font-mono font-bold bg-[#faf8f2]"
              />
              <input
                type="text"
                placeholder="Atas Nama"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="px-2 py-1 rounded-lg border-2 border-black text-xs font-bold bg-[#faf8f2]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Lanjut Main
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-rose-500 text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-rose-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span>Ya, Selesaikan Mabar 🏁</span>
          </button>
        </div>
      </div>
    </div>
  );
}
