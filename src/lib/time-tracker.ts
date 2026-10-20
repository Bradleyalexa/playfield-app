import { GameSession } from "../core/entities/session";

export interface RentalTimeInfo {
  status: "UPCOMING" | "IN_PROGRESS" | "OVERTIME" | "COMPLETED";
  label: string;
  formattedTime: string; // e.g. "01:25:40" or "+00:15:30"
  bgClass: string;
  textClass: string;
  scheduleLabel: string; // e.g. "19:00 - 21:00 WIB"
  durationLabel: string; // e.g. "2 Jam Sewa"
  dayDateLabel: string; // e.g. "Rabu, 21 Okt 2026"
  description: string; // Deskripsi lengkap & jelas status waktu sewa
}

/**
 * Format string tanggal YYYY-MM-DD ke Bahasa Indonesia (contoh: "Rabu, 21 Okt 2026")
 */
export function formatIndonesianDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Dapatkan jam selesai dari jam mulai + durasi (contoh: "19:00" + 2 jam -> "21:00")
 */
export function calculateEndTime(startTime: string = "19:00", durationHours: number = 2): string {
  const [hStr, mStr] = startTime.split(":");
  const h = parseInt(hStr || "19", 10);
  const m = parseInt(mStr || "0", 10);
  const totalMinutes = Math.round(h * 60 + m + durationHours * 60);
  const outH = Math.floor((totalMinutes / 60) % 24).toString().padStart(2, "0");
  const outM = Math.round(totalMinutes % 60).toString().padStart(2, "0");
  return `${outH}:${outM}`;
}

/**
 * Hitung kalkulasi waktu sewa lapangan, sisa waktu, overtime, dan deskripsi penjelasan
 */
export function calculateRentalTimeInfo(
  session: GameSession | null,
  now: Date = new Date()
): RentalTimeInfo {
  if (!session) {
    return {
      status: "IN_PROGRESS",
      label: "Sisa Sewa",
      formattedTime: "--:--:--",
      bgClass: "bg-[#ccff00]",
      textClass: "text-black",
      scheduleLabel: "19:00 - 21:00 WIB",
      durationLabel: "2 Jam",
      dayDateLabel: "",
      description: "Memuat info waktu...",
    };
  }

  const startTimeStr = session.startTime || "19:00";
  const durationHours = session.durationHours || 2;
  const endTimeStr = calculateEndTime(startTimeStr, durationHours);
  const scheduleLabel = `${startTimeStr} - ${endTimeStr} WIB`;
  const durationLabel = `${durationHours} Jam Sewa`;
  const dayDateLabel = session.sessionDate
    ? formatIndonesianDate(session.sessionDate)
    : "";

  // Jika status sesi sudah ditutup oleh Host
  if (session.status === "completed") {
    return {
      status: "COMPLETED",
      label: "Selesai",
      formattedTime: "00:00:00",
      bgClass: "bg-slate-200",
      textClass: "text-slate-800",
      scheduleLabel,
      durationLabel,
      dayDateLabel,
      description: `Sesi mabar telah selesai & final. Jadwal sewa: ${scheduleLabel} (${durationLabel}).`,
    };
  }

  // Tentukan Base Date (dari sessionDate, createdAt, atau hari ini)
  let baseDate = new Date();
  if (session.sessionDate) {
    const [y, m, d] = session.sessionDate.split("-").map(Number);
    baseDate = new Date(y, m - 1, d);
  } else if (session.createdAt) {
    baseDate = new Date(session.createdAt);
  }

  // Hitung Start Time & End Time ms
  const [startH, startM] = startTimeStr.split(":").map(Number);
  const start = new Date(baseDate);
  start.setHours(startH || 0, startM || 0, 0, 0);

  const durationMs = durationHours * 3600 * 1000;
  const end = new Date(start.getTime() + durationMs);

  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  const formatDiff = (diffMs: number) => {
    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Status 1: Belum Mulai (Upcoming)
  if (nowMs < startMs) {
    const diff = formatDiff(startMs - nowMs);
    return {
      status: "UPCOMING",
      label: "Mulai dlm",
      formattedTime: diff,
      bgClass: "bg-[#00e5ff]",
      textClass: "text-black",
      scheduleLabel,
      durationLabel,
      dayDateLabel,
      description: `Sewa lapangan belum dimulai. Pertandingan dijadwalkan mulai pukul ${startTimeStr} WIB (${diff} lagi).`,
    };
  }

  // Status 2: Sedang Berlangsung (In Progress)
  if (nowMs <= endMs) {
    const diff = formatDiff(endMs - nowMs);
    return {
      status: "IN_PROGRESS",
      label: "Sisa Sewa",
      formattedTime: diff,
      bgClass: "bg-[#ccff00]",
      textClass: "text-black",
      scheduleLabel,
      durationLabel,
      dayDateLabel,
      description: `Lapangan sedang aktif. Sisa waktu sewa: ${diff} sebelum lapangan harus dikosongkan pukul ${endTimeStr} WIB.`,
    };
  }

  // Status 3: Lewat Jadwal Sewa (Overtime)
  const overtimeDiff = formatDiff(nowMs - endMs);
  return {
    status: "OVERTIME",
    label: "Overtime",
    formattedTime: `+${overtimeDiff}`,
    bgClass: "bg-[#ff0055]",
    textClass: "text-white animate-pulse",
    scheduleLabel,
    durationLabel,
    dayDateLabel,
    description: `Waktu sewa telah berakhir pada pukul ${endTimeStr} WIB. Overtime: +${overtimeDiff}. Harap konfirmasi perpanjangan ke pengelola GOR atau segera selesaikan mabar.`,
  };
}
