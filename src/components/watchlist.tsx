"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, updateWatchlistPrices, type WatchlistItem } from "@/lib/watchlist"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadWatchlist()
    
    // Listen for watchlist updates
    const handleUpdate = () => loadWatchlist()
    window.addEventListener('watchlist-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('watchlist-updated', handleUpdate)
    }
  }, [])

  const loadWatchlist = () => {
    const items = getWatchlist()
    setWatchlist(items)
    
    // Update prices for all watchlist items
    if (items.length > 0) {
      updatePrices(items)
    }
  }

  const updatePrices = async (items: WatchlistItem[]) => {
    setLoading(true)
    try {
      const priceUpdates = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(item.symbol)}`)
            if (!response.ok) {
              throw new Error('Failed to fetch quote')
            }
            const quote = await response.json()
            return quote ? {
              symbol: item.symbol,
              price: quote.price,
              changePercent: quote.changePercent,
            } : null
          } catch (error) {
            console.error(`Error fetching price for ${item.symbol}:`, error)
            return null
          }
        })
      )
      
      const validUpdates = priceUpdates.filter(update => update !== null) as Array<{
        symbol: string
        price: number
        changePercent: number
      }>
      
      updateWatchlistPrices(validUpdates)
      loadWatchlist() // Reload to get updated prices
    } catch (error) {
      console.error('Error updating prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (symbol: string) => {
    removeFromWatchlist(symbol)
    loadWatchlist()
  }

  if (watchlist.length === 0) {
    return (
      <Card className="border-white/10 bg-black/40 backdrop-blur-md">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            Your watchlist is empty. Add stocks to track them here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-md">
      <CardHeader className="border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            Watchlist ({watchlist.length})
          </CardTitle>
          <Button
            onClick={() => updatePrices(watchlist)}
            disabled={loading}
            className="text-xs px-3 py-1"
            variant="outline"
          >
            {loading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <AnimatePresence>
            {watchlist.map((item) => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`/?symbol=${item.symbol}`}
                      className="font-bold text-white hover:text-blue-400 transition-colors"
                    >
                      {item.symbol}
                    </a>
                    {item.currentPrice !== undefined && (
                      <>
                        <span className="text-sm text-white">
                          {formatCurrency(item.currentPrice, item.symbol)}
                        </span>
                        {item.changePercent !== undefined && (
                          <span className={cn(
                            "text-sm flex items-center gap-1",
                            item.changePercent >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {item.changePercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemove(item.symbol)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

export function WatchlistButton({ symbol }: { symbol: string }) {
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    setInWatchlist(isInWatchlist(symbol))
  }, [symbol])

  const handleToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(symbol)
    } else {
      addToWatchlist(symbol)
    }
    setInWatchlist(!inWatchlist)
    
    // Trigger a custom event to refresh watchlist component
    window.dispatchEvent(new Event('watchlist-updated'))
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className={cn(
        "gap-2",
        inWatchlist && "bg-yellow-500/20 border-yellow-500/50"
      )}
    >
      <Star className={cn("w-4 h-4", inWatchlist && "fill-yellow-500 text-yellow-500")} />
      {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </Button>
  )
}

