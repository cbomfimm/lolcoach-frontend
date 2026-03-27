'use client';
import Image from 'next/image';
import { Twitter, Instagram } from 'lucide-react';
import { asset } from '@/lib/assets';

export function Footer() {
  return (
    <footer className="relative bg-[#0a0a1a] border-t border-[#2a2845] overflow-hidden">
      <div className="absolute inset-0 bg-hex-pattern opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2845] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 group w-fit">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#7c6dd8]/15 rounded-lg group-hover:bg-[#7c6dd8]/25 transition-colors" />
              <div className="relative z-10">
                <Image src={asset('/icon.png')} alt="MindRift logo" width={32} height={32} className="rounded-lg object-contain" />
              </div>
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="text-white">MIND</span><span className="text-[#d4a843]">RIFT</span>
              <span className="text-[#d4a843] text-xs font-medium ml-1 tracking-widest">COACH</span>
            </span>
          </a>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/MindRiftAI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-8 h-8 rounded-lg bg-[#7c6dd8]/10 border border-[#2a2845] flex items-center justify-center text-white/30 hover:text-[#7c6dd8] hover:border-[#7c6dd8]/40 transition-all duration-200 hover:bg-[#7c6dd8]/15"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/mindriftai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-lg bg-[#7c6dd8]/10 border border-[#2a2845] flex items-center justify-center text-white/30 hover:text-[#7c6dd8] hover:border-[#7c6dd8]/40 transition-all duration-200 hover:bg-[#7c6dd8]/15"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[#2a2845] flex flex-col gap-3">
          <p className="text-xs text-white/20 leading-relaxed max-w-3xl">
            MindRift AI não é endossado pela Riot Games e não reflete as opiniões ou pontos de vista
            da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento de
            League of Legends. League of Legends e Riot Games são marcas registradas ou marcas
            comerciais da Riot Games, Inc. League of Legends © Riot Games, Inc.
          </p>
          <p className="text-xs text-white/25 tracking-wider">
            © {new Date().getFullYear()} MindRift AI. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
