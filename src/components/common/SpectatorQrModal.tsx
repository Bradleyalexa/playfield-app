"use client";

import { useEffect, useState } from "react";
import { X, QrCode, Copy, Check, ExternalLink, Download, Radio, Users } from "lucide-react";
import QRCode from "qrcode";

interface SpectatorQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicSlug: string;
  sessionTitle: string;
  courtLocation?: string;
}

export function SpectatorQrModal({
  isOpen,
  onClose,
  publicSlug,
  sessionTitle,
  courtLocation,
}: SpectatorQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/live/${publicSlug}`;
      setLiveUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      })
        .then((dataUri) => {
          setQrDataUrl(dataUri);
        })
        .catch((err) => {
          console.error("Gagal generate QR Code:", err);
        });
    }
  }, [publicSlug, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `QR-Papan-Penonton-${publicSlug}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black bg-[#faf8f2] p-5 sm:p-6 shadow-[8px_8px_0px_#000] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black hover:bg-rose-500 hover:text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2.5 pr-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ccff00] border-2 border-black shadow-[2px_2px_0px_#000] text-xl shrink-0">
            <QrCode className="h-6 w-6 stroke-[2.5] text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-black truncate">
                QR Papan Penonton
              </h2>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-black text-[#ccff00] px-1.5 py-0.2 rounded border border-black font-mono shrink-0">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 line-clamp-1">
              {sessionTitle}
            </p>
          </div>
        </div>

        {/* Petunjuk Singkat */}
        <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-bold text-slate-700 leading-relaxed text-center sm:text-left">
          <p>
            📲 <strong>Scan pakai kamera smartphone:</strong> Pemain &amp; penonton langsung bisa memantau jadwal antrean, giliran main di lapangan, dan update skor tanpa perlu login.
          </p>
        </div>

        {/* Box Card QR Code Neo-Brutalist */}
        <div className="flex flex-col items-center rounded-2xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000] text-center">
          <div className="relative p-2.5 bg-white rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] mb-3">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR Code Papan Penonton ${publicSlug}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                Membuat QR Code...
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-800 bg-[#faf8f2] px-2.5 py-1 rounded-lg border border-black max-w-full truncate shadow-[1px_1px_0px_#000]">
            {liveUrl || `/live/${publicSlug}`}
          </span>
          {courtLocation && (
            <span className="text-[10px] font-bold text-slate-500 mt-1.5 truncate max-w-full">
              📍 {courtLocation}
            </span>
          )}
        </div>

        {/* Tombol Aksi Cepat: Salin, Buka Tab Baru, Download */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#ccff00] text-black font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all"
          >
            {isCopied ? <Check className="h-4 w-4 stroke-[3]" /> : <Copy className="h-4 w-4 stroke-[2.5]" />}
            <span>{isCopied ? "Link Tersalin!" : "Salin Link"}</span>
          </button>

          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center"
          >
            <ExternalLink className="h-4 w-4 stroke-[2.5]" />
            <span>Buka Web</span>
          </a>
        </div>

        {/* Tombol Simpan Gambar QR untuk Dicetak / Dikirim ke Grup WA */}
        <button
          type="button"
          onClick={handleDownloadQr}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all"
          title="Download gambar QR Code untuk diprint di meja registrasi GOR atau dikirim ke grup WA"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Simpan Gambar QR (Print / Kirim WA)</span>
        </button>

        {/* Tombol Tutup Modal */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-neutral-800 transition-all cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
