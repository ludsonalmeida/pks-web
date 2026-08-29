'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ensureAnalyticsReady } from '@/lib/analytics';

/* ─── Brand Tokens (paleta do criativo dos ads: preto + laranja + cream) ─── */
const G = {
  black:      '#0D0C0B',
  charcoal:   '#1A1714',
  darkRed:    '#8B1A1A',
  red:        '#C41E1E',
  brightRed:  '#E5342A',
  orange:     '#E78A19',
  orangeSoft: '#F5A94A',
  cream:      '#F5EDD8',
  creamDim:   'rgba(245,237,216,.78)',
  creamFaint: 'rgba(245,237,216,.55)',
  bone:       '#EDE3CC',
  white:      '#FFFFFF',
};
const display = 'var(--font-bebas), "Bebas Neue", "Arial Narrow", Impact, sans-serif';
const sans    = 'var(--font-barlow), Barlow, "DM Sans", system-ui, sans-serif';

/* ─── Meta Pixel ───────────────────────────────────────── */
const META_PIXEL_ID = '2431106123757946';

/* ─── Data ─────────────────────────────────────────────── */
const STATS = [
  { num: '10+',  label: 'cortes de porco' },
  { num: '8',    label: 'chopes na torneira' },
  { num: 'LIVE', label: 'música ao vivo toda semana' },
  { num: '0%',   label: 'sem couvert, sem taxa' },
];

const PROMO_TIERS = [
  { min: 5,  ganha: ['5 chopes Pilsen'], rot: -3 },
  { min: 8,  ganha: ['7 chopes Pilsen', '1 drink'], rot: 2 },
  { min: 10, ganha: ['9 chopes Pilsen', '1 petisco individual', '1 drink'], rot: 3 },
];

const BENEFITS = [
  { n: '01', title: 'Mesa garantida',       desc: 'Sem fila, sem espera. Você senta na hora.' },
  { n: '02', title: 'Reserva em segundos',  desc: 'Poucos cliques e pronto. Sem ligação, sem enrolação.' },
  { n: '03', title: 'Chope de cortesia',    desc: 'Reservou de quinta a domingo, a mesa já ganha chope.' },
  { n: '04', title: 'Perfeito pra grupos',  desc: 'Turma grande, mesa grande. Reserve o espaço certo.' },
  { n: '05', title: 'Porco do jeito certo', desc: 'Pururuca crocante, receita própria, chope gelado do lado.' },
  { n: '06', title: 'Localize sua reserva', desc: 'Perdeu o código? Consulta rápida, resolve na hora.' },
];

const OCASIOES = [
  { n: '01', label: 'Aniversários',       featured: true,  desc: 'Chama a galera e comemora com porco e chope.' },
  { n: '02', label: 'Confraternizações',  featured: false, desc: 'Fechou o projeto? Fecha a mesa com a equipe.' },
  { n: '03', label: 'Noite de Boteco',    featured: false, desc: 'Torresmo, costelinha e chope gelado, sem crise.' },
  { n: '04', label: 'Noite com Música',   featured: false, desc: 'Banda ao vivo, chope na mão, porco na mesa.' },
  { n: '05', label: 'Reunião de Família', featured: false, desc: 'Mesa grande, cardápio variado, todo mundo cabe.' },
  { n: '06', label: 'Sem Motivo',         featured: false, desc: 'Bateu fome? Já é motivo suficiente.' },
];

const MENU_ITEMS = [
  'Costelinha Porks','Torresmo Mineiro','Pururuca Clássica','Pernil Desfiado',
  'Barriga Crocante','Joelho Assado','Porks Fritas','Queijinho Empanadinho',
  'Calabresa de Boteco','Dadinho Especial','Chope Pilsen','Chope IPA',
  'Chope Stout','Caipirinha da Casa','Shot de Bacon','+ muito mais',
];

const CHIPS = [
  { icon: '🕐', text: 'Ter a Sex: 17h às 00h' },
  { icon: '🌙', text: 'Sáb: 12h às 02h' },
  { icon: '☀️', text: 'Dom: 12h às 22h' },
  { icon: '🎸', text: 'Música ao vivo' },
  { icon: '🍺', text: 'Sem couvert artístico' },
  { icon: '🐾', text: 'Pet friendly' },
];

