import { CollectionConfig } from 'payload'

const CateringCategories: CollectionConfig = {
  slug: 'catering-categories',
  admin: {
    useAsTitle: 'name',
    description: 'Categories for the catering menu',
    livePreview: {
      url: '/catering',
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        // Trigger revalidation for catering-related pages
        const paths = ['/catering']
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Used to control the display order of categories',
      },
    },
  ],
}

export default CateringCategories