import { useState } from 'react'
import { TopBar, type AppPage } from '@/components/pos/TopBar'
import { ProductCatalog } from '@/components/pos/ProductCatalog'
import { CartPanel } from '@/components/pos/CartPanel'
import { ProductManagement } from '@/components/admin/ProductManagement'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useCart } from '@/hooks/useCart'

export default function App() {
  const [page, setPage] = useState<AppPage>('dashboard')
  const { items, addToCart, increase, decrease, remove, clear } = useCart()

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <TopBar currentPage={page} onNavigate={setPage} />

      <main className="flex flex-1 overflow-hidden">
        {page === 'dashboard' && (
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
