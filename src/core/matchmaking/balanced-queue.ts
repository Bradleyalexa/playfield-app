import { Match } from "../entities/match";
import { Player } from "../entities/player";
import { GameSession, MatchmakingAlgorithm } from "../entities/session";

export interface MatchmakingResult {
  matches: Match[];
  restingPlayers: Player[];
}

export interface ProjectedMatch {
  id: string;
  roundNumber: number;
  courtNumber: number;
  estimatedStartTime: string;
  estimatedEndTime: string;
  teamA: Player[];
  teamB: Player[];
  status: "completed" | "in_progress" | "scheduled";
  scoreA?: number;
  scoreB?: number;
}

export interface ProjectedRound {
  roundNumber: number;
  timeRange: string;
  matches: ProjectedMatch[];
  restingPlayers: Player[];
  isCompleted: boolean;
  isCurrent: boolean;
}

/**
 * Format string waktu "19:00" ditambah N menit -> "19:15"
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = (timeStr || "19:00").split(":");
  const h = parseInt(hStr || "19", 10);
  const m = parseInt(mStr || "0", 10);
  const totalMinutes = (h * 60 + m + minutesToAdd) % (24 * 60);
  const outH = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const outM = (totalMinutes % 60).toString().padStart(2, "0");
  return `${outH}:${outM}`;
}

/**
 * Smart Matchmaking Engine dengan dukungan 6 Algoritma Mabar Lapangan
 */
