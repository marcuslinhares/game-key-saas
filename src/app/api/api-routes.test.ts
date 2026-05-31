/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as checkoutPost } from './checkout/route';
import { POST as revealPost } from './keys/reveal/route';
import { supabase } from '@/lib/supabase';

/**
 * Cria um mock de NextResponse.json que retorna um objeto 
 * compatível com Response (status + json()).
 */
function mockJsonResponse(data: any, init?: { status?: number }) {
  const status = init?.status || 200;
  return {
    status,
    _status: status,
    json: () => Promise.resolve(data),
    ...data,
  };
}

// Mock do Next/Server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn(mockJsonResponse),
  },
}));

/**
 * Cria um mock encadeável para supabase.from().
 */
function makeFromMock(steps: Record<string, any>) {
  return vi.fn((table: string) => {
    const handler = steps[table] || steps.default;
    if (typeof handler === 'function') {
      return handler(table);
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(handler || { data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
  });
}

describe('API Routes Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('api/checkout', () => {
    it('SEGURANÇA: deve bloquear checkout sem usuário (401)', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: null }, error: null } as any);

      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ listingId: '1', paymentMethod: 'stripe' }),
      });

      const res = await checkoutPost(req);
      expect(res.status).toBe(401);
    });

    it('INTEGRIDADE: deve processar checkout com sucesso para usuário logado', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      (supabase.from as any) = makeFromMock({
        listings: () => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'list-123',
              price: 59.9,
              games: { title: 'Test Game' },
              seller_id: 'seller-456',
              active: true,
            },
            error: null,
          }),
        }),
        keys: () => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'k1' }, error: null }),
        }),
        orders: () => ({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'order-1',
              buyer_id: 'user-123',
              seller_id: 'seller-456',
              amount: 59.9,
              status: 'pending',
            },
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ listingId: 'list-123', paymentMethod: 'stripe' }),
      });

      const res = await checkoutPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.checkoutUrl).toBeDefined();
    });
  });

  describe('api/keys/reveal', () => {
    it('SEGURANÇA: deve bloquear revelação de chave sem usuário (401)', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: null }, error: null } as any);

      const req = new Request('http://localhost:3000/api/keys/reveal', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'ord-123' }),
      });

      const res = await revealPost(req);
      expect(res.status).toBe(401);
    });

    it('LÓGICA: deve retornar 404 se o pedido não for encontrado, não pertencer ao usuário ou não estiver pago', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as any);

      (supabase.from as any) = makeFromMock({
        orders: () => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      });

      const req = new Request('http://localhost:3000/api/keys/reveal', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'invalid-ord' }),
      });

      const res = await revealPost(req);
      expect(res.status).toBe(404);
    });

    it('SUCESSO: deve retornar a chave keyCode se tudo estiver correto', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as any);

      (supabase.from as any) = makeFromMock({
        orders: () => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'ord-1', status: 'paid' }, error: null }),
        }),
        keys: () => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'k1', key_code: 'PLAIN-TEST-KEY' }, error: null }),
        }),
        key_reveal_logs: () => ({
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const req = new Request('http://localhost:3000/api/keys/reveal', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'ord-1' }),
      });

      const res = await revealPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.keyCode).toBe('PLAIN-TEST-KEY');
    });
  });
});
