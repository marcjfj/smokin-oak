import { CollectionConfig, Block, FieldHook } from 'payload'

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
      blocks: [ContentBlock, HeroBlock],
    },
  ],
}
