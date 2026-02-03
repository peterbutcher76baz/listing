/** * Constants for AU/RESO localization
 * SQFT to SQM: 1 sqft = 0.092903 sqm 
 */
export const SQM_CONVERSION_FACTOR = 0.092903;

export const formatArea = (sqft: number | undefined): string => {
  if (!sqft) return "N/A";
  const sqm = Math.round(sqft * SQM_CONVERSION_FACTOR);
  return `${sqm} m²`;
};

export const formatAUD = (amount: number | undefined): string => {
  if (!amount) return "TBD";
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};
