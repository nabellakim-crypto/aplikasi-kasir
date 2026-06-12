import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  /** Extra classes for the fallback wrapper */
  fallbackClassName?: string
}

/**
 * Renders a product image with a graceful fallback if the URL fails to load.
 */
export function ProductImage({ src, alt, className, fallbackClassName }: ProductImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gray-100 text-gray-300',
          fallbackClassName
        )}
      >
        <ImageOff className="w-8 h-8" />
        <span className="text-[10px] font-medium text-gray-400 text-center px-2 leading-tight">
          {alt}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}
