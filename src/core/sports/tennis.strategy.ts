import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class TennisStrategy implements SportStrategy {
  sportType: SportType = "tennis";
  displayName = "Tennis";
  emoji = "🎾";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "pro_set_8",
        name: "Pro Set (8 Games)",
        targetPoints: 8,
        deuceType: "sudden_death_golden_point",
        description: "Bermain sampai 8 game No-Ad (Golden Point di 40-40). Ideal untuk mabar 2 jam.",
      },
      {
        id: "fast4",
        name: "Fast4 Tennis (4 Games)",
        targetPoints: 4,
        deuceType: "sudden_death_golden_point",
        description: "Set cepat ke 4 game. Tiebreak dimainkan pada skor 3-3.",
      },
      {
        id: "regular_6",
        name: "Regular Set (6 Games)",
        targetPoints: 6,
        deuceType: "advantage",
        description: "Set standar tenis hingga 6 game dengan sistem tiebreak pada 6-6.",
      },
      {
        id: "super_tiebreak_10",
        name: "Super Tiebreak (10 Poin)",
        targetPoints: 10,
        deuceType: "advantage",
        description: "Laga super singkat ke 10 poin selisih 2 jika sisa waktu lapangan tinggal sedikit.",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "ball_can",
      totalUsed: 0,
      costPerUnit: 25000,
      billingMode: "shared_all",
      pricingModel: "per_slop",
      costPerSlop: 85000,
      unitsPerSlop: 4,
      slopUsed: 1,
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const target = config.targetPoints || 8;

    if (scoreA >= target || scoreB >= target) {
      const diff = Math.abs(scoreA - scoreB);
      if (diff >= 2 || config.deuceType === "sudden_death_golden_point") {
        const winner = scoreA > scoreB ? "A" : "B";
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: `Match Selesai! Tim ${winner} Menang (${Math.max(scoreA, scoreB)} - ${Math.min(scoreA, scoreB)})`,
        };
      }
      return {
        isValid: true,
        isFinished: false,
        statusText: "Menuju tiebreak / selisih 2 game.",
      };
    }

    return {
      isValid: true,
      isFinished: false,
      statusText: "Game sedang berlangsung",
    };
  }

  formatScoreDisplay(scoreA: number, scoreB: number): string {
    return `${scoreA} - ${scoreB}`;
  }
}
