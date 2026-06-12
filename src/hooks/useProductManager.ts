import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/data/products'

export type ProductFormData = {
  name: string
  description: string
  price: string
  stock: string
  category_id: string
  image: string
  is_active: boolean
}

export const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: 'beverages',
  image: '',
  is_active: true,
}

export function useProductManager(onSuccess: () => void) {
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const createProduct = useCallback(async (form: ProductFormData) => {
    setSaving(true); setError(null)
    const { error } = await supabase.from('products').insert({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      stock:       parseInt(form.stock) || 0,
      category_id: form.category_id,
      image:       form.image.trim(),
      is_active:   form.is_active,
    })
    setSaving(false)
    if (error) { setError(error.message); return false }
    onSuccess(); return true
  }, [onSuccess])

  const updateProduct = useCallback(async (id: number, form: ProductFormData) => {
    setSaving(true); setError(null)
    const { error } = await supabase.from('products').update({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      stock:       parseInt(form.stock) || 0,
      category_id: form.category_id,
      image:       form.image.trim(),
      is_active:   form.is_active,
    }).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return false }
    onSuccess(); return true
  }, [onSuccess])

  const deleteProduct = useCallback(async (id: number) => {
    setDeleting(true); setError(null)
    const { error } = await supabase.from('products').delete().eq('id', id)
    setDeleting(false)
    if (error) { setError(error.message); return false }
    onSuccess(); return true
  }, [onSuccess])

  const toggleActive = useCallback(async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !(product as unknown as { is_active: boolean }).is_active })
      .eq('id', product.id)
    if (error) setError(error.message)
    else onSuccess()
  }, [onSuccess])

  return { saving, deleting, error, setError, createProduct, updateProduct, deleteProduct, toggleActive }
}
