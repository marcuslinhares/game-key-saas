import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentSelector } from './payment-selector';

describe('PaymentSelector', () => {
  it('deve renderizar as opções de pagamento corretamente', () => {
    const onValueChange = vi.fn();
    render(<PaymentSelector value="stripe" onValueChange={onValueChange} />);
    
    expect(screen.getByText(/Cartão \/ Global/i)).toBeInTheDocument();
    expect(screen.getByText(/Pix \(Brasil\)/i)).toBeInTheDocument();
  });

  it('deve mostrar o badge "Grátis" na opção Pix', () => {
    render(<PaymentSelector value="stripe" onValueChange={vi.fn()} />);
    expect(screen.getByText(/Grátis/i)).toBeInTheDocument();
  });

  it('deve alternar entre métodos de pagamento', () => {
    const onValueChange = vi.fn();
    render(<PaymentSelector value="pix" onValueChange={onValueChange} />);
    
    // Procura pelo texto do método de pagamento e clica
    const stripeOption = screen.getByText(/Cartão \/ Global/i);
    fireEvent.click(stripeOption);
    
    expect(onValueChange).toHaveBeenCalledWith('stripe', expect.anything());
  });
});
