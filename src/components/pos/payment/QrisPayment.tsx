import { useEffect, useState } from 'react'
import { QrCode, RefreshCw, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { QrisStatus } from '@/types/cart'

interface QrisPaymentProps {
  grandTotal: number
  status: QrisStatus
  onStatusChange: (s: QrisStatus) => void
}

// Simple SVG QR code placeholder that looks realistic
function QrCodePlaceholder() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Outer border */}
      <rect width="200" height="200" fill="white" />
      {/* Top-left finder */}
      <rect x="10" y="10" width="55" height="55" fill="black" rx="4" />
      <rect x="18" y="18" width="39" height="39" fill="white" rx="2" />
      <rect x="26" y="26" width="23" height="23" fill="black" rx="2" />
      {/* Top-right finder */}
      <rect x="135" y="10" width="55" height="55" fill="black" rx="4" />
      <rect x="143" y="18" width="39" height="39" fill="white" rx="2" />
      <rect x="151" y="26" width="23" height="23" fill="black" rx="2" />
      {/* Bottom-left finder */}
      <rect x="10" y="135" width="55" height="55" fill="black" rx="4" />
      <rect x="18" y="143" width="39" height="39" fill="white" rx="2" />
      <rect x="26" y="151" width="23" height="23" fill="black" rx="2" />
      {/* Data modules (random-looking pattern) */}
      {[
        [80,10],[90,10],[100,10],[110,10],[80,20],[100,20],[90,30],[110,30],[80,40],[90,40],[100,40],
        [80,55],[100,55],[110,55],[80,65],[110,65],[90,75],[100,75],
        [10,80],[20,80],[40,80],[55,80],[65,80],
        [10,90],[30,90],[50,90],[75,90],
        [10,100],[20,100],[40,100],[60,100],[75,100],
        [10,110],[30,110],[55,110],
        [10,120],[20,120],[40,120],[65,120],
        [80,80],[100,80],[120,80],[140,80],[160,80],[180,80],
        [80,90],[110,90],[130,90],[150,90],[170,90],
        [90,100],[120,100],[140,100],[160,100],[180,100],
        [80,110],[100,110],[130,110],[150,110],
        [90,120],[110,120],[140,120],[170,120],[180,120],
        [80,140],[100,140],[120,140],[160,140],[180,140],
        [90,150],[110,150],[140,150],[170,150],
        [80,160],[120,160],[150,160],[180,160],
        [90,170],[100,170],[130,170],[160,170],
        [80,180],[110,180],[140,180],[170,180],[180,180],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="8" fill="black" />
      ))}
    </svg>
  )
}

export function QrisPayment({ grandTotal, status, onStatusChange }: QrisPaymentProps) {
  const [countdown, setCountdown] = useState(0)

  // Simulate auto-payment after 5s of "waiting"
  useEffect(() => {
    if (status !== 'waiting') return
    setCountdown(5)
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick)
          onStatusChange('paid')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [status, onStatusChange])

  function handleGenerate() {
    onStatusChange('waiting')
  }

  function handleReset() {
    onStatusChange('idle')
    setCountdown(0)
  }

  return (
    <div className="space-y-3">
      {/* Amount chip */}
      <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5">
        <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5" />
          QRIS Payment
        </span>
        <span className="text-base font-extrabold text-violet-700">{formatCurrency(grandTotal)}</span>
      </div>

      {/* QR area */}
      <div className="relative">
        <div
          className={cn(
            'w-full aspect-square max-w-[180px] mx-auto rounded-2xl overflow-hidden border-2 transition-all duration-300',
            status === 'paid'
              ? 'border-emerald-400 shadow-lg shadow-emerald-100'
              : status === 'waiting'
                ? 'border-violet-400 shadow-lg shadow-violet-100'
                : 'border-gray-200'
          )}
        >
          {status === 'idle' ? (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
              <QrCode className="w-12 h-12 text-gray-300" />
              <p className="text-xs text-gray-400 font-medium">QR not generated</p>
            </div>
          ) : status === 'paid' ? (
            <div className="w-full h-full bg-emerald-50 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700">Payment Received!</p>
            </div>
          ) : (
            <QrCodePlaceholder />
          )}
        </div>

        {/* Waiting overlay spinner ring */}
        {status === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[calc(100%-32px)] max-w-[188px] aspect-square rounded-2xl border-4 border-violet-400 border-t-transparent animate-spin opacity-30" />
          </div>
        )}
      </div>

      {/* Status badge */}
      {status !== 'idle' && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
            status === 'waiting'
              ? 'bg-violet-50 text-violet-700 border border-violet-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          )}
        >
          {status === 'waiting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for payment…
              <span className="bg-violet-200 text-violet-800 text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {countdown}s
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Payment confirmed!
            </>
          )}
        </div>
      )}

      {/* Action button */}
      {status === 'idle' && (
        <Button
          onClick={handleGenerate}
          className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-md shadow-violet-200"
        >
          <QrCode className="w-4 h-4" />
          Generate QR Code
        </Button>
      )}

      {status === 'waiting' && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          <RefreshCw className="w-3 h-3" />
          Cancel & regenerate
        </button>
      )}

      {status === 'paid' && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      )}

      {/* Accepted logos */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-[10px] text-gray-400 font-medium">Accepted:</span>
        {['GoPay', 'OVO', 'Dana', 'ShopeePay'].map((b) => (
          <span
            key={b}
            className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}
