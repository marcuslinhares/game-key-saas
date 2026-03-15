/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameForm } from './game-form';
import { supabase } from '@/lib/supabase';

// Mock do useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('GameForm Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUCESSO: deve preencher campos e submeter novo jogo', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return { insert: mockInsert };
    });

    render(<GameForm />);
    
    fireEvent.change(screen.getByLabelText(/Título do Jogo/i), { target: { value: 'New Game' } });
    fireEvent.change(screen.getByLabelText(/Descrição/i), { target: { value: 'Description' } });
    fireEvent.change(screen.getByLabelText(/URL da Imagem/i), { target: { value: 'http://img.jpg' } });
    
    const submitButton = screen.getByRole('button', { name: /Cadastrar Jogo/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  it('SUCESSO: deve preencher campos e submeter atualização', async () => {
    const initialData = { id: '1', title: 'Old', platform: 'PC', region_lock: 'Global' };
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return { update: mockUpdate, eq: mockEq };
    });

    render(<GameForm initialData={initialData} />);
    fireEvent.change(screen.getByLabelText(/Título do Jogo/i), { target: { value: 'Updated' } });
    
    const submitButton = screen.getByRole('button', { name: /Atualizar Jogo/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
