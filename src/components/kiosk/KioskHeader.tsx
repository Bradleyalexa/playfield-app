"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Volume2, VolumeX, Trophy, MapPin, ExternalLink, Timer } from "lucide-react";
import { GameSession } from "../../core/entities/session";

interface KioskHeaderProps {
  session: GameSession;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export function KioskHeader({ session, isAudioEnabled, onToggleAudio }: KioskHeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [rentalInfo, setRentalInfo] = useState<{
    status: "UPCOMING" | "IN_PROGRESS" | "OVERTIME";
    label: string;
    formattedTime: string;
    bgClass: string;
    textClass: string;
  }>({
    status: "IN_PROGRESS",
    label: "Sisa Sewa",
    formattedTime: "--:--:--",
    bgClass: "bg-[#ccff00]",
    textClass: "text-black",
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Hitung Sisa Waktu Sewa Lapangan
      try {
        const [h, m] = (session.startTime || "19:00").split(":").map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);

        const durationMs = (session.durationHours || 2) * 3600 * 1000;
        const end = new Date(start.getTime() + durationMs);

        const nowMs = now.getTime();
        const startMs = start.getTime();
        const endMs = end.getTime();

        const formatDiff = (diffMs: number) => {
          const totalSec = Math.max(0, Math.floor(diffMs / 1000));
          const hours = Math.floor(totalSec / 3600);
          const minutes = Math.floor((totalSec % 3600) / 60);
          const seconds = totalSec % 60;
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        };

        if (nowMs < startMs) {
          // Belum masuk jam mulai sewa
          setRentalInfo({
            status: "UPCOMING",
            label: "Mulai dlm",
            formattedTime: formatDiff(startMs - nowMs),
            bgClass: "bg-[#00e5ff]",
            textClass: "text-black",
          });
        } else if (nowMs <= endMs) {
          // Sedang dalam jam sewa
          setRentalInfo({
            status: "IN_PROGRESS",
            label: "Sisa Sewa",
            formattedTime: formatDiff(endMs - nowMs),
            bgClass: "bg-[#ccff00]",
            textClass: "text-black",
          });
        } else {
          // Waktu sewa lapangan sudah habis (Overtime)
          setRentalInfo({
            status: "OVERTIME",
            label: "Overtime",
            formattedTime: `+${formatDiff(nowMs - endMs)}`,
            bgClass: "bg-[#ff0055]",
            textClass: "text-white animate-pulse",
          });
        }
      } catch (err) {
        console.error("Error calculating rental time:", err);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session.startTime, session.durationHours]);

  return (
    <div className="flex flex-col gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b-2 sm:border-b-3 border-black shrink-0">
      {/* Sultan Mode Banner jika aktif */}
      {session.sultanSponsor && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#ffde00] border-2 border-black py-1 px-3 text-center shadow-[2px_2px_0px_#000]">
          <Sparkles className="h-4 w-4 text-black stroke-[3]" />
          <span className="text-xs font-black text-black tracking-wider uppercase truncate">
            👑 Mabar Disponsori oleh {session.sultanSponsor}!
          </span>
          <Sparkles className="h-4 w-4 text-black stroke-[3]" />
        </div>
      )}

      {/* Bar Utama Kiosk: Baris 1 (Identitas & Audio) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-[#ccff00] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000] shrink-0">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-2xl font-black text-black tracking-tight uppercase truncate">
              {session.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-700 font-mono-sport uppercase">
              <span className="bg-black text-[#ccff00] px-1.5 py-0.2 rounded font-mono">{session.sport}</span>
              <span>•</span>
              <span>{session.courtCount} LAPANGAN</span>
              <span>•</span>
              <span className="bg-[#ccff00] text-black px-1.5 py-0.2 rounded border border-black">
                RONDE #{session.currentRound}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1 rounded-xl px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0 cursor-pointer ${
            isAudioEnabled ? "bg-[#ccff00] text-black" : "bg-white text-slate-500"
          }`}
          title={isAudioEnabled ? "Matikan Suara Pengumuman" : "Nyalakan Suara Pengumuman"}
        >
          {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" /> : <VolumeX className="h-3.5 w-3.5 stroke-[2.5]" />}
          <span className="hidden sm:inline">{isAudioEnabled ? "Audio On" : "Mute"}</span>
        </button>
      </div>

      {/* Baris 2: Digital Clock & Waktu Sewa Lapangan (Responsif Tanpa Overflow) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Info Lokasi GOR jika ada */}
        {session.courtLocation ? (
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 truncate max-w-[160px] sm:max-w-xs">
            <MapPin className="h-3 w-3 text-rose-600 shrink-0" />
            <span className="truncate">{session.courtLocation}</span>
            {session.googleMapsUrl && (
              <a
                href={session.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-emerald-100 border border-emerald-400 text-emerald-950 font-black text-[9px] uppercase"
              >
                <span>Maps</span>
                <ExternalLink className="h-2 w-2" />
              </a>
            )}
          </div>
        ) : (
          <div className="text-[11px] font-bold text-slate-500">
            Jadwal: {session.startTime} ({session.durationHours} Jam)
          </div>
        )}

        {/* Indikator Waktu: Jam Sekarang + Sisa Sewa */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Jam Dinding Sekarang */}
          <div className="flex items-center gap-1 rounded-lg bg-[#ffde00] border-2 border-black px-2 sm:px-3 py-1 font-mono-sport text-[11px] sm:text-xs font-black text-black shadow-[2px_2px_0px_#000]">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
            <span>{currentTime || "--:--:--"}</span>
          </div>

          {/* Sisa Waktu Sewa Lapangan */}
          <div
            className={`flex items-center gap-1 rounded-lg ${rentalInfo.bgClass} ${rentalInfo.textClass} border-2 border-black px-2 sm:px-3 py-1 font-mono-sport text-[11px] sm:text-xs font-black shadow-[2px_2px_0px_#000]`}
            title={`Hitungan waktu sewa: Mulai ${session.startTime} selama ${session.durationHours} jam`}
          >
            <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline uppercase text-[9px] font-sans font-bold">{rentalInfo.label}:</span>
            <span>{rentalInfo.formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
