// Regras de negócio da jornada de reserva v2 do Porks Sobradinho.
// Módulo puro (sem React). A API do Porks só valida dia bloqueado e lotação; horário da casa,
// antecedência e período são regras daqui, alinhadas ao que o site já mostrava.
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export const MAX_PEOPLE_WITHOUT_CONCIERGE = 40;
export const DEFAULT_MIN_PEOPLE = 2;
export const EVENING_CUTOFF_MIN = 17 * 60 + 30; // 17:30 separa tarde e noite (mesmo corte da API)
export const MANECO_MIN_HOUR = 18; // sem uso no Porks; mantido pela assinatura dos componentes

/** Promo da casa: de quinta a domingo, em qualquer horário, a mesa ganha chopes por tamanho do grupo. */
export const PROMO_DOWS = [4, 5, 6, 0];
export const PROMO_TIERS = [
  { min: 5, ganha: '5 chopes Pilsen' },
  { min: 8, ganha: '7 chopes Pilsen e 1 drink' },
  { min: 10, ganha: '9 chopes Pilsen, 1 petisco e 1 drink' },
];
export function promoTier(people: number) {
  return [...PROMO_TIERS].reverse().find((t) => people >= t.min) || null;
}
export function isPromoWindow(dateYMD: string | null, hhmm: string | null) {
  return !!dateYMD && !!hhmm && PROMO_DOWS.includes(dayjs(dateYMD).day());
}
export function promoFor(dateYMD: string | null, hhmm: string | null, people: number) {
  return isPromoWindow(dateYMD, hhmm) ? promoTier(people) : null;
}

export type DayWindow = { open: string; close: string } | null;

// Porks Sobradinho: reserva só das 18h às 21h, de 30 em 30 min, em todo dia aberto (segunda fechado).
// A casa abre antes disso nos fins de semana, mas sem reserva: é chegar e sentar.
const RESERVA_WINDOW: DayWindow = { open: '18:00', close: '21:00' };
const HOURS_BY_DOW: DayWindow[] = [
  RESERVA_WINDOW, // dom
  null,           // seg
  RESERVA_WINDOW, // ter
  RESERVA_WINDOW, // qua
  RESERVA_WINDOW, // qui
  RESERVA_WINDOW, // sex
  RESERVA_WINDOW, // sáb
];

export const ALLOWED_SLOTS: string[] = (() => {
  const s: string[] = [];
  for (let h = 12; h <= 23; h++) for (const m of [0, 30]) s.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  return s;
})();

/** Uma casa só; mantido pela assinatura dos componentes. */
export function isSpUnit(_slug?: string | null, _name?: string | null) {
  return false;
}

export function dayWindow(dateYMD: string | null, _sp = false): DayWindow {
  if (!dateYMD) return RESERVA_WINDOW;
  const dow = dayjs(dateYMD).day();
  return HOURS_BY_DOW[dow];
}

export function isClosedDay(dateYMD: string | null, sp = false) {
  return !!dateYMD && dayWindow(dateYMD, sp) === null;
}

export function slotMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function periodOf(hhmm: string): 'AFTERNOON' | 'NIGHT' {
  return slotMinutes(hhmm) >= EVENING_CUTOFF_MIN ? 'NIGHT' : 'AFTERNOON';
}

/** Primeiro instante reservável agora (regra de antecedência por período). */
export function earliestBookable(now: Date = new Date()): { dateYMD: string; time: string; reason: string } {
  const n = dayjs(now);
  const mins = n.hour() * 60 + n.minute();
  if (mins < EVENING_CUTOFF_MIN) {
    return {
      dateYMD: n.format('YYYY-MM-DD'),
      time: '18:00',
      reason: 'Para hoje ainda dá: reservas das 18h às 21h.',
    };
  }
  return {
    dateYMD: n.add(1, 'day').format('YYYY-MM-DD'),
    time: '18:00',
    reason: 'Reservas para hoje já encerraram. A partir de amanhã, das 18h às 21h.',
  };
}

