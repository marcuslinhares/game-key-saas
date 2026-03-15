import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';
import { Card, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Input } from './input';

describe('UI Base Components', () => {
  describe('Button', () => {
    it('deve renderizar corretamente e aceitar cliques', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique aqui</Button>);
      
      const button = screen.getByRole('button', { name: /clique aqui/i });
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve renderizar variantes diferentes', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive/10');
      
      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-border');
    });
  });

  describe('Card', () => {
    it('deve renderizar a estrutura do card', () => {
      render(
        <Card>
          <CardTitle>Título do Card</CardTitle>
          <CardContent>Conteúdo do Card</CardContent>
        </Card>
      );
      
      expect(screen.getByText('Título do Card')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo do Card')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('deve renderizar com o texto correto', () => {
      render(<Badge>Novo</Badge>);
      expect(screen.getByText('Novo')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('deve aceitar entrada de texto', () => {
      render(<Input placeholder="Seu nome" />);
      const input = screen.getByPlaceholderText('Seu nome') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Marcus' } });
      expect(input.value).toBe('Marcus');
    });
  });
});
