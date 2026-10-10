import 'server-only'

import { cookies, headers } from 'next/headers'
import { cache } from 'react'

import type { Customer } from '@/payload-types'

import { getPayloadClient } from './payload'
import { parseVehicle, VEHICLE_COOKIE, type Vehicle } from './vehicle'

/** The logged-in shopper, if any (staff sessions are ignored on the storefront). */
export const getCustomer = cache(async (): Promise<(Customer & { collection: 'customers' }) | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user?.collection === 'customers' ? (user as Customer & { collection: 'customers' }) : null
})

export const getVehicle = cache(async (): Promise<Vehicle | null> => {
  const store = await cookies()
  return parseVehicle(store.get(VEHICLE_COOKIE)?.value)
})
