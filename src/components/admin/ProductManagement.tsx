import { useState, useMemo, useCallback } from 'react'
import {
  Plus, Search, Pencil, Trash2, RefreshCw, ChevronUp, ChevronDown,
  ChevronsUpDown, PackageX, Filter, ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/ui/product-image'
import { ProductFormDialog } from './ProductFormDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { useProducts } from '@/hooks/useProducts'
import { useProductManager } from '@/hooks/useProductManager'
import { formatCurrency, cn } from '@/lib/utils'
import type { Product } from '@/data/products'

type SortKey = 'name' | 'price' | 'stock' | 'category'
type SortDir = 'asc' | 'desc'

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)  return <Badge variant="danger">Out of Stock</Badge>
  if (stock <= 5)   return <Badge variant="warning">Low: {stock}</Badge>
  return <Badge variant="success">{stock}</Badge>
}

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
  return dir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-blue-600" />
    : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
}

export function ProductManagement() {
  const { isAdmin } = useAuth()

  // Data
  const { products, categories, loading, error, refetch } = useProducts()

  // Table state
  const [query,   setQuery]   = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Dialog state
  const [formOpen,    setFormOpen]    = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [delTarget,   setDelTarget]   = useState<Product | null>(null)

  // CRUD
  const {
    saving, deleting, error: crudError, setError: setCrudError,
    createProduct, updateProduct, deleteProduct,
  } = useProductManager(refetch)

  // ── Filtering + sorting ───────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...products]

    if (catFilter !== 'all') rows = rows.filter((p) => p.category === catFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    rows.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')     cmp = a.name.localeCompare(b.name)
      if (sortKey === 'price')    cmp = a.price - b.price
      if (sortKey === 'stock')    cmp = a.stock - b.stock
      if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [products, query, catFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // ── Open add dialog ───────────────────────────────────────
  function openAdd() {
    setEditProduct(null)
    setCrudError(null)
    setFormOpen(true)
  }

  // ── Open edit dialog ──────────────────────────────────────
  function openEdit(p: Product) {
    setEditProduct(p)
    setCrudError(null)
    setFormOpen(true)
  }

  // ── Open delete dialog ────────────────────────────────────
  function openDelete(p: Product) {
    setDelTarget(p)
    setDeleteOpen(true)
  }

  // ── Submit form ───────────────────────────────────────────
  const handleSubmit = useCallback(async (form: Parameters<typeof createProduct>[0]) => {
    if (editProduct) return updateProduct(editProduct.id, form)
    return createProduct(form)
  }, [editProduct, createProduct, updateProduct])

  // ── Confirm delete ────────────────────────────────────────
  async function handleDelete() {
    if (!delTarget) return
    const ok = await deleteProduct(delTarget.id)
    if (ok) setDeleteOpen(false)
  }

  // ── Stats ─────────────────────────────────────────────────
  const totalActive   = products.filter((p) => p.stock > 0).length
  const totalOos      = products.filter((p) => p.stock === 0).length
  const totalLow      = products.filter((p) => p.stock > 0 && p.stock <= 5).length
  const avgPrice      = products.length
    ? products.reduce((s, p) => s + p.price, 0) / products.length
    : 0

  const TH = ({ label, sortable, col }: { label: string; sortable?: boolean; col?: SortKey }) => (
    <th
      onClick={() => sortable && col && toggleSort(col)}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
        sortable && 'cursor-pointer hover:text-gray-800 select-none'
      )}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortable && col && <SortIcon col={col} active={sortKey} dir={sortDir} />}
      </span>
    </th>
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Product Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} products · {categories.filter(c => c.id !== 'all').length} categories
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="gap-2 shadow-md shadow-blue-200">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>

        {/* Staff info bar */}
        {!isAdmin && (
          <div className="staff-info-bar mt-4">
            <ShieldAlert className="w-4 h-4" />
            Anda login sebagai Staff — akses view only. Hubungi Admin untuk mengelola produk.
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Total Products', value: products.length, color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100' },
            { label: 'In Stock',       value: totalActive,     color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Low Stock',      value: totalLow,        color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
            { label: 'Out of Stock',   value: totalOos,        color: 'text-red-600',     bg: 'bg-red-50 border-red-100' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0 bg-white border-b border-gray-100">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                catFilter === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{filtered.length} results</span>
          <button
            onClick={refetch}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={refetch} className="flex items-center gap-1 text-xs font-semibold bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <PackageX className="w-12 h-12 text-gray-300" />
            <p className="text-base font-semibold text-gray-500">No products found</p>
            <p className="text-sm">Coba keyword lain atau ubah filter kategori</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Image</th>
                  <TH label="Name"     sortable col="name" />
                  <TH label="Category" sortable col="category" />
                  <TH label="Price"    sortable col="price" />
                  <TH label="Stock"    sortable col="stock" />
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => {
                  const cat = categories.find((c) => c.id === product.category)
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name + description */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate">{product.description}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          {cat?.emoji} {cat?.label ?? product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-600">{formatCurrency(product.price)}</span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <StockBadge stock={product.stock} />
                      </td>

                      {/* Actions (Admin only) */}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => openDelete(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {products.length} products</span>
              <span>Avg. price {formatCurrency(avgPrice)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        product={editProduct}
        categories={categories}
        saving={saving}
        error={crudError}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        product={delTarget}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
        deleting={deleting}
      />
    </div>
  )
}
