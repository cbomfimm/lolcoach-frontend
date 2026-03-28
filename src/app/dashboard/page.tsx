'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { RiotLegalBar } from '@/components/RiotLegalBar';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Crown, Swords, TrendingUp, LogOut,
  Search, AlertCircle, Loader2, ChevronRight,
  Shield, Zap, Eye, Coins, Target, BarChart3,
  CheckCircle2, XCircle, Trash2, BookOpen, History, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, X, Check, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { asset, route } from '@/lib/assets';
import {
  getDDragonVersion, champIconUrl, itemIconUrl, profileIconUrl,
  getItemsData, stripItemHtml, type DDragonItemInfo,
  getChampionsMap, getSpellsMap, getRunesMap, getRunesData,
  getChampionName, champIconUrlById, spellIconUrlById,
  type DDragonRunePath,
} from '@/lib/ddragon';
import {
  getRiotProfile, getRiotProfileByPuuid, getMySummoner, getLiveGame,
  getSessions, deleteSession, getAnalyticsTrend, getRecentChampSelect,
  getMatchTimeline, getMatchDetails, getMoreMatches,
  createCheckoutSession, SubscriptionRequiredError,
  type RiotProfile, type MatchSummary, type ChampionStats, type LiveGame, type SummonerProfile,
  type PostGameSession, type PagedResult, type AnalyticsTrend, type ChampSelectEntry,
  type ItemPurchase, type SkillLevelUp, type MatchDetails, type MatchDetailsParticipant, type AggregatedStats,
} from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top', JUNGLE: 'JG', MIDDLE: 'Mid', BOTTOM: 'ADC', UTILITY: 'Sup',
};

const TIER_ORDER = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER'];

const TIER_COLOR: Record<string, string> = {
  IRON: '#8a8a8a', BRONZE: '#cd7f32', SILVER: '#c0c0c0', GOLD: '#ffd700',
  PLATINUM: '#00bc8c', EMERALD: '#50c878', DIAMOND: '#b9f2ff',
  MASTER: '#9b59b6', GRANDMASTER: '#e74c3c', CHALLENGER: '#f39c12',
};

const TIER_ABBREV: Record<string, string> = {
  IRON: 'I', BRONZE: 'B', SILVER: 'S', GOLD: 'G', PLATINUM: 'P',
  EMERALD: 'E', DIAMOND: 'D', MASTER: 'M', GRANDMASTER: 'GM', CHALLENGER: 'C',
};

const RANK_NUM: Record<string, string> = { I: '1', II: '2', III: '3', IV: '4' };

const STAT_LABELS: Record<string, string> = {
  FlatHPPoolMod: 'Vida', FlatMPPoolMod: 'Mana',
  FlatArmorMod: 'Armadura', FlatSpellBlockMod: 'Resist. Mágica',
  FlatPhysicalDamageMod: 'Dano Físico', FlatMagicDamageMod: 'Poder de Hab.',
  FlatMovementSpeedMod: 'Velocidade', PercentAttackSpeedMod: 'Vel. Ataque',
  FlatCritChanceMod: 'Chance Crítica', PercentLifeStealMod: 'Roubo de Vida',
  FlatHPRegenMod: 'Regen HP', FlatMPRegenMod: 'Regen Mana',
  FlatEXPBonus: 'Exp Bônus', PercentMovementSpeedMod: 'Vel. Mov.',
};


// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

function timeAgo(timestampMs: number): string {
  if (!timestampMs) return '';
  const diff  = Date.now() - timestampMs;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60) return `${mins}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days  < 30) return `${days}d atrás`;
  return `${Math.floor(days / 30)}m atrás`;
}

function fmtGold(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)}k` : String(g);
}

function winRateColor(wr: number) {
  if (wr >= 60) return 'text-gold';
  if (wr >= 50) return 'text-arcane-blue';
  return 'text-red-400';
}

function kdaColor(kda: number) {
  if (kda >= 4) return 'text-gold';
  if (kda >= 2.5) return 'text-arcane-blue';
  return 'text-gold-light/70';
}

// ─── Component ────────────────────────────────────────────────────────────────

type DashTab = 'profile' | 'coaching';

export default function DashboardPage() {
  const router = useRouter();
  const { user, subscription, loading, signOut } = useAuth();

  const [activeTab, setActiveTab]       = useState<DashTab>('profile');
  const [profile, setProfile]           = useState<RiotProfile | null>(null);
  const [linkedAccount, setLinkedAccount] = useState<SummonerProfile | null>(null);
  const [linkInput, setLinkInput]       = useState('');
  const [linking, setLinking]           = useState(false);
  const [linkError, setLinkError]       = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [liveGame, setLiveGame]         = useState<LiveGame | null | 'not-in-game'>(null);
  const [liveLoading, setLiveLoading]   = useState(false);
  const [liveError, setLiveError]       = useState<string | null>(null);
  const [loadingInit, setLoadingInit]   = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [ddVersion, setDdVersion]       = useState('14.24.1');
  const [ddItems, setDdItems]           = useState<Record<string, DDragonItemInfo>>({});
  const [champMap, setChampMap]         = useState<Map<number, string>>(new Map());
  const [spellMap, setSpellMap]         = useState<Map<number, string>>(new Map());
  const [runeMap, setRuneMap]           = useState<Map<number, string>>(new Map());
  const [runesData, setRunesData]       = useState<DDragonRunePath[]>([]);

  // Coaching tab state
  const [sessions, setSessions]         = useState<PostGameSession[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsOffset, setSessionsOffset] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [trend, setTrend]               = useState<AnalyticsTrend | null>(null);
  const [champSelects, setChampSelects] = useState<ChampSelectEntry[]>([]);
  const [coachingLoaded, setCoachingLoaded] = useState(false); // used in EmptySearch fallback
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [activeQueue, setActiveQueue] = useState<'total' | 'solo' | 'flex'>('total');
  const [displayMatches, setDisplayMatches] = useState<MatchSummary[]>([]);
  const [matchOffset, setMatchOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleCheckLiveGame = async () => {
    if (!profile) return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveGame(null);
    try {
      const game = await getLiveGame(profile.summoner.puuid);
      setLiveGame(game ?? 'not-in-game');
    } catch (err) {
      if (err instanceof SubscriptionRequiredError) {
        setShowUpgradeModal(true);
      } else {
        setLiveError(err instanceof Error ? err.message : 'Erro ao verificar partida');
      }
    } finally {
      setLiveLoading(false);
    }
  };

  const loadCoachingData = useCallback(async (reset = false) => {
    setSessionsLoading(true);
    const nextOffset = reset ? 0 : sessionsOffset;
    try {
      const [pagedResult, trendResult, csResult] = await Promise.allSettled([
        getSessions(20, nextOffset),
        getAnalyticsTrend(),
        getRecentChampSelect(10),
      ]);
      if (pagedResult.status === 'fulfilled') {
        const paged = pagedResult.value;
        setSessions(prev => reset ? paged.data : [...prev, ...paged.data]);
        setSessionsTotal(paged.total);
        setSessionsOffset(nextOffset + paged.data.length);
      }
      if (trendResult.status === 'fulfilled') setTrend(trendResult.value);
      if (csResult.status === 'fulfilled') setChampSelects(csResult.value);
      setCoachingLoaded(true);
    } catch {
      // silently fail
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionsOffset]);

  const handleLoadMoreSessions = () => loadCoachingData(false);

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      setSessionsTotal(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleTabChange = (tab: DashTab) => {
    if (tab === 'coaching' && isRookie) {
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'coaching' && !coachingLoaded) {
      loadCoachingData(true);
    }
  };

  // Vincula ou altera a conta (salva PUUID no banco)
  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    setLinkError(null);
    setLinking(true);
    try {
      // getRiotProfile já salva o PUUID no banco via /api/riot/profile/{riotId}
      const p = await getRiotProfile(linkInput.trim());
      setProfile(p);
      setLinkedAccount({ summonerName: linkInput.trim(), puuid: p.summoner.puuid });
      setShowLinkForm(false);
      setLinkInput('');
      setLiveGame(null);
      setDisplayMatches(p.recentMatches);
      setMatchOffset(p.recentMatches.length);
      setHasMore(p.recentMatches.length === 20);
      setActiveQueue('total');
    } catch (err) {
      if (err instanceof SubscriptionRequiredError) {
        setShowLinkForm(false);
        setShowUpgradeModal(true);
      } else {
        setLinkError(err instanceof Error ? err.message : 'Erro ao vincular conta');
      }
    } finally {
      setLinking(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    getDDragonVersion().then(setDdVersion);
    getItemsData().then(setDdItems);
    getChampionsMap().then(setChampMap);
    getSpellsMap().then(setSpellMap);
    getRunesMap().then(setRuneMap);
    getRunesData().then(setRunesData);
  }, []);

  // Auto-load: se usuário já tem conta vinculada, carrega pelo PUUID (sem re-buscar por nome)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const saved = await getMySummoner();
        if (saved?.puuid) {
          setLinkedAccount(saved);
          try {
            const p = await getRiotProfileByPuuid(saved.puuid);
            setProfile(p);
            setDisplayMatches(p.recentMatches);
            setMatchOffset(p.recentMatches.length);
            setHasMore(p.recentMatches.length === 20);
            setActiveQueue('total');
          } catch (err) {
            if (err instanceof SubscriptionRequiredError) {
              setShowUpgradeModal(true);
            }
            // Demais erros (cold start, rate limit, etc.): mostra o form silenciosamente
          }
        }
      } catch {
        // getMySummoner falhou — sem conta vinculada, mostra form
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [user]);


  const handleQueueChange = async (q: 'total' | 'solo' | 'flex') => {
    setActiveQueue(q);
    setLoadingMore(true);
    const queue = q === 'total' ? undefined : q;
    const matches = await getMoreMatches(0, 20, queue);
    setDisplayMatches(matches);
    setMatchOffset(matches.length);
    setHasMore(matches.length === 20);
    setLoadingMore(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const queue = activeQueue === 'total' ? undefined : activeQueue as 'solo' | 'flex';
    const more = await getMoreMatches(matchOffset, 20, queue);
    setDisplayMatches(prev => [...prev, ...more]);
    setMatchOffset(prev => prev + more.length);
    setHasMore(more.length === 20);
    setLoadingMore(false);
  };

  const handleSignOut = async () => { await signOut(); router.replace('/'); };

  if (loading || loadingInit) {
    return (
      <div className="min-h-screen bg-arcane-dark flex items-center justify-center gap-3 text-gold/50">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-rajdhani tracking-widest uppercase text-sm">Carregando...</span>
      </div>
    );
  }

  const isPro    = (subscription?.tier === 'grandmaster' || subscription?.tier === 'challenger') && !!subscription?.is_active;
  const isRookie = !isPro;

  return (
    <div className="min-h-screen bg-arcane-dark text-gold-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-arcane-dark/90 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <a href={route('/')} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <Image src={asset('/icon.png')} alt="MindRift" width={36} height={36} className="rounded-sm object-contain" />
              </div>
            </div>
            <span className="font-cinzel text-base font-bold tracking-tight uppercase hidden sm:block">
              <span className="text-gold-light">MIND</span><span className="text-gold">RIFT</span>
            </span>
          </a>

          {/* Tabs */}
          {profile && !showLinkForm && (
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-rajdhani font-bold text-xs tracking-widest uppercase transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-gold-light/40 hover:text-gold-light/70'
                }`}
              >
                <Swords className="w-3.5 h-3.5" /> Perfil
              </button>
              <button
                onClick={() => handleTabChange('coaching')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-rajdhani font-bold text-xs tracking-widest uppercase transition-colors ${
                  activeTab === 'coaching'
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-gold-light/40 hover:text-gold-light/70'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Coaching
              </button>
            </nav>
          )}

          {/* Conta vinculada */}
          {linkedAccount && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-rajdhani">
              <span className="text-gold-light/40">Conta:</span>
              <span className="text-gold font-bold tracking-wide">
                {profile?.summoner.name ?? linkedAccount.summonerName}
              </span>
              <button
                onClick={() => setShowLinkForm(true)}
                className="text-gold/50 hover:text-gold transition-colors text-xs underline underline-offset-2"
              >
                alterar
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-sm border text-xs font-rajdhani font-bold tracking-widest uppercase ${
              isPro ? 'border-gold/40 bg-gold/10 text-gold' : 'border-arcane-border bg-arcane-panel text-gold-light/40'
            }`}>
              {isPro ? <Crown className="w-3 h-3" /> : <Swords className="w-3 h-3" />}
              {subscription?.tier === 'challenger' ? 'CHALLENGER' : isPro ? 'GRAND MASTER' : 'ROOKIE'}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 font-rajdhani text-xs text-gold-light/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3 mb-6 font-rajdhani text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de vincular/alterar conta */}
        <AnimatePresence>
          {(showLinkForm || (!linkedAccount && !loadingInit)) && (
            <LinkAccountModal
              value={linkInput}
              onChange={setLinkInput}
              onSubmit={handleLinkAccount}
              onCancel={linkedAccount ? () => setShowLinkForm(false) : undefined}
              loading={linking}
              error={linkError}
              isFirstTime={!linkedAccount}
            />
          )}
        </AnimatePresence>

        {profile && !showLinkForm && activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            isPro={isPro}
            liveGame={liveGame}
            liveLoading={liveLoading}
            liveError={liveError}
            onCheckLiveGame={handleCheckLiveGame}
            ddItems={ddItems}
            champMap={champMap}
            spellMap={spellMap}
            runeMap={runeMap}
            runesData={runesData}
            activeQueue={activeQueue}
            displayMatches={displayMatches}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onQueueChange={handleQueueChange}
            onLoadMore={handleLoadMore}
          />
        )}

        {profile && !showLinkForm && activeTab === 'coaching' && (
          isPro ? (
            <CoachingView
              sessions={sessions}
              sessionsTotal={sessionsTotal}
              sessionsLoading={sessionsLoading}
              trend={trend}
              champSelects={champSelects}
              onLoadMore={handleLoadMoreSessions}
              onDelete={handleDeleteSession}
              isPro={isPro}
            />
          ) : (
            <UpgradeView />
          )
        )}
      </main>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
        )}
      </AnimatePresence>
      <RiotLegalBar />
    </div>
  );
}

