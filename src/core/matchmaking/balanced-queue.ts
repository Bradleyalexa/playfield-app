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
  winner?: "A" | "B" | "draw";
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
 * Smart Matchmaking Engine dengan Multi-Algoritma Mabar Lapangan
 */
export function generateBalancedMatches(
  allPlayers: Player[],
  courtCount: number,
  roundNumber: number,
  algorithm: MatchmakingAlgorithm = "playfields_mix",
  previousMatches: Match[] = []
): MatchmakingResult {
  // 1. Filter hanya pemain aktif yang SUDAH TIBA di lokasi (GOR)
  // Pemain yang belum datang (isArrived === false) otomatis ditahan dari rotasi lapangan
  const activePool = allPlayers.filter((p) => p.status === "active" && p.isArrived !== false);

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
    // Prioritas umum (playfields_mix, fair_playtime, dll): Main paling sedikit, lalu istirahat paling lama
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

  // 3. Pengelompokan Pemain per Lapangan
  let courtPlayerGroups: Player[][] = [];

  if (algorithm === "hybrid_2plus2") {
    // HYBRID 2+2:
    // Game 1 & 2 (atau ronde ganjil-block): FASE MIX LEVEL (Pemanasan & Baurkan)
    // Game 3 & 4 (atau ronde genap-block): FASE LEVEL SAMA (Adu Skill Sesama Tier)
    const isMixPhase = Math.floor((roundNumber - 1) / 2) % 2 === 0;

    if (!isMixPhase) {
      // FASE 2: LEVEL SAMA (Sesama Level Skill)
      // Urutkan semua pemain terpilih dari skill tertinggi ke terendah
      // Lapangan 1 = 4 pemain skill tertinggi (Advanced vs Advanced)
      // Lapangan 2 = 4 pemain berikutnya (Intermediate vs Intermediate)
      // Lapangan 3 = 4 pemain berikutnya (Beginner vs Beginner)
      const sortedBySkill = [...selectedPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
      for (let c = 0; c < actualCourtsToMake; c++) {
        courtPlayerGroups.push(sortedBySkill.slice(c * 4, (c + 1) * 4));
      }
    } else {
      // FASE 1: MIX LEVEL (Silang Tier)
      // Distribusikan pemain lintas tier secara merata ke tiap lapangan (Cross-Tier Snake Distribution)
      const sortedBySkill = [...selectedPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
      const groups: Player[][] = Array.from({ length: actualCourtsToMake }, () => []);

      for (let layer = 0; layer < 4; layer++) {
        const layerSlice = sortedBySkill.slice(layer * actualCourtsToMake, (layer + 1) * actualCourtsToMake);
        if (layer % 2 === 1) {
          layerSlice.reverse(); // Snake draft agar total kekuatan tiap lapangan imbang
        }
        for (let c = 0; c < actualCourtsToMake; c++) {
          if (layerSlice[c]) {
            groups[c].push(layerSlice[c]);
          }
        }
      }
      courtPlayerGroups = groups;
    }
  } else {
    for (let c = 0; c < actualCourtsToMake; c++) {
      courtPlayerGroups.push(selectedPlayers.slice(c * 4, (c + 1) * 4));
    }
  }

  // 4. Pembagian Pasangan per Lapangan berdasarkan Algoritma
  for (let c = 0; c < actualCourtsToMake; c++) {
    const courtFour = courtPlayerGroups[c] || selectedPlayers.slice(c * 4, (c + 1) * 4);
    let teamA: Player[] = [];
    let teamB: Player[] = [];

    switch (algorithm) {
      case "hybrid_2plus2": {
        const isMixPhase = Math.floor((roundNumber - 1) / 2) % 2 === 0;

        if (isMixPhase) {
          // Fase Mix Level: Pasangkan Terkuat + Terlemah vs 2 Menengah
          const males = courtFour.filter((p) => p.gender === "M").sort((a, b) => b.skillLevel - a.skillLevel);
          const females = courtFour.filter((p) => p.gender === "F").sort((a, b) => b.skillLevel - a.skillLevel);

          if (males.length >= 2 && females.length >= 2) {
            teamA = [males[0], females[females.length - 1]];
            teamB = [males[1], females[0]];
          } else if (females.length === 1 && males.length === 3) {
            teamA = [males[0], females[0]];
            teamB = [males[1], males[2]];
          } else if (males.length === 1 && females.length === 3) {
            teamA = [males[0], females[females.length - 1]];
            teamB = [females[0], females[1]];
          } else {
            courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
            teamA = [courtFour[0], courtFour[3]];
            teamB = [courtFour[1], courtFour[2]];
          }
        } else {
          // Fase Level Sama: Karena 4 pemain di lapangan ini sudah selevel,
          // bentuk 2 tim yang paling seimbang di antara mereka
          courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
          teamA = [courtFour[0], courtFour[3]];
          teamB = [courtFour[1], courtFour[2]];
        }
        break;
      }

      case "playfields_mix": {
        // Playfield's Mix: Perpaduan cerdas Pemerataan Giliran Main + Keseimbangan Gender + Keseimbangan Tier (100% Bebas Input Skor)
        const males = courtFour.filter((p) => p.gender === "M").sort((a, b) => b.skillLevel - a.skillLevel);
        const females = courtFour.filter((p) => p.gender === "F").sort((a, b) => b.skillLevel - a.skillLevel);

        if (males.length >= 2 && females.length >= 2) {
          // 2 Pria & 2 Wanita: Ganda Campuran Seimbang (Pria Terkuat + Wanita Berkembang vs Pria Menengah + Wanita Terkuat)
          teamA = [males[0], females[females.length - 1]];
          teamB = [males[1], females[0]];
        } else if (females.length === 1 && males.length === 3) {
          // 1 Wanita & 3 Pria: Wanita dipasangkan dengan Pria terkuat (males[0])
          teamA = [males[0], females[0]];
          teamB = [males[1], males[2]];
        } else if (males.length === 1 && females.length === 3) {
          // 1 Pria & 3 Wanita: Pria dipasangkan dengan Wanita level berkembang, melawan 2 wanita menengah
          teamA = [males[0], females[females.length - 1]];
          teamB = [females[0], females[1]];
        } else {
          // Sesama Gender (Semua Pria atau Semua Wanita): Penyeimbangan Tier Anti-Jomplang
          courtFour.sort((a, b) => b.skillLevel - a.skillLevel);
          // Tim A: Tier Tertinggi (0) + Tier Terendah (3)
          // Tim B: Tier Menengah (1) + Tier Menengah (2)
          teamA = [courtFour[0], courtFour[3]];
          teamB = [courtFour[1], courtFour[2]];
        }
        break;
      }

      case "mixed_doubles": {
        // Ganda Campuran: Pisahkan Cowo (M) dan Cewe (F)
        const males = courtFour.filter((p) => p.gender === "M");
        const females = courtFour.filter((p) => p.gender === "F");

        if (males.length >= 2 && females.length >= 2) {
          // Format ideal: 1 Men (M) + 1 Women (W) vs 1 Men (M) + 1 Women (W)
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
        // Standar giliran main rata + penyeimbangan skill anti-jomplang
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
          winner: m.winner,
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
            winner: c.currentMatch.winner,
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
        session.algorithm || "playfields_mix",
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
