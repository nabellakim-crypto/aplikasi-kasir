import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle2, Printer, Banknote, QrCode, CreditCard } from 'lucide-react'
import type { CartItem, PaymentMethod } from '@/types/cart'

interface ReceiptDialogProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  discountAmount: number
  tax: number
  grandTotal: number
  cashReceived: number
  change: number
  paymentMethod: PaymentMethod
  orderNumber?: string
}

const METHOD_META: Record<PaymentMethod, { label: string; icon: React.ReactNode; color: string }> = {
  cash: {
    label: 'Cash',
    icon: <Banknote className="w-4 h-4" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  qris: {
    label: 'QRIS',
    icon: <QrCode className="w-4 h-4" />,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  card: {
    label: 'Credit / Debit Card',
    icon: <CreditCard className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
}

export function ReceiptDialog({
  open,
  onClose,
  items,
  subtotal,
  discountAmount,
  tax,
  grandTotal,
  cashReceived,
  change,
  paymentMethod,
  orderNumber,
}: ReceiptDialogProps) {
  const now = new Date()
  const meta = METHOD_META[paymentMethod]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">

        {/* ── Success header ── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-extrabold">
              Payment Successful
            </DialogTitle>
          </DialogHeader>
          <p className="text-blue-200 text-sm mt-1">{formatDate(now)}</p>

          {/* Payment method chip */}
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white">
            {meta.icon}
            Paid via {meta.label}
          </div>
        </div>

        {/* ── Receipt body ── */}
        <div className="px-6 py-4 space-y-3 max-h-[55vh] overflow-y-auto">

          {/* Store info */}
          <div className="text-center">
            <p className="font-extrabold text-gray-900 text-base">🏪 NovaPOS Store</p>
            <p className="text-xs text-gray-400">123 Main Street · Cashier: Alex Morgan</p>
            {orderNumber && (
              <p className="text-xs text-blue-600 font-mono font-bold mt-1">{orderNumber}</p>
            )}
          </div>

          <Separator className="border-dashed" />

          {/* Items */}
          <div className="space-y-1.5">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 pr-2">
                  {product.name}
                  <span className="text-gray-400 ml-1">× {quantity}</span>
                </span>
                <span className="font-semibold text-gray-800 flex-shrink-0">
                  {formatCurrency(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="border-dashed" />

          {/* Summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>−{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Tax (8.5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-blue-600 text-base mt-1">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            <Separator />

            {/* Payment method row */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${meta.color}`}>
              {meta.icon}
              <span className="font-semibold text-sm flex-1">Paid via {meta.label}</span>
              <span className="font-bold">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Cash-specific rows */}
            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>Cash Received</span>
                  <span>{formatCurrency(cashReceived)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Change</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              </>
            )}
          </div>

          <Separator className="border-dashed" />

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Thank you for shopping with us! 🙏<br />
            <span className="font-medium text-gray-500">novapos.store</span>
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-5 pt-2 flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={onClose}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            New Order
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
