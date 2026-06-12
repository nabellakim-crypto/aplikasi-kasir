import { useState, useCallback } from 'react'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/data/products'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const increase = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    )
  }, [])

  const decrease = useCallback((id: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === id)
      if (!item) return prev
      if (item.quantity <= 1) return prev.filter((i) => i.product.id !== id)
      return prev.map((i) => (i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i))
    })
  }, [])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  return { items, addToCart, increase, decrease, remove, clear }
}
