import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * Retorna um cliente do Mercado Pago configurado.
 * Se o ACCESS_TOKEN não estiver definido, retorna null (fail-safe para build/CI).
 */
function getMercadoPagoClient(): MercadoPagoConfig | null {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não definida');
    }
    return null;
  }
  return new MercadoPagoConfig({ accessToken: token });
}

export interface PixPaymentResult {
  id: string;
  qr_code: string;
  qr_code_base64: string;
  status: 'pending' | 'approved' | 'expired';
}

/**
 * Cria um pagamento Pix via Mercado Pago.
 *
 * @param amount      Valor em reais (ex: 100.50)
 * @param description Descrição do pagamento
 * @param metadata    Metadados opcionais
 */
export async function createPixPayment(
  amount: number,
  description: string,
  metadata?: Record<string, string>,
): Promise<PixPaymentResult> {
  const mpClient = getMercadoPagoClient();

  // Fallback simulado para CI / build sem chave
  if (!mpClient) {
    console.log('[Mercado Pago Mock] Criando pagamento Pix de R$', amount, ':', description);
    return {
      id: `mp_${Math.random().toString(36).substring(2, 11)}`,
      qr_code:
        '00020101021226830014BR.GOV.BCB.PIX0161mercadopago@exemplo.com.br520400005303986540510.005802BR5925GameKey Market6009SAO PAULO62070503***6304E229',
      qr_code_base64:
        'iVBORw0KGgoAAAANSUhEUgA...',
      status: 'pending',
    };
  }

  const paymentClient = new Payment(mpClient);

  const payment = await paymentClient.create({
    body: {
      transaction_amount: amount,
      description,
      payment_method_id: 'pix',
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      metadata: metadata || {},
    },
  });

  const pointOfInteraction = payment.point_of_interaction?.transaction_data;

  return {
    id: payment.id?.toString() || `mp_${Date.now()}`,
    qr_code: pointOfInteraction?.qr_code || '',
    qr_code_base64: pointOfInteraction?.qr_code_base64 || '',
    status: 'pending',
  };
}

/**
 * Verifica o status de um pagamento no Mercado Pago.
 */
export async function getPixPaymentStatus(paymentId: string): Promise<PixPaymentResult | null> {
  const mpClient = getMercadoPagoClient();
  if (!mpClient) return null;

  const paymentClient = new Payment(mpClient);
  const payment = await paymentClient.get({ id: paymentId });

  return {
    id: payment.id?.toString() || paymentId,
    qr_code: payment.point_of_interaction?.transaction_data?.qr_code || '',
    qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || '',
    status: payment.status === 'approved' ? 'approved' : payment.status === 'pending' ? 'pending' : 'expired',
  };
}
