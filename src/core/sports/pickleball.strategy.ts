import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class PickleballStrategy implements SportStrategy {
  sportType: SportType = "pickleball";
  displayName = "Pickleball";
  emoji = "🥒";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "rally_15",
        name: "Rally Scoring (15 Poin)",
        targetPoints: 15,
        deuceType: "advantage",
        maxDeucePoints: 21,
        description:
          "Sistem rally modern (setiap reli menghasilkan poin). Target 15 poin, selisih 2 poin. Format mabar paling efisien waktu.",
      },
      {
        id: "sideout_11",
        name: "Standar IPF / USAP (11 Poin Side-Out)",
        targetPoints: 11,
        deuceType: "advantage",
        maxDeucePoints: 15,
        description:
          "Aturan resmi turnamen: hanya tim yang memegang servis yang dapat mencetak poin (side-out). Target 11 poin, selisih 2 poin.",
      },
      {
        id: "rally_21",
        name: "Rally Match (21 Poin)",
        targetPoints: 21,
        deuceType: "advantage",
        maxDeucePoints: 30,
        description:
          "Target 21 poin rally scoring (seperti bulutangkis) untuk duel ganda berdurasi penuh.",
      },
      {
        id: "americano_24",
        name: "Americano Pickleball (24 Poin Total)",
        targetPoints: 24,
        deuceType: "sudden_death_golden_point",
        description:
          "Format turnamen mini: total skor kedua tim harus 24 poin (misal 13-11). Poin individu diakumulasikan ke klasemen.",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "pickleball_ball",
      totalUsed: 0,
      costPerUnit: 35000,
      billingMode: "shared_all",
      pricingModel: "per_slop", // Tube isi 3 bola
      costPerSlop: 105000,
      unitsPerSlop: 3,
      slopUsed: 1,
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const isAmericano = config.rulePreset.startsWith("americano");

    if (isAmericano) {
      const totalTarget = config.targetPoints || 24;
      const currentTotal = scoreA + scoreB;

      if (currentTotal >= totalTarget) {
        const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : undefined;
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: winner
            ? `Americano Selesai! Tim ${winner} Menang (${scoreA} - ${scoreB})`
            : `Americano Selesai! Seri (${scoreA} - ${scoreB})`,
        };
      }

      return {
        isValid: true,
        isFinished: false,
        statusText: `Americano Berjalan: Total ${currentTotal} dari ${totalTarget} poin`,
      };
    }

    const target = config.targetPoints || 15;
    const maxDeuce = config.maxDeucePoints || (target === 11 ? 15 : 21);

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
          statusText: `Match Selesai! Tim ${winner} Menang (${Math.max(scoreA, scoreB)} - ${Math.min(scoreA, scoreB)})`,
        };
      }
      return {
        isValid: true,
        isFinished: false,
        statusText: "Deuce! Butuh selisih 2 poin untuk memenangkan game.",
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
