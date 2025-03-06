import { buildConfig } from 'payload/config'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'

// Import collections from the new feature directory
import { Posts } from '@/features/cms/collections/Posts'
import { Users } from '@/features/cms/collections/Users'
import { Media } from '@/features/cms/collections/Media'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  collections: [Posts, Users, Media],
  routes: {
    admin: '/admin',
  },
  admin: {
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- Payload CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  typescript: {
    outputFile: path.resolve(__dirname, '../types/payload-types.ts'),
  },
})
