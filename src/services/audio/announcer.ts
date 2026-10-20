import { Player } from "../../core/entities/player";

export class AudioAnnouncer {
  private static isAvailable(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  /**
   * Panggilan otomatis giliran masuk lapangan (via Bluetooth speaker GOR)
   */
  public static announceMatch(courtNumber: number, teamA: Player[], teamB: Player[]): void {
    if (!this.isAvailable()) return;

    const namesA = teamA.map((p) => p.name).join(" dan ");
    const namesB = teamB.map((p) => p.name).join(" dan ");

    const text = `Perhatian. Lapangan ${courtNumber}. ${namesA} melawan ${namesB}. Harap segera memasuki lapangan.`;
    this.speak(text);
  }

  /**
   * Panggilan pemenang saat match selesai
   */
  public static announceWinner(
    courtNumber: number,
    winnerTeam: "A" | "B",
    winnerPlayers: Player[],
    scoreA: number,
    scoreB: number
  ): void {
    if (!this.isAvailable()) return;

    const names = winnerPlayers.map((p) => p.name).join(" dan ");
    const high = Math.max(scoreA, scoreB);
    const low = Math.min(scoreA, scoreB);

    const text = `Pertandingan di Lapangan ${courtNumber} selesai. Dimenangkan oleh ${names} dengan skor ${high} lawan ${low}. Selamat!`;
    this.speak(text);
  }

  /**
   * Panggilan pengumuman umum / Sultan Mode
   */
  public static announceGeneral(message: string): void {
    if (!this.isAvailable()) return;
    this.speak(message);
  }

  private static speak(text: string): void {
    try {
      window.speechSynthesis.cancel(); // Hentikan suara sebelumnya jika masih bicara

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95; // Kecepatan nyaman dan artikulasi jelas
      utterance.pitch = 1.0;

      // Coba cari suara bahasa Indonesia jika tersedia
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.includes("id") || v.lang.includes("ID"));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Gagal memutar audio pengumuman:", err);
    }
  }
}
