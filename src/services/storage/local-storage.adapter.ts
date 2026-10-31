import { GameSession, SportType } from "../../core/entities/session";
import { Player } from "../../core/entities/player";
import { generateBalancedMatches } from "../../core/matchmaking/balanced-queue";
import { SportRegistry } from "../../core/sports/sport-registry";
import { generateSecretKey, generateSlug } from "../../lib/utils";

const STORAGE_PREFIX = "clubcourt_session_";
const RECENT_SESSIONS_KEY = "clubcourt_recent_sessions";

export class LocalStorageAdapter {
  private static syncTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private static isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  public static saveSession(session: GameSession): void {
    if (!this.isAvailable()) return;

    session.updatedAt = new Date().toISOString();

    // 1. Simpan payload sesi di LocalStorage (instant)
    this.saveSessionLocalOnly(session);

    // 2. Kirim sinkronisasi ke serverless API / Cloud (R2 & D1) dengan coalescing/debounce
    // agar klik skor cepat (+1 beruntun) tidak saling balapan (race condition) di jaringan GOR
    if (typeof window !== "undefined") {
      const slugKey = session.publicSlug || session.id;
      const existingTimer = this.syncTimers.get(slugKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      const snapshotToPush = JSON.stringify(session);
      const timer = setTimeout(() => {
        this.syncTimers.delete(slugKey);
        fetch(`/api/sessions/${encodeURIComponent(slugKey)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: snapshotToPush,
        }).catch((err) => {
          console.debug("[LocalStorageAdapter] Cloud sync skipped:", err);
        });
      }, 120);
      this.syncTimers.set(slugKey, timer);
    }

    // 3. Dispatch window event agar tab/komponen lain auto-refresh
    window.dispatchEvent(new CustomEvent("clubcourt:session_updated", { detail: session }));
  }

  public static saveSessionLocalOnly(session: GameSession): void {
    if (!this.isAvailable()) return;

    localStorage.setItem(`${STORAGE_PREFIX}${session.id}`, JSON.stringify(session));
    localStorage.setItem(`${STORAGE_PREFIX}${session.publicSlug}`, JSON.stringify(session));

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

  /**
   * Tarik data sesi dari Server / Cloud (R2 Snapshot / D1) jika tidak ada di LocalStorage
   * Berguna untuk smartphone penonton / TV Kiosk yang membuka di browser terpisah dari host
   */
  public static async fetchRemoteSession(idOrSlug: string): Promise<GameSession | null> {
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(idOrSlug)}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.session) {
        const remoteSession = json.session as GameSession;
        const localSession = this.getSession(idOrSlug);
        if (
          localSession &&
          localSession.updatedAt &&
          remoteSession.updatedAt &&
          new Date(localSession.updatedAt).getTime() > new Date(remoteSession.updatedAt).getTime()
        ) {
          return localSession;
        }
        this.saveSessionLocalOnly(remoteSession);
        return remoteSession;
      }
    } catch {
      // Offline / network failure
    }
    return null;
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

    const demoPlayers: Player[] = [];
    const courtCount = 2;

    const defaultTitle =
      sport === "table_tennis"
        ? "Mabar Tenis Meja"
        : sport === "pickleball"
        ? "Mabar Pickleball"
        : sport === "squash"
        ? "Mabar Squash"
        : sport === "tennis"
        ? "Mabar Tennis"
        : sport === "padel"
        ? "Mabar Padel"
        : "Mabar Badminton";

    const courtPrefix = sport === "table_tennis" ? "Meja" : sport === "squash" ? "Court" : "Lapangan";
    const courts = [
      {
        id: "c1",
        courtNumber: 1,
        courtName: `${courtPrefix} 1 (${sport === "table_tennis" ? "Area A" : sport === "squash" ? "Glass Back" : "Karpet Hijau"})`,
        currentMatch: undefined,
      },
      {
        id: "c2",
        courtNumber: 2,
        courtName: `${courtPrefix} 2 (${sport === "table_tennis" ? "Area B" : sport === "squash" ? "Glass Back" : "Karpet Biru"})`,
        currentMatch: undefined,
      },
    ];

    const session: GameSession = {
      id: `session-${Date.now()}`,
      publicSlug: slug,
      adminKey,
      title: defaultTitle,
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
      matches: [],
      currentRound: 1,
      sessionDate: new Date().toISOString().split("T")[0],
      startTime: "19:00",
      durationHours: 2,
      matchDurationMinutes: 15,
      algorithm: "playfields_mix",
      estimatedMatchesCount: Math.ceil((2 * 60 / 15) * courtCount) + 10,
      courtLocation:
        sport === "table_tennis"
          ? "Pingpong Hall Arena, Meja 1-2"
          : sport === "squash"
          ? "Gelora Squash Centre, Court 1-2"
          : sport === "pickleball"
          ? "Pickleball Hub Senayan, Lapangan 1-2"
          : "GOR Tomang Barat, Lapangan 1-2",
      googleMapsUrl: "https://maps.google.com/?q=GOR+Tomang+Barat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }
}
