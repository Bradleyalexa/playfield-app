import { Player } from "./player";

export type MatchStatus = "queued" | "in_progress" | "completed";

export interface Match {
  id: string;
  courtNumber: number;
  roundNumber: number;
  teamA: Player[];
  teamB: Player[];
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  startedAt?: string;
  endedAt?: string;
  equipmentUsedCount?: number;
  winner?: "A" | "B" | "draw";
}

/**
 * Helper untuk menentukan pemenang pertandingan:
 * 1. Cek explicit flag match.winner ('A' | 'B' | 'draw')
 * 2. Cek perbandingan score (scoreA vs scoreB jika salah satu lebih tinggi)
 * 3. Jika skor 0-0 dan belum ada winner yang dipilih -> return null (tanpa pemenang / belum ada skor)
 */
export function getMatchWinner(match: {
  scoreA: number;
  scoreB: number;
  winner?: "A" | "B" | "draw";
}): "A" | "B" | "draw" | null {
  if (match.winner) return match.winner;
  if (match.scoreA > match.scoreB) return "A";
  if (match.scoreB > match.scoreA) return "B";
  if (match.scoreA > 0 && match.scoreA === match.scoreB) return "draw";
  return null;
}

export interface Court {
  id: string;
  courtNumber: number;
  courtName: string;
  currentMatch?: Match;
}

