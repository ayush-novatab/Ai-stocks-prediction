// Price alerts management using localStorage and EmailJS

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  email: string;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

const ALERTS_KEY = 'stock_price_alerts';

export function getAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading alerts:', error);
    return [];
  }
}

export function addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const alerts = getAlerts();
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    
    alerts.push(newAlert);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    return newAlert.id;
  } catch (error) {
    console.error('Error adding alert:', error);
    return '';
  }
}

export function removeAlert(alertId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const alerts = getAlerts();
    const filtered = alerts.filter(alert => alert.id !== alertId);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing alert:', error);
    return false;
  }
}

export function checkAlerts(symbol: string, currentPrice: number): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const alerts = getAlerts();
    const triggered: PriceAlert[] = [];
    
    alerts.forEach(alert => {
      if (alert.symbol === symbol && !alert.triggered) {
        const shouldTrigger = 
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice);
        
        if (shouldTrigger) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
          triggered.push(alert);
        }
      }
    });
    
    if (triggered.length > 0) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
    
    return triggered;
  } catch (error) {
    console.error('Error checking alerts:', error);
    return [];
  }
}

// Send email alert using EmailJS
export async function sendEmailAlert(alert: PriceAlert, currentPrice: number): Promise<boolean> {
  try {
    // Dynamic import to avoid SSR issues
    const emailjs = await import('@emailjs/browser');
    
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
    
    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS not configured. Please set environment variables.');
      return false;
    }
    
    await emailjs.default.send(
      serviceId,
      templateId,
      {
        to_email: alert.email,
        symbol: alert.symbol,
        target_price: alert.targetPrice.toFixed(2),
        current_price: currentPrice.toFixed(2),
        condition: alert.condition,
        message: `${alert.symbol} has ${alert.condition === 'above' ? 'risen above' : 'fallen below'} $${alert.targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`,
      },
      publicKey
    );
    
    return true;
  } catch (error) {
    console.error('Error sending email alert:', error);
    return false;
  }
}

