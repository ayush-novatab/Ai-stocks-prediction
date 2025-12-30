import StockSearch from '@/components/stock-search'
import Watchlist from '@/components/watchlist'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-black/50 backdrop-blur-xl pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-900/50 lg:p-4">
          Antigravity Stock Research
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full z-10">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent pb-2">
            AI-Powered Market Insights
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Research stocks instantly using advanced AI algorithms analyzing real-time news and market sentiment.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <StockSearch />
          </div>
          <div className="lg:col-span-1">
            <Watchlist />
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-gray-500 max-w-4xl">
        <div className="p-4 border border-white/5 rounded-lg bg-white/5">
          <h3 className="font-bold text-white mb-2">Real-time Search</h3>
          <p>Aggregates latest news from trusted financial sources.</p>
        </div>
        <div className="p-4 border border-white/5 rounded-lg bg-white/5">
          <h3 className="font-bold text-white mb-2">Sentiment Analysis</h3>
          <p>AI interprets market mood to gauge bullish or bearish trends.</p>
        </div>
        <div className="p-4 border border-white/5 rounded-lg bg-white/5">
          <h3 className="font-bold text-white mb-2">Actionable Insights</h3>
          <p>Get clear Buy/Sell/Hold recommendations with confidence scores.</p>
        </div>
      </div>
    </main>
  )
}
