import { CollectionConfig } from 'payload'

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
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

export default Categories
