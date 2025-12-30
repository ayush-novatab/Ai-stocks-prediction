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
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic?: {
    k: number;
    d: number;
  };
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
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }

  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  
  // Calculate standard deviation
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: Math.round((sma + stdDev * standardDeviation) * 100) / 100,
    middle: Math.round(sma * 100) / 100,
    lower: Math.round((sma - stdDev * standardDeviation) * 100) / 100,
  };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number; d: number } {
  if (highs.length < kPeriod || lows.length < kPeriod || closes.length < kPeriod) {
    return { k: 50, d: 50 };
  }

  const recentHighs = highs.slice(-kPeriod);
  const recentLows = lows.slice(-kPeriod);
  const recentCloses = closes.slice(-kPeriod);

  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const currentClose = recentCloses[recentCloses.length - 1];

  if (highestHigh === lowestLow) {
    return { k: 50, d: 50 };
  }

  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

  // Calculate %D (3-period SMA of %K)
  let d = k;
  if (closes.length >= kPeriod + dPeriod - 1) {
    const kValues: number[] = [];
    for (let i = closes.length - dPeriod; i < closes.length; i++) {
      const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
      const periodLows = lows.slice(i - kPeriod + 1, i + 1);
      const periodCloses = closes.slice(i - kPeriod + 1, i + 1);
      const hh = Math.max(...periodHighs);
      const ll = Math.min(...periodLows);
      const cc = periodCloses[periodCloses.length - 1];
      if (hh !== ll) {
        kValues.push(((cc - ll) / (hh - ll)) * 100);
      } else {
        kValues.push(50);
      }
    }
    d = kValues.reduce((a, b) => a + b, 0) / kValues.length;
  }

  return {
    k: Math.round(k * 100) / 100,
    d: Math.round(d * 100) / 100,
  };
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
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, Math.min(20, closes.length));
  const sma50 = calculateSMA(closes, Math.min(50, closes.length));
  const sma200 = calculateSMA(closes, Math.min(200, closes.length));
  
  // Calculate Bollinger Bands (only if we have enough data)
  const bollingerBands = closes.length >= 20 
    ? calculateBollingerBands(closes, 20, 2)
    : undefined;
  
  // Calculate Stochastic Oscillator (only if we have enough data)
  const stochastic = closes.length >= 14 && highs.length >= 14 && lows.length >= 14
    ? calculateStochastic(highs, lows, closes, 14, 3)
    : undefined;

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
    bollingerBands,
    stochastic,
  };
}

