export interface DailySessionSummary {
  id: string;
  slug: string;
  title: string;
  sport: string;
  createdAt: string;
  updatedAt: string;
  sessionDate?: string;
  startTime?: string;
  courtCount: number;
  courtLocation?: string;
  playerCount: number;
  players: string[];
  matchCount: number;
  completedMatchCount: number;
  algorithm: string;
  status: string;
  wibDate: string; // YYYY-MM-DD
  wibTime: string; // HH:mm
  isRealSession: boolean; // has players or matches
}

export interface DayGroup {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Jumat, 30 Oktober 2026"
  relativeLabel: string; // e.g. "Hari Ini", "Kemarin", "3 hari lalu"
  totalSessions: number;
  realSessionsCount: number;
  totalPlayers: number;
  totalMatches: number;
  sportsBreakdown: Record<string, number>;
  sessions: DailySessionSummary[];
}

export interface AnalyticsResponse {
  success: boolean;
  generatedAt: string;
  totalAllTimeSessions: number;
  totalRealSessions: number;
  totalAllTimePlayers: number;
  totalAllTimeMatches: number;
  totalDaysRecorded: number;
  sportsOverview: Record<string, number>;
  dailyGroups: DayGroup[];
}
