'use client';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Shield, Zap } from 'lucide-react';

const champions = [
  {
    name: 'Jinx',
    role: 'Marksman',
    tier: 'S+',
    winRate: '54.2%',
    pickRate: '12.8%',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Jinx_0.jpg',
    color: '#0BC4E3',
    tips: ['Explosive zone control in teamfights', 'Snowball aggressively after first item', 'Super Mega Death Rocket for cross-map finishes'],
  },
  {
    name: 'Yasuo',
    role: 'Fighter',
    tier: 'S',
    winRate: '51.7%',
    pickRate: '15.3%',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Yasuo_0.jpg',
    color: '#C89B3C',
    tips: ['Wind Wall positioning is key vs ranged', 'Farm safely until 2 items', 'Always Last Breath into knockup chains'],
  },
  {
    name: 'Thresh',
    role: 'Support',
    tier: 'A+',
    winRate: '50.1%',
    pickRate: '11.2%',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Thresh_0.jpg',
    color: '#C89B3C',
    tips: ['Collect souls during laning', 'Dark Passage lantern for team escapes', 'Flay into hook for reliable CC chain'],
  },
  {
    name: "Kai'Sa",
    role: 'Marksman',
    tier: 'S',
    winRate: '52.4%',
    pickRate: '13.6%',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kaisa_0.jpg',
    color: '#0BC4E3',
    tips: ['Evolve Q first for single target burst', 'W + R combo for safe engage', 'Stack passive in extended fights'],
  },
];

const tierColors: Record<string, string> = {
  'S+': '#FFD700',
  S: '#C89B3C',
  'A+': '#0BC4E3',
  A: '#6B7280',
};

export function ChampionsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [activeChamp, setActiveChamp] = useState(0);

  return (
    <section id="champions" className="relative py-32 bg-arcane-panel overflow-hidden">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(200,155,60,0.04),transparent)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Champions</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            MASTER YOUR{' '}
            <span className="text-gold">ROSTER</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-rajdhani text-lg text-gold-light/50 max-w-xl mx-auto"
          >
            Tailored coaching for every champion. Understand matchups, power spikes, and optimal build paths.
          </motion.p>
        </div>

        {/* Champion showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Champion cards carousel */}
          <div className="grid grid-cols-2 gap-3">
            {champions.map((champ, i) => (
              <motion.button
                key={champ.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.1 * i }}
                onClick={() => setActiveChamp(i)}
                className={`relative overflow-hidden rounded-sm border transition-all duration-300 text-left group cursor-pointer ${
                  activeChamp === i
                    ? 'border-gold/60 shadow-[0_0_20px_rgba(200,155,60,0.2)]'
                    : 'border-gold/15 hover:border-gold/30'
                }`}
              >
                {/* Background image */}
                <div className="relative h-48">
                  <img
                    src={champ.image}
                    alt={champ.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-arcane-dark via-arcane-dark/40 to-transparent" />

                  {/* Tier badge */}
                  <div
                    className="absolute top-2 right-2 w-8 h-8 rounded-sm flex items-center justify-center text-xs font-cinzel font-bold"
                    style={{
                      background: `${tierColors[champ.tier]}20`,
                      border: `1px solid ${tierColors[champ.tier]}60`,
                      color: tierColors[champ.tier],
                    }}
                  >
                    {champ.tier}
                  </div>
                </div>

                <div className="p-3 bg-arcane-dark/80">
                  <div className="font-cinzel font-bold text-gold-light text-sm">{champ.name}</div>
                  <div className="font-rajdhani text-xs text-gold-light/40 tracking-wider uppercase">{champ.role}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="font-rajdhani text-xs text-green-400">{champ.winRate}</span>
                  </div>
                </div>

                {/* Active indicator */}
                {activeChamp === i && (
                  <motion.div
                    layoutId="activeChamp"
                    className="absolute inset-0 border-2 border-gold/60 rounded-sm pointer-events-none"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right: Champion detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChamp}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Champion header */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-sm overflow-hidden border border-gold/30 flex-shrink-0">
                  <img
                    src={champions[activeChamp].image}
                    alt={champions[activeChamp].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-cinzel text-3xl font-bold text-gold-light">{champions[activeChamp].name}</h3>
                  <div className="font-rajdhani text-sm tracking-widest uppercase text-gold/60 mb-2">{champions[activeChamp].role}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="font-rajdhani text-sm text-green-400">WR: {champions[activeChamp].winRate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="font-rajdhani text-sm text-gold/70">Pick: {champions[activeChamp].pickRate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-gold" />
                  <span className="font-cinzel text-sm font-bold text-gold tracking-wider uppercase">Coaching Tips</span>
                </div>
                <div className="space-y-3">
                  {champions[activeChamp].tips.map((tip, i) => (
                    <motion.div
                      key={tip}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-sm bg-gold/5 border border-gold/15"
                    >
                      <Zap className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                      <span className="font-rajdhani text-sm text-gold-light/70">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Win rate bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-rajdhani text-xs tracking-wider uppercase text-gold/50">Win Rate Progress</span>
                  <span className="font-rajdhani text-xs text-gold">{champions[activeChamp].winRate}</span>
                </div>
                <div className="h-1.5 bg-gold/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: champions[activeChamp].winRate }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${champions[activeChamp].color}, ${champions[activeChamp].color}80)`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
