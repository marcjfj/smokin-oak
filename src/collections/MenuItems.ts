import type { CollectionConfig } from 'payload'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category', 'order'],
  },
  access: {
    read: () => true, // Allow public read access
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
      defaultValue: () => 0, // Default to 0, or consider making it dynamic
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
      label: 'Sub-Items (e.g., sizes, variations)',
      type: 'array',
      fields: [
        {
          name: 'name',
          label: 'Sub-Item Name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          label: 'Sub-Item Price',
          type: 'number',
          required: true,
          admin: {
            description: 'Enter price in cents (e.g., 1200 for $12.00)',
          },
        },
      ],
      admin: {
        description:
          'Add sub-items if this menu item comes in different sizes or variations with different prices (e.g., Half Rack, Full Rack).',
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
    {
      name: 'isSoldOut',
      label: 'Sold Out',
      type: 'checkbox', // Using checkbox for boolean true/false
      defaultValue: false,
      admin: {
        description: 'Check this box if the item is currently sold out.',
      },
    },
    // You could add more fields here, like dietary restrictions (tags), calories, etc.
  ],
}
