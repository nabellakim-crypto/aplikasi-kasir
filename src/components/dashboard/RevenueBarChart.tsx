import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BarData {
  label: string
  revenue: number
  orders: number
  isCurrent?: boolean
}

interface RevenueBarChartProps {
  data: BarData[]
  title: string
  subtitle?: string
  height?: number
}

export function RevenueBarChart({ data, title, subtitle, height = 160 }: RevenueBarChartProps) {
  const max = Math.max(...data.map((d) => d.revenue), 0.01)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.revenue / max) * 100 : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {formatCurrency(d.revenue)}
                <br />
                <span className="text-gray-400">{d.orders} orders</span>
              </div>

              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: height - 28 }}>
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all duration-500',
                    d.revenue === 0
                      ? 'bg-gray-100'
                      : d.isCurrent
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-blue-200 hover:bg-blue-300'
                  )}
                  style={{ height: `${Math.max(pct, d.revenue > 0 ? 4 : 2)}%` }}
                />
              </div>

              {/* Label */}
              <span className={cn(
                'text-[10px] font-medium truncate w-full text-center',
                d.isCurrent ? 'text-blue-600 font-bold' : 'text-gray-400'
              )}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
