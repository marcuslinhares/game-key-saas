import Stripe from 'stripe';

/**
 * Retorna uma instância do Stripe configurada.
 * Se a SECRET_KEY não estiver definida, retorna null (fail-safe para build/CI).
 */
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_SECRET_KEY não definida');
    }
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
  });
}

export interface StripeSessionResult {
  id: string;
  url: string | null;
  status: 'pending' | 'complete' | 'expired';
}

/**
 * Cria uma sessão de checkout no Stripe.
 *
 * @param amount      Valor em reais (ex: 250.00)
 * @param description Descrição do produto
 * @param metadata    Metadados opcionais (ex: { listingId, orderId })
 */
export async function createStripeSession(
  amount: number,
  description: string,
  metadata?: Record<string, string>,
): Promise<StripeSessionResult> {
  const stripe = getStripe();

  // Fallback simulado para CI / build sem chave
  if (!stripe) {
    console.log('[Stripe Mock] Criando sessão de R$', amount, ':', description);
    return {
      id: `cs_test_${Math.random().toString(36).substring(2, 11)}`,
      url: 'https://checkout.stripe.com/pay/cs_test_simulated',
      status: 'pending',
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: description,
          },
          unit_amount: Math.round(amount * 100), // centavos
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/purchases?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/cancel`,
    metadata: metadata || {},
  });

  return {
    id: session.id,
    url: session.url,
    status: 'pending',
  };
}

/**
 * Verifica o status de uma sessão de checkout no Stripe.
 */
export async function getStripeSessionStatus(sessionId: string): Promise<StripeSessionResult | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    id: session.id,
    url: session.url,
    status: session.payment_status === 'paid' ? 'complete' : 'pending',
  };
}

/**
 * Constrói a URL do webhook do Stripe para o ambiente atual.
 */
export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}
