import { describe, it, expect, vi } from 'vitest';
import { render, screen} from '@testing-library/react';
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
});
