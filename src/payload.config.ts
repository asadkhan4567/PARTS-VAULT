import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AuditLogs } from './collections/AuditLogs'
import { Banners } from './collections/Banners'
import { BlogPosts } from './collections/BlogPosts'
import { Categories } from './collections/Categories'
import { Coupons } from './collections/Coupons'
import { Customers } from './collections/Customers'
import { Makes } from './collections/Makes'
import { Media } from './collections/Media'
import { Models } from './collections/Models'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { PartBrands } from './collections/PartBrands'
import { PartRequests } from './collections/PartRequests'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { StockAlerts } from './collections/StockAlerts'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { AnnouncementBar } from './globals/AnnouncementBar'
import { DeliverySettings } from './globals/DeliverySettings'
import { Homepage } from './globals/Homepage'
import { LoyaltySettings } from './globals/LoyaltySettings'
import { Navigation } from './globals/Navigation'
import { PaymentSettings } from './globals/PaymentSettings'
import { Popups } from './globals/Popups'
import { SeoDefaults } from './globals/SeoDefaults'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Media goes to S3-compatible storage (Cloudflare R2 / AWS S3) when a bucket is configured;
// otherwise Payload keeps uploads on local disk (fine for development).
const s3Enabled = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Partsyaar Admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/AdminLogo',
        Icon: '@/components/admin/AdminIcon',
      },
      beforeDashboard: ['@/components/admin/Welcome'],
    },
  },
  collections: [
    Orders,
    Customers,
    PartRequests,
    Products,
    Categories,
    Makes,
    Models,
    PartBrands,
    Banners,
    Coupons,
    Reviews,
    Subscribers,
    StockAlerts,
    Pages,
    BlogPosts,
    Media,
    Users,
    AuditLogs,
  ],
  globals: [
    SiteSettings,
    DeliverySettings,
    PaymentSettings,
    Navigation,
    SeoDefaults,
    Homepage,
    AnnouncementBar,
    Popups,
    LoyaltySettings,
  ],
  editor: lexicalEditor(),
  // Without RESEND_API_KEY, Payload prints emails to the server log instead of sending them.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'orders@partsyaar.com',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Partsyaar.com',
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['products', 'pages', 'blog-posts'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => `${(doc as { title?: string })?.title ?? ''} | Partsyaar.com`,
    }),
    s3Storage({
      enabled: s3Enabled,
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT || undefined,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: Boolean(process.env.S3_ENDPOINT),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
