export type Gender = "M" | "F";

export type SkillLevel = 1 | 2 | 3; // 1: Beginner, 2: Intermediate, 3: Advanced

export type PublicTier = "beginner" | "intermediate" | "advanced" | "kentang" | "hore" | "suhu";

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
      return "beginner";
    case 2:
      return "intermediate";
    case 3:
      return "advanced";
    default:
      return "intermediate";
  }
}

export function getTierLabel(tier: PublicTier | string): { label: string; badgeColor: string; description: string } {
  switch (tier) {
    case "kentang":
    case "beginner":
      return {
        label: "Beginner",
        badgeColor: "bg-[#fef08a] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain level pemula, fokus reli dasar dan keseruan bermain",
      };
    case "hore":
    case "intermediate":
      return {
        label: "Intermediate",
        badgeColor: "bg-[#a7f3d0] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain level menengah, reli konsisten dan penempatan bola terarah",
      };
    case "suhu":
    case "advanced":
    case "pelatnas": // Fallback kompatibilitas jika ada data lama
    default:
      return {
        label: "Advanced",
        badgeColor: "bg-[#7dd3fc] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain tingkat mahir, pukulan tajam, footwork rapi, dan taktik matang",
      };
  }
}
