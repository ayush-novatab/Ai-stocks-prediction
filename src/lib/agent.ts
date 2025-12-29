export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  content?: string;
}

export interface StockAnalysis {
  symbol: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // 0-100
  summary: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  news: NewsItem[];
  reasoning?: string[];
  price?: {
    current: number;
    change: number;
    changePercent: number;
  };
}

import { searchStockNews } from './news';
import { analyzeSentiment } from './ai-analysis';
import { getStockQuote, formatStockSymbol } from './stock-data';

export async function analyzeStock(query: string): Promise<StockAnalysis> {
  // Format the symbol (add .NS for Indian stocks if needed)
  const symbol = formatStockSymbol(query.toUpperCase().trim());
  
  // Fetch stock quote and news in parallel
  const [quote, news] = await Promise.all([
    getStockQuote(symbol),
    searchStockNews(symbol),
  ]);

  // Get price data if available
  const priceData = quote ? {
    current: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
  } : undefined;

  // Analyze sentiment using AI
  const sentimentAnalysis = await analyzeSentiment(symbol, news, priceData);
  
  return {
    symbol,
    sentiment: sentimentAnalysis.sentiment,
    score: sentimentAnalysis.score,
    summary: sentimentAnalysis.summary,
    recommendation: sentimentAnalysis.recommendation,
    reasoning: sentimentAnalysis.reasoning,
    news,
    price: priceData,
  };
}
