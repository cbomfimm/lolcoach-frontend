'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Problema', href: '#problema' },
  { label: 'Diferencial', href: '#diferencial' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Roles', href: '#roles' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45 group-hover:bg-gold/30 transition-colors" />
            <Swords className="relative z-10 w-5 h-5 text-gold m-1.5" />
          </div>
          <span className="font-cinzel text-lg font-bold tracking-widest text-gold-light">
            LOL<span className="text-gold">COACH</span>
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
          <Button size="sm" className="font-rajdhani font-bold tracking-widest uppercase flex items-center gap-1">
            Acesso Antecipado <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gold-light hover:text-gold"
          onClick={() => setMobileOpen(!mobileOpen)}
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
              <Button size="sm" className="font-rajdhani font-bold tracking-widest uppercase w-full mt-2">
                Acesso Antecipado
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
