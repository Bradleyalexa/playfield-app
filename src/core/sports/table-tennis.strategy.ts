import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class TableTennisStrategy implements SportStrategy {
  sportType: SportType = "table_tennis";
  displayName = "Tenis Meja";
  emoji = "🏓";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "ittf_11",
        name: "Standar ITTF (11 Poin)",
        targetPoints: 11,
        deuceType: "advantage",
        maxDeucePoints: 21,
        description:
          "Rally 11 poin resmi ITTF. Pindah servis tiap 2 poin. Jika 10-10 (deuce), selisih 2 poin dan servis bergantian tiap 1 poin.",
      },
      {
        id: "classic_21",
        name: "Klasik Komunitas (21 Poin)",
        targetPoints: 21,
        deuceType: "advantage",
        maxDeucePoints: 30,
        description:
          "Format klasik 21 poin. Pindah servis tiap 5 poin. Deuce pada 20-20 mencari selisih 2 poin. Favorit mabar santai & pos ronda.",
      },
      {
        id: "fast_7",
        name: "Fast Match (7 Poin Sudden Death)",
        targetPoints: 7,
        deuceType: "sudden_death_golden_point",
        maxDeucePoints: 7,
        description:
          "Laga kilat 7 poin langsung selesai tanpa deuce untuk rotasi meja super cepat saat antrean banyak.",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "table_tennis_ball",
      totalUsed: 0,
      costPerUnit: 10000,
      billingMode: "shared_all",
      pricingModel: "per_slop", // Box isi 6 bola
      costPerSlop: 50000,
      unitsPerSlop: 6,
      slopUsed: 1,
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const target = config.targetPoints || 11;
    const maxDeuce = config.maxDeucePoints || (target === 11 ? 21 : 30);

    if (scoreA >= maxDeuce || scoreB >= maxDeuce) {
      const winner = scoreA > scoreB ? "A" : "B";
      return {
        isValid: true,
        isFinished: true,
        winner,
        statusText: `Selesai (Sudden Death ${maxDeuce} Poin)! Tim ${winner} Menang`,
      };
    }

    if (scoreA >= target || scoreB >= target) {
      const diff = Math.abs(scoreA - scoreB);
      if (diff >= 2 || config.deuceType === "sudden_death_golden_point") {
        const winner = scoreA > scoreB ? "A" : "B";
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: `Game Selesai! Tim ${winner} Menang (${Math.max(scoreA, scoreB)} - ${Math.min(scoreA, scoreB)})`,
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
      statusText: "Game sedang berlangsung",
    };
  }

  formatScoreDisplay(scoreA: number, scoreB: number): string {
    return `${scoreA} - ${scoreB}`;
  }
}
