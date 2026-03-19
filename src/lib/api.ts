import { supabase } from './supabase';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subscription {
  tier: 'rookie' | 'grandmaster' | 'challenger';
  is_active: boolean;
  expires_at: string | null;
}

export interface PostGameSession {
  id: string;
  created_at: string;
  champion: string;
  role: string;
  game_duration_seconds: number;
  overall_score: number;
  clear_time_rating: string;
  gank_efficiency_rating: string;
  objective_control_rating: string;
  strong_points: string[];
  main_errors: string[];
  focus_next: string;
  cs_per_min?: number;
}

export interface ChampionAverage {
  champion: string;
  role: string;
  games_played: number;
  avg_score: number;
  avg_cs_per_min: number;
}

export interface AnalyticsSummary {
  total_sessions: number;
  overall_avg_score: number;
  total_games_this_month: number;
  by_champion: ChampionAverage[];
  last_session: PostGameSession | null;
}

export interface PagedResult<T> {
  data: T[];        // backend serializa como "data", não "items"
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface TrendEntry {
  session_date: string;  // backend envia "session_date" (snake_case)
  score: number;
  champion: string;
  role: string;
}

export interface AnalyticsTrend {
  trend: TrendEntry[];      // backend envia "trend", não "entries"
  total_sessions: number;
  overall_avg: number;
  recent_avg: number;       // backend envia snake_case
  early_avg: number;
  delta: number;
  best_champion: ChampionAverage | null;
  most_played: ChampionAverage | null;
}

export interface ChampSelectEntry {
  id: string;
  created_at: string;
  player_champion: string;
  player_role: string;
  player_class: string;
  ap_percent: number;
  ad_percent: number;
  dominant_damage: string;
  cc_count: number;
  tank_count: number;
  assassin_count: number;
  enemy_champions: string[];
  situational_items: string[];
  insights: string[];
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getSubscription(): Promise<Subscription> {
  const res = await fetch(`${BACKEND}/api/subscription`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao buscar assinatura');
  return res.json();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${BACKEND}/api/analytics/summary`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao buscar analytics');
  return res.json();
}

export async function getSessions(limit = 20, offset = 0): Promise<PagedResult<PostGameSession>> {
  const res = await fetch(`${BACKEND}/api/sessions?limit=${limit}&offset=${offset}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao buscar sessões');
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${BACKEND}/api/sessions/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao deletar sessão');
}

export async function getAnalyticsTrend(): Promise<AnalyticsTrend> {
  const res = await fetch(`${BACKEND}/api/analytics/trend`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao buscar tendência');
  return res.json();
}

export async function getRecentChampSelect(limit = 10): Promise<ChampSelectEntry[]> {
  const res = await fetch(`${BACKEND}/api/champ-select/recent?limit=${limit}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error('Falha ao buscar histórico de champ select');
  return res.json();
}

// ─── Riot API ─────────────────────────────────────────────────────────────────

export interface RiotSummonerInfo {
  name: string;
  level: number;
  profileIconId: number;
  puuid: string;
}

export interface RiotRankInfo {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface MatchSummary {
  matchId: string;
  champion: string;
  championId: number;
  role: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  cs: number;
  csPerMin: number;
  visionScore: number;
  goldEarned: number;
  damageToChamps: number;
  gameDurationSecs: number;
  items: number[];
  // Extended stats
  damageTaken: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsBought: number;
  firstBlood: boolean;
  pentaKills: number;
  turretKills: number;
  totalHeal: number;
  goldSpent: number;
  timeDeadSecs: number;
  damageToObjectives: number;
  objectivesStolen: number;
  crowdControlScore: number;
  killingSprees: number;
  qCasts: number;
  wCasts: number;
  eCasts: number;
  rCasts: number;
  participantId: number;
}

export interface ItemPurchase {
  itemId: number;
  timestamp: number;
  minuteMark: number;
  secondMark: number;
}

export interface MatchTimeline {
  items: ItemPurchase[];
}

export interface ChampionStats {
  champion: string;
  games: number;
  wins: number;
  winRate: number;
  avgKda: number;
  avgCs: number;
  avgCsMin: number;
}

export interface AggregatedStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKda: number;
  avgCsPerMin: number;
  avgVision: number;
  avgGold: number;
  byChampion: ChampionStats[];
}

export interface RiotProfile {
  summoner: RiotSummonerInfo;
  soloQ: RiotRankInfo | null;
  flexQ: RiotRankInfo | null;
  stats: AggregatedStats;
  recentMatches: MatchSummary[];
}

export interface SummonerProfile {
  summonerName: string;
  puuid: string;
}

// Carrega perfil pelo PUUID salvo — auto-load sem re-buscar por nome
export async function getRiotProfileByPuuid(puuid: string): Promise<RiotProfile> {
  const res = await fetch(
    `${BACKEND}/api/riot/profile/by-puuid/${encodeURIComponent(puuid)}`,
    { headers: await authHeaders() }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Erro ao carregar perfil.');
  }
  return res.json();
}

export async function getRiotProfile(summonerName: string): Promise<RiotProfile> {
  const res = await fetch(
    `${BACKEND}/api/riot/profile/${encodeURIComponent(summonerName)}`,
    { headers: await authHeaders() }
  );
  if (res.status === 404) throw new Error('Invocador não encontrado.');
  if (res.status === 429) throw new Error('Limite de requisições atingido. Aguarde alguns segundos.');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Erro ao buscar perfil Riot.');
  }
  return res.json();
}

export interface LiveParticipant {
  puuid: string;
  summonerName: string;
  championId: number;
  spell1Id: number;
  spell2Id: number;
  primaryRune: number;
  perkStyle: number;
  perkSubStyle: number;
}

export interface LiveGame {
  gameId: number;
  queueName: string;
  gameLength: number;
  blueTeam: LiveParticipant[];
  redTeam: LiveParticipant[];
  blueBans: number[];
  redBans: number[];
}

export async function getLiveGame(puuid: string): Promise<LiveGame | null> {
  const res = await fetch(`${BACKEND}/api/riot/live-game/${puuid}`, {
    headers: await authHeaders(),
  });
  if (res.status === 204) return null; // não está em partida
  if (res.status === 429) throw new Error('Limite de requisições. Aguarde alguns segundos.');
  if (!res.ok) throw new Error('Erro ao verificar partida ao vivo.');
  return res.json();
}

export async function createCheckoutSession(priceId: string): Promise<{ url: string }> {
  const res = await fetch(`${BACKEND}/api/stripe/checkout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ priceId }),
  });
  if (!res.ok) throw new Error('Falha ao criar sessão de checkout.');
  return res.json();
}

export async function getMatchTimeline(matchId: string, puuid: string): Promise<MatchTimeline> {
  const res = await fetch(
    `${BACKEND}/api/riot/match/${encodeURIComponent(matchId)}/timeline?puuid=${encodeURIComponent(puuid)}`,
    { headers: await authHeaders() }
  );
  if (!res.ok) throw new Error('Erro ao buscar timeline da partida.');
  return res.json();
}

export async function getMySummoner(): Promise<SummonerProfile | null> {
  const res = await fetch(`${BACKEND}/api/riot/summoner/me`, {
    headers: await authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}
