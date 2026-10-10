'use client'

import { useEffect } from 'react'

import { saveWishlist, syncWishlist } from '@/app/(frontend)/account/actions'
import { readWishlist, WISHLIST_EVENT, writeWishlist } from '@/lib/wishlist'

/** Logged-in shoppers: merge the device wishlist into the account, then keep it in sync. */
export function WishlistSync() {
  useEffect(() => {
    let syncing = true
    syncWishlist(readWishlist())
      .then((merged) => {
        if (merged) writeWishlist(merged)
      })
      .finally(() => {
        syncing = false
      })
    const onChange = () => {
      if (!syncing) void saveWishlist(readWishlist())
    }
    window.addEventListener(WISHLIST_EVENT, onChange)
    return () => window.removeEventListener(WISHLIST_EVENT, onChange)
  }, [])
  return null
}
