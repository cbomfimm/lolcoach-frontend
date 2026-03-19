'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Crown, Swords, TrendingUp, LogOut,
  Search, AlertCircle, Loader2, ChevronRight,
  Shield, Zap, Eye, Coins, Target, BarChart3,
  CheckCircle2, XCircle, Trash2, BookOpen, History, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { asset, route } from '@/lib/assets';
import { getDDragonVersion, champIconUrl, itemIconUrl, profileIconUrl, getItemsData, type DDragonItemInfo } from '@/lib/ddragon';
import {
  getRiotProfile, getRiotProfileByPuuid, getMySummoner, getLiveGame,
  getSessions, deleteSession, getAnalyticsTrend, getRecentChampSelect, getMatchTimeline,
  type RiotProfile, type MatchSummary, type ChampionStats, type LiveGame, type SummonerProfile,
  type PostGameSession, type PagedResult, type AnalyticsTrend, type ChampSelectEntry,
  type ItemPurchase,
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

  // Coaching tab state
  const [sessions, setSessions]         = useState<PostGameSession[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsOffset, setSessionsOffset] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [trend, setTrend]               = useState<AnalyticsTrend | null>(null);
  const [champSelects, setChampSelects] = useState<ChampSelectEntry[]>([]);
  const [coachingLoaded, setCoachingLoaded] = useState(false); // used in EmptySearch fallback

  const handleCheckLiveGame = async () => {
    if (!profile) return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveGame(null);
    try {
      const game = await getLiveGame(profile.summoner.puuid);
      setLiveGame(game ?? 'not-in-game');
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Erro ao verificar partida');
    } finally {
      setLiveLoading(false);
    }
  };

  const loadCoachingData = useCallback(async (reset = false) => {
    setSessionsLoading(true);
    const nextOffset = reset ? 0 : sessionsOffset;
    try {
      const [paged, trendData, csHistory] = await Promise.all([
        getSessions(20, nextOffset),
        getAnalyticsTrend(),
        getRecentChampSelect(10),
      ]);
      setSessions(prev => reset ? paged.data : [...prev, ...paged.data]);
      setSessionsTotal(paged.total);
      setSessionsOffset(nextOffset + paged.data.length);
      setTrend(trendData);
      setChampSelects(csHistory);
      setCoachingLoaded(true);
    } catch {
      // silently fail — data may not exist yet
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
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Erro ao vincular conta');
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
          } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('Limite de requisições') || msg.includes('429'))
              setError('Riot API temporariamente indisponível. Aguarde alguns segundos e recarregue a página.');
            else
              setError('Não foi possível carregar o perfil Riot. Verifique sua conexão ou tente recarregar.');
          }
        }
      } catch {
        // getMySummoner falhou — sem conta vinculada, mostra form
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [user]);


  const handleSignOut = async () => { await signOut(); router.replace('/'); };

  if (loading || loadingInit) {
    return (
      <div className="min-h-screen bg-arcane-dark flex items-center justify-center gap-3 text-gold/50">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-rajdhani tracking-widest uppercase text-sm">Carregando...</span>
      </div>
    );
  }

  const isPro = (subscription?.tier === 'grandmaster' || subscription?.tier === 'challenger') && !!subscription?.is_active;

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
    </div>
  );
}

// ─── Link Account Modal ───────────────────────────────────────────────────────

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

function ProfileView({ profile, isPro, liveGame, liveLoading, liveError, onCheckLiveGame, ddItems }: {
  profile: RiotProfile;
  isPro: boolean;
  liveGame: LiveGame | null | 'not-in-game';
  liveLoading: boolean;
  liveError: string | null;
  ddItems: Record<string, DDragonItemInfo>;
  onCheckLiveGame: () => void;
}) {
  const { summoner, soloQ, flexQ, stats, recentMatches } = profile;

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

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={<BarChart3 className="w-4 h-4 text-gold" />} label="Partidas" value={String(stats.totalGames)} />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-gold" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          valueClass={winRateColor(stats.winRate)}
          sub={`${stats.wins}V ${stats.losses}D`}
        />
        <StatCard
          icon={<Swords className="w-4 h-4 text-gold" />}
          label="KDA"
          value={String(stats.avgKda)}
          valueClass={kdaColor(stats.avgKda)}
          sub={`${stats.avgKills} / ${stats.avgDeaths} / ${stats.avgAssists}`}
        />
        <StatCard icon={<Target className="w-4 h-4 text-gold" />} label="CS/min" value={String(stats.avgCsPerMin)} />
        <StatCard icon={<Eye className="w-4 h-4 text-gold" />} label="Visão" value={String(stats.avgVision)} />
        <StatCard icon={<Coins className="w-4 h-4 text-gold" />} label="Ouro Médio" value={stats.avgGold.toLocaleString('pt-BR')} />
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
              <LiveGameCard game={liveGame} myPuuid={profile.summoner.puuid} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Campeões mais jogados ── */}
      {stats.byChampion.length > 0 && (
        <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
          <SectionTitle icon={<Shield className="w-4 h-4 text-gold" />} title="Campeões Mais Jogados" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-4">
            {stats.byChampion.map((c) => <ChampCard key={c.champion} champ={c} />)}
          </div>
        </div>
      )}

      {/* ── Partidas recentes ── */}
      <div className="bg-arcane-panel border border-gold/20 rounded-sm p-6">
        <SectionTitle icon={<Zap className="w-4 h-4 text-gold" />} title="Partidas Recentes" />
        <div className="mt-4 space-y-2">
          {recentMatches.map((m) => <MatchRow key={m.matchId} match={m} ddItems={ddItems} puuid={summoner.puuid} />)}
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

