import { Player, getTierLabel } from "../../core/entities/player";
import { GameSession } from "../../core/entities/session";

export interface StoryStats {
  player: Player;
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
  bestPartnerName?: string;
  badgeTitle: string;
}

function drawNeoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bgColor: string,
  shadowOffset = 14,
  radius = 24,
  borderWidth = 8
) {
  // Hard offset black shadow (Neo-Brutalism)
  if (shadowOffset > 0) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === "function") {
      (ctx as any).roundRect(x + shadowOffset, y + shadowOffset, w, h, radius);
    } else {
      ctx.rect(x + shadowOffset, y + shadowOffset, w, h);
    }
    ctx.fill();
  }

  // Box fill
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  // Box thick border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = borderWidth;
  ctx.stroke();
}

export class StoryCardGenerator {
  /**
   * Menghasilkan Canvas 1080 x 1920 (Rasio 9:16) bergaya Neo-Brutalism Playfield
   */
  public static async generateCard(session: GameSession, stats: StoryStats): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context 2D not supported");

    // 1. Background Kanvas: Warm Off-White (#faf8f2)
    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(0, 0, 1080, 1920);

    // Grid Garis Lapangan Lembut Abstrak
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 3;
    for (let x = 60; x < 1080; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1920);
      ctx.stroke();
    }
    for (let y = 60; y < 1920; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
      ctx.stroke();
    }

    // Outer Thick Frame Border (Neo-Brutalist Frame)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1020, 1860);

    // 2. Header Bar: Playfield Recap
    drawNeoBox(ctx, 70, 70, 940, 180, "#ccff00", 14, 28, 8);
    ctx.fillStyle = "#000000";
    ctx.font = "900 52px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ PLAYFIELD RECAP", 540, 145);

    ctx.fillStyle = "#1e293b";
    ctx.font = "800 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(session.title.toUpperCase(), 540, 205);

    // 3. Kartu Profil Pemain (White Neo Box)
    drawNeoBox(ctx, 70, 290, 940, 410, "#ffffff", 14, 28, 8);

    // Nama Pemain
    ctx.fillStyle = "#000000";
    ctx.font = "900 76px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stats.player.name, 540, 400);

    // Gender Pill (Men / Women) & Tier Pill
    const isMen = stats.player.gender === "M";
    const genderBg = isMen ? "#bfdbfe" : "#fbcfe8";
    const genderText = isMen ? "👦 MEN (M)" : "👧 WOMEN (W)";

    // Gender Box
    drawNeoBox(ctx, 160, 445, 340, 70, genderBg, 8, 16, 6);
    ctx.fillStyle = "#000000";
    ctx.font = "900 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(genderText, 330, 490);

    // Tier Box
    const tierInfo = getTierLabel(stats.player.publicTier);
    const tierBg = "#fef08a";
    const tierText = `🏆 ${tierInfo.label.toUpperCase()}`;
    drawNeoBox(ctx, 540, 445, 380, 70, tierBg, 8, 16, 6);
    ctx.fillStyle = "#000000";
    ctx.font = "900 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(tierText, 730, 490);

    // Gelar / Badge Mabar
    drawNeoBox(ctx, 130, 560, 820, 90, "#00e5ff", 8, 20, 6);
    ctx.fillStyle = "#000000";
    ctx.font = "900 36px system-ui, -apple-system, sans-serif";
    ctx.fillText(`🔥 ${stats.badgeTitle.toUpperCase()}`, 540, 618);

    // 4. Dua Box Statistik Utama (Total Match & Win Rate)
    // Box Match Dimainkan
    drawNeoBox(ctx, 70, 740, 450, 310, "#ccff00", 14, 24, 8);
    ctx.fillStyle = "#000000";
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("TOTAL MATCH", 295, 810);

    ctx.font = "900 100px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${stats.matchesPlayed}`, 295, 925);

    ctx.font = "800 24px system-ui, -apple-system, sans-serif";
    ctx.fillText("GAMES DIMAINKAN", 295, 990);

    // Box Win Rate
    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;
    drawNeoBox(ctx, 560, 740, 450, 310, "#00e5ff", 14, 24, 8);
    ctx.fillStyle = "#000000";
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("WIN RATE", 785, 810);

    ctx.font = "900 100px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${winRate}%`, 785, 925);

    ctx.font = "800 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${stats.matchesWon} KALI MENANG`, 785, 990);

    // 5. Total Poin di Lapangan (Yellow Box)
    drawNeoBox(ctx, 70, 1090, 940, 190, "#ffde00", 14, 24, 8);
    ctx.fillStyle = "#000000";
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("TOTAL POIN DICETAK DI SEMUA LAPANGAN", 540, 1150);

    ctx.font = "900 72px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${stats.totalPoints} POIN`, 540, 1235);

    // 6. Best Partner Highlight Box
    const partner = stats.bestPartnerName || "Belum Ada Partner Tetap";
    drawNeoBox(ctx, 70, 1320, 940, 220, "#ffffff", 14, 24, 8);
    ctx.fillStyle = "#ff007f";
    ctx.font = "900 26px system-ui, -apple-system, sans-serif";
    ctx.fillText("✨ DUET PARTNER TERBAIK MALAM INI", 540, 1385);

    ctx.fillStyle = "#000000";
    ctx.font = "900 48px system-ui, -apple-system, sans-serif";
    ctx.fillText(partner, 540, 1460);

    // 7. Footer Watermark & Branding Neo-Brutalist
    drawNeoBox(ctx, 70, 1580, 940, 190, "#000000", 14, 24, 8);
    ctx.fillStyle = "#ccff00";
    ctx.font = "900 36px system-ui, -apple-system, sans-serif";
    ctx.fillText("PLAYFIELD • ROTASI MABAR OTOMATIS", 540, 1655);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 24px system-ui, -apple-system, sans-serif";
    ctx.fillText("Mabar adil, tanpa ribet, live score real-time!", 540, 1715);

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
