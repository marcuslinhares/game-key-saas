import { describe, it, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

describe('LoginPage', () => {
  it('deve renderizar a página de login', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome to the Game Key Marketplace/i)).toBeInTheDocument();
  });
});
