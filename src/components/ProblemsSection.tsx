'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, Shuffle, BarChart2, Mic, HelpCircle } from 'lucide-react';
import { GlowCard } from '@/components/ui/spotlight-card';

const problems = [
  {
    icon: Clock,
    title: 'Feedback sempre tarde demais',
    description:
      'Você recebe a análise depois da partida. O erro já aconteceu, o momento já passou, e o aprendizado não conecta.',
  },
  {
    icon: Shuffle,
    title: 'Coaching genérico sem contexto',
    description:
      'Dicas que ignoram seu histórico, seu campeão, seu matchup. Servem pra qualquer um — e por isso não servem pra você.',
  },
  {
    icon: BarChart2,
    title: 'Sem referência de evolução real',
    description:
      'Você não sabe se está melhorando. Não existe comparação entre a sua partida de hoje e a de três semanas atrás.',
  },
  {
    icon: Mic,
    title: 'Voz em tempo real virou commodity',
    description:
      'Todo mundo tem. Mas ter voz não é suficiente — o que importa é o que ela fala, quando fala, e por quê.',
  },
  {
    icon: HelpCircle,
    title: 'Ninguém explica o porquê',
    description:
      'Alertas que dizem "ward aqui" sem explicar o contexto. Você executa sem entender, e não aprende nada.',
  },
];

export function ProblemsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="problema" className="relative py-32 bg-arcane-panel overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute inset-0 bg-hex-pattern opacity-15" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">O Problema</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light max-w-2xl leading-tight"
          >
            Você joga, erra,{' '}
            <span className="text-gold">nunca evolui.</span>
          </motion.h2>
        </div>

        {/* Problems list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
              >
                <GlowCard glowColor="gold" className="group p-6 h-full">
                  {/* Number */}
                  <div className="absolute top-4 right-4 font-cinzel text-5xl font-bold text-gold/5 select-none pointer-events-none">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div className="w-10 h-10 rounded-sm bg-gold/8 border border-gold/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold/60" />
                  </div>

                  <h3 className="font-cinzel font-bold text-base text-gold-light mb-2">
                    {problem.title}
                  </h3>
                  <p className="font-rajdhani text-sm text-gold-light/50 leading-relaxed">
                    {problem.description}
                  </p>

                  {/* Hover bottom line */}
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </GlowCard>
              </motion.div>
            );
          })}

          {/* Final card — the solution teaser */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08 * 5, duration: 0.5 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <GlowCard glowColor="gold" className="group p-6 h-full flex flex-col justify-between solution-card">
              <div>
                <div className="font-rajdhani text-xs tracking-widest uppercase text-gold/60 mb-3">A solução</div>
                <h3 className="font-cinzel font-bold text-xl text-gold mb-3">
                  MindRift foi feito para isso.
                </h3>
                <p className="font-rajdhani text-sm text-gold-light/60 leading-relaxed">
                  Contexto real, em tempo real, com memória das suas próprias partidas.
                  Não é mais um coach genérico — é o seu coach.
                </p>
              </div>
              <a
                href="#diferencial"
                className="mt-6 inline-flex items-center gap-2 font-rajdhani text-sm font-bold tracking-wider uppercase text-gold hover:text-gold-glow transition-colors group cursor-pointer"
              >
                Ver o diferencial
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
