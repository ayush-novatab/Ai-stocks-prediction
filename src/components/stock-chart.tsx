"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { StockPriceData } from "@/lib/stock-data"
import type { TechnicalIndicators } from "@/lib/technical-indicators"
import { formatCurrency } from "@/lib/currency"

interface StockChartProps {
  symbol: string
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
}

const timeframes = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '1Y', value: '1y' },
] as const

export default function StockChart({ symbol }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<'1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max'>('1mo')
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null)
  const [quote, setQuote] = useState<any>(null)
  const [showVolume, setShowVolume] = useState(true)
  const [showSMAs, setShowSMAs] = useState(true)

  useEffect(() => {
    fetchChartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe])

  const calculateSMA = (prices: number[], period: number, index: number): number => {
    if (index < period - 1) return 0
    const slice = prices.slice(index - period + 1, index + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  const fetchChartData = async () => {
    if (!symbol || symbol.trim() === '') {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/stock-data?symbol=${symbol}&period=${timeframe}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch data')
      }
      
      const data = await response.json()
      
      if (!data.historicalData || data.historicalData.length === 0) {
        console.warn('No historical data received')
        setChartData([])
        setLoading(false)
        return
      }
      
      const prices = data.historicalData.map((item: StockPriceData) => item.close)
      
      // Format data for chart with rolling SMAs
      const formatted = data.historicalData.map((item: StockPriceData, index: number) => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          ...(timeframe === '1d' || timeframe === '5d' ? { hour: 'numeric', minute: '2-digit' } : {}),
        }),
        price: item.close,
        volume: item.volume,
        sma20: index >= 19 ? calculateSMA(prices, 20, index) : undefined,
        sma50: index >= 49 ? calculateSMA(prices, 50, index) : undefined,
        sma200: index >= 199 ? calculateSMA(prices, 200, index) : undefined,
      }))

      setChartData(formatted)
      setIndicators(data.indicators)
      setQuote(data.quote)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (value: number) => formatCurrency(value, symbol)
  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toString()
  }

  if (loading) {
    return (
      <Card className="border-white/10 bg-black/40 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-white/10 bg-black/40 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">No chart data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Price Chart */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-md">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{symbol} Price Chart</CardTitle>
            {quote && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(quote.price)}</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    quote.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {quote.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    ({quote.change >= 0 ? '+' : ''}{formatPrice(quote.change)})
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Timeframe Selector */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                onClick={() => setTimeframe(tf.value as any)}
                className={`text-xs px-3 py-1 ${
                  timeframe === tf.value 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* Price Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff40"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#ffffff40"
                style={{ fontSize: '12px' }}
                tickFormatter={formatPrice}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => value !== undefined ? formatPrice(value) : ''}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Price"
              />
              {showSMAs && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 20"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 50"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma200"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 200"
                    connectNulls={false}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>

          {/* Toggle Controls */}
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => setShowSMAs(!showSMAs)}
              className={`text-xs px-3 py-1 ${
                showSMAs 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
            >
              {showSMAs ? 'Hide' : 'Show'} Moving Averages
            </Button>
            <Button
              onClick={() => setShowVolume(!showVolume)}
              className={`text-xs px-3 py-1 ${
                showVolume 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
            >
              {showVolume ? 'Hide' : 'Show'} Volume
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      {showVolume && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff40"
                  style={{ fontSize: '12px' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#ffffff40"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatVolume}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? formatVolume(value) : ''}
                />
                <Bar dataKey="volume" fill="#6366f1" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Technical Indicators */}
      {indicators && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-md">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-bold">Technical Indicators</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">RSI (14)</div>
                <div className={`text-2xl font-bold ${
                  indicators.rsi > 70 ? 'text-red-500' :
                  indicators.rsi < 30 ? 'text-green-500' :
                  'text-white'
                }`}>
                  {indicators.rsi.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {indicators.rsi > 70 ? 'Overbought' :
                   indicators.rsi < 30 ? 'Oversold' :
                   'Neutral'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">MACD</div>
                <div className={`text-2xl font-bold ${
                  indicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {indicators.macd.macd.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Signal: {indicators.macd.signal.toFixed(2)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">SMA 20</div>
                <div className="text-2xl font-bold text-white">
                  {formatPrice(indicators.sma20)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">SMA 50</div>
                <div className="text-2xl font-bold text-white">
                  {formatPrice(indicators.sma50)}
                </div>
              </div>
            </div>

            {indicators.sma200 > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">SMA 200</div>
                <div className="text-xl font-bold text-white">
                  {formatPrice(indicators.sma200)}
                </div>
              </div>
            )}

            {/* Bollinger Bands */}
            {indicators.bollingerBands && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-1">BB Upper</div>
                  <div className="text-xl font-bold text-red-400">
                    {formatPrice(indicators.bollingerBands.upper)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-1">BB Middle</div>
                  <div className="text-xl font-bold text-white">
                    {formatPrice(indicators.bollingerBands.middle)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-1">BB Lower</div>
                  <div className="text-xl font-bold text-green-400">
                    {formatPrice(indicators.bollingerBands.lower)}
                  </div>
                </div>
              </div>
            )}

            {/* Stochastic Oscillator */}
            {indicators.stochastic && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-1">Stochastic %K</div>
                  <div className={`text-2xl font-bold ${
                    indicators.stochastic.k > 80 ? 'text-red-500' :
                    indicators.stochastic.k < 20 ? 'text-green-500' :
                    'text-white'
                  }`}>
                    {indicators.stochastic.k.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {indicators.stochastic.k > 80 ? 'Overbought' :
                     indicators.stochastic.k < 20 ? 'Oversold' :
                     'Neutral'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-1">Stochastic %D</div>
                  <div className={`text-2xl font-bold ${
                    indicators.stochastic.d > 80 ? 'text-red-500' :
                    indicators.stochastic.d < 20 ? 'text-green-500' :
                    'text-white'
                  }`}>
                    {indicators.stochastic.d.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Signal Line
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

