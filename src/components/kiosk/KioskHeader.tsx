"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Volume2, VolumeX, Trophy, MapPin, ExternalLink } from "lucide-react";
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
    <div className="flex flex-col gap-4 pb-6 border-b-4 border-black">
      {/* Sultan Mode Banner jika aktif */}
      {session.sultanSponsor && (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-[#ffde00] border-4 border-black py-3 px-6 text-center shadow-[6px_6px_0px_#000]">
          <Sparkles className="h-5 w-5 text-black stroke-[3]" />
          <span className="text-sm sm:text-base font-black text-black tracking-wider uppercase">
            👑 Mabar Malam Ini Disponsori Penuh oleh {session.sultanSponsor}!
          </span>
          <Sparkles className="h-5 w-5 text-black stroke-[3]" />
        </div>
      )}

      {/* Main Bar Kiosk Neo-Brutalist */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-[#ccff00] border-3 border-black flex items-center justify-center text-black font-black shadow-[4px_4px_0px_#000]">
            <Trophy className="h-8 w-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              {session.title}
            </h1>
            <div className="flex items-center gap-2 text-xs font-black text-slate-700 font-mono-sport mt-1 uppercase">
              <span className="bg-black text-[#ccff00] px-2 py-0.5 rounded">{session.sport}</span>
              <span>•</span>
              <span>{session.courtCount} LAPANGAN AKTIF</span>
              <span>•</span>
              <span className="bg-[#ccff00] text-black px-2 py-0.5 rounded border border-black">
                RONDE #{session.currentRound}
              </span>
            </div>
            {session.courtLocation && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-1">
                <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>{session.courtLocation}</span>
                {session.googleMapsUrl && (
                  <a
                    href={session.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-200 border border-emerald-500 text-emerald-950 font-black text-[10px] uppercase"
                  >
                    <span>Maps</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Jam Digital & Tombol Audio */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 border-black transition-all shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              isAudioEnabled ? "bg-[#ccff00] text-black" : "bg-white text-slate-500"
            }`}
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4 stroke-[2.5]" /> : <VolumeX className="h-4 w-4 stroke-[2.5]" />}
            <span className="hidden sm:inline">{isAudioEnabled ? "Audio Nyala" : "Mute"}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-[#ffde00] border-3 border-black px-5 py-2.5 font-mono-sport text-base sm:text-lg font-black text-black shadow-[4px_4px_0px_#000]">
            <Clock className="h-5 w-5 stroke-[2.5]" />
            <span>{currentTime || "--:--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
