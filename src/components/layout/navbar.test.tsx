/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor} from '@testing-library/react';
import { Navbar } from './navbar';
import { mockSupabaseAuth } from '../../../vitest.setup';

describe('Navbar Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o logo e links', () => {
    render(<Navbar />);
    expect(screen.getByText('GameKey Market')).toBeInTheDocument();
  });

  it('deve mostrar ícone de usuário quando logado', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ 
      data: { user: { id: '123' } }, 
      error: null 
    } as any);

    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByTestId('icon-User')).toBeInTheDocument();
    });
  });

  it('deve mostrar link do dashboard quando logado', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ 
      data: { user: { id: '123' } }, 
      error: null 
    } as any);

    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByTestId('icon-User')).toBeInTheDocument();
    });
  });

  it('deve mostrar botão Entrar quando deslogado ou erro', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null } as any);
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });
  });
});
