import { NextResponse } from 'next/server';
import { getHistoricalData, getStockQuote } from '@/lib/stock-data';
import { calculateTechnicalIndicators } from '@/lib/technical-indicators';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' || '1mo';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    let quote, historicalData;
    let quoteError, historicalError;
    
    try {
      [quote, historicalData] = await Promise.all([
        getStockQuote(symbol).catch(e => { quoteError = e.message; return null; }),
        getHistoricalData(symbol, period).catch(e => { historicalError = e.message; return []; }),
      ]);
    } catch (error: any) {
      console.error('Error in Promise.all:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch stock data', 
        details: error.message,
        quoteError,
        historicalError
      }, { status: 500 });
    }

    console.log(`Fetched data for ${symbol}: quote=${!!quote}, historical=${historicalData.length} items`);

    // Allow chart to render even if quote fails, use historical data for quote
    let finalQuote = quote;
    if (!finalQuote && historicalData.length > 0) {
      const latest = historicalData[historicalData.length - 1];
      const previous = historicalData.length > 1 ? historicalData[historicalData.length - 2] : latest;
      const change = latest.close - previous.close;
      const changePercent = previous.close !== 0 ? (change / previous.close) * 100 : 0;
      
      finalQuote = {
        symbol,
        price: latest.close,
        change,
        changePercent,
        volume: latest.volume || 0,
        previousClose: previous.close,
      };
    }

    if (!finalQuote || historicalData.length === 0) {
      return NextResponse.json({ 
        error: 'Stock not found', 
        quoteError: quoteError || 'Quote fetch failed',
        historicalError: historicalError || 'Historical data fetch failed',
        symbol 
      }, { status: 404 });
    }

    const indicators = calculateTechnicalIndicators(historicalData);

    return NextResponse.json({
      quote: finalQuote,
      historicalData,
      indicators,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}

