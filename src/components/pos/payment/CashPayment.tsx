import { Banknote, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CashPaymentProps {
  grandTotal: number
  cashReceived: string
  onChange: (v: string) => void
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100]

export function CashPayment({ grandTotal, cashReceived, onChange }: CashPaymentProps) {
  const cashNum = parseFloat(cashReceived) || 0
  const change = Math.max(0, cashNum - grandTotal)
  const sufficient = cashNum > 0 && cashNum >= grandTotal
  const insufficient = cashNum > 0 && cashNum < grandTotal

  return (
    <div className="space-y-3">
      {/* Cash input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Banknote className="w-3 h-3" />
          Cash Received
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
          <Input
            type="number"
            min="0"
            value={cashReceived}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            className={cn(
              'pl-7 h-10 text-sm font-semibold transition-colors',
              sufficient && 'border-emerald-400 focus-visible:ring-emerald-400',
              insufficient && 'border-red-400 focus-visible:ring-red-400'
            )}
          />
        </div>

        {/* Quick amounts */}
        <div className="flex gap-1.5 flex-wrap">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => onChange(String(amt))}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-all"
            >
              ${amt}
            </button>
          ))}
          {/* Exact */}
          <button
            onClick={() => onChange(grandTotal.toFixed(2))}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
          >
            Exact
          </button>
        </div>
      </div>

      {/* Change display */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300',
          sufficient
            ? 'bg-emerald-50 border-emerald-200'
            : insufficient
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-100'
        )}
      >
        <div className="flex items-center gap-2">
          {sufficient ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : insufficient ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <span className="w-4 h-4 text-gray-300 text-lg leading-none">💵</span>
          )}
          <div>
            <p className={cn(
              'text-xs font-semibold',
              sufficient ? 'text-emerald-700' : insufficient ? 'text-red-600' : 'text-gray-400'
            )}>
              {sufficient ? 'Change' : insufficient ? 'Short by' : 'Change'}
            </p>
            {insufficient && (
              <p className="text-[10px] text-red-400">Need {formatCurrency(grandTotal - cashNum)} more</p>
            )}
          </div>
        </div>
        <span className={cn(
          'text-lg font-extrabold tabular-nums',
          sufficient ? 'text-emerald-600' : insufficient ? 'text-red-500' : 'text-gray-300'
        )}>
          {sufficient ? formatCurrency(change) : insufficient ? formatCurrency(grandTotal - cashNum) : '$0.00'}
        </span>
      </div>
    </div>
  )
}
