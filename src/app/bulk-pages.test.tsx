import { describe, it, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import NewGamePage from './admin/games/new/page';
import CreateListingPage from './listings/create/page';

describe('Bulk Page Rendering', () => {
  it('deve renderizar a página de novo jogo sem quebrar', () => {
    render(<NewGamePage />);
    expect(screen.getByText('Cadastrar Novo Jogo')).toBeInTheDocument();
  });

  it('deve renderizar a página de criar anúncio sem quebrar', () => {
    render(<CreateListingPage />);
    expect(screen.getByText('Anunciar Jogo')).toBeInTheDocument();
  });
});
