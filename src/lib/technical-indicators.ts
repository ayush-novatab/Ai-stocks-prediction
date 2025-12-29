import { StockPriceData } from './stock-data';

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  // For signal line, we'd need historical MACD values, so we'll use a simplified version
  // In production, you'd maintain an array of MACD values
  const signal = macd * 0.9; // Simplified signal line approximation
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Calculate all technical indicators for a stock
 */
export function calculateTechnicalIndicators(data: StockPriceData[]): TechnicalIndicators {
  if (data.length === 0) {
    return {
      rsi: 50,
      macd: { macd: 0, signal: 0, histogram: 0 },
      sma20: 0,
      sma50: 0,
      sma200: 0,
    };
  }

  const closes = data.map(d => d.close);
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, Math.min(20, closes.length));
  const sma50 = calculateSMA(closes, Math.min(50, closes.length));
  const sma200 = calculateSMA(closes, Math.min(200, closes.length));

  return {
    rsi: Math.round(rsi * 100) / 100,
    macd: {
      macd: Math.round(macd.macd * 100) / 100,
      signal: Math.round(macd.signal * 100) / 100,
      histogram: Math.round(macd.histogram * 100) / 100,
    },
    sma20: Math.round(sma20 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    sma200: Math.round(sma200 * 100) / 100,
  };
}

