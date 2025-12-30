import { NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/stock-data';

export async function POST(req: Request) {
  try {
    const { symbols } = await req.json();
    
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Symbols array is required' }, { status: 400 });
    }
    
    const quotes = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const quote = await getStockQuote(symbol);
          return quote ? {
            symbol,
            price: quote.price,
            changePercent: quote.changePercent,
          } : null;
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          return null;
        }
      })
    );
    
    const validQuotes = quotes.filter(quote => quote !== null);
    
    return NextResponse.json({ quotes: validQuotes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

