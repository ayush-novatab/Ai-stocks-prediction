import YahooFinance from 'yahoo-finance2';

// Create an instance of YahooFinance
const yahooFinance = new YahooFinance();

// Helper function to format stock symbols for Indian stocks
export function formatStockSymbol(symbol: string): string {
  const cleanSymbol = symbol.toUpperCase().trim();
  
  // If already has .NS or .BO suffix, return as is
  if (cleanSymbol.endsWith('.NS') || cleanSymbol.endsWith('.BO')) {
    return cleanSymbol;
  }
  
  // List of common Indian stock symbols (NSE)
  const indianStocks = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK',
    'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT', 'AXISBANK', 'ASIANPAINT',
    'MARUTI', 'TITAN', 'ULTRACEMCO', 'NESTLEIND', 'WIPRO', 'SUNPHARMA',
    'ONGC', 'NTPC', 'POWERGRID', 'COALINDIA', 'GAIL', 'IOC', 'BPCL',
    'HCLTECH', 'BAJFINANCE', 'TATAMOTORS', 'INDUSINDBK', 'TECHM', 'JSWSTEEL',
    'TATASTEEL', 'ADANIENT', 'ADANIPORTS', 'HDFCLIFE', 'DIVISLAB', 'DRREDDY',
    'CIPLA', 'GRASIM', 'BAJAJFINSV', 'EICHERMOT', 'HEROMOTOCO', 'BRITANNIA',
    'APOLLOHOSP', 'DABUR', 'GODREJCP', 'MARICO', 'PIDILITIND', 'COLPAL'
  ];
  
  // If it matches an Indian stock, add .NS suffix (default to NSE)
  if (indianStocks.includes(cleanSymbol)) {
    return `${cleanSymbol}.NS`;
  }
  
  // Default: return as is (assumes US stock or already formatted)
  return cleanSymbol;
}

export function isIndianStock(symbol: string): boolean {
  return symbol.toUpperCase().endsWith('.NS') || symbol.toUpperCase().endsWith('.BO');
}

export function formatCurrency(value: number, symbol: string): string {
  const isIndian = isIndianStock(symbol);
  const currencySymbol = isIndian ? '₹' : '$';
  return `${currencySymbol}${value.toFixed(2)}`;
}

export interface StockPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  previousClose?: number;
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // Format the symbol (add .NS for Indian stocks if needed)
    const formattedSymbol = formatStockSymbol(symbol);
    
    // Try quoteSummary first as it's more reliable
    let result: any = null;
    
    try {
      const summary = await yahooFinance.quoteSummary(formattedSymbol, {
        modules: ['price', 'summaryDetail']
      });
      
      if (summary && summary.price) {
        const price = summary.price;
        // Handle both object format (with .raw) and direct number format
        const getValue = (val: any): number => {
          if (val === null || val === undefined) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'object' && 'raw' in val) return val.raw || 0;
          return 0;
        };
        
        result = {
          symbol: price.symbol || formattedSymbol,
          price: getValue(price.regularMarketPrice),
          change: getValue(price.regularMarketPrice) - getValue(price.regularMarketPreviousClose),
          changePercent: getValue(price.regularMarketChangePercent),
          volume: getValue(price.regularMarketVolume),
          marketCap: getValue(price.marketCap),
          previousClose: getValue(price.regularMarketPreviousClose),
        };
      }
    } catch (e) {
      console.log('quoteSummary failed, trying historical data approach');
    }
    
    // Fallback: Use historical data to get current price
    if (!result) {
      const historical = await yahooFinance.historical(formattedSymbol, {
        period1: Math.floor((Date.now() - 86400000) / 1000), // Yesterday
        period2: Math.floor(Date.now() / 1000),
        interval: '1d' as const,
      });
      
      if (historical && historical.length > 0) {
        const latest = historical[historical.length - 1];
        const previous = historical.length > 1 ? historical[historical.length - 2] : latest;
        const change = latest.close - previous.close;
        const changePercent = previous.close !== 0 ? (change / previous.close) * 100 : 0;
        
        result = {
          symbol: formattedSymbol,
          price: latest.close,
          change,
          changePercent,
          volume: latest.volume || 0,
          previousClose: previous.close,
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
}

export async function getHistoricalData(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max'
): Promise<StockPriceData[]> {
  try {
    // Format the symbol (add .NS for Indian stocks if needed)
    const formattedSymbol = formatStockSymbol(symbol);
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '5d':
        startDate.setDate(endDate.getDate() - 5);
        break;
      case '1mo':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3mo':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6mo':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '2y':
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
      case '5y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case '10y':
        startDate.setFullYear(endDate.getFullYear() - 10);
        break;
      case 'ytd':
        startDate.setMonth(0, 1);
        break;
      case 'max':
        startDate.setFullYear(2000);
        break;
    }

    // Determine interval based on period
    let interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1d';
    if (period === '1d') {
      interval = '5m';
    } else if (period === '5d') {
      interval = '15m';
    } else {
      interval = '1d';
    }

    const queryOptions: any = {
      period1: Math.floor(startDate.getTime() / 1000),
      period2: Math.floor(endDate.getTime() / 1000),
      interval,
    };

    const historical = await yahooFinance.historical(formattedSymbol, queryOptions);
    
    if (!historical || historical.length === 0) {
      return [];
    }
    
    return historical
      .filter(item => item.date && item.close !== null && item.close !== undefined)
      .map(item => ({
        date: item.date.toISOString(),
        open: item.open || item.close || 0,
        high: item.high || item.close || 0,
        low: item.low || item.close || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }))
      .reverse(); // Reverse to show oldest to newest
  } catch (error: any) {
    console.error('Error fetching historical data:', error);
    console.error('Error details:', error?.message, error?.stack);
    return []; // Return empty array instead of throwing
  }
}

