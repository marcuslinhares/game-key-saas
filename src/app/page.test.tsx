/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';
import { supabase } from '@/lib/supabase';

// Mockamos o GameCard para focar no comportamento da Home
vi.mock('@/components/games/game-card', () => ({
  GameCard: ({ title }: { title: string }) => <div data-testid="game-card">{title}</div>
}));

describe('Home Page', () => {
  const mockGames = [
    { id: '1', title: 'Elden Ring', platform: 'PC', region_lock: 'Global', listings: [] },
    { id: '2', title: 'FIFA 24', platform: 'PS5', region_lock: 'Latam', listings: [] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o hero section', () => {
    render(<Home />);
    expect(screen.getByText(/Sua próxima aventura/i)).toBeInTheDocument();
  });

  it('deve carregar e renderizar jogos do Supabase', async () => {
    // Configuramos o mock para retornar os jogos
    const fromSpy = vi.spyOn(supabase, 'from');
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: mockGames, error: null })
    } as any);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      expect(screen.getByText('FIFA 24')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando não houver jogos', async () => {
    const fromSpy = vi.spyOn(supabase, 'from');
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: [], error: null })
    } as any);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum jogo encontrado/i)).toBeInTheDocument();
    });
  });
});
