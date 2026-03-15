export interface Listing {
  price: number;
  active: boolean;
  stock_count: number;
}

/**
 * Calcula o preço inicial (mínimo) de um jogo baseado em suas listagens ativas e com estoque.
 */
export function calculateStartingPrice(listings?: Listing[]): number | undefined {
  if (!listings || listings.length === 0) {
    return undefined;
  }

  const activeListings = listings.filter(
    (l) => l.active && l.stock_count > 0
  );

  if (activeListings.length === 0) {
    return undefined;
  }

  return Math.min(...activeListings.map((l) => l.price));
}

/**
 * Formata um valor numérico para a moeda brasileira (BRL).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
