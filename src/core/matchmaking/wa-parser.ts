import { Gender, getTierFromSkill, Player, SkillLevel } from "../entities/player";

export interface ParsedPlayerResult {
  name: string;
  gender: Gender;
  skillLevel: SkillLevel;
}

export interface ParsedWhatsAppSessionMetadata {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  courtCount?: number;
  fixedPrice?: number;
}

/**
 * Checks if a line is a known non-player header, metadata, or WhatsApp chat chatter
 */
function isNonPlayerLine(text: string): boolean {
  const t = text.trim();
  if (!t) return true;

  // 1. Chatter, group mentions, broadcast calls
  if (/@(all|everyone|here|channel)\b/i.test(t)) return true;
  if (
    /\b(open list|closed|close list|list yuk|yuk list|gas mabar|siapa lagi|tolong confirm|confirm ya|ditunggu ya|slot penuh|sudah penuh|full|terima kasih|thank you|makasih)\b/i.test(
      t
    )
  ) {
    return true;
  }

  // 2. Just decorative dividers: "---", "===", "***", "___"
  if (/^[-–—=*_~#\s]+$/.test(t)) return true;

  // 3. Decorated headers like "-Pengen Badmin-", "=== MABAR BADMINTON ==="
  if (
    /^[-–—=*~#\s]*[A-Za-z0-9\s]+[-–—=*~#\s]*$/.test(t) &&
    /^(pengen badmin|mabar|absen|info|jadwal|perhatian|rules|catatan|notes?)$/i.test(
      t.replace(/[-–—=*~#\s]/g, "")
    )
  ) {
    return true;
  }

  // 4. Metadata key-value prefixes: "Venue : ...", "Jam: ...", "IDR 50.000...", etc.
  if (
    /^(hari|tgl|tanggal|waktu|jam|pukul|time|date|day|venue|lokasi|tempat|alamat|hall|gor|lap|lapangan|court|idr|rp|fee|htm|biaya|iuran|patungan|host|co-host|shuttlecock|cock|kok|bola|format|rules|aturan|rekening|rek|bca|mandiri|bri|bni|dana|gopay|ovo|qris)\s*[:=\-]/i.test(
      t
    )
  ) {
    return true;
  }

  // 5. Standalone section headers: "Players", "Peserta:", "Waiting List:", etc.
  if (
    /^(players?|peserta|members?|absen|daftar|list pemain|daftar pemain|waiting\s*list|wl)\s*[:]?$/i.test(
      t
    )
  ) {
    return true;
  }

  // 6. Day & Date patterns like "Tuesday tgl 27/10/26" or "Senin, 20 Okt 2026"
  if (
    /\b(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
      t
    ) &&
    /\b(\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s*(jan|feb|mar|apr|mei|may|jun|jul|agu|aug|sep|okt|oct|nov|des|dec))\b/i.test(
      t
    )
  ) {
    return true;
  }

  // 7. Time patterns like "🕒 9AM - 12PM" or "19.00 - 22.00 WIB"
  if (
    /[\u{1F550}-\u{1F567}\u{23F0}\u{231A}]/u.test(t) ||
    (/\b\d{1,2}(:\d{2}|\.\d{2})?\s*(am|pm)\b/i.test(t) && /[-–—~]\s*\d{1,2}/i.test(t))
  ) {
    return true;
  }

  // 8. Price / Fee patterns like "IDR 50.000/visit" or "Rp 40.000/orang"
  if (/\b(idr|rp)\.?\s*\d+/i.test(t) && /\b(visit|orang|org|sesi|pemain|pax)\b/i.test(t)) {
    return true;
  }

  // 9. Court specifications like "Lap 9-12 BCD Bawah"
  if (/^lap\s*\d+/i.test(t)) return true;

  // 10. Host announcements like "Host WL"
  if (/^host\b/i.test(t)) return true;

  return false;
}

/**
 * Checks if content is an empty placeholder slot like "-", "(open)", "kosong", "slot 8"
 */
function isPlaceholderSlot(content: string): boolean {
  // First strip emojis, brackets, and variation selectors before checking placeholder
  const c = content
    .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, "")
    .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F\u200D\u2600-\u27BF\uE000-\uF8FF]/gu, "")
    .trim()
    .toLowerCase();

  if (!c) return true;
  if (/^[-–—._~()]+$/.test(c)) return true;
  if (
    /^(open|open slot|slot|slot \d+|kosong|available|free|tba|tbd|cadangan|waiting list|wl|booked|tentative|dst)$/i.test(
      c
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Extracts clean name, gender, and skill level from a single line
 */
function processPlayerLine(rawLine: string): ParsedPlayerResult {
  const cleanLine = rawLine.trim();

  // 1. Detect Gender
  let gender: Gender = "M"; // Default Male
  if (
    /[\(\[\{/]\s*(w|women|woman|f|female|p|putri|cewek|wanita|pi)\s*[\)\]\}]/i.test(cleanLine) ||
    /[-–—/]\s*(w|women|woman|f|female|p|putri|cewek|wanita|pi)\b/i.test(cleanLine) ||
    /\b(cewek|wanita|putri|female)\b/i.test(cleanLine) ||
    /\b(siti|dewi|santi|putri|ayu|mega|fitri|rahma|merry|novi|mey|maria|linda|rina|wulan|nadia|sarah|clara|cynthia|angela|grace|shirley|jessica|michelle|stephanie|vanessa|jane)\b/i.test(
      cleanLine
    )
  ) {
    gender = "F";
  } else if (
    /[\(\[\{/]\s*(m|men|man|l|laki|pria|cowok|pa)\s*[\)\]\}]/i.test(cleanLine) ||
    /[-–—/]\s*(m|men|man|l|laki|pria|cowok|pa)\b/i.test(cleanLine) ||
    /\b(cowok|pria|laki-laki)\b/i.test(cleanLine)
  ) {
    gender = "M";
  }

  // 2. Detect Skill Level (1: Newbie, 2: Beginner, 3: Intermediate, 4: Advanced, 5: Pro)
  let skillLevel: SkillLevel = 3; // Default Intermediate
  if (/\b(newbie|pemula\s*baru|nol|zero|level\s*1|tier\s*1)\b/i.test(cleanLine)) {
    skillLevel = 1;
  } else if (/\b(pro|master|pelatnas|atlet|level\s*5|tier\s*5)\b/i.test(cleanLine)) {
    skillLevel = 5;
  } else if (/\b(adv|advanced|mahir|suhu|level\s*4|tier\s*4)\b/i.test(cleanLine)) {
    skillLevel = 4;
  } else if (/\b(beg|beginner|pemula|dasar|kentang|level\s*2|tier\s*2)\b/i.test(cleanLine)) {
    skillLevel = 2;
  } else if (/\b(inter|intermediate|menengah|sedang|hore|level\s*3|tier\s*3)\b/i.test(cleanLine)) {
    skillLevel = 3;
  }

  // 3. Clean Name: Remove brackets, status tags, mentions, and ALL emojis / checkmarks
  let cleanName = cleanLine
    .replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]/g, " ") // remove bracket content (Pro), [Lunas]
    .replace(
      /\s*[-–—/]\s*(lunas|transfer|bayar|paid|tamu|cash|dp|pending|w|m|p|l|beg|inter|adv|pro|newbie).*$/i,
      ""
    ) // remove trailing payment/status
    .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F\u200D\u2600-\u27BF\uE000-\uF8FF]/gu, "") // Clean emojis like ✅, ✔️, ☑️, 🏸, 💵, etc.
    .replace(/[@#][\w.-]+/g, "") // remove @mentions
    .replace(/\s+/g, " ")
    .trim();

  // Strip trailing punctuation
  cleanName = cleanName.replace(/[-–—.,/;]+$/, "").trim();

  return {
    name: cleanName,
    gender,
    skillLevel,
  };
}

/**
 * Smart WhatsApp List Parser
 * Parses Indonesian WhatsApp group registration text into structured players
 *
 * Handles:
 * - Numbered player lists: "1. Jane", "2) Yovi", "3 - Surya", "[4] Santo"
 * - Bulleted player lists: "- Jane", "• Yovi", "* Surya"
 * - Plain name lists (line by line)
 * - Filtering out headers, dates, venues, fee, courts, hosts, and chat chatter
 * - Multiple numbered entries on one line: "24. alex 25. kosong 26. doni"
 * - Ignoring empty slots / placeholders (e.g. "25. kosong", "4. -", "5. (open)", "6. slot")
 * - Stripping checkmark and decorative emojis: "Alex ✅", "Doni ✔️", "Santi 🏸"
 */
export function parseWhatsAppList(rawText: string): ParsedPlayerResult[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize: if multiple numbered items are on the same line (e.g. "24. alex 25. kosong 26. doni" or comma-separated)
  // split them into newlines!
  const normalizedText = rawText
    .split(/(?<=[^\r\n])[,;]?\s+(?=(?:\[?\d+[\.\)\-\]]|\(\d+\))\s+)/)
    .join("\n");

  const lines = normalizedText.split(/\r?\n/);

  // Pattern for numbered lines:
  // "1. Jane", "2) Yovi", "3 - Surya", "[4] Santo", "(5) Efendi", "   6. Santi"
  const numberedPattern = /^(?:\[?(\d+)[\.\)\-\]]|\((\d+)\))\s*(.*)$/i;
  // Pattern for bulleted lines:
  // "- Jane", "• Yovi", "* Surya"
  const bulletPattern = /^[-–—•*]\s+(.+)$/;

  // Strategy 1: Check if there are numbered lines (1. Name, 2. Name...)
  const numberedCandidates: { lineIndex: number; num: number; content: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    const match = trimmed.match(numberedPattern);
    if (match) {
      const content = match[3] ? match[3].trim() : "";
      if (!isPlaceholderSlot(content) && !isNonPlayerLine(content)) {
        numberedCandidates.push({
          lineIndex: i,
          num: parseInt(match[1] || match[2], 10),
          content,
        });
      }
    }
  }

  // If at least 2 numbered lines are found, strictly parse numbered players
  if (numberedCandidates.length >= 2) {
    return numberedCandidates
      .map((c) => processPlayerLine(c.content))
      .filter((p) => p.name && p.name.length >= 2);
  }

  // Strategy 2: Check for bulleted lines
  const bulletCandidates: { lineIndex: number; content: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    const match = trimmed.match(bulletPattern);
    if (match) {
      const content = match[1].trim();
      if (!isPlaceholderSlot(content) && !isNonPlayerLine(content)) {
        bulletCandidates.push({ lineIndex: i, content });
      }
    }
  }

  if (bulletCandidates.length >= 2) {
    return bulletCandidates
      .map((c) => processPlayerLine(c.content))
      .filter((p) => p.name && p.name.length >= 2);
  }

  // Strategy 3: Plain unnumbered lines
  const results: ParsedPlayerResult[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isNonPlayerLine(trimmed)) continue;
    if (isPlaceholderSlot(trimmed)) continue;

    const player = processPlayerLine(trimmed);
    if (player.name && player.name.length >= 2) {
      results.push(player);
    }
  }

  return results;
}

