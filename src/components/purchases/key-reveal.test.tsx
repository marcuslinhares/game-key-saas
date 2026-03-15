/* eslint-disable @typescript-eslint/no-explicit-any */
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

  it('AÇÃO: deve permitir copiar a chave para o clipboard', async () => {
    // Mock do clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() }
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ keyCode: 'KEY-123' })
    });

    render(<KeyReveal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Revelar Chave/i }));

    await waitFor(() => {
      expect(screen.getByText('KEY-123')).toBeInTheDocument();
    });

    // Clica no botão de cópia (que agora tem o ícone de cópia)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // O botão de cópia é o primeiro/único após a revelação

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('KEY-123');
  });
});
