import { Court, Match } from "./match";
import { Player } from "./player";

export type SportType = "badminton" | "tennis" | "padel";

export type SessionStatus = "active" | "completed" | "archived";

export interface EquipmentConfig {
  unitName: "shuttlecock" | "ball_can" | "padel_ball";
  totalUsed: number;
  costPerUnit: number;
  billingMode: "shared_all" | "per_match";
}

export interface SportConfig {
  rulePreset: string;
  targetPoints: number;
  deuceType: "advantage" | "sudden_death_golden_point";
  maxDeucePoints?: number;
  equipment: EquipmentConfig;
}

export interface GameSession {
  id: string;
  publicSlug: string;
  adminKey: string;
  title: string;
  sport: SportType;
  courtCount: number;
  status: SessionStatus;
  sportConfig: SportConfig;
  players: Player[];
  courts: Court[];
  matches: Match[];
  currentRound: number;
  sultanSponsor?: string;
  createdAt: string;
  updatedAt: string;
}
