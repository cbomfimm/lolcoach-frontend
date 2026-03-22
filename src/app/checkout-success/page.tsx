'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Crown } from 'lucide-react';
import { route } from '@/lib/assets';
import { RiotLegalBar } from '@/components/RiotLegalBar';

export default function CheckoutSuccessPage() {
  return (
    <>
    <div className="min-h-screen bg-arcane-dark flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-hex-pattern opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(200,155,60,0.07),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 16 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-gold/10 border border-gold/30 mb-8 relative"
        >
          <Crown className="w-9 h-9 text-gold" />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-arcane-dark">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-cinzel text-3xl md:text-4xl font-bold text-gold-light mb-3"
        >
          Bem-vindo ao{' '}
          <span className="text-gold">Grand Master</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-rajdhani text-lg text-gold-light/60 mb-8 leading-relaxed"
        >
          Sua assinatura está ativa. Agora você tem acesso ao coaching completo —
          voz em tempo real, briefing na loading screen e análise pós-game com IA.
        </motion.p>

        {/* Features unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-arcane-panel border border-gold/20 rounded-sm p-5 mb-8 text-left space-y-2"
        >
          {[
            'Voz em tempo real ativa',
            'Briefing na loading screen',
            'Análise pós-game ilimitada',
            'Alertas de Jungle, Visão e Objetivos',
            'Cobertura para todas as 5 roles',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="font-rajdhani text-sm text-gold-light/70">{f}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          href={route('/dashboard')}
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-arcane-dark font-cinzel font-bold tracking-widest uppercase px-8 py-4 rounded-sm transition-colors text-sm"
        >
          Ir para o Dashboard <ChevronRight className="w-4 h-4" />
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-rajdhani text-xs text-gold/25 mt-6"
        >
          Você receberá um e-mail de confirmação da Stripe em breve.
        </motion.p>
      </motion.div>
    </div>
    <RiotLegalBar />
    </>
  );
}
