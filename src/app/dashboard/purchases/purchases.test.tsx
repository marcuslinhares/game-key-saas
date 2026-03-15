import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PurchasesPage from './page';
import { supabase } from '@/lib/supabase';

describe('PurchasesPage', () => {
  it('deve renderizar o título da página', async () => {
    render(<PurchasesPage />);
    expect(screen.getByText('Minhas Compras')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não houver compras', async () => {
    // Forçamos retorno vazio
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
});
