import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/data/products'

type RawProduct = {
  id: number
  name: string
  description?: string | null
  price: number | string
  stock: number
  category_id?: string | null
  category?: string | null
  image?: string | null
  is_active?: boolean | null
}

type RawCategory = {
  id: string
  label: string
  emoji: string
  sort_order?: number
}

function toProduct(row: RawProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    stock: row.stock,
    category: row.category_id ?? row.category ?? '',
    image: row.image ?? '',
  }
}

export type ProductsState = {
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(): ProductsState {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Ambil SEMUA produk tanpa filter is_active — handle di client
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('id'),
      supabase.from('categories').select('*').order('sort_order'),
    ])

    console.group('[useProducts] Supabase fetch')
    console.log('products → error:', prodRes.error, '| count:', prodRes.data?.length ?? 0)
    if (prodRes.data?.length) console.log('sample row:', prodRes.data[0])
    console.log('categories → error:', catRes.error, '| count:', catRes.data?.length ?? 0)
    console.groupEnd()

    if (prodRes.error) { setError(`Products: ${prodRes.error.message}`); setLoading(false); return }
    if (catRes.error)  { setError(`Categories: ${catRes.error.message}`); setLoading(false); return }

    const prodRows = (prodRes.data ?? []) as RawProduct[]
    const catRows  = (catRes.data  ?? []) as RawCategory[]

    // Tampilkan semua produk — kalau is_active ada dan false, sembunyikan
    const visibleProds = prodRows.filter((p) => p.is_active !== false)

    setProducts(visibleProds.map(toProduct))

    // Build category tabs
    const realCats = catRows.filter((c) => c.id !== 'all')
    const allTab: Category = { id: 'all', label: 'All Items', emoji: '🏪' }
    setCategories([allTab, ...realCats.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji }))])

    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()

    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetch())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  return { products, categories, loading, error, refetch: fetch }
}
