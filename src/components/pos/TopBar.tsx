import { ShoppingBag, Wifi, Clock, ShoppingCart, Package, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export type AppPage = 'pos' | 'products' | 'dashboard'

interface TopBarProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

const NAV: { id: AppPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { id: 'pos',       label: 'Cashier',   icon: <ShoppingCart   className="w-3.5 h-3.5" /> },
  { id: 'products',  label: 'Products',  icon: <Package        className="w-3.5 h-3.5" /> },
]

export function TopBar({ currentPage, onNavigate }: TopBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0 shadow-sm z-10">
      {/* Brand + Nav */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-gray-900">
            Nova<span className="text-blue-600">POS</span>
          </span>
        </div>

        {/* Nav tabs */}
        <div className="flex items-center gap-1 ml-4 bg-gray-100 rounded-xl p-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                currentPage === n.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center clock */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full">
        <Clock className="w-3.5 h-3.5" />
        <span>{dateStr}</span>
        <span className="text-gray-300">·</span>
        <span className="font-semibold text-gray-700">{timeStr}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Wifi className="w-3 h-3" />
          Store Open
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow cursor-pointer select-none">
          AM
        </div>
      </div>
    </header>
  )
}
