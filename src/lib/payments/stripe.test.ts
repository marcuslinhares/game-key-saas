import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStripeSession, getStripeSessionStatus } from './stripe';

// Mock do Stripe - precisa ser construtível
vi.mock('stripe', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    id: 'cs_test_mock123',
    url: 'https://checkout.stripe.com/pay/cs_test_mock123',
    payment_status: 'unpaid',
  });
  const mockRetrieve = vi.fn().mockResolvedValue({
    id: 'cs_test_mock123',
    url: null,
    payment_status: 'paid',
  });

  function MockStripe() {
    return {
      checkout: {
        sessions: {
          create: mockCreate,
          retrieve: mockRetrieve,
        },
      },
    };
  }

  return { default: MockStripe };
});

describe('Stripe Payment Module', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
  });

  it('deve criar sessão Stripe com dados corretos', async () => {
    const result = await createStripeSession(250.0, 'Jogo Teste', { listingId: 'list-1' });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('status');
    expect(result.id).toContain('cs_test');
    expect(result.url).toContain('stripe.com');
  });

  it('deve retornar mock em ambiente sem STRIPE_SECRET_KEY', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    const result = await createStripeSession(100, 'Teste');
    expect(result).toHaveProperty('id');
    expect(result.id).toContain('cs_test');
  });

  it('deve verificar status de sessão', async () => {
    const result = await getStripeSessionStatus('cs_test_mock123');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('complete');
  });
});
