"use client";

import { useEffect, useState } from "react";
import { X, Volume2, Play, Check, Sliders, Sparkles } from "lucide-react";
import { AudioAnnouncer, AnnouncerSettings } from "../../services/audio/announcer";

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettingsModal({ isOpen, onClose }: AudioSettingsModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<AnnouncerSettings>({
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
    preset: "natural",
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Ambil setting tersimpan
    setSettings(AudioAnnouncer.getSettings());

    // Ambil daftar voice dari browser
    const loadVoices = () => {
      const vList = AudioAnnouncer.getAvailableVoices();
      setVoices(vList);
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: AnnouncerSettings["preset"]) => {
    let pitch = 1.0;
    let rate = 0.95;

    if (preset === "female") {
      pitch = 1.25;
      rate = 1.0;
    } else if (preset === "male") {
      pitch = 0.8;
      rate = 0.9;
    } else if (preset === "robot") {
      pitch = 0.65;
      rate = 0.85;
    } else {
      pitch = 1.0;
      rate = 0.95;
    }

    const updated = { ...settings, preset, pitch, rate };
    setSettings(updated);
    AudioAnnouncer.saveSettings(updated);
  };

  const handleSave = () => {
    AudioAnnouncer.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleTest = () => {
    AudioAnnouncer.saveSettings(settings);
    AudioAnnouncer.testVoice();
  };

  const idVoices = voices.filter((v) => v.lang.includes("id") || v.lang.includes("ID"));

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
          <div className="h-10 w-10 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Volume2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              Pilihan Suara Announcer
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Ganti karakter suara panggilan masuk lapangan & pemenang
            </p>
          </div>
        </div>

        {/* Preset Cepat Karakter Suara */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
            Pilih Karakter Suara:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset("female")}
              className={`p-2.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settings.preset === "female"
                  ? "bg-pink-200 text-pink-950 shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-pink-50 shadow-[1px_1px_0px_#000]"
              }`}
            >
              <span className="text-base">👧</span>
              <div className="text-left">
                <span className="block font-black">Suara Cewek</span>
                <span className="text-[10px] text-slate-600 font-bold">Nada Tinggi & Ceria</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("male")}
              className={`p-2.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settings.preset === "male"
                  ? "bg-blue-200 text-blue-950 shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-blue-50 shadow-[1px_1px_0px_#000]"
              }`}
            >
              <span className="text-base">👦</span>
              <div className="text-left">
                <span className="block font-black">Suara Cowok</span>
                <span className="text-[10px] text-slate-600 font-bold">Nada Berat & Wibawa</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("natural")}
              className={`p-2.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settings.preset === "natural"
                  ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-lime-50 shadow-[1px_1px_0px_#000]"
              }`}
            >
              <span className="text-base">🌿</span>
              <div className="text-left">
                <span className="block font-black">Natural Standar</span>
                <span className="text-[10px] text-slate-600 font-bold">Artikulasi Seimbang</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("robot")}
              className={`p-2.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settings.preset === "robot"
                  ? "bg-[#00e5ff] text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-cyan-50 shadow-[1px_1px_0px_#000]"
              }`}
            >
              <span className="text-base">🤖</span>
              <div className="text-left">
                <span className="block font-black">Wasit GOR</span>
                <span className="text-[10px] text-slate-600 font-bold">Khas Speaker Hall</span>
              </div>
            </button>
          </div>
        </div>

        {/* Pilihan Suara Browser (Voice Engine) */}
        {voices.length > 0 && (
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Voice Engine Perangkat:
            </label>
            <select
              value={settings.voiceURI || ""}
              onChange={(e) => {
                const updated = { ...settings, voiceURI: e.target.value };
                setSettings(updated);
                AudioAnnouncer.saveSettings(updated);
              }}
              className="w-full rounded-xl bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <option value="">Otomatis (Paling Cocok Bahasa Indonesia)</option>
              {idVoices.length > 0 && (
                <optgroup label="Bahasa Indonesia (Rekomendasi)">
                  {idVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      🇮🇩 {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Semua Suara yang Terpasang">
                {voices.slice(0, 15).map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {/* Slider Nada (Pitch) & Kecepatan (Speed) */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              <span>Nada Suara (Pitch): {settings.pitch}x</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {settings.pitch > 1.1 ? "Tinggi (Cewek)" : settings.pitch < 0.9 ? "Berat (Cowok)" : "Normal"}
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSettings((prev) => ({ ...prev, pitch: val, preset: "natural" }));
            }}
            className="accent-black cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs font-black pt-1 border-t border-slate-100">
            <span>Kecepatan Bicara (Speed): {settings.rate}x</span>
            <span className="text-[10px] font-bold text-slate-500">
              {settings.rate > 1.05 ? "Cepat" : settings.rate < 0.9 ? "Santai" : "Standar"}
            </span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={settings.rate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSettings((prev) => ({ ...prev, rate: val }));
            }}
            className="accent-black cursor-pointer"
          />
        </div>

        {/* Action Buttons: Tes Suara & Simpan */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleTest}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-black border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>🔊 Tes Suara</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] text-black border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {isSaved ? <Check className="h-4 w-4 stroke-[3]" /> : <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
            <span>{isSaved ? "Tersimpan!" : "Terapkan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
