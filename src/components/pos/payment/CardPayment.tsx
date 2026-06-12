import { useEffect, useState } from 'react'
import {
  CreditCard, CheckCircle2, XCircle, Loader2, Wifi, RefreshCw, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CardStatus } from '@/types/cart'

interface CardPaymentProps {
  grandTotal: number
  status: CardStatus
  onStatusChange: (s: CardStatus) => void
}

type CardType = 'visa' | 'mastercard' | 'amex' | 'other'

function detectCardType(num: string): CardType {
  if (num.startsWith('4')) return 'visa'
  if (num.startsWith('5') || num.startsWith('2')) return 'mastercard'
  if (num.startsWith('3')) return 'amex'
  return 'other'
}

function CardTypeBadge({ type }: { type: CardType }) {
  const styles: Record<CardType, { label: string; cls: string }> = {
    visa:       { label: 'VISA',       cls: 'bg-blue-600 text-white' },
    mastercard: { label: 'Mastercard', cls: 'bg-red-500 text-white' },
    amex:       { label: 'AMEX',       cls: 'bg-green-600 text-white' },
    other:      { label: 'CARD',       cls: 'bg-gray-300 text-gray-600' },
  }
  const s = styles[type]
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest', s.cls)}>
      {s.label}
    </span>
  )
}

export function CardPayment({ grandTotal, status, onStatusChange }: CardPaymentProps) {
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const cardType = detectCardType(cardNum.replace(/\s/g, ''))

  // Format card number with spaces
  function handleCardNum(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    setCardNum(digits.replace(/(.{4})/g, '$1 ').trim())
  }

  // Format expiry MM/YY
  function handleExpiry(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits)
  }

  const formComplete =
    cardNum.replace(/\s/g, '').length >= 16 &&
    expiry.length === 5 &&
    cvv.length >= 3 &&
    name.trim().length > 1

  // Simulate processing → approved/declined
  useEffect(() => {
    if (status !== 'processing') return
    const timer = setTimeout(() => {
      // 90% approve rate in demo
      onStatusChange(Math.random() > 0.1 ? 'approved' : 'declined')
    }, 2500)
    return () => clearTimeout(timer)
  }, [status, onStatusChange])

  function handleProcess() {
    if (!formComplete) return
    onStatusChange('processing')
  }

  function handleReset() {
    onStatusChange('idle')
    setCardNum('')
    setExpiry('')
    setCvv('')
    setName('')
  }

  // ─── Approved / Declined state ───────────────────────────
  if (status === 'approved') {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-emerald-700 text-base">Card Approved!</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatCurrency(grandTotal)} charged to •••• {cardNum.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl w-full justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Authorization code: <span className="font-bold text-gray-600">TXN-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
          </div>
        </div>
        <button onClick={handleReset} className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-red-600 text-base">Card Declined</p>
            <p className="text-xs text-gray-400 mt-0.5">Please try a different card or payment method.</p>
          </div>
        </div>
        <Button onClick={handleReset} variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // ─── Processing ───────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800">Processing Payment…</p>
          <p className="text-xs text-gray-400 mt-1">Please do not remove your card</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          Connecting to terminal
        </div>
      </div>
    )
  }

  // ─── Idle — show card form ────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Amount */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          Card Payment
        </span>
        <span className="text-base font-extrabold text-blue-700">{formatCurrency(grandTotal)}</span>
      </div>

      {/* Card number */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Card Number</label>
        <div className="relative">
          <input
            value={cardNum}
            onChange={(e) => handleCardNum(e.target.value)}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className="w-full h-9 pl-3 pr-16 border border-input rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-gray-300"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <CardTypeBadge type={cardType} />
          </div>
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Expiry</label>
          <input
            value={expiry}
            onChange={(e) => handleExpiry(e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full h-9 px-3 border border-input rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-gray-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">CVV</label>
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            type="password"
            className="w-full h-9 px-3 border border-input rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Card holder */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Cardholder Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name on card"
          className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-gray-300"
        />
      </div>

      {/* Process button */}
      <Button
        onClick={handleProcess}
        disabled={!formComplete}
        className="w-full h-10 gap-2 shadow-md shadow-blue-200"
      >
        <ShieldCheck className="w-4 h-4" />
        Process Payment
      </Button>

      {/* Accepted cards */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-[10px] text-gray-400">Accepted:</span>
        {['VISA', 'MC', 'AMEX', 'JCB'].map((b) => (
          <span key={b} className="text-[10px] font-extrabold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded tracking-wider">
            {b}
          </span>
        ))}
        <ShieldCheck className="w-3 h-3 text-emerald-400 ml-1" />
        <span className="text-[10px] text-gray-400">Secure</span>
      </div>
    </div>
  )
}
