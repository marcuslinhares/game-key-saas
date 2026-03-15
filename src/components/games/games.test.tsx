import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from './game-card';
import { SearchBar } from './search-bar';

describe('GameCard', () => {
  const props = {
    id: '1',
    title: 'Elden Ring',
    platform: 'PC',
    region_lock: 'Global',
    cover_image: 'https://example.com/cover.jpg',
    starting_price: 150.50
  };

  it('deve renderizar as informações do jogo', () => {
    render(<GameCard {...props} />);
    
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
    expect(screen.getByText('PC')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?150[.,]50/)).toBeInTheDocument();
  });

  it('deve mostrar "Indisponível" quando não há preço', () => {
    render(<GameCard {...props} starting_price={undefined} />);
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  it('deve chamar onSearch quando o usuário digita', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/Buscar jogos/i);
    fireEvent.change(input, { target: { value: 'Zelda' } });
    
    expect(onSearch).toHaveBeenCalledWith('Zelda');
  });
});
