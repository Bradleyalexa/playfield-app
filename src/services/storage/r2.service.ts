import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GameSession } from "../../core/entities/session";
import { SessionFeedback } from "../../core/entities/feedback";
import { DailySessionSummary, DayGroup, AnalyticsResponse } from "../../core/entities/analytics";

/**
 * Cloudflare R2 Client Service (S3-Compatible)
 * Digunakan untuk menyimpan snapshot live session.json dan feedback surat tanpa biaya egress.
 */
class R2StorageService {
  private client: S3Client | null = null;
  private bucketName: string = "";
  private analyticsCache: {
    data: AnalyticsResponse;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 detik memory cache

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || "playfield-sessions";

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  public isConfigured(): boolean {
    return this.client !== null && !!this.bucketName;
  }

  /**
   * Upload snapshot JSON sesi ke Cloudflare R2
   */
  public async uploadSessionSnapshot(session: GameSession): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const key = `sessions/${session.publicSlug}.json`;
      const body = JSON.stringify(session);

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: "application/json",
          CacheControl: "max-age=5, s-maxage=5, must-revalidate",
        })
      );

      // Simpan juga dengan ID sesi untuk lookup fleksibel
      if (session.id && session.id !== session.publicSlug) {
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: `sessions/${session.id}.json`,
            Body: body,
            ContentType: "application/json",
            CacheControl: "max-age=5, s-maxage=5, must-revalidate",
          })
        );
      }

      return true;
    } catch (error) {
      console.error("[R2StorageService] Gagal upload snapshot ke R2:", error);
      return false;
    }
  }

  /**
   * Ambil snapshot JSON sesi dari Cloudflare R2
   */
  public async getSessionSnapshot(slugOrId: string): Promise<GameSession | null> {
    if (!this.client) {
      return null;
    }

    try {
      const key = `sessions/${slugOrId}.json`;
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      if (!response.Body) return null;
      const str = await response.Body.transformToString();
      return JSON.parse(str) as GameSession;
    } catch (error: any) {
      // 404 / NoSuchKey adalah wajar jika sesi baru belum di-upload ke R2
      if (error?.name !== "NoSuchKey") {
        console.error("[R2StorageService] Gagal ambil snapshot dari R2:", error);
      }
      return null;
    }
  }

  /**
   * Simpan feedback / surat dari user ke Cloudflare R2
   */
  public async uploadFeedback(feedback: SessionFeedback): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const key = `feedbacks/${feedback.id}.json`;
      const body = JSON.stringify(feedback);

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: "application/json",
        })
      );

      return true;
    } catch (error) {
      console.error("[R2StorageService] Gagal simpan feedback ke R2:", error);
      return false;
    }
  }

  /**
   * Ambil seluruh feedback dari Cloudflare R2 (diurutkan dari yang terbaru)
   */
  public async listFeedbacks(limit: number = 100): Promise<SessionFeedback[]> {
    if (!this.client) {
      return [];
    }

    try {
      const listRes = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: "feedbacks/",
          MaxKeys: limit,
        })
      );

      const contents = listRes.Contents || [];
      if (contents.length === 0) return [];

      // Sort LastModified descending
      contents.sort((a, b) => {
        const timeA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
        const timeB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
        return timeB - timeA;
      });

      const feedbacks: SessionFeedback[] = [];
      // Ambil isi setiap surat
      await Promise.all(
        contents.map(async (obj) => {
          if (!obj.Key) return;
          try {
            const getRes = await this.client!.send(
              new GetObjectCommand({
                Bucket: this.bucketName,
                Key: obj.Key,
              })
            );
            if (getRes.Body) {
              const bodyStr = await getRes.Body.transformToString();
              const item = JSON.parse(bodyStr) as SessionFeedback;
              feedbacks.push(item);
            }
          } catch (e) {
            // Ignore individual read error
          }
        })
      );

      // Re-sort by createdAt descending
      feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return feedbacks;
    } catch (error) {
      console.error("[R2StorageService] Gagal membaca list feedbacks dari R2:", error);
      return [];
    }
  }

  /**
   * Mengambil analitik harian sesi mabar dari Cloudflare R2
   * Mengelompokkan sesi berdasarkan tanggal lokal Indonesia (WIB)
   */
  public async getDailyAnalytics(forceRefresh: boolean = false): Promise<AnalyticsResponse> {
    if (!forceRefresh && this.analyticsCache && Date.now() - this.analyticsCache.timestamp < this.CACHE_TTL_MS) {
      return this.analyticsCache.data;
    }

    if (!this.client) {
      return {
        success: false,
        generatedAt: new Date().toISOString(),
        totalAllTimeSessions: 0,
        totalRealSessions: 0,
        totalAllTimePlayers: 0,
        totalAllTimeMatches: 0,
        totalDaysRecorded: 0,
        sportsOverview: {},
        dailyGroups: [],
      };
    }

    try {
      // 1. List semua object di prefix sessions/
      let continuationToken: string | undefined = undefined;
      const allObjects: Array<{ Key?: string; LastModified?: Date; Size?: number }> = [];

      do {
        const listRes: any = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: "sessions/",
            ContinuationToken: continuationToken,
          })
        );
        if (listRes.Contents) {
          allObjects.push(...listRes.Contents);
        }
        continuationToken = listRes.NextContinuationToken;
      } while (continuationToken);

      // Hanya ambil file dengan key slug (e.g. sessions/badminton-xxx.json) untuk menghindari duplikasi id
      const slugObjects = allObjects.filter((o) => o.Key && !o.Key.includes("/session-"));

      // 2. Fetch concurrent batch
      const batchSize = 25;
      const allSessions: DailySessionSummary[] = [];

      for (let i = 0; i < slugObjects.length; i += batchSize) {
        const batch = slugObjects.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (obj) => {
            if (!obj.Key) return;
            try {
              const getRes = await this.client!.send(
                new GetObjectCommand({
                  Bucket: this.bucketName,
                  Key: obj.Key,
                })
              );
              if (!getRes.Body) return;
              const bodyStr = await getRes.Body.transformToString();
              const data = JSON.parse(bodyStr);

              const createdAt = data.createdAt || (obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString());
              const updatedAt = data.updatedAt || createdAt;
              const { dateStr: wibDate, timeStr: wibTime } = getWibDate(createdAt);

              const players = (data.players || []).map((p: any) =>
                typeof p === "string" ? p : p.name || p.id || "Pemain"
              );

              // Abaikan sesi yang hanya berisi 4 pemain dummy default
              const DUMMY_PLAYERS = new Set(["hendra setiawan", "kevin sanjaya", "greysia polii", "apriyani rahayu"]);
              if (
                players.length === 4 &&
                players.every((p: string) => DUMMY_PLAYERS.has(p.trim().toLowerCase()))
              ) {
                return;
              }

              const matches = data.matches || [];
              const completedMatches = matches.filter((m: any) => m.status === "completed");

              const playerCount = players.length;
              const matchCount = matches.length;
              const isRealSession = playerCount >= 4 || matchCount >= 1;

              allSessions.push({
                id: data.id || obj.Key,
                slug: data.publicSlug || obj.Key.replace("sessions/", "").replace(".json", ""),
                title: data.title || data.sessionName || "Mabar Lapangan",
                sport: data.sport || data.sportType || "badminton",
                createdAt,
                updatedAt,
                sessionDate: data.sessionDate,
                startTime: data.startTime,
                courtCount: data.courtCount || (data.courts || []).length || 1,
                courtLocation: data.courtLocation || data.location || data.venue,
                playerCount,
                players,
                matchCount,
                completedMatchCount: completedMatches.length,
                algorithm: data.algorithm || "playfields_mix",
                status: data.status || "active",
                wibDate,
                wibTime,
                isRealSession,
              });
            } catch {
              // Abaikan jika ada 1 file json yang korup
            }
          })
        );
      }

      // 3. Kelompokkan per tanggal WIB
      const todayWib = getWibDate(new Date().toISOString()).dateStr;
      const groupMap = new Map<string, DailySessionSummary[]>();

      for (const s of allSessions) {
        const list = groupMap.get(s.wibDate) || [];
        list.push(s);
        groupMap.set(s.wibDate, list);
      }

      // Sort tanggal descending (terbaru di atas)
      const sortedDateKeys = Array.from(groupMap.keys()).sort().reverse();
      const dailyGroups: DayGroup[] = [];

      let totalAllTimePlayers = 0;
      let totalAllTimeMatches = 0;
      let totalRealSessions = 0;
      const sportsOverview: Record<string, number> = {};

      for (const d of sortedDateKeys) {
        const sessions = groupMap.get(d) || [];
        // Sort sessions descending by createdAt
        sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        let dayPlayers = 0;
        let dayMatches = 0;
        let dayReal = 0;
        const daySports: Record<string, number> = {};

        for (const s of sessions) {
          dayPlayers += s.playerCount;
          dayMatches += s.matchCount;
          if (s.isRealSession) dayReal++;

          daySports[s.sport] = (daySports[s.sport] || 0) + 1;
          sportsOverview[s.sport] = (sportsOverview[s.sport] || 0) + 1;
        }

        totalAllTimePlayers += dayPlayers;
        totalAllTimeMatches += dayMatches;
        totalRealSessions += dayReal;

        dailyGroups.push({
          date: d,
          formattedDate: formatIndonesianDate(d),
          relativeLabel: getRelativeDateLabel(d, todayWib),
          totalSessions: sessions.length,
          realSessionsCount: dayReal,
          totalPlayers: dayPlayers,
          totalMatches: dayMatches,
          sportsBreakdown: daySports,
          sessions,
        });
      }

      const result: AnalyticsResponse = {
        success: true,
        generatedAt: new Date().toISOString(),
        totalAllTimeSessions: allSessions.length,
        totalRealSessions,
        totalAllTimePlayers,
        totalAllTimeMatches,
        totalDaysRecorded: dailyGroups.length,
        sportsOverview,
        dailyGroups,
      };

      this.analyticsCache = {
        data: result,
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      console.error("[R2StorageService] Gagal menghitung analitik harian:", error);
      return {
        success: false,
        generatedAt: new Date().toISOString(),
        totalAllTimeSessions: 0,
        totalRealSessions: 0,
        totalAllTimePlayers: 0,
        totalAllTimeMatches: 0,
        totalDaysRecorded: 0,
        sportsOverview: {},
        dailyGroups: [],
      };
    }
  }
}

function getWibDate(isoStr?: string): { dateStr: string; timeStr: string } {
  try {
    const d = new Date(isoStr || "");
    if (isNaN(d.getTime())) return { dateStr: "1970-01-01", timeStr: "00:00" };
    const dateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    const timeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "1970-01-01", timeStr: "00:00" };
  }
}

function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function getRelativeDateLabel(targetDateStr: string, todayWibStr: string): string {
  if (targetDateStr === todayWibStr) return "Hari Ini";
  try {
    const target = new Date(targetDateStr + "T00:00:00Z").getTime();
    const today = new Date(todayWibStr + "T00:00:00Z").getTime();
    const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Kemarin";
    if (diffDays > 1) return `${diffDays} hari lalu`;
  } catch {}
  return targetDateStr;
}

export const r2Service = new R2StorageService();
