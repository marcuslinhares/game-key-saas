/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PurchasesPage from './page';
import { supabase } from '@/lib/supabase';

describe('PurchasesPage Rigorous Testing', () => {
  it('deve mostrar mensagem quando não houver compras', async () => {
    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: [], error: null })
    } as any);

    render(<PurchasesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Você ainda não realizou nenhuma compra/i)).toBeInTheDocument();
    });
  });

  it('SUCESSO: deve listar pedidos carregados', async () => {
    const mockOrders = [
      {
        id: 'o1',
        created_at: new Date().toISOString(),
        status: 'completed',
        listings: {
          games: {
            title: 'Game 1',
            cover_image: '/img1.jpg',
            platform: 'PC'
          }
        }
      }
    ];

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: mockOrders, error: null })
    } as any);

    render(<PurchasesPage />);
    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  it('ESTADO: deve mostrar status pendente corretamente', async () => {
    const mockOrders = [
      {
        id: 'o2',
        created_at: new Date().toISOString(),
        status: 'pending',
        listings: { games: { title: 'Game Pending', cover_image: '/img2.jpg', platform: 'PS5' } }
      }
    ];

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: mockOrders, error: null })
    } as any);

    render(<PurchasesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Aguardando confirmação/i)).toBeInTheDocument();
    });
  });

  it('deve lidar com erro de carregamento', async () => {
    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: null, error: { message: 'Erro Banco' } })
    } as any);

    render(<PurchasesPage />);
    await waitFor(() => {
      // O componente deve apenas parar o loading e não crashar
      expect(screen.getByText('Minhas Compras')).toBeInTheDocument();
    });
  });
});