export function generateBalancedMatches(
  allPlayers: Player[],
  courtCount: number,
  roundNumber: number,
  algorithm: MatchmakingAlgorithm = "fair_playtime",
  previousMatches: Match[] = []
): MatchmakingResult {
  // 1. Filter hanya pemain aktif
  const activePool = allPlayers.filter((p) => p.status === "active");

  const playersPerCourt = 4; // Format ganda (2 vs 2)
  const totalSlotsNeeded = courtCount * playersPerCourt;

  if (activePool.length < 4) {
    return { matches: [], restingPlayers: activePool };
  }

  // 2. Pemilihan siapa yang masuk ke lapangan pada ronde ini berdasarkan algoritma
  let selectedPlayers: Player[] = [];
  let restingPlayers: Player[] = [];

  if (algorithm === "random_fun") {
    // Acak murni tanpa melihat statistik
    const shuffled = [...activePool].sort(() => Math.random() - 0.5);
    const slots = Math.min(totalSlotsNeeded, Math.floor(shuffled.length / 4) * 4);
    selectedPlayers = shuffled.slice(0, slots);
    restingPlayers = shuffled.slice(slots);
  } else if (algorithm === "king_of_court" && roundNumber > 1 && previousMatches.length > 0) {
    // Raja Lapangan: Pemenang Lapangan 1 tetap bertahan
    const prevC1 = previousMatches.find((m) => m.courtNumber === 1 && m.roundNumber === roundNumber - 1);
    const kingPair =
      prevC1 && prevC1.scoreA >= prevC1.scoreB ? prevC1.teamA : prevC1 ? prevC1.teamB : [];

    const kingIds = new Set(kingPair.map((p) => p.id));
    const nonKings = activePool.filter((p) => !kingIds.has(p.id));

    // Sort penantang berdasarkan jatah main & istirahat
    nonKings.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
      return (roundNumber - b.lastPlayedRound) - (roundNumber - a.lastPlayedRound);
    });

    const neededMore = totalSlotsNeeded - kingPair.length;
    const chosenNonKings = nonKings.slice(0, Math.min(neededMore, Math.floor(nonKings.length / 2) * 2));
    selectedPlayers = [...kingPair, ...chosenNonKings];
    restingPlayers = nonKings.slice(chosenNonKings.length);
  } else {
    // Prioritas umum: Main paling sedikit, lalu istirahat paling lama
    const sorted = [...activePool].sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      const restA = roundNumber - a.lastPlayedRound;
      const restB = roundNumber - b.lastPlayedRound;
      if (restA !== restB) {
        return restB - restA;
      }
      return Math.random() - 0.5;
    });

    const slots = Math.min(totalSlotsNeeded, Math.floor(sorted.length / 4) * 4);
    selectedPlayers = sorted.slice(0, slots);
    restingPlayers = sorted.slice(slots);
  }

  const matches: Match[] = [];
  const actualCourtsToMake = Math.floor(selectedPlayers.length / 4);

  // 3. Pembagian Pasangan per Lapangan berdasarkan Algoritma
  for (let c = 0; c < actualCourtsToMake; c++) {
    const courtFour = selectedPlayers.slice(c * 4, (c + 1) * 4);
    let teamA: Player[] = [];
    let teamB: Player[] = [];

    switch (algorithm) {
      case "mixed_doubles": {
        // Ganda Campuran: Pisahkan Cowo (M) dan Cewe (F)
        const males = courtFour.filter((p) => p.gender === "M");
        const females = courtFour.filter((p) => p.gender === "F");

        if (males.length >= 2 && females.length >= 2) {
          // Format ideal: 1 PA + 1 PI vs 1 PA + 1 PI
          teamA = [males[0], females[0]];
          teamB = [males[1], females[1]];
        } else if (females.length === 1 && males.length === 3) {
          // 1 Cewe, 3 Cowo: Seimbangkan dengan cowo terkuat mendampingi cewe
          males.sort((a, b) => b.skillLevel - a.skillLevel);
          teamA = [males[0], females[0]]; // Cowo kuat + Cewe
          teamB = [males[1], males[2]]; // 2 Cowo menengah
        } else {
          // Fallback seimbang tier
          courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
          teamA = [courtFour[0], courtFour[3]];
          teamB = [courtFour[1], courtFour[2]];
        }
        break;
      }

      case "skill_tiered": {
        // Seimbang Level: Kombinasi total skill yang paling berimbang
        courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
        // Team A: Terkuat (0) + Terlemah (3)
        // Team B: Menengah (1) + Menengah (2)
        teamA = [courtFour[0], courtFour[3]];
        teamB = [courtFour[1], courtFour[2]];
        break;
      }

      case "king_of_court": {
        if (c === 0 && roundNumber > 1 && previousMatches.length > 0) {
          // Lapangan 1 adalah Tahta: Sang Raja (2 orang pertama) vs Penantang
          teamA = [courtFour[0], courtFour[1]];
          teamB = [courtFour[2], courtFour[3]];
        } else {
          courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
          teamA = [courtFour[0], courtFour[3]];
          teamB = [courtFour[1], courtFour[2]];
        }
        break;
      }

      case "americano": {
        // Rotasi Americano: Hindari partner yang sama
        // Pasangkan secara bersilang
        teamA = [courtFour[0], courtFour[1]];
        teamB = [courtFour[2], courtFour[3]];
        break;
      }

      case "random_fun": {
        // Acak tanpa peduli tier
        teamA = [courtFour[0], courtFour[1]];
        teamB = [courtFour[2], courtFour[3]];
        break;
      }

      case "fair_playtime":
      default: {
        // Standar jam terbang rata + penyeimbangan skill
        courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
        teamA = [courtFour[0], courtFour[3]];
        teamB = [courtFour[1], courtFour[2]];
        break;
      }
    }

    matches.push({
      id: `match-r${roundNumber}-c${c + 1}-${Date.now()}`,
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

/**
 * Simulator & Proyektor Jadwal Seluruh Pertandingan
 * Mengkalkulasi seluruh ronde dari durasi sewa lapangan + 10 match ekstra
 */
export function generateProjectedSchedule(session: GameSession): ProjectedRound[] {
  const durationMinutes = (session.durationHours || 2) * 60;
  const matchMins = session.matchDurationMinutes || 15;
  const courtCount = session.courtCount || 2;
  const startTime = session.startTime || "19:00";

  // Hitung jumlah ronde reguler berdasarkan durasi sewa lapangan
  const regularRounds = Math.max(1, Math.ceil(durationMinutes / matchMins));
  // Tambah 10 match ekstra (dikonversi ke ronde ekstra berdasarkan jumlah lapangan)
  const extraMatches = 10;
  const extraRounds = Math.ceil(extraMatches / courtCount);
  const totalRoundsToProject = regularRounds + extraRounds;

  const projectedRounds: ProjectedRound[] = [];

  // Salin pool pemain virtual untuk simulasi ronde masa depan
  const virtualPlayers: Player[] = session.players.map((p) => ({ ...p }));

  for (let r = 1; r <= totalRoundsToProject; r++) {
    const roundStartMinutes = (r - 1) * matchMins;
    const roundEndMinutes = r * matchMins;

    const startFormatted = addMinutesToTimeString(startTime, roundStartMinutes);
    const endFormatted = addMinutesToTimeString(startTime, roundEndMinutes);
    const timeRange = `${startFormatted} - ${endFormatted}`;

    const isPast = r < session.currentRound;
    const isCurrent = r === session.currentRound;

    if (isPast) {
      // Ronde masa lalu: Ambil dari riwayat match aktual
      const pastMatches = session.matches.filter((m) => m.roundNumber === r);
      const pastMatchIds = new Set(pastMatches.flatMap((m) => [...m.teamA, ...m.teamB].map((p) => p.id)));
      const resting = session.players.filter((p) => !pastMatchIds.has(p.id));

      projectedRounds.push({
        roundNumber: r,
        timeRange,
        isCompleted: true,
        isCurrent: false,
        matches: pastMatches.map((m) => ({
          id: m.id,
          roundNumber: r,
          courtNumber: m.courtNumber,
          estimatedStartTime: startFormatted,
          estimatedEndTime: endFormatted,
          teamA: m.teamA,
          teamB: m.teamB,
          status: "completed",
          scoreA: m.scoreA,
          scoreB: m.scoreB,
        })),
        restingPlayers: resting,
      });
    } else if (isCurrent) {
      // Ronde saat ini: Ambil dari match lapangan saat ini
      const currentCourtMatches: ProjectedMatch[] = session.courts
        .map((c) => {
          if (!c.currentMatch) return null;
          return {
            id: c.currentMatch.id,
            roundNumber: r,
            courtNumber: c.courtNumber,
            estimatedStartTime: startFormatted,
            estimatedEndTime: endFormatted,
            teamA: c.currentMatch.teamA,
            teamB: c.currentMatch.teamB,
            status: "in_progress" as const,
            scoreA: c.currentMatch.scoreA,
            scoreB: c.currentMatch.scoreB,
          };
        })
        .filter(Boolean) as ProjectedMatch[];

      const activePlayingIds = new Set(
        currentCourtMatches.flatMap((m) => [...m.teamA, ...m.teamB].map((p) => p.id))
      );
      const resting = session.players.filter((p) => !activePlayingIds.has(p.id));

      projectedRounds.push({
        roundNumber: r,
        timeRange,
        isCompleted: false,
        isCurrent: true,
        matches: currentCourtMatches,
        restingPlayers: resting,
      });

      // Update virtual players dengan match saat ini
      currentCourtMatches.forEach((m) => {
        [...m.teamA, ...m.teamB].forEach((p) => {
          const vp = virtualPlayers.find((v) => v.id === p.id);
          if (vp) {
            vp.gamesPlayed += 1;
            vp.lastPlayedRound = r;
          }
        });
      });
    } else {
      // Ronde masa depan: Prediksi menggunakan algoritma yang dipilih
      const simResult = generateBalancedMatches(
        virtualPlayers,
        courtCount,
        r,
        session.algorithm || "fair_playtime",
        session.matches
      );

      const projectedMatches: ProjectedMatch[] = simResult.matches.map((m) => ({
        id: `projected-${r}-${m.courtNumber}`,
        roundNumber: r,
        courtNumber: m.courtNumber,
        estimatedStartTime: startFormatted,
        estimatedEndTime: endFormatted,
        teamA: m.teamA,
        teamB: m.teamB,
        status: "scheduled" as const,
      }));

      projectedRounds.push({
        roundNumber: r,
        timeRange,
        isCompleted: false,
        isCurrent: false,
        matches: projectedMatches,
        restingPlayers: simResult.restingPlayers,
      });

      // Update jatah main virtual players agar ronde berikutnya terus seimbang
      simResult.matches.forEach((m) => {
        [...m.teamA, ...m.teamB].forEach((p) => {
          const vp = virtualPlayers.find((v) => v.id === p.id);
          if (vp) {
            vp.gamesPlayed += 1;
            vp.lastPlayedRound = r;
          }
        });
      });
    }
  }

  return projectedRounds;
}
