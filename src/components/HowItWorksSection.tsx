'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download, MonitorPlay, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Instala e esquece',
    description:
      'App desktop leve que roda em segundo plano. Detecta a partida automaticamente — sem configuração manual, sem abrir nada.',
    detail: 'Compatível com Windows · Baixo consumo de RAM',
    color: '#C89B3C',
  },
  {
    number: '02',
    icon: MonitorPlay,
    title: 'Briefing antes de começar',
    description:
      'Na loading screen você recebe um briefing completo: matchup, estratégia de lane, power spikes e alertas baseados no seu histórico.',
    detail: 'Em 2–4 segundos · Atualizado partida a partida',
    color: '#0BC4E3',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Coach durante e depois',
    description:
      'Durante a partida, voz em tempo real com contexto real. Depois, relatório comparativo mostrando sua evolução versus partidas anteriores.',
    detail: 'Voz explicativa · Histórico pessoal comparativo',
    color: '#C89B3C',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="como-funciona" className="relative py-32 bg-arcane-dark overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(200,155,60,0.04),transparent)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Como Funciona</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            Abre, joga,{' '}
            <span className="text-gold">evolui.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[16.666%] right-[16.666%] h-px bg-gradient-to-r from-gold/30 via-arcane-blue/30 to-gold/30" />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 * i, duration: 0.6 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Step circle */}
                  <div
                    className="relative w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6 z-10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(200,155,60,0.25)]"
                    style={{
                      borderColor: step.color,
                      background: `${step.color}15`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                    {/* Step number badge */}
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-cinzel font-bold"
                      style={{ background: step.color, color: '#010A13' }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="font-cinzel font-bold text-xl text-gold-light mb-3">{step.title}</h3>
                  <p className="font-rajdhani text-base text-gold-light/55 leading-relaxed mb-4 max-w-xs">
                    {step.description}
                  </p>

                  <div
                    className="px-3 py-1.5 rounded-sm text-xs font-rajdhani tracking-wider"
                    style={{
                      border: `1px solid ${step.color}30`,
                      color: step.color,
                      background: `${step.color}08`,
                    }}
                  >
                    {step.detail}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
