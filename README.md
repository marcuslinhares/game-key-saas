# GameKey Market - SaaS de Marketplace de Chaves de Jogos

Plataforma B2C/C2C para compra e venda de chaves de ativação de jogos (Steam, Xbox, Epic Games, etc.). Construída com Next.js, Supabase e pagamentos integrados via Stripe (global) e Mercado Pago (Pix - Brasil).

## Funcionalidades

- **Catálogo de Jogos** — Navegue e pesquise jogos disponíveis na plataforma
- **Multi-Vendedor** — Vendedores podem criar anúncios e gerenciar seu estoque de chaves
- **Pagamentos Globais** — Stripe (cartão de crédito/débito internacional)
- **Pagamentos Brasil** — Mercado Pago com Pix (confirmação instantânea)
- **Sistema Escrow** — Retenção de pagamentos por 7 dias com liberação automática
- **Sistema de Disputas** — Resolução de conflitos entre comprador e vendedor
- **Criptografia AES-256-GCM** — Chaves de ativação armazenadas de forma segura
- **Auditoria** — Logs de revelação de chaves e logs financeiros
- **Painel do Vendedor** — Gerencie anúncios, saldos e saques
- **Painel de Compras** — Acesse suas chaves compradas

## Tecnologias

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend/Database:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **Pagamentos:** Stripe SDK | Mercado Pago SDK (Pix)
- **Segurança:** AES-256-GCM nas chaves, Row Level Security no PostgreSQL
- **Testes:** Vitest (unit/integration), Playwright (E2E)
- **Infraestrutura:** Docker, CI/CD (GitHub Actions)

## Pré-requisitos

- Node.js 22+
- Docker (para desenvolvimento local com Supabase)
- Conta Stripe (modo teste/produção)
- Conta Mercado Pago (modo teste/produção)

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Configure as seguintes variáveis:

| Variável | Descrição | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Sim |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (sk_test_*) | Para Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook Stripe (whsec_*) | Para webhooks |
| `MERCADO_PAGO_ACCESS_TOKEN` | Access Token do Mercado Pago | Para Pix |
| `ENCRYPTION_KEY` | Chave AES-256 (64 caracteres hex) | Sim |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site | Para webhooks |

Gere a chave de criptografia:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

Execute as migrations no Supabase:

```bash
npm run db:push
```

Ou copie o conteúdo de `supabase/setup.sql` e execute no SQL Editor do Supabase.

### 4. Iniciar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor de produção |
| `npm test` | Executa testes unitários (Vitest) |
| `npm run test:coverage` | Testes com cobertura |
| `npm run lint` | Executa ESLint |
| `npm run db:push` | Sincroniza schema com Supabase |

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── checkout/       # Checkout (criação de pedidos)
│   │   ├── keys/reveal/    # Revelação de chaves criptografadas
│   │   ├── escrow/         # Sistema de escrow e disputas
│   │   └── webhooks/       # Webhooks Stripe e Mercado Pago
│   ├── dashboard/          # Painéis do comprador e vendedor
│   └── games/              # Páginas de detalhes do jogo
├── components/             # Componentes React
│   ├── checkout/           # Seletor de pagamento
│   ├── purchases/          # Revelação de chaves (KeyReveal)
│   └── ui/                 # Componentes shadcn/ui
└── lib/                    # Utilitários
    ├── payments/           # Módulos de pagamento (Stripe, Mercado Pago)
    ├── crypto.ts           # Criptografia AES-256-GCM
    └── supabase.ts         # Cliente Supabase
supabase/
├── migrations/             # Migrações do banco de dados
└── setup.sql              # Schema completo para setup inicial
```

## Fluxo de Pagamento e Escrow

1. **Compra:** Comprador seleciona um jogo e escolhe Pix (Brasil) ou Stripe (Global)
2. **Pagamento:** Redirecionado para checkout Stripe ou QR Code Pix
3. **Confirmação:** Webhook confirma o pagamento e aloca a chave ao pedido
4. **Escrow:** O valor fica retido no `balance_pending` do vendedor por 7 dias
5. **Liberação:** Após 7 dias sem disputa, o valor é liberado para `balance_available`
6. **Revelação:** Comprador acessa a chave descriptografada no Dashboard

## Segurança

- **Chaves criptografadas** com AES-256-GCM (autenticação + confidencialidade)
- **RLS (Row Level Security)** no PostgreSQL — cada usuário vê apenas seus dados
- **Auditoria** de todas as revelações de chave (IP, user-agent, timestamp)
- **HTTPS obrigatório** em produção
- **Validação de webhooks** com assinaturas criptográficas (Stripe)

## Licença

Proprietária — Todos os direitos reservados.
