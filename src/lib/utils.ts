export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const cn = (...classes: unknown[]) => {
  return classes.filter(Boolean).join(' ');
};
