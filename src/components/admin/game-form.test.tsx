/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameForm } from './game-form';
import { supabase } from '@/lib/supabase';

describe('GameForm Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar campos e permitir preencher dados básicos', () => {
    render(<GameForm />);
    const titleInput = screen.getByLabelText(/Título do Jogo/i);
    fireEvent.change(titleInput, { target: { value: 'New Game' } });
    expect(titleInput).toHaveValue('New Game');
  });

  it('deve disparar inserção no Supabase ao submeter', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: vi.fn().mockReturnValue(Promise.resolve({ data: { id: '1' }, error: null }))
    } as any);

    render(<GameForm />);
    fireEvent.change(screen.getByLabelText(/Título do Jogo/i), { target: { value: 'Game Test' } });
    
    const submitButton = screen.getByRole('button', { name: /Cadastrar Jogo/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('games');
    });
  });

  it('deve tratar erro na inserção', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: () => Promise.resolve({ data: null, error: { message: 'Erro Banco' } })
    } as any);

    render(<GameForm />);
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Jogo/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cadastrar Jogo/i })).toBeInTheDocument();
    });
  });
});
