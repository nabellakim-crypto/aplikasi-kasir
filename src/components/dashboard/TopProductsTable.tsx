import { formatCurrency } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import type { TopProduct } from '@/hooks/useDashboard'

interface TopProductsTableProps {
  products: TopProduct[]
}

const RANK_COLORS = [
  'bg-amber-100 text-amber-700',   // 1st
  'bg-gray-100 text-gray-600',     // 2nd
  'bg-orange-100 text-orange-700', // 3rd
]

export function TopProductsTable({ products }: TopProductsTableProps) {
  const max = Math.max(...products.map((p) => p.revenue), 0.01)

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Top Products Today
        </p>
        <div className="flex flex-col items-center py-8 gap-2 text-gray-400">
          <Trophy className="w-8 h-8 text-gray-200" />
          <p className="text-sm">Belum ada penjualan hari ini</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        Top Products Today
      </p>

      <div className="space-y-3">
        {products.map((p, i) => {
          const pct = (p.revenue / max) * 100
          return (
            <div key={p.product_name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank */}
                  <span className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${RANK_COLORS[i] ?? 'bg-gray-50 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.product_name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <span className="text-xs text-gray-400">{p.quantity} sold</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(p.revenue)}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