/** Um horário está fora da janela de antecedência (mesmo período que o atual)? */
export function isBeforeEarliest(dateYMD: string, hhmm: string, now: Date = new Date()) {
  const e = earliestBookable(now);
  if (dateYMD < e.dateYMD) return true;
  if (dateYMD > e.dateYMD) return false;
  return slotMinutes(hhmm) < slotMinutes(e.time);
}

export function isPastSelection(dateYMD: string, hhmm: string, now: Date = new Date()) {
  const [h, m] = hhmm.split(':').map(Number);
  const dt = dayjs(dateYMD).hour(h || 0).minute(m || 0).second(0);
  return dt.isBefore(dayjs(now));
}

/** Sem área com horário mínimo no Porks. */
export function isManecoArea(_name?: string | null) {
  return false;
}
export function isBeforeManecoMin(_hhmm: string) {
  return false;
}

export type RecurringRule = { dow: number; fromTime: string; toTime: string; areaId?: string | null; reason?: string | null };

/** Bloqueio recorrente cobre esse horário? (areaId null = unidade inteira) */
export function ruleCovers(rule: RecurringRule, dateYMD: string, hhmm: string) {
  if (rule.dow !== dayjs(dateYMD).day()) return false;
  return hhmm >= rule.fromTime && hhmm < rule.toTime;
}

/** Motivo pelo qual um slot não pode ser escolhido, ou null se pode. */
export function slotBlockReason(opts: {
  dateYMD: string; hhmm: string; sp: boolean; rules: RecurringRule[]; now?: Date;
}): null | 'fechado' | 'passou' | 'antecedencia' | 'bloqueado' {
  const { dateYMD, hhmm, sp, rules, now } = opts;
  const win = dayWindow(dateYMD, sp);
  if (!win) return 'fechado';
  if (hhmm < win.open || hhmm > win.close) return 'fechado';
  if (isPastSelection(dateYMD, hhmm, now)) return 'passou';
  if (isBeforeEarliest(dateYMD, hhmm, now)) return 'antecedencia';
  if (rules.some((r) => !r.areaId && ruleCovers(r, dateYMD, hhmm))) return 'bloqueado';
  return null;
}

export function joinDateTimeISO(dateYMD: string, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return dayjs(dateYMD).hour(h || 0).minute(m || 0).second(0).millisecond(0).toDate().toISOString();
}

export function fmtDayLabel(dateYMD: string, todayYMD = dayjs().format('YYYY-MM-DD')) {
  const d = dayjs(dateYMD);
  if (dateYMD === todayYMD) return 'Hoje';
  if (dateYMD === dayjs(todayYMD).add(1, 'day').format('YYYY-MM-DD')) return 'Amanhã';
  const wd = d.format('ddd').replace('.', '');
  return wd.charAt(0).toUpperCase() + wd.slice(1);
}

export function fmtLongDate(dateYMD: string) {
  const d = dayjs(dateYMD);
  const wd = d.format('dddd');
  return `${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${d.format('D [de] MMMM')}`;
}

/** O Porks não tem mínimo de pessoas por horário de pico. */
export function peakMinPeople(_dateYMD: string, _hhmm: string, _unitSlug: string | null): number {
  return 1;
}

/** Regras recorrentes da unidade inteira que valem no dia escolhido, para explicar horários fechados. */
export function unitRulesForDay(rules: RecurringRule[], dateYMD: string) {
  const dow = dayjs(dateYMD).day();
  return rules.filter((r) => !r.areaId && r.dow === dow).sort((a, b) => a.fromTime.localeCompare(b.fromTime));
}

/** Último horário reservável do dia, considerando janela da casa e bloqueios da unidade. */
export function lastBookableSlot(dateYMD: string, sp: boolean, rules: RecurringRule[]): string | null {
  const win = dayWindow(dateYMD, sp);
  if (!win) return null;
  const slots = ALLOWED_SLOTS.filter((t) => t >= win.open && t <= win.close);
  const ok = slots.filter((t) => !rules.some((r) => !r.areaId && ruleCovers(r, dateYMD, t)));
  return ok.length ? ok[ok.length - 1] : null;
}
