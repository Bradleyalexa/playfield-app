"use client";

import { useState } from "react";
import { X, Clipboard, Check, AlertCircle } from "lucide-react";
import { getTierFromSkill, getTierLabel, Player } from "../../core/entities/player";
import { createPlayersFromParsed, parseWhatsAppList } from "../../core/matchmaking/wa-parser";

interface WaPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPlayers: (newPlayers: Player[]) => void;
}

export function WaPasteModal({ isOpen, onClose, onImportPlayers }: WaPasteModalProps) {
  const [rawText, setRawText] = useState("");
  const parsed = parseWhatsAppList(rawText);

  if (!isOpen) return null;

  const handleImport = () => {
    if (parsed.length === 0) return;
    const players = createPlayersFromParsed(parsed);
    onImportPlayers(players);
    setRawText("");
    onClose();
  };

  const sampleText = `Absen Mabar Badminton Rabu GOR Tomang:\n1. Hendra Setiawan (Pro)\n2. Kevin Sanjaya [Pro - L]\n3. Siti Rahmawati (Beg - Putri) - Lunas\n4. Budi Santoso (Inter)\n5. Rian Ardianto\n6. Dewi Lestari (Beg)\n7. Fajar Alfian (Inter)\n8. Agus Pratama (Hore)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Clipboard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart WhatsApp List Parser</h3>
              <p className="text-xs text-slate-400">Paste chat absen grup WA Anda di bawah ini</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Teks Chat WA</span>
            <button
              type="button"
              onClick={() => setRawText(sampleText)}
              className="text-emerald-400 hover:underline font-mono"
            >
              Coba Contoh Teks
            </button>
          </div>
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Contoh:\n1. Hendra\n2. Budi (L)\n3. Siti (P - Beg)..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Live Preview Hasil Deteksi */}
        <div className="mb-5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              Hasil Deteksi ({parsed.length} Pemain Ditemukan):
            </span>
          </div>

          {parsed.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada nama terdeteksi. Silakan paste teks absen.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {parsed.map((p, idx) => {
                const tier = getTierLabel(getTierFromSkill(p.skillLevel));
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 text-xs"
                  >
                    <span className="font-medium text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({p.gender})</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded border ${tier.badgeColor}`}>
                      {tier.label.replace("Tier ", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={parsed.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Masukkan {parsed.length} Pemain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
