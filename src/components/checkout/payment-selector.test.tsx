import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentSelector } from './payment-selector';

describe('PaymentSelector', () => {
  it('deve renderizar as opções de pagamento corretamente', () => {
    const onSelect = vi.fn();
    render(<PaymentSelector selected="stripe" onSelect={onSelect} />);
    
    expect(screen.getByText(/Cartão \/ Global/i)).toBeInTheDocument();
    expect(screen.getByText(/Pix \(Brasil\)/i)).toBeInTheDocument();
  });

  it('deve mostrar o badge "Grátis" na opção Pix', () => {
    render(<PaymentSelector selected="stripe" onSelect={vi.fn()} />);
    expect(screen.getByText(/Grátis/i)).toBeInTheDocument();
  });
});
