import { cn } from '@/lib/utils'
import type { Category } from '@/data/products'

interface CategoryTabsProps {
  active: string
  onChange: (id: string) => void
  categories: Category[]
  loading?: boolean
}

export function CategoryTabs({ active, onChange, categories, loading }: CategoryTabsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-200 flex-shrink-0',
            active === cat.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
          )}
        >
          <span className="text-base leading-none">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}
