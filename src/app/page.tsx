'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ensureAnalyticsReady } from '@/lib/analytics';

/* ─── Brand Tokens ─────────────────────────────────────── */
const G = {
  black:      '#0D0C0B',
  charcoal:   '#1A1714',
  darkRed:    '#8B1A1A',
  red:        '#C41E1E',
  brightRed:  '#E5342A',
  amber:      '#D97C0A',
  amberLight: '#F5A623',
  cream:      '#F5EDD8',
  bone:       '#EDE3CC',
  white:      '#FFFFFF',
};
const display = '"Bebas Neue", "Impact", "Arial Black", sans-serif';
const sans    = '"Barlow", "DM Sans", system-ui, sans-serif';

/* ─── Data ─────────────────────────────────────────────── */
const STATS = [
  { num: '🐷', label: 'Porco & Chope & Rock' },
  { num: '10+', label: 'Cortes de Porco' },
  { num: '8',   label: 'Chopes na torneira' },
  { num: '🎸',  label: 'Música ao vivo' },
];

const OCASIOES = [
  { emoji: '🎂', label: 'Aniversários',       featured: true,  desc: 'Chame a galera e celebra do jeito certo. O Porks cuida da chapa, da cerveja e da memória que vai ficar.' },
  { emoji: '🥂', label: 'Confraternizações',  featured: false, desc: 'Final de projeto, conquista ou só porque chegou sexta. Espaço pra turmas grandes com o melhor porco da cidade.' },
  { emoji: '🍺', label: 'Noite de Boteco',    featured: false, desc: 'Torresmo, costelinha e chope gelado. A combinação perfeita pra uma noite memorável em Sobradinho.' },
  { emoji: '🎸', label: 'Noite com Música',   featured: false, desc: 'Rock na veia, chopp na mão e porco na mesa. Vem curtir a programação ao vivo do Porks.' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Reunião de Família', featured: false, desc: 'Ambiente descontraído pra todas as idades. Cardápio variado e espaço pra família toda caber.' },
  { emoji: '🏆', label: 'Sem Motivo',         featured: false, desc: 'Não precisa de ocasião especial pra comer bem. Chega, pede um porco e aproveita Sobradinho.' },
];

const BENEFITS = [
  { icon: '🪑', title: 'Mesa garantida',       desc: 'Sem fila, sem espera. Você chega e senta. O Porks tá esperando por você.' },
  { icon: '⚡', title: 'Reserva em segundos',  desc: 'Confirme rápido, receba o código e planeje sua noite com tranquilidade.' },
  { icon: '🔍', title: 'Localize sua reserva', desc: 'Perdeu o código? Sem estresse. Consulte a qualquer hora pelo site.' },
  { icon: '🎉', title: 'Perfeito pra grupos',  desc: 'Reserve espaço pra turma inteira. Quanto mais gente, melhor fica.' },
  { icon: '🐷', title: 'Porco do jeito certo', desc: 'Receitas exclusivas, pururuca crocante e chope gelado na mesma mesa.' },
  { icon: '🎸', title: 'Experiência completa', desc: 'Música, comida, bebida. A noite começa quando você reserva sua mesa no Porks.' },
];

const MENU_ITEMS = [
  'Costelinha Porks','Torresmo Mineiro','Pururuca Clássica','Pernil Desfiado',
  'Barriga Crocante','Joelho Assado','Porks Fritas','Queijinho Empanadinho',
  'Calabresa de Boteco','Dadinho Especial','Chope Pilsen','Chope IPA',
  'Chope Stout','Caipirinha da Casa','Shot de Bacon','+ muito mais',
];

const CHIPS = [
  { icon: '🕐', text: 'Ter–Sex: 17h às 00h' },
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

/* ─── Atoms ────────────────────────────────────────────── */
function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color, marginBottom: 10, margin: '0 0 10px' }}>
      {children}
    </p>
  );
}

function SecTitle({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2rem,5vw,3.4rem)', lineHeight: 1.0, letterSpacing: '.04em', marginBottom: 18, color: dark ? G.black : G.white, textTransform: 'uppercase', margin: '0 0 18px' }}>
      {children}
    </h2>
  );
}

