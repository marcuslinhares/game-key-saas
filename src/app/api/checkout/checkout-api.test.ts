/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Mock do Next/Server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ ...data, _status: init?.status || 200 })),
  },
}));

/**
 * Cria um mock encadeável para supabase.from().
 * Retorna diferentes resultados dependendo do nome da tabela.
 */
function makeFromMock(steps: Record<string, any>) {
  return vi.fn((table: string) => {
    const handler = steps[table] || steps.default;
    if (typeof handler === 'function') {
      return handler(table);
    }
    // Default chainable mock
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

describe('Checkout API Route Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ERRO: deve retornar 401 se o usuário não estiver logado', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: '1', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(401);
    expect(response.error).toBe('Não autorizado');
  });

  it('ERRO: deve retornar 400 se listingId ou paymentMethod estiver faltando', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    const req1 = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'pix' }),
    });
    const res1: any = await POST(req1);
    expect(res1._status).toBe(400);

    const req2 = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1' }),
    });
    const res2: any = await POST(req2);
    expect(res2._status).toBe(400);
  });

  it('ERRO: deve retornar 404 se o anúncio não existir', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('NotFound') }),
      }),
      default: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('NotFound') }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'invalid', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(404);
  });

  it('ERRO: deve rejeitar compra do próprio anúncio', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'seller-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'l1', price: 100, games: { title: 'Test' }, seller_id: 'seller-1', active: true },
          error: null,
        }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(400);
    expect(response.error).toContain('não pode comprar');
  });

  it('ERRO: deve rejeitar anúncio inativo', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'l1', price: 100, games: { title: 'Test' }, seller_id: 'seller-1', active: false },
          error: null,
        }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(400);
    expect(response.error).toContain('inativo');
  });

  it('ERRO: deve rejeitar se não houver chave disponível', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'l1', price: 100, games: { title: 'Test' }, seller_id: 'seller-1', active: true },
          error: null,
        }),
      }),
      keys: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('No keys') }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response._status).toBe(404);
    expect(response.error).toContain('chave disponível');
  });

  it('SUCESSO: deve criar checkout Pix corretamente', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'l1', price: 100, games: { title: 'Test Game' }, seller_id: 'seller-1', active: true },
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
          data: { id: 'order-new-123', buyer_id: 'buyer-1', seller_id: 'seller-1', amount: 100, status: 'pending' },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'pix' }),
    });

    const response: any = await POST(request);
    expect(response.orderId).toBe('order-new-123');
    expect(response.checkoutUrl).toContain('/checkout/pix/');
  });

  it('SUCESSO: deve criar checkout Stripe corretamente', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'buyer-1' } }, error: null });

    (supabase.from as any) = makeFromMock({
      listings: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'l1', price: 100, games: [{ title: 'Array Game' }], seller_id: 'seller-1', active: true },
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
          data: { id: 'order-new-456', buyer_id: 'buyer-1', seller_id: 'seller-1', amount: 100, status: 'pending' },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'l1', paymentMethod: 'stripe' }),
    });

    const response: any = await POST(request);
    expect(response.orderId).toBe('order-new-456');
  });
});
