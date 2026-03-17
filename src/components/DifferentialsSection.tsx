'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, MonitorPlay, Cpu, Map, MessageSquare, Layers, Users } from 'lucide-react';
import DisplayCards from '@/components/ui/display-cards';

const differentials = [
  {
    icon: BookOpen,
    label: 'Exclusivo',
    title: 'Histórico pessoal comparativo',
    description: 'Compara você com você mesmo. Evolução real, partida a partida.',
    exclusive: true,
    color: 'text-gold',
  },
  {
    icon: MonitorPlay,
    label: 'Exclusivo',
    title: 'Briefing na loading screen',
    description: 'Antes de entrar na partida você já sabe o que observar, onde e por quê.',
    exclusive: true,
    color: 'text-gold',
  },
  {
    icon: Cpu,
    label: 'Exclusivo',
    title: 'Matchup Engine contextualizado',
    description: 'Não é só contra-pick — é estratégia de lane adaptada ao seu histórico com aquele campeão.',
    exclusive: true,
    color: 'text-gold',
  },
  {
    icon: Map,
    label: 'Recurso',
    title: 'Jungle Risk Index dinâmico',
    description: 'Avaliação em tempo real do risco de gank por rota, baseado em posição e tempo.',
    exclusive: false,
    color: 'text-arcane-blue',
  },
  {
    icon: MessageSquare,
    label: 'Recurso',
    title: 'Linguagem natural explicativa',
    description: 'O coach explica o porquê de cada decisão, não apenas dá o comando.',
    exclusive: false,
    color: 'text-arcane-blue',
  },
  {
    icon: Layers,
    label: 'Recurso',
    title: '5 analisadores especializados',
    description: 'Cada role tem seu analisador próprio com métricas específicas de posição.',
    exclusive: false,
    color: 'text-arcane-blue',
  },
  {
    icon: Users,
    label: 'Recurso',
    title: 'Cobertura completa de roles',
    description: 'Top, Jungle, Mid, ADC, Support — todas as 5 posições com análise dedicada.',
    exclusive: false,
    color: 'text-arcane-blue',
  },
];

// The 3 EXCLUSIVE features displayed as stacked DisplayCards
const exclusiveCards = [
  {
    icon: <BookOpen className="size-4 text-gold" />,
    title: 'Histórico Pessoal',
    description: 'Você vs. você mesmo, partida a partida',
    date: 'Exclusivo LOLCoach',
    iconClassName: 'text-gold',
    titleClassName: 'text-gold',
    className:
      '[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-sm before:outline-gold/10 before:h-[100%] before:content-[\'\'] before:bg-blend-overlay before:bg-arcane-dark/70 grayscale-[60%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
  },
  {
    icon: <MonitorPlay className="size-4 text-gold" />,
    title: 'Briefing na Loading',
    description: 'Estratégia pronta antes de começar',
    date: 'Exclusivo LOLCoach',
    iconClassName: 'text-gold',
    titleClassName: 'text-gold',
    className:
      '[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-sm before:outline-gold/10 before:h-[100%] before:content-[\'\'] before:bg-blend-overlay before:bg-arcane-dark/70 grayscale-[60%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
  },
  {
    icon: <Cpu className="size-4 text-gold" />,
    title: 'Matchup Engine',
    description: 'Contextualizado ao seu histórico real',
    date: 'Exclusivo LOLCoach',
    iconClassName: 'text-gold',
    titleClassName: 'text-gold',
    className: '[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10',
  },
];

export function DifferentialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="diferencial" className="relative py-32 bg-arcane-dark overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_50%,rgba(200,155,60,0.05),transparent)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Diferencial</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            Eles têm voz.{' '}
            <span className="text-gold">Nós temos memória.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-rajdhani text-lg text-gold-light/50 max-w-xl mx-auto"
          >
            Três funcionalidades que nenhuma outra ferramenta do mercado brasileiro tem.
          </motion.p>
        </div>

        {/* DisplayCards + description side by side */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left: DisplayCards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex justify-center lg:justify-start pl-0 lg:pl-8"
          >
            <DisplayCards cards={exclusiveCards} />
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="space-y-6"
          >
            {differentials.filter((d) => d.exclusive).map((diff, i) => {
              const Icon = diff.icon;
              return (
                <div key={diff.title} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:border-gold/40 transition-colors">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-cinzel font-bold text-base text-gold-light">{diff.title}</h3>
                      <span className="text-[10px] font-rajdhani font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-gold/15 border border-gold/30 text-gold">
                        Exclusivo
                      </span>
                    </div>
                    <p className="font-rajdhani text-sm text-gold-light/55 leading-relaxed">{diff.description}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Other differentials grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gold/10" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/40">Também incluído</span>
            <div className="h-px flex-1 bg-gold/10" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {differentials.filter((d) => !d.exclusive).map((diff, i) => {
              const Icon = diff.icon;
              return (
                <motion.div
                  key={diff.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.55 + i * 0.07 }}
                  className="p-4 rounded-sm border border-arcane-blue/15 bg-arcane-blue/5 hover:border-arcane-blue/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-sm bg-arcane-blue/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-arcane-blue" />
                  </div>
                  <h4 className="font-cinzel font-bold text-sm text-arcane-blue mb-1">{diff.title}</h4>
                  <p className="font-rajdhani text-xs text-gold-light/45 leading-relaxed">{diff.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