function HeroBtn({ href, children, primary }: { href: string; children: React.ReactNode; primary: boolean }) {
  return (
    <Link href={href} className="hero-btn" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      height: 54, padding: '0 32px', borderRadius: 6,
      fontFamily: sans, fontWeight: 700, fontSize: 15,
      textDecoration: 'none', letterSpacing: '.05em', whiteSpace: 'nowrap', textTransform: 'uppercase',
      transition: 'transform .15s, box-shadow .15s',
      ...(primary
        ? { background: G.brightRed, color: G.white, boxShadow: '0 6px 30px rgba(229,52,42,.5)' }
        : { background: 'transparent', color: G.white, border: '2px solid rgba(255,255,255,.4)' }),
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
      fontFamily: sans, fontWeight: 700, fontSize: 16,
      textDecoration: 'none', letterSpacing: '.05em', whiteSpace: 'nowrap', textTransform: 'uppercase',
      flex: '1 1 auto', maxWidth: 300,
      transition: 'transform .15s',
      ...(primary
        ? { background: G.brightRed, color: G.white, boxShadow: '0 8px 32px rgba(229,52,42,.5)' }
        : { background: 'transparent', color: G.white, border: '2px solid rgba(255,255,255,.35)' }),
    }}>
      {children}
    </Link>
  );
}

