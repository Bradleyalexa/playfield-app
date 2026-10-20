"use client";

import { useState } from "react";
import { X, Heart, Coffee, Copy, Check, Sparkles, QrCode } from "lucide-react";
import Image from "next/image";

interface DonateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateCreatorModal({ isOpen, onClose }: DonateCreatorModalProps) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedNominal, setSelectedNominal] = useState<number | null>(15000);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(label);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const nominalOptions = [
    { amount: 5000, label: "☕ Kopi Sachet", desc: "Rp 5.000" },
    { amount: 15000, label: "🧋 Es Kopi Susu", desc: "Rp 15.000" },
    { amount: 25000, label: "🚀 Server 1 Hari", desc: "Rp 25.000" },
    { amount: 50000, label: "👑 Sultan Server", desc: "Rp 50.000" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-rose-500 hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000] text-xl">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-black">
                Dukung Creator Playfield
              </h2>
              <span className="text-[10px] font-black uppercase bg-[#ffde00] px-1.5 py-0.2 rounded border border-black">
                Gratis
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600">
              Bantu seikhlasnya untuk sewa server &amp; pengembangan
            </p>
          </div>
        </div>

        {/* Banner Pesan Hangat */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-slate-700 leading-relaxed">
          <p>
            Playfield dibangun agar komunitas mabar di Indonesia bisa main rapi, adil, dan transparan{" "}
            <strong>100% gratis tanpa iklan</strong>. Dukungan sukarela Anda sangat berarti untuk membayar tagihan server cloud, database, dan secangkir kopi bagi creator! ❤️
          </p>
        </div>

        {/* Pilihan Nominal Cepat */}
        <div>
          <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
            Pilih Nominal Sukarela:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {nominalOptions.map((opt) => (
              <button
                key={opt.amount}
                type="button"
                onClick={() => setSelectedNominal(opt.amount)}
                className={`p-2.5 rounded-xl border-2 border-black text-left transition-all cursor-pointer ${
                  selectedNominal === opt.amount
                    ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                    : "bg-white text-black hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                }`}
              >
                <span className="text-xs font-black block">{opt.label}</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 block mt-0.5">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kartu QRIS Resmi Dummy / Placeholder */}
        <div className="flex flex-col items-center rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] text-center">
          {/* Header Bar QRIS */}
          <div className="w-full flex items-center justify-between pb-2 border-b-2 border-black mb-3">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tighter text-rose-600 font-mono">
                QRIS
              </span>
              <span className="text-[9px] font-bold text-slate-600 uppercase">
                Standar Pembayaran Nasional
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#faf8f2] px-1.5 py-0.5 rounded border border-black">
              GPN
            </span>
          </div>

          {/* Dummy QR Code Vector Mock */}
          <div className="relative p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-2.5">
            <svg
              className="w-44 h-44 sm:w-48 sm:h-48 text-black"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner 1 */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="black" />
              <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="13" width="12" height="12" rx="1" fill="black" />

              {/* Corner 2 */}
              <rect x="67" y="5" width="28" height="28" rx="4" fill="black" />
              <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="75" y="13" width="12" height="12" rx="1" fill="black" />

              {/* Corner 3 */}
              <rect x="5" y="67" width="28" height="28" rx="4" fill="black" />
              <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="75" width="12" height="12" rx="1" fill="black" />

              {/* Random QR Pattern Dots */}
              <rect x="38" y="8" width="5" height="5" />
              <rect x="48" y="8" width="5" height="5" />
              <rect x="58" y="8" width="5" height="5" />
              <rect x="38" y="18" width="5" height="5" />
              <rect x="48" y="18" width="10" height="5" />
              <rect x="38" y="28" width="8" height="5" />
              <rect x="50" y="28" width="12" height="5" />

              <rect x="8" y="38" width="5" height="5" />
              <rect x="18" y="38" width="12" height="5" />
              <rect x="8" y="48" width="8" height="5" />
              <rect x="20" y="48" width="6" height="5" />
              <rect x="8" y="58" width="10" height="5" />

              <rect x="68" y="38" width="8" height="5" />
              <rect x="80" y="38" width="12" height="5" />
              <rect x="72" y="48" width="10" height="5" />
              <rect x="86" y="48" width="6" height="5" />
              <rect x="68" y="58" width="6" height="5" />
              <rect x="78" y="58" width="14" height="5" />

              <rect x="38" y="68" width="6" height="5" />
              <rect x="48" y="68" width="10" height="5" />
              <rect x="38" y="78" width="12" height="5" />
              <rect x="54" y="78" width="8" height="5" />
              <rect x="38" y="88" width="8" height="5" />
              <rect x="50" y="88" width="12" height="5" />
              <rect x="68" y="68" width="10" height="5" />
              <rect x="82" y="68" width="10" height="5" />
              <rect x="70" y="78" width="8" height="5" />
              <rect x="82" y="78" width="10" height="5" />
              <rect x="68" y="88" width="12" height="5" />
              <rect x="84" y="88" width="8" height="5" />

              {/* Center Logo Area */}
              <circle cx="50" cy="50" r="14" fill="white" stroke="black" strokeWidth="2" />
              <text
                x="50"
                y="54"
                textAnchor="middle"
                fontSize="9"
                fontWeight="9"
                fill="black"
                fontFamily="sans-serif"
              >
                PLAY
              </text>
            </svg>

            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block mt-1">
              PLAYFIELD COMMUNITY CREATOR
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              NMID: ID1020261021PLAYFIELD
            </span>
          </div>

          <p className="text-[10px] font-bold text-slate-600">
            Scan via BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA, atau mobile banking apapun.
          </p>
        </div>

        {/* Alternatif Transfer Rekening / E-Wallet */}
        <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000] flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-slate-600 block">
            Atau Transfer Manual:
          </span>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-black text-black">BCA: </span>
              <span className="font-mono font-bold text-black">8271-928-371</span>
              <span className="text-[10px] text-slate-600 block">a.n Alexander (Creator Playfield)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("8271928371", "BCA")}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#ccff00] border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {copiedBank === "BCA" ? <Check className="h-3 w-3 stroke-[3]" /> : <Copy className="h-3 w-3" />}
              <span>{copiedBank === "BCA" ? "Disalin!" : "Salin"}</span>
            </button>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-black text-[#ccff00] py-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            ❤️ Sudah Donasi / Terima Kasih!
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white text-black px-4 py-3 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
