// Cria a reserva no servidor. Se o cliente foi reconhecido (token da consulta) e pediu para usar a data de
// nascimento que já temos (useKnownBirthday), o servidor completa esse dado; o navegador nunca vê o valor real.
import { NextResponse } from 'next/server';
import { findLeadByPhone, verifyLookup } from '@/server/crm';
import { ageFromISO, MAX_AGE, MIN_AGE } from '@/app/reserva/_lib/validators';
import { notifyNovaReserva } from '@/server/whatsapp';

export const dynamic = 'force-dynamic';

const API = (process.env.RESERVAS_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api2.sobradinhoporks.com.br').replace(/\/+$/, '');
const digits = (v: string) => (v || '').replace(/\D+/g, '');

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: { message: 'Pedido inválido.' } }, { status: 400 }); }

  const phone = digits(body.phone || '');
  let email: string | null = (body.email || '').trim().toLowerCase() || null;
  let cpf: string | null = digits(body.cpf || '') || null;
  let birthdayDate: string | null = body.birthdayDate || null;

  // cliente reconhecido e pediu para usar a data que já temos: o servidor completa (com a mesma regra de idade)
  let knownBirthdayUsed = false;
  if (body.crmToken && body.useKnownBirthday && !birthdayDate) {
    const t = verifyLookup(String(body.crmToken));
    if (t && phone.endsWith(t.p)) {
      try {
        const lead = await findLeadByPhone(phone);
        if (lead && String(lead.id) === String(t.id) && lead.birthday) {
          const m = String(lead.birthday).match(/^(\d{4}-\d{2}-\d{2})/);
          const age = m ? ageFromISO(m[1]) : null;
          if (m && age !== null && age >= MIN_AGE && age <= MAX_AGE) { birthdayDate = `${m[1]}T12:00:00.000Z`; knownBirthdayUsed = true; }
        }
      } catch { /* sem dado, segue sem o bônus */ }
    }
  }

  const payload = {
    fullName: String(body.fullName || '').trim(),
    phone,
    email,
    cpf,
    birthdayDate,
    people: Number(body.people || 0),
    kids: Number(body.kids || 0),
    reservationDate: body.reservationDate,
    unitId: body.unitId,
    areaId: body.areaId,
    notes: ((body.notes || '').trim() || (knownBirthdayUsed ? 'Aniversário confirmado: +1 chope Pilsen na reserva.' : '')) || null,
    reservationType: body.reservationType || 'PARTICULAR',
    source: 'site',
    utm_source: body.utm_source || 'site',
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_content: body.utm_content || 'jornada-v2',
    utm_term: body.utm_term || null,
    url: body.url || null,
    ref: body.ref || null,
  };

  try {
    const res = await fetch(`${API}/v1/reservations/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    // reserva criada: avisa a equipe no WhatsApp (nunca segura a resposta ao cliente)
    if (res.ok && body.dateYMD && body.time) {
      const typedBirthday = !!birthdayDate;
      void notifyNovaReserva({
        fullName: payload.fullName, phone, dateYMD: String(body.dateYMD), time: String(body.time),
        people: payload.people, areaName: body.areaName || data?.areaName || null,
        reservationCode: data?.reservationCode || null, birthdayBonus: knownBirthdayUsed || typedBirthday,
        reservationType: payload.reservationType,
      }).catch(() => { /* já logado */ });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    const timeout = e?.name === 'TimeoutError';
    return NextResponse.json({ error: { message: timeout ? 'A API demorou demais para responder.' : 'Não conseguimos falar com a API de reservas.' } }, { status: 502 });
  }
}
