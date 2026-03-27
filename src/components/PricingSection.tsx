'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Crown, Swords } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { Button } from '@/components/ui/button';
import { Sparkles } from '@/components/ui/sparkles';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import { TimelineContent } from '@/components/ui/timeline-animation';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession } from '@/lib/api';

const plans = [
  {
    name: 'Rookie',
    icon: Swords,
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: null,
    priceIdYearly:  null,
    comingSoon: false,
    description: 'Comece sua jornada no Rift.',
    features: [
      'Acesso ao dashboard e histórico de partidas',
      'Suporte à 1 conta do servidor BR',
      'Alertas básicos de mapa e objetivos',
    ],
    cta: 'Começar Grátis',
    variant: 'outline' as const,
    highlight: false,
    badge: null,
  },
  {
    name: 'Grand Master',
    icon: Zap,
    priceMonthly: 1490,
    priceYearly: 11900,
    priceIdMonthly: 'price_1TCZRP2MkVxM8WmWv0qoO4ja',
    priceIdYearly:  'price_1TCZSU2MkVxM8WmWj2RvazH6',
    comingSoon: false,
    description: 'O essencial para evoluir no Rift.',
    features: [
      'Briefing de composição com IA na loading screen',
      'Coaching em tempo real — Jungle, Visão e Objetivos com IA',
      'Análise de desempenho por IA com voz durante a partida',
      'Cobertura para todas as 5 roles',
      'Suporte prioritário',
    ],
    cta: 'Subir de Elo',
    variant: 'default' as const,
    highlight: true,
    badge: 'Mais Popular',
  },
  {
    name: 'Challenger',
    icon: Crown,
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: null,
    priceIdYearly:  null,
    comingSoon: true,
    description: 'A experiência completa de coaching com IA.',
    features: [
      'Tudo do plano Grand Master',
      'Relatório pós-game ilimitado gerado por IA',
      'Sugestões de picks e counterpicks com IA',
      'Métricas de evolução histórica de desempenho',
      'Monitoramento de múltiplas contas',
      'Acesso antecipado a novos recursos de IA',
    ],
    cta: 'Em Breve',
    variant: 'arcane' as const,
    highlight: false,
    badge: 'Em Breve',
  },
];

