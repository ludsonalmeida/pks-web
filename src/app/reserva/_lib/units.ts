// Metadados de exibição da casa. A lista real vem da API; aqui só o que a API não sabe dizer.
// Porks Sobradinho tem uma casa só: a jornada pula a pergunta "em qual casa?".
export type UnitMeta = {
  slug: 'porks';
  short: string;      // nome curto
  sub: string;        // linha de apoio
  concierge: string;  // WhatsApp da equipe para grupos grandes e ajuda humana (dígitos)
  atendimento: string; // WhatsApp oficial do Porks: alterar e cancelar reserva (dígitos)
};

export const UNIT_META: UnitMeta[] = [
  { slug: 'porks', short: 'Porks Sobradinho', sub: 'Sobradinho, DF', concierge: '61981776251', atendimento: '61935003917' },
];

/** Uma casa só: qualquer unidade da API vira 'porks'. */
export function detectSlug(_slug?: string | null, _name?: string | null): UnitMeta['slug'] | null {
  return 'porks';
}

export function metaFor(slug: UnitMeta['slug'] | null) {
  return UNIT_META.find((m) => m.slug === slug) || UNIT_META[0];
}

export function conciergeLink(phoneDigits: string, text: string) {
  return `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(text)}`;
}
