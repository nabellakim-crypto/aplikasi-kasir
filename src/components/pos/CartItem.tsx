import { Minus, Plus, Trash2 } from 'lucide-react'
import { ProductImage } from '@/components/ui/product-image'
import { formatCurrency } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart'

interface CartItemProps {
  item: CartItemType
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
  onRemove: (id: number) => void
}

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group animate-in slide-in-from-right-2 duration-200">
      {/* Image */}
      <ProductImage
        src={product.image}
        alt={product.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        fallbackClassName="w-12 h-12 rounded-lg flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
        <p className="text-xs text-gray-400">{formatCurrency(product.price)} each</p>

        {/* Qty controls */}
        <div className="flex items-center gap-0 mt-2 w-fit border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => onDecrease(product.id)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-800 border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => onIncrease(product.id)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => onRemove(product.id)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-bold text-blue-600">
          {formatCurrency(product.price * quantity)}
        </span>
      </div>
    </div>
  )
}
