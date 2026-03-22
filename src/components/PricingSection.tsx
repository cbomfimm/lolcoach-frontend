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
      'Acesso ao dashboard',
      'Suporte à 1 conta do servidor BR',
      'Alertas de objetivos básicos',
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
      'Briefing de partida na loading screen',
      'Alertas de Jungle, Visão e Objetivos',
      'Voz em tempo real (analisadores principais)',
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
      'Análise pós-game ilimitada com IA',
      'Sugestões de picks e counterpicks',
      'Métricas de performance histórica',
      'Monitoramento de múltiplas contas',
      'Acesso antecipado a novos recursos',
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
        className={`font-rajdhani text-sm tracking-widest uppercase transition-colors ${
          !yearly ? 'text-gold font-bold' : 'text-gold/40 hover:text-gold/60'
        }`}
      >
        Mensal
      </button>

      <button
        role="switch"
        aria-checked={yearly}
        onClick={onToggle}
        className="relative w-12 h-6 rounded-full bg-arcane-dark border border-gold/30 transition-colors focus:outline-none"
      >
        <motion.div
          layout
          layoutId="switch-thumb"
          className="absolute top-0.5 w-5 h-5 rounded-full bg-gold"
          animate={{ left: yearly ? '26px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>

      <button
        onClick={() => !yearly && onToggle()}
        className={`font-rajdhani text-sm tracking-widest uppercase transition-colors ${
          yearly ? 'text-gold font-bold' : 'text-gold/40 hover:text-gold/60'
        }`}
      >
        Anual
        <span className="ml-2 text-[10px] bg-gold/20 text-gold border border-gold/30 px-1.5 py-0.5 rounded-sm tracking-wider">
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles
          className="w-full h-full"
          density={120}
          size={0.8}
          speed={0.4}
          opacity={0.35}
          color="#C89B3C"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(200,155,60,0.04),transparent)]" />

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <TimelineContent timelineRef={sectionRef} animationNum={0}>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-gold/50" />
              <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Planos</span>
              <div className="h-px w-8 bg-gold/50" />
            </div>
          </TimelineContent>

          <TimelineContent timelineRef={sectionRef} animationNum={1}>
            <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4">
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
            <p className="font-rajdhani text-lg text-gold-light/50 max-w-xl mx-auto">
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
                className={`relative rounded-sm border p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-gold/60 bg-arcane-dark shadow-[0_0_40px_rgba(200,155,60,0.12)]'
                    : 'border-gold/20 bg-arcane-dark/50 hover:border-gold/35 transition-colors'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div
                      className={`px-4 py-1 rounded-sm text-xs font-rajdhani font-bold tracking-widest uppercase ${
                        plan.highlight
                          ? 'bg-gold text-arcane-dark'
                          : 'bg-arcane-blue/20 border border-arcane-blue/50 text-arcane-blue'
                      }`}
                    >
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan icon & name */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                      plan.highlight ? 'bg-gold/20' : 'bg-gold/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${plan.highlight ? 'text-gold' : 'text-gold/70'}`} />
                  </div>
                  <div>
                    <div className="font-cinzel font-bold text-gold-light">{plan.name}</div>
                    <div className="font-rajdhani text-xs text-gold/40 tracking-wider">{plan.description}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.comingSoon ? (
                    <div className="flex items-end gap-2">
                      <span className="font-cinzel text-4xl font-bold text-gold/40">Em Breve</span>
                    </div>
                  ) : plan.priceMonthly === 0 ? (
                    <div className="flex items-end gap-2">
                      <span className="font-cinzel text-4xl font-bold text-gold-light">Grátis</span>
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
                        <span className={`font-cinzel text-sm font-bold pb-2 ${plan.highlight ? 'text-gold' : 'text-gold-light/60'}`}>
                          R$
                        </span>
                        <span className={`font-cinzel text-4xl font-bold ${plan.highlight ? 'text-gold' : 'text-gold-light'}`}>
                          <NumberFlow
                            value={displayFloat}
                            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                          />
                        </span>
                        <span className="font-rajdhani text-sm text-gold/40 pb-1.5">
                          /{isYearlyPaid ? 'ano' : 'mês'}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  {isYearlyPaid && (
                    <p className="font-rajdhani text-xs text-gold/40 mt-1">
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
                          plan.highlight ? 'bg-gold/20' : 'bg-gold/10'
                        }`}
                      >
                        <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-gold' : 'text-gold/60'}`} />
                      </div>
                      <span className="font-rajdhani text-sm text-gold-light/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.variant}
                  size="lg"
                  disabled={plan.comingSoon || loadingPlan === plan.name}
                  className={`w-full font-cinzel font-bold tracking-widest uppercase ${
                    plan.comingSoon
                      ? 'opacity-40 cursor-not-allowed'
                      : plan.highlight
                      ? 'bg-gold hover:bg-gold-dark text-arcane-dark border-0'
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
