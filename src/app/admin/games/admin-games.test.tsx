import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminGamesPage from './page';

describe('AdminGamesPage', () => {
  it('deve renderizar o título do catálogo de jogos', async () => {
    render(<AdminGamesPage />);
    await waitFor(() => {
      expect(screen.getByText('Catálogo de Jogos')).toBeInTheDocument();
    });
  });
});
