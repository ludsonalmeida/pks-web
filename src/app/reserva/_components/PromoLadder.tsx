'use client';

import * as React from 'react';
import { IconBeer, IconGlassCocktail, IconLock, IconToolsKitchen2 } from '@tabler/icons-react';
import s from './promo.module.css';
import { PROMO_TIERS, isPromoWindow, promoTier } from '../_lib/rules';

const MAX = PROMO_TIERS[PROMO_TIERS.length - 1].min;

/**
 * Escada de benefícios da mesa, com movimento: entra deslizando com um brilho, as faixas sobem em cascata,
 * a barra de progresso corre até o tamanho do grupo e, ao conquistar uma faixa nova, o texto vira e solta faíscas.
 */
export function PromoLadder({ people, dateYMD, time, compact }: { people: number; dateYMD?: string | null; time?: string | null; compact?: boolean }) {
  const tier = promoTier(people);
  const next = PROMO_TIERS.find((t) => t.min > people) || null;
  const chosen = !!dateYMD && !!time;
  const inWindow = chosen ? isPromoWindow(dateYMD!, time!) : true;
  const first = PROMO_TIERS[0];
  const tierKey = inWindow ? tier?.min ?? 0 : -1;

  // faíscas só quando a faixa muda para cima (não na primeira pintura)
  const prevTier = React.useRef<number | null>(null);
  const [burst, setBurst] = React.useState(0);
  React.useEffect(() => {
    if (prevTier.current !== null && tierKey > prevTier.current && tierKey > 0) setBurst((b) => b + 1);
    prevTier.current = tierKey;
  }, [tierKey]);

  // barra: quanto do caminho até a faixa máxima o grupo já andou
  const progress = inWindow ? Math.min(1, Math.max(0, people / MAX)) : 0;

  return (
    <section className={`${s.card} ${compact ? s.compact : ''} ${!inWindow ? s.muted : ''}`} aria-live="polite" aria-label="Cortesia de chope da mesa">
      <span className={s.shine} aria-hidden="true" />

      <header className={s.head}>
        <span className={s.kicker}>{!inWindow ? 'Cortesia de chope' : tier ? 'Sua mesa ganha' : 'Sua mesa pode ganhar'}</span>
        {/* key na faixa: cada mudança re-anima o texto */}
        <strong key={tierKey} className={`${s.big} ${s.flip}`}>
          {inWindow && tier ? tier.ganha : inWindow ? <>{first.ganha} <small>a partir de {first.min} pessoas</small></> : 'não vale nesse horário'}
        </strong>
        <span className={s.bar} aria-hidden="true">
          <span className={s.fill} style={{ transform: `scaleX(${progress})` }} />
          {PROMO_TIERS.map((t) => (
            <i key={t.min} className={`${s.tick} ${inWindow && people >= t.min ? s.tickOn : ''}`} style={{ left: `${(t.min / MAX) * 100}%` }} />
          ))}
        </span>
      </header>

      <ol className={s.steps}>
        {PROMO_TIERS.map((t, i) => {
          const won = inWindow && people >= t.min;
          const isCurrent = won && tier?.min === t.min;
          return (
            <li key={t.min} className={`${s.step} ${won ? s.won : ''} ${isCurrent ? s.current : ''}`} style={{ animationDelay: `${120 + i * 90}ms` }}>
              <span className={s.min}><small>a partir de</small><b>{t.min}</b></span>
              <span className={`${s.icons} ${isCurrent ? s.cheers : ''}`} aria-hidden="true">
                <IconBeer size={18} stroke={2} />
                {t.min >= 8 && <IconGlassCocktail size={18} stroke={2} />}
                {t.min >= 10 && <IconToolsKitchen2 size={18} stroke={2} />}
              </span>
              <span className={s.gain}>{t.ganha}</span>
              {!won && <IconLock size={14} stroke={2.2} className={s.lock} aria-hidden="true" />}
              {isCurrent && burst > 0 && (
                <span key={burst} className={s.sparks} aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, k) => (
                    <i key={k} style={{ ['--a' as any]: `${(k / 10) * 360}deg`, ['--d' as any]: `${38 + (k % 3) * 14}px`, animationDelay: `${(k % 4) * 30}ms` }} />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <p key={`f-${tierKey}-${people}`} className={`${s.foot} ${s.footIn}`}>
        {!inWindow
          ? 'Vale de quinta a domingo, em qualquer horário. Mude o dia para ganhar.'
          : next
            ? <>Faltam <b>{next.min - people}</b> {next.min - people === 1 ? 'pessoa' : 'pessoas'} para <b>{next.ganha}</b>.</>
            : 'Faixa máxima. Cortesia liberada na mesa, de quinta a domingo, em qualquer horário.'}
      </p>
    </section>
  );
}
