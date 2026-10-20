import { EquipmentConfig, SportConfig, SportType } from "../entities/session";

export interface ScoringPreset {
  id: string;
  name: string;
  targetPoints: number;
  deuceType: "advantage" | "sudden_death_golden_point";
  maxDeucePoints?: number;
  description: string;
}

export interface ScoreValidationResult {
  isValid: boolean;
  isFinished: boolean;
  winner?: "A" | "B";
  statusText: string;
}

export interface SportStrategy {
  sportType: SportType;
  displayName: string;
  emoji: string;
  getPresets(): ScoringPreset[];
  getDefaultEquipment(): EquipmentConfig;
  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult;
  formatScoreDisplay(scoreA: number, scoreB: number): string;
}
