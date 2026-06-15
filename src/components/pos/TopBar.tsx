import { ShoppingBag, Wifi, Clock, ShoppingCart, Package, LayoutDashboard, LogOut, Shield } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export type AppPage = 'pos' | 'products' | 'dashboard'

interface TopBarProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

const ALL_NAV: { id: AppPage; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, adminOnly: true },
  { id: 'pos',       label: 'Cashier',   icon: <ShoppingCart   className="w-3.5 h-3.5" /> },
  { id: 'products',  label: 'Products',  icon: <Package        className="w-3.5 h-3.5" /> },
]

export function TopBar({ currentPage, onNavigate }: TopBarProps) {
  const { user, logout, isAdmin } = useAuth()
  const [time, setTime] = useState(new Date())
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Filter nav items based on role
  const navItems = useMemo(
    () => ALL_NAV.filter((n) => !n.adminOnly || isAdmin),
    [isAdmin]
  )

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : '??'

  const roleBadge = isAdmin
    ? { label: 'Admin', bg: 'bg-blue-50 border-blue-100 text-blue-600' }
    : { label: 'Staff', bg: 'bg-emerald-50 border-emerald-100 text-emerald-600' }

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
          {navItems.map((n) => (
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

        {/* Role badge */}
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border',
          roleBadge.bg
        )}>
          <Shield className="w-3 h-3" />
          {roleBadge.label}
        </div>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow cursor-pointer select-none hover:ring-2 hover:ring-blue-300 transition-all"
          >
            {initials}
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user?.displayName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">@{user?.username} · {user?.role}</p>
                </div>
                <button
                  onClick={() => { setShowMenu(false); logout() }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
