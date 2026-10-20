import { Player } from "../../core/entities/player";

export interface AnnouncerSettings {
  voiceURI?: string;
  pitch: number; // 0.6 to 1.4 (0.8 = Cowok berat, 1.0 = Natural, 1.25 = Cewek)
  rate: number; // 0.75 to 1.25 (0.85 = Santai, 0.95 = Standar, 1.1 = Cepat)
  volume: number; // 0.1 to 1.0
  preset: "natural" | "female" | "male" | "robot";
}

const STORAGE_KEY = "playfield_audio_settings";

const DEFAULT_SETTINGS: AnnouncerSettings = {
  pitch: 1.0,
  rate: 0.95,
  volume: 1.0,
  preset: "natural",
};

export class AudioAnnouncer {
  private static isAvailable(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public static getSettings(): AnnouncerSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: Partial<AnnouncerSettings>): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Gagal menyimpan audio settings:", err);
    }
  }

  public static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isAvailable()) return [];
    return window.speechSynthesis.getVoices();
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

  /**
   * Uji coba suara pengumuman
   */
  public static testVoice(sampleText?: string): void {
    if (!this.isAvailable()) return;
    const text =
      sampleText ||
      "Halo host mabar. Ini adalah tes suara pengumuman speaker GOR dari Playfield. Selamat bertanding!";
    this.speak(text);
  }

  private static speak(text: string): void {
    try {
      window.speechSynthesis.cancel(); // Hentikan suara sebelumnya jika masih bicara

      const settings = this.getSettings();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      const voices = window.speechSynthesis.getVoices();

      // Jika user memilih suara spesifik
      if (settings.voiceURI) {
        const found = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (found) {
          utterance.voice = found;
        }
      }

      // Jika belum dipilih atau fallback, cari suara Bahasa Indonesia
      if (!utterance.voice) {
        const idVoice = voices.find((v) => v.lang.includes("id") || v.lang.includes("ID"));
        if (idVoice) {
          utterance.voice = idVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Gagal memutar audio pengumuman:", err);
    }
  }
}
