import { useState, useMemo } from 'react'
import { Search, PackageX, RefreshCw, WifiOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CategoryTabs } from './CategoryTabs'
import { ProductCard } from './ProductCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/data/products'

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full pt-[68%] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-7 bg-gray-100 rounded mt-2" />
      </div>
    </div>
  )
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const { products, categories, loading, error, refetch } = useProducts()

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const matchQ = p.name.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQ
    })
  }, [products, query, activeCategory])

  return (
    <div className="flex flex-col h-full gap-4 p-5 pr-4">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name…"
          className="pl-9 h-10 bg-white border-gray-200 rounded-xl text-sm focus-visible:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex-shrink-0">
        <CategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
          categories={categories}
          loading={loading}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex-shrink-0 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>Supabase error</span>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-1 text-xs font-semibold bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
          <p className="text-xs text-red-600 font-mono break-all">{error}</p>
          <p className="text-xs text-red-400">
            Pastikan migration SQL sudah dijalankan di Supabase Dashboard → SQL Editor.
          </p>
        </div>
      )}

      {/* Grid */}
      <ScrollArea className="flex-1 -mr-1">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pr-2 pb-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !error && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <PackageX className="w-12 h-12 text-gray-300" />
            <p className="text-base font-semibold text-gray-500">No products found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pr-2 pb-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAddToCart} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
