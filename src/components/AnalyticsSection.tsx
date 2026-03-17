'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  {
    icon: BarChart3,
    label: 'Games Analyzed',
    value: 2400000,
    suffix: '+',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: TrendingUp,
    label: 'Avg LP Gained',
    value: 287,
    suffix: ' LP',
    color: 'text-arcane-blue',
    bgColor: 'bg-arcane-blue/10',
  },
  {
    icon: Award,
    label: 'Players Coached',
    value: 150000,
    suffix: '+',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: Clock,
    label: 'Hours Saved',
    value: 4800000,
    suffix: '+',
    color: 'text-arcane-blue',
    bgColor: 'bg-arcane-blue/10',
  },
];

const performanceData = [
  { label: 'Week 1', value: 35 },
  { label: 'Week 2', value: 42 },
  { label: 'Week 3', value: 48 },
  { label: 'Week 4', value: 55 },
  { label: 'Week 5', value: 61 },
  { label: 'Week 6', value: 70 },
  { label: 'Week 7', value: 78 },
  { label: 'Week 8', value: 89 },
];

function BarChartComponent() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...performanceData.map((d) => d.value));

  return (
    <div ref={ref} className="flex items-end gap-2 h-40">
      {performanceData.map((bar, i) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative flex items-end justify-center" style={{ height: '120px' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: `${(bar.value / max) * 100}%` } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-sm relative overflow-hidden"
              style={{
                background: i === performanceData.length - 1
                  ? 'linear-gradient(180deg, #C89B3C, #785A28)'
                  : 'linear-gradient(180deg, rgba(200,155,60,0.4), rgba(200,155,60,0.1))',
              }}
            >
              {i === performanceData.length - 1 && (
                <div className="absolute inset-0 animate-pulse opacity-50 bg-gradient-to-t from-gold/30 to-transparent" />
              )}
            </motion.div>
          </div>
          <span className="font-rajdhani text-[9px] text-gold/40 tracking-wider">{bar.label.replace('Week ', 'W')}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="analytics" className="relative py-32 bg-arcane-dark overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(11,196,227,0.04),transparent)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-gold/50" />
            <span className="font-rajdhani text-xs tracking-[0.3em] uppercase text-gold/60">Analytics</span>
            <div className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4"
          >
            DATA-DRIVEN{' '}
            <span className="text-gold">RESULTS</span>
          </motion.h2>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i }}
                className="relative p-6 rounded-sm border border-gold/15 bg-arcane-panel/50 text-center group hover:border-gold/30 transition-colors"
              >
                <div className={`w-12 h-12 ${stat.bgColor} rounded-sm flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`font-cinzel text-3xl font-bold ${stat.color} mb-1`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-rajdhani text-xs tracking-widest uppercase text-gold-light/40">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Chart + info */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chart panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-sm border border-gold/20 bg-arcane-panel/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-cinzel font-bold text-gold-light">Win Rate Progression</h3>
                <p className="font-rajdhani text-xs text-gold/40 tracking-wider">After starting LOLCoach</p>
              </div>
              <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-sm">
                <span className="font-rajdhani text-xs text-green-400 font-bold">+54% avg</span>
              </div>
            </div>
            <BarChartComponent />
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {[
              {
                label: 'CS/min improvement',
                before: '5.2',
                after: '8.1',
                pct: '55%',
                color: '#C89B3C',
              },
              {
                label: 'Vision score / game',
                before: '18',
                after: '34',
                pct: '88%',
                color: '#0BC4E3',
              },
              {
                label: 'Kill Participation',
                before: '52%',
                after: '71%',
                pct: '36%',
                color: '#C89B3C',
              },
              {
                label: 'Objective Control',
                before: '41%',
                after: '68%',
                pct: '65%',
                color: '#0BC4E3',
              },
            ].map((item, i) => (
              <div key={item.label} className="p-4 rounded-sm border border-gold/15 bg-arcane-panel/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-rajdhani text-sm font-semibold text-gold-light/70">{item.label}</span>
                  <span className="font-cinzel text-xs font-bold text-green-400">+{item.pct}</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-center">
                    <div className="font-rajdhani text-xs text-gold/40 uppercase tracking-wider mb-1">Before</div>
                    <div className="font-cinzel text-lg font-bold text-gold-light/40">{item.before}</div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold/20 via-gold/60 to-green-400/40" />
                  <div className="text-center">
                    <div className="font-rajdhani text-xs text-gold/40 uppercase tracking-wider mb-1">After</div>
                    <div className="font-cinzel text-lg font-bold" style={{ color: item.color }}>{item.after}</div>
                  </div>
                </div>
                <div className="h-1 bg-gold/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: item.pct } : {}}
                    transition={{ delay: 0.1 * i + 0.5, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}60)` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
