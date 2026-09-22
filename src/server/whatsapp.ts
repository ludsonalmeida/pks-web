// Aviso de reserva nova para a equipe, pelo WhatsApp oficial do Porks (Meta Cloud API). SÓ no servidor.
// Nunca bloqueia a criação da reserva: qualquer falha vira log.
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { promoFor } from '@/app/reserva/_lib/rules';

dayjs.locale('pt-br');

const TOKEN = process.env.WA_TOKEN || '';
const PHONE_ID = process.env.WA_PHONE_NUMBER_ID || process.env.PHONE_NUMBER_ID || '';
const TO = (process.env.NOTIFY_WHATSAPP || '').replace(/\D+/g, ''); // pode ter mais de um, separados por vírgula
const TEMPLATE = process.env.NOTIFY_TEMPLATE || 'nova_reserva_equipe';
const GRAPH = 'https://graph.facebook.com/v22.0';

export const notifyEnabled = () => !!TOKEN && !!PHONE_ID && !!TO;

export type NovaReserva = {
  fullName: string;
  phone: string;          // dígitos
  dateYMD: string;        // dia local da reserva
  time: string;           // HH:mm local
  people: number;
  areaName?: string | null;
  reservationCode?: string | null;
  birthdayBonus: boolean; // informou/confirmou aniversário e ganhou +1 chope
  reservationType?: string | null;
};

const fmtPhone = (d: string) => {
  const p = d.replace(/^55/, '');
  return p.length === 11 ? `(${p.slice(0, 2)}) ${p.slice(2, 3)} ${p.slice(3, 7)}-${p.slice(7)}` : p.length === 10 ? `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}` : d;
};
const clean = (v: string) => String(v || '').replace(/[\n\t]+/g, ' ').replace(/\s{5,}/g, ' ').trim() || '-';

/** Monta os 9 parâmetros do template, na ordem. */
export function buildParams(r: NovaReserva): string[] {
  const promo = promoFor(r.dateYMD, r.time, r.people);
  const d = dayjs(r.dateYMD);
  const wd = d.format('dddd').replace('-feira', '');
  return [
    clean(r.fullName),
    clean(`${wd}, ${d.format('DD/MM')}`),
    clean(r.time.replace(':00', 'h').replace(':30', 'h30')),
    String(r.people),
    clean(r.areaName || 'área a definir'),
    promo ? clean(promo.ganha) : 'não (só de quinta a domingo, a partir de 5 pessoas)',
    r.birthdayBonus ? 'sim, +1 chope Pilsen' : 'não',
    fmtPhone(r.phone),
    clean(r.reservationCode || '-'),
  ].map((p) => p.slice(0, 200));
}

/** Texto livre equivalente (usado se o template ainda não estiver aprovado). */
export function buildText(r: NovaReserva): string {
  const [nome, dia, hora, pessoas, area, cortesia, aniv, tel, cod] = buildParams(r);
  return `Nova reserva no site 🐷\n\n👤 ${nome}\n📅 ${dia} às ${hora}\n👥 ${pessoas} pessoas · ${area}\n🍺 Cortesia de chope: ${cortesia}\n🎂 Chope de aniversário: ${aniv}\n📱 ${tel} · Código ${cod}${r.reservationType === 'ANIVERSARIO' ? '\n🎉 Ocasião: aniversário' : ''}`;
}

async function send(body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(j?.error || j).slice(0, 300)}`);
  return j;
}

/** Envia para cada número de NOTIFY_WHATSAPP: template primeiro; se a Meta recusar, tenta texto livre. */
export async function notifyNovaReserva(r: NovaReserva): Promise<void> {
  if (!notifyEnabled()) return;
  const params = buildParams(r);
  const text = buildText(r);
  for (const to of TO.split(',').map((x) => x.replace(/\D+/g, '')).filter(Boolean)) {
    try {
      await send({
        messaging_product: 'whatsapp', to, type: 'template',
        template: { name: TEMPLATE, language: { code: 'pt_BR' }, components: [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: p })) }] },
      });
      console.log(`[notify] reserva ${r.reservationCode || ''} avisada por template para ...${to.slice(-4)}`);
    } catch (e: any) {
      console.warn(`[notify] template falhou para ...${to.slice(-4)}: ${e?.message || e}. Tentando texto livre.`);
      try {
        await send({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text, preview_url: false } });
        console.log(`[notify] reserva ${r.reservationCode || ''} avisada por texto para ...${to.slice(-4)}`);
      } catch (e2: any) {
        console.error(`[notify] falhou de vez para ...${to.slice(-4)}: ${e2?.message || e2}`);
      }
    }
  }
}
