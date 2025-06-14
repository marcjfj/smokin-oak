import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        // Trigger revalidation for all pages that might use media
        const paths = [
          '/',
          '/menu',
          '/print-menu',
          '/digital-menu',
          '/events',
          '/about',
          '/contact',
        ]
        for (const path of paths) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?path=${path}&token=${process.env.REVALIDATE_TOKEN}`,
              {
                method: 'POST',
              },
            )
          } catch (error) {
            console.error(`Error revalidating ${path}:`, error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
