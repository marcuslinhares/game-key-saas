/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { supabase } from '@/lib/supabase';

// Mock do Next/Server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ ...data, _status: init?.status || 200 })),
  },
}));

// Mock do crypto module
vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn((ciphertext: string) => {
    if (ciphertext === 'encrypted:key:format') {
      return 'GAME-KEY-123-DECRYPTED';
    }
    if (ciphertext.includes(':')) {
      return 'DECRYPTED-KEY';
    }
    throw new Error('Invalid format');
  }),
}));

describe('Key Reveal API Route Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ERRO: deve retornar 400 sem orderId', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const request = new Request('http://localhost/api/keys/reveal', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(400);
    expect(response.error).toContain('orderId é obrigatório');
  });

  it('ERRO: deve retornar 401 se não houver usuário', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });
    const request = new Request('http://localhost/api/keys/reveal', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'o1' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(401);
  });

  it('ERRO: deve retornar 404 se pedido não for encontrado ou não estiver pago', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('NotPaid') }),
    }));

    const request = new Request('http://localhost/api/keys/reveal', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'o1' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(404);
  });

  it('SUCESSO: deve revelar chave descriptografada e registrar log', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'o1', status: 'paid' }, error: null }),
        };
      }
      if (table === 'keys') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'k1', key_code: 'encrypted:key:format' },
            error: null,
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const request = new Request('http://localhost/api/keys/reveal', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'o1' }),
      headers: { 'user-agent': 'vitest-agent' },
    });

    const response: any = await POST(request);
    expect(response.keyCode).toBe('GAME-KEY-123-DECRYPTED');
    expect(supabase.from).toHaveBeenCalledWith('key_reveal_logs');
  });

  it('SUCESSO: deve retornar chave em texto plano se não estiver criptografada', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'o2', status: 'paid' }, error: null }),
        };
      }
      if (table === 'keys') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'k2', key_code: 'PLAIN-TEXT-KEY-123' },
            error: null,
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const request = new Request('http://localhost/api/keys/reveal', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'o2' }),
      headers: { 'user-agent': 'vitest-agent' },
    });

    const response: any = await POST(request);
    expect(response.keyCode).toBe('PLAIN-TEXT-KEY-123');
  });
});
