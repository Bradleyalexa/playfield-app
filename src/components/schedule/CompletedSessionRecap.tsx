"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Share2,
  Award,
  Package,
  RotateCcw,
  PlusCircle,
  Check,
  CreditCard,
  Copy,
  Edit3,
  Coffee,
  Building2,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  GameSession,
  SessionBillingConfig,
  calculateEquipmentCost,
  calculateSessionBilling,
} from "../../core/entities/session";
import { formatRupiah } from "../../lib/utils";
import { getTierLabel } from "../../core/entities/player";
import { DonateCreatorModal } from "../common/DonateCreatorModal";

interface CompletedSessionRecapProps {
  session: GameSession;
  isHost?: boolean;
  onReopenSession?: () => void;
  onUpdateBilling?: (updated: SessionBillingConfig) => void;
}

export function CompletedSessionRecap({
  session,
  isHost = false,
  onReopenSession,
  onUpdateBilling,
}: CompletedSessionRecapProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);

  // State untuk form edit billing host
  const currentBilling = session.billing || {
    model: session.sportConfig.equipment.enabled ? "track_equipment" : "none",
  };
  const [editCourtFee, setEditCourtFee] = useState<number>(currentBilling.courtRentalFee ?? 160000);
  const [editFixedPrice, setEditFixedPrice] = useState<number>(currentBilling.fixedPricePerPerson ?? 40000);
  const [editOtherFee, setEditOtherFee] = useState<number>(currentBilling.otherFee ?? 0);
  const [editOtherDesc, setEditOtherDesc] = useState<string>(currentBilling.otherFeeDescription ?? "Air Mineral");
  const [editBankName, setEditBankName] = useState<string>(currentBilling.bankName ?? "BCA");
  const [editAccountNumber, setEditAccountNumber] = useState<string>(currentBilling.accountNumber ?? "");
  const [editAccountHolder, setEditAccountHolder] = useState<string>(currentBilling.accountHolder ?? "");

  // Hitung statistik seluruh pemain
  const playerStats = session.players.map((p) => {
    let won = 0;
    let totalPoints = 0;
    session.matches.forEach((m) => {
      if (m.status === "completed") {
        if (m.teamA.some((pl) => pl.id === p.id)) {
          totalPoints += m.scoreA;
          if (m.scoreA > m.scoreB) won++;
        }
        if (m.teamB.some((pl) => pl.id === p.id)) {
          totalPoints += m.scoreB;
          if (m.scoreB > m.scoreA) won++;
        }
      }
    });
    const wr = p.gamesPlayed > 0 ? Math.round((won / p.gamesPlayed) * 100) : 0;
    return { player: p, won, played: p.gamesPlayed, wr, totalPoints };
  });

  playerStats.sort((a, b) => b.won - a.won || b.wr - a.wr || b.totalPoints - a.totalPoints);

  const firstPlace = playerStats[0];
  const secondPlace = playerStats[1];
  const thirdPlace = playerStats[2];

  const completedMatches = session.matches.filter((m) => m.status === "completed");
  const billingSummary = calculateSessionBilling(session);

  // Simpan perubahan billing
  const handleSaveBilling = () => {
    if (!onUpdateBilling) return;
    const updated: SessionBillingConfig = {
      ...currentBilling,
      courtRentalFee: billingSummary.model === "track_equipment" ? editCourtFee : undefined,
      fixedPricePerPerson: billingSummary.model === "fixed_per_person" ? editFixedPrice : undefined,
      otherFee: editOtherFee > 0 ? editOtherFee : undefined,
      otherFeeDescription: editOtherFee > 0 ? editOtherDesc : undefined,
      bankName: editBankName.trim() || undefined,
      accountNumber: editAccountNumber.trim() || undefined,
      accountHolder: editAccountHolder.trim() || undefined,
    };
    onUpdateBilling(updated);
    setIsEditingBilling(false);
  };

  // Format pesan WhatsApp super lengkap & rapi
  const generateWaSummary = () => {
    let text = `🏸 *HASIL AKHIR MABAR PLAYFIELD*\n` +
      `🏢 *Sesi:* ${session.title}\n` +
      `📅 *Ronde:* #${session.currentRound} (${completedMatches.length} Match Selesai)\n` +
      `👥 *Total Peserta:* ${session.players.length} Pemain\n`;

    if (session.courtLocation) {
      text += `📍 *Lokasi:* ${session.courtLocation}\n`;
    }

    text += `\n🏆 *PODIUM JUARA MABAR:*\n`;

    if (firstPlace) {
      text += `🥇 *Juara 1:* ${firstPlace.player.name} (${firstPlace.won}W / ${firstPlace.played}M • WR ${firstPlace.wr}%)\n`;
    }
    if (secondPlace) {
      text += `🥈 *Juara 2:* ${secondPlace.player.name} (${secondPlace.won}W / ${secondPlace.played}M • WR ${secondPlace.wr}%)\n`;
    }
    if (thirdPlace) {
      text += `🥉 *Juara 3:* ${thirdPlace.player.name} (${thirdPlace.won}W / ${thirdPlace.played}M • WR ${thirdPlace.wr}%)\n`;
    }

    // Rincian Patungan & Biaya
    if (billingSummary.model === "track_equipment") {
      const eq = session.sportConfig.equipment;
      text += `\n💰 *RINCIAN PATUNGAN MABAR:*\n` +
        `• Sewa Lapangan: ${formatRupiah(billingSummary.courtRentalFee)}\n` +
        `• Kok/Bola Terpakai: ${eq.pricingModel === "per_slop" ? `${eq.slopUsed || 1} Slop` : `${eq.totalUsed || 0} Butir`} (${formatRupiah(billingSummary.equipmentFee)})\n`;

      if (billingSummary.otherFee > 0) {
        text += `• ${billingSummary.otherFee > 0 && currentBilling.otherFeeDescription ? currentBilling.otherFeeDescription : "Biaya Tambahan"}: ${formatRupiah(billingSummary.otherFee)}\n`;
      }

      text += `• Total Biaya: *${formatRupiah(billingSummary.totalCost)}*\n` +
        `👉 *TAGIHAN PER ORANG: ${formatRupiah(billingSummary.costPerPerson)}*\n`;
    } else if (billingSummary.model === "fixed_per_person") {
      text += `\n💰 *TAGIHAN MABAR (ALL-IN):*\n` +
        `👉 *TAGIHAN PER ORANG: ${formatRupiah(billingSummary.costPerPerson)}*\n`;
    }

    // Info Transfer Rekening Host
    if (billingSummary.bankName && billingSummary.accountNumber) {
      text += `\n💳 *PEMBAYARAN TRANSFER HOST:*\n` +
        `• Bank/E-Wallet: *${billingSummary.bankName}*\n` +
        `• No. Rekening: *${billingSummary.accountNumber}*\n`;
      if (billingSummary.accountHolder) {
        text += `• Atas Nama: *${billingSummary.accountHolder}*\n`;
      }
    }

    text += `\nTerima kasih semuanya yang sudah mabar malam ini! Sampai jumpa di mabar berikutnya! 🔥\n` +
      `_Dikelola via Playfield App_`;
    return text;
  };

  const handleShareWa = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generateWaSummary())}`;
    window.open(url, "_blank");
    // Tampilkan popup apresiasi donasi creator setelah share
    setTimeout(() => {
      setIsDonateModalOpen(true);
    }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateWaSummary());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      // Buka modal apresiasi donasi
      setTimeout(() => {
        setIsDonateModalOpen(true);
      }, 1000);
    } catch {}
  };

  const handleCopyBankOnly = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 } });
    } catch {}
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-3 sm:border-4 border-black bg-white p-4 sm:p-7 shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] animate-in fade-in">
      {/* Banner Selebrasi Neo-Brutalist */}
      <div className="relative overflow-hidden rounded-2xl border-3 border-black bg-[#ccff00] p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-[#ccff00] text-2xl sm:text-3xl border-2 border-black shadow-[2px_2px_0px_#000]">
            🏆
          </div>
          <div>
            <span className="inline-block rounded-lg bg-black text-white px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
              🏁 SESI RESMI SELESAI
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight mt-0.5">
              Rekap Hasil &amp; Podium Mabar
            </h2>
            <p className="text-xs font-bold text-slate-800">
              {completedMatches.length} Pertandingan Selesai • {session.players.length} Pemain Berpartisipasi
            </p>
          </div>
        </div>

        <button
          onClick={triggerConfetti}
          className="rounded-xl bg-white border-2 border-black px-3.5 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-[#ffde00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
        >
          🎉 Rayakan Konfeti
        </button>
      </div>

      {/* Podium 3 Besar Juara Mabar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black uppercase text-black tracking-wider flex items-center gap-1.5">
            <Trophy className="h-4 w-4 stroke-[2.5]" />
            <span>Podium 3 Besar Juara</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-600">
            Berdasarkan Kemenangan &amp; Win Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
          {/* Juara 2 (Perak) */}
          {secondPlace && (
            <div className="order-2 sm:order-1 flex flex-col items-center rounded-2xl border-3 border-black bg-[#f1f5f9] p-4 shadow-[4px_4px_0px_#000] text-center">
              <span className="text-3xl mb-1">🥈</span>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white text-slate-800 border-2 border-black shadow-[1px_1px_0px_#000]">
                JUARA 2
              </span>
              <h3 className="text-base sm:text-lg font-black text-black uppercase truncate max-w-full mt-1.5">
                {secondPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-black font-mono-sport">
                <span className="bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                  {secondPlace.won} Menang
                </span>
                <span className="bg-slate-200 px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                  WR {secondPlace.wr}%
                </span>
              </div>
            </div>
          )}

          {/* Juara 1 (Emas / Champion) */}
          {firstPlace && (
            <div className="order-1 sm:order-2 flex flex-col items-center rounded-2xl border-3 sm:border-4 border-black bg-[#ffde00] p-5 shadow-[6px_6px_0px_#000] text-center sm:-translate-y-2">
              <span className="text-4xl mb-1 block">🥇</span>
              <div className="flex flex-col items-center gap-1">
                <span className="rounded-full bg-black text-white text-[11px] font-black px-3 py-0.5 border-2 border-black uppercase font-mono shadow-[1.5px_1.5px_0px_#000]">
                  ★ CHAMPION ★
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  JUARA 1 (MVP)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-black uppercase truncate max-w-full mt-1">
                {firstPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-black font-mono-sport">
                <span className="bg-white px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_#000]">
                  {firstPlace.won} Menang
                </span>
                <span className="bg-[#ccff00] px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_#000]">
                  WR {firstPlace.wr}%
                </span>
              </div>
            </div>
          )}

          {/* Juara 3 (Perunggu) */}
          {thirdPlace && (
            <div className="order-3 flex flex-col items-center rounded-2xl border-3 border-black bg-[#fef3c7] p-4 shadow-[4px_4px_0px_#000] text-center">
              <span className="text-3xl mb-1">🥉</span>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white text-amber-950 border-2 border-black shadow-[1px_1px_0px_#000]">
                JUARA 3
              </span>
              <h3 className="text-base sm:text-lg font-black text-black uppercase truncate max-w-full mt-1.5">
                {thirdPlace.player.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-black font-mono-sport">
                <span className="bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                  {thirdPlace.won} Menang
                </span>
                <span className="bg-amber-200 px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                  WR {thirdPlace.wr}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rangkuman Finansial & Split Bill Patungan */}
      {billingSummary.model !== "none" && (
        <div className="rounded-2xl border-3 border-black bg-[#faf8f2] p-4 sm:p-5 shadow-[5px_5px_0px_#000] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 stroke-[2.5]" />
              <span className="text-xs sm:text-sm font-black uppercase text-black tracking-wide">
                Rincian Biaya &amp; Split Bill Patungan
              </span>
            </div>

            {isHost && onUpdateBilling && (
              <button
                type="button"
                onClick={() => setIsEditingBilling(!isEditingBilling)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-slate-100 text-[11px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isEditingBilling ? "Batal" : "Edit Biaya"}</span>
              </button>
            )}
          </div>

          {/* Form Editor Biaya (Jika Host Sedang Mengedit) */}
          {isEditingBilling ? (
            <div className="p-3.5 rounded-xl bg-white border-2 border-black flex flex-col gap-3 animate-in fade-in">
              <span className="text-xs font-black uppercase text-black">
                Edit Biaya Sewa Lapangan &amp; Rekening Transfer:
              </span>

              {billingSummary.model === "track_equipment" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Biaya Sewa Lapangan (Rp):
                    </label>
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      value={editCourtFee}
                      onChange={(e) => setEditCourtFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black font-mono font-bold bg-[#faf8f2]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Biaya Lain-lain (Air/Parkir):
                    </label>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={editOtherFee}
                      onChange={(e) => setEditOtherFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black font-mono font-bold bg-[#faf8f2]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tarif Tetap Per Orang (Rp):
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={editFixedPrice}
                    onChange={(e) => setEditFixedPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-48 px-2.5 py-1.5 rounded-lg border-2 border-black font-mono font-bold bg-[#faf8f2]"
                  />
                </div>
              )}

              {/* Rekening Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Bank / E-Wallet:</label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    placeholder="BCA / Mandiri"
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black font-bold bg-[#faf8f2]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">No. Rekening:</label>
                  <input
                    type="text"
                    value={editAccountNumber}
                    onChange={(e) => setEditAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black font-mono font-bold bg-[#faf8f2]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Atas Nama:</label>
                  <input
                    type="text"
                    value={editAccountHolder}
                    onChange={(e) => setEditAccountHolder(e.target.value)}
                    placeholder="Alexander"
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-black font-bold bg-[#faf8f2]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveBilling}
                className="w-full py-2 rounded-lg bg-black text-[#ccff00] font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                Simpan Rincian Biaya Baru
              </button>
            </div>
          ) : (
            /* Tampilan Ringkasan Biaya Aktif */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {/* Box Rincian Biaya */}
              <div className="rounded-xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between text-xs">
                <div className="flex flex-col gap-1.5">
                  {billingSummary.model === "track_equipment" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-bold">Sewa Lapangan:</span>
                        <span className="font-mono font-black">{formatRupiah(billingSummary.courtRentalFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-bold">
                          Shuttlecock ({session.sportConfig.equipment.pricingModel === "per_slop" ? `${session.sportConfig.equipment.slopUsed || 1} Slop` : `${session.sportConfig.equipment.totalUsed || 0} Butir`}):
                        </span>
                        <span className="font-mono font-black">{formatRupiah(billingSummary.equipmentFee)}</span>
                      </div>
                      {billingSummary.otherFee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-bold">
                            {currentBilling.otherFeeDescription || "Biaya Tambahan"}:
                          </span>
                          <span className="font-mono font-black">{formatRupiah(billingSummary.otherFee)}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-black/15 flex items-center justify-between font-black">
                        <span>Total Biaya Mabar:</span>
                        <span className="font-mono text-sm">{formatRupiah(billingSummary.totalCost)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Tarif Flat All-In:</span>
                      <span className="font-black text-base text-black font-mono">
                        {formatRupiah(billingSummary.costPerPerson)} / Orang
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Total Terkumpul: {formatRupiah(billingSummary.totalCost)} ({billingSummary.playerCount} Peserta)
                      </span>
                    </div>
                  )}
                </div>

                {/* Box Tagihan Per Orang */}
                <div className="mt-3 pt-2 border-t-2 border-black flex items-center justify-between bg-[#ccff00]/25 p-2 rounded-lg border border-black">
                  <span className="text-xs font-black uppercase text-black">Tagihan Per Orang:</span>
                  <span className="text-base font-black font-mono text-emerald-900 bg-emerald-200 px-2.5 py-0.5 rounded border border-emerald-500 shadow-[1px_1px_0px_#000]">
                    {formatRupiah(billingSummary.costPerPerson)}
                  </span>
                </div>
              </div>

              {/* Box Info Transfer Rekening Host */}
              <div className="rounded-xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>Rekening Pembayaran Member (Transfer):</span>
                  </span>

                  {billingSummary.bankName && billingSummary.accountNumber ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-black uppercase">
                          {billingSummary.bankName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBankOnly(billingSummary.accountNumber || "")}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ccff00] border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          {copiedBank ? <Check className="h-3 w-3 stroke-[3]" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedBank ? "Disalin!" : "Salin No. Rek"}</span>
                        </button>
                      </div>
                      <span className="font-mono font-black text-base text-black tracking-wide">
                        {billingSummary.accountNumber}
                      </span>
                      {billingSummary.accountHolder && (
                        <span className="text-xs font-bold text-slate-700">
                          a.n {billingSummary.accountHolder}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#faf8f2] border border-dashed border-black/40 text-center text-slate-600 font-bold text-[11px]">
                      Belum ada rekening transfer yang dicatat. Klik &apos;Edit Biaya&apos; untuk menambahkan no rekening.
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-bold text-slate-500 mt-2">
                  Info rekening ini otomatis dicantumkan saat host menyalin rekap pesan WhatsApp.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: WhatsApp Summary, Copy, Donasi Creator, Reopen, Create New */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareWa}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-black border-2 sm:border-3 border-black px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:bg-[#20bd5a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4 stroke-[2.5]" />
            <span>Kirim Rekap WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white text-black border-2 border-black px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Salin rekap teks ke clipboard"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> : <span className="text-sm">📋</span>}
            <span>{isCopied ? "Tersalin!" : "Salin Teks"}</span>
          </button>

          {/* Tombol Donasi Creator */}
          <button
            type="button"
            onClick={() => setIsDonateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#ffde00] text-black border-2 border-black px-3.5 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#ebd000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Bantu traktir kopi & server creator Playfield"
          >
            <Coffee className="h-4 w-4 stroke-[2.5]" />
            <span>☕ Donasi Creator</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Reopen Session Khusus Host */}
          {isHost && onReopenSession && (
            <button
              onClick={onReopenSession}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border-2 border-black px-3.5 py-3 text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-slate-200 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Aktifkan kembali sesi jika mabar belum benar-benar selesai"
            >
              <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Buka Kembali</span>
            </button>
          )}

          <Link
            href="/"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-black text-white hover:text-[#ccff00] border-2 sm:border-3 border-black px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Bikin Sesi Baru</span>
          </Link>
        </div>
      </div>

      {/* Modal Donasi ke Creator Playfield */}
      <DonateCreatorModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />
    </div>
  );
}
