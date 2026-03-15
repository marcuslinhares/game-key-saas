import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SellerOfferCard } from './seller-offer-card';

describe('SellerOfferCard', () => {
  const mockOffer = {
    id: 'listing-123',
    price: 150.50,
    seller: {
      full_name: 'Vendedor Alpha',
      reputation_score: 4.8
    },
    onBuy: vi.fn()
  };

  it('deve chamar onBuy com o ID correto ao clicar em comprar', () => {
    render(<SellerOfferCard {...mockOffer} />);
    const buyButton = screen.getByRole('button', { name: /Comprar/i });
    fireEvent.click(buyButton);
    expect(mockOffer.onBuy).toHaveBeenCalledWith('listing-123');
  });

  it('deve mostrar nome padrão se o vendedor não tiver nome', () => {
    const anonymousOffer = { ...mockOffer, seller: { full_name: '', reputation_score: 0 } };
    render(<SellerOfferCard {...anonymousOffer} />);
    expect(screen.getByText(/Vendedor/i)).toBeInTheDocument();
  });
});
