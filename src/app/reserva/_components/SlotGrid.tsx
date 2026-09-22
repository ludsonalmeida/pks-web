'use client';

import { IconBeer, IconMoodSmile, IconMusic, IconSunset2 } from '@tabler/icons-react';
import d from './slot.module.css';
import { ALLOWED_SLOTS, dayWindow, slotBlockReason, type RecurringRule } from '../_lib/rules';

const REASON_LABEL: Record<string, string> = {
  fechado: 'fechado', passou: 'já passou', antecedencia: 'encerrou', bloqueado: 'sem reserva', lotou: 'lotou',
};

/** Clima da casa por faixa de horário: dá contexto sem inventar dado. */
function vibe(hhmm: string): { text: string; Icon: typeof IconBeer } {
  if (hhmm < '18:30') return { text: 'abertura, mesa fresca', Icon: IconSunset2 };
  if (hhmm < '19:30') return { text: 'cedo e tranquilo', Icon: IconMoodSmile };
  if (hhmm < '20:30') return { text: 'hora da galera', Icon: IconMusic };
  return { text: 'última chamada', Icon: IconBeer };
}

/**
 * Grade de horários de 30 em 30 minutos, só os da janela do dia, em cartões:
 * hora grande, clima da faixa embaixo e, quando não dá, o motivo dentro do próprio cartão.
 */
export function SlotGrid({
  dateYMD, sp, rules, fullSlots, value, onChange,
}: {
  dateYMD: string;
  sp: boolean;
  rules: RecurringRule[];
  fullSlots: Set<string>;
  value: string | null;
  onChange: (hhmm: string) => void;
}) {
  const win = dayWindow(dateYMD, sp);
  if (!win) return null;
  const slots = ALLOWED_SLOTS.filter((t) => t >= win.open && t <= win.close);

  return (
    <div className={d.grid} role="radiogroup" aria-label="Que horas vocês chegam">
      {slots.map((t, i) => {
        const reason = slotBlockReason({ dateYMD, hhmm: t, sp, rules }) || (fullSlots.has(t) ? 'lotou' : null);
        const on = value === t;
        const { text, Icon } = vibe(t);
        const [h, m] = t.split(':');
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={!!reason}
            className={`${d.slot} ${reason === 'lotou' ? d.full : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onChange(t)}
            title={reason ? REASON_LABEL[reason] : text}
          >
            <span className={d.time}>{h}<small>{m === '00' ? 'h' : `h${m}`}</small></span>
            {reason ? (
              <span className={d.reason}>{REASON_LABEL[reason]}</span>
            ) : (
              <span className={d.vibe}><Icon size={12} stroke={2.2} aria-hidden="true" /> {text}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
