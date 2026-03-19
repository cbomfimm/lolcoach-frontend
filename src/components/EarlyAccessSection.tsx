'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EarlyAccessSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section id="acesso" className="relative py-32 bg-arcane-panel overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-0 bg-hex-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(200,155,60,0.06),transparent)]" />

      {/* Decorative corner lines */}
      <div className="absolute top-12 left-12 w-20 h-20 border-l-2 border-t-2 border-gold/25 pointer-events-none" />
      <div className="absolute top-12 right-12 w-20 h-20 border-r-2 border-t-2 border-gold/25 pointer-events-none" />
      <div className="absolute bottom-12 left-12 w-20 h-20 border-l-2 border-b-2 border-gold/25 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-20 h-20 border-r-2 border-b-2 border-gold/25 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 mb-6"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-gold/10 border border-gold/30">
            <Zap className="w-3 h-3 text-gold fill-gold" />
            <span className="text-xs font-rajdhani font-semibold tracking-widest uppercase text-gold">
              Acesso Antecipado · Servidor BR
            </span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-cinzel text-4xl md:text-5xl font-bold text-gold-light mb-4 leading-tight"
        >
          Pronto para um coach que{' '}
          <span className="text-gold">aprende com você?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="font-rajdhani text-lg text-gold-light/55 mb-10 max-w-xl mx-auto"
        >
          Estamos formando o grupo de acesso antecipado. Seja um dos primeiros a ter
          o coaching mais contextualizado do mercado brasileiro de LoL.
        </motion.p>

        {/* Email form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <label htmlFor="early-access-email" className="sr-only">
                Seu e-mail
              </label>
              <input
                id="early-access-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="flex-1 h-12 px-4 rounded-sm bg-arcane-dark border border-gold/30 text-gold-light font-rajdhani text-base placeholder:text-gold-light/30 focus:outline-none focus:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold transition-colors"
              />
              <Button type="submit" size="lg" className="font-cinzel font-bold tracking-widest uppercase whitespace-nowrap group cursor-pointer">
                Quero Acesso
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4"
            >
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="font-cinzel font-bold text-gold-light text-lg">
                Você está na lista! Avisaremos quando o beta abrir.
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="font-rajdhani text-sm text-gold/40 tracking-wider"
        >
          Sem spam. Notificação apenas quando o beta abrir.
        </motion.p>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 grid sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Acesso prioritário ao beta', sub: 'Antes do público geral' },
            { label: 'Desconto exclusivo', sub: 'Para quem entrar agora' },
            { label: 'Voz no produto', sub: 'Feedback direto com o time' },
          ].map((perk) => (
            <div
              key={perk.label}
              className="p-4 rounded-sm border border-gold/15 bg-arcane-dark/50 text-left"
            >
              <div className="font-cinzel font-bold text-sm text-gold mb-1">{perk.label}</div>
              <div className="font-rajdhani text-xs text-gold-light/40">{perk.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
