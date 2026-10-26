export type Gender = "M" | "F";

export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 1: Newbie, 2: Beginner, 3: Intermediate, 4: Advanced, 5: Pro

export type PublicTier = "newbie" | "beginner" | "intermediate" | "advanced" | "pro" | "kentang" | "hore" | "suhu";

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
      return "newbie";
    case 2:
      return "beginner";
    case 3:
      return "intermediate";
    case 4:
      return "advanced";
    case 5:
      return "pro";
    default:
      return "intermediate";
  }
}

export function getTierLabel(tier: PublicTier | string): { label: string; badgeColor: string; description: string } {
  switch (tier) {
    case "newbie":
    case "pemula_baru":
      return {
        label: "Newbie",
        badgeColor: "bg-[#e2e8f0] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain baru belajar, latihan servis aman dan pengenalan dasar raket",
      };
    case "kentang":
    case "beginner":
      return {
        label: "Beginner",
        badgeColor: "bg-[#fef08a] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain level pemula, paham aturan main, reli dasar teratur, dan servis aman",
      };
    case "hore":
    case "intermediate":
      return {
        label: "Intermediate",
        badgeColor: "bg-[#a7f3d0] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain level menengah, reli konsisten, drive aktif, dan penempatan bola terarah",
      };
    case "suhu":
    case "advanced":
      return {
        label: "Advanced",
        badgeColor: "bg-[#7dd3fc] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain tingkat mahir, smash tajam, defense rapat, footwork rapi, dan taktik matang",
      };
    case "pro":
    case "pelatnas":
    case "master":
    case "atlet":
    default:
      return {
        label: "Pro",
        badgeColor: "bg-[#f472b6] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black uppercase",
        description: "Pemain elit / atlet / semi-pro berkecepatan tinggi, fisik prima, dan akurasi turnamen",
      };
  }
}
