import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPixPayment, getPixPaymentStatus } from './mercado-pago';

// Mock do mercadopago SDK - precisa ser construtível
vi.mock('mercadopago', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    id: 12345,
    point_of_interaction: {
      transaction_data: {
        qr_code: '00020101021226830014BR.GOV.BCB.PIX0161mercadopago@test.com.br520400005303986540510.005802BR5925GameKey Market6009SAO PAULO62070503***6304E229',
        qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgA...',
      },
    },
    status: 'pending',
  });
  const mockGet = vi.fn().mockResolvedValue({
    id: 12345,
    point_of_interaction: {
      transaction_data: {
        qr_code: '000201010212...',
        qr_code_base64: 'iVBORw0KGgo...',
      },
    },
    status: 'approved',
  });

  function MockPayment() {
    return {
      create: mockCreate,
      get: mockGet,
    };
  }

  function MockMercadoPagoConfig() {
    return {};
  }

  return {
    MercadoPagoConfig: MockMercadoPagoConfig,
    Payment: MockPayment,
  };
});

describe('Mercado Pago Payment Module', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MERCADO_PAGO_ACCESS_TOKEN', 'TEST-12345-mock');
  });

  it('deve criar pagamento Pix com estrutura correta', async () => {
    const result = await createPixPayment(100.5, 'Teste de Compra');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('qr_code');
    expect(result).toHaveProperty('qr_code_base64');
    expect(result).toHaveProperty('status', 'pending');
    expect(result.qr_code).toContain('000201');
  });

  it('deve retornar mock em ambiente sem MERCADO_PAGO_ACCESS_TOKEN', async () => {
    vi.stubEnv('MERCADO_PAGO_ACCESS_TOKEN', '');

    const result = await createPixPayment(50, 'Teste');
    expect(result).toHaveProperty('id');
    expect(result.id).toContain('mp_');
    expect(result.qr_code).toContain('000201');
  });

  it('deve verificar status de pagamento Pix', async () => {
    const result = await getPixPaymentStatus('12345');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('approved');
  });
});
