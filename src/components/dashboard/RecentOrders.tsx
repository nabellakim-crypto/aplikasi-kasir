import { Banknote, QrCode, CreditCard, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RecentOrder } from '@/hooks/useDashboard'

function MethodBadge({ method }: { method: string }) {
  const cfg: Record<string, { icon: React.ReactNode; cls: string }> = {
    cash: { icon: <Banknote className="w-3 h-3" />,   cls: 'bg-emerald-100 text-emerald-700' },
    qris: { icon: <QrCode className="w-3 h-3" />,     cls: 'bg-violet-100 text-violet-700' },
    card: { icon: <CreditCard className="w-3 h-3" />, cls: 'bg-blue-100 text-blue-700' },
  }
  const c = cfg[method] ?? cfg['card']
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize', c.cls)}>
      {c.icon}{method}
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Recent Orders
        </p>
        <span className="text-xs text-gray-400">Last {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">No orders yet</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {/* Order number */}
                <div>
                  <p className="text-xs font-bold text-gray-800 font-mono">{o.order_number}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{o.items_count} items · {timeAgo(o.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MethodBadge method={o.payment_method} />
                <span className="text-sm font-extrabold text-gray-900 tabular-nums">
                  {formatCurrency(o.grand_total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
