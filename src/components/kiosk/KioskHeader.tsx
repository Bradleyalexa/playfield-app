"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Volume2, VolumeX, Trophy } from "lucide-react";
import { GameSession } from "../../core/entities/session";

interface KioskHeaderProps {
  session: GameSession;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export function KioskHeader({ session, isAudioEnabled, onToggleAudio }: KioskHeaderProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-slate-800">
      {/* Sultan Mode Banner jika aktif */}
      {session.sultanSponsor && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-500/40 py-2.5 px-4 text-center animate-pulse">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-wide uppercase">
            👑 Mabar Malam Ini Disponsori Penuh oleh {session.sultanSponsor}!
          </span>
          <Sparkles className="h-4 w-4 text-amber-400" />
        </div>
      )}

      {/* Main Bar Kiosk */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {session.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>{session.sport.toUpperCase()}</span>
              <span>•</span>
              <span>{session.courtCount} LAPANGAN AKTIF</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">RONDE {session.currentRound}</span>
            </div>
          </div>
        </div>

        {/* Jam Digital & Tombol Audio */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
              isAudioEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{isAudioEnabled ? "Audio Nyala" : "Mute"}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2 font-mono text-sm sm:text-base font-bold text-white shadow-inner">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>{currentTime || "--:--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
