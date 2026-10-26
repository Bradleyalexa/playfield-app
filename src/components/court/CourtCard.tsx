"use client";

import { Volume2, CheckCircle2, Flame, FastForward, Plus, RefreshCw, Shuffle, AlertCircle } from "lucide-react";
import { Court, Match } from "../../core/entities/match";
import { Player, getTierLabel } from "../../core/entities/player";
import { SportConfig } from "../../core/entities/session";
import { SportRegistry } from "../../core/sports/sport-registry";
import { AudioAnnouncer } from "../../services/audio/announcer";

interface CourtCardProps {
  court: Court;
  match?: Match;
  sportConfig: SportConfig;
  sessionPlayers?: Player[];
  onUpdateScore: (courtNumber: number, scoreA: number, scoreB: number, winner?: "A" | "B") => void;
  onFinishMatch: (courtNumber: number) => void;
  onAddCockToMatch?: (courtNumber: number) => void;
  onNextRound?: () => void;
  onFinishAndNextRound?: (courtNumber: number) => void;
  onManualMatch?: (courtNumber: number) => void;
  onQuickSubstitute?: (courtNumber: number, targetPlayer: Player) => void;
  onReshuffleCourt?: (courtNumber: number) => void;
}

export function CourtCard({
  court,
  match,
  sportConfig,
  sessionPlayers,
  onUpdateScore,
  onFinishMatch,
  onAddCockToMatch,
  onNextRound,
  onFinishAndNextRound,
  onManualMatch,
  onQuickSubstitute,
  onReshuffleCourt,
}: CourtCardProps) {
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-3 border-dashed border-black bg-white/70 p-6 sm:p-8 text-center shadow-[4px_4px_0px_#000]">
        <div className="h-14 w-14 rounded-xl bg-black flex items-center justify-center text-[#ccff00] font-black text-xl mb-3 border-2 border-black shadow-[2px_2px_0px_#000]">
          #{court.courtNumber}
        </div>
        <h3 className="font-black text-black text-lg uppercase tracking-wide">{court.courtName}</h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-500 text-amber-900 text-[10px] font-mono font-black uppercase mt-2 shadow-[1px_1px_0px_#000]">
          <span>⏸️ LAPANGAN KOSONG</span>
        </span>
        <p className="text-xs font-bold text-slate-600 mt-2 max-w-xs">
          Match sebelumnya telah selesai. Panggil giliran pemain berikutnya atau susun match manual:
        </p>
        <div className="flex flex-wrap items-stretch justify-center gap-2 mt-4 w-full max-w-md">
          {onReshuffleCourt && (
            <button
              type="button"
              onClick={() => onReshuffleCourt(court.courtNumber)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#ccff00] text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer whitespace-nowrap"
              title="Kocok 4 pemain yang sudah hadir ke lapangan ini"
            >
              <Shuffle className="h-4 w-4 stroke-[3] shrink-0" />
              <span>Isi Lapangan Ini</span>
            </button>
          )}
          {onNextRound && (
            <button
              type="button"
              onClick={onNextRound}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer whitespace-nowrap"
            >
              <FastForward className="h-4 w-4 stroke-[3] shrink-0" />
              <span>Ronde Berikutnya</span>
            </button>
          )}
          {onManualMatch && (
            <button
              type="button"
              onClick={() => onManualMatch(court.courtNumber)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4 stroke-[3] shrink-0" />
              <span>Susun Manual</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Cek validasi skor menggunakan sport strategy
  const strategy = SportRegistry.getStrategy(
    sportConfig.equipment.unitName === "shuttlecock"
      ? "badminton"
      : sportConfig.equipment.unitName === "ball_can"
      ? "tennis"
      : "padel"
  );
  const validation = strategy.validateScore(match.scoreA, match.scoreB, sportConfig);

  const handleAnnounce = () => {
    AudioAnnouncer.announceMatch(court.courtNumber, match.teamA, match.teamB);
  };

  const getPlayerLive = (p: Player) => {
    const live = sessionPlayers?.find((sp) => sp.id === p.id);
    return live || p;
  };

  const teamALive = match.teamA.map(getPlayerLive);
  const teamBLive = match.teamB.map(getPlayerLive);
  const unarrivedPlayers = [...teamALive, ...teamBLive].filter((p) => p.isArrived === false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-3 border-black bg-white p-5 shadow-[6px_6px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_#000]">
      {/* Header Lapangan Neo-Brutalist */}
      <div className="flex items-center justify-between pb-3 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ccff00] text-sm font-black text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            #{court.courtNumber}
          </span>
          <div>
            <h3 className="text-sm font-black text-black tracking-wide uppercase">{court.courtName}</h3>
            <span className="text-[11px] font-bold text-slate-700 uppercase font-mono-sport">
              RONDE #{match.roundNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-950 text-[10px] font-mono font-black uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE</span>
          </div>

          <button
            onClick={handleAnnounce}
            title="Panggil via Bluetooth Speaker GOR"
            className="flex items-center gap-1.5 rounded-lg bg-black text-[#ccff00] px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Panggil</span>
          </button>
        </div>
      </div>

      {/* Banner Peringatan Pemain OTW / Belum Hadir di Lapangan Ini */}
      {unarrivedPlayers.length > 0 && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-amber-50 border-2 border-amber-500 shadow-[2px_2px_0px_#000] my-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>⚠️ {unarrivedPlayers.length} Pemain Belum Tiba / Masih OTW</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800">
              Cegah Lapangan Nganggur
            </span>
          </div>
          <p className="text-[11px] text-amber-900 font-bold leading-tight">
            Pemain: <span className="underline">{unarrivedPlayers.map((p) => p.name).join(", ")}</span> belum check-in di lokasi. Ganti pemain atau kocok ulang lapangan ini agar match segera main:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {unarrivedPlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onQuickSubstitute?.(court.courtNumber, p)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title={`Ganti ${p.name} dengan pemain hadir`}
              >
                <RefreshCw className="h-3 w-3 stroke-[2.5]" />
                <span>Ganti {p.name}</span>
              </button>
            ))}
            {onReshuffleCourt && (
              <button
                type="button"
                onClick={() => onReshuffleCourt(court.courtNumber)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black border-2 border-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Kocok ulang pemain hadir untuk lapangan ini saja"
              >
                <Shuffle className="h-3 w-3 stroke-[2.5]" />
                <span>Kocok Lapangan Ini</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Tim: Duel Lapangan */}
      <div className="grid grid-cols-2 gap-3.5 my-4">
        {/* Tim A */}
        <div className="flex flex-col rounded-xl bg-[#e6fffa] border-2 border-black p-2.5 sm:p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#ccff00] px-1.5 py-0.5 rounded border border-black">
              TIM A
            </span>
            <span className="text-[10px] font-bold text-slate-600">Sisi Kiri</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {teamALive.map((p) => {
              const tier = getTierLabel(p.publicTier);
              const isLate = p.isArrived === false;
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`font-extrabold truncate ${isLate ? "text-amber-900" : "text-black"}`}>
                      {p.name}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                        p.gender === "M"
                          ? "bg-blue-100 text-blue-900 border-blue-400"
                          : "bg-pink-100 text-pink-900 border-pink-400"
                      }`}
                    >
                      {p.gender === "M" ? "M" : "W"}
                    </span>
                    {isLate && (
                      <span className="text-[8px] font-mono font-black px-1 py-0.2 rounded border bg-amber-200 text-amber-950 border-amber-500 animate-pulse">
                        ⏳ OTW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${tier.badgeColor}`}>
                      {tier.label.replace("Tier ", "")}
                    </span>
                    {onQuickSubstitute && (
                      <button
                        type="button"
                        onClick={() => onQuickSubstitute(court.courtNumber, p)}
                        className="p-1 rounded bg-white hover:bg-amber-100 border border-black/40 text-slate-700 hover:text-black cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        title={`Ganti ${p.name}`}
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skor Tim A (Bisa Ditik Langsung & Tombol +/-) */}
          <div className="flex items-center justify-center sm:justify-between pt-2 border-t-2 border-black gap-1 sm:gap-1.5 -translate-x-1 sm:translate-x-0">
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, Math.max(0, match.scoreA - 1), match.scoreB)}
              className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-lg bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 flex items-center justify-center"
              title="Kurang 1 Poin"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="99"
              value={match.scoreA}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateScore(court.courtNumber, val, match.scoreB);
              }}
              className="w-13 sm:w-20 text-center text-2xl sm:text-4xl font-black text-black font-mono-sport tracking-tight bg-white border-2 border-black rounded-lg py-0.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000]"
              title="Ketik angka skor langsung atau gunakan tombol +/-"
            />
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA + 1, match.scoreB)}
              className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-lg bg-[#ccff00] text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 flex items-center justify-center"
              title="Tambah 1 Poin"
            >
              +
            </button>
          </div>
        </div>

        {/* Tim B */}
        <div className="flex flex-col rounded-xl bg-[#eff6ff] border-2 border-black p-2.5 sm:p-3.5 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#7dd3fc] px-1.5 py-0.5 rounded border border-black">
              TIM B
            </span>
            <span className="text-[10px] font-bold text-slate-600">Sisi Kanan</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-3 flex-1">
            {teamBLive.map((p) => {
              const tier = getTierLabel(p.publicTier);
              const isLate = p.isArrived === false;
              return (
                <div key={p.id} className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`font-extrabold truncate ${isLate ? "text-amber-900" : "text-black"}`}>
                      {p.name}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border ${
                        p.gender === "M"
                          ? "bg-blue-100 text-blue-900 border-blue-400"
                          : "bg-pink-100 text-pink-900 border-pink-400"
                      }`}
                    >
                      {p.gender === "M" ? "M" : "W"}
                    </span>
                    {isLate && (
                      <span className="text-[8px] font-mono font-black px-1 py-0.2 rounded border bg-amber-200 text-amber-950 border-amber-500 animate-pulse">
                        ⏳ OTW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${tier.badgeColor}`}>
                      {tier.label.replace("Tier ", "")}
                    </span>
                    {onQuickSubstitute && (
                      <button
                        type="button"
                        onClick={() => onQuickSubstitute(court.courtNumber, p)}
                        className="p-1 rounded bg-white hover:bg-amber-100 border border-black/40 text-slate-700 hover:text-black cursor-pointer shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        title={`Ganti ${p.name}`}
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skor Tim B (Bisa Ditik Langsung & Tombol +/-) */}
          <div className="flex items-center justify-center sm:justify-between pt-2 border-t-2 border-black gap-1 sm:gap-1.5 -translate-x-1 sm:translate-x-0">
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, Math.max(0, match.scoreB - 1))}
              className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-lg bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 flex items-center justify-center"
              title="Kurang 1 Poin"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="99"
              value={match.scoreB}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                onUpdateScore(court.courtNumber, match.scoreA, val);
              }}
              className="w-13 sm:w-20 text-center text-2xl sm:text-4xl font-black text-black font-mono-sport tracking-tight bg-white border-2 border-black rounded-lg py-0.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000]"
              title="Ketik angka skor langsung atau gunakan tombol +/-"
            />
            <button
              type="button"
              onClick={() => onUpdateScore(court.courtNumber, match.scoreA, match.scoreB + 1)}
              className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-lg bg-[#7dd3fc] text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#38bdf8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 flex items-center justify-center"
              title="Tambah 1 Poin"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Shortcut Cepat Pemenang (1-Klik Cepat Jika Host Malas Ketik Angka di HP) */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <button
          type="button"
          onClick={() => {
            const nextWinner = match.winner === "A" ? undefined : "A";
            onUpdateScore(court.courtNumber, match.scoreA, match.scoreB, nextWinner);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer truncate ${
            match.winner === "A" || (match.scoreA > match.scoreB && !match.winner)
              ? "bg-[#ccff00] text-black shadow-[2px_2px_0px_#000]"
              : "bg-white hover:bg-emerald-50 text-slate-800"
          }`}
          title="Klik cepat: Tandai Tim A Menang (Bisa tanpa input skor)"
        >
          👑 Tim A Menang
        </button>
        <button
          type="button"
          onClick={() => {
            const nextWinner = match.winner === "B" ? undefined : "B";
            onUpdateScore(court.courtNumber, match.scoreA, match.scoreB, nextWinner);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer truncate ${
            match.winner === "B" || (match.scoreB > match.scoreA && !match.winner)
              ? "bg-[#7dd3fc] text-black shadow-[2px_2px_0px_#000]"
              : "bg-white hover:bg-sky-50 text-slate-800"
          }`}
          title="Klik cepat: Tandai Tim B Menang (Bisa tanpa input skor)"
        >
          👑 Tim B Menang
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#faf8f2] border-2 border-black mb-3">
        <span className="font-bold text-slate-800 text-[11px] truncate uppercase">
          {match.winner
            ? `👑 Tim ${match.winner} Ditandai Pemenang`
            : match.scoreA === 0 && match.scoreB === 0
            ? "⚡ Sedang Bertanding (Skor Opsional)"
            : validation.statusText}
        </span>
        {(validation.isFinished || match.winner) && (
          <span className="flex items-center gap-1 font-black text-black text-[11px] bg-[#ccff00] px-2 py-0.5 rounded border border-black">
            <CheckCircle2 className="h-3 w-3 stroke-[3]" />
            SELESAI
          </span>
        )}
      </div>

      {/* Tombol Aksi Lapangan */}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        {onAddCockToMatch && sportConfig.equipment.enabled !== false && (
          <button
            onClick={() => onAddCockToMatch(court.courtNumber)}
            title="Tambah pemakaian shuttlecock untuk match ini"
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-[#ffde00] py-2 text-xs font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5 fill-black" />
            <span>
              +1 {sportConfig.equipment.unitName === "shuttlecock" ? "Cock" : "Ball"} (
              {match.equipmentUsedCount || 1})
            </span>
          </button>
        )}

        <button
          onClick={() => onFinishMatch(court.courtNumber)}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          title="Selesaikan match di lapangan ini saja (status jadi kosong menunggu ronde berikutnya)"
        >
          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Selesai Saja</span>
        </button>

        {onFinishAndNextRound && (
          <button
            onClick={() => onFinishAndNextRound(court.courtNumber)}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Selesaikan match ini dan langsung putar ronde berikutnya"
          >
            <FastForward className="h-3.5 w-3.5 stroke-[3]" />
            <span>Selesai & Next ⏩</span>
          </button>
        )}
      </div>
    </div>
  );
}
