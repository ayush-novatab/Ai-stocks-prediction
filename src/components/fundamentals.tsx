"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FundamentalData } from "@/lib/fundamentals"
import { formatCurrency } from "@/lib/currency"

interface FundamentalsProps {
  symbol: string
}

export default function Fundamentals({ symbol }: FundamentalsProps) {
  const [data, setData] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFundamentals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const fetchFundamentals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fundamentals?symbol=${symbol}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching fundamentals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-white/10 bg-black/40 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="text-muted-foreground text-center py-8">Loading fundamental data...</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null // Don't show if no data available
  }

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-md">
      <CardHeader className="border-b border-white/10 bg-white/5">
        <CardTitle className="text-lg font-bold">Fundamental Analysis</CardTitle>
        {data.name && (
          <p className="text-sm text-muted-foreground mt-1">{data.name}</p>
        )}
        {data.sector && (
          <p className="text-xs text-muted-foreground">{data.sector} • {data.industry}</p>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.peRatio !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">P/E Ratio</div>
              <div className="text-lg font-bold">{data.peRatio.toFixed(2)}</div>
            </div>
          )}
          
          {data.eps !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">EPS</div>
              <div className="text-lg font-bold">${data.eps.toFixed(2)}</div>
            </div>
          )}
          
          {data.marketCap !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
              <div className="text-lg font-bold">
                {data.marketCap >= 1e12 ? `$${(data.marketCap / 1e12).toFixed(2)}T` :
                 data.marketCap >= 1e9 ? `$${(data.marketCap / 1e9).toFixed(2)}B` :
                 data.marketCap >= 1e6 ? `$${(data.marketCap / 1e6).toFixed(2)}M` :
                 `$${data.marketCap.toFixed(0)}`}
              </div>
            </div>
          )}
          
          {data.dividendYield !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">Dividend Yield</div>
              <div className="text-lg font-bold">{(data.dividendYield * 100).toFixed(2)}%</div>
            </div>
          )}
          
          {data.beta !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">Beta</div>
              <div className="text-lg font-bold">{data.beta.toFixed(2)}</div>
            </div>
          )}
          
          {data.profitMargin !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">Profit Margin</div>
              <div className="text-lg font-bold">{(data.profitMargin * 100).toFixed(2)}%</div>
            </div>
          )}
          
          {data.roe !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">ROE</div>
              <div className="text-lg font-bold">{(data.roe * 100).toFixed(2)}%</div>
            </div>
          )}
          
          {data.roa !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">ROA</div>
              <div className="text-lg font-bold">{(data.roa * 100).toFixed(2)}%</div>
            </div>
          )}
          
          {data.debtToEquity !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">Debt/Equity</div>
              <div className="text-lg font-bold">{data.debtToEquity.toFixed(2)}</div>
            </div>
          )}
          
          {data.fiftyTwoWeekHigh !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">52W High</div>
              <div className="text-lg font-bold text-green-500">
                {formatCurrency(data.fiftyTwoWeekHigh, symbol)}
              </div>
            </div>
          )}
          
          {data.fiftyTwoWeekLow !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground mb-1">52W Low</div>
              <div className="text-lg font-bold text-red-500">
                {formatCurrency(data.fiftyTwoWeekLow, symbol)}
              </div>
            </div>
          )}
        </div>
        
        {data.description && (
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm font-medium mb-2">About</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.description.substring(0, 300)}
              {data.description.length > 300 && '...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

