'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-arcane-dark">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-hex-pattern opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,155,60,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-arcane-dark to-transparent" />
      </div>

      {/* Scan line animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-scan-line" />
      </div>

      <Spotlight className="-top-40 left-0 md:left-1/4 md:-top-20" fill="#C89B3C" />

      {/* Corner decorations */}
      <div className="absolute top-20 left-6 w-16 h-16 border-l-2 border-t-2 border-gold/30 pointer-events-none" />
      <div className="absolute top-20 right-6 w-16 h-16 border-r-2 border-t-2 border-gold/30 pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-16 h-16 border-l-2 border-b-2 border-gold/30 pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-16 h-16 border-r-2 border-b-2 border-gold/30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10 grid lg:grid-cols-2 gap-12 items-center min-h-screen">
        {/* Left: Text content */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 w-fit"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-gold/10 border border-gold/30">
              <Zap className="w-3 h-3 text-gold fill-gold" />
              <span className="text-xs font-rajdhani font-semibold tracking-widest uppercase text-gold">
                Coach com IA · Servidor BR
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="font-cinzel font-bold leading-[1.1] mb-6"
          >
            <span className="block text-4xl md:text-5xl lg:text-6xl text-gold-light">
              COACHING
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl text-gold-light/50">
              EM TEMPO
            </span>
            <span
              className="block text-4xl md:text-5xl lg:text-6xl"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #C89B3C 0%, #F0E6D3 40%, #C8AA6E 70%, #785A28 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer-gold 4s linear infinite',
              }}
            >
              REAL PARA LOL
            </span>
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="h-px w-24 bg-gradient-to-r from-gold to-transparent mb-6 origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-base md:text-lg text-gold-light/60 font-rajdhani leading-relaxed mb-8 max-w-md"
          >
            Voz em tempo real. Briefing na loading screen. O único coach que compara
            você com você mesmo — partida a partida, no servidor BR.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="flex gap-8 mb-10"
          >
            {[
              { value: '2–4s', label: 'Briefing completo' },
              { value: '5', label: 'Analisadores IA' },
              { value: '5 Roles', label: 'Cobertura total' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-cinzel text-2xl font-bold text-gold">{stat.value}</span>
                <span className="font-rajdhani text-xs tracking-widest uppercase text-gold-light/40">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="#acesso">
              <Button
                size="lg"
                className="w-full sm:w-auto font-cinzel font-bold tracking-widest uppercase group relative overflow-hidden cursor-pointer bg-gold hover:bg-gold-dark text-arcane-dark border-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Quero Acesso Antecipado
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </a>
            <a href="#diferencial">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-cinzel font-bold tracking-widest uppercase group cursor-pointer border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Diferencial
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Right: Coach Robot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[460px] lg:h-[580px] flex items-center justify-center"
        >
          {/* Glow behind image */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(200,155,60,0.10),transparent)]" />

          <div className="relative w-full h-full">
            <Image
              src="/coach-robot.png"
              alt="MindRift Coach — robô coach apontando para o mapa do Summoner's Rift"
              fill
              className="object-contain drop-shadow-[0_0_32px_rgba(200,155,60,0.18)]"
              priority
            />
          </div>

          {/* Floating coach card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-4 right-4 bg-arcane-panel/90 backdrop-blur border border-gold/20 rounded-sm p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-sm bg-gold/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <div>
              <div className="text-xs font-rajdhani font-bold tracking-wider text-gold">COACH ATIVO</div>
              <div className="text-xs font-rajdhani text-gold-light/40">Dragon em 38s · sem ward</div>
            </div>
          </motion.div>

          {/* Ping indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="absolute top-4 right-4 bg-arcane-panel/90 backdrop-blur border border-gold/20 rounded-sm px-3 py-1.5 flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-rajdhani text-[11px] text-gold/60 tracking-wider">BR · 28ms</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-rajdhani tracking-widest uppercase text-gold/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
