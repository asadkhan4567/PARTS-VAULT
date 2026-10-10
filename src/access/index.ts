import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Roles
 * - owner:   everything, incl. payment keys, staff accounts, cost prices
 * - manager: catalogue, prices, costs, orders, content, settings (not payment keys / staff)
 * - staff:   stock, orders, part requests, reviews, content; read-only prices, no cost price
 * Customers (shoppers) live in the `customers` collection and never reach the admin.
 */
export type StaffRole = 'owner' | 'manager' | 'staff'

type ReqLike = Pick<PayloadRequest, 'user'>

export function staffRole(req: ReqLike): StaffRole | null {
  const user = req.user as { collection?: string; role?: StaffRole } | null
  if (!user || user.collection !== 'users') return null
  return user.role ?? 'staff'
}

export const isStaffReq = (req: ReqLike): boolean => staffRole(req) !== null
export const isManagerReq = (req: ReqLike): boolean => {
  const r = staffRole(req)
  return r === 'owner' || r === 'manager'
}
export const isOwnerReq = (req: ReqLike): boolean => staffRole(req) === 'owner'

export const anyone: Access = () => true
export const staff: Access = ({ req }) => isStaffReq(req)
export const managers: Access = ({ req }) => isManagerReq(req)
export const owners: Access = ({ req }) => isOwnerReq(req)

/** Staff see drafts; the public sees published documents only. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaffReq(req)) return true
  return { _status: { equals: 'published' } } satisfies Where
}

/** Staff see everything; a customer sees only their own documents (via `customer` field). */
export const staffOrOwnCustomer =
  (field = 'customer'): Access =>
  ({ req }) => {
    if (isStaffReq(req)) return true
    const user = req.user as { collection?: string; id?: number | string } | null
    if (user?.collection === 'customers' && user.id != null) {
      return { [field]: { equals: user.id } } satisfies Where
    }
    return false
  }

export const fieldManagers: FieldAccess = ({ req }) => isManagerReq(req)
export const fieldOwners: FieldAccess = ({ req }) => isOwnerReq(req)
export const fieldStaff: FieldAccess = ({ req }) => isStaffReq(req)

/** Workshop (B2B) prices: staff and approved workshop customers only. */
export const fieldStaffOrWorkshop: FieldAccess = ({ req }) => {
  if (isStaffReq(req)) return true
  const user = req.user as { collection?: string; type?: string } | null
  return user?.collection === 'customers' && user.type === 'workshop'
}
