import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────

export type HourlySales = {
  hour: number      // 0-23
  label: string     // "08:00"
  revenue: number
  orders: number
}

export type TopProduct = {
  product_name: string
  quantity: number
  revenue: number
}

export type RecentOrder = {
  id: string
  order_number: string
  grand_total: number
  payment_method: string
  items_count: number
  created_at: string
}

export type PaymentBreakdown = {
  method: string
  count: number
  revenue: number
}

export type DashboardStats = {
  // Today
  todayRevenue: number
  todayOrders: number
  todayAvgOrder: number
  todayTax: number
  todayDiscount: number

  // Comparison vs yesterday
  revenueGrowth: number   // percent, can be negative
  ordersGrowth: number

  // Hourly chart (today)
  hourlySales: HourlySales[]

  // Top 5 products today
  topProducts: TopProduct[]

  // Last 10 orders
  recentOrders: RecentOrder[]

  // Payment method breakdown today
  paymentBreakdown: PaymentBreakdown[]

  // Weekly revenue (last 7 days)
  weeklyRevenue: { date: string; label: string; revenue: number; orders: number }[]
}

export type DashboardState = {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// ── Helpers ───────────────────────────────────────────────────

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(); end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

function yesterdayRange() {
  const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0)
  const end   = new Date(); end.setDate(end.getDate() - 1);   end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

function growthPct(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0
  return Math.round(((today - yesterday) / yesterday) * 100)
}

function pad2(n: number) { return String(n).padStart(2, '0') }

// ── Hook ──────────────────────────────────────────────────────

export function useDashboard(): DashboardState {
  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const today     = todayRange()
      const yesterday = yesterdayRange()

      // ── Parallel fetches ───────────────────────────────────
      const [
        todayOrdersRes,
        yesterdayOrdersRes,
        todayItemsRes,
        recentOrdersRes,
        weeklyRes,
      ] = await Promise.all([
        // Today's orders
        supabase
          .from('orders')
          .select('id, grand_total, tax_amount, discount_amount, payment_method, created_at')
          .gte('created_at', today.start)
          .lte('created_at', today.end)
          .eq('status', 'completed'),

        // Yesterday's orders (for growth comparison)
        supabase
          .from('orders')
          .select('id, grand_total')
          .gte('created_at', yesterday.start)
          .lte('created_at', yesterday.end)
          .eq('status', 'completed'),

        // Today's order items (for top products)
        supabase
          .from('order_items')
          .select('product_name, quantity, subtotal, order_id, orders!inner(created_at, status)')
          .gte('orders.created_at', today.start)
          .lte('orders.created_at', today.end)
          .eq('orders.status', 'completed'),

        // Recent 10 orders (all time)
        supabase
          .from('orders')
          .select('id, order_number, grand_total, payment_method, created_at')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10),

        // Last 7 days revenue
        supabase
          .from('orders')
          .select('grand_total, created_at')
          .eq('status', 'completed')
          .gte('created_at', (() => {
            const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0)
            return d.toISOString()
          })())
          .order('created_at', { ascending: true }),
      ])

      if (todayOrdersRes.error)    throw new Error(todayOrdersRes.error.message)
      if (yesterdayOrdersRes.error) throw new Error(yesterdayOrdersRes.error.message)
      if (recentOrdersRes.error)   throw new Error(recentOrdersRes.error.message)
      if (weeklyRes.error)         throw new Error(weeklyRes.error.message)

      // ── Today stats ────────────────────────────────────────
      const todayOrders   = todayOrdersRes.data ?? []
      const todayRevenue  = todayOrders.reduce((s, o) => s + Number(o.grand_total), 0)
      const todayTax      = todayOrders.reduce((s, o) => s + Number(o.tax_amount), 0)
      const todayDiscount = todayOrders.reduce((s, o) => s + Number(o.discount_amount), 0)
      const todayAvgOrder = todayOrders.length ? todayRevenue / todayOrders.length : 0

      // ── Yesterday stats ────────────────────────────────────
      const yestOrders   = yesterdayOrdersRes.data ?? []
      const yestRevenue  = yestOrders.reduce((s, o) => s + Number(o.grand_total), 0)

      // ── Hourly sales (today) ────────────────────────────────
      const hourMap: Record<number, { revenue: number; orders: number }> = {}
      for (let h = 0; h < 24; h++) hourMap[h] = { revenue: 0, orders: 0 }
      todayOrders.forEach((o) => {
        const h = new Date(o.created_at).getHours()
        hourMap[h].revenue += Number(o.grand_total)
        hourMap[h].orders  += 1
      })
      const hourlySales: HourlySales[] = Object.entries(hourMap).map(([h, v]) => ({
        hour: Number(h),
        label: `${pad2(Number(h))}:00`,
        revenue: v.revenue,
        orders:  v.orders,
      }))

      // ── Payment breakdown ──────────────────────────────────
      const pmMap: Record<string, { count: number; revenue: number }> = {}
      todayOrders.forEach((o) => {
        if (!pmMap[o.payment_method]) pmMap[o.payment_method] = { count: 0, revenue: 0 }
        pmMap[o.payment_method].count   += 1
        pmMap[o.payment_method].revenue += Number(o.grand_total)
      })
      const paymentBreakdown: PaymentBreakdown[] = Object.entries(pmMap).map(([method, v]) => ({
        method, count: v.count, revenue: v.revenue,
      })).sort((a, b) => b.revenue - a.revenue)

      // ── Top products ───────────────────────────────────────
      const prodMap: Record<string, { quantity: number; revenue: number }> = {}
      ;(todayItemsRes.data ?? []).forEach((row: { product_name: string; quantity: number; subtotal: number }) => {
        if (!prodMap[row.product_name]) prodMap[row.product_name] = { quantity: 0, revenue: 0 }
        prodMap[row.product_name].quantity += row.quantity
        prodMap[row.product_name].revenue  += Number(row.subtotal)
      })
      const topProducts: TopProduct[] = Object.entries(prodMap)
        .map(([product_name, v]) => ({ product_name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // ── Recent orders ──────────────────────────────────────
      // Get item counts for each recent order
      const recentRaw = recentOrdersRes.data ?? []
      const orderIds  = recentRaw.map((o) => o.id)
      let itemCountMap: Record<string, number> = {}
      if (orderIds.length > 0) {
        const { data: itemCounts } = await supabase
          .from('order_items')
          .select('order_id, quantity')
          .in('order_id', orderIds)
        ;(itemCounts ?? []).forEach((row: { order_id: string; quantity: number }) => {
          itemCountMap[row.order_id] = (itemCountMap[row.order_id] ?? 0) + row.quantity
        })
      }
      const recentOrders: RecentOrder[] = recentRaw.map((o) => ({
        id:             o.id,
        order_number:   o.order_number,
        grand_total:    Number(o.grand_total),
        payment_method: o.payment_method,
        items_count:    itemCountMap[o.id] ?? 0,
        created_at:     o.created_at,
      }))

      // ── Weekly revenue (last 7 days) ───────────────────────
      const dayMap: Record<string, { revenue: number; orders: number }> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dayMap[key] = { revenue: 0, orders: 0 }
      }
      ;(weeklyRes.data ?? []).forEach((o: { grand_total: number; created_at: string }) => {
        const key = o.created_at.slice(0, 10)
        if (dayMap[key]) {
          dayMap[key].revenue += Number(o.grand_total)
          dayMap[key].orders  += 1
        }
      })
      const weeklyRevenue = Object.entries(dayMap).map(([date, v]) => {
        const d = new Date(date + 'T00:00:00')
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return { date, label, revenue: v.revenue, orders: v.orders }
      })

      setStats({
        todayRevenue,
        todayOrders: todayOrders.length,
        todayAvgOrder,
        todayTax,
        todayDiscount,
        revenueGrowth: growthPct(todayRevenue, yestRevenue),
        ordersGrowth:  growthPct(todayOrders.length, yestOrders.length),
        hourlySales,
        topProducts,
        recentOrders,
        paymentBreakdown,
        weeklyRevenue,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()

    // Refresh when a new order is placed
    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetch())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  return { stats, loading, error, refetch: fetch }
}
