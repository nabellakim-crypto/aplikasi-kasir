import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbPaymentMethod } from '@/types/database'
import type { PaymentMethod } from '@/types/cart'

export type PaymentMethodConfig = {
  id: PaymentMethod
  label: string
  subLabel: string
  iconName: string
  isActive: boolean
  sortOrder: number
}

function toConfig(row: DbPaymentMethod): PaymentMethodConfig {
  return {
    id: row.id as PaymentMethod,
    label: row.label,
    subLabel: row.sub_label,
    iconName: row.icon_name,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }
}

export type PaymentMethodsState = {
  methods: PaymentMethodConfig[]
  loading: boolean
  error: string | null
}

export function usePaymentMethods(): PaymentMethodsState {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        setError(error.message)
      } else {
        setMethods(((data ?? []) as DbPaymentMethod[]).map(toConfig))
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { methods, loading, error }
}
