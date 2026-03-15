import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from './stats-cards';

describe('StatsCards', () => {
  const props = {
    balanceAvailable: 1500.50,
    balancePending: 300.00,
    totalSales: 45,
    activeListings: 12
  };

  it('deve renderizar os valores financeiros corretamente', () => {
    render(<StatsCards {...props} />);
    // Buscamos apenas os números para evitar problemas de formatação de moeda regional
    expect(screen.getByText(/1500/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it('deve renderizar os contadores de vendas e anúncios', () => {
    render(<StatsCards {...props} />);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
