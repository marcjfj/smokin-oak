import type { CollectionConfig } from 'payload'

export const CateringMenu: CollectionConfig = {
  slug: 'catering-menu',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category', 'order'],
    livePreview: {
      url: '/catering',
    },
  },
  access: {
    read: () => true, // Allow public read access
  },
  hooks: {
    afterChange: [
      async () => {
        // Trigger revalidation for catering-related pages
        const paths = ['/catering']

        // Only revalidate if we have the required environment variables
        if (!process.env.NEXT_PUBLIC_SERVER_URL || !process.env.REVALIDATE_TOKEN) {
          return
        }

        for (const path of paths) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?path=${path}&token=${process.env.REVALIDATE_TOKEN}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
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
      name: 'order',
      label: 'Order',
      type: 'number',
      admin: {
        description: 'Enter a number to define the sort order. Lower numbers appear first.',
        step: 1,
      },
      required: true,
      defaultValue: () => 0,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      required: false,
      admin: {
        description:
          'Enter price in cents (e.g., 1000 for $10.00). Optional if item has sub-items with prices.',
      },
    },
    {
      name: 'subItems',
      label: 'Serving Sizes (e.g., Half Pan, Full Pan, Serves 10-12)',
      type: 'array',
      fields: [
        {
          name: 'name',
          label: 'Serving Size',
          type: 'text',
          required: true,
          admin: {
            description: 'E.g., "Half Pan", "Full Pan", "Serves 10-12", "Serves 20-25"',
          },
        },
        {
          name: 'price',
          label: 'Price',
          type: 'number',
          required: true,
          admin: {
            description: 'Enter price in cents (e.g., 5000 for $50.00)',
          },
        },
      ],
      admin: {
        description:
          'Add different serving sizes or quantities with their respective prices for catering orders.',
      },
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'catering-categories',
      required: true,
      hasMany: false,
    },
    {
      name: 'isPublished',
      label: 'Published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck this box to hide the item from the catering menu.',
      },
    },
    {
      name: 'minimumOrder',
      label: 'Minimum Order',
      type: 'text',
      admin: {
        description: 'Optional minimum order requirements (e.g., "48 hours notice required")',
      },
    },
  ],
}