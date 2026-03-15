import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameForm } from './game-form';
import { supabase } from '@/lib/supabase';

describe('GameForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar campos de título, descrição e plataforma', () => {
    render(<GameForm />);
    expect(screen.getByLabelText(/Título do Jogo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/Plataforma/i)).toBeInTheDocument();
  });

  it('deve submeter o formulário chamando supabase.insert', async () => {
    render(<GameForm />);
    
    fireEvent.change(screen.getByLabelText(/Título do Jogo/i), { target: { value: 'Elden Ring' } });
    
    const submitButton = screen.getByRole('button', { name: /Cadastrar Jogo/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('games');
    });
  });
});
