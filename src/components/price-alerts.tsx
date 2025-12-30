"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, TrendingUp, TrendingDown, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAlerts, addAlert, removeAlert, type PriceAlert } from "@/lib/alerts"
import { cn } from "@/lib/utils"

export default function PriceAlerts({ symbol, currentPrice }: { symbol: string; currentPrice?: number }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [targetPrice, setTargetPrice] = useState("")
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const loadAlerts = () => {
    const symbolAlerts = getAlerts().filter(alert => alert.symbol === symbol)
    setAlerts(symbolAlerts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetPrice || !email) {
      alert('Please fill in all fields')
      return
    }

    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    setSubmitting(true)
    try {
      addAlert({
        symbol,
        targetPrice: price,
        condition,
        email,
      })
      
      setTargetPrice("")
      setEmail("")
      setShowForm(false)
      loadAlerts()
    } catch (error) {
      console.error('Error adding alert:', error)
      alert('Failed to add alert')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = (alertId: string) => {
    removeAlert(alertId)
    loadAlerts()
  }

  const symbolAlerts = alerts.filter(alert => alert.symbol === symbol)

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-md">
      <CardHeader className="border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Price Alerts
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {showForm ? 'Cancel' : 'New Alert'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10 space-y-4"
          >
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Alert when {symbol} price is:
              </label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  onClick={() => setCondition('above')}
                  variant={condition === 'above' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Above
                </Button>
                <Button
                  type="button"
                  onClick={() => setCondition('below')}
                  variant={condition === 'below' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Below
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Target Price
              </label>
              <Input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={currentPrice ? `Current: $${currentPrice.toFixed(2)}` : "Enter price"}
                className="bg-white/10 border-white/20"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/10 border-white/20"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Adding...' : 'Create Alert'}
            </Button>
          </motion.form>
        )}

        {symbolAlerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No alerts set for {symbol}. Create one above.
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {symbolAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    alert.triggered
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        Alert when {alert.symbol} {alert.condition === 'above' ? 'rises above' : 'falls below'} ${alert.targetPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{alert.email}</span>
                      {alert.triggered && alert.triggeredAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-500">Triggered {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemove(alert.id)}
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
        )}
      </CardContent>
    </Card>
  )
}

