import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class BadmintonStrategy implements SportStrategy {
  sportType: SportType = "badminton";
  displayName = "Badminton";
  emoji = "🏸";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "rally_21",
        name: "Standar BWF (21 Poin)",
        targetPoints: 21,
        deuceType: "advantage",
        maxDeucePoints: 30,
        description: "Rally 21 poin. Jika 20-20, selisih 2 poin hingga maksimal 30 poin.",
      },
      {
        id: "fast_30",
        name: "Fast Match (30 Poin)",
        targetPoints: 30,
        deuceType: "sudden_death_golden_point",
        maxDeucePoints: 30,
        description: "1 Game ke 30 poin langsung selesai (pindah lapangan di 15). Sangat hemat waktu.",
      },
      {
        id: "casual_15",
        name: "Casual Short (15 Poin)",
        targetPoints: 15,
        deuceType: "advantage",
        maxDeucePoints: 21,
        description: "Game singkat 15 poin untuk pemanasan atau sisa waktu lapangan.",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "shuttlecock",
      totalUsed: 0,
      costPerUnit: 12000,
      billingMode: "shared_all",
      pricingModel: "per_unit",
      costPerSlop: 140000,
      unitsPerSlop: 12,
      slopUsed: 0,
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const target = config.targetPoints || 21;
    const maxDeuce = config.maxDeucePoints || 30;

    // Cek sudden death cap
    if (scoreA >= maxDeuce || scoreB >= maxDeuce) {
      const winner = scoreA > scoreB ? "A" : "B";
      return {
        isValid: true,
        isFinished: true,
        winner,
        statusText: `Selesai (Sudden Death ${maxDeuce} Poin)! Tim ${winner} Menang`,
      };
    }

    // Cek jika sudah mencapai target
    if (scoreA >= target || scoreB >= target) {
      const diff = Math.abs(scoreA - scoreB);
      if (diff >= 2 || config.deuceType === "sudden_death_golden_point") {
        const winner = scoreA > scoreB ? "A" : "B";
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: `Selesai! Tim ${winner} Menang (${Math.max(scoreA, scoreB)} - ${Math.min(scoreA, scoreB)})`,
        };
      }
      return {
        isValid: true,
        isFinished: false,
        statusText: "Deuce! Butuh selisih 2 poin untuk menang.",
      };
    }

    return {
      isValid: true,
      isFinished: false,
      statusText: "Pertandingan sedang berlangsung",
    };
  }

  formatScoreDisplay(scoreA: number, scoreB: number): string {
    return `${scoreA} - ${scoreB}`;
  }
}
