'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { asset, route } from '@/lib/assets';

const navLinks = [
  { label: 'Problema', href: '#problema' },
  { label: 'Diferencial', href: '#diferencial' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Roles', href: '#roles' },
  { label: 'Planos', href: '#pricing' },
];

export function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-arcane-dark/90 backdrop-blur-xl border-b border-gold/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45 group-hover:bg-gold/30 transition-colors" />
            <div className="relative z-10">
              <Image src={asset('/icon.png')} alt="Mindrift logo" width={42} height={42} className="rounded-sm object-contain" />
            </div>
          </div>
          <span className="font-cinzel text-lg font-bold tracking-tight text-gold-light uppercase">
            <span className="text-gold-light">MIND</span>
            <span className="text-gold">RIFT</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm font-rajdhani font-semibold tracking-wider text-gold-light/70 hover:text-gold transition-colors group uppercase"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <a
                href={route('/dashboard')}
                className="flex items-center gap-1.5 font-rajdhani font-bold tracking-widest uppercase text-sm text-gold-light/70 hover:text-gold transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </a>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 font-rajdhani font-bold tracking-widest uppercase text-sm text-gold-light/40 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </>
          ) : (
            <Button
              size="sm"
              className="font-rajdhani font-bold tracking-widest uppercase flex items-center gap-1"
              onClick={() => router.push('/login')}
            >
              Entrar <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gold-light hover:text-gold cursor-pointer transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-arcane-dark/95 backdrop-blur-xl border-b border-gold/20"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-rajdhani font-semibold tracking-wider uppercase text-gold-light/70 hover:text-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href={route('/dashboard')}
                    className="font-rajdhani font-bold tracking-widest uppercase text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1.5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </a>
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="font-rajdhani font-bold tracking-widest uppercase text-sm text-gold-light/40 hover:text-red-400 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="font-rajdhani font-bold tracking-widest uppercase w-full mt-2"
                  onClick={() => { router.push('/login'); setMobileOpen(false); }}
                >
                  Entrar
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
