import type { GlobalConfig } from 'payload'

import { anyone, managers } from '@/access'

export const LoyaltySettings: GlobalConfig = {
  slug: 'loyalty-settings',
  label: 'Yaar Points (Loyalty)',
  admin: { group: 'Marketing' },
  access: { read: anyone, update: managers },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      type: 'row',
      fields: [
        { name: 'pointsPer100', label: 'Points earned per Rs 100', type: 'number', defaultValue: 1, min: 0 },
        { name: 'pointValue', label: 'Value of 1 point (Rs)', type: 'number', defaultValue: 1, min: 0 },
        { name: 'minRedeem', label: 'Minimum points to redeem', type: 'number', defaultValue: 100, min: 0 },
        { name: 'maxRedeemPercent', label: 'Max % of order payable with points', type: 'number', defaultValue: 20, min: 0, max: 100 },
      ],
    },
    {
      name: 'tiers',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'minPoints', type: 'number', required: true },
            { name: 'multiplier', label: 'Earn multiplier', type: 'number', defaultValue: 1 },
          ],
        },
      ],
    },
  ],
}
