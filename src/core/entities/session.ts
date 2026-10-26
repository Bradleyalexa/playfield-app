import { Court, Match } from "./match";
import { Player } from "./player";

export type SportType = "badminton" | "tennis" | "padel";

export type SessionStatus = "active" | "completed" | "archived";

export type MatchmakingAlgorithm =
  | "playfields_mix"  // Playfield's (Smart All-in-One: Pemerataan Giliran + Level + Gender Seimbang Tanpa Wajib Skor)
  | "hybrid_2plus2"   // Hybrid 2+2 (Game 1-2 Mix Level, Game 3-4 Level Sama / Same Tier)
  | "fair_playtime"   // Giliran Main Rata (Paling lama istirahat & main paling sedikit)
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
  playfields_mix: {
    id: "playfields_mix",
    name: "Playfield's Mix (Smart All-in-One Balanced)",
    shortName: "Playfield's",
    badge: "REKOMENDASI UTAMA",
    badgeColor: "bg-[#ccff00] text-black border-2 border-black",
    icon: "🔥",
    description: "Algoritma cerdas unggulan Playfield: otomatis seimbangkan pemerataan giliran main (jumlah match rata), level skill anti-jomplang, dan komposisi gender tanpa perlu pusing input skor.",
    bestFor: "Paling direkomendasikan untuk 95% mabar komunitas. Adil, reli seru seimbang, dan 100% bebas ribet.",
  },
  hybrid_2plus2: {
    id: "hybrid_2plus2",
    name: "Hybrid 2+2 (Mix Level & Level Sama)",
    shortName: "Hybrid 2+2",
    badge: "HYBRID FAVORIT",
    badgeColor: "bg-[#d946ef] text-white border-2 border-black",
    icon: "🔀",
    description: "Format favorit mabar: Game 1–2 otomatis Mix Level (Suhu + Pemula vs Menengah) untuk pemanasan & membaur, lalu Game 3–4 otomatis Level Sama (Suhu vs Suhu / Pemula vs Pemula) untuk adu skill maksimal.",
    bestFor: "Komunitas dengan disparitas level beragam: 2 game awal ramah & membimbing pemula, 2 game akhir kompetitif adu skill.",
  },
  fair_playtime: {
    id: "fair_playtime",
    name: "Giliran Main Rata (Fair Play & Rest)",
    shortName: "Giliran Main Rata",
    badge: "POPULER",
    badgeColor: "bg-[#7dd3fc] text-black",
    icon: "⚖️",
    description: "Memprioritaskan pemain yang paling sedikit bermain dan paling lama duduk istirahat agar jatah waktu sewa dinikmati rata.",
    bestFor: "Mabar komunitas rutin dengan jumlah pemain lebih dari kapasitas lapangan (ada antrean istirahat).",
  },
  mixed_doubles: {
    id: "mixed_doubles",
    name: "Ganda Campuran (Men + Women / Mixed)",
    shortName: "Ganda Campuran",
    badge: "GENDER BALANCED",
    badgeColor: "bg-[#f472b6] text-black",
    icon: "👫",
    description: "Memasangkan 1 Pemain Men (M) + 1 Pemain Women (W) di tiap kubu (XD vs XD) atau menyeimbangkan komposisi gender per lapangan.",
    bestFor: "Mabar yang dihadiri pemain Men dan Women agar tidak terjadi timpang pasangan.",
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

export type EquipmentPricingModel = "per_unit" | "per_slop";

export interface EquipmentConfig {
  enabled?: boolean; // false jika paket all-in-one / tanpa hitung cock
  unitName: "shuttlecock" | "ball_can" | "padel_ball";
  totalUsed: number;
  costPerUnit: number;
  billingMode: "shared_all" | "per_match";
  pricingModel?: EquipmentPricingModel;
  costPerSlop?: number;
  unitsPerSlop?: number;
  slopUsed?: number;
}

export function calculateEquipmentCost(equipment?: EquipmentConfig): number {
  if (!equipment || equipment.enabled === false) return 0;
  const model = equipment.pricingModel || "per_unit";

  if (model === "per_slop") {
    const costPerSlop = equipment.costPerSlop ?? 140000;
    const unitsPerSlop = equipment.unitsPerSlop || 12;
    // Jika host menentukan slop yang dibuka
    if (typeof equipment.slopUsed === "number" && equipment.slopUsed > 0) {
      return equipment.slopUsed * costPerSlop;
    }
    // Jika hanya mencatat butir kok, hitung estimasi slop yang terpakai
    if (equipment.totalUsed > 0) {
      const slops = Math.ceil(equipment.totalUsed / unitsPerSlop);
      return slops * costPerSlop;
    }
    return 0;
  }

  return (equipment.totalUsed || 0) * (equipment.costPerUnit || 12000);
}

export type BillingModel = "fixed_per_person" | "track_equipment" | "none";

export interface SessionBillingConfig {
  model: BillingModel;
  fixedPricePerPerson?: number;      // misal Rp 40.000 / orang
  courtRentalFee?: number;           // misal Rp 160.000 (total sewa lapangan)
  otherFee?: number;                 // misal Rp 20.000 (air mineral / shuttlecock fee tambahan)
  otherFeeDescription?: string;      // misal "Air Mineral"
  bankName?: string;                 // misal "BCA", "Mandiri", "GoPay", "OVO", dll
  accountNumber?: string;            // misal "1234567890"
  accountHolder?: string;            // misal "Alexander"
}

export interface SessionBillingSummary {
  model: BillingModel;
  courtRentalFee: number;
  equipmentFee: number;
  otherFee: number;
  totalCost: number;
  costPerPerson: number;
  playerCount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export function calculateSessionBilling(session: GameSession): SessionBillingSummary {
  const playerCount = session.players.length;
  const billing: SessionBillingConfig = session.billing || {
    model: session.sportConfig.equipment.enabled !== false ? "track_equipment" : "none",
  };

  if (billing.model === "none") {
    return {
      model: "none",
      courtRentalFee: 0,
      equipmentFee: 0,
      otherFee: 0,
      totalCost: 0,
      costPerPerson: 0,
      playerCount,
      bankName: billing.bankName,
      accountNumber: billing.accountNumber,
      accountHolder: billing.accountHolder,
    };
  }

  if (billing.model === "fixed_per_person") {
    const costPerPerson = billing.fixedPricePerPerson ?? 35000;
    const totalCost = costPerPerson * playerCount;
    return {
      model: "fixed_per_person",
      courtRentalFee: billing.courtRentalFee || 0,
      equipmentFee: 0,
      otherFee: 0,
      totalCost,
      costPerPerson,
      playerCount,
      bankName: billing.bankName,
      accountNumber: billing.accountNumber,
      accountHolder: billing.accountHolder,
    };
  }

  // Model "track_equipment" (Itung kok + sewa lapangan)
  const equipmentFee = calculateEquipmentCost(session.sportConfig.equipment);
  const courtRentalFee = billing.courtRentalFee ?? 0;
  const otherFee = billing.otherFee ?? 0;
  const totalCost = courtRentalFee + equipmentFee + otherFee;
  const costPerPerson = playerCount > 0 ? Math.ceil(totalCost / playerCount) : 0;

  return {
    model: "track_equipment",
    courtRentalFee,
    equipmentFee,
    otherFee,
    totalCost,
    costPerPerson,
    playerCount,
    bankName: billing.bankName,
    accountNumber: billing.accountNumber,
    accountHolder: billing.accountHolder,
  };
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
  sessionDate?: string; // contoh "2026-10-21"
  startTime: string; // contoh "19:00"
  durationHours: number; // contoh 1, 2, 3, atau angka desimal custom
  matchDurationMinutes: number; // estimasi 1 match (contoh 12, 15, 20, atau custom menit)
  algorithm: MatchmakingAlgorithm;
  estimatedMatchesCount: number; // (durationHours * 60 / matchDurationMinutes * courtCount) + 10 extra matches

  // Lokasi & Link Google Maps Lapangan
  courtLocation?: string; // contoh "GOR Tomang Barat, Lapangan 1-2"
  googleMapsUrl?: string; // contoh "https://maps.app.goo.gl/..."

  // Pengaturan Biaya & Split Bill Patungan
  billing?: SessionBillingConfig;

  // Izin input skor dari penonton/wasit (Scan QR / Link Publik)
  allowSpectatorScoreUpdate?: boolean;

  sultanSponsor?: string;
  createdAt: string;
  updatedAt: string;
}
