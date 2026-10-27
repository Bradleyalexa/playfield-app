import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class SquashStrategy implements SportStrategy {
  sportType: SportType = "squash";
  displayName = "Squash";
  emoji = "💥";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "par_11",
        name: "Standar WSF PAR-11 (11 Poin)",
        targetPoints: 11,
        deuceType: "advantage",
        maxDeucePoints: 19,
        description:
          "Format resmi World Squash Federation: Point-A-Rally sampai 11 poin. Jika 10-10 (tiebreak/deuce), selisih 2 poin untuk menang.",
      },
      {
        id: "par_15",
        name: "Long Game PAR-15 (15 Poin)",
        targetPoints: 15,
        deuceType: "advantage",
        maxDeucePoints: 21,
        description:
          "Point-A-Rally hingga 15 poin untuk uji ketahanan stamina fisik dan reli dinding panjang.",
      },
      {
        id: "classic_9",
        name: "Klasik Hand-In (9 Poin)",
        targetPoints: 9,
        deuceType: "advantage",
        maxDeucePoints: 10,
        description:
          "Sistem tradisional: hanya server yang dapat menghasilkan skor. Game berakhir pada 9 poin (atau 10 jika memilih set two pada 8-8).",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "squash_ball",
      totalUsed: 0,
      costPerUnit: 45000,
      billingMode: "shared_all",
      pricingModel: "per_slop", // Box isi 3 bola Dunlop
      costPerSlop: 130000,
      unitsPerSlop: 3,
      slopUsed: 1,
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const target = config.targetPoints || 11;
    const maxDeuce = config.maxDeucePoints || (target === 11 ? 19 : 21);

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
