'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Crown, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Apprentice',
    icon: Swords,
    price: 'Free',
    period: 'forever',
    description: 'Start your journey on the Rift.',
    features: [
      '10 replay analyses/month',
      'Basic champion tips',
      'Win rate tracking',
      'Community access',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
    highlight: false,
    badge: null,
  },
  {
    name: 'Challenger',
    icon: Zap,
    price: '$14.99',
    period: 'per month',
    description: 'Everything you need to climb ranks fast.',
    features: [
      'Unlimited replay analyses',
      'AI-powered coaching sessions',
      'Champion mastery tracking',
      'Live game overlays',
      'Counterpick suggestions',
      'Priority support',
    ],
    cta: 'Start Climbing',
    variant: 'default' as const,
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Grand Master',
    icon: Crown,
    price: '$39.99',
    period: 'per month',
    description: 'For those who demand perfection.',
    features: [
      'Everything in Challenger',
      '1-on-1 pro coaching sessions',
      'Custom training regimens',
      'Team analytics (5 accounts)',
      'API access',
      'Early access features',
    ],
    cta: 'Go Pro',
    variant: 'arcane' as const,
    highlight: false,
    badge: 'Best Value',
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="pricing" className="relative py-32 bg-arcane-panel overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(200,155,60,0.03),transparent)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Pricing</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            CHOOSE YOUR{' '}
            <span className="text-gold">RANK</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-rajdhani text-lg text-gold-light/50 max-w-xl mx-auto"
          >
            Invest in your improvement. Every tier comes with our 30-day climb guarantee.
          </motion.p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className={`relative rounded-sm border p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-gold/60 bg-arcane-dark shadow-[0_0_40px_rgba(200,155,60,0.12)]'
                    : 'border-gold/20 bg-arcane-dark/50 hover:border-gold/35 transition-colors'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className={`px-4 py-1 rounded-sm text-xs font-rajdhani font-bold tracking-widest uppercase ${
                      plan.highlight
                        ? 'bg-gold text-arcane-dark'
                        : 'bg-arcane-blue/20 border border-arcane-blue/50 text-arcane-blue'
                    }`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan icon & name */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                    plan.highlight ? 'bg-gold/20' : 'bg-gold/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.highlight ? 'text-gold' : 'text-gold/70'}`} />
                  </div>
                  <div>
                    <div className="font-cinzel font-bold text-gold-light">{plan.name}</div>
                    <div className="font-rajdhani text-xs text-gold/40 tracking-wider">{plan.description}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className={`font-cinzel text-4xl font-bold ${plan.highlight ? 'text-gold' : 'text-gold-light'}`}>
                      {plan.price}
                    </span>
                    {plan.period !== 'forever' && (
                      <span className="font-rajdhani text-sm text-gold/40 pb-1">/{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlight ? 'bg-gold/20' : 'bg-gold/10'
                      }`}>
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
                  className="w-full font-cinzel font-bold tracking-widest uppercase"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
