'use client';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Zap, Target, Eye } from 'lucide-react';

const roles = [
  {
    name: 'Top Lane',
    icon: Shield,
    color: '#d4a843',
    bgColor: 'rgba(212,168,67,0.08)',
    borderColor: 'rgba(212,168,67,0.25)',
    metrics: ['Wave management', 'Timing do TP', 'Split-push', 'Gold diff'],
    description:
      'Análise de wave management, uso de teleport e pressão de split-push. Compara o gold diff gerado com o seu histórico de top.',
    hud: { cs: '7.2 CS/min', tp: 'TP salvo', split: 'Split ativo' },
  },
  {
    name: 'Jungle',
    icon: Sword,
    color: '#7c6dd8',
    bgColor: 'rgba(124,109,216,0.08)',
    borderColor: 'rgba(124,109,216,0.25)',
    metrics: ['Clear time', 'Gank timing', 'Objetivos', 'Jungle Risk Index'],
    description:
      'Tempo de clear, janelas de gank por rota e controle de objetivos. O Jungle Risk Index alerta rotas desprotegidas em tempo real.',
    hud: { cs: 'Clear: 3:42', tp: 'Dragon: 38s', split: 'Risco: alto Top' },
  },
  {
    name: 'Mid Lane',
    icon: Zap,
    color: '#d4a843',
    bgColor: 'rgba(212,168,67,0.08)',
    borderColor: 'rgba(212,168,67,0.25)',
    metrics: ['Roam windows', 'CS/min', 'Priority', 'Controle de vision'],
    description:
      'Janelas de roam, taxa de CS e prioridade de rota. O coach avisa quando roamar vai gerar mais valor do que farmar.',
    hud: { cs: '8.9 CS/min', tp: 'Roam Bot', split: 'Priority: on' },
  },
  {
    name: 'ADC',
    icon: Target,
    color: '#7c6dd8',
    bgColor: 'rgba(124,109,216,0.08)',
    borderColor: 'rgba(124,109,216,0.25)',
    metrics: ['Power spike', 'Custo de morte', 'Teamfight pos.', 'Kiting'],
    description:
      'Power spikes por item, custo de morte em ouro e posicionamento em teamfights. Análise de kiting contra tanks e engajadores.',
    hud: { cs: 'Spike: 2 items', tp: 'Stay back', split: 'Kite: ativo' },
  },
  {
    name: 'Support',
    icon: Eye,
    color: '#d4a843',
    bgColor: 'rgba(212,168,67,0.08)',
    borderColor: 'rgba(212,168,67,0.25)',
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2845] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2845] to-transparent" />
      <div className="absolute inset-0 bg-hex-pattern opacity-15" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-[#7c6dd8]/50" />
            <span className="text-xs tracking-[0.3em] uppercase text-[#7c6dd8]/60">Cobertura Completa</span>
            <div className="h-px w-8 bg-[#7c6dd8]/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Todas as{' '}
            <span className="text-[#d4a843]">5 Roles.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/45 max-w-xl mx-auto"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  active === i
                    ? 'border-[#d4a843]/60 bg-[#d4a843]/10 text-[#d4a843] shadow-[0_0_12px_rgba(212,168,67,0.15)]'
                    : 'border-[#2a2845] text-white/40 hover:border-[#7c6dd8]/30 hover:text-white/70'
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
              className="p-8 rounded-xl border"
              style={{ borderColor: roles[active].borderColor, background: roles[active].bgColor }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: roles[active].bgColor, border: `1px solid ${roles[active].borderColor}` }}
                >
                  {(() => { const Icon = roles[active].icon; return <Icon className="w-6 h-6" style={{ color: roles[active].color }} />; })()}
                </div>
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: roles[active].color }}>
                  {roles[active].name}
                </h3>
              </div>

              <p className="text-base text-white/60 leading-relaxed mb-6">
                {roles[active].description}
              </p>

              <div>
                <div className="text-xs tracking-widest uppercase text-white/35 mb-3">Métricas rastreadas</div>
                <div className="flex flex-wrap gap-2">
                  {roles[active].metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-3 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase"
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
                <div className="p-5 rounded-xl border border-[#2a2845] bg-[#1a1830]/90 backdrop-blur">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-xs tracking-widest uppercase text-[#22c55e]">Coach Ativo</span>
                  </div>

                  <div className="space-y-3">
                    {Object.values(roles[active].hud).map((val, i) => (
                      <motion.div
                        key={val}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-[#2a2845]"
                      >
                        <div className="w-1 h-4 rounded-full mr-3" style={{ background: roles[active].color }} />
                        <span className="text-sm text-white/75 flex-1">{val}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2a2845] text-xs text-white/30 tracking-wider">
                    MindRift Coach · Servidor BR · Em partida
                  </div>
                </div>

                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-[#d4a843]/40" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-[#d4a843]/40" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-[#d4a843]/40" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-[#d4a843]/40" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
