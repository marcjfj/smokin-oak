import { CollectionConfig, Block, FieldHook } from 'payload'
import React from 'react'

// Helper function to format a string into a slug
const formatSlug: FieldHook = async ({ value, data }) => {
  if (typeof value === 'string' && value.length > 0) {
    // If slug is manually entered, use it (after basic formatting)
    return value
      .replace(/ /g, '-')
      .replace(/[^ء-ي٠-٩a-zA-Z0-9-]/g, '') // Allow Arabic characters and numbers
      .toLowerCase()
  }
  if (data?.title) {
    // If no slug, generate from title
    return data.title
      .replace(/ /g, '-')
      .replace(/[^ء-ي٠-٩a-zA-Z0-9-]/g, '')
      .toLowerCase()
  }
  return value // Fallback
}

const ContentBlock: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Right',
          value: 'right',
        },
      ],
    },
    {
      name: 'ctas',
      label: 'Call to Actions',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          options: [
            { label: 'None', value: '' },
            { label: 'Utensils', value: 'Utensils' },
            { label: 'Map Pin', value: 'MapPin' },
          ],
        },
      ],
    },
  ],
}

const ContactBlockCMS: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock', // This should match the blockType in BlockRenderer.tsx
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Contact Block Image',
    },
  ], // No configurable fields needed for this block
}

const EventsBlockCMS: Block = {
  slug: 'events', // This will be the blockType
  interfaceName: 'EventsBlock', // For payload-types.ts
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Block Title (e.g., Upcoming Events)',
    },
    // We might add options later, e.g., number of events to show
  ],
}

const ImageBlock: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
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
      name: 'slug',
      label: 'Slug',
      type: 'text',
      index: true, // Good for querying
      unique: true, // Slugs should usually be unique
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug],
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      minRows: 1,
      blocks: [ContentBlock, HeroBlock, ContactBlockCMS, EventsBlockCMS, ImageBlock],
    },
  ],
}
