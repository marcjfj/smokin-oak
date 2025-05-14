import { CollectionConfig, CollectionSlug } from 'payload'

const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'soldOut'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories' as CollectionSlug,
      required: true,
      hasMany: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'soldOut',
      type: 'checkbox',
      label: 'Sold Out',
      defaultValue: false,
    },
  ],
}

export default MenuItems
