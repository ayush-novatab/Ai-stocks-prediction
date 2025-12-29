"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, TrendingUp, TrendingDown, Minus, AlertCircle, ArrowRight, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StockChart from "@/components/stock-chart"
import type { StockAnalysis } from "@/lib/agent"
import { formatCurrency } from "@/lib/currency"

export default function StockSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StockAnalysis | null>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) throw new Error("Failed to fetch analysis")
      
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL, RELIANCE.NS, TCS.NS)..."  
            className="pl-10 h-12 text-lg text-black bg-white/90 backdrop-blur-sm border-white/20 placeholder:text-gray-500"
          />
        </div>
        <Button disabled={loading} type="submit" className="h-12 px-8">
          {loading ? "Analyzing..." : "Research"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="space-y-6"
          >
            <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
              <CardHeader className="border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                      {result.symbol}
                      {result.price && (
                        <span className="text-lg font-semibold text-white">
                          {formatCurrency(result.price.current, result.symbol)}
                          <span className={cn(
                            "ml-2 text-sm",
                            result.price.changePercent >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {result.price.changePercent >= 0 ? '+' : ''}{result.price.changePercent.toFixed(2)}%
                          </span>
                        </span>
                      )}
                      <span className={cn(
                        "text-sm font-medium px-2.5 py-0.5 rounded-full border",
                        result.recommendation === 'BUY' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        result.recommendation === 'SELL' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {result.recommendation}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">AI Confidence Score: {result.score}/100</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-full",
                    result.sentiment === 'Bullish' ? "bg-green-500/20 text-green-500" :
                    result.sentiment === 'Bearish' ? "bg-red-500/20 text-red-500" :
                    "bg-yellow-500/20 text-yellow-500"
                  )}>
                    {result.sentiment === 'Bullish' ? <TrendingUp className="w-6 h-6" /> :
                     result.sentiment === 'Bearish' ? <TrendingDown className="w-6 h-6" /> :
                     <Minus className="w-6 h-6" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Analysis Summary</h4>
                  <p className="leading-relaxed">{result.summary}</p>
                </div>

                {result.reasoning && result.reasoning.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Reasoning</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {result.reasoning.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent News & Signals</h4>
                  <div className="space-y-3">
                    {result.news.map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">{item.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground self-center group-hover:text-blue-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Chart */}
            <StockChart symbol={result.symbol} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
