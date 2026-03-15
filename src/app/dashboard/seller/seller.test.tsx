/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SellerDashboard from './page';
import { supabase } from '@/lib/supabase';

// Mock do componente StatsCards para focar no teste da página
vi.mock('@/components/seller/stats-cards', () => ({
  StatsCards: () => <div data-testid="stats-cards">Stats</div>,
}));

describe('SellerDashboard Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUCESSO: deve renderizar dados do perfil e listagem de anúncios', async () => {
    // Mock do usuário logado
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'seller-123' } },
      error: null
    });

    // Mock do perfil e anúncios
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { balance_available: '100.00', balance_pending: '50.00' },
            error: null
          })
        };
      }
      if (table === 'listings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'l1', active: true, price: 100, stock_count: 5, games: { title: 'Game 1', platform: 'PC' } },
              { id: 'l2', active: false, price: 50, stock_count: 0, games: { title: 'Game 2', platform: 'PS5' } }
            ],
            error: null
          })
        };
      }
    });

    render(<SellerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Painel do Vendedor')).toBeInTheDocument();
      expect(screen.getByText('Game 1')).toBeInTheDocument();
      expect(screen.getByText('Game 2')).toBeInTheDocument();
    });
  });

  it('TRATAMENTO DE ERRO: deve lidar com falha ao buscar dados', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'seller-123' } },
      error: null
    });

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Erro Perfil') }),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('Erro Anúncios') })
    }));

    render(<SellerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Painel do Vendedor')).toBeInTheDocument();
    });
  });
});
