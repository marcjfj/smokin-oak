import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'image',
      label: 'Event Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}

export default Events
