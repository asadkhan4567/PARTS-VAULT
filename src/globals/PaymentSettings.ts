import type { Field, GlobalConfig } from 'payload'

import { anyone, fieldOwners, owners } from '@/access'

/** Secret fields are readable only by the Owner — never by the storefront or other staff. */
const secret = (name: string, label: string): Field => ({
  name,
  label,
  type: 'text',
  access: { read: fieldOwners, update: fieldOwners },
})

export const PaymentSettings: GlobalConfig = {
  slug: 'payment-settings',
  label: 'Payment Settings',
  admin: { group: 'Settings', description: 'Turn payment methods on/off. Only the Owner can change these.' },
  access: { read: anyone, update: owners },
  fields: [
    {
      name: 'cod',
      label: 'Cash on Delivery',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'instructions', type: 'textarea', defaultValue: 'Pay the rider in cash when your parts arrive.' },
      ],
    },
    {
      name: 'bankTransfer',
      label: 'Bank Transfer',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'details',
          label: 'Bank details shown to the customer',
          type: 'textarea',
          defaultValue: 'Bank: Meezan Bank\nAccount title: Partsyaar\nIBAN: PK00 MEZN 0000 0000 0000 0000',
        },
      ],
    },
    {
      name: 'jazzcash',
      label: 'JazzCash',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'sandbox', type: 'checkbox', defaultValue: true },
        secret('merchantId', 'Merchant ID'),
        secret('password', 'Password'),
        secret('integritySalt', 'Integrity salt'),
      ],
    },
    {
      name: 'easypaisa',
      label: 'Easypaisa',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'sandbox', type: 'checkbox', defaultValue: true },
        secret('storeId', 'Store ID'),
        secret('hashKey', 'Hash key'),
      ],
    },
    {
      name: 'card',
      label: 'Card payments',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        {
          name: 'provider',
          type: 'select',
          defaultValue: 'safepay',
          options: [
            { label: 'Safepay', value: 'safepay' },
            { label: 'PayFast', value: 'payfast' },
          ],
        },
        { name: 'sandbox', type: 'checkbox', defaultValue: true },
        secret('publicKey', 'Public / merchant key'),
        secret('secretKey', 'Secret key'),
        secret('webhookSecret', 'Webhook secret'),
      ],
    },
  ],
}
