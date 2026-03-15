import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KeyReveal } from './key-reveal';

describe('KeyReveal Rigorous Testing', () => {
  const props = {
    orderId: 'ord-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('deve exibir a chave real após sucesso (validando keyCode)', async () => {
    const secretKey = 'AAAA-BBBB-CCCC-DDDD';
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ keyCode: secretKey })
    });

    render(<KeyReveal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Revelar Chave/i }));

    await waitFor(() => {
      // O componente renderiza a chave dentro de um <code>
      expect(screen.getByText(secretKey)).toBeInTheDocument();
    });
  });

  it('deve manter o botão se a API falhar', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Erro' })
    });

    render(<KeyReveal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Revelar Chave/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Revelar Chave/i })).toBeInTheDocument();
    });
  });
});
