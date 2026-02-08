/**
 * Australian market: area in square metres (m²) only.
 */
export const formatAreaSqm = (sqm: number | undefined): string => {
  if (sqm == null || sqm <= 0) return "N/A";
  return `${Math.round(sqm)} m²`;
};

export const formatAUD = (amount: number | undefined): string => {
  if (!amount) return "TBD";
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};
