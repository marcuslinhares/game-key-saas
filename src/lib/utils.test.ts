import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from './utils';

describe('Basic Utils', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toContain('100,00');
  });

  it('should join classes correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
    expect(cn('btn', '')).toBe('btn');
    expect(cn('btn', null, 'active')).toBe('btn active');
  });
});
