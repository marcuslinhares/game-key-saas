/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Mock do Next/Server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ ...data, _status: init?.status || 200 }))
  }
}));

describe('Checkout API Route Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ERRO: deve retornar 401 se o usuário não estiver logado', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });
    
    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: '1', paymentMethod: 'pix' })
    });

    const response: any = await POST(request);
    expect(response._status).toBe(401);
    expect(response.error).toBe('Não autorizado');
  });

  it('ERRO: deve retornar 404 se o anúncio não existir', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('NotFound') })
    }));

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'invalid', paymentMethod: 'pix' })
    });

    const response: any = await POST(request);
    expect(response._status).toBe(404);
  });

  it('SUCESSO: deve criar checkout Pix corretamente', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 'l1', price: 100, games: { title: 'Test Game' } }, 
        error: null 
      })
    }));

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'pix' })
    });

    const response: any = await POST(request);
    expect(response.orderId).toBeDefined();
    expect(response.checkoutUrl).toContain('/checkout/pix/');
  });

  it('SUCESSO: deve criar checkout Stripe (default) corretamente', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 'l1', price: 100, games: [{ title: 'Array Game' }] }, 
        error: null 
      })
    }));

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'stripe' })
    });

    const response: any = await POST(request);
    expect(response.orderId).toBeDefined();
  });
});
