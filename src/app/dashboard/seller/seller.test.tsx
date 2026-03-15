import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SellerDashboard from './page';

describe('SellerDashboard', () => {
  it('deve renderizar o dashboard carregado', async () => {
    render(<SellerDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Painel do Vendedor')).toBeInTheDocument();
    });
  });
});
