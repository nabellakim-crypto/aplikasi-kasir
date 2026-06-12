import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ProductImage } from '@/components/ui/product-image'
import { Loader2, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, Category } from '@/data/products'
import type { ProductFormData } from '@/hooks/useProductManager'
import { EMPTY_FORM } from '@/hooks/useProductManager'

interface ProductFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: ProductFormData) => Promise<boolean>
  product?: Product | null   // null = create mode
  categories: Category[]
  saving: boolean
  error: string | null
}

const FIELD_LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wide'

export function ProductFormDialog({
  open, onClose, onSubmit, product, categories, saving, error,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [imgPreviewErr, setImgPreviewErr] = useState(false)

  const isEdit = !!product

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name:        product.name,
        description: product.description ?? '',
        price:       String(product.price),
        stock:       String(product.stock),
        category_id: product.category,
        image:       product.image ?? '',
        is_active:   true,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setImgPreviewErr(false)
  }, [product, open])

  function set(key: keyof ProductFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const valid =
    form.name.trim().length > 0 &&
    parseFloat(form.price) > 0 &&
    form.category_id.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || saving) return
    const ok = await onSubmit(form)
    if (ok) onClose()
  }

  // Real categories (exclude 'all')
  const realCats = categories.filter((c) => c.id !== 'all')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              {isEdit ? `Edit Product — ${product?.name}` : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto">

            {/* Left column */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className={FIELD_LABEL}>Product Name <span className="text-red-500">*</span></label>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Caramel Latte"
                  className="h-9"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={FIELD_LABEL}>Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Short product description…"
                  className="h-[76px]"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={FIELD_LABEL}>Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder="0.00"
                      className="h-9 pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={FIELD_LABEL}>Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => set('stock', e.target.value)}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className={FIELD_LABEL}>Category <span className="text-red-500">*</span></label>
                <Select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className="h-9"
                >
                  {realCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Active</p>
                  <p className="text-xs text-gray-400">Product visible in POS catalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('is_active', !form.is_active)}
                  className={cn(
                    'relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                    form.is_active ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                >
                  <span className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                    form.is_active ? 'translate-x-5' : 'translate-x-1'
                  )} />
                </button>
              </div>
            </div>

            {/* Right column — Image */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={FIELD_LABEL}>Image URL</label>
                <Input
                  value={form.image}
                  onChange={(e) => { set('image', e.target.value); setImgPreviewErr(false) }}
                  placeholder="https://images.unsplash.com/…"
                  className="h-9 text-xs"
                />
              </div>

              {/* Preview */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                {form.image && !imgPreviewErr ? (
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImgPreviewErr(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <ImageOff className="w-10 h-10" />
                    <p className="text-xs text-gray-400">
                      {form.image ? 'Invalid image URL' : 'Paste image URL above'}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Tip: Use{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  unsplash.com
                </a>{' '}
                — klik foto, kanan klik → Copy image address.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400">
              <span className="text-red-500">*</span> Wajib diisi
            </p>
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={!valid || saving} className="gap-2 min-w-[100px]">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
