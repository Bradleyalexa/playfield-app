import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { GameSession } from "../../core/entities/session";

/**
 * Cloudflare R2 Client Service (S3-Compatible)
 * Digunakan untuk menyimpan snapshot live session.json dengan latensi rendah dan tanpa biaya egress.
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
}

export const r2Service = new R2StorageService();
