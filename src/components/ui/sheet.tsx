'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  side?: 'right' | 'left' | 'bottom' | 'center'
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const SIDE: Record<NonNullable<SheetProps['side']>, string> = {
  right: 'right-0 top-0 h-dvh w-full max-w-md data-[state=open]:animate-[py-slide-left_.28s_ease-out]',
  left: 'left-0 top-0 h-dvh w-full max-w-sm data-[state=open]:animate-[py-slide-right_.28s_ease-out]',
  bottom: 'bottom-0 left-0 max-h-[90dvh] w-full rounded-t-2xl data-[state=open]:animate-[py-slide-up_.28s_ease-out]',
  center:
    'left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl data-[state=open]:animate-[py-pop_.22s_ease-out]',
}

/** Accessible drawer / dialog (focus trap, Esc to close, scroll lock) on Radix Dialog. */
export function Sheet({ open, onOpenChange, title, description, side = 'right', className, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm data-[state=open]:animate-[py-fade_.2s_ease-out]" />
        <Dialog.Content
          className={cn('fixed z-50 flex flex-col bg-white text-navy-950 shadow-2xl outline-none', SIDE[side], className)}
          aria-describedby={description ? undefined : undefined}
        >
          <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
            <div>
              <Dialog.Title className="font-heading text-xl font-bold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="grid size-10 place-items-center rounded-full hover:bg-navy-100" aria-label="Close">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer ? <div className="border-t p-4">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
