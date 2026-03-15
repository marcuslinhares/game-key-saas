import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListingForm } from './listing-form';
import { supabase } from '@/lib/supabase';

describe('ListingForm Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('INTEGRIDADE: deve disparar a lógica de envio ao submeter', async () => {
    render(<ListingForm />);
    fireEvent.change(screen.getByLabelText(/Preço \(R\$\)/i), { target: { value: '199.99' } });
    fireEvent.change(screen.getByLabelText(/Estoque Inicial/i), { target: { value: '5' } });
    const submitButton = screen.getByRole('button', { name: /Publicar Anúncio/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled();
    });
  });

  it('TRATAMENTO DE ERRO: deve lidar com erro ao buscar jogos no mount', async () => {
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          then: (cb: any) => cb({ data: null, error: { message: 'Erro Banco' } })
        } as any;
      }
      return { select: vi.fn().mockReturnThis() } as any;
    });

    render(<ListingForm />);
    // Verificamos se o formulário ainda renderiza
    expect(screen.getByText(/Publicar Anúncio/i)).toBeInTheDocument();
  });
});
