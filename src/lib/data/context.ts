import 'server-only'

import type { BlockContext } from '@/components/blocks/types'

import { getCustomer, getVehicle } from '../session'
import { getSettings } from './settings'

export async function getBlockContext(): Promise<BlockContext> {
  const [settings, vehicle, customer] = await Promise.all([getSettings(), getVehicle(), getCustomer()])
  return { settings, vehicle, customer }
}
