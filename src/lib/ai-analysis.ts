export interface SentimentAnalysis {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // 0-100
  summary: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string[];
}

// Enhanced sentiment analysis using Natural.js (server-side only)
let natural: any = null;

async function getNatural() {
  // Natural.js only works server-side
  if (typeof window !== 'undefined') {
    return null; // Skip on client-side
  }
  
  // Server-side: use dynamic import
  if (!natural) {
    try {
      natural = await import('natural');
    } catch (error) {
      console.warn('Natural.js not available, using keyword-based analysis');
      return null;
    }
  }
  return natural;
}

// Free sentiment analysis using Natural.js + keyword-based approach
async function analyzeTextSentiment(text: string): Promise<number> {
  // Try Natural.js first (server-side only)
  const naturalLib = await getNatural();
  
  if (naturalLib) {
    try {
      const { SentimentAnalyzer, PorterStemmer } = naturalLib;
      
      // Use Natural.js SentimentAnalyzer
      const analyzer = new SentimentAnalyzer('English', PorterStemmer, ['negation']);
      const tokens = text.toLowerCase().split(/\W+/).filter(token => token.length > 0);
      
      if (tokens.length > 0) {
        const analysis = analyzer.getSentiment(tokens);
        
        // Natural.js returns -1 to 1, convert to 0-100 scale
        // -1 (very negative) -> 0, 0 (neutral) -> 50, 1 (very positive) -> 100
        const naturalScore = Math.round((analysis + 1) * 50);
        
        // Combine with keyword-based approach for financial context
        const keywordScore = analyzeTextSentimentFallback(text);
        
        // Weighted average: 60% Natural.js, 40% keyword-based (for financial context)
        const finalScore = Math.round(naturalScore * 0.6 + keywordScore * 0.4);
        
        return Math.max(0, Math.min(100, finalScore));
      }
    } catch (error) {
      console.error('Error in Natural.js sentiment analysis:', error);
      // Fall through to keyword-based approach
    }
  }
  
  // Fallback to enhanced keyword-based approach
  return analyzeTextSentimentFallback(text);
}

// Enhanced keyword-based sentiment analysis (fallback and primary method)
function analyzeTextSentimentFallback(text: string): number {
  const lowerText = text.toLowerCase();
  
  // Enhanced financial-specific keywords
  const bullishKeywords = [
    'surge', 'rally', 'gain', 'rise', 'up', 'bullish', 'positive', 'growth',
    'beat', 'exceed', 'outperform', 'strong', 'profit', 'earnings', 'revenue',
    'upgrade', 'buy', 'outperform', 'strong buy', 'momentum', 'breakthrough',
    'record', 'high', 'soar', 'jump', 'climb', 'advance', 'boost', 'increase',
    'dividend', 'buyback', 'acquisition', 'merger', 'expansion', 'success',
    'outstanding', 'excellent', 'robust', 'thriving', 'prosperous'
  ];
  
  const bearishKeywords = [
    'drop', 'fall', 'decline', 'down', 'bearish', 'negative', 'loss', 'miss',
    'disappoint', 'weak', 'concern', 'worry', 'risk', 'sell', 'underperform',
    'downgrade', 'crash', 'plunge', 'tumble', 'slump', 'slide', 'decrease',
    'recession', 'crisis', 'volatility', 'uncertainty', 'headwind', 'challenge',
    'lawsuit', 'investigation', 'regulatory', 'fine', 'penalty', 'failure',
    'struggling', 'declining', 'troubled', 'risky', 'uncertain'
  ];
  
  let bullishCount = 0;
  let bearishCount = 0;
  
  bullishKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\w*`, 'gi');
    bullishCount += (lowerText.match(regex) || []).length;
  });
  
  bearishKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\w*`, 'gi');
    bearishCount += (lowerText.match(regex) || []).length;
  });
  
  const total = bullishCount + bearishCount;
  if (total === 0) return 50; // Neutral
  
  return Math.round((bullishCount / total) * 100);
}

