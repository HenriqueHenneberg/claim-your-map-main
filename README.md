# Compre o Topo

Plataforma web de competição territorial simbólica:

> Pague pouco. Suba no ranking. Domine sua cidade, seu estado ou o mundo.

O MVP usa Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Zod e integração Pix via Mercado Pago. O ranking não é fake: pagamentos aprovados somam pontos no banco, atualizam território, dono, status e eventos.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- API Routes
- Mercado Pago Pix
- Webhook de confirmação
- Zod
- Cookies admin httpOnly assinados com `crypto`
- Rate limit em criação de pagamentos e login admin

## Instalação

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/compre_o_topo?schema=public"
MERCADOPAGO_ACCESS_TOKEN="TEST-your-sandbox-access-token"
MERCADOPAGO_WEBHOOK_SECRET="your-mercado-pago-webhook-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PASSWORD="troque-esta-senha"
ADMIN_SESSION_SECRET="use-um-segredo-longo-com-32-caracteres-ou-mais"
```

## PostgreSQL

Crie um banco local:

```bash
createdb compre_o_topo
npx prisma migrate dev
npx prisma db seed
```

O seed cria 40 usuários, territórios globais/internacionais/brasileiros, rankings, pagamentos aprovados, guerras ativas e logs.

## Mercado Pago sandbox

1. Crie ou acesse sua aplicação no painel de desenvolvedores do Mercado Pago.
2. Copie o access token de teste e coloque em `MERCADOPAGO_ACCESS_TOKEN`.
3. Configure um webhook para:

```text
https://seu-dominio.com/api/webhooks/mercadopago
```

4. Copie a assinatura secreta do webhook para `MERCADOPAGO_WEBHOOK_SECRET`.

Para teste local com ngrok:

```bash
ngrok http 3000
```

Atualize:

```env
NEXT_PUBLIC_APP_URL="https://seu-subdominio.ngrok-free.app"
```

Webhook local:

```text
https://seu-subdominio.ngrok-free.app/api/webhooks/mercadopago
```

Sem `MERCADOPAGO_ACCESS_TOKEN`, a API entra em modo desenvolvimento e cria um Pix pendente com código dev. Para Pix real, configure o token sandbox ou produção.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Rotas principais

- `/` mapa competitivo
- `/rankings` rankings global, país, estado e cidade
- `/territory/[slug]` página de território
- `/user/[slug]` perfil público
- `/checkout` checkout Pix
- `/payment/[id]` status do pagamento
- `/admin/login` login admin
- `/admin` painel admin protegido

## APIs

- `POST /api/payments/create`
- `GET /api/payments/[id]`
- `POST /api/webhooks/mercadopago`
- `GET /api/rankings`
- `GET /api/territories`
- `GET /api/territories/[slug]`
- `GET /api/users/[slug]`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/stats`
- `GET /api/admin/payments`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `GET /api/admin/logs`

## Regras implementadas

- Cada R$1,00 confirmado vale 100 pontos.
- Valor mínimo: R$1,00.
- O backend calcula pontos a partir de `amountCents`.
- Pagamentos só contam após status aprovado.
- Webhook é idempotente.
- Dono do território é o maior `TerritoryScore`.
- Status do território:
  - `NONE`: sem pontos
  - `ACTIVE`: um competidor
  - `WAR`: top 1 e top 2 separados por até 500 pontos
  - `DOMINATED`: top 1 tem mais que 2x o top 2
  - `COMPETITIVE`: disputa ativa fora dos casos acima

## Segurança básica

- Zod em entradas de API
- Sanitização de nome e mensagem
- Bloqueio por `BannedWord`
- Rate limit em checkout e admin login
- Cookie admin httpOnly e assinado
- Secrets apenas no servidor
- Assinatura Mercado Pago validada quando `MERCADOPAGO_WEBHOOK_SECRET` existe
- Idempotência no crédito de pagamento
- Logs de auditoria

## Deploy na Vercel

1. Crie um Postgres gerenciado e configure `DATABASE_URL`.
2. Configure as variáveis de ambiente na Vercel.
3. Rode migrations em ambiente seguro:

```bash
npx prisma migrate deploy
```

4. Faça deploy:

```bash
npm run build
```

Na Vercel, use a URL pública em `NEXT_PUBLIC_APP_URL` e cadastre o webhook do Mercado Pago apontando para `/api/webhooks/mercadopago`.

## Limitações do MVP

- Usuários públicos não têm login próprio; identidade é baseada no nome público.
- O mapa é SVG customizado e competitivo, não GIS de precisão cartográfica.
- O modo sem token Mercado Pago é apenas desenvolvimento e não aprova pagamentos reais.
- Moderação é básica: banimento, ocultar mensagem e palavras bloqueadas.

## Próximos passos

- Login de usuários e histórico privado.
- Antifraude por device/IP.
- Websocket ou SSE para ranking em tempo real.
- Mapa geográfico com malhas oficiais de países/estados.
- Cupons e campanhas por cidade.
- Moderação avançada de nomes e mensagens.

## Referências Mercado Pago

- Pix via Checkout API: https://www.mercadopago.com.br/developers/en/docs/checkout-api-payments/integration-configuration/integrate-pix
- Webhooks e assinatura `x-signature`: https://www.mercadopago.com.br/developers/en/docs/checkout-pro/payment-notifications
