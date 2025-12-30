// Fundamental data using Alpha Vantage API (free tier)

export interface FundamentalData {
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  revenue?: number;
  profitMargin?: number;
  roe?: number; // Return on Equity
  roa?: number; // Return on Assets
  debtToEquity?: number;
  currentRatio?: number;
}

export async function getFundamentalData(symbol: string): Promise<FundamentalData | null> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      console.warn('Alpha Vantage API key not configured');
      return null;
    }
    
    // Alpha Vantage Overview endpoint
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch fundamental data');
    }
    
    const data = await response.json();
    
    // Check for API error messages
    if (data['Note']) {
      console.warn('Alpha Vantage API rate limit reached');
      return null;
    }
    
    if (data['Error Message']) {
      console.warn('Alpha Vantage API error:', data['Error Message']);
      return null;
    }
    
    // Parse the response
    return {
      symbol: data['Symbol'] || symbol,
      name: data['Name'] || symbol,
      description: data['Description'],
      sector: data['Sector'],
      industry: data['Industry'],
      marketCap: data['MarketCapitalization'] ? parseFloat(data['MarketCapitalization']) : undefined,
      peRatio: data['PERatio'] ? parseFloat(data['PERatio']) : undefined,
      eps: data['EPS'] ? parseFloat(data['EPS']) : undefined,
      dividendYield: data['DividendYield'] ? parseFloat(data['DividendYield']) : undefined,
      beta: data['Beta'] ? parseFloat(data['Beta']) : undefined,
      fiftyTwoWeekHigh: data['52WeekHigh'] ? parseFloat(data['52WeekHigh']) : undefined,
      fiftyTwoWeekLow: data['52WeekLow'] ? parseFloat(data['52WeekLow']) : undefined,
      revenue: data['RevenueTTM'] ? parseFloat(data['RevenueTTM']) : undefined,
      profitMargin: data['ProfitMargin'] ? parseFloat(data['ProfitMargin']) : undefined,
      roe: data['ReturnOnEquityTTM'] ? parseFloat(data['ReturnOnEquityTTM']) : undefined,
      roa: data['ReturnOnAssetsTTM'] ? parseFloat(data['ReturnOnAssetsTTM']) : undefined,
      debtToEquity: data['DebtToEquity'] ? parseFloat(data['DebtToEquity']) : undefined,
      currentRatio: data['CurrentRatio'] ? parseFloat(data['CurrentRatio']) : undefined,
    };
  } catch (error) {
    console.error('Error fetching fundamental data:', error);
    return null;
  }
}

