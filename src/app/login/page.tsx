'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Eye, EyeOff, ChevronRight, Swords, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { asset, route } from '@/lib/assets';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router  = useRouter();
  const { user, signIn, signUp, loading } = useAuth();

  const [mode, setMode]           = useState<Mode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    setSubmitting(false);

    if (err) {
      setError(translateError(err));
      return;
    }

    if (mode === 'signup') {
      setSuccess(true);
    }
    // login redirect is handled by the useEffect above
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-arcane-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(200,155,60,0.06),transparent)]" />
      <div className="absolute inset-0 bg-hex-pattern opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glow border */}
        <div className="absolute -inset-px rounded-sm bg-gradient-to-b from-gold/30 via-gold/10 to-transparent pointer-events-none" />

        <div className="relative bg-arcane-panel border border-gold/20 rounded-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href={route('/')} className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45 group-hover:bg-gold/30 transition-colors" />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <Image src={asset('/icon.png')} alt="MindRift" width={46} height={46} className="rounded-sm object-contain" />
                </div>
              </div>
              <span className="font-cinzel text-xl font-bold tracking-tight uppercase">
                <span className="text-gold-light">MIND</span>
                <span className="text-gold">RIFT</span>
              </span>
            </a>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 rounded-sm overflow-hidden border border-gold/20">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(false); }}
                className={`flex-1 py-2.5 font-rajdhani font-bold tracking-widest uppercase text-sm transition-colors ${
                  mode === m
                    ? 'bg-gold/20 text-gold'
                    : 'text-gold-light/40 hover:text-gold-light/70'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Swords className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-gold-light mb-2">Conta Criada!</h3>
                <p className="font-rajdhani text-gold-light/60 text-sm">
                  Faça login para entrar no Rift.
                </p>
                <button
                  onClick={() => { setMode('login'); setSuccess(false); }}
                  className="mt-4 font-rajdhani font-bold tracking-widest uppercase text-sm text-gold hover:text-gold-light transition-colors"
                >
                  Fazer Login →
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="block font-rajdhani font-semibold text-xs tracking-widest uppercase text-gold/60 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="invocador@email.com"
                    className="w-full bg-arcane-dark/60 border border-gold/20 rounded-sm px-4 py-3 font-rajdhani text-gold-light placeholder:text-gold-light/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block font-rajdhani font-semibold text-xs tracking-widest uppercase text-gold/60 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-arcane-dark/60 border border-gold/20 rounded-sm px-4 py-3 pr-11 font-rajdhani text-gold-light placeholder:text-gold-light/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 text-red-400/80 text-sm font-rajdhani bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold hover:bg-gold-light text-arcane-dark font-cinzel font-bold text-sm tracking-widest uppercase py-3 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-arcane-dark/40 border-t-arcane-dark rounded-full animate-spin" />
                      Aguarde...
                    </span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Entrar no Rift' : 'Criar Conta'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center font-rajdhani text-xs text-gold-light/20 leading-relaxed max-w-sm mx-auto">
            MindRift AI não é endossado pela Riot Games e não reflete as opiniões ou pontos de vista
            da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento de
            League of Legends. League of Legends e Riot Games são marcas registradas ou marcas
            comerciais da Riot Games, Inc. League of Legends © Riot Games, Inc.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
  if (msg.includes('Email not confirmed'))        return 'Confirme seu email antes de entrar.';
  if (msg.includes('User already registered'))    return 'Este email já está cadastrado.';
  if (msg.includes('rate limit'))                 return 'Muitas tentativas. Aguarde alguns minutos.';
  if (msg.includes('Password should be'))         return 'A senha deve ter ao menos 6 caracteres.';
  return msg;
}
