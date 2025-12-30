// Watchlist management using localStorage

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
  currentPrice?: number;
  changePercent?: number;
}

const WATCHLIST_KEY = 'stock_watchlist';

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading watchlist:', error);
    return [];
  }
}

export function addToWatchlist(symbol: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchlist = getWatchlist();
    const upperSymbol = symbol.toUpperCase().trim();
    
    // Check if already exists
    if (watchlist.some(item => item.symbol === upperSymbol)) {
      return false; // Already in watchlist
    }
    
    watchlist.push({
      symbol: upperSymbol,
      addedAt: new Date().toISOString(),
    });
    
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
}

export function removeFromWatchlist(symbol: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(item => item.symbol !== symbol.toUpperCase().trim());
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
}

export function isInWatchlist(symbol: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const watchlist = getWatchlist();
  return watchlist.some(item => item.symbol === symbol.toUpperCase().trim());
}

export function updateWatchlistPrices(updates: Array<{ symbol: string; price: number; changePercent: number }>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const watchlist = getWatchlist();
    const updated = watchlist.map(item => {
      const update = updates.find(u => u.symbol === item.symbol);
      if (update) {
        return {
          ...item,
          currentPrice: update.price,
          changePercent: update.changePercent,
        };
      }
      return item;
    });
    
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating watchlist prices:', error);
  }
}

