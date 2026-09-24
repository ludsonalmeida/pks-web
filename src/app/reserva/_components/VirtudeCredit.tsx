import s from '../reserva.module.css';

// Assinatura "Um aplicativo Virtude Digital" com o monograma VD (paths do Brand.jsx do site da Virtude)
export default function VirtudeCredit() {
  return (
    <a
      href="https://virtudedigital.com.br/"
      target="_blank"
      rel="noopener"
      className={s.credit}
      aria-label="Um aplicativo Virtude Digital (abre em nova aba)"
    >
      <span>Um aplicativo</span>
      <svg viewBox="0 0 120 100" fill="currentColor" aria-hidden="true">
        <polygon points="0,0 21,0 35,52 49,0 70,0 45,100 25,100" />
        <path
          fillRule="evenodd"
          d="M58,0 L94,0 L120,26 L120,74 L94,100 L58,100 Z M80,22 L88,22 L98,32 L98,68 L88,78 L80,78 Z"
        />
      </svg>
      <b>Virtude Digital</b>
    </a>
  );
}
