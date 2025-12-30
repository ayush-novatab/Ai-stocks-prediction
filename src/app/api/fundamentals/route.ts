import { NextResponse } from 'next/server';
import { getFundamentalData } from '@/lib/fundamentals';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }
    
    const data = await getFundamentalData(symbol);
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch fundamental data' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch fundamentals' }, { status: 500 });
  }
}

