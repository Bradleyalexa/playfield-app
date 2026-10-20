import { GameSession } from "../../core/entities/session";

/**
 * Cloudflare D1 REST API Client
 * Menggunakan Cloudflare v4 REST API sehingga dapat dipanggil dari mana saja (termasuk Vercel Serverless Functions)
 * Endpoint: https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query
 */
class D1DatabaseService {
  private accountId: string = "";
  private databaseId: string = "";
  private apiToken: string = "";

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || "";
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
  }

  public isConfigured(): boolean {
    return !!this.accountId && !!this.databaseId && !!this.apiToken;
  }

  /**
   * Eksekusi SQL query ke Cloudflare D1 via REST API
   */
  public async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[D1DatabaseService] HTTP error from Cloudflare D1 API:", res.status, errText);
        return null;
      }

      const json = await res.json();
      if (!json.success || !json.result || !json.result[0]) {
        console.error("[D1DatabaseService] Query error:", json.errors);
        return null;
      }

      return json.result[0].results as T[];
    } catch (error) {
      console.error("[D1DatabaseService] Network error executing query:", error);
      return null;
    }
  }

  /**
   * Upsert sesi mabar ke tabel game_sessions di Cloudflare D1
   */
  public async saveSession(session: GameSession): Promise<boolean> {
    if (!this.isConfigured()) return false;

    const sql = `
      INSERT INTO game_sessions (
        id, public_slug, admin_secret_key, title, sport_type, 
        court_count, rule_preset, target_points, status, 
        session_data, session_date, start_time, duration_hours, court_location, google_maps_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        public_slug = excluded.public_slug,
        title = excluded.title,
        court_count = excluded.court_count,
        status = excluded.status,
        session_data = excluded.session_data,
        session_date = excluded.session_date,
        updated_at = CURRENT_TIMESTAMP;
    `;

    const params = [
      session.id,
      session.publicSlug,
      session.adminKey,
      session.title,
      session.sport,
      session.courtCount,
      session.sportConfig?.rulePreset || "rally_21",
      session.sportConfig?.targetPoints || 21,
      session.status,
      JSON.stringify(session),
      session.sessionDate || "",
      session.startTime || "19:00",
      session.durationHours || 2,
      session.courtLocation || "",
      session.googleMapsUrl || "",
    ];

    const result = await this.executeQuery(sql, params);
    return result !== null;
  }

  /**
   * Ambil data sesi berdasarkan ID atau publicSlug dari Cloudflare D1
   */
  public async getSession(slugOrId: string): Promise<GameSession | null> {
    if (!this.isConfigured()) return null;

    const sql = `
      SELECT session_data FROM game_sessions 
      WHERE id = ? OR public_slug = ?
      LIMIT 1;
    `;

    const rows = await this.executeQuery<{ session_data: string }>(sql, [slugOrId, slugOrId]);
    if (!rows || rows.length === 0 || !rows[0].session_data) {
      return null;
    }

    try {
      return JSON.parse(rows[0].session_data) as GameSession;
    } catch {
      return null;
    }
  }
}

export const d1Service = new D1DatabaseService();
