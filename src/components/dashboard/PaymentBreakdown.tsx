import { Banknote, QrCode, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PaymentBreakdown } from '@/hooks/useDashboard'

const METHOD_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  bg: string
  text: string
  bar: string
}> = {
  cash: {
    label: 'Cash',
    icon: <Banknote className="w-4 h-4" />,
    bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-400',
  },
  qris: {
    label: 'QRIS',
    icon: <QrCode className="w-4 h-4" />,
    bg: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-400',
  },
  card: {
    label: 'Card',
    icon: <CreditCard className="w-4 h-4" />,
    bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-400',
  },
}

interface PaymentBreakdownProps {
  data: PaymentBreakdown[]
}

export function PaymentBreakdownCard({ data }: PaymentBreakdownProps) {
  const total = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-bold text-gray-900 mb-4">Payment Methods</p>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No transactions today</p>
      ) : (
        <div className="space-y-3">
          {data.map((d) => {
            const cfg = METHOD_CONFIG[d.method] ?? METHOD_CONFIG['card']
            const pct = total > 0 ? (d.revenue / total) * 100 : 0
            return (
              <div key={d.method} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className={cn('flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold', cfg.bg, cfg.text)}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(d.revenue)}</p>
                    <p className="text-[10px] text-gray-400">{d.count} txn · {pct.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className={cn('h-full rounded-full transition-all duration-700', cfg.bar)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
