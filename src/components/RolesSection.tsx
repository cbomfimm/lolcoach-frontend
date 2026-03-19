'use client';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Zap, Target, Eye } from 'lucide-react';

const roles = [
  {
    name: 'Top Lane',
    icon: Shield,
    color: '#C89B3C',
    bgColor: 'rgba(200,155,60,0.1)',
    borderColor: 'rgba(200,155,60,0.3)',
    metrics: ['Wave management', 'Timing do TP', 'Split-push', 'Gold diff'],
    description:
      'Análise de wave management, uso de teleport e pressão de split-push. Compara o gold diff gerado com o seu histórico de top.',
    hud: { cs: '7.2 CS/min', tp: 'TP salvo', split: 'Split ativo' },
  },
  {
    name: 'Jungle',
    icon: Sword,
    color: '#0BC4E3',
    bgColor: 'rgba(11,196,227,0.1)',
    borderColor: 'rgba(11,196,227,0.3)',
    metrics: ['Clear time', 'Gank timing', 'Objetivos', 'Jungle Risk Index'],
    description:
      'Tempo de clear, janelas de gank por rota e controle de objetivos. O Jungle Risk Index alerta rotas desprotegidas em tempo real.',
    hud: { cs: 'Clear: 3:42', tp: 'Dragon: 38s', split: 'Risco: alto Top' },
  },
  {
    name: 'Mid Lane',
    icon: Zap,
    color: '#C89B3C',
    bgColor: 'rgba(200,155,60,0.1)',
    borderColor: 'rgba(200,155,60,0.3)',
    metrics: ['Roam windows', 'CS/min', 'Priority', 'Controle de vision'],
    description:
      'Janelas de roam, taxa de CS e prioridade de rota. O coach avisa quando roamar vai gerar mais valor do que farmar.',
    hud: { cs: '8.9 CS/min', tp: 'Roam Bot', split: 'Priority: on' },
  },
  {
    name: 'ADC',
    icon: Target,
    color: '#0BC4E3',
    bgColor: 'rgba(11,196,227,0.1)',
    borderColor: 'rgba(11,196,227,0.3)',
    metrics: ['Power spike', 'Custo de morte', 'Teamfight pos.', 'Kiting'],
    description:
      'Power spikes por item, custo de morte em ouro e posicionamento em teamfights. Análise de kiting contra tanks e engajadores.',
    hud: { cs: 'Spike: 2 items', tp: 'Stay back', split: 'Kite: ativo' },
  },
  {
    name: 'Support',
    icon: Eye,
    color: '#C89B3C',
    bgColor: 'rgba(200,155,60,0.1)',
    borderColor: 'rgba(200,155,60,0.3)',
    metrics: ['Vision score', 'Ward obj.', 'Engage timing', 'Peel / engage'],
    description:
      'Score de visão, cobertura de objetivos e timing de engajamento. Analisa se você está peelando ou engajando no momento certo.',
    hud: { cs: 'Vision: 34', tp: 'Ward pit!', split: 'Engage: ready' },
  },
];

export function RolesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState(0);

  return (
    <section id="roles" className="relative py-32 bg-arcane-panel overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute inset-0 bg-hex-pattern opacity-15" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Cobertura Completa</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            Todas as{' '}
            <span className="text-gold">5 Roles.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-rajdhani text-lg text-gold-light/50 max-w-xl mx-auto"
          >
            Cada posição tem seu analisador especializado com métricas únicas.
          </motion.p>
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.08 * i }}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border font-rajdhani font-bold text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  active === i
                    ? 'border-gold/60 bg-gold/10 text-gold shadow-[0_0_12px_rgba(200,155,60,0.15)]'
                    : 'border-gold/15 text-gold-light/50 hover:border-gold/30 hover:text-gold/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                {role.name}
              </motion.button>
            );
          })}
        </div>

        {/* Role detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: description + metrics */}
            <div
              className="p-8 rounded-sm border"
              style={{ borderColor: roles[active].borderColor, background: roles[active].bgColor }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center"
                  style={{ background: roles[active].bgColor, border: `1px solid ${roles[active].borderColor}` }}
                >
                  {(() => { const Icon = roles[active].icon; return <Icon className="w-6 h-6" style={{ color: roles[active].color }} />; })()}
                </div>
                <h3 className="font-cinzel text-2xl font-bold" style={{ color: roles[active].color }}>
                  {roles[active].name}
                </h3>
              </div>

              <p className="font-rajdhani text-base text-gold-light/65 leading-relaxed mb-6">
                {roles[active].description}
              </p>

              <div>
                <div className="font-rajdhani text-xs tracking-widest uppercase text-gold/50 mb-3">Métricas rastreadas</div>
                <div className="flex flex-wrap gap-2">
                  {roles[active].metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-3 py-1 rounded-sm text-xs font-rajdhani font-semibold tracking-wider uppercase"
                      style={{
                        border: `1px solid ${roles[active].borderColor}`,
                        color: roles[active].color,
                        background: roles[active].bgColor,
                      }}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: HUD mockup */}
            <div className="flex items-center justify-center">
              <div className="relative w-72">
                {/* Fake HUD panel */}
                <div className="p-5 rounded-sm border border-gold/20 bg-arcane-dark/90 backdrop-blur">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-rajdhani text-xs tracking-widest uppercase text-green-400">Coach Ativo</span>
                  </div>

                  <div className="space-y-3">
                    {Object.values(roles[active].hud).map((val, i) => (
                      <motion.div
                        key={val}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-2.5 rounded-sm bg-gold/5 border border-gold/10"
                      >
                        <div className="w-1 h-4 rounded-full mr-3" style={{ background: roles[active].color }} />
                        <span className="font-rajdhani text-sm text-gold-light/80 flex-1">{val}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gold/10 font-rajdhani text-xs text-gold/40 tracking-wider">
                    LOLCoach · Servidor BR · Em partida
                  </div>
                </div>

                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-gold/40" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-gold/40" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-gold/40" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-gold/40" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
