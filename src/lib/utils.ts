import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 })

/** Formats a rupee amount the way Pakistani shoppers read it: "Rs 8,425". */
export function formatPrice(amount: number): string {
  return `Rs ${pkr.format(Math.round(amount))}`
}

/** URL-safe slug: lowercase ascii, words joined by "-". */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
