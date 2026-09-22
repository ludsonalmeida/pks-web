# Jornada de reservas v2 do Porks Sobradinho (branch feat/jornada-v2)

Porte da jornada v2 do sistema do Mané para o Porks. Rota nova `/reserva` (3 telas) convivendo com `/reservar` (antiga). Links curtos `/sobradinho` e `/mesa`.

- Tela 1 `/reserva`: pessoas, dia, horário, ocasião, ambiente. A casa é uma só, entra escolhida sem pergunta. Uma pergunta em foco por vez.
- Tela 2 `/reserva/dados`: WhatsApp, nome, CPF só quando destrava algo (aniversário ou 8+), e-mail opcional. Aviso de reserva ativa só informa (o Porks aceita mais de uma por WhatsApp).
- Tela 3 `/reserva/pronto/[code]`: código, QR, combinado de chegada, convite, agenda. Busca por `/v1/reservations/public/lookup?code=` (a API do Porks não tem `by-code`).
- Envio via `/api/reserva` (servidor repassa para a API do Porks). `people` = adultos + crianças, igual ao site antigo.
- Agente do Porks: `_components/AgenteMane.tsx` (passo 1, respostas locais, copy do Porks).
- Reconhecimento pelo WhatsApp: `/api/crm/lookup` busca reservas anteriores desse telefone na API do Porks (`/v1/integrations/admin/reservations?search=`, `x-api-key` = `RESERVAS_API_KEY`, mesmo valor de `EXTERNAL_API_KEY` do pks-api no Railway). Devolve primeiro nome, nome completo e aniversário mascarado + token assinado; a tela 2 preenche o nome e, na pergunta do chope, oferece a data que já temos. O valor real da data só entra no servidor (`/api/reserva`, `useKnownBirthday`). Sem a chave, responde `disabled` e segue só com nome e WhatsApp.

## O que é do Porks aqui
- Horários (`_lib/rules.ts`): segunda fechado; terça a sexta 17h às 23h30; sábado 12h às 23h30; domingo 12h às 21h30. Sem mínimo por horário de pico. Mínimo 2 pessoas. Sem bloqueios recorrentes (a API não tem o endpoint; a lista fica vazia).
- Promo (`PROMO_TIERS`): quinta a domingo, qualquer horário, a partir de 5 pessoas ganha chopes (5, 8 e 10 pessoas). Aparece no contador, no horário e no bilhete.
- Identidade: creme/osso de fundo, carvão no texto, laranja do chope nos botões com texto preto (igual ao CTA da home), Bebas Neue nos títulos e Barlow no corpo. Logo `/images/1.png`.
- WhatsApp da equipe: 61 98177-6251 (o mesmo do concierge do site antigo).

## Rodar em outro PC
```
npm install
# .env.development.local (NÃO versionado):
#   RESERVAS_API_BASE=https://api2.sobradinhoporks.com.br
#   RESERVAS_API_KEY=<EXTERNAL_API_KEY do serviço pks-api no Railway>
npx next dev -p 3000    # a API de produção só aceita CORS de localhost:3000
```
Em produção: definir no serviço pks-web do Railway `RESERVAS_API_KEY`, `WA_TOKEN`, `WA_PHONE_NUMBER_ID` (1052768767919800) e `NOTIFY_WHATSAPP` (números da equipe, separados por vírgula).

## Aviso de reserva nova no WhatsApp da equipe
`src/server/whatsapp.ts`, chamado por `/api/reserva` depois do 201, sem segurar a resposta. Manda pelo número oficial do Porks (Meta Cloud API, mesmo token do Notifications Engine do Porks Hub) o template `nova_reserva_equipe` (UTILITY, pt_BR, enviado à Meta em 22/09, aguardando aprovação) com nome, dia, hora, pessoas, área, cortesia de chope (faixas de 5/8/10), chope de aniversário (sim/não), telefone e código. Enquanto o template não aprova, cai em texto livre (só entrega se o destinatário falou com o número nas últimas 24h).

## Rotas
- `/` e `/reservar` redirecionam (307, query preservada) para `/reserva`. A landing antiga continua no código (`src/app/page.tsx`) mas não é servida.
`.env.local` precisa apontar para `https://api2.sobradinhoporks.com.br` (estava com `.com.vc`, host que não existe).

## Pendente
- Não está em produção. Subir = merge em master + `railway up` (Máquina Porks).
- Decidir se o CPF continua opcional e se o campo pessoas vira só adultos.
- Endpoint de alterar/cancelar pelo cliente não existe na pks-api.
