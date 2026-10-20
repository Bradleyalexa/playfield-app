export type Gender = "M" | "F";

export type SkillLevel = 1 | 2 | 3; // 1: Beginner, 2: Intermediate, 3: Pro

export type PublicTier = "kentang" | "hore" | "suhu" | "pelatnas";

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

export function getTierLabel(tier: PublicTier): { label: string; badgeColor: string; description: string } {
  switch (tier) {
    case "kentang":
      return {
        label: "Tier Kentang",
        badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        description: "Pemula antusias, yang penting keringatan dan ceria",
      };
    case "hore":
      return {
        label: "Tier Hore",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        description: "Reli jalan, penempatan bola lumayan, mabar rutin",
      };
    case "suhu":
      return {
        label: "Tier Suhu",
        badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        description: "Pukulan tajam, footwork rapi, spesialis turnamen",
      };
    case "pelatnas":
      return {
        label: "Tier Pelatnas",
        badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        description: "Mantan atlet GOR, smash petir tak terbendung",
      };
  }
}
