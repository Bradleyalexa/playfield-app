import { Match } from "../entities/match";
import { Player } from "../entities/player";
import { GameSession, MatchmakingAlgorithm, MatchType } from "../entities/session";

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
  isSameTierRound?: boolean;
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
 * Menghitung ulang statistik kehadiran & jumlah main pemain (Single Source of Truth)
 * langsung dari riwayat seluruh pertandingan aktual.
 * Menghindari bug desinkronisasi gamesPlayed / lastPlayedRound di runtime.
 */
export function recalculatePlayerStats(players: Player[], matches: Match[]): Player[] {
  if (!matches || matches.length === 0) {
    return players;
  }

  const gamesMap = new Map<string, number>();
  const lastRoundMap = new Map<string, number>();

  matches.forEach((m) => {
    const playerList = [...(m.teamA || []), ...(m.teamB || [])];
    playerList.forEach((p: any) => {
      const pId = typeof p === "string" ? p : p?.id;
      if (!pId) return;

      if (m.status === "completed") {
        gamesMap.set(pId, (gamesMap.get(pId) || 0) + 1);
      }
      const r = m.roundNumber || 0;
      if (r > (lastRoundMap.get(pId) || 0)) {
        lastRoundMap.set(pId, r);
      }
    });
  });

  return players.map((p) => {
    const actualCompleted = gamesMap.get(p.id) || 0;
    const actualLastRound = lastRoundMap.get(p.id) || 0;
    return {
      ...p,
      gamesPlayed: Math.max(p.gamesPlayed || 0, actualCompleted),
      lastPlayedRound: Math.max(p.lastPlayedRound || 0, actualLastRound),
    };
  });
}

/**
 * Smart Matchmaking Engine dengan Multi-Algoritma Mabar Lapangan
 */
