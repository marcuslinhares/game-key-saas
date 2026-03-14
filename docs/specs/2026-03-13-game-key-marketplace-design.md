# Design Spec: Game Key Marketplace (MVP)

## 1. Visão Geral
Plataforma de marketplace (B2C/C2C) para venda de chaves de ativação de jogos (Steam, Xbox, Epic, etc.). O sistema permite que múltiplos vendedores anunciem chaves, enquanto a plataforma garante a segurança da transação através de um sistema de reputação e retenção de pagamentos (escrow).

## 2. Público e Região
- **Brasil:** Foco em Pix via Mercado Pago (com split de pagamento nativo).
- **Global:** Foco em Cartão e Cripto via Stripe.
- **Idioma:** Inicialmente Português/Inglês (preparado para i18n).

## 3. Arquitetura Técnica
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions).
- **Pagamentos:**
  - Mercado Pago (Brasil - Pix com Split).
  - Stripe (Global - Cartão/Crypto).
- **Segurança:** AES-256-GCM para chaves, RLS no Postgres, Secrets Management para chaves de API.

## 4. Modelo de Dados (Entidades)
### Users (Perfis)
- `id`, `email`, `full_name`, `avatar_url`, `is_seller`, `reputation_score`, `balance_available`, `balance_pending`.

### Games (Catálogo)
- `id`, `title`, `description`, `cover_image`, `platform`, `region_lock`.

### Listings (Anúncios)
- `id`, `game_id`, `seller_id`, `price`, `stock_count`, `active` (boolean).

### Keys (Chaves de Ativação)
- `id`, `listing_id`, `key_code` (encriptado AES-256), `status` (available, sold, disputed), `order_id`.

### Orders (Pedidos)
- `id`, `buyer_id`, `seller_id`, `listing_id`, `amount`, `commission_fee`, `status` (pending, paid, completed, disputed), `payment_id`, `created_at`.

### FinancialLogs (Auditoria)
- `id`, `user_id`, `order_id`, `change_amount`, `new_balance_pending`, `new_balance_available`, `reason` (sale, escrow_release, withdrawal).

### KeyRevealLogs (Segurança)
- `id`, `key_id`, `user_id`, `timestamp`, `ip_address`, `user_agent`.

### Disputes (Resolução de Conflitos)
- `id`, `order_id`, `reason`, `evidence_urls` (array), `status` (open, resolved_buyer, resolved_seller), `admin_notes`.

### Withdrawals (Saques)
- `id`, `user_id`, `amount`, `status` (pending, processed, rejected), `destination_account`, `processed_at`.

## 5. Fluxo de Segurança e Pagamentos
1. **Transação Atômica:** O sistema usa `FOR UPDATE` locks no Postgres para garantir que uma chave nunca seja vendida para dois compradores simultaneamente.
2. **Escrow (Retenção):** O valor da venda fica no `balance_pending` do vendedor. 
3. **Liberação Automática:** Um Cron Job (Supabase Edge Function) libera os fundos para `balance_available` após 7 dias se não houver disputa aberta.
4. **Revelação de Chave:** A chave só é descriptografada e exibida no Dashboard após o pagamento confirmado. O e-mail contém apenas o link para o Dashboard, nunca a chave em texto plano.

## 6. Interface (UI/UX)
- **Estilo:** Clean, Moderno, Minimalista (Modo Claro/Escuro).
- **Responsividade:** Mobile-first para compradores; Desktop-optimized para vendedores.

## 7. Roadmap MVP
1. **Infra:** Supabase + Auth + Schema de Banco com RLS.
2. **Catálogo:** CRUD Admin e Upload de Imagens.
3. **Pagamentos:** Integração Pix (Mercado Pago) e Split de Comissão.
4. **Venda:** Fluxo de compra -> Pagamento -> Revelação de Chave (Auditado).
5. **Vendedor:** Dashboard de saldo e gestão de anúncios/chaves.
6. **Disputas:** Sistema básico para o Admin intervir em caso de erro na chave.
