import { SportType } from "../entities/session";
import { BadmintonStrategy } from "./badminton.strategy";
import { PadelStrategy } from "./padel.strategy";
import { SportStrategy } from "./sport-strategy.interface";
import { TennisStrategy } from "./tennis.strategy";

export class SportRegistry {
  private static strategies: Map<SportType, SportStrategy> = new Map([
    ["badminton", new BadmintonStrategy()],
    ["tennis", new TennisStrategy()],
    ["padel", new PadelStrategy()],
  ]);

  public static getStrategy(sport: SportType): SportStrategy {
    const strategy = this.strategies.get(sport);
    if (!strategy) {
      return this.strategies.get("badminton")!;
    }
    return strategy;
  }

  public static getAllSports(): { type: SportType; displayName: string; emoji: string }[] {
    return Array.from(this.strategies.values()).map((s) => ({
      type: s.sportType,
      displayName: s.displayName,
      emoji: s.emoji,
    }));
  }
}
