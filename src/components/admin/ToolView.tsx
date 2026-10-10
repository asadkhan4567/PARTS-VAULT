import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'

import { isManagerReq } from '@/access'

/** Admin page shell for owner tools (keeps the normal sidebar + header). */
export function ToolView({ props, title, intro, children }: { props: AdminViewServerProps; title: string; intro: string; children: React.ReactNode }) {
  const { initPageResult, params, searchParams } = props
  const req = initPageResult.req
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div className="py-tool">
          <h1>{title}</h1>
          <p className="py-muted">{intro}</p>
          {isManagerReq(req) ? children : <p className="py-tool__denied">Only the Owner or a Manager can use this tool.</p>}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
