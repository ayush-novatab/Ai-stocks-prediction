import { NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/stock-data';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }
    
    const quote = await getStockQuote(symbol);
    
    if (!quote) {
      return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 404 });
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

