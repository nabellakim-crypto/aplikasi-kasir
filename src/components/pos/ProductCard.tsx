import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/ui/product-image'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/data/products'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="danger">Out of Stock</Badge>
  if (stock <= 5) return <Badge variant="warning">Only {stock} left</Badge>
  return <Badge variant="success">{stock} in stock</Badge>
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isOos = product.stock === 0

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200',
        isOos
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 cursor-pointer'
      )}
      onClick={() => !isOos && onAdd(product)}
    >
      {/* Image */}
      <div className="relative w-full pt-[68%] bg-gray-50 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <StockBadge stock={product.stock} />
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
            {product.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          <button
            disabled={isOos}
            onClick={(e) => { e.stopPropagation(); !isOos && onAdd(product) }}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              isOos
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
