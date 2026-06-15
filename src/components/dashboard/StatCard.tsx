import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  growth?: number          // percent, undefined = no badge
  icon: React.ReactNode
  iconBg: string
  accent: string
}

export function StatCard({ label, value, sub, growth, icon, iconBg, accent }: StatCardProps) {
  const hasGrowth  = growth !== undefined
  const positive   = (growth ?? 0) >= 0
  const neutral    = growth === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          {icon}
        </div>

        {/* Growth badge */}
        {hasGrowth && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
            neutral    ? 'bg-gray-100 text-gray-500' :
            positive   ? 'bg-emerald-100 text-emerald-700' :
                         'bg-red-100 text-red-600'
          )}>
            {neutral   ? <Minus className="w-3 h-3" />        :
             positive  ? <TrendingUp className="w-3 h-3" />   :
                         <TrendingDown className="w-3 h-3" />}
            {neutral ? '—' : `${positive ? '+' : ''}${growth}%`}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={cn('text-2xl font-extrabold mt-0.5 tracking-tight', accent)}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
