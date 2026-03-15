/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';
import { supabase } from '@/lib/supabase';

describe('AuthForm Rigorous Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os campos de login', () => {
    render(<AuthForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('deve chamar signUp com sucesso', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({ 
      data: { user: { id: '1' } }, 
      error: null 
    } as any);

    render(<AuthForm />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Check your email for confirmation/i)).toBeInTheDocument();
    });
  });

  it('ERRO: deve mostrar erro no cadastro', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({ 
      data: { user: null }, 
      error: { message: 'Erro Cadastro' } 
    } as any);

    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Erro Cadastro')).toBeInTheDocument();
    });
  });

  it('SUCESSO: deve logar com sucesso', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({ 
      data: { user: { id: '1' } }, 
      error: null 
    } as any);

    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Logged in successfully/i)).toBeInTheDocument();
    });
  });
});
