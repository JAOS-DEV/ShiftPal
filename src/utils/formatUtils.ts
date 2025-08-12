// Format currency amount to GBP format
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format number with specified decimal places
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Format percentage
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${formatNumber(value, decimals)}%`;
};
