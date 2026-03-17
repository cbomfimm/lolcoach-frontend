'use client';
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { Button } from '@/components/ui/button';
import type { Application } from '@splinetool/runtime';

// Common names Spline uses for the robot head object
const HEAD_NAMES = ['Head', 'head', 'Robot Head', 'RobotHead', 'Robot_Head', 'Sphere'];

export function HeroSection() {
  const splineApp = useRef<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSplineLoad = useCallback((app: Application) => {
    splineApp.current = app;
    // Log all object names for debugging so we know the exact name in this scene
    const objects = app.getAllObjects();
    console.log('[Spline] Objects in scene:', objects.map((o) => o.name));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const app = splineApp.current;
    if (!app || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Normalize -1 to 1 relative to container center
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    // Try each candidate name until we find the head object
    let head = null;
    for (const name of HEAD_NAMES) {
      head = app.findObjectByName(name);
      if (head) break;
    }

    if (head) {
      // Smooth rotation: ±0.4 rad horizontal, ±0.25 rad vertical
      head.rotation.y = nx * 0.4;
      head.rotation.x = -ny * 0.25;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const app = splineApp.current;
    if (!app) return;

    let head = null;
    for (const name of HEAD_NAMES) {
      head = app.findObjectByName(name);
      if (head) break;
    }
    if (head) {
      // Smoothly return to neutral on mouse leave
      head.rotation.y = 0;
      head.rotation.x = 0;
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-arcane-dark">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Hex grid pattern */}
        <div className="absolute inset-0 bg-hex-pattern opacity-40" />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,155,60,0.08),transparent)]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-arcane-dark to-transparent" />
      </div>

      {/* Scan line animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-scan-line" />
      </div>

      {/* Spotlight */}
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

          {/* Divider line */}
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
            <Button size="lg" className="font-cinzel font-bold tracking-widest uppercase group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Acesso Antecipado <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="outline" size="lg" className="font-cinzel font-bold tracking-widest uppercase group">
              <TrendingUp className="w-4 h-4 mr-2 group-hover:text-gold transition-colors" />
              Ver Diferencial
            </Button>
          </motion.div>
        </div>

        {/* Right: Spline 3D */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[500px] lg:h-[650px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Glow behind 3D */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(200,155,60,0.12),transparent)] rounded-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(11,196,227,0.05),transparent)] rounded-xl" />

          {/* Frame decoration */}
          <div className="absolute -inset-px rounded-xl border border-gold/15 pointer-events-none" />

          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={handleSplineLoad}
          />

          {/* Floating info card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-6 bg-arcane-panel/90 backdrop-blur border border-gold/20 rounded-sm p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-sm bg-gold/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <div>
              <div className="text-xs font-rajdhani font-bold tracking-wider text-gold">COACH ATIVO</div>
              <div className="text-xs font-rajdhani text-gold-light/40">Dragon em 38s • sem ward</div>
            </div>
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
