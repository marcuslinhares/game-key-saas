/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CheckoutPage from './page';
import { supabase } from '@/lib/supabase';

// Mock do hook use
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual as any, use: (promise: any) => ({ listingId: 'list-123' }) };
});

describe('CheckoutPage Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('SUCESSO: deve renderizar detalhes completos', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: () => Promise.resolve({ 
        data: { 
          id: 'list-123', price: 150, 
          games: { title: 'God of War', cover_image: '/gow.jpg', platform: 'PS5' },
          profiles: { full_name: 'Seller' }
        }, 
        error: null 
      })
    } as any);

    render(<CheckoutPage params={Promise.resolve({ listingId: 'list-123' })} />);
    await waitFor(() => { expect(screen.getByText('God of War')).toBeInTheDocument(); });
  });

  it('ESTADO: deve renderizar Skeletons durante loading', () => {
    // Simulamos um loading eterno ou lento
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: () => new Promise(() => {}) // Nunca resolve
    } as any);

    const { container } = render(<CheckoutPage params={Promise.resolve({ listingId: '1' })} />);
    
    // Verifica se os skeletons estão presentes via atributo data-slot
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('AÇÃO: deve tratar clique no botão Finalizar', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ checkoutUrl: 'http://ok' })
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: () => Promise.resolve({ 
        data: { id: '1', price: 10, games: { title: 'T' }, profiles: { full_name: 'S' } }, 
        error: null 
      })
    } as any);

    render(<CheckoutPage params={Promise.resolve({ listingId: '1' })} />);
    await waitFor(() => { fireEvent.click(screen.getByRole('button', { name: /Finalizar Pedido/i })); });
    expect(global.fetch).toHaveBeenCalled();
  });
});
