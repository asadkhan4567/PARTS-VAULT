import { draftMode } from 'next/headers'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getHomepage } from '@/lib/data/content'
import { getBlockContext } from '@/lib/data/context'

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode()
  const [home, ctx] = await Promise.all([getHomepage(draft), getBlockContext()])
  return <RenderBlocks blocks={home.sections as never} ctx={ctx} />
}