export async function analyzeSentiment(
  symbol: string,
  newsItems: Array<{ title: string; content?: string }>,
  priceData?: { current: number; change: number; changePercent: number }
): Promise<SentimentAnalysis> {
  // Combine all news text for analysis
  const allText = newsItems
    .map(item => `${item.title} ${item.content || ''}`)
    .join(' ');
  
  // Calculate sentiment score from news using Natural.js
  const newsSentimentScore = await analyzeTextSentiment(allText);
  
  // Factor in price movement
  let priceSentimentScore = 50; // Neutral baseline
  if (priceData) {
    // Price change contributes to sentiment (scaled to 0-100)
    if (priceData.changePercent > 5) {
      priceSentimentScore = 85;
    } else if (priceData.changePercent > 2) {
      priceSentimentScore = 70;
    } else if (priceData.changePercent > 0) {
      priceSentimentScore = 60;
    } else if (priceData.changePercent > -2) {
      priceSentimentScore = 40;
    } else if (priceData.changePercent > -5) {
      priceSentimentScore = 30;
    } else {
      priceSentimentScore = 15;
    }
  }
  
  // Weighted average: 70% news sentiment, 30% price movement
  const finalScore = Math.round(newsSentimentScore * 0.7 + priceSentimentScore * 0.3);
  
  // Determine sentiment
  let sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  if (finalScore >= 65) {
    sentiment = 'Bullish';
  } else if (finalScore <= 35) {
    sentiment = 'Bearish';
  } else {
    sentiment = 'Neutral';
  }
  
  // Generate recommendation
  let recommendation: 'BUY' | 'SELL' | 'HOLD';
  if (finalScore >= 70) {
    recommendation = 'BUY';
  } else if (finalScore <= 30) {
    recommendation = 'SELL';
  } else {
    recommendation = 'HOLD';
  }
  
  // Generate summary
  const priceContext = priceData
    ? `Currently trading at $${priceData.current.toFixed(2)} (${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%). `
    : '';
  
  let summary = '';
  if (sentiment === 'Bullish') {
    summary = `${priceContext}Recent news and market data for ${symbol} indicate positive momentum. The sentiment analysis suggests favorable conditions with strong indicators pointing toward growth potential.`;
  } else if (sentiment === 'Bearish') {
    summary = `${priceContext}Market sentiment for ${symbol} appears cautious with negative indicators. Recent developments suggest potential headwinds that investors should monitor closely.`;
  } else {
    summary = `${priceContext}Analysis of ${symbol} shows mixed signals with neutral sentiment. The stock appears to be in a consolidation phase with balanced factors influencing its direction.`;
  }
  
  // Generate reasoning points
  const reasoning: string[] = [];
  
  if (priceData) {
    if (priceData.changePercent > 0) {
      reasoning.push(`Positive price movement of ${priceData.changePercent.toFixed(2)}% indicates buying interest`);
    } else {
      reasoning.push(`Negative price movement of ${priceData.changePercent.toFixed(2)}% suggests selling pressure`);
    }
  }
  
  // Analyze each news item individually (async)
  const newsScores = await Promise.all(
    newsItems.map(item => analyzeTextSentiment(`${item.title} ${item.content || ''}`))
  );
  
  const bullishNewsCount = newsScores.filter(score => score > 55).length;
  const bearishNewsCount = newsScores.filter(score => score < 45).length;
  
  if (bullishNewsCount > bearishNewsCount) {
    reasoning.push(`${bullishNewsCount} out of ${newsItems.length} recent news items show positive sentiment`);
  } else if (bearishNewsCount > bullishNewsCount) {
    reasoning.push(`${bearishNewsCount} out of ${newsItems.length} recent news items show negative sentiment`);
  } else {
    reasoning.push(`Mixed news sentiment with balanced positive and negative coverage`);
  }
  
  if (sentiment === 'Bullish') {
    reasoning.push('Overall market sentiment favors upward movement');
  } else if (sentiment === 'Bearish') {
    reasoning.push('Overall market sentiment suggests caution');
  } else {
    reasoning.push('Market sentiment is neutral with balanced factors');
  }
  
  return {
    sentiment,
    score: finalScore,
    summary,
    recommendation,
    reasoning: reasoning.length > 0 ? reasoning : ['Analysis based on current market data and news sentiment'],
  };
}

function getFallbackAnalysis(
  symbol: string,
  priceData?: { current: number; change: number; changePercent: number }
): SentimentAnalysis {
  const isPositive = priceData ? priceData.changePercent > 0 : Math.random() > 0.5;
  
  return {
    sentiment: isPositive ? 'Bullish' : 'Bearish',
    score: isPositive ? 75 + Math.floor(Math.random() * 20) : 25 + Math.floor(Math.random() * 20),
    summary: isPositive
      ? `Recent news for ${symbol} suggests strong momentum driven by positive earnings reports and sector growth.`
      : `Market sentiment for ${symbol} is cautious due to recent regulatory headwinds and mixed quarterly results.`,
    recommendation: isPositive ? 'BUY' : 'SELL',
    reasoning: [
      isPositive ? 'Positive earnings momentum' : 'Mixed quarterly results',
      isPositive ? 'Sector growth trends' : 'Regulatory concerns',
      isPositive ? 'Strong market position' : 'Market volatility',
    ],
  };
}

