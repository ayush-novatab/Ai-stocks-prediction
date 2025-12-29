// Client-safe currency formatting utilities
// This file doesn't import yahoo-finance2 to avoid Node.js module issues in client components

export function isIndianStock(symbol: string): boolean {
  return symbol.toUpperCase().endsWith('.NS') || symbol.toUpperCase().endsWith('.BO');
}

export function formatCurrency(value: number, symbol: string): string {
  const isIndian = isIndianStock(symbol);
  const currencySymbol = isIndian ? '₹' : '$';
  return `${currencySymbol}${value.toFixed(2)}`;
}