/* ─── Icons ────────────────────────────────────────────── */
function CalIcon() {
  return (
    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function BeerIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
      <path d="M7 4h9v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4Z" />
      <path d="M16 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <line x1="10" y1="9" x2="10" y2="17" /><line x1="13" y1="9" x2="13" y2="17" />
    </svg>
  );
}

/* ─── Atoms ────────────────────────────────────────────── */
function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color, margin: '0 0 10px' }}>
      {children}
    </p>
  );
}

function SecTitle({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2rem,5vw,3.4rem)', lineHeight: 1.0, letterSpacing: '.04em', color: dark ? G.black : G.cream, textTransform: 'uppercase', margin: '0 0 18px' }}>
      {children}
    </h2>
  );
}

function HeroBtn({ href, children, primary }: { href: string; children: React.ReactNode; primary: boolean }) {
  return (
    <Link href={href} className="hero-btn" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      height: 56, padding: '0 32px', borderRadius: 6,
      fontFamily: sans, fontWeight: 800, fontSize: 15,
      textDecoration: 'none', letterSpacing: '.05em', whiteSpace: 'nowrap', textTransform: 'uppercase',
      transition: 'transform .15s, box-shadow .15s',
      ...(primary
        ? { background: G.orange, color: G.black, boxShadow: '0 6px 30px rgba(231,138,25,.45)' }
        : { background: 'transparent', color: G.cream, border: '2px solid rgba(245,237,216,.4)' }),
    }}>
      {children}
    </Link>
  );
}

function CtaBtn({ href, children, primary }: { href: string; children: React.ReactNode; primary: boolean }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      height: 56, padding: '0 36px', borderRadius: 6,
      fontFamily: sans, fontWeight: 800, fontSize: 16,
      textDecoration: 'none', letterSpacing: '.05em', whiteSpace: 'nowrap', textTransform: 'uppercase',
      flex: '1 1 auto', maxWidth: 320,
      transition: 'transform .15s',
      ...(primary
        ? { background: G.orange, color: G.black, boxShadow: '0 8px 32px rgba(231,138,25,.4)' }
        : { background: 'transparent', color: G.cream, border: '2px solid rgba(245,237,216,.35)' }),
    }}>
      {children}
    </Link>
  );
}

/* ─── Scroll Reveal (respeita prefers-reduced-motion) ──── */
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Rv({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(() => prefersReduced());
  useEffect(() => {
    if (v) return;
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: .08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [v]);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'none' : 'translateY(28px)',
      transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Promo Reservas Antecipadas (espelho do anúncio) ──── */
function Promo({ reservarHref }: { reservarHref: string }) {
  const [hoje, setHoje] = useState(false);
  useEffect(() => {
    const d = new Date().getDay(); // qui=4 sex=5 sáb=6 dom=0
    setHoje(d === 0 || d >= 4);
  }, []);

  return (
    <section className="grain" style={{ background: G.black, padding: 'clamp(72px,14vw,130px) clamp(16px,5vw,64px)', borderTop: `2px solid ${G.orange}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Rv>
          <Eyebrow color={G.orange}>Reserva antecipada</Eyebrow>
          <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2.8rem,9vw,5rem)', lineHeight: .95, letterSpacing: '.04em', textTransform: 'uppercase', color: G.cream, margin: '0 0 18px' }}>
            Reservou.<br /><span style={{ color: G.orange }}>Ganhou chope.</span>
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 22px', borderRadius: 4, background: G.orange, color: G.black, fontFamily: sans, fontSize: 13, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 44, transform: 'rotate(-1deg)' }}>
            {hoje ? 'Promo válida hoje · qui a dom' : 'De quinta a domingo'}
          </div>
        </Rv>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PROMO_TIERS.map((t, i) => (
            <Rv key={t.min} delay={i * 80} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,4vw,28px)', background: 'rgba(245,237,216,.04)', border: '1px solid rgba(231,138,25,.3)', borderRadius: 3, padding: 'clamp(16px,3vw,24px)', textAlign: 'left' }}>
              <div style={{ flexShrink: 0, width: 'clamp(88px,15vw,112px)', height: 'clamp(88px,15vw,112px)', borderRadius: '50%', border: `3px solid ${G.orange}`, outline: '1px dashed rgba(245,237,216,.45)', outlineOffset: 5, transform: `rotate(${t.rot}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontFamily: sans, fontSize: 'clamp(8px,1.4vw,10px)', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: G.creamDim }}>A partir de</span>
                <span style={{ fontFamily: display, fontSize: 'clamp(2.4rem,6vw,3.2rem)', lineHeight: 1, color: G.orange }}>{t.min}</span>
              </div>
              <div>
                <div style={{ fontFamily: sans, fontSize: 'clamp(11px,1.8vw,13px)', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: G.creamFaint, marginBottom: 6 }}>Pessoas ganham</div>
                <div style={{ fontFamily: display, fontSize: 'clamp(1.5rem,4.5vw,2.3rem)', lineHeight: 1.05, letterSpacing: '.03em', textTransform: 'uppercase', color: G.orange }}>{t.ganha[0]}</div>
                {t.ganha.slice(1).map(g => (
                  <div key={g} style={{ fontFamily: display, fontSize: 'clamp(1.1rem,3.2vw,1.5rem)', lineHeight: 1.15, letterSpacing: '.03em', textTransform: 'uppercase', color: G.cream }}>+ {g}</div>
                ))}
              </div>
            </Rv>
          ))}
        </div>

        <Rv delay={280}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 44 }}>
            <CtaBtn href={reservarHref} primary={true}><BeerIcon />Reservar e ganhar chope</CtaBtn>
          </div>
          <p style={{ fontFamily: sans, fontSize: 12, color: G.creamFaint, letterSpacing: '.04em', marginTop: 18, lineHeight: 1.6 }}>
            Cortesia liberada na mesa, de acordo com o tamanho do grupo. Válida pra reserva antecipada de quinta a domingo, com chegada entre 17h e 19h30.
          </p>
        </Rv>
      </div>
    </section>
  );
}

