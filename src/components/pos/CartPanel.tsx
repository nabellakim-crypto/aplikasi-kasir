import { useState, useMemo } from 'react'
import { ShoppingCart, Trash2, Printer, Tag, Percent, DollarSign, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CartItemRow } from './CartItem'
import { ReceiptDialog } from './ReceiptDialog'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CashPayment } from './payment/CashPayment'
import { QrisPayment } from './payment/QrisPayment'
import { CardPayment } from './payment/CardPayment'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { useCreateOrder } from '@/hooks/useCreateOrder'
import { formatCurrency } from '@/lib/utils'
import { TAX_RATE } from '@/data/products'
import type { CartItem, DiscountType, PaymentMethod, QrisStatus, CardStatus } from '@/types/cart'
import { cn } from '@/lib/utils'

interface CartPanelProps {
  items: CartItem[]
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
  onRemove: (id: number) => void
  onClear: () => void
}

export function CartPanel({ items, onIncrease, onDecrease, onRemove, onClear }: CartPanelProps) {
  // Discount
  const [discountValue, setDiscountValue] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('percent')

  // Payment method
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash')

  // Cash
  const [cashReceived, setCashReceived] = useState('')

  // QRIS
  const [qrisStatus, setQrisStatus] = useState<QrisStatus>('idle')

  // Card
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle')

  // Receipt
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [savedOrderNumber, setSavedOrderNumber] = useState<string>('')

  // Supabase hooks
  const { methods, loading: methodsLoading } = usePaymentMethods()
  const { saving, error: saveError, createOrder } = useCreateOrder()

  // ─── Derived values ───────────────────────────────────────
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [items]
  )

  const discountAmount = useMemo(() => {
    const raw = parseFloat(discountValue) || 0
    if (discountType === 'percent') return Math.min(subtotal * (raw / 100), subtotal)
    return Math.min(raw, subtotal)
  }, [discountValue, discountType, subtotal])

  const afterDiscount = subtotal - discountAmount
  const tax = afterDiscount * TAX_RATE
  const grandTotal = afterDiscount + tax

  const cashNum = parseFloat(cashReceived) || 0
  const change = Math.max(0, cashNum - grandTotal)

  // ─── Readiness per payment method ────────────────────────
  const isReady = useMemo(() => {
    if (items.length === 0) return false
    if (payMethod === 'cash') return cashNum >= grandTotal && cashNum > 0
    if (payMethod === 'qris') return qrisStatus === 'paid'
    if (payMethod === 'card') return cardStatus === 'approved'
    return false
  }, [items.length, payMethod, cashNum, grandTotal, qrisStatus, cardStatus])

  // ─── Charge button label ─────────────────────────────────
  function chargeLabel() {
    if (saving) return 'Saving…'
    if (items.length === 0) return 'Add Items'
    if (payMethod === 'cash') {
      if (!cashReceived) return 'Enter Cash Amount'
      if (cashNum < grandTotal) return 'Insufficient Cash'
      return 'Charge'
    }
    if (payMethod === 'qris') {
      if (qrisStatus === 'idle') return 'Generate QR First'
      if (qrisStatus === 'waiting') return 'Waiting for Scan…'
      return 'Confirm Payment'
    }
    if (payMethod === 'card') {
      if (cardStatus === 'idle') return 'Process Card First'
      if (cardStatus === 'processing') return 'Processing…'
      if (cardStatus === 'declined') return 'Card Declined'
      return 'Confirm Payment'
    }
    return 'Charge'
  }

  // ─── Handlers ────────────────────────────────────────────
  function handleMethodChange(m: PaymentMethod) {
    setPayMethod(m)
    setCashReceived('')
    setQrisStatus('idle')
    setCardStatus('idle')
  }

  async function handleCheckout() {
    if (!isReady || saving) return

    const result = await createOrder({
      items,
      subtotal,
      discountAmount,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      taxAmount: tax,
      grandTotal,
      paymentMethod: payMethod,
      cashReceived: payMethod === 'cash' ? cashNum : undefined,
      changeAmount: payMethod === 'cash' ? change : undefined,
    })

    if (result) {
      setSavedOrderNumber(result.orderNumber)
      setReceiptOpen(true)
    }
  }

  function handleReceiptClose() {
    setReceiptOpen(false)
    onClear()
    setDiscountValue('')
    setCashReceived('')
    setQrisStatus('idle')
    setCardStatus('idle')
    setSavedOrderNumber('')
  }

  return (
    <>
      <aside className="w-full flex flex-col h-full bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)]">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-[18px] h-[18px] text-gray-700" />
              <span className="text-[15px] font-bold text-gray-900">Order</span>
              {totalItems > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center leading-4">
                  {totalItems}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Cart Items ── */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 px-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center">
              <ShoppingCart className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Cart is empty</p>
            <p className="text-xs text-center text-gray-400">
              Select products from the catalog to add them here
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-4 py-3 space-y-2.5">
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* ── Checkout section ── */}
        <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-3 flex-shrink-0 bg-white">

          {/* Discount */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Tag className="w-3 h-3" />
              Discount
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0"
                className="flex-1 h-9 text-sm"
              />
              <button
                onClick={() => setDiscountType(discountType === 'percent' ? 'fixed' : 'percent')}
                className={cn(
                  'px-3 h-9 rounded-lg border text-sm font-bold transition-all flex items-center gap-1',
                  discountType === 'percent'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                {discountType === 'percent'
                  ? <><Percent className="w-3.5 h-3.5" />%</>
                  : <><DollarSign className="w-3.5 h-3.5" />$</>
                }
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-red-500">−{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8.5%)</span>
              <span className="font-medium text-gray-700">{formatCurrency(tax)}</span>
            </div>
          </div>

          <Separator />

          {/* Grand Total */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-sm font-bold text-blue-800">Grand Total</span>
            <span className="text-[22px] font-extrabold text-blue-600 tracking-tight">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <Separator />

          {/* ── Payment Method Selector ── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Payment Method
            </p>
            <PaymentMethodSelector
              selected={payMethod}
              onChange={handleMethodChange}
              methods={methods}
              loading={methodsLoading}
            />
          </div>

          {/* ── Per-method panel ── */}
          <div className="pt-0.5">
            {payMethod === 'cash' && (
              <CashPayment grandTotal={grandTotal} cashReceived={cashReceived} onChange={setCashReceived} />
            )}
            {payMethod === 'qris' && (
              <QrisPayment grandTotal={grandTotal} status={qrisStatus} onStatusChange={setQrisStatus} />
            )}
            {payMethod === 'card' && (
              <CardPayment grandTotal={grandTotal} status={cardStatus} onStatusChange={setCardStatus} />
            )}
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* ── Charge + Print buttons ── */}
          <div className="flex gap-2 pt-1">
            <Button
              className={cn(
                'flex-1 h-11 text-sm font-bold gap-2',
                isReady && !saving && 'shadow-md shadow-blue-200'
              )}
              disabled={!isReady || saving}
              onClick={handleCheckout}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><CreditCard className="w-4 h-4" />{chargeLabel()}</>
              }
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              disabled={items.length === 0 || saving}
              onClick={() => items.length > 0 && setReceiptOpen(true)}
              title="Preview Receipt"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </aside>

      {/* Receipt dialog */}
      <ReceiptDialog
        open={receiptOpen}
        onClose={handleReceiptClose}
        items={items}
        subtotal={subtotal}
        discountAmount={discountAmount}
        tax={tax}
        grandTotal={grandTotal}
        cashReceived={payMethod === 'cash' ? cashNum : grandTotal}
        change={payMethod === 'cash' ? change : 0}
        paymentMethod={payMethod}
        orderNumber={savedOrderNumber}
      />
    </>
  )
}
