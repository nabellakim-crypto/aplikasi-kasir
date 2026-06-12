// Auto-generated types for Supabase tables.
// Re-generate with: npx supabase gen types typescript --project-id ddgipbesoktmowbnpvxu

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          label: string
          emoji: string
          sort_order: number
        }
        Insert: {
          id: string
          label: string
          emoji: string
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          stock: number
          category_id: string
          image: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string
          price: number
          stock?: number
          category_id: string
          image?: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      payment_methods: {
        Row: {
          id: string
          label: string
          sub_label: string
          icon_name: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id: string
          label: string
          sub_label?: string
          icon_name?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          status: string
          subtotal: number
          discount_amount: number
          discount_type: string
          discount_value: number
          tax_amount: number
          grand_total: number
          payment_method: string
          cash_received: number | null
          change_amount: number | null
          cashier_name: string
          notes: string | null
          created_at: string
        }
        Insert: {
          order_number: string
          status?: string
          subtotal: number
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          tax_amount: number
          grand_total: number
          payment_method: string
          cash_received?: number | null
          change_amount?: number | null
          cashier_name?: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_id: number
          product_name: string
          unit_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          order_id: string
          product_id: number
          product_name: string
          unit_price: number
          quantity: number
          subtotal: number
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
  }
}

// ── Convenience row types ─────────────────────────────────────
export type DbCategory      = Database['public']['Tables']['categories']['Row']
export type DbProduct       = Database['public']['Tables']['products']['Row']
export type DbPaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type DbOrder         = Database['public']['Tables']['orders']['Row']
export type DbOrderItem     = Database['public']['Tables']['order_items']['Row']