// ─── Link Account Modal ───────────────────────────────────────────────────────

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

const GM_FEATURES = [
  'Briefing de partida na loading screen',
  'Alertas de Jungle, Visão e Objetivos',
  'Voz em tempo real (analisadores principais)',
  'Cobertura para todas as 5 roles',
  'Dashboard de coaching com histórico',
  'Análise pós-game com IA',
  'Alterar conta quando quiser',
  'Suporte prioritário',
];

const PRICE_MONTHLY_ID = 'price_1TCZRP2MkVxM8WmWv0qoO4ja';
const PRICE_YEARLY_ID  = 'price_1TCZSU2MkVxM8WmWj2RvazH6';

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [yearly, setYearly]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const priceDisplay = yearly ? 'R$ 119,00/ano' : 'R$ 14,90/mês';
  const priceNote    = yearly ? '≈ R$ 9,92/mês — economize 33%' : null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const priceId = yearly ? PRICE_YEARLY_ID : PRICE_MONTHLY_ID;
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-arcane-dark/80 backdrop-blur-md" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-sm border border-gold/60 bg-arcane-dark shadow-[0_0_60px_rgba(200,155,60,0.18)] p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold/30 hover:text-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-4 py-1 rounded-sm text-xs font-rajdhani font-bold tracking-widest uppercase bg-gold text-arcane-dark">
            Mais Popular
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-gold/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="font-cinzel font-bold text-gold-light">Grand Master</div>
            <div className="font-rajdhani text-xs text-gold/40 tracking-wider">O essencial para evoluir no Rift.</div>
          </div>
        </div>

        {/* Price toggle */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setYearly(false)}
            className={`font-rajdhani text-xs tracking-widest uppercase transition-colors ${!yearly ? 'text-gold font-bold' : 'text-gold/40 hover:text-gold/60'}`}
          >
            Mensal
          </button>
          <button
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(v => !v)}
            className="relative w-10 h-5 rounded-full bg-arcane-panel border border-gold/30"
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-gold"
              animate={{ left: yearly ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`font-rajdhani text-xs tracking-widest uppercase transition-colors ${yearly ? 'text-gold font-bold' : 'text-gold/40 hover:text-gold/60'}`}
          >
            Anual
            <span className="ml-1.5 text-[9px] bg-gold/20 text-gold border border-gold/30 px-1 py-0.5 rounded-sm">−33%</span>
          </button>
        </div>

        {/* Price */}
        <div className="mb-1">
          <span className="font-cinzel text-3xl font-bold text-gold">{priceDisplay}</span>
        </div>
        {priceNote && (
          <p className="font-rajdhani text-xs text-gold/40 mb-6">{priceNote}</p>
        )}
        {!priceNote && <div className="mb-6" />}

        {/* Features */}
        <ul className="space-y-2.5 mb-8">
          {GM_FEATURES.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-gold" />
              </div>
              <span className="font-rajdhani text-sm text-gold-light/70">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-sm bg-gold hover:bg-gold/90 text-arcane-dark font-cinzel font-bold text-sm tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Aguarde...' : 'Subir de Elo'}
        </button>

        <p className="text-center font-rajdhani text-xs text-gold/30 mt-3">
          Cancele quando quiser — sem fidelidade.
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ─── Link Account Modal ────────────────────────────────────────────────────────

function LinkAccountModal({ value, onChange, onSubmit, onCancel, loading, error, isFirstTime }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  loading: boolean;
  error: string | null;
  isFirstTime: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-md mx-auto mt-10"
    >
      <div className="relative bg-arcane-panel border border-gold/20 rounded-sm p-8">
        <div className="absolute -inset-px rounded-sm bg-gradient-to-b from-gold/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          {/* Icon */}
          <div className="w-14 h-14 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6 rotate-45">
            <Swords className="w-6 h-6 text-gold -rotate-45" />
          </div>

          <h2 className="font-cinzel text-xl font-bold text-gold-light text-center mb-1">
            {isFirstTime ? 'Vincule sua Conta' : 'Alterar Conta Vinculada'}
          </h2>
          <p className="font-rajdhani text-sm text-gold-light/40 text-center mb-6">
            {isFirstTime
              ? 'Digite seu Riot ID para conectar sua conta e ver suas estatísticas.'
              : 'Sua nova conta será vinculada e o PUUID atualizado.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block font-rajdhani font-semibold text-xs tracking-widest uppercase text-gold/60 mb-1.5">
                Riot ID
              </label>
              <input
                type="text"
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="NomeJogador#TAG  (ex: Ryoki#BR1)"
                className="w-full bg-arcane-dark/60 border border-gold/20 rounded-sm px-4 py-3 font-rajdhani text-gold-light placeholder:text-gold-light/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
              <p className="mt-1.5 font-rajdhani text-xs text-gold-light/25">
                Encontre no cliente do LoL → canto superior direito
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-red-400/80 text-sm font-rajdhani bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {onCancel && (
                <button type="button" onClick={onCancel}
                  className="flex-1 border border-gold/20 text-gold-light/50 hover:text-gold-light hover:border-gold/40 font-rajdhani font-bold text-sm tracking-widest uppercase py-3 rounded-sm transition-colors">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-gold hover:bg-gold-light text-arcane-dark font-cinzel font-bold text-sm tracking-widest uppercase py-3 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                  : <>{isFirstTime ? 'Vincular Conta' : 'Alterar Conta'} <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySearch({ onSearch }: { onSearch: (name: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center"
    >
      <div className="w-20 h-20 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 rotate-45">
        <Search className="w-8 h-8 text-gold/50 -rotate-45" />
      </div>
      <h2 className="font-cinzel text-2xl font-bold text-gold-light mb-2">Busque seu Invocador</h2>
      <p className="font-rajdhani text-gold-light/40 max-w-sm">
        Digite seu nome de invocador na barra acima para ver suas estatísticas ranqueadas.
      </p>
    </motion.div>
  );
}

// ─── Upgrade View (Rookie) ────────────────────────────────────────────────────

const LOCKED_FEATURES = [
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Análise pós-game com IA', desc: 'Receba um relatório detalhado após cada partida com pontos fortes, erros e foco para a próxima.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Tendência de performance', desc: 'Acompanhe sua evolução partida a partida com gráficos de score, CS/min e win rate.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Voz em tempo real', desc: 'Alertas de Jungle, Visão e Objetivos enquanto você joga — sem precisar pausar a tela.' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Briefing na loading screen', desc: 'Análise da composição inimiga e sugestões de itens situacionais antes da partida começar.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Histórico de Champ Select', desc: 'Revise suas últimas análises de pick e counterpick para refinar sua preparação.' },
];

function UpgradeView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-6 py-16"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-gold/10 border border-gold/30 mb-6">
          <Crown className="w-8 h-8 text-gold" />
        </div>
        <h2 className="font-cinzel text-3xl font-bold text-gold-light mb-3">
          Desbloqueie o Coaching Completo
        </h2>
        <p className="font-rajdhani text-lg text-gold-light/50 max-w-md mx-auto">
          Seu plano <span className="text-gold font-bold">Rookie</span> inclui alertas básicos e vinculação de conta.
          Faça upgrade para o <span className="text-gold font-bold">Grand Master</span> e ative o coaching de verdade.
        </p>
      </div>

      {/* Features locked */}
      <div className="space-y-3 mb-10">
        {LOCKED_FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-4 bg-arcane-panel border border-gold/10 rounded-sm p-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
              {f.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-cinzel text-sm font-bold text-gold-light/80">{f.title}</span>
                <span className="text-[10px] font-rajdhani tracking-widest uppercase border border-gold/30 text-gold/60 px-1.5 py-0.5 rounded-sm">
                  Grand Master
                </span>
              </div>
              <p className="font-rajdhani text-sm text-gold-light/40">{f.desc}</p>
            </div>
            {/* Lock overlay */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing summary */}
      <div className="bg-arcane-dark border border-gold/30 rounded-sm p-6 mb-6 shadow-[0_0_30px_rgba(200,155,60,0.06)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-cinzel text-xl font-bold text-gold mb-1">Grand Master</div>
            <div className="flex items-baseline gap-1">
              <span className="font-cinzel text-3xl font-bold text-gold-light">R$14,90</span>
              <span className="font-rajdhani text-sm text-gold/40">/mês</span>
            </div>
            <p className="font-rajdhani text-xs text-gold/40 mt-1">ou R$119/ano — economize 33%</p>
          </div>
          <a
            href={route('/#pricing')}
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-arcane-dark font-cinzel font-bold text-sm tracking-widest uppercase px-6 py-3 rounded-sm transition-colors"
          >
            Fazer Upgrade <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <p className="text-center font-rajdhani text-xs text-gold/25">
        Cancele quando quiser. Sem fidelidade.
      </p>
    </motion.div>
  );
}

// ─── Coaching View ────────────────────────────────────────────────────────────

function CoachingView({
  sessions, sessionsTotal, sessionsLoading, trend, champSelects,
  onLoadMore, onDelete, isPro,
}: {
  sessions: PostGameSession[];
  sessionsTotal: number;
  sessionsLoading: boolean;
  trend: AnalyticsTrend | null;
  champSelects: ChampSelectEntry[];
  onLoadMore: () => void;
  onDelete: (id: string) => void;
  isPro: boolean;
}) {
  const hasMore = sessions.length < sessionsTotal;

  const scoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-400';
    if (s >= 6) return 'text-gold';
    if (s >= 4) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* ── Trend Card ── */}
      {trend && trend.trend.length >= 2 && (
        <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
          <SectionTitle icon={<TrendingUp className="w-4 h-4 text-gold" />} title="Evolução de Performance" />
          <div className="mt-4 flex flex-col sm:flex-row gap-6 items-start">
            {/* Delta badge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-sm border-2 bg-arcane-dark/60
              border-gold/20">
              {trend.delta > 0
                ? <ArrowUpRight className="w-6 h-6 text-emerald-400 mb-1" />
                : trend.delta < 0
                  ? <ArrowDownRight className="w-6 h-6 text-red-400 mb-1" />
                  : <Minus className="w-6 h-6 text-gold-light/40 mb-1" />
              }
              <span className={`font-cinzel text-2xl font-bold ${
                trend.delta > 0 ? 'text-emerald-400' : trend.delta < 0 ? 'text-red-400' : 'text-gold-light/40'
              }`}>
                {trend.delta > 0 ? '+' : ''}{trend.delta.toFixed(1)}
              </span>
              <span className="font-rajdhani text-xs text-gold-light/30 uppercase tracking-wider mt-1">Delta</span>
            </div>

            {/* Avg comparison */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-rajdhani text-sm text-gold-light/50">Primeiras 5 partidas</span>
                <span className="font-cinzel font-bold text-sm text-gold-light/60">{trend.early_avg.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-rajdhani text-sm text-gold-light/80">Últimas 5 partidas</span>
                <span className={`font-cinzel font-bold text-sm ${trend.recent_avg >= trend.early_avg ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trend.recent_avg.toFixed(1)}
                </span>
              </div>

              {/* Mini sparkline */}
              <div className="relative h-10 flex items-end gap-0.5 mt-2">
                {trend.trend.map((e, i) => {
                  const pct = Math.max(4, (e.score / 10) * 100);
                  const isRecent = i >= trend.trend.length - 5;
                  return (
                    <div
                      key={i}
                      title={`${e.champion} — ${e.score}/10`}
                      className={`flex-1 rounded-t-sm transition-opacity ${isRecent ? 'opacity-100' : 'opacity-40'}
                        ${e.score >= 7 ? 'bg-emerald-500/60' : e.score >= 5 ? 'bg-gold/60' : 'bg-red-500/50'}`}
                      style={{ height: `${pct}%` }}
                    />
                  );
                })}
              </div>
              <p className="font-rajdhani text-xs text-gold-light/20">
                Baseado nas últimas {trend.trend.length} partidas com coaching ativo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Champ Select Analyses ── */}
      {champSelects.length > 0 && (
        <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
          <SectionTitle icon={<Shield className="w-4 h-4 text-gold" />} title="Análises de Champ Select" />
          <div className="mt-4 space-y-3">
            {champSelects.map((cs) => (
              <ChampSelectRow key={cs.id} entry={cs} />
            ))}
          </div>
        </div>
      )}

      {/* ── Post-game Sessions ── */}
      <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle icon={<History className="w-4 h-4 text-gold" />} title="Histórico de Coaching" />
          {sessionsTotal > 0 && (
            <span className="font-rajdhani text-xs text-gold-light/30">
              {sessions.length} de {sessionsTotal}
            </span>
          )}
        </div>

        {sessionsLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gold-light/30">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-rajdhani text-sm">Carregando sessões...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-10 h-10 text-gold/20 mb-3" />
            <p className="font-rajdhani text-sm text-gold-light/30">
              Nenhuma sessão de coaching registrada ainda.
            </p>
            <p className="font-rajdhani text-xs text-gold-light/20 mt-1">
              As sessões aparecem automaticamente após cada partida analisada pelo app desktop.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} onDelete={onDelete} scoreColor={scoreColor} />
            ))}

            {hasMore && (
              <div className="pt-3 flex justify-center">
                <button
                  onClick={onLoadMore}
                  disabled={sessionsLoading}
                  className="flex items-center gap-2 bg-arcane-dark border border-gold/20 hover:border-gold/40 text-gold-light/50 hover:text-gold-light font-rajdhani text-xs tracking-widest uppercase px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50"
                >
                  {sessionsLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Carregar mais</>
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isPro && (
        <div className="flex items-center justify-between gap-4 bg-arcane-panel border border-gold/30 rounded-sm px-5 py-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-gold flex-shrink-0" />
            <span className="font-rajdhani text-sm text-gold-light/80">
              Histórico ilimitado, análise avançada de tendências e coaching personalizado com Pro.
            </span>
          </div>
          <a
            href={route('/#pricing')}
            className="flex-shrink-0 flex items-center gap-1 bg-gold hover:bg-gold-light text-arcane-dark font-cinzel font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-colors"
          >
            Upgrade <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────

function SessionRow({ session: s, onDelete, scoreColor }: {
  session: PostGameSession;
  onDelete: (id: string) => void;
  scoreColor: (n: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remover esta sessão?')) return;
    setDeleting(true);
    await onDelete(s.id);
  };

  const mins = Math.floor(s.game_duration_seconds / 60);

  return (
    <div className="border border-gold/15 rounded-sm bg-arcane-dark/40 hover:border-gold/25 transition-colors">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Champion icon */}
        <div className="w-9 h-9 rounded-sm overflow-hidden bg-arcane-panel flex-shrink-0 border border-gold/10">
          <img
            src={champIconUrl(s.champion)}
            alt={s.champion}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
        </div>

        {/* Champion + role */}
        <div className="w-28 flex-shrink-0">
          <div className="font-cinzel font-bold text-sm text-gold-light truncate">{s.champion}</div>
          <div className="font-rajdhani text-xs text-gold-light/40">
            {ROLE_LABEL[s.role] ?? s.role}
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 w-14 text-center">
          <div className={`font-cinzel text-xl font-bold ${scoreColor(s.overall_score)}`}>
            {s.overall_score}
          </div>
          <div className="font-rajdhani text-xs text-gold-light/25">/10</div>
        </div>

        {/* Focus */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <div className="font-rajdhani text-xs text-gold-light/50 truncate">{s.focus_next}</div>
        </div>

        {/* Duration + date */}
        <div className="flex-shrink-0 text-right hidden md:block">
          <div className="font-rajdhani text-xs text-gold-light/40">{mins}min</div>
          <div className="font-rajdhani text-xs text-gold-light/25">
            {new Date(s.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Expand + delete */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <ChevronDown className={`w-4 h-4 text-gold/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 text-gold-light/20 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gold/10 space-y-3">
              {/* Ratings row */}
              <div className="flex flex-wrap gap-2 pt-3">
                {s.clear_time_rating && (
                  <RatingTag label="Farm" value={s.clear_time_rating} />
                )}
                {s.gank_efficiency_rating && (
                  <RatingTag label="Gank" value={s.gank_efficiency_rating} />
                )}
                {s.objective_control_rating && (
                  <RatingTag label="Objetivos" value={s.objective_control_rating} />
                )}
              </div>

              {/* Points */}
              {s.strong_points?.length > 0 && (
                <div>
                  <div className="font-rajdhani text-xs text-emerald-400/70 uppercase tracking-widest mb-1.5">Pontos fortes</div>
                  <ul className="space-y-1">
                    {s.strong_points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 font-rajdhani text-sm text-gold-light/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0 mt-0.5" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.main_errors?.length > 0 && (
                <div>
                  <div className="font-rajdhani text-xs text-red-400/70 uppercase tracking-widest mb-1.5">Principais erros</div>
                  <ul className="space-y-1">
                    {s.main_errors.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 font-rajdhani text-sm text-gold-light/60">
                        <XCircle className="w-3.5 h-3.5 text-red-400/50 flex-shrink-0 mt-0.5" />{e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.focus_next && (
                <div>
                  <div className="font-rajdhani text-xs text-gold/60 uppercase tracking-widest mb-1">Foco próxima partida</div>
                  <p className="font-rajdhani text-sm text-gold-light/70">{s.focus_next}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RatingTag({ label, value }: { label: string; value: string }) {
  const lower = value.toLowerCase();
  const color = lower.includes('bom') || lower.includes('ótimo') || lower.includes('excelente')
    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
    : lower.includes('médio') || lower.includes('regular')
      ? 'border-amber-500/30 text-amber-400 bg-amber-500/5'
      : 'border-red-500/30 text-red-400 bg-red-500/5';
  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-sm px-2.5 py-1 font-rajdhani text-xs ${color}`}>
      <span className="text-current/50">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

// ─── Champ Select Row ─────────────────────────────────────────────────────────

function ChampSelectRow({ entry: cs }: { entry: ChampSelectEntry }) {
  const [expanded, setExpanded] = useState(false);
  const apPct = Math.round(cs.ap_percent);
  const adPct = Math.round(cs.ad_percent);

  return (
    <div className="border border-gold/15 rounded-sm bg-arcane-dark/40 hover:border-gold/25 transition-colors">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Champion icon */}
        <div className="w-9 h-9 rounded-sm overflow-hidden bg-arcane-panel flex-shrink-0 border border-gold/10">
          <img
            src={champIconUrl(cs.player_champion)}
            alt={cs.player_champion}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
        </div>

        {/* Champion + role */}
        <div className="w-28 flex-shrink-0">
          <div className="font-cinzel font-bold text-sm text-gold-light truncate">{cs.player_champion}</div>
          <div className="font-rajdhani text-xs text-gold-light/40">
            {ROLE_LABEL[cs.player_role] ?? cs.player_role} · {cs.player_class}
          </div>
        </div>

        {/* AP/AD mini bar */}
        <div className="flex-1 min-w-0 max-w-48">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-rajdhani text-xs text-arcane-blue/80">{apPct}% AP</span>
            <span className="font-rajdhani text-xs text-gold-light/20">/</span>
            <span className="font-rajdhani text-xs text-amber-400/80">{adPct}% AD</span>
          </div>
          <div className="h-1.5 rounded-full bg-arcane-dark overflow-hidden flex">
            <div className="bg-arcane-blue/60 transition-all" style={{ width: `${apPct}%` }} />
            <div className="bg-amber-400/60 transition-all" style={{ width: `${adPct}%` }} />
          </div>
        </div>

        {/* Threat tags */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {cs.cc_count >= 3 && <span className="font-rajdhani text-xs text-purple-400/80 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-sm">CC</span>}
          {cs.tank_count >= 2 && <span className="font-rajdhani text-xs text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-sm">Tanks</span>}
          {cs.assassin_count >= 2 && <span className="font-rajdhani text-xs text-red-400/80 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-sm">Assassinos</span>}
        </div>

        {/* Date */}
        <div className="flex-shrink-0 text-right hidden md:block">
          <div className="font-rajdhani text-xs text-gold-light/30">
            {new Date(cs.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-gold/40 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gold/10 space-y-3">
              {/* Enemies */}
              {cs.enemy_champions?.length > 0 && (
                <div className="pt-3">
                  <div className="font-rajdhani text-xs text-gold-light/40 uppercase tracking-widest mb-2">Inimigos</div>
                  <div className="flex flex-wrap gap-2">
                    {cs.enemy_champions.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-arcane-dark border border-gold/10 rounded-sm px-2 py-1">
                        <div className="w-5 h-5 rounded-sm overflow-hidden">
                          <img
                            src={champIconUrl(c)}
                            alt={c}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity='0'; }}
                          />
                        </div>
                        <span className="font-rajdhani text-xs text-gold-light/60">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              {cs.situational_items?.length > 0 && (
                <div>
                  <div className="font-rajdhani text-xs text-gold/60 uppercase tracking-widest mb-1.5">Itens Situacionais Sugeridos</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cs.situational_items.map((item, i) => (
                      <span key={i} className="font-rajdhani text-xs bg-gold/5 border border-gold/15 text-gold-light/70 rounded-sm px-2.5 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {cs.insights?.length > 0 && (
                <div>
                  <div className="font-rajdhani text-xs text-arcane-blue/60 uppercase tracking-widest mb-1.5">Insights</div>
                  <ul className="space-y-1">
                    {cs.insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 font-rajdhani text-sm text-gold-light/60">
                        <span className="text-arcane-blue/50 flex-shrink-0">›</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Full profile view ────────────────────────────────────────────────────────

function ProfileView({ profile, isPro, liveGame, liveLoading, liveError, onCheckLiveGame, ddItems, champMap, spellMap, runeMap, runesData, activeQueue, displayMatches, loadingMore, hasMore, onQueueChange, onLoadMore }: {
  profile: RiotProfile;
  isPro: boolean;
  liveGame: LiveGame | null | 'not-in-game';
  liveLoading: boolean;
  liveError: string | null;
  ddItems: Record<string, DDragonItemInfo>;
  onCheckLiveGame: () => void;
  activeQueue: 'total' | 'solo' | 'flex';
  displayMatches: MatchSummary[];
  loadingMore: boolean;
  hasMore: boolean;
  onQueueChange: (q: 'total' | 'solo' | 'flex') => void;
  onLoadMore: () => void;
} & LiveGameMaps) {
  const { summoner, soloQ, flexQ, stats, statsRankedSolo, statsRankedFlex, recentMatches } = profile;
  const activeStats: AggregatedStats = activeQueue === 'solo' ? statsRankedSolo : activeQueue === 'flex' ? statsRankedFlex : stats;

  const soloTierColor = soloQ ? (TIER_COLOR[soloQ.tier] ?? '#c89b3c') : '#c89b3c';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* ── Profile Card ── */}
      <div className="relative bg-arcane-panel border border-gold/20 rounded-sm p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(200,155,60,0.04),transparent)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-sm border-2 border-gold/30 overflow-hidden bg-arcane-dark">
              <img
                src={profileIconUrl(summoner.profileIconId)}
                alt={summoner.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-arcane-dark border border-gold/30 px-2 py-0.5 rounded-sm">
              <span className="font-rajdhani text-xs text-gold/70">{summoner.level}</span>
            </div>
          </div>

          {/* Name + ranks */}
          <div className="flex-1 min-w-0">
            <h1 className="font-cinzel text-2xl font-bold text-gold-light truncate">{summoner.name}</h1>
            <div className="flex flex-wrap gap-3 mt-3">
              {soloQ && (
                <RankBadge label="Solo/Duo" entry={soloQ} color={soloTierColor} />
              )}
              {flexQ && (
                <RankBadge label="Flex 5v5" entry={flexQ} color={TIER_COLOR[flexQ.tier] ?? '#c89b3c'} />
              )}
              {!soloQ && !flexQ && (
                <span className="font-rajdhani text-sm text-gold-light/30">Sem partidas ranqueadas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Queue filter tabs ── */}
      <div className="flex gap-1 mb-4">
        {(['total', 'solo', 'flex'] as const).map(q => (
          <button
            key={q}
            onClick={() => onQueueChange(q)}
            className={`px-3 py-1 rounded font-rajdhani text-xs font-bold tracking-widest uppercase transition-colors ${
              activeQueue === q
                ? 'bg-gold text-dark-900'
                : 'bg-white/5 text-gold-light/50 hover:bg-white/10'
            }`}
          >
            {q === 'total' ? 'Total' : q === 'solo' ? 'Ranked Solo' : 'Ranked Flex'}
          </button>
        ))}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={<BarChart3 className="w-4 h-4 text-gold" />} label="Partidas" value={String(activeStats.totalGames)} />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-gold" />}
          label="Win Rate"
          value={`${activeStats.winRate}%`}
          valueClass={winRateColor(activeStats.winRate)}
          sub={`${activeStats.wins}V ${activeStats.losses}D`}
        />
        <StatCard
          icon={<Swords className="w-4 h-4 text-gold" />}
          label="KDA"
          value={String(activeStats.avgKda)}
          valueClass={kdaColor(activeStats.avgKda)}
          sub={`${activeStats.avgKills} / ${activeStats.avgDeaths} / ${activeStats.avgAssists}`}
        />
        <StatCard icon={<Target className="w-4 h-4 text-gold" />} label="CS/min" value={String(activeStats.avgCsPerMin)} />
        <StatCard icon={<Eye className="w-4 h-4 text-gold" />} label="Visão" value={String(activeStats.avgVision)} />
        <StatCard icon={<Coins className="w-4 h-4 text-gold" />} label="Ouro Médio" value={activeStats.avgGold.toLocaleString('pt-BR')} />
      </div>

      {/* ── Live Game ── */}
      <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionTitle icon={<Zap className="w-4 h-4 text-gold" />} title="Partida Ao Vivo" />
          <button
            onClick={onCheckLiveGame}
            disabled={liveLoading}
            className="flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 text-gold font-rajdhani font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {liveLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
              : <><Search className="w-3.5 h-3.5" /> Verificar Partida</>
            }
          </button>
        </div>

        <AnimatePresence mode="wait">
          {liveError && (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-4 text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 font-rajdhani text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{liveError}
            </motion.div>
          )}
          {liveGame === 'not-in-game' && (
            <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 mt-4 text-gold-light/40 font-rajdhani text-sm">
              <div className="w-2 h-2 rounded-full bg-gold-light/20" />
              {profile.summoner.name} não está em partida no momento.
            </motion.div>
          )}
          {liveGame && liveGame !== 'not-in-game' && (
            <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LiveGameCard game={liveGame} myPuuid={profile.summoner.puuid} champMap={champMap} spellMap={spellMap} runeMap={runeMap} runesData={runesData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Campeões mais jogados ── */}
      {activeStats.byChampion.length > 0 && (
        <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
          <SectionTitle icon={<Shield className="w-4 h-4 text-gold" />} title="Campeões Mais Jogados" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-4">
            {activeStats.byChampion.map((c) => <ChampCard key={c.champion} champ={c} />)}
          </div>
        </div>
      )}

      {/* ── Partidas recentes ── */}
      <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
        <SectionTitle icon={<Zap className="w-4 h-4 text-gold" />} title="Partidas Recentes" />
        <div className="mt-4 space-y-2">
          {displayMatches.map((m, i) => <MatchRow key={m.matchId} match={m} ddItems={ddItems} puuid={summoner.puuid} index={i} champMap={champMap} spellMap={spellMap} runeMap={runeMap} runesData={runesData} />)}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="mt-3 w-full py-2 rounded font-rajdhani text-sm font-bold tracking-widest uppercase text-gold-light/50 hover:text-gold border border-white/5 hover:border-gold/20 transition-all disabled:opacity-40"
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="flex items-center justify-between gap-4 bg-arcane-panel border border-gold/30 rounded-sm px-5 py-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-gold flex-shrink-0" />
            <span className="font-rajdhani text-sm text-gold-light/80">
              Upgrade para Pro e desbloqueie coaching em tempo real, analytics avançado e histórico ilimitado.
            </span>
          </div>
          <a
            href={route('/#pricing')}
            className="flex-shrink-0 flex items-center gap-1 bg-gold hover:bg-gold-light text-arcane-dark font-cinzel font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-colors"
          >
            Upgrade <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Live Game Card ───────────────────────────────────────────────────────────

interface LiveGameMaps {
  champMap:  Map<number, string>;
  spellMap:  Map<number, string>;
  runeMap:   Map<number, string>;
  runesData: DDragonRunePath[];
}

function deepLolUrl(server: string, riotId: string): string {
  // riotId = "GameName#TAG" → "GameName-TAG"
  const slug = riotId.replace('#', '-');
  return `https://www.deeplol.gg/summoner/${server}/${encodeURIComponent(slug)}`;
}

// ─── Rank badge for live game scoreboard ──────────────────────────────────────

function LiveRankBadge({ tier, rank }: { tier: string; rank: string }) {
  if (!tier) {
    return <span className="inline-block w-8 font-rajdhani text-xs text-gold-light/20 text-center select-none">—</span>;
  }
  const t      = tier.toUpperCase();
  const abbr   = TIER_ABBREV[t] ?? t[0];
  const num    = RANK_NUM[rank] ?? rank;
  const color  = TIER_COLOR[t] ?? '#c89b3c';
  const single = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(t);
  return (
    <span className="font-rajdhani font-bold text-xs leading-none" style={{ color }}>
      {abbr}{single ? '' : num}
    </span>
  );
}

// ─── Ban icon ─────────────────────────────────────────────────────────────────

function BanIcon({ championId, champMap }: { championId: number; champMap: Map<number, string> }) {
  const icon = champIconUrlById(championId, champMap);
  const name = getChampionName(championId, champMap);
  if (championId <= 0) return <div className="w-5 h-5 rounded-sm bg-arcane-panel/50 border border-gold/5" />;
  return (
    <div className="relative w-5 h-5 rounded-sm overflow-hidden border border-red-500/25 flex-shrink-0" title={name}>
      {icon
        ? <img src={icon} alt={name} width={20} height={20} className="w-full h-full object-cover grayscale opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        : <div className="w-full h-full bg-arcane-panel" />}
      <div className="absolute inset-0 bg-red-900/25" />
    </div>
  );
}

// ─── Live game card ────────────────────────────────────────────────────────────

function LiveGameCard({ game, myPuuid, champMap, spellMap, runeMap, runesData }: { game: LiveGame; myPuuid: string } & LiveGameMaps) {
  const mins = Math.floor(game.gameLength / 60);
  const secs = String(game.gameLength % 60).padStart(2, '0');
  const maps: LiveGameMaps = { champMap, spellMap, runeMap, runesData };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="font-rajdhani font-bold text-xs tracking-widest uppercase text-red-400">AO VIVO</span>
        </div>
        <span className="font-rajdhani text-sm text-gold-light/60">{game.queueName}</span>
        <span className="font-cinzel text-sm text-gold-light/40">{mins}:{secs}</span>
      </div>

      <div className="space-y-3">
        <TeamBlock label="Time Azul"     isBlue participants={game.blueTeam} bans={game.blueBans} myPuuid={myPuuid} server={game.server} {...maps} />
        <TeamBlock label="Time Vermelho" isBlue={false} participants={game.redTeam} bans={game.redBans} myPuuid={myPuuid} server={game.server} {...maps} />
      </div>
    </div>
  );
}

function TeamBlock({ label, isBlue, participants, bans, myPuuid, server, champMap, spellMap, runeMap, runesData: _runesData }: {
  label: string;
  isBlue: boolean;
  participants: LiveGame['blueTeam'];
  bans: number[];
  myPuuid: string;
  server: string;
} & LiveGameMaps) {
  const headerBg    = isBlue ? 'bg-arcane-blue/10 border-arcane-blue/20' : 'bg-red-500/10 border-red-500/20';
  const headerText  = isBlue ? 'text-arcane-blue' : 'text-red-400';
  const activeBorder = isBlue ? 'border-arcane-blue/30' : 'border-red-500/30';

  return (
    <div className="rounded-sm overflow-hidden border border-gold/10 bg-arcane-dark/30">
      {/* Team header */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${headerBg}`}>
        <span className={`font-rajdhani font-bold text-xs tracking-widest uppercase ${headerText}`}>{label}</span>
        {/* Bans */}
        <div className="flex items-center gap-1">
          <span className="font-rajdhani text-xs text-gold-light/25 mr-1">Bans:</span>
          {bans.map((id, i) => <BanIcon key={i} championId={id} champMap={champMap} />)}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid items-center px-2 py-1 border-b border-gold/5"
        style={{ gridTemplateColumns: '28px 40px 34px 1fr auto' }}>
        <span className="font-rajdhani text-[10px] text-gold-light/20 uppercase tracking-wider">Rank</span>
        <span />
        <span />
        <span className="font-rajdhani text-[10px] text-gold-light/20 uppercase tracking-wider">Jogador</span>
        <span className="font-rajdhani text-[10px] text-gold-light/20 uppercase tracking-wider text-right">W/L</span>
      </div>

      {/* Participants */}
      <div className="divide-y divide-gold/[0.04]">
        {participants.map((p) => {
          const isMe       = p.puuid === myPuuid;
          const champName  = getChampionName(p.championId, champMap);
          const champIcon  = champIconUrlById(p.championId, champMap);
          const spell1Url  = spellIconUrlById(p.spell1Id, spellMap);
          const spell2Url  = spellIconUrlById(p.spell2Id, spellMap);
          const keystoneUrl = runeMap.get(p.primaryRune) ?? '';
          const subStyleUrl = runeMap.get(p.perkSubStyle) ?? '';
          const displayName = p.riotId || p.summonerName || 'Invocador';
          const profileUrl  = p.riotId ? deepLolUrl(server, p.riotId) : null;
          const total       = (p.wins ?? 0) + (p.losses ?? 0);
          const wr          = total > 0 ? Math.round((p.wins ?? 0) * 100 / total) : null;

          return (
            <div
              key={p.puuid}
              className={`grid items-center gap-1.5 px-2 py-2 transition-colors ${
                isMe ? `${isBlue ? 'bg-arcane-blue/[0.07]' : 'bg-red-500/[0.07]'} border-l-2 ${activeBorder}` : 'hover:bg-gold/[0.02]'
              }`}
              style={{ gridTemplateColumns: '28px 40px 34px 1fr auto' }}
            >
              {/* Rank badge */}
              <div className="flex items-center justify-center">
                <LiveRankBadge tier={p.tier ?? ''} rank={p.rank ?? ''} />
              </div>

              {/* Champion icon */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-arcane-panel border-2 border-gold/15 flex-shrink-0">
                {champIcon
                  ? <img src={champIcon} alt={champName} width={40} height={40} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : <div className="w-full h-full flex items-center justify-center"><Swords className="w-4 h-4 text-gold/30" /></div>}
              </div>

              {/* Spells (left col) + Runes (right col) */}
              <div className="flex gap-0.5">
                <div className="flex flex-col gap-0.5">
                  {[spell1Url, spell2Url].map((url, si) => url
                    ? <img key={si} src={url} alt="" width={16} height={16} className="w-4 h-4 rounded-sm border border-gold/10"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div key={si} className="w-4 h-4 rounded-sm bg-arcane-panel border border-gold/10" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {[keystoneUrl, subStyleUrl].map((url, ri) => url
                    ? <img key={ri} src={url} alt="" width={16} height={16} className="w-4 h-4 opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div key={ri} className="w-4 h-4 rounded-full bg-arcane-panel/50" />
                  )}
                </div>
              </div>

              {/* Name + champion */}
              <div className="min-w-0">
                <div className={`font-rajdhani font-bold text-sm leading-tight truncate ${isMe ? headerText : 'text-gold-light/90'}`}>
                  {displayName}
                  {isMe && <span className="ml-1 opacity-50 font-normal text-xs">(você)</span>}
                </div>
                <div className="font-rajdhani text-xs text-gold-light/35 truncate">{champName}</div>
              </div>

              {/* W/L + link */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {p.tier && total > 0 && (
                  <div className="text-right">
                    <div className="font-rajdhani text-xs text-gold-light/50">
                      {p.wins}W {p.losses}L
                    </div>
                    {wr !== null && (
                      <div className={`font-rajdhani text-[10px] ${wr >= 60 ? 'text-gold' : wr >= 50 ? 'text-arcane-blue' : 'text-red-400/70'}`}>
                        {wr}%
                      </div>
                    )}
                  </div>
                )}
                {profileUrl
                  ? <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-gold/25 hover:text-gold/70 transition-colors" title={`Ver no DeepLol`}>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  : <div className="w-3 h-3" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="font-cinzel text-sm font-bold text-gold-light flex items-center gap-2">
      {icon} {title}
    </h2>
  );
}

function RankBadge({ label, entry, color }: {
  label: string;
  entry: { tier: string; rank: string; lp: number; wins: number; losses: number; winRate: number };
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-arcane-dark/60 border border-gold/15 rounded-sm px-3 py-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div>
        <div className="font-rajdhani text-xs text-gold-light/40 tracking-widest uppercase">{label}</div>
        <div className="font-cinzel font-bold text-sm" style={{ color }}>
          {entry.tier} {entry.rank} <span className="text-gold-light/60 font-rajdhani font-normal text-xs">{entry.lp} LP</span>
        </div>
        <div className="font-rajdhani text-xs text-gold-light/40">
          {entry.wins}V {entry.losses}D · <span className={winRateColor(entry.winRate)}>{entry.winRate}%</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, valueClass, sub }: {
  icon: React.ReactNode; label: string; value: string;
  valueClass?: string; sub?: string;
}) {
  return (
    <div className="bg-arcane-panel border border-gold/20 rounded-sm p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="font-rajdhani text-xs tracking-widest uppercase text-gold/50">{label}</span>
      </div>
      <div className={`font-cinzel text-xl font-bold ${valueClass ?? 'text-gold-light'}`}>{value}</div>
      {sub && <div className="font-rajdhani text-xs text-gold-light/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChampCard({ champ }: { champ: ChampionStats }) {
  return (
    <div className="flex items-center gap-3 bg-arcane-dark/60 border border-gold/10 rounded-sm p-3 hover:border-gold/25 transition-colors">
      <div className="w-10 h-10 rounded-sm overflow-hidden bg-arcane-panel flex-shrink-0 border border-gold/10">
        <img
          src={champIconUrl(champ.champion)}
          alt={champ.champion}
          width={40}
          height={40}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
      </div>
      <div className="min-w-0">
        <div className="font-cinzel font-bold text-sm text-gold-light truncate">{champ.champion}</div>
        <div className={`font-rajdhani text-xs font-bold ${winRateColor(champ.winRate)}`}>
          {champ.winRate}% <span className="text-gold-light/30 font-normal">({champ.games} jogos)</span>
        </div>
        <div className={`font-rajdhani text-xs ${kdaColor(champ.avgKda)}`}>
          {champ.avgKda} KDA · {champ.avgCsMin} cs/m
        </div>
      </div>
    </div>
  );
}

function ExpandStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-black/30 border border-white/8 rounded-sm px-3 py-2">
      <div className="font-rajdhani text-[10px] text-gold-light/50 uppercase tracking-widest mb-0.5 leading-tight">{label}</div>
      <div className={`font-cinzel font-bold text-sm leading-tight ${highlight ? 'text-gold' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function SectionHeader({ label, color = 'bg-gold' }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-0.5 h-3 rounded-full ${color}`} />
      <span className="font-rajdhani text-xs font-bold text-gold-light/70 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ItemSlot({ id, ddItems, size = 28 }: { id: number; ddItems: Record<string, DDragonItemInfo>; size?: number }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  if (!id) return <div style={{ width: size, height: size }} className="rounded-sm bg-[#12111a] flex-shrink-0" />;
  const src = itemIconUrl(id);
  if (!src) return null;

  const info        = ddItems[String(id)];
  const statEntries = info ? Object.entries(info.stats).filter(([, v]) => v > 0).slice(0, 6) : [];
  const desc        = info?.description ? stripItemHtml(info.description) : '';
  const components  = info?.from ?? [];
  const buildsInto  = info?.into ?? [];

  const showTooltip = () => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  };

  const tooltip = pos && info && createPortal(
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y - 8,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999,
        width: 256,
      }}
      className="bg-[#080f1e] border border-gold/40 rounded-sm p-3 shadow-[0_8px_40px_rgba(0,0,0,0.9)] pointer-events-none"
    >
      {/* Name + price */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-cinzel text-xs text-gold font-bold leading-tight">{info.name}</p>
        {info.gold.total > 0 && (
          <span className="font-rajdhani text-[11px] text-gold/80 whitespace-nowrap flex-shrink-0">
            💰 {info.gold.total.toLocaleString('pt-BR')}
            {info.gold.base > 0 && info.gold.base !== info.gold.total && (
              <span className="text-gold/50"> (+{info.gold.base})</span>
            )}
          </span>
        )}
      </div>
      {/* Plaintext */}
      {info.plaintext && (
        <p className="font-rajdhani text-[11px] text-arcane-blue/80 leading-tight mb-1.5 italic">{info.plaintext}</p>
      )}
      {/* Description */}
      {desc && (
        <p className="font-rajdhani text-[11px] text-gold-light/65 leading-snug mb-2 border-t border-white/8 pt-1.5 whitespace-pre-line">
          {desc}
        </p>
      )}
      {/* Stats */}
      {statEntries.length > 0 && (
        <div className="border-t border-white/8 pt-1.5 mb-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
          {statEntries.map(([k, val]) => (
            <p key={k} className="font-rajdhani text-[11px] text-gold-light/70">
              <span className="text-gold">+{typeof val === 'number' && val < 1 ? `${Math.round(val * 100)}%` : val}</span>{' '}
              {STAT_LABELS[k] ?? k}
            </p>
          ))}
        </div>
      )}
      {/* Components */}
      {components.length > 0 && (
        <div className="border-t border-white/8 pt-1.5 mt-1">
          <p className="font-rajdhani text-[9px] text-gold/40 uppercase tracking-widest mb-1">Componentes</p>
          <div className="flex flex-wrap gap-1">
            {components.map(cid => {
              const csrc = itemIconUrl(Number(cid));
              return csrc ? (
                <img key={cid} src={csrc} alt={ddItems[cid]?.name ?? cid}
                  title={ddItems[cid]?.name} width={22} height={22}
                  className="rounded-sm border border-gold/25 object-cover" />
              ) : null;
            })}
          </div>
        </div>
      )}
      {/* Builds into */}
      {buildsInto.length > 0 && (
        <div className="border-t border-white/8 pt-1.5 mt-1">
          <p className="font-rajdhani text-[9px] text-gold/40 uppercase tracking-widest mb-1">Constrói</p>
          <div className="flex flex-wrap gap-1">
            {buildsInto.slice(0, 6).map(iid => {
              const isrc = itemIconUrl(Number(iid));
              return isrc ? (
                <img key={iid} src={isrc} alt={ddItems[iid]?.name ?? iid}
                  title={ddItems[iid]?.name} width={22} height={22}
                  className="rounded-sm border border-gold/25 object-cover" />
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <div
        ref={anchorRef}
        style={{ width: size, height: size }}
        className="rounded-sm overflow-hidden bg-arcane-dark border border-gold/30 hover:border-gold/60 transition-colors cursor-default flex-shrink-0"
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPos(null)}
      >
        <img src={src} alt={info?.name ?? ''} width={size} height={size}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
      </div>
      {tooltip}
    </>
  );
}

function MatchRow({ match: m, ddItems, puuid, index, champMap, spellMap, runeMap, runesData }: {
  match: MatchSummary;
  ddItems: Record<string, DDragonItemInfo>;
  puuid: string;
  index: number;
} & LiveGameMaps) {
  const [expanded, setExpanded]         = useState(false);
  const [activeTab, setActiveTab]       = useState<'postGame'|'performance'|'itemBuild'>('postGame');
  const [timeline, setTimeline]         = useState<ItemPurchase[] | null>(null);
  const [skills, setSkills]             = useState<SkillLevelUp[] | null>(null);
  const [timelineLoading, setTlLoading] = useState(false);
  const [details, setDetails]           = useState<MatchDetails | null>(null);
  const [detailsLoading, setDlLoading]  = useState(false);

  // Carrega detalhes automaticamente (jogadores visíveis sem expandir)
  useEffect(() => {
    setDlLoading(true);
    getMatchDetails(m.matchId)
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setDlLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.matchId]);

  const handleExpand = () => {
    setExpanded(v => !v);
    if (!expanded && timeline === null) {
      setTlLoading(true);
      getMatchTimeline(m.matchId, puuid)
        .then(data => { setTimeline(data.items); setSkills(data.skills ?? []); })
        .catch(() => { setTimeline([]); setSkills([]); })
        .finally(() => setTlLoading(false));
    }
  };

  const isRemake    = m.isRemake === true;
  const accentColor = isRemake ? 'bg-gold-light/20' : m.win ? 'bg-arcane-blue' : 'bg-red-500';
  const rowBg       = isRemake ? 'bg-gold-light/[0.02]' : m.win ? 'bg-arcane-blue/[0.04]' : 'bg-red-500/[0.04]';
  const borderColor = isRemake ? 'border-gold-light/10' : m.win ? 'border-arcane-blue/20' : 'border-red-500/20';
  const isAdc       = m.role === 'BOTTOM';
  const coreItems   = m.items.slice(0, 6);
  const trinketId   = m.items[6] ?? 0;

  const spell1Url  = m.spell1Id  ? spellIconUrlById(m.spell1Id, spellMap)  : '';
  const spell2Url  = m.spell2Id  ? spellIconUrlById(m.spell2Id, spellMap)  : '';
  const keystoneUrl = m.primaryRune  ? runeMap.get(m.primaryRune)  ?? '' : '';
  const subPathUrl  = m.perkSubStyle ? runeMap.get(m.perkSubStyle) ?? '' : '';

  // ── Badges ──────────────────────────────────────────────────────────────────
  type BadgeStyle = 'gold' | 'red' | 'blue' | 'purple' | 'green';
  const badgePalette: Record<BadgeStyle, string> = {
    gold:   'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    red:    'bg-red-500/15 text-red-300 border-red-500/30',
    blue:   'bg-arcane-blue/15 text-arcane-blue border-arcane-blue/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
  const badges: { label: string; style: BadgeStyle }[] = [];
  if (m.pentaKills > 0)                       badges.push({ label: 'Pentakill!',          style: 'gold' });
  else if (m.quadraKills > 0)                  badges.push({ label: 'Quadra Kill!',         style: 'gold' });
  else if (m.tripleKills > 0)                  badges.push({ label: 'Triple Kill!',         style: 'gold' });
  if (m.firstBlood)                            badges.push({ label: 'First Blood',          style: 'red' });
  if (m.objectivesStolen > 0)                  badges.push({ label: `Obj. Roubado${m.objectivesStolen > 1 ? 's' : ''}`, style: 'purple' });
  if (m.goldEarned >= 16000)                   badges.push({ label: 'Podre de Rico',        style: 'gold' });
  if (m.kda >= 10 && m.deaths === 0)           badges.push({ label: 'KDA Perfeito',         style: 'blue' });
  if (m.cs >= 260)                             badges.push({ label: `${m.cs} CS`,           style: 'green' });
  if (m.damageToChamps >= 35000)               badges.push({ label: 'Alto Dano',            style: 'red' });
  if (m.turretKills >= 3)                      badges.push({ label: `${m.turretKills} Torres`, style: 'blue' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className={`relative rounded-sm border ${borderColor} ${rowBg} transition-all duration-200 overflow-hidden`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor}`} />

      {/* ── Compact row ── */}
      <div
        className="flex items-center gap-3 pl-4 pr-3 py-3 cursor-pointer select-none"
        onClick={handleExpand}
      >
        {/* ── Champion icon ── */}
        <div className={`w-[56px] h-[56px] rounded-full overflow-hidden flex-shrink-0 border-2 shadow-md ${
          isRemake ? 'border-gold/20' : m.win ? 'border-arcane-blue/60' : 'border-red-500/60'
        }`}>
          <img src={champIconUrl(m.champion)} alt={m.champion} width={56} height={56}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
        </div>

        {/* ── Col 1: Result + queue + time ── */}
        <div className="w-[148px] flex-shrink-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-rajdhani font-bold text-[11px] px-1.5 py-0.5 rounded-sm border leading-none ${
              isRemake ? 'bg-gold-light/10 text-gold-light/40 border-gold-light/15'
              : m.win  ? 'bg-arcane-blue/20 text-arcane-blue border-arcane-blue/30'
                       : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {isRemake ? 'REMAKE' : m.win ? 'VITÓRIA' : 'DERROTA'}
            </span>
            {m.lpChange != null && (
              <span className={`font-rajdhani font-bold text-[13px] leading-none ${m.lpChange >= 0 ? 'text-gold' : 'text-red-400'}`}>
                {m.lpChange >= 0 ? `+${m.lpChange}` : m.lpChange} PDL
              </span>
            )}
          </div>
          <p className={`font-rajdhani text-[11px] leading-none ${
            isRemake ? 'text-gold-light/30' : m.win ? 'text-arcane-blue/70' : 'text-red-400/70'
          }`}>
            {m.queueName ?? 'Ranked Solo'}
          </p>
          <p className="font-rajdhani text-[10px] text-gold-light/35 leading-none">
            {fmtDuration(Number(m.gameDurationSecs))}
            <span className="mx-1 opacity-40">·</span>
            {timeAgo(m.gameStartTimestamp)}
          </p>
        </div>

        {/* ── Col 2: KDA stats ── */}
        <div className="w-[110px] flex-shrink-0 space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className={`font-rajdhani font-bold text-[16px] leading-none ${kdaColor(m.kda)}`}>
              {m.kda.toFixed(1).replace('.', ',')}
            </span>
            <span className="font-rajdhani text-[10px] text-gold-light/40 leading-none">AMA</span>
          </div>
          <div className="font-cinzel font-bold text-[12px] leading-none">
            <span className="text-arcane-blue">{m.kills}</span>
            <span className="text-gold-light/25 mx-0.5">/</span>
            <span className="text-red-400">{m.deaths}</span>
            <span className="text-gold-light/25 mx-0.5">/</span>
            <span className="text-arcane-blue">{m.assists}</span>
          </div>
          <div className="font-rajdhani text-[10px] text-gold-light/40 leading-none">
            {m.csPerMin.toFixed(1).replace('.', ',')} CS/Min.
            <span className="text-gold-light/20 ml-1">({m.cs})</span>
          </div>
        </div>

        {/* ── Col 3: Spells/Runes + Items + Badges ── */}
        <div className="hidden lg:flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Top: spells/runes + items */}
          <div className="flex items-center gap-2">
            {/* Spells + runes 2×2 */}
            <div className="flex gap-0.5 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                {spell1Url ? <img src={spell1Url} alt="D" width={18} height={18} className="w-[18px] h-[18px] rounded-sm border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  : <div className="w-[18px] h-[18px] rounded-sm bg-arcane-panel border border-white/5" />}
                {spell2Url ? <img src={spell2Url} alt="F" width={18} height={18} className="w-[18px] h-[18px] rounded-sm border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  : <div className="w-[18px] h-[18px] rounded-sm bg-arcane-panel border border-white/5" />}
              </div>
              <div className="flex flex-col gap-0.5">
                {keystoneUrl ? <img src={keystoneUrl} alt="" width={18} height={18} className="w-[18px] h-[18px] rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  : <div className="w-[18px] h-[18px] rounded-full bg-arcane-panel/50" />}
                {subPathUrl ? <img src={subPathUrl} alt="" width={18} height={18} className="w-[18px] h-[18px] rounded-full opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  : <div className="w-[18px] h-[18px] rounded-full bg-arcane-panel/30" />}
              </div>
            </div>
            {/* Items */}
            <div className="flex items-center gap-0.5">
              {coreItems.map((id, idx) => <ItemSlot key={idx} id={id} ddItems={ddItems} size={28} />)}
              <div className="w-px bg-white/8 mx-0.5 self-stretch" />
              <ItemSlot id={trinketId} ddItems={ddItems} size={22} />
            </div>
          </div>
          {/* Bottom: badges */}
          {badges.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {badges.slice(0, 3).map((b, i) => (
                <span key={i} className={`font-rajdhani font-bold text-[10px] px-1.5 py-0.5 rounded-sm border leading-none ${badgePalette[b.style]}`}>
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Col 4: Players ── */}
        <div className="hidden xl:flex gap-3 flex-shrink-0">
          {details ? (
            [details.blueTeam, details.redTeam].map((team, ti) => (
              <div key={ti} className="space-y-px w-[88px]">
                {team.map((p) => {
                  const isMe = p.puuid === puuid;
                  const icon = champIconUrlById(p.championId, champMap);
                  return (
                    <div key={p.puuid} className="flex items-center gap-1 min-w-0">
                      {icon
                        ? <img src={icon} alt={p.championName} width={14} height={14} className="w-[14px] h-[14px] rounded-full flex-shrink-0 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity='0'; }} />
                        : <div className="w-[14px] h-[14px] rounded-full bg-arcane-panel/50 flex-shrink-0" />}
                      <span className={`font-rajdhani text-[11px] truncate ${isMe ? 'text-gold font-bold' : 'text-gold-light/40'}`}>
                        {p.riotId.split('#')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            [0, 1].map(ti => (
              <div key={ti} className="space-y-px w-[88px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-[14px] h-[14px] rounded-full bg-white/5 flex-shrink-0" />
                    <div className="h-2.5 rounded bg-white/5 w-14" />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* ── Chevron ── */}
        <div className="ml-auto flex-shrink-0 pl-1">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gold-light/30" />
          </motion.div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8">

              {/* ── Tabs ── */}
              <div className="flex items-center gap-0 border-b border-white/8 px-4">
                {([
                  { id: 'postGame',     label: 'Post Game' },
                  { id: 'performance',  label: 'Performance' },
                  { id: 'itemBuild',    label: 'Item Build' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
                    className={`font-rajdhani font-bold text-xs tracking-widest uppercase px-4 py-2.5 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-arcane-blue text-arcane-blue'
                        : 'border-transparent text-gold-light/35 hover:text-gold-light/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Post Game tab ── */}
              {activeTab === 'postGame' && (
                <div>
                  {detailsLoading && (
                    <div className="flex items-center gap-2 px-5 py-4 text-gold-light/50 font-rajdhani text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...
                    </div>
                  )}
                  {details && (
                    <div className="space-y-0">
                      <MatchScoreboard
                        team={details.blueTeam} isBlue myPuuid={puuid}
                        ddItems={ddItems} champMap={champMap} spellMap={spellMap} runeMap={runeMap} runesData={runesData}
                      />
                      <MatchScoreboard
                        team={details.redTeam} isBlue={false} myPuuid={puuid}
                        ddItems={ddItems} champMap={champMap} spellMap={spellMap} runeMap={runeMap} runesData={runesData}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── Performance tab ── */}
              {activeTab === 'performance' && (
                <div className="overflow-x-auto">
                  {detailsLoading && (
                    <div className="flex items-center gap-2 px-5 py-4 text-gold-light/50 font-rajdhani text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...
                    </div>
                  )}
                  {details && (() => {
                    const allPlayers = [...details.blueTeam, ...details.redTeam];
                    const winners = allPlayers.filter(p => p.win).sort((a, b) => b.damageToChamps - a.damageToChamps);
                    const losers  = allPlayers.filter(p => !p.win).sort((a, b) => b.damageToChamps - a.damageToChamps);
                    const maxDmg  = Math.max(...allPlayers.map(p => p.damageToChamps), 1);

                    const colHeaders = (
                      <tr className="border-b border-white/8">
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-4 py-2 w-[200px]">Player</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-3 py-2 text-center">Kills</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-3 py-2 text-center">KDA</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-arcane-blue px-3 py-2 text-center border-b-2 border-arcane-blue">Damage</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-3 py-2 text-center">Gold</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-3 py-2 text-center">Wards</th>
                        <th className="font-rajdhani text-[10px] tracking-widest uppercase text-gold-light/30 px-3 py-2 text-center">CS</th>
                      </tr>
                    );

                    const teamHeader = (won: boolean) => (
                      <tr>
                        <td colSpan={7} className={`px-4 py-1.5 font-rajdhani font-bold text-[10px] tracking-widest uppercase ${won ? 'text-purple-400 bg-purple-500/10' : 'text-red-400 bg-red-500/10'}`}>
                          {won ? 'VITÓRIA' : 'DERROTA'}
                        </td>
                      </tr>
                    );

                    const playerRow = (p: MatchDetailsParticipant) => {
                      const isMe   = p.puuid === puuid;
                      const icon   = champIconUrlById(p.championId, champMap);
                      const kda    = p.deaths === 0 ? `${(p.kills + p.assists).toFixed(2)}` : ((p.kills + p.assists) / p.deaths).toFixed(2);
                      const dmgPct = Math.round(p.damageToChamps * 100 / maxDmg);
                      const barColor = p.win ? 'bg-purple-400' : 'bg-red-500';
                      return (
                        <tr key={p.puuid} className={`border-b border-white/[0.04] ${isMe ? 'bg-gold/[0.05]' : 'hover:bg-white/[0.02]'}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1 h-8 rounded-full flex-shrink-0 ${p.win ? 'bg-purple-400' : 'bg-red-500'}`} />
                              {icon
                                ? <img src={icon} alt={p.championName} width={28} height={28} className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                                : <div className="w-7 h-7 rounded-full bg-arcane-panel flex-shrink-0" />}
                              <span className={`font-rajdhani text-xs truncate max-w-[110px] ${isMe ? 'text-gold font-bold' : 'text-gold-light/70'}`}>
                                {p.riotId}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center font-rajdhani font-bold text-sm text-white">{p.kills}</td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="font-rajdhani font-bold text-sm text-white">{kda}</div>
                            <div className="font-rajdhani text-[10px] text-gold-light/35">{p.kills}/{p.deaths}/{p.assists}</div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="font-rajdhani font-bold text-sm text-white">{p.damageToChamps.toLocaleString('pt-BR')}</div>
                            <div className="mt-1 h-1 rounded-full bg-white/10 w-20 mx-auto">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${dmgPct}%` }} />
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center font-rajdhani text-sm text-gold-light/70">{(p.goldEarned/1000).toFixed(1)}k</td>
                          <td className="px-3 py-2.5 text-center font-rajdhani text-sm text-gold-light/70">{p.wardsPlaced}</td>
                          <td className="px-3 py-2.5 text-center font-rajdhani text-sm text-gold-light/70">{p.cs}</td>
                        </tr>
                      );
                    };

                    return (
                      <table className="w-full text-left">
                        <thead>{colHeaders}</thead>
                        <tbody>
                          {teamHeader(true)}
                          {winners.map(playerRow)}
                          {teamHeader(false)}
                          {losers.map(playerRow)}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              )}

              {/* ── Item Build tab ── */}
              {activeTab === 'itemBuild' && (
                <div className="px-4 pb-4 pt-3 space-y-5">

                  {/* Runes – full rune page */}
                  <div>
                    <SectionHeader label="Runas" color="bg-purple-400" />
                    {(() => {
                      const me = details
                        ? [...details.blueTeam, ...details.redTeam].find(p => p.puuid === puuid)
                        : null;

                      const STAT_SHARD: Record<number, string> = {
                        5008: 'Força Adap.', 5005: 'Vel. Ataque', 5007: 'Pressa Hab.',
                        5001: 'Vida Bônus', 5002: 'Armadura',    5003: 'Res. Mágica',
                      };

                      const primaryPath   = me ? runesData.find(p => p.id === me.perkStyle)    : null;
                      const secondaryPath = me ? runesData.find(p => p.id === me.perkSubStyle) : null;
                      const selectedSet   = new Set<number>(me?.allRunes ?? []);

                      // Fallback: use MatchSummary data if details not loaded
                      const showFallback = !me && (m.primaryRune > 0 || m.perkSubStyle > 0);

                      if (showFallback) {
                        return (
                          <div className="flex items-center gap-4 mt-2">
                            {m.primaryRune > 0 && (
                              <img src={runeMap.get(m.primaryRune) ?? ''} alt="Keystone" width={36} height={36}
                                className="w-9 h-9 rounded-full border-2 border-purple-400/40"
                                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                            )}
                            {m.perkSubStyle > 0 && (
                              <img src={runeMap.get(m.perkSubStyle) ?? ''} alt="Sub path" width={28} height={28}
                                className="w-7 h-7 opacity-80"
                                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                            )}
                          </div>
                        );
                      }

                      if (!primaryPath && !secondaryPath) return null;

                      const ddBase = 'https://ddragon.leagueoflegends.com/cdn/img/';

                      return (
                        <div className="mt-3 flex flex-wrap gap-6">
                          {/* Primary path */}
                          {primaryPath && (
                            <div className="min-w-[180px]">
                              <div className="flex items-center gap-2 mb-3">
                                <img src={`${ddBase}${primaryPath.icon}`} alt={primaryPath.name}
                                  width={22} height={22} className="w-[22px] h-[22px]"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                                <span className="font-rajdhani font-bold text-xs text-purple-300 uppercase tracking-wider">
                                  {primaryPath.name}
                                </span>
                              </div>
                              {primaryPath.slots.map((slot, si) => (
                                <div key={si} className={`flex justify-center gap-2 mb-2 ${si === 0 ? 'mb-3' : ''}`}>
                                  {slot.runes.map(rune => {
                                    const chosen = selectedSet.has(rune.id);
                                    const size   = si === 0 ? 44 : 34;
                                    return (
                                      <img key={rune.id}
                                        src={`${ddBase}${rune.icon}`}
                                        alt={rune.name} title={rune.name}
                                        width={size} height={size}
                                        style={{ width: size, height: size }}
                                        className={`rounded-full border-2 transition-all flex-shrink-0 ${
                                          chosen
                                            ? 'border-purple-400/70 opacity-100 shadow-[0_0_6px_rgba(168,85,247,0.5)]'
                                            : 'border-transparent opacity-20 grayscale'
                                        }`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                      />
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Secondary path */}
                          {secondaryPath && (
                            <div className="min-w-[160px]">
                              <div className="flex items-center gap-2 mb-3">
                                <img src={`${ddBase}${secondaryPath.icon}`} alt={secondaryPath.name}
                                  width={18} height={18} className="w-[18px] h-[18px] opacity-80"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                                <span className="font-rajdhani font-bold text-xs text-gold-light/60 uppercase tracking-wider">
                                  {secondaryPath.name}
                                </span>
                              </div>
                              {secondaryPath.slots.slice(1).map((slot, si) => (
                                <div key={si} className="flex justify-center gap-2 mb-2">
                                  {slot.runes.map(rune => {
                                    const chosen = selectedSet.has(rune.id);
                                    return (
                                      <img key={rune.id}
                                        src={`${ddBase}${rune.icon}`}
                                        alt={rune.name} title={rune.name}
                                        width={30} height={30}
                                        className={`w-[30px] h-[30px] rounded-full border-2 transition-all flex-shrink-0 ${
                                          chosen
                                            ? 'border-gold/60 opacity-100'
                                            : 'border-transparent opacity-20 grayscale'
                                        }`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                      />
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stat shards + skill accuracy */}
                          {me && (
                            <div className="space-y-4">
                              {me.statPerks && (
                                <div>
                                  <div className="font-rajdhani text-[10px] text-gold-light/30 uppercase tracking-wider mb-2">Shards</div>
                                  {[me.statPerks.offense, me.statPerks.flex, me.statPerks.defense].map((id, i) => (
                                    <div key={i} className="flex items-center gap-2 py-0.5">
                                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                                        i === 0 ? 'bg-red-400/50 border border-red-400/60'
                                        : i === 1 ? 'bg-arcane-blue/50 border border-arcane-blue/60'
                                        : 'bg-emerald-400/50 border border-emerald-400/60'
                                      }`} />
                                      <span className="font-rajdhani text-xs text-gold-light/60">
                                        {STAT_SHARD[id] ?? `#${id}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(me.skillshotsHit + me.skillshotsDodged) > 0 && (
                                <div>
                                  <div className="font-rajdhani text-[10px] text-gold-light/30 uppercase tracking-wider mb-1">Acerto de Skill</div>
                                  <div className="font-rajdhani font-bold text-2xl text-arcane-blue leading-none">
                                    {Math.round(me.skillshotsHit / (me.skillshotsHit + me.skillshotsDodged) * 100)}%
                                  </div>
                                  <div className="font-rajdhani text-[10px] text-gold-light/40 mt-0.5">
                                    {me.skillshotsHit} acertos / {me.skillshotsHit + me.skillshotsDodged} tentativas
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Skill Order */}
                  <div>
                    <SectionHeader label="Skill Order" color="bg-arcane-blue" />
                    {timelineLoading && (
                      <div className="flex items-center gap-2 text-gold-light/50 font-rajdhani text-xs mt-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Carregando...
                      </div>
                    )}
                    {!timelineLoading && skills && skills.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {(['Q', 'W', 'E', 'R'] as const).map((key, si) => {
                          const slot = si + 1;
                          const slotColor: Record<number, string> = {
                            1: 'bg-arcane-blue text-white',
                            2: 'bg-purple-500 text-white',
                            3: 'bg-red-500 text-white',
                            4: 'bg-yellow-500 text-black',
                          };
                          return (
                            <div key={key} className="flex items-center gap-1">
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-rajdhani font-bold text-[10px] flex-shrink-0 ${slotColor[slot]}`}>
                                {key}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 18 }, (_, i) => {
                                  const lv = i + 1;
                                  const ev = skills.find(s => s.level === lv && s.skillSlot === slot);
                                  return (
                                    <div
                                      key={lv}
                                      className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center border ${
                                        ev
                                          ? `${slotColor[slot]} border-transparent`
                                          : 'bg-arcane-dark border-white/10 text-gold-light/20'
                                      }`}
                                    >
                                      {ev ? lv : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!timelineLoading && skills?.length === 0 && (
                      <p className="font-rajdhani text-xs text-gold-light/30 mt-2">Dados não disponíveis.</p>
                    )}
                  </div>

                  {/* Item timeline */}
                  <div>
                    <SectionHeader label="Ordem de Compras" color="bg-gold/70" />
                    {timelineLoading && (
                      <div className="flex items-center gap-2 text-gold-light/50 font-rajdhani text-xs mt-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Carregando...
                      </div>
                    )}
                    {!timelineLoading && timeline && timeline.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {timeline.map((ev, idx) => (
                          <motion.div key={idx}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02, duration: 0.15 }}
                            className="flex flex-col items-center gap-0.5">
                            <ItemSlot id={ev.itemId} ddItems={ddItems} size={34} />
                            <span className="font-rajdhani text-[9px] text-gold-light/50">
                              {ev.minuteMark} min
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {!timelineLoading && timeline?.length === 0 && (
                      <p className="font-rajdhani text-xs text-gold-light/30 mt-2">Dados não disponíveis.</p>
                    )}
                  </div>

                  {/* Spell casts */}
                  <div>
                    <SectionHeader label="Usos de Habilidades" color="bg-purple-400" />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {([['Q', m.qCasts], ['W', m.wCasts], ['E', m.eCasts], ['R', m.rCasts]] as const).map(([k, v]) => (
                        <ExpandStat key={k} label={k} value={String(v)} />
                      ))}
                    </div>
                  </div>

                  {/* Combat stats */}
                  <div>
                    <SectionHeader label="Combate & Economia" color="bg-red-400" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                      <ExpandStat label="Dano Causado"    value={m.damageToChamps.toLocaleString('pt-BR')} />
                      <ExpandStat label="Dano Recebido"   value={m.damageTaken.toLocaleString('pt-BR')} />
                      <ExpandStat label="Ouro Ganho"      value={m.goldEarned.toLocaleString('pt-BR')} />
                      <ExpandStat label="Visão"           value={String(m.visionScore)} />
                      <ExpandStat label="Wards Colocadas" value={String(m.wardsPlaced)} />
                      <ExpandStat label="Tempo Morto"     value={`${Math.floor(m.timeDeadSecs/60)}m ${m.timeDeadSecs%60}s`} />
                      {m.pentaKills > 0       && <ExpandStat label="Pentas"         value={String(m.pentaKills)} highlight />}
                      {m.firstBlood           && <ExpandStat label="First Blood"    value="Sim" highlight />}
                      {m.objectivesStolen > 0 && <ExpandStat label="Obj. Roubados" value={String(m.objectivesStolen)} highlight />}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Match Scoreboard (expanded view, all 10 players) ─────────────────────────

function MatchScoreboard({ team, isBlue, myPuuid, ddItems, champMap, spellMap, runeMap, runesData: _runesData }: {
  team: MatchDetailsParticipant[];
  isBlue: boolean;
  myPuuid: string;
  ddItems: Record<string, DDragonItemInfo>;
} & LiveGameMaps) {
  const maxDmg     = Math.max(...team.map(p => p.damageToChamps), 1);
  const won        = team[0]?.win === true;
  const headerBg   = won ? 'bg-purple-500/10 border-purple-500/20' : 'bg-red-500/10 border-red-500/20';
  const headerText = won ? 'text-purple-400' : 'text-red-400';
  const accentBorder = won ? 'border-l-purple-400/40' : 'border-l-red-500/40';
  const teamName   = isBlue ? 'Time Azul' : 'Time Vermelho';
  const winLabel   = won ? 'VITÓRIA' : 'DERROTA';

  return (
    <div>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-1 border-b ${headerBg} border-y border-gold/5`}>
        {/* Spacer: champ icon (w-8) */}
        <div className="w-8 flex-shrink-0" />
        {/* Spacer: spells+runes */}
        <div className="w-[30px] flex-shrink-0" />
        {/* Name column: team label + win result */}
        <div className="w-48 flex-shrink-0">
          <span className={`font-rajdhani font-bold text-[11px] tracking-widest uppercase whitespace-nowrap ${headerText}`}>
            {winLabel} <span className="opacity-60">({teamName})</span>
          </span>
        </div>
        {/* Column labels */}
        <div className="flex gap-2 font-rajdhani text-[10px] text-gold-light/30 uppercase tracking-wider">
          <span className="w-20 text-center flex-shrink-0">KDA</span>
          <span className="hidden sm:inline-block w-24 text-center flex-shrink-0">Dano</span>
          <span className="hidden sm:inline-block w-10 text-right flex-shrink-0">CS</span>
          <span className="hidden md:inline-block w-8 text-right flex-shrink-0">Ouro</span>
          <span className="hidden lg:inline-block flex-shrink-0">Itens</span>
        </div>
      </div>

      {/* Players */}
      {team.map((p) => {
        const isMe       = p.puuid === myPuuid;
        const champIcon  = champIconUrlById(p.championId, champMap);
        const champName  = getChampionName(p.championId, champMap);
        const spell1Url  = spellIconUrlById(p.spell1Id, spellMap);
        const spell2Url  = spellIconUrlById(p.spell2Id, spellMap);
        const keystoneUrl = runeMap.get(p.primaryRune) ?? '';
        const subPathUrl  = runeMap.get(p.perkSubStyle) ?? '';
        const kda        = p.deaths === 0 ? `${p.kills + p.assists}` : ((p.kills + p.assists) / p.deaths).toFixed(2);
        const dmgPct     = Math.round(p.damageToChamps * 100 / maxDmg);
        const items      = p.items ?? [];

        return (
          <div key={p.puuid}
            className={`flex items-center gap-2 px-3 py-1.5 border-b border-gold/[0.04] transition-colors ${
              isMe ? `bg-gold/[0.05] border-l-2 ${accentBorder}` : 'hover:bg-gold/[0.02]'
            }`}
          >
            {/* Champion icon */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/15">
              {champIcon
                ? <img src={champIcon} alt={champName} width={32} height={32} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                : <div className="w-full h-full bg-arcane-panel flex items-center justify-center">
                    <Swords className="w-3 h-3 text-gold/30" />
                  </div>}
            </div>

            {/* Spells + runes */}
            <div className="flex gap-0.5 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                {spell1Url ? <img src={spell1Url} alt="D" width={14} height={14} className="w-3.5 h-3.5 rounded-sm" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                  : <div className="w-3.5 h-3.5 rounded-sm bg-arcane-panel" />}
                {spell2Url ? <img src={spell2Url} alt="F" width={14} height={14} className="w-3.5 h-3.5 rounded-sm" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                  : <div className="w-3.5 h-3.5 rounded-sm bg-arcane-panel" />}
              </div>
              <div className="flex flex-col gap-0.5">
                {keystoneUrl ? <img src={keystoneUrl} alt="" width={14} height={14} className="w-3.5 h-3.5" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                  : <div className="w-3.5 h-3.5 rounded-full bg-arcane-panel/50" />}
                {subPathUrl ? <img src={subPathUrl} alt="" width={14} height={14} className="w-3.5 h-3.5 opacity-70" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                  : <div className="w-3.5 h-3.5 rounded-full bg-arcane-panel/30" />}
              </div>
            </div>

            {/* Name + champion */}
            <div className="min-w-0 w-28 flex-shrink-0">
              <div className={`font-rajdhani font-bold text-xs truncate leading-tight ${isMe ? (isBlue ? 'text-arcane-blue' : 'text-red-400') : 'text-gold-light/85'}`}>
                {p.riotId || champName}
                {isMe && <span className="ml-1 text-gold/40 font-normal text-[10px]">(você)</span>}
              </div>
              <div className="font-rajdhani text-[10px] text-gold-light/35 truncate">{champName}</div>
            </div>

            {/* KDA */}
            <div className="w-20 text-center flex-shrink-0">
              <div className={`font-cinzel font-bold text-xs ${kdaColor(parseFloat(kda))}`}>
                {p.kills}/{p.deaths}/{p.assists}
              </div>
              <div className="font-rajdhani text-[10px] text-gold-light/40">{kda} KDA</div>
            </div>

            {/* Damage bar */}
            <div className="hidden sm:block w-24 flex-shrink-0">
              <div className="font-rajdhani text-[10px] text-gold-light/55 text-right mb-0.5">
                {p.damageToChamps.toLocaleString('pt-BR')}
              </div>
              <div className="h-1.5 bg-arcane-panel rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isBlue ? 'bg-arcane-blue/60' : 'bg-red-500/60'}`}
                  style={{ width: `${dmgPct}%` }}
                />
              </div>
            </div>

            {/* CS */}
            <div className="hidden sm:block w-10 text-right flex-shrink-0">
              <div className="font-rajdhani text-xs text-gold-light/70">{p.cs}</div>
            </div>

            {/* Gold */}
            <div className="hidden md:block w-8 text-right flex-shrink-0">
              <div className="font-rajdhani text-xs text-gold/70">{fmtGold(p.goldEarned)}</div>
            </div>

            {/* Items
                Season 2025 ADC (BOTTOM) rule:
                  items[0-5] = regular items (same for all)
                  items[6]   = trinket/ward  (same for all)
                  items[7]   = boot/lane-mission slot (ADC only — only rendered if non-zero) */}
            <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
              {items.slice(0, 6).map((id, idx) => <ItemSlot key={idx} id={id} ddItems={ddItems} size={22} />)}
              {/* ADC boot slot — shown only when the player actually has a boot item */}
              {p.teamPosition === 'BOTTOM' && (items[7] ?? 0) > 0 && (
                <ItemSlot id={items[7]} ddItems={ddItems} size={22} />
              )}
              {/* Divider before trinket/ward */}
              <div className="w-px bg-white/8 mx-0.5 self-stretch" />
              {/* Trinket always lives at index 6 for all roles */}
              <ItemSlot id={items[6] ?? 0} ddItems={ddItems} size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
