"use client";

import { useState } from "react";
import { X, Heart, Coffee, Copy, Check, Sparkles, QrCode, Download } from "lucide-react";
import Image from "next/image";

interface DonateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateCreatorModal({ isOpen, onClose }: DonateCreatorModalProps) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(label);
    setTimeout(() => setCopiedBank(null), 2000);
  };

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
              Bantu seikhlasnya untuk server &amp; kopi
            </p>
          </div>
        </div>

        {/* Banner Pesan Hangat Apresiasi */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-slate-800 leading-relaxed">
          <p>
            Seikhlasnya aja bantu creator bayar server &amp; kopi agar Playfield tetap gratis &amp; online 24/7. ❤️
          </p>
        </div>

        {/* Kartu QRIS Resmi Creator Playfield */}
        <div className="flex flex-col items-center rounded-2xl border-3 border-black bg-white p-3.5 sm:p-4 shadow-[4px_4px_0px_#000] text-center">
          {/* Gambar QRIS Resmi */}
          <div className="relative w-full max-w-[270px] sm:max-w-[290px] rounded-xl overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000] bg-white group">
            <Image
              src="/qris creator.png"
              alt="QRIS Donasi Creator Playfield - PLAY FIELD MABAR APP, SOF"
              width={903}
              height={1036}
              priority
              className="w-full h-auto object-contain block"
            />
          </div>

          {/* Info Merchant Resmi */}
          <div className="mt-3 w-full flex flex-col items-center gap-0.5">
            <span className="text-xs sm:text-sm font-black uppercase text-black tracking-wide">
              PLAY FIELD MABAR APP, SOF
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600 bg-[#faf8f2] px-2 py-0.5 rounded border border-black/30">
              NMID: ID1025455702262
            </span>
          </div>

          {/* Tombol Simpan Gambar QRIS (UX Ramah Smartphone) */}
          <div className="mt-2.5 w-full flex items-center justify-center gap-2">
            <a
              href="/qris creator.png"
              download="QRIS-Playfield-Creator.png"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00] text-black border-2 border-black text-[11px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Simpan gambar QRIS ke galeri HP untuk di-scan lewat M-Banking"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Simpan Gambar QRIS</span>
            </a>
          </div>

          <p className="text-[10px] font-bold text-slate-500 mt-2 leading-tight">
            Scan via BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA, LinkAja, atau mobile banking apapun.
          </p>
        </div>

        {/* Alternatif Transfer Rekening / E-Wallet */}
        <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000] flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-slate-600 block">
            Atau Transfer Manual BCA:
          </span>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-black text-black">BCA: </span>
              <span className="font-mono font-black text-black text-sm">604-201-3010</span>
              <span className="text-[10px] text-slate-600 block">a.n Alexander (Creator Playfield)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("6042013010", "BCA")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ccff00] border-2 border-black font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              {copiedBank === "BCA" ? <Check className="h-3 w-3 stroke-[3]" /> : <Copy className="h-3 w-3" />}
              <span>{copiedBank === "BCA" ? "Disalin!" : "Salin No. Rek"}</span>
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
