import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import type { Product } from '@/data/products'

interface DeleteConfirmDialogProps {
  open: boolean
  product: Product | null
  onConfirm: () => void
  onClose: () => void
  deleting: boolean
}

export function DeleteConfirmDialog({
  open, product, onConfirm, onClose, deleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-2">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <DialogTitle className="text-base font-bold text-gray-900">Delete Product?</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Produk <span className="font-semibold text-gray-800">"{product?.name}"</span> akan
            dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={deleting} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 gap-2"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
