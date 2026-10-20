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
      { id: "p3", name: "Greysia Polii", gender: "F" as const, skillLevel: 3 as const, publicTier: "suhu" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1290, createdAt: new Date().toISOString() },
      { id: "p4", name: "Apriyani Rahayu", gender: "F" as const, skillLevel: 3 as const, publicTier: "suhu" as const, gamesPlayed: 0, lastPlayedRound: 0, status: "active" as const, eloRating: 1280, createdAt: new Date().toISOString() },
    ];

    const courtCount = 2;
    const initialMatches = generateBalancedMatches(demoPlayers, courtCount, 1);

    const courts = [
      { id: "c1", courtNumber: 1, courtName: "Lapangan 1 (Karpet Hijau)", currentMatch: initialMatches.matches[0] || undefined },
      { id: "c2", courtNumber: 2, courtName: "Lapangan 2 (Karpet Biru)", currentMatch: initialMatches.matches[1] || undefined },
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
      courtLocation: "GOR Tomang Barat, Lapangan 1-2",
      googleMapsUrl: "https://maps.google.com/?q=GOR+Tomang+Barat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }
}
