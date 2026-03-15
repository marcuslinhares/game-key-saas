import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';
import { supabase } from '@/lib/supabase';

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os campos de email e senha', () => {
    render(<AuthForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('deve mostrar erro se o login falhar', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({ 
      data: {}, 
      error: { message: 'Credenciais inválidas' } 
    } as any);

    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro se o cadastro falhar', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({ 
      data: {}, 
      error: { message: 'Email já existe' } 
    } as any);

    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Email já existe')).toBeInTheDocument();
    });
  });
});
