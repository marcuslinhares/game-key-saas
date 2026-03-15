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
  });

  it('deve renderizar detalhes da compra e selecionar pagamento', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: () => Promise.resolve({ 
        data: { 
          id: 'list-123', 
          price: 150.00, 
          games: { title: 'God of War', cover_image: '/gow.jpg', platform: 'PS5' },
          profiles: { full_name: 'Seller' }
        }, 
        error: null 
      })
    } as any);

    render(<CheckoutPage params={Promise.resolve({ listingId: 'list-123' })} />);
    
    await waitFor(() => {
      expect(screen.getByText('God of War')).toBeInTheDocument();
      // O preço aparece no resumo e no total, usamos getAll
      expect(screen.getAllByText(/150/)).toHaveLength(2);
    });

    expect(screen.getByText(/Pix/i)).toBeInTheDocument();
  });

  it('deve chamar a API de checkout ao clicar em finalizar', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ checkoutUrl: 'https://stripe.com/pay' })
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
    
    // O texto no botão real é "Finalizar Pedido" (com ícone)
    await waitFor(async () => {
      const button = screen.getByRole('button', { name: /Finalizar Pedido/i });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.any(Object));
    });
  });
});
