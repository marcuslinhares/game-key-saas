/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminGamesPage from './page';
import { supabase } from '@/lib/supabase';

describe('AdminGamesPage Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('SUCESSO: deve listar jogos carregados do Supabase', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'g1', title: 'Cyberpunk 2077', platform: 'PC', region_lock: 'Global', created_at: new Date().toISOString() },
        ],
        error: null
      })
    }));

    render(<AdminGamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    });
  });

  it('AÇÃO: deve permitir excluir um jogo ao clicar no botão de deletar', async () => {
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'g1', title: 'Game to Delete', platform: 'PC', region_lock: 'Global' }],
            error: null
          }),
          delete: mockDelete,
          eq: mockEq
        };
      }
    });

    render(<AdminGamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Game to Delete')).toBeInTheDocument();
    });

    // Procura por todos os botões e clica no que tem o ícone/classe de deletar
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(b => b.innerHTML.includes('icon-Trash2'));
    if (deleteButton) fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });
});
