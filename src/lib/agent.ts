export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
}

export interface StockAnalysis {
  symbol: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // 0-100
  summary: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  news: NewsItem[];
}

export async function analyzeStock(query: string): Promise<StockAnalysis> {
  // TODO: Replace with real Tavily/SerpAPI search
  // const searchResults = await searchWeb(`latest news analysis ${query} stock`);
  
  // TODO: Replace with real LLM call
  // const analysis = await llm.generate(...)

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency

  const isPositive = Math.random() > 0.5;
  
  return {
    symbol: query.toUpperCase(),
    sentiment: isPositive ? 'Bullish' : 'Bearish',
    score: isPositive ? 75 + Math.floor(Math.random() * 20) : 25 + Math.floor(Math.random() * 20),
    summary: isPositive 
      ? `Recent news for ${query} suggests strong momentum driven by positive earnings reports and sector growth.`
      : `Market sentiment for ${query} is cautious due to recent regulatory headwinds and mixed quarterly results.`,
    recommendation: isPositive ? 'BUY' : 'SELL',
    news: [
      {
        title: `${query} Q4 Earnings Beat Expectations`,
        source: 'Financial Times',
        url: '#',
        date: new Date().toISOString().split('T')[0]
      },
      {
        title: `Why investors are watching ${query} closely`,
        source: 'CNBC',
        url: '#',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      }
    ]
  };
}
