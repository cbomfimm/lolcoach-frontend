'use client';
import Image from 'next/image';
import { Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-arcane-dark border-t border-gold/15 overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2 group w-fit">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45 group-hover:bg-gold/30 transition-colors" />
              <div className="relative z-10">
                <Image src="/icon.png" alt="MindRift logo" width={32} height={32} className="rounded-sm object-contain" />
              </div>
            </div>
            <span className="font-cinzel text-base font-bold tracking-widest text-gold-light">
              <span className="text-gold-light">MIND</span><span className="text-gold">RIFT</span>
            </span>
          </a>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/MindRiftAI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/50 hover:text-gold hover:border-gold/50 transition-all duration-200 hover:bg-gold/20"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/mindriftai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/50 hover:text-gold hover:border-gold/50 transition-all duration-200 hover:bg-gold/20"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gold/10 flex flex-col gap-3">
          <p className="font-rajdhani text-xs text-gold-light/20 leading-relaxed max-w-3xl">
            MindRift Coach não é endossado pela Riot Games e não reflete as opiniões da Riot Games ou de qualquer
            pessoa envolvida oficialmente na produção ou gestão de League of Legends. League of Legends e Riot Games
            são marcas registradas da Riot Games, Inc.
          </p>
          <p className="font-rajdhani text-xs text-gold-light/25 tracking-wider">
            © 2025 MindRift
          </p>
        </div>
      </div>
    </footer>
  );
}
