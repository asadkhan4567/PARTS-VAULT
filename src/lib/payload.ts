import 'server-only'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

export const getPayloadClient = cache(async (): Promise<Payload> => getPayload({ config }))
