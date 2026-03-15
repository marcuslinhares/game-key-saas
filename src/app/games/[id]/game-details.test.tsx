/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GamePage from './page';
import { supabase } from '@/lib/supabase';

// Mock do hook use para o parâmetro id
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual as any,
    use: () => ({ id: 'game-123' }),
  };
});

describe('GameDetailsPage Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUCESSO: deve renderizar detalhes do jogo', async () => {
    const mockGame = {
      id: 'game-123',
      title: 'Zelda Breath of the Wild',
      platform: 'Switch',
      region_lock: 'Global',
      cover_image: '/zelda.jpg',
      listings: []
    };

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
    }));

    render(<GamePage params={Promise.resolve({ id: 'game-123' })} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Zelda Breath/i)).toBeInTheDocument();
    });
  });

  it('TRATAMENTO DE ERRO: deve exibir mensagem de erro ao falhar', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('NotFound') })
    }));

    render(<GamePage params={Promise.resolve({ id: 'invalid' })} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Jogo não encontrado/i)).toBeInTheDocument();
    });
  });

  it('ESTADO: deve mostrar mensagem quando não houver ofertas', async () => {
    const mockGame = {
      id: 'game-456',
      title: 'Elden Ring',
      platform: 'PC',
      region_lock: 'Global',
      listings: [] // Lista vazia de ofertas
    };

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
    }));

    render(<GamePage params={Promise.resolve({ id: 'game-456' })} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma oferta disponível/i)).toBeInTheDocument();
    });
  });
});