/* ─── Scroll Reveal ────────────────────────────────────── */
function Rv({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: .08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
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

/* ─── Sobre ────────────────────────────────────────────── */
function Sobre() {
  const refL = useRef<HTMLDivElement>(null);
  const refR = useRef<HTMLDivElement>(null);
  const [vL, setVL] = useState(false);
  const [vR, setVR] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target === refL.current && e.isIntersecting) setVL(true);
        if (e.target === refR.current && e.isIntersecting) setVR(true);
      });
    }, { threshold: .1 });
    if (refL.current) obs.observe(refL.current);
    if (refR.current) obs.observe(refR.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ background: G.bone, color: G.black, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,.04) 40px)' }} />
      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="sobre-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* image collage */}
          <div ref={refL} className="sobre-imgs" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 10,
            borderRadius: 4, overflow: 'hidden',
            opacity: vL ? 1 : 0, transform: vL ? 'none' : 'translateX(-36px)',
            transition: 'opacity .7s ease, transform .7s ease',
          }}>
            <div style={{ gridRow: 'span 2', background: `linear-gradient(160deg,${G.darkRed},${G.black})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
              <span style={{ fontFamily: display, fontSize: 64, color: G.amberLight, lineHeight: 1 }}>PORKS</span>
              <span style={{ fontFamily: sans, fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '.15em', textTransform: 'uppercase', textAlign: 'center' }}>Porco & Chope & Rock</span>
              <div style={{ color: G.amberLight, fontSize: 40, marginTop: 8 }}>🐷</div>
            </div>
            <div style={{ background: G.brightRed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 48 }}>🍺</span>
              <span style={{ fontFamily: display, fontSize: 22, color: G.white, letterSpacing: '.08em' }}>8 CHOPES</span>
              <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>na torneira</span>
            </div>
            <div style={{ background: G.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 48 }}>🎸</span>
              <span style={{ fontFamily: display, fontSize: 18, color: G.amberLight, letterSpacing: '.08em' }}>MÚSICA AO VIVO</span>
              <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>toda semana</span>
            </div>
          </div>

          {/* text */}
          <div ref={refR} style={{ opacity: vR ? 1 : 0, transform: vR ? 'none' : 'translateX(36px)', transition: 'opacity .7s ease, transform .7s ease' }}>
            <Eyebrow color={G.red}>O que é o Porks?</Eyebrow>
            <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2rem,4.5vw,3rem)', lineHeight: 1.0, letterSpacing: '.04em', margin: '0 0 20px', color: G.black, textTransform: 'uppercase' }}>
              Porco, Chope<br />e Rock em<br />Sobradinho.
            </h2>
            <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1rem)', lineHeight: 1.75, color: '#444', marginBottom: 28 }}>
              O Porks chegou pra trazer o que Sobradinho estava precisando: porco de verdade, chope gelado e música boa.
              Sem frescura, sem 10%, sem couvert. O melhor boteco da cidade agora pertinho de você.
            </p>
            {[
              { icon: '📍', text: 'Localizado em Sobradinho, Brasília — DF. O melhor ponto pra encontrar a galera.' },
              { icon: '🐷', text: 'Mais de 10 cortes de porco: costelinha, torresmo, pururuca, pernil e muito mais.' },
              { icon: '🍺', text: '8 chopes na torneira incluindo Pilsen, IPA e Stout. E sem taxa de serviço.' },
              { icon: '🎸', text: 'Programação musical toda semana. Rock, samba, MPB e o que rolar.' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 6, background: G.black, color: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginTop: 1 }}>{item.icon}</span>
                <span style={{ fontFamily: sans, fontSize: 'clamp(.85rem,2vw,.95rem)', lineHeight: 1.6, color: '#333' }}>{item.text}</span>
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
    { col: '1/6',  row: '1/2', bg: `linear-gradient(135deg,${G.darkRed},${G.black})`,   emoji: '🐷', label: 'Jazz & Blues & Rock & Chope', sub: 'a vibe do Porks',   cls: 'amb-cell' },
    { col: '6/9',  row: '1/2', bg: `linear-gradient(135deg,${G.amber},${G.darkRed})`,    emoji: '🍺', label: 'Galera & Chope',              sub: '8 torneiras',       cls: 'amb-cell' },
    { col: '9/13', row: '1/3', bg: `linear-gradient(160deg,${G.black},${G.darkRed})`,    emoji: '🎸', label: 'Música ao vivo',               sub: 'toda semana',       cls: 'amb-cell amb-cell-wide' },
    { col: '1/4',  row: '2/3', bg: `linear-gradient(135deg,${G.charcoal},${G.darkRed})`, emoji: '🎂', label: 'Momentos especiais',            sub: 'reserve já',        cls: 'amb-cell' },
    { col: '4/9',  row: '2/3', bg: `linear-gradient(135deg,${G.darkRed},${G.amber})`,    emoji: '🌆', label: 'Sem couvert. Sem taxa.',        sub: 'boteco de verdade', cls: 'amb-cell' },
  ];

  return (
    <section style={{ background: G.charcoal, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <Rv style={{ textAlign: 'center', marginBottom: 52 }}>
          <Eyebrow color={G.amberLight}>O ambiente</Eyebrow>
          <SecTitle>Boteco do jeito que tem que ser</SecTitle>
          <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, opacity: .65, maxWidth: 520, margin: '0 auto' }}>
            Ambiente rústico, sem frescura, com aquela energia de boteco que você só acha quando o lugar é de verdade.
          </p>
        </Rv>
        <Rv>
          <div className="amb-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: '220px 220px', gap: 10 }}>
            {cells.map(m => (
              <div
                key={m.label}
                className={m.cls}
                style={{ gridColumn: m.col, gridRow: m.row, borderRadius: 6, overflow: 'hidden', position: 'relative', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, border: '1px solid rgba(255,255,255,.06)', transition: 'transform .4s ease', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <span style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>{m.emoji}</span>
                <span style={{ fontFamily: display, fontSize: 'clamp(14px,2vw,20px)', color: G.white, letterSpacing: '.06em', textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.1, padding: '0 12px' }}>{m.label}</span>
                <span style={{ fontFamily: sans, fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{m.sub}</span>
              </div>
            ))}
          </div>
        </Rv>
      </div>
    </section>
  );
}

/* ─── Skeleton ─────────────────────────────────────────── */
function HomeSkeleton() {
  return <div style={{ minHeight: '100dvh', background: G.black }} />;
}

/* ─── Main ─────────────────────────────────────────────── */
export default function Home() {
  useEffect(() => {
    const debug = process.env.NODE_ENV !== 'production';
    ensureAnalyticsReady({ debug });
  }, []);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setHydrated(true), 250);
    return () => clearTimeout(id);
  }, []);

  const query = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.search || '';
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

  if (!hydrated) return <HomeSkeleton />;

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:none} }
        @keyframes flicker  { 0%,100%{opacity:1}48%{opacity:1}50%{opacity:.6}52%{opacity:1}80%{opacity:.85}82%{opacity:1} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(229,52,42,.55)}70%{box-shadow:0 0 0 14px rgba(229,52,42,0)} }

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
        .fab a { display:flex; align-items:center; gap:10px; height:52px; padding:0 24px; border-radius:6px; background:${G.brightRed}; color:${G.white}; font-family:${sans}; font-weight:700; font-size:14px; text-decoration:none; text-transform:uppercase; letter-spacing:.06em; box-shadow:0 6px 28px rgba(229,52,42,.6); animation:pulseRed 2s infinite; white-space:nowrap; }

        /* mobile */
        @media (max-width:768px) {
          .hero-h1     { font-size:clamp(2.2rem,12vw,3.5rem) !important; }
          .hero-ctas   { flex-direction:column !important; }
          .hero-btn    { width:100% !important; }
          .hero-ribbon { grid-template-columns:repeat(2,1fr) !important; }
          .sobre-grid  { grid-template-columns:1fr !important; gap:32px !important; }
          .sobre-imgs  { grid-template-rows:160px 160px !important; }
          .amb-grid    { grid-template-columns:1fr 1fr !important; grid-template-rows:160px 160px !important; }
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

      <main style={{ fontFamily: sans, color: G.white, background: G.black }}>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section style={{
          position: 'relative', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', overflow: 'hidden',
          padding: 'clamp(60px,8vw,90px) clamp(16px,4vw,48px) clamp(110px,14vw,140px)',
        }}>
          {/* gradient fallback */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `radial-gradient(ellipse 70% 60% at 15% 20%,rgba(139,26,26,.9) 0%,transparent 60%),radial-gradient(ellipse 55% 70% at 85% 80%,rgba(196,30,30,.65) 0%,transparent 55%),${G.black}` }} />

          {/* YouTube — mesmo padrão do Mané que funciona */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
            <iframe
              src="https://www.youtube.com/embed/rajCPpAG62A?si=cW2vRpmcx4ErkdMd&autoplay=1&mute=1&loop=1&playlist=rajCPpAG62A&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
              allow="autoplay; fullscreen"
              title="Porks Sobradinho"
              style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.78vh', transform: 'translate(-50%,-50%)', opacity: .5, border: 'none' }}
            />
          </div>

          {/* dark overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom,rgba(0,0,0,.72) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,.82) 100%)', pointerEvents: 'none' }} />
          {/* diagonal texture */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(0,0,0,.04) 60px,rgba(0,0,0,.04) 61px)' }} />
          {/* bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, zIndex: 3, background: 'linear-gradient(to bottom,transparent,#0D0C0B)', pointerEvents: 'none' }} />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 6, maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 4, border: '1px solid rgba(229,52,42,.5)', background: 'rgba(13,12,11,.6)', backdropFilter: 'blur(12px)', fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: G.amberLight, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.brightRed, flexShrink: 0, animation: 'pulseRed 2s infinite', display: 'inline-block' }} />
              Jazz & Blues & Rock & Chope · Sobradinho, DF
            </div>

            <div className="hero-logo" style={{ fontFamily: display, fontSize: 'clamp(64px,14vw,110px)', color: G.white, letterSpacing: '.06em', lineHeight: 1, textShadow: '0 0 80px rgba(229,52,42,.6),0 4px 40px rgba(0,0,0,.9)' }}>
              PORKS
            </div>
            <div style={{ fontFamily: sans, fontSize: 'clamp(10px,2vw,13px)', letterSpacing: '.3em', textTransform: 'uppercase', color: G.amberLight, opacity: .9, marginTop: 4, marginBottom: 'clamp(16px,3vw,24px)', textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
              SOBRADINHO — BRASÍLIA
            </div>

            <h1 className="hero-h1" style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2.6rem,8vw,5.2rem)', lineHeight: .95, letterSpacing: '.04em', textTransform: 'uppercase', textShadow: '0 2px 40px rgba(0,0,0,.9)', margin: 0, width: '100%' }}>
              Sua mesa garantida<br />
              <span style={{ color: G.amberLight }}>pra noite que</span><br />
              <span style={{ color: G.brightRed }}>você merece</span>
            </h1>

            <p className="hero-sub" style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2.2vw,1.1rem)', lineHeight: 1.7, opacity: .9, maxWidth: 500, marginTop: 24, textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
              Porco de verdade, chope gelado e música boa.<br />
              Reserve sua mesa e chegue no Porks sabendo que tem lugar.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 36, width: '100%' }}>
              <HeroBtn href={withQuery('/reservar')} primary={true}><CalIcon /> Reserve agora</HeroBtn>
              <HeroBtn href={withQuery('/consultar')} primary={false}><SearchIcon /> Localizar Reserva</HeroBtn>
            </div>

            <div className="trust-strip" style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', fontFamily: sans, fontSize: 12, opacity: .7, letterSpacing: '.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>
              <span>🐷 Sem fila</span><span>🍺 Sem couvert</span><span>🎸 Sem taxa</span>
            </div>
          </div>

          {/* stats ribbon */}
          <div className="hero-ribbon" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 7, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '10px 16px', background: 'rgba(13,12,11,.9)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(229,52,42,.4)' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 8px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                <span style={{ fontFamily: display, fontSize: 'clamp(1rem,3vw,1.8rem)', color: G.amberLight, lineHeight: 1, letterSpacing: '.04em' }}>{s.num}</span>
                <span style={{ fontFamily: sans, fontSize: 'clamp(8px,1.4vw,10px)', opacity: .55, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SOBRE ═════════════════════════════════════════ */}
        <Sobre />

        {/* ══ AMBIENTE ══════════════════════════════════════ */}
        <Ambiente />

        {/* ══ OCASIÕES ══════════════════════════════════════ */}
        <section style={{ background: G.black, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)', backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,.018) 80px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ textAlign: 'center', marginBottom: 44 }}>
              <Eyebrow color={G.amberLight}>Toda ocasião tem seu porco</Eyebrow>
              <SecTitle>Não precisa de motivo — só de fome</SecTitle>
            </Rv>
            <div className="ocas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
              {OCASIOES.map((o, i) => (
                <Rv key={o.label} delay={i * 60} style={{ background: o.featured ? `linear-gradient(135deg,${G.darkRed},${G.black})` : 'rgba(255,255,255,.04)', border: `1.5px solid ${o.featured ? 'rgba(229,52,42,.5)' : 'rgba(255,255,255,.08)'}`, borderRadius: 6, textAlign: 'center', overflow: 'hidden' }}>
                  <div style={{ fontSize: 48, padding: '28px 0 14px' }}>{o.emoji}</div>
                  <div style={{ padding: '0 22px 26px' }}>
                    <h3 style={{ fontFamily: display, fontWeight: 400, fontSize: 22, letterSpacing: '.06em', textTransform: 'uppercase', color: o.featured ? G.amberLight : G.white, margin: '0 0 10px' }}>{o.label}</h3>
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.7, opacity: .65, margin: 0 }}>{o.desc}</p>
                  </div>
                </Rv>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BENEFÍCIOS ════════════════════════════════════ */}
        <section style={{ background: G.bone, color: G.black, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,.04) 40px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ marginBottom: 44 }}>
              <Eyebrow color={G.red}>Por que reservar?</Eyebrow>
              <SecTitle dark>Garanta seu lugar antes de chegar</SecTitle>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, opacity: .65, maxWidth: 480 }}>
                O Porks enche rápido. Reserve e evite a decepção de chegar e não ter mesa.
              </p>
            </Rv>
            <div className="benef-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
              {BENEFITS.map((b, i) => (
                <Rv key={b.title} delay={i * 60} style={{ background: G.white, borderRadius: 6, padding: '28px 24px', border: '1.5px solid rgba(0,0,0,.08)', boxShadow: '0 2px 20px rgba(0,0,0,.06)', borderLeft: `4px solid ${G.brightRed}` }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>{b.icon}</div>
                  <h3 style={{ fontFamily: display, fontWeight: 400, fontSize: 20, letterSpacing: '.04em', textTransform: 'uppercase', color: G.black, margin: '0 0 10px' }}>{b.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.7, color: '#555', margin: 0 }}>{b.desc}</p>
                </Rv>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CARDÁPIO ══════════════════════════════════════ */}
        <section style={{ background: G.charcoal, padding: 'clamp(56px,10vw,100px) clamp(16px,5vw,64px)' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <Rv style={{ textAlign: 'center', marginBottom: 44 }}>
              <Eyebrow color={G.amberLight}>O cardápio</Eyebrow>
              <SecTitle>Porco em todas as formas possíveis</SecTitle>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.05rem)', lineHeight: 1.7, opacity: .65, maxWidth: 520, margin: '0 auto' }}>
                Receitas exclusivas com carne suína, chopes artesanais e petiscos de boteco. Tudo com o jeito Porks de fazer.
              </p>
            </Rv>
            <Rv>
              <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
                {MENU_ITEMS.map(r => (
                  <div key={r} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, padding: '11px 16px', fontFamily: sans, fontSize: 13, fontWeight: 600, textAlign: 'center', color: 'rgba(255,255,255,.75)', letterSpacing: '.03em' }}>{r}</div>
                ))}
              </div>
            </Rv>
            <Rv>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 44, justifyContent: 'center' }}>
                {CHIPS.map(c => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, padding: '9px 16px', fontFamily: sans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.65)', letterSpacing: '.04em' }}>
                    <span>{c.icon}</span>{c.text}
                  </div>
                ))}
              </div>
            </Rv>
          </div>
        </section>

        {/* ══ CTA FINAL ═════════════════════════════════════ */}
        <section style={{ background: G.black, textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(72px,12vw,130px) clamp(16px,5vw,64px)', borderTop: `2px solid ${G.brightRed}` }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontFamily: display, fontSize: 'clamp(120px,25vw,280px)', color: 'transparent', WebkitTextStroke: '1px rgba(229,52,42,.06)', letterSpacing: '.06em', userSelect: 'none', lineHeight: 1 }}>PORKS</span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto' }}>
            <Rv>
              <span style={{ fontFamily: display, fontSize: 'clamp(72px,16vw,110px)', lineHeight: 1, display: 'block', marginBottom: 4, textShadow: '0 0 60px rgba(229,52,42,.5)', animation: 'flicker 8s 2s infinite' }}>🐷</span>
            </Rv>
            <Rv delay={80}>
              <h2 style={{ fontFamily: display, fontWeight: 400, fontSize: 'clamp(2rem,6vw,3.8rem)', lineHeight: .95, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Pronto pra garantir<br /><span style={{ color: G.amberLight }}>sua mesa?</span>
              </h2>
            </Rv>
            <Rv delay={160}>
              <p style={{ fontFamily: sans, fontSize: 'clamp(.9rem,2vw,1.1rem)', opacity: .7, marginBottom: 40, lineHeight: 1.7 }}>
                Reserve agora em segundos. Chegue no Porks sabendo que tem lugar reservado, porco pronto e chope gelado esperando por você.
              </p>
            </Rv>
            <Rv delay={240}>
              <div className="cta-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                <CtaBtn href={withQuery('/reservar')} primary={true}><CalIcon />Reserve agora</CtaBtn>
                <CtaBtn href={withQuery('/consultar')} primary={false}><SearchIcon />Localizar Reserva</CtaBtn>
              </div>
            </Rv>
            <Rv delay={320}>
              <div className="cta-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
                {['🐷 Porco', '🍺 Chope', '🎸 Música', '🎂 Aniversários', '🏆 Sem fila'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, padding: '5px 14px', fontFamily: sans, fontSize: 12, fontWeight: 600, opacity: .75, letterSpacing: '.04em' }}>{t}</span>
                ))}
              </div>
            </Rv>
            <p style={{ fontFamily: sans, marginTop: 36, fontSize: 12, opacity: .3, letterSpacing: '.06em' }}>
              Dúvidas? Fale com a equipe do Porks Sobradinho na chegada.
            </p>
          </div>
        </section>
      </main>

      {/* ══ FAB mobile ════════════════════════════════════ */}
      <div className={`fab${fabVisible ? '' : ' hidden'}`}>
        <Link href={withQuery('/reservar')}>
          <CalIcon /> Reserve agora
        </Link>
      </div>
    </>
  );
}
