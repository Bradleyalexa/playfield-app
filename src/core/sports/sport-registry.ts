import { SportType } from "../entities/session";
import { BadmintonStrategy } from "./badminton.strategy";
import { PadelStrategy } from "./padel.strategy";
import { PickleballStrategy } from "./pickleball.strategy";
import { SportStrategy } from "./sport-strategy.interface";
import { SquashStrategy } from "./squash.strategy";
import { TableTennisStrategy } from "./table-tennis.strategy";
import { TennisStrategy } from "./tennis.strategy";

export class SportRegistry {
  private static strategies: Map<SportType, SportStrategy> = new Map([
    ["badminton", new BadmintonStrategy()],
    ["tennis", new TennisStrategy()],
    ["padel", new PadelStrategy()],
    ["table_tennis", new TableTennisStrategy()],
    ["pickleball", new PickleballStrategy()],
    ["squash", new SquashStrategy()],
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
