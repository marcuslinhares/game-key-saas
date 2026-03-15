import { describe, it, expect } from 'vitest';
import { calculateStartingPrice, formatCurrency } from './prices';

describe('Prices Lib Rigorous Testing', () => {
  describe('calculateStartingPrice', () => {
    it('deve retornar undefined para lista nula ou vazia', () => {
      expect(calculateStartingPrice(undefined)).toBeUndefined();
      expect(calculateStartingPrice([])).toBeUndefined();
    });

    it('deve retornar o menor preço de listagens ativas com estoque', () => {
      const listings = [
        { price: 100, active: true, stock_count: 5 },
        { price: 50, active: true, stock_count: 2 },
        { price: 30, active: false, stock_count: 10 },
        { price: 10, active: true, stock_count: 0 },
      ];
      expect(calculateStartingPrice(listings)).toBe(50);
    });

    it('deve retornar undefined se nenhuma listagem for válida', () => {
      const listings = [
        { price: 30, active: false, stock_count: 10 },
        { price: 10, active: true, stock_count: 0 },
      ];
      expect(calculateStartingPrice(listings)).toBeUndefined();
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valor para BRL corretamente', () => {
      expect(formatCurrency(100)).toContain('100,00');
      expect(formatCurrency(0)).toContain('0,00');
    });
  });
});
