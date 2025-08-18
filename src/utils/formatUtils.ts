// Format currency amount to GBP format
export const formatCurrency = (amount: number): string => {
  // Handle NaN and invalid numbers gracefully
  if (isNaN(amount) || !isFinite(amount)) {
    return "£0.00";
  }
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

// Safely parse and round numbers to avoid floating point precision issues
export const parseAndRoundFloat = (
  value: string,
  decimals: number = 2
): number => {
  const parsed = parseFloat(value) || 0;
  return Math.round(parsed * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
