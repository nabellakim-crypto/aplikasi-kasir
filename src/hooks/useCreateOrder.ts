import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { CartItem, DiscountType, PaymentMethod } from '@/types/cart'

export type CreateOrderPayload = {
  items: CartItem[]
  subtotal: number
  discountAmount: number
  discountType: DiscountType
  discountValue: number
  taxAmount: number
  grandTotal: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  changeAmount?: number
}

export type OrderResult = {
  orderId: string
  orderNumber: string
}

export type CreateOrderState = {
  saving: boolean
  error: string | null
  createOrder: (payload: CreateOrderPayload) => Promise<OrderResult | null>
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq  = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `POS-${date}-${seq}`
}

export function useCreateOrder(): CreateOrderState {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const createOrder = useCallback(
    async (payload: CreateOrderPayload): Promise<OrderResult | null> => {
      setSaving(true)
      setError(null)

      try {
        const orderNumber = generateOrderNumber()

        // 1. Insert order header
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number:    orderNumber,
            subtotal:        payload.subtotal,
            discount_amount: payload.discountAmount,
            discount_type:   payload.discountType,
            discount_value:  payload.discountValue,
            tax_amount:      payload.taxAmount,
            grand_total:     payload.grandTotal,
            payment_method:  payload.paymentMethod,
            cash_received:   payload.cashReceived ?? null,
            change_amount:   payload.changeAmount ?? null,
          })
          .select('id, order_number')
          .single()

        if (orderErr) throw new Error(orderErr.message)

        const order = orderData as { id: string; order_number: string }

        // 2. Insert order items
        const itemRows = payload.items.map(({ product, quantity }) => ({
          order_id:     order.id,
          product_id:   product.id,
          product_name: product.name,
          unit_price:   product.price,
          quantity,
          subtotal:     product.price * quantity,
        }))

        const { error: itemsErr } = await supabase.from('order_items').insert(itemRows)
        if (itemsErr) throw new Error(itemsErr.message)

        // 3. Decrement stock atomically via raw SQL update (best-effort)
        await Promise.allSettled(
          payload.items.map(({ product, quantity }) =>
            supabase.rpc('decrement_stock', {
              p_product_id: product.id,
              p_qty: quantity,
            } as never)
          )
        )

        setSaving(false)
        return { orderId: order.id, orderNumber: order.order_number }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(msg)
        setSaving(false)
        return null
      }
    },
    []
  )

  return { saving, error, createOrder }
}
