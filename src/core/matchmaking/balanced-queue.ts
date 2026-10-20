import { Match } from "../entities/match";
import { Player } from "../entities/player";

export interface MatchmakingResult {
  matches: Match[];
  restingPlayers: Player[];
}

/**
 * Smart Balanced Doubles Matchmaking Algorithm
 * Balances playing time, rest duration, and combined skill tiers
 */
export function generateBalancedMatches(
  allPlayers: Player[],
  courtCount: number,
  roundNumber: number
): MatchmakingResult {
  // 1. Filter hanya pemain aktif (bukan yang sedang kram, istirahat, atau pulang)
  const activePool = allPlayers.filter((p) => p.status === "active");

  const playersPerCourt = 4; // Format ganda (2 vs 2)
  const totalSlotsNeeded = courtCount * playersPerCourt;

  // Jika jumlah pemain kurang dari 4, tidak bisa buat match
  if (activePool.length < 4) {
    return { matches: [], restingPlayers: activePool };
  }

  // 2. Sorting prioritas bermain:
  // - Pemain dengan gamesPlayed paling sedikit didahulukan.
  // - Jika sama, yang istirahat paling lama (roundNumber - lastPlayedRound tertinggi) didahulukan.
  // - Sedikit random jitter agar urutan tidak monoton.
  const sortedPlayers = [...activePool].sort((a, b) => {
    if (a.gamesPlayed !== b.gamesPlayed) {
      return a.gamesPlayed - b.gamesPlayed;
    }
    const restA = roundNumber - a.lastPlayedRound;
    const restB = roundNumber - b.lastPlayedRound;
    if (restA !== restB) {
      return restB - restA; // Yang lebih lama istirahat lebih prioritas
    }
    return Math.random() - 0.5;
  });

  // Ambil pemain untuk lapangan aktif dan sisanya sebagai resting
  const selectedForCourts = sortedPlayers.slice(0, Math.min(totalSlotsNeeded, Math.floor(sortedPlayers.length / 4) * 4));
  const restingPlayers = sortedPlayers.slice(selectedForCourts.length);

  const matches: Match[] = [];
  const actualCourtsToMake = Math.floor(selectedForCourts.length / 4);

  // 3. Bagi ke masing-masing court dengan penyeimbangan skill
  for (let c = 0; c < actualCourtsToMake; c++) {
    const courtFour = selectedForCourts.slice(c * 4, (c + 1) * 4);

    // Sort 4 orang berdasarkan skill (3 = Pro, 2 = Inter, 1 = Beg)
    courtFour.sort((a, b) => b.skillLevel - a.skillLevel);

    // Pasangan paling seimbang:
    // Team A: [Terkuat (0) + Pemula (3)]
    // Team B: [Menengah (1) + Menengah (2)]
    const teamA = [courtFour[0], courtFour[3]];
    const teamB = [courtFour[1], courtFour[2]];

    matches.push({
      id: `match-${Date.now()}-${c + 1}`,
      courtNumber: c + 1,
      roundNumber,
      teamA,
      teamB,
      scoreA: 0,
      scoreB: 0,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      equipmentUsedCount: 1,
    });
  }

  return {
    matches,
    restingPlayers,
  };
}
