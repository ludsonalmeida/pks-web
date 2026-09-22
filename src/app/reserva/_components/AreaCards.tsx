'use client';

import * as React from 'react';
import { IconArmchair, IconHome, IconSun } from '@tabler/icons-react';
import s from '../reserva.module.css';
import { isBeforeManecoMin, isManecoArea } from '../_lib/rules';

/** Ícone simbólico da área: telhado para a Coberta, sol para o Deck, poltrona para o resto. */
function AreaIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const Icon = /cobert|sal[aã]o|interno/.test(n) ? IconHome : /deck|externo|varanda|jardim/.test(n) ? IconSun : IconArmchair;
  return <Icon size={40} stroke={1.6} aria-hidden="true" />;
}

/** Foto da área com fallback: sem URL ou com erro de carregamento, mostra o ícone. */
function AreaPhoto({ url, name }: { url?: string | null; name: string }) {
  const [broken, setBroken] = React.useState(false);
  if (!url || broken) {
    return <div className={`${s.areaImg} ${s.areaIcon}`}><AreaIcon name={name} /></div>;
  }
  return <img className={s.areaImg} src={url} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

export type AreaCard = {
  id: string;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  available: number; // vagas no período
  blocked?: boolean;
};

/** Frase curta de benefício a partir da descrição longa da API. */
export function benefitLine(a: AreaCard) {
  const d = (a.description || '').trim();
  if (!d) return '';
  const first = d.split(/(?<=[.!?])\s/)[0];
  return first.length > 70 ? `${first.slice(0, 67).trim()}…` : first;
}

export function AreaCards({
  areas, value, suggestedId, time, people, onChange,
}: {
  areas: AreaCard[];
  value: string | null;
  suggestedId: string | null;
  time: string;
  people: number;
  onChange: (a: AreaCard) => void;
}) {
  return (
    <div className={s.areas} role="radiogroup" aria-label="Onde vocês querem ficar">
      {areas.map((a) => {
        const maneco = isManecoArea(a.name) && isBeforeManecoMin(time);
        const full = a.available < people;
        const disabled = maneco || full || !!a.blocked;
        const on = value === a.id;
        const badge = on ? 'Escolhida' : maneco ? 'Só a partir das 18h' : full ? 'Lotou' : a.id === suggestedId ? 'Sugestão' : null;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            className={s.area}
            onClick={() => onChange(a)}
          >
            <AreaPhoto url={a.photoUrl} name={a.name} />
            {badge && (
              <span className={`${s.badge} ${on ? s.badgeOn : disabled ? s.badgeOff : ''}`}>{badge}</span>
            )}
            <span className={s.areaBody}>
              <b>{a.name.replace(/^Ala\s+/i, '')}</b>
              <small>{benefitLine(a) || (full ? 'Sem lugar para o grupo nesse horário' : 'Área do Porks')}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
