import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GameSession } from "../../core/entities/session";
import { SessionFeedback } from "../../core/entities/feedback";

/**
 * Cloudflare R2 Client Service (S3-Compatible)
 * Digunakan untuk menyimpan snapshot live session.json dan feedback surat tanpa biaya egress.
 */
class R2StorageService {
  private client: S3Client | null = null;
  private bucketName: string = "";

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
}

export const r2Service = new R2StorageService();
