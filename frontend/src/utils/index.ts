// Utilidades generales del frontend

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('es-ES');
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
};

