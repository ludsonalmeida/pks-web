// Acesso a dados do cliente SÓ no servidor. Nunca importar em componentes cliente.
// Duas fontes, na ordem: CRM (engine, se houver token) e o próprio banco de reservas do Porks
// (reservas anteriores pelo telefone, via API autenticada com x-api-key).
import crypto from 'crypto';

const ENGINE = (process.env.ENGINE_API_BASE || 'https://engine.mane.com.vc/api').replace(/\/+$/, '');
const TOKEN = process.env.ENGINE_API_TOKEN || '';
const RESERVAS_API = (process.env.RESERVAS_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api2.sobradinhoporks.com.br').replace(/\/+$/, '');
const RESERVAS_KEY = process.env.RESERVAS_API_KEY || '';
const SECRET = TOKEN || RESERVAS_KEY || 'dev';

type Lead = {
  id: number | string; name?: string | null; first_name?: string | null; email?: string | null; phone?: string | null;
  cpf?: string | null; birthday?: string | null; ltv?: string | number | null; purchase_count?: number | null; unit?: string | null;
  source?: 'crm' | 'reservas';
};

export const hasCrmToken = () => !!TOKEN || !!RESERVAS_KEY;
export const digits = (v: string) => (v || '').replace(/\D+/g, '');

export function signLookup(leadId: number | string, last9: string) {
  const exp = Date.now() + 30 * 60 * 1000; // vale 30 minutos
  const payload = Buffer.from(JSON.stringify({ id: leadId, p: last9, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function verifyLookup(token: string): { id: number | string; p: string } | null {
  try {
    const [payload, sig] = token.split('.');
    const expect = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (sig !== expect) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data?.id || !data?.p || Date.now() > data.exp) return null;
    return { id: data.id, p: String(data.p) };
  } catch {
    return null;
  }
}

/** CRM (engine): leads cujo telefone termina com os 9 dígitos, o mais completo primeiro. */
async function findInCrm(last9: string): Promise<Lead | null> {
  if (!TOKEN) return null;
  const res = await fetch(`${ENGINE}/leads?search=${encodeURIComponent(last9)}&limit=20`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const list = (await res.json()) as Lead[];
  const matches = (Array.isArray(list) ? list : []).filter((l) => digits(l.phone || '').endsWith(last9));
  if (matches.length === 0) return null;
  const score = (l: Lead) => (l.cpf ? 4 : 0) + (l.email ? 2 : 0) + (l.birthday ? 1 : 0) + Math.min(Number(l.ltv || 0) / 1000, 1);
  return { ...matches.sort((a, b) => score(b) - score(a))[0], source: 'crm' };
}

type Reservation = {
  id: string; fullName?: string | null; email?: string | null; cpf?: string | null; phone?: string | null;
  birthdayDate?: string | null; status?: string | null; createdAt?: string | null; reservationDate?: string | null;
};

/** Banco de reservas do Porks: reservas anteriores desse telefone, a mais recente e completa primeiro. */
async function findInReservas(last9: string): Promise<Lead | null> {
  if (!RESERVAS_KEY) return null;
  const res = await fetch(`${RESERVAS_API}/v1/integrations/admin/reservations?search=${encodeURIComponent(last9)}&pageSize=50`, {
    headers: { 'x-api-key': RESERVAS_KEY },
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const items = (Array.isArray(j) ? j : j?.items || []) as Reservation[];
  const matches = items.filter((r) => digits(r.phone || '').endsWith(last9) && r.status !== 'CANCELED' && r.status !== 'CANCELLED');
  if (matches.length === 0) return null;
  // prioridade: tem aniversário, depois a mais recente
  const score = (r: Reservation) => (r.birthdayDate ? 10 : 0) + (r.fullName ? 1 : 0) + (Date.parse(r.createdAt || r.reservationDate || '') || 0) / 1e14;
  const best = matches.sort((a, b) => score(b) - score(a))[0];
  const bday = best.birthdayDate ? String(best.birthdayDate).slice(0, 10) : null;
  return {
    id: best.id,
    name: best.fullName || null,
    email: best.email || null,
    cpf: best.cpf || null,
    phone: best.phone || null,
    birthday: bday && /^\d{4}-\d{2}-\d{2}$/.test(bday) ? bday : null,
    purchase_count: matches.length,
    source: 'reservas',
  };
}

// Cache curto em memória: a tela consulta o mesmo número mais de uma vez (lookup e depois a criação da reserva).
const CACHE_TTL_MS = 2 * 60 * 1000;
const cache = new Map<string, { at: number; lead: Lead | null }>();

/** Quem é esse telefone? CRM primeiro; sem CRM (caso do Porks), o histórico de reservas. */
export async function findLeadByPhone(phoneDigits: string): Promise<Lead | null> {
  const last9 = phoneDigits.slice(-9);
  if (last9.length < 8) return null;
  const hit = cache.get(last9);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.lead;
  let lead: Lead | null = null;
  try {
    lead = await findInCrm(last9);
  } catch { /* segue pro histórico */ }
  if (!lead) {
    try { lead = await findInReservas(last9); } catch { lead = null; }
  }
  cache.set(last9, { at: Date.now(), lead });
  if (cache.size > 500) { const first = cache.keys().next().value; if (first) cache.delete(first); }
  return lead;
}

export type { Lead };
