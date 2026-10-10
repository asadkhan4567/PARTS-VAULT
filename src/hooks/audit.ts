import type { CollectionAfterChangeHook } from 'payload'

/**
 * Records who changed which watched fields (price, stock, order status…) into `audit-logs`.
 * Runs inside the same request/transaction as the change itself.
 */
export function auditFields(fields: string[], titleField = 'title'): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, operation, req, collection }) => {
    if (req.context?.skipAudit) return doc
    const changes: Record<string, { from: unknown; to: unknown }> = {}
    for (const f of fields) {
      const before = operation === 'create' ? undefined : previousDoc?.[f]
      const after = doc?.[f]
      if (before !== after && !(before == null && after == null)) changes[f] = { from: before ?? null, to: after ?? null }
    }
    if (!Object.keys(changes).length) return doc
    const user = req.user as { collection?: string; id?: number; email?: string; name?: string } | null
    await req.payload.create({
      collection: 'audit-logs',
      req,
      overrideAccess: true,
      data: {
        action: operation,
        collectionSlug: collection.slug,
        documentId: String(doc.id),
        documentTitle: String(doc[titleField] ?? doc.id),
        user: user?.collection === 'users' ? user.id : undefined,
        userLabel: user ? (user.name ?? user.email ?? 'unknown') : 'system',
        changes,
      },
    })
    return doc
  }
}