/**
 * Extracts optional session metadata (title, venue, date, time, courts, fee)
 * from a WhatsApp invitation message.
 */
export function parseWhatsAppMetadata(rawText: string): ParsedWhatsAppSessionMetadata {
  if (!rawText || !rawText.trim()) return {};

  const lines = rawText.split(/\r?\n/);
  const metadata: ParsedWhatsAppSessionMetadata = {};

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    // Venue
    const venueMatch = t.match(/^(?:venue|lokasi|tempat|alamat|gor|hall)\s*[:=\-]\s*(.+)$/i);
    if (venueMatch && !metadata.venue) {
      metadata.venue = venueMatch[1].trim();
    }

    // Court count (e.g. "Lap 9-12", "Lapangan 1, 2, 3", "2 Lapangan")
    const courtRangeMatch = t.match(/lap(?:angan)?\s*(\d+)\s*[-–—]\s*(\d+)/i);
    if (courtRangeMatch && !metadata.courtCount) {
      const start = parseInt(courtRangeMatch[1], 10);
      const end = parseInt(courtRangeMatch[2], 10);
      metadata.courtCount = Math.max(1, Math.min(6, end - start + 1));
    } else {
      const courtCountMatch = t.match(/(\d+)\s*lap(?:angan)?/i);
      if (courtCountMatch && !metadata.courtCount) {
        metadata.courtCount = Math.max(1, Math.min(6, parseInt(courtCountMatch[1], 10)));
      }
    }

    // Fee (e.g. "IDR 50.000/visit", "Rp 40.000")
    const feeMatch = t.match(/(?:idr|rp)\.?\s*([\d.,]+)/i);
    if (feeMatch && !metadata.fixedPrice) {
      const cleanNum = feeMatch[1].replace(/[.,]/g, "");
      const parsedFee = parseInt(cleanNum, 10);
      if (parsedFee >= 1000) {
        metadata.fixedPrice = parsedFee;
      }
    }

    // Time (e.g. "9AM - 12PM" or "19.00 - 22.00")
    const timeMatch12h = t.match(/(\d{1,2})\s*(am|pm)\s*[-–—]\s*(\d{1,2})\s*(am|pm)/i);
    if (timeMatch12h && !metadata.startTime) {
      let startH = parseInt(timeMatch12h[1], 10);
      const startMeridiem = timeMatch12h[2].toLowerCase();
      if (startMeridiem === "pm" && startH < 12) startH += 12;
      if (startMeridiem === "am" && startH === 12) startH = 0;
      metadata.startTime = `${String(startH).padStart(2, "0")}:00`;
    }

    const timeMatch24h = t.match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/);
    if (timeMatch24h && !metadata.startTime) {
      metadata.startTime = `${String(parseInt(timeMatch24h[1], 10)).padStart(2, "0")}:${timeMatch24h[2]}`;
    }

    // Title / Group name from first decorated line (e.g. "-Pengen Badmin-")
    if (!metadata.title && /^[-–—=*~#\s]+([A-Za-z0-9\s]+)[-–—=*~#\s]+$/.test(t)) {
      const titleMatch = t.match(/^[-–—=*~#\s]+([A-Za-z0-9\s]+)[-–—=*~#\s]+$/);
      if (titleMatch && titleMatch[1].trim().length >= 3) {
        metadata.title = titleMatch[1].trim();
      }
    }
  }

  return metadata;
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
      eloRating: 1000 + (item.skillLevel - 3) * 100,
      createdAt: new Date().toISOString(),
      isArrived: defaultArrived,
    };
  });
}
