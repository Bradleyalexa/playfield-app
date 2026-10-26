import { Gender, getTierFromSkill, Player, SkillLevel } from "../entities/player";

export interface ParsedPlayerResult {
  name: string;
  gender: Gender;
  skillLevel: SkillLevel;
}

/**
 * Smart WhatsApp List Parser
 * Parses Indonesian WhatsApp group registration text into structured players
 */
export function parseWhatsAppList(rawText: string): ParsedPlayerResult[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const results: ParsedPlayerResult[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Abaikan baris header seperti "Absen Mabar", "Jadwal", "Tanggal", dll.
    if (
      /^(absen|jadwal|mabar|lapangan|gor|tanggal|hari|jam|biaya|info|perhatian|cadangan|waiting\s*list)/i.test(
        trimmed
      )
    ) {
      continue;
    }

    // 1. Bersihkan prefix nomor atau bullet: "1.", "2)", "3 -", "[4]", "- "
    let cleanLine = trimmed.replace(/^(\d+[\.\)\-\]]|\-\s*|•\s*|\[\d+\])\s*/i, "").trim();
    if (!cleanLine) continue;

    // 2. Deteksi Gender (M / W / Men / Women / L / P / Cowok / Cewek / Pria / Wanita)
    let gender: Gender = "M";
    if (/\b(w|woman|women|p|putri|cewek|wanita|female|f|pi)\b/i.test(cleanLine)) {
      gender = "F";
    }

    // 3. Deteksi Skill Level (Beg / Inter / Pro / Suhu / Kentang)
    let skillLevel: SkillLevel = 2; // Default Intermediate
    if (/\b(beg|beginner|pemula|kentang|dasar|baru|level\s*1)\b/i.test(cleanLine)) {
      skillLevel = 1;
    } else if (/\b(pro|suhu|pelatnas|atlet|advance|ahli|level\s*3)\b/i.test(cleanLine)) {
      skillLevel = 3;
    } else if (/\b(inter|intermediate|menengah|sedang|hore|level\s*2)\b/i.test(cleanLine)) {
      skillLevel = 2;
    }

    // 4. Bersihkan nama dari tag kurung: (L), (Pro), [Lunas], [Tamu], dll.
    let cleanName = cleanLine
      .replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]/g, " ") // Hapus semua teks dalam tanda kurung
      .replace(/\s*[-–—]\s*(lunas|transfer|bayar|tamu|cash|dp|pending).*$/i, "") // Hapus status bayar di belakang strip
      .replace(/\s+/g, " ")
      .trim();

    if (cleanName.length >= 2) {
      results.push({
        name: cleanName,
        gender,
        skillLevel,
      });
    }
  }

  return results;
}

/**
 * Convert parsed results into full Player entities
 */
export function createPlayersFromParsed(
  parsed: ParsedPlayerResult[],
  defaultArrived: boolean = true
): Player[] {
  return parsed.map((item, index) => {
    const id = `p-${Date.now()}-${index + 1}`;
    return {
      id,
      name: item.name,
      gender: item.gender,
      skillLevel: item.skillLevel,
      publicTier: getTierFromSkill(item.skillLevel),
      gamesPlayed: 0,
      lastPlayedRound: 0,
      status: "active",
      eloRating: 1000 + (item.skillLevel - 2) * 100,
      createdAt: new Date().toISOString(),
      isArrived: defaultArrived,
    };
  });
}
