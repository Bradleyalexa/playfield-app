import { GameSession, SportType } from "../../core/entities/session";
import { generateBalancedMatches } from "../../core/matchmaking/balanced-queue";
import { SportRegistry } from "../../core/sports/sport-registry";
import { generateSecretKey, generateSlug } from "../../lib/utils";

const STORAGE_PREFIX = "clubcourt_session_";
const RECENT_SESSIONS_KEY = "clubcourt_recent_sessions";

export class LocalStorageAdapter {
  private static isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  public static saveSession(session: GameSession): void {
    if (!this.isAvailable()) return;

    session.updatedAt = new Date().toISOString();

    // 1. Simpan payload sesi
    localStorage.setItem(`${STORAGE_PREFIX}${session.id}`, JSON.stringify(session));
    localStorage.setItem(`${STORAGE_PREFIX}${session.publicSlug}`, JSON.stringify(session));

    // 2. Simpan di daftar recent sessions
    const recent = this.listRecentSessions();
    const filtered = recent.filter((r) => r.id !== session.id);
    filtered.unshift({
      id: session.id,
      publicSlug: session.publicSlug,
      title: session.title,
      sport: session.sport,
      updatedAt: session.updatedAt,
      playerCount: session.players.length,
    });
    localStorage.setItem(RECENT_SESSIONS_KEY, JSON.stringify(filtered.slice(0, 10)));

    // 3. Dispatch window event agar tab/komponen lain auto-refresh
    window.dispatchEvent(new CustomEvent("clubcourt:session_updated", { detail: session }));
  }

  public static getSession(idOrSlug: string): GameSession | null {
    if (!this.isAvailable()) return null;

    const data = localStorage.getItem(`${STORAGE_PREFIX}${idOrSlug}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as GameSession;
    } catch {
      return null;
    }
  }

  public static listRecentSessions(): {
    id: string;
    publicSlug: string;
    title: string;
    sport: SportType;
    updatedAt: string;
    playerCount: number;
  }[] {
    if (!this.isAvailable()) return [];

    const data = localStorage.getItem(RECENT_SESSIONS_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Buat sesi demo baru dengan data contoh GOR Indonesia
   */
  public static createDemoSession(sport: SportType = "badminton"): GameSession {
    const slug = generateSlug(sport);
    const adminKey = generateSecretKey();
    const strategy = SportRegistry.getStrategy(sport);
    const presets = strategy.getPresets();
    const defaultPreset = presets[0];

    const demoPlayers = [
      { id: "p1", name: "Hendra Setiawan", gender: "M" as const, skillLevel: 3 as const, publicTier: "suhu" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1250, createdAt: new Date().toISOString() },
      { id: "p2", name: "Kevin Sanjaya", gender: "M" as const, skillLevel: 3 as const, publicTier: "suhu" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1300, createdAt: new Date().toISOString() },
      { id: "p3", name: "Budi Santoso", gender: "M" as const, skillLevel: 2 as const, publicTier: "hore" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1050, createdAt: new Date().toISOString() },
      { id: "p4", name: "Rian Ardianto", gender: "M" as const, skillLevel: 2 as const, publicTier: "hore" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1100, createdAt: new Date().toISOString() },
      { id: "p5", name: "Siti Rahmawati", gender: "F" as const, skillLevel: 1 as const, publicTier: "kentang" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 950, createdAt: new Date().toISOString() },
      { id: "p6", name: "Fajar Alfian", gender: "M" as const, skillLevel: 2 as const, publicTier: "hore" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1120, createdAt: new Date().toISOString() },
      { id: "p7", name: "Dewi Lestari", gender: "F" as const, skillLevel: 1 as const, publicTier: "kentang" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 920, createdAt: new Date().toISOString() },
      { id: "p8", name: "Agus Pratama", gender: "M" as const, skillLevel: 2 as const, publicTier: "hore" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1020, createdAt: new Date().toISOString() },
    ];

    const courtCount = 2;
    const initialMatches = generateBalancedMatches(demoPlayers, courtCount, 1);

    const courts = [
      { id: "c1", courtNumber: 1, courtName: "Lapangan 1 (Karpet Hijau)", currentMatch: initialMatches.matches[0] },
      { id: "c2", courtNumber: 2, courtName: "Lapangan 2 (Karpet Biru)", currentMatch: initialMatches.matches[1] },
    ];

    const session: GameSession = {
      id: `session-${Date.now()}`,
      publicSlug: slug,
      adminKey,
      title: "Mabar Ceria Badminton GOR Tomang",
      sport,
      courtCount,
      status: "active",
      sportConfig: {
        rulePreset: defaultPreset.id,
        targetPoints: defaultPreset.targetPoints,
        deuceType: defaultPreset.deuceType,
        maxDeucePoints: defaultPreset.maxDeucePoints,
        equipment: strategy.getDefaultEquipment(),
      },
      players: demoPlayers,
      courts,
      matches: initialMatches.matches,
      currentRound: 1,
      startTime: "19:00",
      durationHours: 2,
      matchDurationMinutes: 15,
      algorithm: "fair_playtime",
      estimatedMatchesCount: Math.ceil((2 * 60 / 15) * courtCount) + 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }
}