function PricingSwitch({ yearly, onToggle }: { yearly: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-4 mt-6">
      <button
        onClick={() => yearly && onToggle()}
        className={`text-sm font-medium tracking-widest uppercase transition-colors ${
          !yearly ? 'text-[#d4a843] font-bold' : 'text-white/30 hover:text-white/50'
        }`}
      >
        Mensal
      </button>

      <button
        role="switch"
        aria-checked={yearly}
        onClick={onToggle}
        className="relative w-12 h-6 rounded-full bg-[#0a0a1a] border border-[#2a2845] transition-colors focus:outline-none"
      >
        <motion.div
          layout
          layoutId="switch-thumb"
          className="absolute top-0.5 w-5 h-5 rounded-full bg-[#d4a843]"
          animate={{ left: yearly ? '26px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>

      <button
        onClick={() => !yearly && onToggle()}
        className={`text-sm font-medium tracking-widest uppercase transition-colors ${
          yearly ? 'text-[#d4a843] font-bold' : 'text-white/30 hover:text-white/50'
        }`}
      >
        Anual
        <span className="ml-2 text-[10px] bg-[#d4a843]/15 text-[#d4a843] border border-[#d4a843]/30 px-1.5 py-0.5 rounded-lg tracking-wider">
          −33%
        </span>
      </button>
    </div>
  );
}

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCta = async (plan: typeof plans[number]) => {
    if (plan.comingSoon) return;

    if (plan.priceMonthly === 0) {
      router.push(user ? '/dashboard' : '/login');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const priceId = yearly ? plan.priceIdYearly : plan.priceIdMonthly;
    if (!priceId) return;

    setLoadingPlan(plan.name);
    try {
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (cents: number) => cents / 100;

  return (
    <section id="pricing" className="relative py-32 bg-arcane-panel overflow-hidden">
      {/* Edge lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2845] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2845] to-transparent" />

      {/* Sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles
          className="w-full h-full"
          density={120}
          size={0.8}
          speed={0.4}
          opacity={0.35}
          color="#7c6dd8"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(124,109,216,0.04),transparent)]" />

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <TimelineContent timelineRef={sectionRef} animationNum={0}>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-[#7c6dd8]/50" />
              <span className="text-xs tracking-[0.3em] uppercase text-[#7c6dd8]/60">Planos</span>
              <div className="h-px w-8 bg-[#7c6dd8]/50" />
            </div>
          </TimelineContent>

          <TimelineContent timelineRef={sectionRef} animationNum={1}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.15}
                staggerFrom="first"
                containerClassName="justify-center"
              >
                ESCOLHA SEU RANK
              </VerticalCutReveal>
            </h2>
          </TimelineContent>

          <TimelineContent timelineRef={sectionRef} animationNum={2}>
            <p className="text-lg text-white/45 max-w-xl mx-auto">
              Invista na sua evolução. Cancele quando quiser — sem fidelidade.
            </p>
          </TimelineContent>

          <TimelineContent timelineRef={sectionRef} animationNum={3} className="flex justify-center">
            <PricingSwitch yearly={yearly} onToggle={() => setYearly((v) => !v)} />
          </TimelineContent>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isYearlyPaid = yearly && plan.priceMonthly > 0 && !plan.comingSoon;
            const displayCents = isYearlyPaid ? plan.priceYearly : plan.priceMonthly;
            const displayFloat = formatPrice(displayCents);

            return (
              <TimelineContent
                key={plan.name}
                timelineRef={sectionRef}
                animationNum={4 + i}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-[#d4a843]/50 bg-[#1a1830] shadow-[0_0_40px_rgba(212,168,67,0.10)]'
                    : 'border-[#2a2845] bg-[#1a1830]/50 hover:border-[#2a2845]/80 transition-colors'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div
                      className={`px-4 py-1 rounded-lg text-xs font-bold tracking-widest uppercase ${
                        plan.highlight
                          ? 'bg-[#d4a843] text-[#0a0a1a]'
                          : 'bg-[#7c6dd8]/20 border border-[#7c6dd8]/50 text-[#7c6dd8]'
                      }`}
                    >
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan icon & name */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      plan.highlight ? 'bg-[#d4a843]/20' : 'bg-[#7c6dd8]/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${plan.highlight ? 'text-[#d4a843]' : 'text-[#7c6dd8]'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-white tracking-tight">{plan.name}</div>
                    <div className="text-xs text-white/35 tracking-wider">{plan.description}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.comingSoon ? (
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white/30">Em Breve</span>
                    </div>
                  ) : plan.priceMonthly === 0 ? (
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white">Grátis</span>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={yearly ? 'yearly' : 'monthly'}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-end gap-1"
                      >
                        <span className={`text-sm font-bold pb-2 ${plan.highlight ? 'text-[#d4a843]' : 'text-white/50'}`}>
                          R$
                        </span>
                        <span className={`text-4xl font-bold ${plan.highlight ? 'text-[#d4a843]' : 'text-white'}`}>
                          <NumberFlow
                            value={displayFloat}
                            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                          />
                        </span>
                        <span className="text-sm text-white/35 pb-1.5">
                          /{isYearlyPaid ? 'ano' : 'mês'}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  {isYearlyPaid && (
                    <p className="text-xs text-white/35 mt-1">
                      equivale a R${(displayFloat / 12).toFixed(2)}/mês
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.highlight ? 'bg-[#d4a843]/20' : 'bg-[#7c6dd8]/10'
                        }`}
                      >
                        <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-[#d4a843]' : 'text-[#7c6dd8]'}`} />
                      </div>
                      <span className="text-sm text-white/55">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.variant}
                  size="lg"
                  disabled={plan.comingSoon || loadingPlan === plan.name}
                  className={`w-full font-bold tracking-widest uppercase ${
                    plan.comingSoon
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => handleCta(plan)}
                >
                  {loadingPlan === plan.name ? 'Aguarde...' : plan.cta}
                </Button>
              </TimelineContent>
            );
          })}
        </div>

      </div>
    </section>
  );
}
