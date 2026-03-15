import { describe, it, expect } from 'vitest';
import { createStripeSession } from './stripe';

describe('Stripe Payment Module', () => {
  it('deve gerar dados de sessão Stripe com estrutura correta', async () => {
    const amount = 250.00;
    const description = 'Jogo Teste';
    
    const result = await createStripeSession(amount, description);
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('stripe.com');
  });
});
