/**
 * RiotLegalBar — Atribuição legal obrigatória exigida pelo Riot Games Legal Jibber Jabber.
 * Incluído no layout raiz para garantir presença em TODAS as páginas do site.
 */
export function RiotLegalBar() {
  return (
    <div className="w-full bg-black/60 border-t border-white/5 px-4 py-3">
      <p className="text-center text-[10px] leading-relaxed text-white/20 max-w-4xl mx-auto font-sans">
        MindRift AI não é endossado pela Riot Games e não reflete as opiniões ou pontos de
        vista da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou
        gerenciamento de League of Legends.{' '}
        League of Legends e Riot Games são marcas registradas ou marcas comerciais da Riot
        Games, Inc.{' '}
        League of Legends © Riot Games, Inc.
      </p>
    </div>
  );
}
