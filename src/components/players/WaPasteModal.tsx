"use client";

import { useState } from "react";
import { X, Clipboard, Check } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000]">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <Clipboard className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Smart WhatsApp List Parser
              </h3>
              <p className="text-xs font-bold text-slate-600">Paste chat absen grup WA Anda di bawah ini</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-black hover:bg-slate-100 border-2 border-black transition-colors"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span className="uppercase tracking-wider">Teks Chat WA</span>
            <button
              type="button"
              onClick={() => setRawText(sampleText)}
              className="bg-[#ccff00] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] font-black uppercase text-[10px] hover:bg-[#b8e600]"
            >
              Coba Contoh Teks
            </button>
          </div>
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Contoh:\n1. Hendra\n2. Budi (L)\n3. Siti (P - Beg)..."
            className="w-full rounded-xl bg-[#faf8f2] border-3 border-black p-3.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:bg-white shadow-[3px_3px_0px_#000] font-mono-sport"
          />
        </div>

        {/* Live Preview Hasil Deteksi */}
        <div className="mb-5 rounded-xl border-2 border-black bg-[#faf8f2] p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Hasil Deteksi ({parsed.length} Pemain):
            </span>
          </div>

          {parsed.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 italic">Belum ada nama terdeteksi. Silakan paste teks absen.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {parsed.map((p, idx) => {
                const tier = getTierLabel(getTierFromSkill(p.skillLevel));
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg bg-white border-2 border-black px-2.5 py-1 text-xs shadow-[2px_2px_0px_#000]"
                  >
                    <span className="font-extrabold text-black">{p.name}</span>
                    <span className="text-[10px] font-bold text-slate-600 font-mono-sport">({p.gender})</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded ${tier.badgeColor}`}>
                      {tier.label.replace("Tier ", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-black">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={parsed.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-[#ccff00] px-5 py-2 text-xs font-black text-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Masukkan {parsed.length} Pemain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
