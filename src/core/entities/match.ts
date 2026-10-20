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
}

export interface Court {
  id: string;
  courtNumber: number;
  courtName: string;
  currentMatch?: Match;
}
