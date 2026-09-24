import type { Metadata } from 'next';
import s from './reserva.module.css';
import AgenteMane from './_components/AgenteMane';
import VirtudeCredit from './_components/VirtudeCredit';

export const metadata: Metadata = {
  title: 'Reservar mesa • Porks Sobradinho',
  description: 'Reserve sua mesa no Porks Sobradinho e garanta chope cortesia para seus convidados.',
};

export default function ReservaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.shell}>
      <div className={s.container}>{children}</div>
      <VirtudeCredit />
      <AgenteMane />
    </div>
  );
}
