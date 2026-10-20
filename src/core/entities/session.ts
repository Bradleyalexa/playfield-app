import { Court, Match } from "./match";
import { Player } from "./player";

export type SportType = "badminton" | "tennis" | "padel";

export type SessionStatus = "active" | "completed" | "archived";

export type MatchmakingAlgorithm =
  | "fair_playtime"   // Jam Terbang Rata (Paling lama istirahat & main paling sedikit)
  | "mixed_doubles"   // Ganda Campuran (Cowo + Cewe / Gender Balanced)
  | "skill_tiered"    // Seimbang Level (Kombinasi tier seimbang antar tim)
  | "king_of_court"   // Raja Lapangan (Pemenang bertahan di court 1)
  | "americano"       // Turnamen Americano (Rotasi partner individu bergiliran)
  | "random_fun"      // Acak Santai (Fun Mabar Tanpa Beban)
  | "custom_manual";  // Susun Manual / Custom by Host (Host tentukan sendiri matchup & jumlah match)

export interface AlgorithmDetails {
  id: MatchmakingAlgorithm;
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  icon: string;
  description: string;
  bestFor: string;
}

export const ALGORITHM_REGISTRY: Record<MatchmakingAlgorithm, AlgorithmDetails> = {
  fair_playtime: {
    id: "fair_playtime",
    name: "Jam Terbang Rata (Fair Rest & Play)",
    shortName: "Jam Terbang Rata",
    badge: "PALING POPULER",
    badgeColor: "bg-[#ccff00] text-black",
    icon: "⚖️",
    description: "Memprioritaskan pemain yang paling sedikit bermain dan paling lama duduk istirahat agar waktu sewa dinikmati rata.",
    bestFor: "Mabar komunitas rutin dengan jumlah pemain lebih dari kapasitas lapangan (ada antrean istirahat).",
  },
  mixed_doubles: {
    id: "mixed_doubles",
    name: "Ganda Campuran (Cowo + Cewe / Mixed)",
    shortName: "Ganda Campuran",
    badge: "GENDER BALANCED",
    badgeColor: "bg-[#f472b6] text-black",
    icon: "👫",
    description: "Memasangkan 1 Pemain Putra (PA) + 1 Pemain Putri (PI) di tiap kubu (XD vs XD) atau menyeimbangkan komposisi gender per lapangan.",
    bestFor: "Mabar yang dihadiri pemain cowo dan cewe agar tidak terjadi timpang pasangan.",
  },
  skill_tiered: {
    id: "skill_tiered",
    name: "Seimbang Level (Competitive Tier Balance)",
    shortName: "Seimbang Level",
    badge: "ANTI JOMPLANG",
    badgeColor: "bg-[#00e5ff] text-black",
    icon: "⚡",
    description: "Memadukan pemain tier atas (Suhu) dengan pemula (Kentang) melawan pasangan tier menengah (Hore) agar tensi reli tetap seru.",
    bestFor: "Komunitas dengan disparitas skill yang tinggi agar pemain pemula tidak kena bantai.",
  },
  king_of_court: {
    id: "king_of_court",
    name: "Raja Lapangan (Tahta GOR / King of Court)",
    shortName: "Raja Lapangan",
    badge: "KOMPETITIF",
    badgeColor: "bg-[#ffde00] text-black",
    icon: "👑",
    description: "Pemenang bertahan di Lapangan Utama (Lapangan 1) atau naik 1 kasta, sedangkan yang kalah rotasi ke antrean cadangan/turun kasta.",
    bestFor: "Sesi mabar berenergi tinggi atau sparing internal antar member.",
  },
  americano: {
    id: "americano",
    name: "Format Americano (Poin Individu Padel/Badminton)",
    shortName: "Americano",
    badge: "TOURNAMENT MODE",
    badgeColor: "bg-[#ff5500] text-white",
    icon: "🔄",
    description: "Setiap ronde berganti partner secara acak/terjadwal. Poin kemenangan dihitung ke leaderboard individu untuk menentukan juara mabar.",
    bestFor: "Turnamen mini komunitas, mabar padel, dan sesi mabar akhir bulan.",
  },
  random_fun: {
    id: "random_fun",
    name: "Acak Santai (Fun Mabar Tanpa Beban)",
    shortName: "Acak Santai",
    badge: "CASUAL",
    badgeColor: "bg-white text-black",
    icon: "🎲",
    description: "Rotasi acak sepenuhnya tanpa memedulikan tier atau statistik, murni untuk kesenangan dan memperluas kenalan baru.",
    bestFor: "Mabar santai, gathering kantor, atau sesi pemanasan sebelum tanding serius.",
  },
  custom_manual: {
    id: "custom_manual",
    name: "Susun Bebas (Custom Manual by Host)",
    shortName: "Susun Bebas",
    badge: "KENDALI PENUH",
    badgeColor: "bg-[#fef08a] text-black",
    icon: "✍️",
    description: "Host memiliki kendali 100% menentukan sendiri siapa berpasangan dengan siapa dan siapa lawan siapa. Host bebas menambah match kapan saja.",
    bestFor: "Host yang telah menyusun bagan tanding sendiri, sparing spesial, atau pertandingan permintaan khusus antar member.",
  },
};

export interface EquipmentConfig {
  unitName: "shuttlecock" | "ball_can" | "padel_ball";
  totalUsed: number;
  costPerUnit: number;
  billingMode: "shared_all" | "per_match";
}

export interface SportConfig {
  rulePreset: string;
  targetPoints: number;
  deuceType: "advantage" | "sudden_death_golden_point";
  maxDeucePoints?: number;
  equipment: EquipmentConfig;
}

export interface GameSession {
  id: string;
  publicSlug: string;
  adminKey: string;
  title: string;
  sport: SportType;
  courtCount: number;
  status: SessionStatus;
  sportConfig: SportConfig;
  players: Player[];
  courts: Court[];
  matches: Match[];
  currentRound: number;

  // Waktu sewa & Prediksi Algoritma Mabar
  startTime: string; // contoh "19:00"
  durationHours: number; // contoh 1, 2, 3, atau angka desimal custom
  matchDurationMinutes: number; // estimasi 1 match (contoh 12, 15, 20, atau custom menit)
  algorithm: MatchmakingAlgorithm;
  estimatedMatchesCount: number; // (durationHours * 60 / matchDurationMinutes * courtCount) + 10 extra matches

  sultanSponsor?: string;
  createdAt: string;
  updatedAt: string;
}
