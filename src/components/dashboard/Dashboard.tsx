import {
  DollarSign, ShoppingBag, TrendingUp, Receipt,
  RefreshCw, WifiOff, Percent, Tag,
} from 'lucide-react'
import { StatCard } from './StatCard'
import { RevenueBarChart } from './RevenueBarChart'
import { TopProductsTable } from './TopProductsTable'
import { PaymentBreakdownCard } from './PaymentBreakdown'
import { RecentOrdersTable } from './RecentOrders'
import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/utils'

// ── Skeleton helpers ──────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />
}

function LoadingState() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><Skeleton className="h-56" /></div>
        <Skeleton className="h-56" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><Skeleton className="h-72" /></div>
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export function Dashboard() {
  const { stats, loading, error, refetch } = useDashboard()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // Filter hourly data to show only hours with activity + a few surrounding hours
  const relevantHours = stats
    ? stats.hourlySales.filter((h) => {
        const nowH = new Date().getHours()
        return h.hour <= nowH
      }).slice(-12) // last 12 hours up to now
    : []

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex-shrink-0">
          <div className="flex items-center gap-2"><WifiOff className="w-4 h-4" />{error}</div>
          <button onClick={refetch} className="flex items-center gap-1 text-xs font-semibold bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg">
            <RefreshCw className="w-3 h-3" />Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Today's Revenue"
              value={formatCurrency(stats?.todayRevenue ?? 0)}
              sub={`vs yesterday`}
              growth={stats?.revenueGrowth}
              icon={<DollarSign className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100"
              accent="text-blue-600"
            />
            <StatCard
              label="Total Orders"
              value={String(stats?.todayOrders ?? 0)}
              sub={`vs yesterday`}
              growth={stats?.ordersGrowth}
              icon={<ShoppingBag className="w-5 h-5 text-violet-600" />}
              iconBg="bg-violet-100"
              accent="text-violet-600"
            />
            <StatCard
              label="Avg. Order Value"
              value={formatCurrency(stats?.todayAvgOrder ?? 0)}
              sub="per transaction"
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              accent="text-emerald-600"
            />
            <StatCard
              label="Tax Collected"
              value={formatCurrency(stats?.todayTax ?? 0)}
              sub={`Discount given: ${formatCurrency(stats?.todayDiscount ?? 0)}`}
              icon={<Receipt className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-100"
              accent="text-amber-600"
            />
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Weekly bar chart — 2/3 */}
            <div className="lg:col-span-2">
              <RevenueBarChart
                title="Revenue — Last 7 Days"
                subtitle="Daily revenue trend"
                height={200}
                data={(stats?.weeklyRevenue ?? []).map((d) => ({
                  label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
                  revenue: d.revenue,
                  orders:  d.orders,
                  isCurrent: d.date === new Date().toISOString().slice(0, 10),
                }))}
              />
            </div>

            {/* Payment breakdown — 1/3 */}
            <PaymentBreakdownCard data={stats?.paymentBreakdown ?? []} />
          </div>

          {/* ── Hourly chart ── */}
          {relevantHours.length > 0 && (
            <RevenueBarChart
              title="Hourly Sales — Today"
              subtitle="Revenue per hour (last 12 active hours)"
              height={180}
              data={relevantHours.map((h) => ({
                label:     h.label,
                revenue:   h.revenue,
                orders:    h.orders,
                isCurrent: h.hour === new Date().getHours(),
              }))}
            />
          )}

          {/* ── Bottom row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent orders — 2/3 */}
            <div className="lg:col-span-2">
              <RecentOrdersTable orders={stats?.recentOrders ?? []} />
            </div>

            {/* Top products — 1/3 */}
            <TopProductsTable products={stats?.topProducts ?? []} />
          </div>

          {/* ── Summary footer ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: <DollarSign className="w-3.5 h-3.5" />,
                  label: 'Gross Revenue',
                  value: formatCurrency(stats?.todayRevenue ?? 0),
                  color: 'text-blue-600',
                },
                {
                  icon: <Tag className="w-3.5 h-3.5" />,
                  label: 'After Discounts',
                  value: formatCurrency((stats?.todayRevenue ?? 0) + (stats?.todayDiscount ?? 0) - (stats?.todayDiscount ?? 0)),
                  color: 'text-gray-700',
                },
                {
                  icon: <Percent className="w-3.5 h-3.5" />,
                  label: 'Tax Collected',
                  value: formatCurrency(stats?.todayTax ?? 0),
                  color: 'text-amber-600',
                },
                {
                  icon: <ShoppingBag className="w-3.5 h-3.5" />,
                  label: 'Total Transactions',
                  value: String(stats?.todayOrders ?? 0),
                  color: 'text-violet-600',
                },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                    <p className={`text-base font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
