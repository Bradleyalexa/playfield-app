export type Gender = "M" | "F";

export type SkillLevel = 1 | 2 | 3; // 1: Beginner (Kentang), 2: Intermediate (Hore), 3: Pro/Mahir (Suhu)

export type PublicTier = "kentang" | "hore" | "suhu";

export type PlayerStatus = "active" | "paused" | "departed";

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  skillLevel: SkillLevel;
  publicTier: PublicTier;
  gamesPlayed: number;
  lastPlayedRound: number;
  status: PlayerStatus;
  eloRating: number;
  createdAt: string;
  isArrived?: boolean; // true: sudah tiba di GOR (aktif matchmaking), false: belum tiba / OTW (ditahan dari rotasi lapangan)
}

export function getTierFromSkill(skill: SkillLevel): PublicTier {
  switch (skill) {
    case 1:
      return "kentang";
    case 2:
      return "hore";
    case 3:
      return "suhu";
    default:
      return "hore";
  }
}

export function getTierLabel(tier: PublicTier | string): { label: string; badgeColor: string; description: string } {
  switch (tier) {
    case "kentang":
      return {
        label: "Tier Kentang",
        badgeColor: "bg-[#fef08a] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemula antusias, yang penting keringatan dan ceria",
      };
    case "hore":
      return {
        label: "Tier Hore",
        badgeColor: "bg-[#a7f3d0] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Reli jalan, penempatan bola lumayan, mabar rutin",
      };
    case "suhu":
    case "pelatnas": // Fallback kompatibilitas jika ada data lama
    default:
      return {
        label: "Tier Suhu",
        badgeColor: "bg-[#7dd3fc] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain mahir/pro, pukulan tajam, footwork rapi & spesialis turnamen",
      };
  }
}