function champIconById(_id: number) {
  // Champion name not available from spectator API, only ID — use generic placeholder
  return champIconUrl('Aatrox');
}

function LiveGameCard({ game, myPuuid }: { game: LiveGame; myPuuid: string }) {
  const mins = Math.floor(game.gameLength / 60);
  const secs = String(game.gameLength % 60).padStart(2, '0');

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="font-rajdhani font-bold text-xs tracking-widest uppercase text-red-400">AO VIVO</span>
        </div>
        <span className="font-rajdhani text-sm text-gold-light/60">{game.queueName}</span>
        <span className="font-cinzel text-sm text-gold-light/40">{mins}:{secs}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TeamBlock label="Time Azul" color="arcane-blue" participants={game.blueTeam} bans={game.blueBans} myPuuid={myPuuid} />
        <TeamBlock label="Time Vermelho" color="red-400" participants={game.redTeam} bans={game.redBans} myPuuid={myPuuid} />
      </div>
    </div>
  );
}

function TeamBlock({ label, color, participants, bans, myPuuid }: {
  label: string; color: string;
  participants: LiveGame['blueTeam'];
  bans: number[];
  myPuuid: string;
}) {
  const borderColor = color === 'arcane-blue' ? 'border-arcane-blue/20' : 'border-red-400/20';
  const textColor   = color === 'arcane-blue' ? 'text-arcane-blue' : 'text-red-400';

  return (
    <div className={`border ${borderColor} rounded-sm p-4 bg-arcane-dark/40`}>
      <div className={`font-rajdhani font-bold text-xs tracking-widest uppercase ${textColor} mb-3`}>{label}</div>
      <div className="space-y-2">
        {participants.map((p) => {
          const isMe = p.puuid === myPuuid;
          return (
            <div key={p.puuid} className={`flex items-center gap-3 px-2 py-1.5 rounded-sm ${isMe ? 'bg-gold/10 border border-gold/20' : ''}`}>
              {/* Champion icon placeholder */}
              <div className="w-8 h-8 rounded-sm bg-arcane-panel border border-gold/10 flex items-center justify-center flex-shrink-0">
                <Swords className="w-3.5 h-3.5 text-gold/30" />
              </div>
              <div className="min-w-0">
                <div className={`font-rajdhani font-bold text-sm truncate ${isMe ? 'text-gold' : 'text-gold-light/80'}`}>
                  {p.summonerName || 'Invocador'}
                  {isMe && <span className="ml-1.5 text-gold/60 font-normal text-xs">(você)</span>}
                </div>
                <div className="font-rajdhani text-xs text-gold-light/30">
                  Campeão #{p.championId}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bans.filter(b => b > 0).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gold/10">
          <div className="font-rajdhani text-xs text-gold-light/30 mb-1.5 uppercase tracking-wider">Bans</div>
          <div className="flex flex-wrap gap-1.5">
            {bans.filter(b => b > 0).map((id, i) => (
              <div key={i} className="w-6 h-6 rounded-sm bg-arcane-panel border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-3 h-3 text-red-400/50" />
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div>
      <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-0.5">{label}</div>
      <div className={`font-cinzel text-sm ${highlight ? 'text-gold' : 'text-gold-light/80'}`}>{value}</div>
    </div>
  );
}

function ItemSlot({ id, ddItems, size = 28 }: { id: number; ddItems: Record<string, DDragonItemInfo>; size?: number }) {
  if (!id) return <div style={{ width: size, height: size }} className="rounded-sm bg-arcane-dark/60 border border-gold/10 flex-shrink-0" />;
  const src = itemIconUrl(id);
  if (!src) return null;
  const info = ddItems[String(id)];
  const statEntries = info ? Object.entries(info.stats).slice(0, 5) : [];
  return (
    <div className="relative group/item flex-shrink-0">
      <div style={{ width: size, height: size }} className="rounded-sm overflow-hidden bg-arcane-dark border border-gold/20">
        <img src={src} alt={info?.name ?? ''} width={size} height={size}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
      </div>
      {info && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                        pointer-events-none hidden group-hover/item:block
                        w-52 bg-[#091428] border border-gold/25 rounded-sm p-2.5 shadow-2xl">
          <p className="font-cinzel text-xs text-gold-light font-bold leading-tight">{info.name}</p>
          {info.plaintext && (
            <p className="font-rajdhani text-[11px] text-gold/50 mt-0.5 leading-tight">{info.plaintext}</p>
          )}
          {(info.gold.total > 0 || statEntries.length > 0) && (
            <div className="border-t border-gold/10 mt-1.5 pt-1.5 space-y-0.5">
              {info.gold.total > 0 && (
                <p className="font-rajdhani text-[11px] text-gold/70">💰 {info.gold.total} ouro</p>
              )}
              {statEntries.map(([k, val]) => (
                <p key={k} className="font-rajdhani text-[11px] text-gold-light/60">
                  +{typeof val === 'number' && val < 1 ? `${Math.round(val * 100)}%` : val} {STAT_LABELS[k] ?? k}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchRow({ match: m, ddItems, puuid }: { match: MatchSummary; ddItems: Record<string, DDragonItemInfo>; puuid: string }) {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<ItemPurchase[] | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const handleExpand = () => {
    setExpanded(v => !v);
    if (!expanded && timeline === null) {
      setTimelineLoading(true);
      getMatchTimeline(m.matchId, puuid)
        .then(data => setTimeline(data.items))
        .catch(() => setTimeline([]))
        .finally(() => setTimelineLoading(false));
    }
  };
  const cs  = m.cs;
  const csm = m.csPerMin;
  const isAdc = m.role === 'BOTTOM';

  // All roles: items[0..5] (6 core) + items[6] (trinket) = 7 slots
  // ADC: same 7 + 1 empty placeholder for elixir = 8 slots
  const coreItems    = m.items.slice(0, 6);   // índices 0-5
  const trinketId    = m.items[6] ?? 0;        // índice 6 = trinket
  const compactSlots = isAdc ? [...coreItems, trinketId, 0] : [...coreItems, trinketId];

  const borderClass = m.win
    ? 'border-arcane-blue/20 bg-arcane-blue/5'
    : 'border-red-500/15 bg-red-500/5';

  return (
    <div className={`rounded-sm border ${borderClass} transition-colors`}>
      {/* ── Main row ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={handleExpand}
      >
        {/* Result */}
        <div className="flex-shrink-0">
          {m.win
            ? <CheckCircle2 className="w-4 h-4 text-arcane-blue" />
            : <XCircle className="w-4 h-4 text-red-400" />
          }
        </div>

        {/* Champion icon */}
        <div className="w-9 h-9 rounded-sm overflow-hidden bg-arcane-dark flex-shrink-0 border border-gold/10">
          <img src={champIconUrl(m.champion)} alt={m.champion} width={36} height={36}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
        </div>

        {/* Champion + role */}
        <div className="w-24 flex-shrink-0">
          <div className="font-cinzel font-bold text-sm text-gold-light truncate">{m.champion}</div>
          <div className="font-rajdhani text-xs text-gold-light/40">{ROLE_LABEL[m.role] ?? m.role}</div>
        </div>

        {/* KDA */}
        <div className="flex-1 min-w-0">
          <div className={`font-cinzel font-bold text-sm ${kdaColor(m.kda)}`}>
            {m.kills}/{m.deaths}/{m.assists}
          </div>
          <div className="font-rajdhani text-xs text-gold-light/30">{m.kda} KDA</div>
        </div>

        {/* CS */}
        <div className="hidden sm:block text-right flex-shrink-0 w-16">
          <div className="font-rajdhani font-bold text-sm text-gold-light/70">{cs} CS</div>
          <div className="font-rajdhani text-xs text-gold-light/30">{csm}/min</div>
        </div>

        {/* Vision */}
        <div className="hidden md:block text-right flex-shrink-0 w-12">
          <div className="font-rajdhani text-sm text-gold-light/50">{m.visionScore}</div>
          <div className="font-rajdhani text-xs text-gold-light/25">visão</div>
        </div>

        {/* Items compact — trinket separated by gap */}
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {compactSlots.map((id, idx) => (
            <div key={idx} className={idx === 6 ? 'ml-1' : ''}>
              <ItemSlot id={id} ddItems={ddItems} size={28} />
            </div>
          ))}
        </div>

        {/* Duration + expand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right w-10">
            <div className="font-rajdhani text-xs text-gold-light/40">{fmtDuration(Number(m.gameDurationSecs))}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gold/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gold/10 pt-3 space-y-4">

          {/* Full item build */}
          <div>
            <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-2">
              Build Final {isAdc ? '(ADC — Elixir separado)' : ''}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coreItems.map((id, idx) => (
                <ItemSlot key={idx} id={id} ddItems={ddItems} size={36} />
              ))}
              <div className="w-px bg-gold/15 mx-1 self-stretch" />
              <div className="flex flex-col items-center gap-0.5">
                <ItemSlot id={trinketId} ddItems={ddItems} size={36} />
                <span className="font-rajdhani text-[9px] text-gold/30">trinket</span>
              </div>
              {isAdc && (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-9 h-9 rounded-sm bg-arcane-dark/60 border border-gold/10 border-dashed flex items-center justify-center">
                    <span className="font-rajdhani text-[9px] text-gold/20">Elix</span>
                  </div>
                  <span className="font-rajdhani text-[9px] text-gold/30">elixir</span>
                </div>
              )}
            </div>
          </div>

          {/* Combat stats */}
          <div>
            <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-2">Combate</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <ExpandStat label="Dano Causado" value={m.damageToChamps.toLocaleString('pt-BR')} />
              <ExpandStat label="Dano Recebido" value={m.damageTaken.toLocaleString('pt-BR')} />
              <ExpandStat label="Cura Total" value={m.totalHeal.toLocaleString('pt-BR')} />
              <ExpandStat label="Dano Obj." value={m.damageToObjectives.toLocaleString('pt-BR')} />
              {m.pentaKills > 0 && <ExpandStat label="Pentas" value={String(m.pentaKills)} highlight />}
              {m.killingSprees > 0 && <ExpandStat label="Sprees" value={String(m.killingSprees)} />}
              {m.turretKills > 0 && <ExpandStat label="Torres" value={String(m.turretKills)} />}
              {m.objectivesStolen > 0 && <ExpandStat label="Obj. Roubados" value={String(m.objectivesStolen)} highlight />}
              {m.firstBlood && <ExpandStat label="First Blood" value="Sim" highlight />}
            </div>
          </div>

          {/* Vision & Economy */}
          <div>
            <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-2">Visão & Economia</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <ExpandStat label="Visão" value={String(m.visionScore)} />
              <ExpandStat label="Wards Colocadas" value={String(m.wardsPlaced)} />
              <ExpandStat label="Wards Destruídas" value={String(m.wardsKilled)} />
              <ExpandStat label="Wards de Controle" value={String(m.controlWardsBought)} />
              <ExpandStat label="Ouro Ganho" value={m.goldEarned.toLocaleString('pt-BR')} />
              <ExpandStat label="Ouro Gasto" value={m.goldSpent.toLocaleString('pt-BR')} />
              <ExpandStat label="Tempo Morto" value={`${Math.floor(m.timeDeadSecs / 60)}m ${m.timeDeadSecs % 60}s`} />
              <ExpandStat label="CC (s)" value={String(m.crowdControlScore)} />
            </div>
          </div>

          {/* Spell casts */}
          <div>
            <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-2">Usos de Habilidades</div>
            <div className="grid grid-cols-4 gap-2">
              <ExpandStat label="Q" value={String(m.qCasts)} />
              <ExpandStat label="W" value={String(m.wCasts)} />
              <ExpandStat label="E" value={String(m.eCasts)} />
              <ExpandStat label="R" value={String(m.rCasts)} />
            </div>
          </div>

          {/* Item purchase timeline */}
          <div>
            <div className="font-rajdhani text-[10px] text-gold/40 uppercase tracking-widest mb-2">Ordem de Compras</div>
            {timelineLoading && (
              <div className="flex items-center gap-2 text-gold/40 font-rajdhani text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando timeline...
              </div>
            )}
            {!timelineLoading && timeline && timeline.length === 0 && (
              <div className="text-gold/30 font-rajdhani text-xs">Timeline não disponível.</div>
            )}
            {!timelineLoading && timeline && timeline.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {timeline.map((ev, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-0.5">
                    <ItemSlot id={ev.itemId} ddItems={ddItems} size={30} />
                    <span className="font-rajdhani text-[9px] text-gold/40">
                      {ev.minuteMark}:{String(ev.secondMark).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
