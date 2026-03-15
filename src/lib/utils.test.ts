import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from './utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores para BRL', () => {
      const result = formatCurrency(1500.50);
      expect(result).toMatch(/1[.,]500[.,]50/);
    });
  });

  describe('cn', () => {
    it('deve concatenar classes condicionalmente', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('a', false && 'b', 'c')).toBe('a c');
    });
  });
});
