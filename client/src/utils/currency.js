/**
 * Format a number as currency with thousands separators
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, decimals = 2) => {
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^\d.]/g, ""))
      : Number(value);

  if (isNaN(numericValue)) return "0.00";

  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Parse price from string or number format
 * @param {number|string} price - The price to parse
 * @returns {number} Numeric price value
 */
export const parsePrice = (price) => {
  if (typeof price === "string") {
    return parseFloat(price.replace(/[^\d.]/g, ""));
  }
  return Number(price);
};
