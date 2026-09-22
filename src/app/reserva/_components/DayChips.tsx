'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { IconBeer, IconCalendarPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import s from '../reserva.module.css';
import d from './day.module.css';
import { PROMO_DOWS, earliestBookable, isClosedDay } from '../_lib/rules';

dayjs.locale('pt-br');

const DAYS_AHEAD = 14;

/**
 * Faixa de cartões de calendário: dia da semana em cima, número grande, mês embaixo.
 * Quinta a domingo levam a etiqueta de chope (dias de cortesia). Segunda aparece fechada.
 * O botão "Escolher uma data mais pra frente" (fora da faixa, sempre visível) abre o calendário nativo.
 */
export function DayChips({
  value, onChange, sp,
}: {
  value: string | null;
  onChange: (ymd: string | null) => void;
  sp: boolean;
}) {
  const today = dayjs().format('YYYY-MM-DD');
  const earliest = earliestBookable();
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => dayjs(today).add(i, 'day').format('YYYY-MM-DD'));
  const inStrip = value ? days.includes(value) : true;
  const [other, setOther] = React.useState(!inStrip);
  // data digitada/escolhida no calendário nativo: só entra na jornada quando a pessoa confirma
  const [pending, setPending] = React.useState<string>(value && !inStrip ? value : '');
  const stripRef = React.useRef<HTMLDivElement>(null);

  // o dia escolhido fica visível na faixa
  React.useEffect(() => {
    if (!value || !stripRef.current) return;
    const el = stripRef.current.querySelector<HTMLElement>(`[data-ymd="${value}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [value]);

  const scrollBy = (dir: 1 | -1) => stripRef.current?.scrollBy({ left: dir * 3 * 86, behavior: 'smooth' });

  const label = (ymd: string) => {
    if (ymd === today) return 'Hoje';
    if (ymd === days[1]) return 'Amanhã';
    return dayjs(ymd).format('ddd').replace('.', '');
  };

  return (
    <div className={s.block}>
      <div className={d.stripWrap}>
      <button type="button" className={`${d.arrow} ${d.arrowL}`} aria-label="Dias anteriores" onClick={() => scrollBy(-1)}><IconChevronLeft size={18} stroke={2.4} /></button>
      <button type="button" className={`${d.arrow} ${d.arrowR}`} aria-label="Mais dias" onClick={() => scrollBy(1)}><IconChevronRight size={18} stroke={2.4} /></button>
      <div ref={stripRef} className={d.strip} role="radiogroup" aria-label="Que dia">
        {days.map((ymd, i) => {
          const dt = dayjs(ymd);
          const closed = isClosedDay(ymd, sp);
          const tooEarly = ymd < earliest.dateYMD;
          const disabled = closed || tooEarly;
          const bonus = !disabled && PROMO_DOWS.includes(dt.day());
          const on = value === ymd;
          return (
            <button
              key={ymd}
              type="button"
              role="radio"
              data-ymd={ymd}
              aria-checked={on}
              disabled={disabled}
              className={`${d.day} ${bonus ? d.bonus : ''} ${closed ? d.closed : ''}`}
              style={{ animationDelay: `${i * 45}ms` }}
              title={closed ? 'Fechado nesse dia' : tooEarly ? earliest.reason : bonus ? 'Dia de cortesia de chope' : undefined}
              onClick={() => { setOther(false); onChange(ymd); }}
            >
              <span className={d.wd}>{label(ymd)}</span>
              <span className={d.num}>{dt.format('D')}</span>
              <span className={d.mo}>{closed ? 'fechado' : tooEarly ? 'encerrou' : dt.format('MMM').replace('.', '')}</span>
              {bonus && (
                <span className={d.tag} aria-label="dia de cortesia de chope"><IconBeer size={11} stroke={2.4} /> chope</span>
              )}
            </button>
          );
        })}
      </div>
      </div>

      <p className={d.legend}><IconBeer size={13} stroke={2.4} aria-hidden="true" /> Quinta a domingo a mesa ganha chope, a partir de 5 pessoas.</p>

      {/* datas além da faixa: botão sempre visível, abre o calendário nativo */}
      <div className={d.otherRow}>
        <button type="button" className={`${d.otherBtn} ${other ? d.otherOn : ''}`} aria-pressed={other} onClick={() => { setOther(true); if (inStrip) onChange(null); }}>
          <IconCalendarPlus size={18} stroke={2.2} aria-hidden="true" />
          {value && !inStrip ? dayjs(value).format('dddd, D [de] MMMM') : 'Escolher uma data mais pra frente'}
        </button>
        {other && (
          <div className={d.pickRow}>
            <input
              id="reserva-outra-data"
              className={s.dateInput}
              type="date"
              aria-label="Escolher outra data"
              min={earliest.dateYMD}
              max={dayjs(today).add(180, 'day').format('YYYY-MM-DD')}
              value={pending}
              onChange={(e) => setPending(e.target.value)}
            />
            <button
              type="button"
              className={d.pickBtn}
              disabled={!pending || pending < earliest.dateYMD || isClosedDay(pending, sp)}
              onClick={() => onChange(pending)}
            >
              Usar {pending ? dayjs(pending).format('D [de] MMM') : 'essa data'}
            </button>
            {pending && isClosedDay(pending, sp) && <p className={d.pickErr}>Segunda a casa não abre. Escolha outro dia.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
