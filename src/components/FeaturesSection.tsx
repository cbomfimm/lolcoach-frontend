'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Map, Shield, BarChart3, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Voz em Tempo Real',
    description:
      'Coach com voz durante a partida — avisa sobre dragon, gank risk, TP timing e posicionamento com linguagem natural e explicativa.',
    color: 'text-[#d4a843]',
    glow: 'rgba(212,168,67,0.12)',
    border: 'rgba(212,168,67,0.25)',
  },
  {
    icon: Map,
    title: 'Histórico Pessoal',
    description:
      'Compara você com você mesmo. CS/min, vision score, gold diff — tudo comparado com suas próprias partidas anteriores.',
    color: 'text-[#7c6dd8]',
    glow: 'rgba(124,109,216,0.12)',
    border: 'rgba(124,109,216,0.25)',
  },
  {
    icon: BarChart3,
    title: 'Briefing na Loading',
    description:
      'Em 2–4 segundos na loading screen: matchup, estratégia de lane, power spikes e alertas baseados no seu histórico.',
    color: 'text-[#d4a843]',
    glow: 'rgba(212,168,67,0.12)',
    border: 'rgba(212,168,67,0.25)',
  },
  {
    icon: Target,
    title: 'Matchup Engine',
    description:
      'Contra-pick contextualizado ao seu histórico real com aquele campeão — não só matchup genérico da internet.',
    color: 'text-[#7c6dd8]',
    glow: 'rgba(124,109,216,0.12)',
    border: 'rgba(124,109,216,0.25)',
  },
  {
    icon: Shield,
    title: 'Jungle Risk Index',
    description:
      'Avaliação dinâmica em tempo real do risco de gank por rota, baseada em posição do jungle e tempo de respawn.',
    color: 'text-[#d4a843]',
    glow: 'rgba(212,168,67,0.12)',
    border: 'rgba(212,168,67,0.25)',
  },
  {
    icon: Zap,
    title: 'App Desktop Leve',
    description:
      'Roda em segundo plano sem pesar. Detecta a partida automaticamente e se integra ao cliente do LoL sem friction.',
    color: 'text-[#7c6dd8]',
    glow: 'rgba(124,109,216,0.12)',
    border: 'rgba(124,109,216,0.25)',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative p-6 rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${feature.glow} 0%, transparent 60%)`,
        border: `1px solid ${feature.border}`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${feature.glow}, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        className="relative z-10 w-12 h-12 rounded-lg mb-5 flex items-center justify-center"
        style={{ background: `${feature.glow}` }}
      >
        <Icon className={`w-6 h-6 ${feature.color}`} />
      </div>

      {/* Content */}
      <h3 className={`relative z-10 font-bold text-lg mb-3 tracking-tight ${feature.color}`}>
        {feature.title}
      </h3>
      <p className="relative z-10 text-white/50 leading-relaxed text-[15px]">
        {feature.description}
      </p>

      {/* Bottom line decoration */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${feature.border}, transparent)`,
        }}
      />
    </motion.div>
  );
}

export function FeaturesSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="funcionalidades" className="relative py-32 bg-arcane-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hex-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(124,109,216,0.04),transparent)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-[#7c6dd8]/50" />
            <span className="text-xs tracking-[0.3em] uppercase text-[#7c6dd8]/60">
              Funcionalidades
            </span>
            <div className="h-px w-8 bg-[#7c6dd8]/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            TUDO QUE VOCÊ PRECISA PARA{' '}
            <span className="text-[#d4a843]">SUBIR DE ELO</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/45 max-w-xl mx-auto"
          >
            Seis funcionalidades integradas para identificar erros, corrigir mecânicas
            e dominar o Rift com contexto real.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
