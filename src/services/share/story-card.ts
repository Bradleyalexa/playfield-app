import { Player } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";

export interface StoryStats {
  player: Player;
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
  bestPartnerName?: string;
  badgeTitle: string;
}

export class StoryCardGenerator {
  /**
   * Menghasilkan Canvas 1080 x 1920 (Rasio 9:16) bergaya Spotify-Wrapped
   */
  public static async generateCard(session: GameSession, stats: StoryStats): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context 2D not supported");

    // 1. Background Gradient Gelap & Elegan (Taste Guidelines)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Garis Lapangan Abstrak (Neon Accents)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 160, 920, 1600);
    ctx.beginPath();
    ctx.moveTo(80, 960);
    ctx.lineTo(1000, 960);
    ctx.stroke();

    // 3. Header: Nama Komunitas & Logo
    ctx.fillStyle = "#ccff00";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PLAYFIELD MABAR RECAP", 540, 260);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "32px sans-serif";
    ctx.fillText(session.title.toUpperCase(), 540, 320);

    // 4. Kartu Utama Pemain
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.beginPath();
    ctx.roundRect(140, 420, 800, 1140, 40);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nama Pemain
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(stats.player.name, 540, 560);

    // Badge Title (e.g. "Raja Lapangan 1" / "Suhu GOR")
    ctx.fillStyle = "#f59e0b";
    ctx.font = "600 36px sans-serif";
    ctx.fillText(`🏆 ${stats.badgeTitle.toUpperCase()}`, 540, 640);

    // Garis Pemisah
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(220, 710);
    ctx.lineTo(860, 710);
    ctx.stroke();

    // 5. Statistik Match (3 Grid Angka)
    // Match Dimainkan
    ctx.fillStyle = "#94a3b8";
    ctx.font = "28px sans-serif";
    ctx.fillText("TOTAL MATCH", 320, 800);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 84px sans-serif";
    ctx.fillText(`${stats.matchesPlayed}`, 320, 890);

    // Win Rate
    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "28px sans-serif";
    ctx.fillText("WIN RATE", 760, 800);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 84px sans-serif";
    ctx.fillText(`${winRate}%`, 760, 890);

    // 6. Best Partner Highlight
    if (stats.bestPartnerName) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.roundRect(220, 970, 640, 140, 24);
      ctx.fill();

      ctx.fillStyle = "#a7f3d0";
      ctx.font = "26px sans-serif";
      ctx.fillText("🔥 DUET MAUT TERBAIK MALAM INI", 540, 1020);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText(stats.bestPartnerName, 540, 1075);
    }

    // 7. Tier Kasta GOR
    ctx.fillStyle = "#94a3b8";
    ctx.font = "30px sans-serif";
    ctx.fillText("KASTA GOR SAAT INI", 540, 1200);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(stats.player.publicTier.toUpperCase(), 540, 1280);

    // 8. Footer Watermark
    ctx.fillStyle = "#64748b";
    ctx.font = "26px sans-serif";
    ctx.fillText("Siap mabar berikutnya? Buka playfield.app", 540, 1680);

    return canvas.toDataURL("image/png");
  }

  /**
   * Unduh gambar langsung ke perangkat
   */
  public static downloadCard(dataUrl: string, playerName: string): void {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `Playfield-Recap-${playerName.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
