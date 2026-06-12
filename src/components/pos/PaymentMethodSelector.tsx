import { Banknote, QrCode, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/cart'
import type { PaymentMethodConfig } from '@/hooks/usePaymentMethods'

// Map icon_name string from DB → actual Lucide component
function MethodIcon({ name, className }: { name: string; className?: string }) {
  const cls = className ?? 'w-5 h-5'
  switch (name) {
    case 'Banknote':   return <Banknote   className={cls} />
    case 'QrCode':     return <QrCode     className={cls} />
    case 'CreditCard': return <CreditCard className={cls} />
    default:           return <CreditCard className={cls} />
  }
}

// Active color config per method id
const ACTIVE_COLORS: Record<string, { card: string; iconBg: string }> = {
  cash: { card: 'ring-emerald-500 bg-emerald-50 border-emerald-400', iconBg: 'bg-emerald-500' },
  qris: { card: 'ring-violet-500 bg-violet-50 border-violet-400',   iconBg: 'bg-violet-500'  },
  card: { card: 'ring-blue-500 bg-blue-50 border-blue-400',         iconBg: 'bg-blue-500'    },
}

interface PaymentMethodSelectorProps {
  selected: PaymentMethod
  onChange: (method: PaymentMethod) => void
  methods: PaymentMethodConfig[]
  loading?: boolean
}

export function PaymentMethodSelector({
  selected,
  onChange,
  methods,
  loading,
}: PaymentMethodSelectorProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {methods.map((m) => {
        const isActive = selected === m.id
        const colors = ACTIVE_COLORS[m.id] ?? ACTIVE_COLORS['card']

        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none',
              isActive
                ? `${colors.card} ring-2 ring-offset-1 shadow-sm`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {/* Active dot */}
            {isActive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current opacity-80" />
            )}

            {/* Icon */}
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive ? `${colors.iconBg} text-white shadow-md` : 'bg-gray-100 text-gray-500'
              )}
            >
              <MethodIcon name={m.iconName} />
            </div>

            {/* Labels */}
            <div className="text-center leading-tight">
              <p className={cn('text-xs font-bold transition-colors', isActive ? 'text-gray-900' : 'text-gray-600')}>
                {m.label}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">{m.subLabel}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
