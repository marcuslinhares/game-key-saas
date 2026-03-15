/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as checkoutPost } from './checkout/route';
import { POST as revealPost } from './keys/reveal/route';
import { supabase } from '@/lib/supabase';

describe('API Routes Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('api/checkout', () => {
    it('SEGURANÇA: deve bloquear checkout sem usuário (401)', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: null }, error: null } as any);
      
      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ listingId: '1', paymentMethod: 'stripe' })
      });
      
      const res = await checkoutPost(req);
      expect(res.status).toBe(401);
    });

    it('INTEGRIDADE: deve processar checkout com sucesso para usuário logado', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null } as any);
      
      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ listingId: 'list-123', paymentMethod: 'stripe' })
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
        body: JSON.stringify({ orderId: 'ord-123' })
      });
      
      const res = await revealPost(req);
      expect(res.status).toBe(401);
    });

    it('LÓGICA: deve retornar 404 se o pedido não for encontrado, não pertencer ao usuário ou não estiver pago', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as any);
      
      // Mock do from('orders') retornando vazio (simula falha nas cláusulas eq)
      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
        } as any;
      });

      const req = new Request('http://localhost:3000/api/keys/reveal', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'invalid-ord' })
      });
      
      const res = await revealPost(req);
      expect(res.status).toBe(404);
    });

    it('SUCESSO: deve retornar a chave keyCode se tudo estiver correto', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null } as any);
      
      // Mock complexo para as múltiplas chamadas ao banco na rota reveal
      const fromSpy = vi.spyOn(supabase, 'from');
      
      fromSpy.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: () => Promise.resolve({ data: { id: 'ord-1' }, error: null })
          } as any;
        }
        if (table === 'keys') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: () => Promise.resolve({ data: { id: 'k1', key_code: 'TEST-KEY' }, error: null })
          } as any;
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        } as any;
      });

      const req = new Request('http://localhost:3000/api/keys/reveal', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'ord-1' })
      });
      
      const res = await revealPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.keyCode).toBe('TEST-KEY');
    });
  });
});
