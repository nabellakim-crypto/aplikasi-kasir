import { useState } from 'react'
import { TopBar, type AppPage } from '@/components/pos/TopBar'
import { ProductCatalog } from '@/components/pos/ProductCatalog'
import { CartPanel } from '@/components/pos/CartPanel'
import { ProductManagement } from '@/components/admin/ProductManagement'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { LoginPage } from '@/components/auth/LoginPage'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

function AppContent() {
  const { user, isAdmin } = useAuth()
  const [page, setPage] = useState<AppPage>(isAdmin ? 'dashboard' : 'pos')
  const { items, addToCart, increase, decrease, remove, clear } = useCart()

  // Not logged in — show login page
  if (!user) return <LoginPage />

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <TopBar currentPage={page} onNavigate={setPage} />

      <main className="flex flex-1 overflow-hidden">
        {page === 'dashboard' && isAdmin && (
          <div className="flex-1 overflow-hidden">
            <Dashboard />
          </div>
        )}

        {page === 'pos' && (
          <>
            <div className="flex-[7] overflow-hidden">
              <ProductCatalog onAddToCart={addToCart} />
            </div>
            <div className="flex-[3] overflow-hidden min-w-[320px] max-w-[400px]">
              <CartPanel
                items={items}
                onIncrease={increase}
                onDecrease={decrease}
                onRemove={remove}
                onClear={clear}
              />
            </div>
          </>
        )}

        {page === 'products' && (
          <div className="flex-1 overflow-hidden">
            <ProductManagement />
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
