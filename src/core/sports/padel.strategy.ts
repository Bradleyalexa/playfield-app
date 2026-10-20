import { EquipmentConfig, SportConfig, SportType } from "../entities/session";
import { ScoreValidationResult, ScoringPreset, SportStrategy } from "./sport-strategy.interface";

export class PadelStrategy implements SportStrategy {
  sportType: SportType = "padel";
  displayName = "Padel";
  emoji = "🏓";

  getPresets(): ScoringPreset[] {
    return [
      {
        id: "americano_32",
        name: "Americano (32 Poin Total)",
        targetPoints: 32,
        deuceType: "sudden_death_golden_point",
        description:
          "Total akumulasi kedua tim harus 32 poin (misal: 18-14 atau 20-12). Poin individu diakumulasikan ke klasemen.",
      },
      {
        id: "americano_24",
        name: "Americano (24 Poin Total)",
        targetPoints: 24,
        deuceType: "sudden_death_golden_point",
        description: "Versi lebih cepat dengan total 24 poin per ronde (misal: 14-10).",
      },
      {
        id: "mexicano_32",
        name: "Mexicano (Dynamic Ladder)",
        targetPoints: 32,
        deuceType: "sudden_death_golden_point",
        description:
          "Pasangan tiap ronde diacak berdasarkan peringkat klasemen sementara untuk pertandingan yang semakin seimbang.",
      },
      {
        id: "traditional_set",
        name: "Traditional Set (6 Games)",
        targetPoints: 6,
        deuceType: "sudden_death_golden_point",
        description: "1 Set ke 6 game dengan Punto de Oro (Golden Point di 40-40).",
      },
    ];
  }

  getDefaultEquipment(): EquipmentConfig {
    return {
      unitName: "padel_ball",
      totalUsed: 0,
      costPerUnit: 90000,
      billingMode: "shared_all",
    };
  }

  validateScore(scoreA: number, scoreB: number, config: SportConfig): ScoreValidationResult {
    const isAmericano = config.rulePreset.startsWith("americano") || config.rulePreset.startsWith("mexicano");

    if (isAmericano) {
      const totalTarget = config.targetPoints || 32;
      const currentTotal = scoreA + scoreB;

      if (currentTotal >= totalTarget) {
        const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : undefined;
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: winner
            ? `Ronde Americano Selesai! Tim ${winner} Menang (${scoreA} - ${scoreB})`
            : `Ronde Americano Selesai! Seri (${scoreA} - ${scoreB})`,
        };
      }

      return {
        isValid: true,
        isFinished: false,
        statusText: `Americano Berjalan: Total ${currentTotal} dari ${totalTarget} poin`,
      };
    }

    // Traditional Game Set
    const target = config.targetPoints || 6;
    if (scoreA >= target || scoreB >= target) {
      const diff = Math.abs(scoreA - scoreB);
      if (diff >= 2 || config.deuceType === "sudden_death_golden_point") {
        const winner = scoreA > scoreB ? "A" : "B";
        return {
          isValid: true,
          isFinished: true,
          winner,
          statusText: `Set Selesai! Tim ${winner} Menang (${scoreA} - ${scoreB})`,
        };
      }
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