/* ─── Sobre ────────────────────────────────────────────── */
function Sobre() {
  const refL = useRef<HTMLDivElement>(null);
  const refR = useRef<HTMLDivElement>(null);
  const [vL, setVL] = useState(() => prefersReduced());
  const [vR, setVR] = useState(() => prefersReduced());

  useEffect(() => {
    if (vL && vR) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target === refL.current && e.isIntersecting) setVL(true);
        if (e.target === refR.current && e.isIntersecting) setVR(true);
      });
    }, { threshold: .1 });
    if (refL.current) obs.observe(refL.current);
    if (refR.current) obs.observe(refR.current);
    return () => obs.disconnect();
  }, [vL, vR]);

  return (
    <section style={{ background: G.bone, color: G.black, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="sobre-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* painel tipográfico */}
          <div ref={refL} className="sobre-imgs grain" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 10,
            borderRadius: 3, overflow: 'hidden', position: 'relative',
            opacity: vL ? 1 : 0, transform: vL ? 'none' : 'translateX(-36px)',
            transition: 'opacity .7s ease, transform .7s ease',
          }}>
            <div style={{ gridRow: 'span 2', background: `linear-gradient(160deg,${G.darkRed},${G.black})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
              <span style={{ fontFamily: display, fontSize: 'clamp(48px,6vw,64px)', color: G.orange, lineHeight: 1, letterSpacing: '.04em' }}>PORKS</span>
              <span style={{ fontFamily: sans, fontSize: 12, color: 'rgba(255,255,255,.6)', letterSpacing: '.15em', textTransform: 'uppercase', textAlign: 'center' }}>Porco & Chope & Rock</span>
              <span style={{ fontFamily: display, fontSize: 26, color: 'transparent', WebkitTextStroke: '1.5px rgba(245,237,216,.4)', letterSpacing: '.1em', marginTop: 6 }}>SOBRADINHO</span>
            </div>
            <div style={{ background: G.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: display, fontSize: 56, color: G.black, lineHeight: 1 }}>8</span>
              <span style={{ fontFamily: display, fontSize: 20, color: G.black, letterSpacing: '.08em' }}>CHOPES</span>
              <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(13,12,11,.7)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>na torneira</span>
            </div>
            <div style={{ background: G.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: display, fontSize: 30, color: 'transparent', WebkitTextStroke: `1.5px ${G.orange}`, letterSpacing: '.08em' }}>AO VIVO</span>
              <span style={{ fontFamily: display, fontSize: 18, color: G.cream, letterSpacing: '.08em' }}>MÚSICA</span>
              <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.1em' }}>toda semana</span>
            </div>
          </div>

          {/* texto */}
          <div ref={refR} style={{ opacity: vR ? 1 : 0, transform: vR ? 'none' : 'translateX(36px)', transition: 'opacity .7s ease, transform .7s ease' }}>
            <Eyebrow color={G.orange}>O que é o Porks?</Eyebrow>
            <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2rem,4.5vw,3rem)', lineHeight: 1.0, letterSpacing: '.04em', margin: '0 0 20px', color: G.black, textTransform: 'uppercase' }}>
              Porco, Chope<br />e Rock em<br />Sobradinho.
            </h2>
            <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1rem)', lineHeight: 1.75, color: '#3d3a35', marginBottom: 28 }}>
              O Porks chegou pra Sobradinho com porco de verdade, chope gelado e música ao vivo.
              Sem couvert artístico, sem 10%, sem enrolação. Boteco raiz, do jeito que tem que ser.
            </p>
            {[
              'Sobradinho, Brasília DF. Perto de você, do jeito que você gosta.',
              'Mais de 10 cortes de porco: costelinha, torresmo, pururuca, pernil e outros clássicos de boteco.',
              '8 chopes na torneira, sem taxa de serviço. Você pede, a gente traz gelado.',
              'Música ao vivo toda semana. Rock, blues e o que rolar na programação.',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14, borderLeft: `3px solid ${G.orange}`, paddingLeft: 14 }}>
                <span style={{ fontFamily: sans, fontSize: 'clamp(.85rem,2vw,.95rem)', lineHeight: 1.6, color: '#33302b' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Ambiente ─────────────────────────────────────────── */
function Ambiente() {
  const cells = [
    { col: '1/6',  row: '1/2', bg: `linear-gradient(135deg,${G.darkRed},${G.black})`,   label: 'Porco & Chope & Rock', sub: 'a vibe do Porks',   cls: 'amb-cell' },
    { col: '6/9',  row: '1/2', bg: `linear-gradient(135deg,${G.orange},${G.darkRed})`,  label: 'Galera & Chope',       sub: '8 torneiras',       cls: 'amb-cell' },
    { col: '9/13', row: '1/3', bg: `linear-gradient(160deg,${G.black},${G.darkRed})`,   label: 'Música ao vivo',       sub: 'toda semana',       cls: 'amb-cell amb-cell-wide' },
    { col: '1/4',  row: '2/3', bg: `linear-gradient(135deg,${G.charcoal},${G.darkRed})`,label: 'Momentos especiais',   sub: 'reserve já',        cls: 'amb-cell' },
    { col: '4/9',  row: '2/3', bg: `linear-gradient(135deg,${G.darkRed},${G.charcoal})`,label: 'Sem couvert. Sem 10%.', sub: 'boteco de verdade', cls: 'amb-cell' },
  ];

  return (
    <section style={{ background: G.charcoal, padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <Rv style={{ textAlign: 'center', marginBottom: 44 }}>
          <Eyebrow color={G.orange}>O ambiente</Eyebrow>
          <SecTitle>Boteco do jeito que tem que ser</SecTitle>
          <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, color: G.creamDim, maxWidth: 520, margin: '0 auto' }}>
            Ambiente rústico, sem frescura, com aquela energia de boteco que você só acha quando o lugar é de verdade.
          </p>
        </Rv>
        <Rv>
          <div className="amb-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: '200px 200px', gap: 10 }}>
            {cells.map(m => (
              <div
                key={m.label}
                className={`${m.cls} grain`}
                style={{ gridColumn: m.col, gridRow: m.row, borderRadius: 3, overflow: 'hidden', position: 'relative', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, border: '1px solid rgba(245,237,216,.08)', transition: 'transform .4s ease', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <span style={{ fontFamily: display, fontSize: 'clamp(20px,3vw,30px)', color: G.cream, letterSpacing: '.06em', textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.05, padding: '0 12px', position: 'relative', zIndex: 2 }}>{m.label}</span>
                <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(245,237,216,.6)', textTransform: 'uppercase', letterSpacing: '.12em', position: 'relative', zIndex: 2 }}>{m.sub}</span>
              </div>
            ))}
          </div>
        </Rv>
      </div>
    </section>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export default function Home() {
  useEffect(() => {
    const debug = process.env.NODE_ENV !== 'production';
    ensureAnalyticsReady({ debug });
  }, []);

  // query string preservada nos links internos (UTMs dos ads chegam ao /reservar)
  const [query, setQuery] = useState('');
  useEffect(() => {
    setQuery(window.location.search || '');
  }, []);

  const withQuery = useMemo(() => (basePath: string) => {
    if (!query) return basePath;
    const cleanQuery = query.replace(/^\?/, '');
    if (!cleanQuery) return basePath;
    const hasHash = basePath.includes('#');
    if (!hasHash) return `${basePath}${basePath.includes('?') ? '&' : '?'}${cleanQuery}`;
    const [path, hash] = basePath.split('#');
    return `${path}${path.includes('?') ? '&' : '?'}${cleanQuery}#${hash}`;
  }, [query]);

  const [fabVisible, setFabVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Meta Pixel: PageView no load + SPA (Next Link) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fire = () => {
      const fbq = (window as any).fbq;
      if (typeof fbq === 'function') fbq('track', 'PageView');
    };

    fire();
    window.addEventListener('popstate', fire);

    const _pushState = history.pushState;
    const _replaceState = history.replaceState;

    history.pushState = function (...args) {
      const ret = _pushState.apply(this, args as any);
      fire();
      return ret;
    };

    history.replaceState = function (...args) {
      const ret = _replaceState.apply(this, args as any);
      fire();
      return ret;
    };

    return () => {
      window.removeEventListener('popstate', fire);
      history.pushState = _pushState;
      history.replaceState = _replaceState;
    };
  }, []);

  return (
    <>
      {/* ───────────────── Meta Pixel ───────────────── */}
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* noscript fallback */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:none} }
        @keyframes flicker  { 0%,100%{opacity:1}48%{opacity:1}50%{opacity:.6}52%{opacity:1}80%{opacity:.85}82%{opacity:1} }
        @keyframes pulseOrange { 0%,100%{box-shadow:0 0 0 0 rgba(231,138,25,.55)}70%{box-shadow:0 0 0 14px rgba(231,138,25,0)} }

        /* Bebas nos títulos da home (vence o Merriweather !important do layout global) */
        .pk-home h1, .pk-home h2, .pk-home h3, .pk-home h4 {
          font-family: var(--font-bebas), "Bebas Neue", "Arial Narrow", Impact, sans-serif !important;
          font-weight: 400 !important;
          letter-spacing: .04em !important;
        }

        /* grain: textura de ruído nas superfícies escuras */
        .grain::before {
          content: '';
          position: absolute; inset: 0;
          pointer-events: none; z-index: 1;
          opacity: .18; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .hero-badge  { animation: fadeDown .6s ease forwards; }
        .hero-logo   { animation: flicker 8s infinite, fadeDown .6s .1s ease forwards; opacity:0; animation-fill-mode:forwards; }
        .hero-h1     { animation: fadeUp .8s .2s ease forwards; opacity:0; }
        .hero-sub    { animation: fadeUp .8s .35s ease forwards; opacity:0; }
        .hero-ctas   { animation: fadeUp .8s .5s ease forwards; opacity:0; }
        .trust-strip { animation: fadeUp .8s .6s ease forwards; opacity:0; }
        .hero-ribbon { animation: fadeUp .8s .65s ease forwards; opacity:0; }

        .hero-btn:hover  { transform:translateY(-1px) !important; }
        .hero-btn:active { transform:scale(.98) !important; }

        /* FAB */
        .fab { position:fixed; bottom:24px; right:20px; z-index:999; display:flex; transition:opacity .3s ease,transform .3s ease; }
        .fab.hidden { opacity:0; pointer-events:none; transform:translateY(12px); }
        .fab a { display:flex; align-items:center; gap:10px; height:52px; padding:0 22px; border-radius:6px; background:${G.orange}; color:${G.black}; font-family:${sans}; font-weight:800; font-size:14px; text-decoration:none; text-transform:uppercase; letter-spacing:.05em; box-shadow:0 6px 28px rgba(231,138,25,.55); animation:pulseOrange 2s ease-out 3; white-space:nowrap; }

        /* reduced motion: corta animações e transições */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
          .hero-logo, .hero-h1, .hero-sub, .hero-ctas, .trust-strip, .hero-ribbon { opacity: 1 !important; }
        }

        /* mobile */
        @media (max-width:768px) {
          .hero-h1     { font-size:clamp(3rem,15vw,4.2rem) !important; }
          .hero-ctas   { flex-direction:column !important; }
          .hero-btn    { width:100% !important; }
          .hero-ribbon { grid-template-columns:repeat(2,1fr) !important; }
          .sobre-grid  { grid-template-columns:1fr !important; gap:32px !important; }
          .sobre-imgs  { grid-template-rows:160px 160px !important; }
          .amb-grid    { grid-template-columns:1fr 1fr !important; grid-template-rows:150px 150px !important; }
          .amb-cell    { grid-column:auto !important; grid-row:auto !important; }
          .amb-cell-wide { display:none !important; }
          .ocas-grid   { grid-template-columns:1fr !important; }
          .benef-grid  { grid-template-columns:1fr !important; }
          .menu-grid   { grid-template-columns:repeat(2,1fr) !important; }
          .cta-btns    { flex-direction:column !important; align-items:stretch !important; }
          .cta-tags    { display:none !important; }
        }
        @media (max-width:480px) {
          .menu-grid  { grid-template-columns:1fr !important; }
          .sobre-imgs { grid-template-rows:130px 130px !important; }
        }
        @media (min-width:769px) { .fab { display:none !important; } }
      `}</style>

      <main className="pk-home" style={{ fontFamily: sans, color: G.cream, background: G.black }}>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="grain" style={{
          position: 'relative', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', overflow: 'hidden',
          padding: 'clamp(60px,8vw,90px) clamp(16px,4vw,48px) clamp(110px,14vw,140px)',
        }}>
          {/* fallback de luzes de bar enquanto o vídeo carrega */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `radial-gradient(ellipse 70% 55% at 18% 12%,rgba(139,26,26,.85) 0%,transparent 58%),radial-gradient(ellipse 45% 40% at 82% 18%,rgba(231,138,25,.28) 0%,transparent 55%),radial-gradient(ellipse 60% 65% at 85% 85%,rgba(196,30,30,.5) 0%,transparent 55%),${G.black}` }} />

          {/* vídeo do bar (YouTube) — mais visível: opacity alta + vinheta seletiva */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
            <iframe
              src="https://www.youtube.com/embed/rajCPpAG62A?si=cW2vRpmcx4ErkdMd&autoplay=1&mute=1&loop=1&playlist=rajCPpAG62A&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
              allow="autoplay; fullscreen"
              title="Porks Sobradinho"
              style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.78vh', transform: 'translate(-50%,-50%)', opacity: .75, border: 'none' }}
            />
          </div>

          {/* vinheta seletiva: escura nas bordas e no rodapé (onde tem texto), bar visível no centro */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(13,12,11,.95) 0%, transparent 60%), linear-gradient(to bottom, rgba(13,12,11,.55) 0%, rgba(13,12,11,.18) 35%, rgba(13,12,11,.9) 100%)', pointerEvents: 'none' }} />
          {/* bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, zIndex: 3, background: 'linear-gradient(to bottom,transparent,#0D0C0B)', pointerEvents: 'none' }} />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 6, maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 4, border: '1px solid rgba(231,138,25,.5)', background: 'rgba(13,12,11,.6)', backdropFilter: 'blur(12px)', fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: G.orange, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.brightRed, flexShrink: 0, display: 'inline-block' }} />
              Porco & Chope & Rock · Sobradinho, DF
            </div>

            <div className="hero-logo" style={{ fontFamily: display, fontSize: 'clamp(56px,12vw,96px)', color: G.cream, letterSpacing: '.06em', lineHeight: 1, textShadow: '0 0 80px rgba(231,138,25,.5),0 4px 40px rgba(0,0,0,.9)' }}>
              PORKS
            </div>
            <div style={{ fontFamily: sans, fontSize: 'clamp(10px,2vw,13px)', letterSpacing: '.3em', textTransform: 'uppercase', color: G.orange, marginTop: 4, marginBottom: 'clamp(16px,3vw,24px)', textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
              SOBRADINHO · BRASÍLIA
            </div>

            <h1 className="hero-h1" style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(3rem,9vw,5.6rem)', lineHeight: .95, letterSpacing: '.04em', textTransform: 'uppercase', textShadow: '0 2px 40px rgba(0,0,0,.9)', margin: 0, width: '100%' }}>
              Reserve.<br />
              <span style={{ color: G.orange }}>Ganhe chope</span><br />
              <span style={{ color: 'transparent', WebkitTextStroke: `2px ${G.cream}` }}>de graça.</span>
            </h1>

            <p className="hero-sub" style={{ fontFamily: sans, fontSize: 'clamp(.95rem,2.2vw,1.1rem)', lineHeight: 1.7, color: G.creamDim, maxWidth: 520, marginTop: 24, textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
              De quinta a domingo, reserva antecipada já garante chope de cortesia.<br />
              É só chegar e sentar.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 36, width: '100%' }}>
              <HeroBtn href={withQuery('/reservar')} primary={true}><BeerIcon /> Quero meu chope</HeroBtn>
              <HeroBtn href={withQuery('/consultar')} primary={false}><SearchIcon /> Localizar reserva</HeroBtn>
            </div>

            <div className="trust-strip" style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', fontFamily: sans, fontSize: 12, fontWeight: 600, color: G.creamDim, letterSpacing: '.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>
              <span>Sem fila</span><span>Sem couvert artístico</span><span>Sem 10%</span>
            </div>
          </div>

          {/* stats ribbon */}
          <div className="hero-ribbon" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 7, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '10px 16px', background: 'rgba(13,12,11,.9)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(231,138,25,.4)' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 8px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                <span style={{ fontFamily: display, fontSize: 'clamp(1rem,3vw,1.8rem)', color: G.orange, lineHeight: 1, letterSpacing: '.04em' }}>{s.num}</span>
                <span style={{ fontFamily: sans, fontSize: 'clamp(8px,1.4vw,10px)', color: G.creamFaint, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ PROMO RESERVAS ANTECIPADAS ════════════════════ */}
        <Promo reservarHref={withQuery('/reservar')} />

        {/* ══ BENEFÍCIOS (reforço logo após a promo) ════════ */}
        <section style={{ background: G.bone, color: G.black, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ marginBottom: 44 }}>
              <Eyebrow color={G.orange}>Por que reservar?</Eyebrow>
              <SecTitle dark>Reserve e chegue direto pra mesa</SecTitle>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, color: '#4a463f', maxWidth: 480 }}>
                O Porks enche rápido. Reserve e evite a decepção de chegar e não ter mesa.
              </p>
            </Rv>
            <div className="benef-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
              {BENEFITS.map((b, i) => (
                <Rv key={b.title} delay={i * 60} style={{ background: G.white, borderRadius: 3, padding: '26px 24px', border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 2px 20px rgba(0,0,0,.06)', borderLeft: `4px solid ${G.orange}` }}>
                  <div style={{ fontFamily: display, fontSize: 34, color: 'transparent', WebkitTextStroke: `1.5px ${G.orange}`, lineHeight: 1, marginBottom: 12 }}>{b.n}</div>
                  <h3 style={{ fontFamily: display, fontWeight: 400, fontSize: 20, letterSpacing: '.04em', textTransform: 'uppercase', color: G.black, margin: '0 0 8px' }}>{b.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.7, color: '#4f4b44', margin: 0 }}>{b.desc}</p>
                </Rv>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SOBRE ═════════════════════════════════════════ */}
        <Sobre />

        {/* ══ AMBIENTE ══════════════════════════════════════ */}
        <Ambiente />

        {/* ══ OCASIÕES ══════════════════════════════════════ */}
        <section style={{ background: G.black, padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ textAlign: 'center', marginBottom: 44 }}>
              <Eyebrow color={G.orange}>Toda ocasião tem seu porco</Eyebrow>
              <SecTitle>Motivo é o que não falta</SecTitle>
            </Rv>
            <div className="ocas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
              {OCASIOES.map((o, i) => (
                <Rv key={o.label} delay={i * 60} style={{ background: o.featured ? `linear-gradient(135deg,${G.darkRed},${G.black})` : 'rgba(245,237,216,.04)', border: `1px solid ${o.featured ? 'rgba(231,138,25,.5)' : 'rgba(245,237,216,.1)'}`, borderRadius: 3, overflow: 'hidden', padding: '24px 22px', textAlign: 'left' }}>
                  <div style={{ fontFamily: display, fontSize: 30, color: 'transparent', WebkitTextStroke: `1.5px ${o.featured ? G.orange : 'rgba(245,237,216,.35)'}`, lineHeight: 1, marginBottom: 12 }}>{o.n}</div>
                  <h3 style={{ fontFamily: display, fontWeight: 400, fontSize: 22, letterSpacing: '.06em', textTransform: 'uppercase', color: o.featured ? G.orange : G.cream, margin: '0 0 8px' }}>{o.label}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.7, color: G.creamDim, margin: 0 }}>{o.desc}</p>
                </Rv>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CARDÁPIO ══════════════════════════════════════ */}
        <section style={{ background: G.charcoal, padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ textAlign: 'center', marginBottom: 44 }}>
              <Eyebrow color={G.orange}>O cardápio</Eyebrow>
              <SecTitle>Porco de todo jeito</SecTitle>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, color: G.creamDim, maxWidth: 520, margin: '0 auto' }}>
                Mais de 10 cortes de porco, 8 chopes na torneira e petisco de boteco raiz. Sem couvert, sem 10%.
              </p>
            </Rv>
            <Rv>
              <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
                {MENU_ITEMS.map(r => (
                  <div key={r} style={{ background: 'rgba(245,237,216,.06)', border: '1px solid rgba(245,237,216,.08)', borderRadius: 3, padding: '11px 16px', fontFamily: sans, fontSize: 13, fontWeight: 600, textAlign: 'center', color: G.creamDim, letterSpacing: '.03em' }}>{r}</div>
                ))}
              </div>
            </Rv>
            <Rv>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 44, justifyContent: 'center' }}>
                {CHIPS.map(c => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,237,216,.05)', border: '1px solid rgba(245,237,216,.08)', borderRadius: 3, padding: '9px 16px', fontFamily: sans, fontSize: 13, fontWeight: 600, color: G.creamDim, letterSpacing: '.04em' }}>
                    <span>{c.icon}</span>{c.text}
                  </div>
                ))}
              </div>
            </Rv>
          </div>
        </section>

        {/* ══ CTA FINAL ═════════════════════════════════════ */}
        <section className="grain" style={{ background: G.black, textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(72px,12vw,130px) clamp(16px,5vw,64px)', borderTop: `2px solid ${G.orange}` }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontFamily: display, fontSize: 'clamp(120px,25vw,280px)', color: 'transparent', WebkitTextStroke: '1px rgba(231,138,25,.08)', letterSpacing: '.06em', userSelect: 'none', lineHeight: 1 }}>PORKS</span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto' }}>
            <Rv>
              <div style={{ width: 108, height: 108, margin: '0 auto 24px', borderRadius: '50%', border: `3px solid ${G.orange}`, outline: '1px dashed rgba(245,237,216,.4)', outlineOffset: 5, transform: 'rotate(-4deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontFamily: display, fontSize: 40, color: G.orange, lineHeight: 1, letterSpacing: '.04em' }}>P&C</span>
                <span style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: G.creamDim }}>Porco & Chope</span>
              </div>
            </Rv>
            <Rv delay={80}>
              <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2.2rem,7vw,4rem)', lineHeight: .95, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '.04em', color: G.cream }}>
                Bora garantir<br /><span style={{ color: G.orange }}>sua mesa?</span>
              </h2>
            </Rv>
            <Rv delay={160}>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.1rem)', color: G.creamDim, marginBottom: 40, lineHeight: 1.7 }}>
                Reserve de quinta a domingo e a cortesia já entra na conta: chope pra galera toda, sem custo extra. Chegue com o lugar garantido e o chope esperando.
              </p>
            </Rv>
            <Rv delay={240}>
              <div className="cta-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                <CtaBtn href={withQuery('/reservar')} primary={true}><CalIcon />Garantir minha mesa</CtaBtn>
                <CtaBtn href={withQuery('/consultar')} primary={false}><SearchIcon />Localizar reserva</CtaBtn>
              </div>
            </Rv>
            <Rv delay={320}>
              <div className="cta-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
                {['Chope de cortesia', 'Sem fila', 'Sem couvert', 'Sem 10%'].map(t => (
                  <span key={t} style={{ background: 'rgba(245,237,216,.07)', border: '1px solid rgba(245,237,216,.1)', borderRadius: 3, padding: '5px 14px', fontFamily: sans, fontSize: 12, fontWeight: 600, color: G.creamDim, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t}</span>
                ))}
              </div>
            </Rv>
            <p style={{ fontFamily: sans, marginTop: 36, fontSize: 12, color: 'rgba(245,237,216,.4)', letterSpacing: '.06em' }}>
              Dúvida? Fala com a equipe do Porks na chegada.
            </p>
          </div>
        </section>
      </main>

      {/* ══ FAB mobile ════════════════════════════════════ */}
      <div className={`fab${fabVisible ? '' : ' hidden'}`}>
        <Link href={withQuery('/reservar')}>
          <BeerIcon size={16} /> Reserve e ganhe chope
        </Link>
      </div>
    </>
  );
}
