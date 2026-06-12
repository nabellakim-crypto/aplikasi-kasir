import type { Product } from '@/data/products'

export type CartItem = {
  product: Product
  quantity: number
}

export type DiscountType = 'percent' | 'fixed'

export type PaymentMethod = 'cash' | 'qris' | 'card'

export type QrisStatus = 'idle' | 'waiting' | 'paid'
export type CardStatus = 'idle' | 'processing' | 'approved' | 'declined'
