'use client'

import { Camera, Star } from 'lucide-react'
import { useActionState, useState } from 'react'

import { submitReview, type FormState } from '@/app/(frontend)/actions'
import { cn } from '@/lib/utils'

const input = 'h-11 w-full rounded-lg border bg-white px-3 text-sm'

export function ReviewForm({ productId, defaultName }: { productId: number; defaultName?: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [state, action, pending] = useActionState<FormState | null, FormData>(submitReview, null)
  if (state?.ok) return <p className="rounded-lg bg-success/10 p-4 font-semibold text-[#0f7a37]" role="status">{state.message}</p>
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-lg border-2 border-navy-900 px-5 font-semibold hover:bg-navy-900 hover:text-white" data-testid="write-review">
        Write a review
      </button>
    )
  const err = (k: string) => (state?.errors?.[k] ? <span className="text-xs text-red-700">{state.errors[k]}</span> : null)
  return (
    <form action={action} className="grid max-w-2xl gap-3 rounded-brand border bg-white p-5 sm:grid-cols-2" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset className="sm:col-span-2">
        <legend className="mb-1 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
              <Star className={cn('size-8', n <= rating ? 'fill-warning text-warning' : 'text-steel-400')} />
            </button>
          ))}
        </div>
        {err('rating')}
      </fieldset>
      <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
        Title
        <input name="title" className={input} placeholder="Perfect fit, fast delivery" />
        {err('title')}
      </label>
      <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
        Your review
        <textarea name="text" rows={4} className={`${input} h-auto py-2`} />
        {err('text')}
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Name
        <input name="name" defaultValue={defaultName} className={input} />
        {err('name')}
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        City
        <input name="city" className={input} />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Order number <span className="font-normal text-muted-foreground">(for “Verified buyer”)</span>
        <input name="orderNumber" placeholder="PY-100245" className={`${input} font-mono uppercase`} />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Phone used for the order
        <input name="phone" type="tel" placeholder="0300-1234567" className={input} />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-sm sm:col-span-2">
        <Camera className="size-5 text-red-600" /> <span className="flex-1">Add up to 3 photos (optional)</span>
        <input type="file" name="photos" accept="image/*" multiple className="max-w-[45%] text-xs" />
      </label>
      {state && !state.ok ? <p className="text-sm text-red-700 sm:col-span-2" role="alert">{state.message}</p> : null}
      <button disabled={pending} className="h-12 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:col-span-2">
        {pending ? 'Sending…' : 'Submit review'}
      </button>
    </form>
  )
}
