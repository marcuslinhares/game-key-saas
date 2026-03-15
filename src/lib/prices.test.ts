import { describe, it, expect } from 'vitest';
import { calculateStartingPrice, formatCurrency, type Listing } from './prices';

describe('calculateStartingPrice', () => {
  it('deve retornar undefined se não houver listagens', () => {
    expect(calculateStartingPrice([])).toBeUndefined();
    expect(calculateStartingPrice(undefined)).toBeUndefined();
  });

  it('deve retornar undefined se não houver listagens ativas com estoque', () => {
    const listings: Listing[] = [
      { price: 10, active: false, stock_count: 5 },
      { price: 20, active: true, stock_count: 0 },
    ];
    expect(calculateStartingPrice(listings)).toBeUndefined();
  });

  it('deve retornar o menor preço entre as listagens válidas', () => {
    const listings: Listing[] = [
      { price: 50, active: true, stock_count: 10 },
      { price: 30, active: true, stock_count: 5 },
      { price: 20, active: false, stock_count: 5 }, // inativa
      { price: 10, active: true, stock_count: 0 },   // sem estoque
    ];
    expect(calculateStartingPrice(listings)).toBe(30);
  });
});

describe('formatCurrency', () => {
  it('deve formatar corretamente para BRL', () => {
    // Usamos regex porque o formatador pode usar espaços inquebráveis ou diferentes caracteres de moeda dependendo do ambiente
    const result = formatCurrency(1250.5);
    expect(result).toMatch(/R\$\s?1\.250,50/);
  });
});
