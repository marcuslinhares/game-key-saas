/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GamePage from './page';
import { supabase } from '@/lib/supabase';

// Mock do hook use para o parâmetro id
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual as any,
    use: (promise: any) => ({ id: '1' }),
  };
});

describe('GameDetailsPage', () => {
  it('deve renderizar os detalhes do jogo após carregar', async () => {
    const mockGame = {
      id: '1',
      title: 'Zelda Breath of the Wild',
      platform: 'Switch',
      region_lock: 'Global',
      listings: []
    };

    const fromSpy = vi.spyOn(supabase, 'from');
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: mockGame, error: null })
    } as any);

    render(<GamePage params={Promise.resolve({ id: '1' })} />);
    
    await waitFor(() => {
      expect(screen.getByText('Zelda Breath of the Wild')).toBeInTheDocument();
    });
  });
});