export function generateBalancedMatches(
  allPlayers: Player[],
  courtCount: number,
  roundNumber: number,
  algorithm: MatchmakingAlgorithm = "playfields_mix",
  previousMatches: Match[] = [],
  matchType: MatchType = "doubles"
): MatchmakingResult {
  const isSingles = matchType === "singles";
  const playersPerCourt = isSingles ? 2 : 4;
  const minPlayersNeeded = playersPerCourt;
  const totalSlotsNeeded = courtCount * playersPerCourt;

  // 1. Selalu pastikan data statistik pemain akurat dari riwayat match (Single Source of Truth)
  const accuratePlayers = recalculatePlayerStats(allPlayers, previousMatches);

  // 2. Kunci pemain yang SEDANG BERTANDING di lapangan lain (status === "in_progress")
  // Pemain ini TIDAK BOLEH dijadwalkan ganda / bentrok di lapangan lain pada saat bersamaan!
  const currentlyPlayingIds = new Set<string>();
  previousMatches.forEach((m) => {
    if (m.status === "in_progress") {
      [...(m.teamA || []), ...(m.teamB || [])].forEach((p: any) => {
        const id = typeof p === "string" ? p : p?.id;
        if (id) currentlyPlayingIds.add(id);
      });
    }
  });

  // 3. Filter hanya pemain aktif yang SUDAH TIBA di lokasi (GOR) dan TIDAK sedang main di lapangan lain
  const activePool = accuratePlayers.filter(
    (p) => p.status === "active" && p.isArrived !== false && !currentlyPlayingIds.has(p.id)
  );

  if (activePool.length < minPlayersNeeded) {
    return { matches: [], restingPlayers: activePool };
  }

  // 4. Pemilihan siapa yang masuk ke lapangan pada ronde ini berdasarkan algoritma
  let selectedPlayers: Player[] = [];
  let restingPlayers: Player[] = [];

  if (algorithm === "random_fun") {
    // Acak murni menggunakan Fisher-Yates shuffle
    const shuffled = [...activePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const slots = Math.min(totalSlotsNeeded, Math.floor(shuffled.length / playersPerCourt) * playersPerCourt);
    selectedPlayers = shuffled.slice(0, slots);
    restingPlayers = shuffled.slice(slots);
  } else if (algorithm === "king_of_court" && roundNumber > 1 && previousMatches.length > 0) {
    // Raja Lapangan: Pemenang Lapangan 1 tetap bertahan
    const prevC1 = previousMatches.find((m) => m.courtNumber === 1 && m.roundNumber === roundNumber - 1);
    const kingSide =
      prevC1 && prevC1.scoreA >= prevC1.scoreB ? prevC1.teamA : prevC1 ? prevC1.teamB : [];
    const kingPlayers = isSingles ? kingSide.slice(0, 1) : kingSide.slice(0, 2);

    const kingIds = new Set(kingPlayers.map((p) => p.id));
    const nonKings = activePool.filter((p) => !kingIds.has(p.id));

    // Fisher-Yates pre-shuffle nonKings
    for (let i = nonKings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonKings[i], nonKings[j]] = [nonKings[j], nonKings[i]];
    }

    // Sort penantang berdasarkan jatah main & istirahat
    nonKings.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
      return (roundNumber - b.lastPlayedRound) - (roundNumber - a.lastPlayedRound);
    });

    const neededMore = totalSlotsNeeded - kingPlayers.length;
    const chosenNonKings = nonKings.slice(
      0,
      Math.min(neededMore, Math.floor(nonKings.length / (isSingles ? 1 : 2)) * (isSingles ? 1 : 2))
    );
    selectedPlayers = [...kingPlayers, ...chosenNonKings];
    restingPlayers = nonKings.slice(chosenNonKings.length);
  } else {
    // Prioritas umum (playfields_mix, fair_playtime, dll):
    // 1. Fisher-Yates pre-shuffle agar adil saat statistik seimbang
    const candidates = [...activePool];
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // 2. Stable Sort: Main paling sedikit (gamesPlayed), lalu istirahat paling lama (roundNumber - lastPlayedRound)
    candidates.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      const restA = roundNumber - a.lastPlayedRound;
      const restB = roundNumber - b.lastPlayedRound;
      return restB - restA; // Istirahat lebih lama diprioritaskan
    });

    const slots = Math.min(totalSlotsNeeded, Math.floor(candidates.length / playersPerCourt) * playersPerCourt);
    selectedPlayers = candidates.slice(0, slots);
    restingPlayers = candidates.slice(slots);
  }

  const matches: Match[] = [];
  const actualCourtsToMake = Math.floor(selectedPlayers.length / playersPerCourt);

  // 2b. Khusus Format Tunggal (Singles 1 vs 1)
  if (isSingles) {
    let courtTwoPairs: Player[][] = [];

    if (algorithm === "random_fun") {
      const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
      for (let c = 0; c < actualCourtsToMake; c++) {
        courtTwoPairs.push(shuffled.slice(c * 2, (c + 1) * 2));
      }
    } else if (algorithm === "king_of_court" && roundNumber > 1 && previousMatches.length > 0) {
      // Court 1 adalah King vs Penantang pertama
      for (let c = 0; c < actualCourtsToMake; c++) {
        courtTwoPairs.push(selectedPlayers.slice(c * 2, (c + 1) * 2));
      }
    } else {
      // Penyeimbangan level: kelompokkan pemain dengan tier terdekat agar duel 1v1 seru dan sengit
      const sortedBySkill = [...selectedPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
      for (let c = 0; c < actualCourtsToMake; c++) {
        courtTwoPairs.push(sortedBySkill.slice(c * 2, (c + 1) * 2));
      }
    }

    for (let c = 0; c < actualCourtsToMake; c++) {
      const pair = courtTwoPairs[c] || selectedPlayers.slice(c * 2, (c + 1) * 2);
      if (pair.length >= 2) {
        matches.push({
          id: `match-r${roundNumber}-c${c + 1}-${Date.now()}-${c}`,
          courtNumber: c + 1,
          roundNumber,
          teamA: [pair[0]],
          teamB: [pair[1]],
          scoreA: 0,
          scoreB: 0,
          status: "in_progress",
          startedAt: new Date().toISOString(),
          equipmentUsedCount: 1,
        });
      }
    }

    return { matches, restingPlayers };
  }

  // 3. Pengelompokan Pemain per Lapangan (Format Ganda 2 vs 2)
  let courtPlayerGroups: Player[][] = [];

  const isPlayfieldsSameTierRound =
    algorithm === "playfields_mix" && actualCourtsToMake >= 2 && roundNumber % 3 === 0;

  if (algorithm === "hybrid_2plus2") {
    // HYBRID 2+2:
    // Game 1 & 2 (atau ronde ganjil-block): FASE MIX LEVEL (Pemanasan & Baurkan)
    // Game 3 & 4 (atau ronde genap-block): FASE LEVEL SAMA (Adu Skill Sesama Tier)
    const isMixPhase = Math.floor((roundNumber - 1) / 2) % 2 === 0;

    if (!isMixPhase) {
      // FASE 2: LEVEL SAMA (Sesama Level Skill)
      const sortedBySkill = [...selectedPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
      for (let c = 0; c < actualCourtsToMake; c++) {
        courtPlayerGroups.push(sortedBySkill.slice(c * 4, (c + 1) * 4));
      }
    } else {
      // FASE 1: MIX LEVEL (Silang Tier)
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
  } else if (isPlayfieldsSameTierRound) {
    // PLAYFIELD'S MIX - PUTARAN LEVEL IMBANG (TIER DUEL SETIAP RONDE KE-3):
    // Mengelompokkan lapangan berdasarkan kesetaraan level:
    // Lapangan 1 = 4 pemain tier teratas (misal sesama Advanced/Pro)
    // Lapangan 2 = 4 pemain tier menengah/berikutnya (misal sesama Intermediate/Beginner)
    const sortedBySkill = [...selectedPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
    for (let c = 0; c < actualCourtsToMake; c++) {
      courtPlayerGroups.push(sortedBySkill.slice(c * 4, (c + 1) * 4));
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

  // Salin pool pemain virtual untuk simulasi ronde masa depan (pastikan statistik awal akurat)
  const virtualPlayers: Player[] = recalculatePlayerStats(session.players, session.matches).map((p) => ({ ...p }));

  for (let r = 1; r <= totalRoundsToProject; r++) {
    const roundStartMinutes = (r - 1) * matchMins;
    const roundEndMinutes = r * matchMins;

    const startFormatted = addMinutesToTimeString(startTime, roundStartMinutes);
    const endFormatted = addMinutesToTimeString(startTime, roundEndMinutes);
    const timeRange = `${startFormatted} - ${endFormatted}`;

    const isPast = r < session.currentRound;
    const isCurrent = r === session.currentRound;

    const isSameTierRound =
      session.algorithm === "hybrid_2plus2"
        ? Math.floor((r - 1) / 2) % 2 !== 0
        : session.algorithm === "playfields_mix"
        ? courtCount >= 2 && r % 3 === 0
        : false;

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
        isSameTierRound,
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
        isSameTierRound,
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
        session.matches,
        session.matchType || "doubles"
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
        isSameTierRound,
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
