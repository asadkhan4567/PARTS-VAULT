import type { AdminViewServerProps } from 'payload'

import { BulkPriceForm } from './BulkPriceForm'
import { ToolView } from './ToolView'

export default async function BulkPriceView(props: AdminViewServerProps) {
  const payload = props.initPageResult.req.payload
  const [cats, brands, makes] = await Promise.all([
    payload.find({ collection: 'categories', limit: 0, pagination: false, depth: 0, sort: 'name', overrideAccess: true }),
    payload.find({ collection: 'part-brands', limit: 0, pagination: false, depth: 0, sort: 'name', overrideAccess: true }),
    payload.find({ collection: 'makes', limit: 0, pagination: false, depth: 0, sort: 'name', overrideAccess: true }),
  ])
  return (
    <ToolView props={props} title="Bulk price update" intro="Pick which products, choose the change, check the preview, then apply. Every change is saved in the audit log.">
      <BulkPriceForm
        categories={cats.docs.map((c) => ({ id: c.id, name: c.parent ? `— ${c.name}` : c.name }))}
        brands={brands.docs.map((b) => ({ id: b.id, name: b.name }))}
        makes={makes.docs.map((m) => ({ id: m.id, name: m.name }))}
      />
    </ToolView>
  )
}
