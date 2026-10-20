"use client";

import { useState } from "react";
import { X, Plus, Users, Shield, CheckCircle2, Trophy, Flame } from "lucide-react";
import { getTierLabel, Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";
import { Match } from "../../core/entities/match";

interface CreateCustomMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GameSession;
  onSaveCustomMatch: (newMatch: Match, assignToCourtImmediately: boolean) => void;
}

export function CreateCustomMatchModal({
  isOpen,
  onClose,
  session,
  onSaveCustomMatch,
}: CreateCustomMatchModalProps) {
  const [courtNumber, setCourtNumber] = useState<number>(1);
  const [roundNumber, setRoundNumber] = useState<number>(session.currentRound || 1);
  const [teamAPlayer1Id, setTeamAPlayer1Id] = useState<string>("");
  const [teamAPlayer2Id, setTeamAPlayer2Id] = useState<string>("");
  const [teamBPlayer1Id, setTeamBPlayer1Id] = useState<string>("");
  const [teamBPlayer2Id, setTeamBPlayer2Id] = useState<string>("");
  const [assignNow, setAssignNow] = useState<boolean>(true);

  if (!isOpen) return null;

  const activePlayers = session.players.filter((p) => p.status === "active");

  const playerA1 = session.players.find((p) => p.id === teamAPlayer1Id);
  const playerA2 = session.players.find((p) => p.id === teamAPlayer2Id);
  const playerB1 = session.players.find((p) => p.id === teamBPlayer1Id);
  const playerB2 = session.players.find((p) => p.id === teamBPlayer2Id);

  const selectedIds = new Set(
    [teamAPlayer1Id, teamAPlayer2Id, teamBPlayer1Id, teamBPlayer2Id].filter(Boolean)
  );

  const isFormValid =
    teamAPlayer1Id &&
    teamAPlayer2Id &&
    teamBPlayer1Id &&
    teamBPlayer2Id &&
    selectedIds.size === 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !playerA1 || !playerA2 || !playerB1 || !playerB2) {
      alert("Harap pilih 4 pemain yang berbeda untuk Tim A (2 orang) dan Tim B (2 orang)!");
      return;
    }

    const newMatch: Match = {
      id: `custom-match-r${roundNumber}-c${courtNumber}-${Date.now()}`,
      courtNumber,
      roundNumber,
      teamA: [playerA1, playerA2],
      teamB: [playerB1, playerB2],
      scoreA: 0,
      scoreB: 0,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      equipmentUsedCount: 1,
    };

    onSaveCustomMatch(newMatch, assignNow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-2xl bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 bg-white border-b-[3px] border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
              <Plus className="h-6 w-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
                Susun Pertandingan Manual (Custom Match)
              </h2>
              <p className="text-xs font-bold text-black/60">
                Pilih sendiri siapa berpasangan dengan siapa dan siapa lawan siapa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border-[2px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lapangan & Ronde Selector */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
            <div>
              <label className="block text-[11px] font-black uppercase text-black/70 mb-1">
                Pilih Lapangan
              </label>
              <select
                value={courtNumber}
                onChange={(e) => setCourtNumber(Number(e.target.value))}
                className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3 py-2 text-xs font-bold text-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                {Array.from({ length: session.courtCount }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>
                    Lapangan {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-black/70 mb-1">
                Untuk Ronde Ke-
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={roundNumber}
                onChange={(e) => setRoundNumber(Number(e.target.value))}
                className="w-full rounded-xl bg-[#faf8f2] border-2 border-black px-3 py-2 text-xs font-mono font-black text-black shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          {/* Grid Pemilihan Tim A & Tim B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tim A Box */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#f0fdf4] border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-emerald-300 border border-black self-start">
                TIM A (2 PEMAIN)
              </span>

              <div>
                <label className="block text-[10px] font-black uppercase text-black/60 mb-1">
                  Pemain 1 (Tim A)
                </label>
                <select
                  value={teamAPlayer1Id}
                  onChange={(e) => setTeamAPlayer1Id(e.target.value)}
                  className="w-full rounded-xl bg-white border-2 border-black px-2.5 py-2 text-xs font-bold text-black cursor-pointer"
                >
                  <option value="">-- Pilih Pemain 1 --</option>
                  {activePlayers.map((p) => {
                    const tier = getTierLabel(p.publicTier);
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={selectedIds.has(p.id) && teamAPlayer1Id !== p.id}
                      >
                        {p.name} ({p.gender === "M" ? "M" : "W"} - {tier.label.replace("Tier ", "")})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black/60 mb-1">
                  Pemain 2 (Tim A)
                </label>
                <select
                  value={teamAPlayer2Id}
                  onChange={(e) => setTeamAPlayer2Id(e.target.value)}
                  className="w-full rounded-xl bg-white border-2 border-black px-2.5 py-2 text-xs font-bold text-black cursor-pointer"
                >
                  <option value="">-- Pilih Pemain 2 --</option>
                  {activePlayers.map((p) => {
                    const tier = getTierLabel(p.publicTier);
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={selectedIds.has(p.id) && teamAPlayer2Id !== p.id}
                      >
                        {p.name} ({p.gender === "M" ? "M" : "W"} - {tier.label.replace("Tier ", "")})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Tim B Box */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#f0f9ff] border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-sky-300 border border-black self-start">
                TIM B (2 PEMAIN)
              </span>

              <div>
                <label className="block text-[10px] font-black uppercase text-black/60 mb-1">
                  Pemain 1 (Tim B)
                </label>
                <select
                  value={teamBPlayer1Id}
                  onChange={(e) => setTeamBPlayer1Id(e.target.value)}
                  className="w-full rounded-xl bg-white border-2 border-black px-2.5 py-2 text-xs font-bold text-black cursor-pointer"
                >
                  <option value="">-- Pilih Pemain 1 --</option>
                  {activePlayers.map((p) => {
                    const tier = getTierLabel(p.publicTier);
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={selectedIds.has(p.id) && teamBPlayer1Id !== p.id}
                      >
                        {p.name} ({p.gender === "M" ? "M" : "W"} - {tier.label.replace("Tier ", "")})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black/60 mb-1">
                  Pemain 2 (Tim B)
                </label>
                <select
                  value={teamBPlayer2Id}
                  onChange={(e) => setTeamBPlayer2Id(e.target.value)}
                  className="w-full rounded-xl bg-white border-2 border-black px-2.5 py-2 text-xs font-bold text-black cursor-pointer"
                >
                  <option value="">-- Pilih Pemain 2 --</option>
                  {activePlayers.map((p) => {
                    const tier = getTierLabel(p.publicTier);
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={selectedIds.has(p.id) && teamBPlayer2Id !== p.id}
                      >
                        {p.name} ({p.gender === "M" ? "M" : "W"} - {tier.label.replace("Tier ", "")})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Opsi Langsung Tampilkan di Lapangan Saat Ini */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white border-2 border-black text-xs font-bold">
            <input
              type="checkbox"
              id="assignNow"
              checked={assignNow}
              onChange={(e) => setAssignNow(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-black text-black cursor-pointer"
            />
            <label htmlFor="assignNow" className="cursor-pointer">
              Pasang langsung sebagai <strong>Pertandingan Aktif di Lapangan {courtNumber}</strong>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex items-center gap-1.5 rounded-xl bg-[#ccff00] px-5 py-2.5 text-xs font-black uppercase text-black border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
              <span>Jadwalkan Match Ini</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
