import { describe, it, expect } from 'vitest';
import { createPixPayment } from './mercado-pago';

describe('Mercado Pago Payment Module', () => {
  it('deve gerar dados de pagamento Pix com estrutura correta', async () => {
    const amount = 100.50;
    const description = 'Teste de Compra';
    
    const result = await createPixPayment(amount, description);
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('qr_code');
    expect(result).toHaveProperty('status', 'pending');
    expect(result.qr_code).toContain('000201'); // Início padrão de um QR Code Pix estático
  });
});
