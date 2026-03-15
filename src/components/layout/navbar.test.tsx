import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Navbar } from './navbar';
import { mockSupabaseAuth } from '../../../vitest.setup';

describe('Navbar', () => {
  it('deve renderizar o logo e os links principais', () => {
    render(<Navbar />);
    expect(screen.getByText('GameKey Market')).toBeInTheDocument();
  });

  it('deve mostrar o botão de Entrar quando o usuário não está logado', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null } as any);
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });
  });

  it('deve mostrar o ícone de usuário quando logado', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ 
      data: { user: { id: '123', email: 'test@example.com' } }, 
      error: null 
    } as any);

    render(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByTestId('icon-User')).toBeInTheDocument();
    });
  });
});
