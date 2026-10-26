"use client";

import { useState } from "react";
import { X, Clipboard, Check, Users } from "lucide-react";
import { getTierFromSkill, getTierLabel, Player, SkillLevel } from "../../core/entities/player";
import { createPlayersFromParsed, parseWhatsAppList } from "../../core/matchmaking/wa-parser";

interface WaPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPlayers: (newPlayers: Player[]) => void;
}

export function WaPasteModal({ isOpen, onClose, onImportPlayers }: WaPasteModalProps) {
  const [rawText, setRawText] = useState("");
  const [overrideGenders, setOverrideGenders] = useState<Record<number, "M" | "F">>({});
  const [overrideSkills, setOverrideSkills] = useState<Record<number, SkillLevel>>({});
  const [markAsArrived, setMarkAsArrived] = useState(true);

  const baseParsed = parseWhatsAppList(rawText);
  const parsed = baseParsed.map((p, idx) => ({
    ...p,
    gender: overrideGenders[idx] !== undefined ? overrideGenders[idx] : p.gender,
    skillLevel: overrideSkills[idx] !== undefined ? overrideSkills[idx] : p.skillLevel,
  }));

  if (!isOpen) return null;

  const toggleGender = (idx: number) => {
    const current = parsed[idx].gender;
    setOverrideGenders((prev) => ({
      ...prev,
      [idx]: current === "M" ? "F" : "M",
    }));
  };

  const cycleSkill = (idx: number) => {
    const current = parsed[idx].skillLevel;
    const next = (current === 5 ? 1 : current + 1) as SkillLevel;
    setOverrideSkills((prev) => ({
      ...prev,
      [idx]: next,
    }));
  };

  const handleImport = () => {
    if (parsed.length === 0) return;
    const players = createPlayersFromParsed(parsed, markAsArrived);
    onImportPlayers(players);
    setRawText("");
    setOverrideGenders({});
    setOverrideSkills({});
    onClose();
  };

  const sampleText = `Absen Mabar Badminton Rabu GOR Tomang:
1. Hendra Setiawan (Pro)
2. Kevin Sanjaya [Pro - M]
3. Siti Rahmawati (Beg - W)
4. Budi Santoso (Inter)
5. Rian Ardianto (Adv - M)
6. Dewi Lestari (Newbie - W)
7. Fajar Alfian (Pro)
8. Agus Pratama (Inter)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000]">
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
              <p className="text-xs font-bold text-slate-600">
                Deteksi otomatis nama, jenis kelamin (M/W), dan tier keahlian
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-black hover:bg-slate-100 border-2 border-black transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span className="uppercase tracking-wider">Teks Chat Grup WA</span>
            <button
              type="button"
              onClick={() => {
                setRawText(sampleText);
                setOverrideGenders({});
              }}
              className="bg-[#ccff00] text-black px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] font-black uppercase text-[10px] hover:bg-[#b8e600] cursor-pointer"
            >
              Coba Contoh Teks
            </button>
          </div>
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setOverrideGenders({});
            }}
            placeholder="Contoh:\n1. Hendra\n2. Budi (L)\n3. Siti (P - Beg)..."
            className="w-full rounded-xl bg-[#faf8f2] border-3 border-black p-3.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:bg-white shadow-[3px_3px_0px_#000] font-mono"
          />
        </div>

        {/* Live Preview Hasil Deteksi */}
        <div className="mb-5 rounded-xl border-2 border-black bg-[#faf8f2] p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Hasil Deteksi ({parsed.length} Pemain):
            </span>
            <span className="text-[10px] font-bold text-black/60">
              💡 Klik M/W untuk ubah gender • Klik Level untuk ubah skill
            </span>
          </div>

          {parsed.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 italic">
              Belum ada nama terdeteksi. Silakan paste teks list absen mabar dari WhatsApp.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {parsed.map((p, idx) => {
                const tier = getTierLabel(getTierFromSkill(p.skillLevel));
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg bg-white border-2 border-black px-2.5 py-1 text-xs shadow-[2px_2px_0px_#000]"
                  >
                    <span className="font-extrabold text-black">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleGender(idx)}
                      title="Klik untuk ubah gender Men (M) / Women (W)"
                      className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border cursor-pointer ${
                        p.gender === "M"
                          ? "bg-blue-100 text-blue-900 border-blue-400"
                          : "bg-pink-100 text-pink-900 border-pink-400"
                      }`}
                    >
                      {p.gender === "M" ? "M" : "W"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cycleSkill(idx)}
                      title={`Klik untuk ubah skill ${p.name}: saat ini ${tier.label} (Newbie → Beg → Inter → Adv → Pro)`}
                      className={`text-[9px] px-1.5 py-0.2 rounded border border-black cursor-pointer shadow-[1px_1px_0px_#000] active:scale-95 ${tier.badgeColor}`}
                    >
                      {tier.label.replace("Tier ", "")} ▾
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Check-in Toggle */}
        <div className="flex items-center justify-between mb-4 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border-2 border-black shadow-[2px_2px_0px_#000]">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={markAsArrived}
              onChange={(e) => setMarkAsArrived(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-black accent-black cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-black text-black">
                Tandai Pemain Sudah Tiba di Lokasi (Check-in)
              </span>
              <span className="text-[10px] font-bold text-slate-600">
                {markAsArrived
                  ? "Pemain langsung aktif & masuk jadwal rotasi ronde pertama"
                  : "Pemain ditandai Belum Datang (OTW) & ditahan sampai tiba di GOR"}
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-black">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={parsed.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-[#ccff00] px-5 py-2 text-xs font-black text-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Masukkan {parsed.length} Pemain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
