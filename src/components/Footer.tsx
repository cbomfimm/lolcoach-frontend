'use client';
import { Swords, Twitter, Youtube, Twitch, MessageCircle } from 'lucide-react';

const footerLinks = {
  Produto: ['Funcionalidades', 'Como Funciona', 'Roles', 'Roadmap'],
  Empresa: ['Sobre', 'Blog', 'Carreiras', 'Imprensa'],
  Suporte: ['Documentação', 'Discord', 'Status', 'Contato'],
  Legal: ['Privacidade', 'Termos de Uso', 'Cookies'],
};

export function Footer() {
  return (
    <footer className="relative bg-arcane-dark border-t border-gold/15 overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gold/20 rounded-sm rotate-45 group-hover:bg-gold/30 transition-colors" />
                <Swords className="relative z-10 w-5 h-5 text-gold m-1.5" />
              </div>
              <span className="font-cinzel text-base font-bold tracking-widest text-gold-light">
                LOL<span className="text-gold">COACH</span>
              </span>
            </a>
            <p className="font-rajdhani text-sm text-gold-light/40 leading-relaxed mb-5">
              Coach com IA para o servidor brasileiro. Voz em tempo real, histórico pessoal e briefing na loading screen.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[Twitter, Youtube, Twitch, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/50 hover:text-gold hover:border-gold/50 transition-all hover:bg-gold/20"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-cinzel text-xs font-bold tracking-widest uppercase text-gold/60 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-rajdhani text-sm text-gold-light/40 hover:text-gold/80 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-rajdhani text-xs text-gold-light/25 tracking-wider">
            © 2025 LOLCoach — Não afiliado à Riot Games.
          </p>
          <p className="font-rajdhani text-xs text-gold-light/25 tracking-wider">
            League of Legends é marca registrada da Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
