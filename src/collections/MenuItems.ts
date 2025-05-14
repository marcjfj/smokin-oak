import type { CollectionConfig } from 'payload'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category'],
  },
  access: {
    read: () => true, // Allow public read access
  },
  fields: [
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
      required: true,
      admin: {
        description: 'Enter price in cents (e.g., 1000 for $10.00)',
      },
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media', // Relates to your existing Media collection
      required: false,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'categories', // Link to the Categories collection
      required: true,
      hasMany: false, // A menu item belongs to one category
      admin: {
        // isClearable is not directly applicable here in the same way as select
        // For relationship fields, the UI inherently allows clearing or changing the selection.
      },
    },
    // You could add more fields here, like dietary restrictions (tags), calories, etc.
  ],
}
