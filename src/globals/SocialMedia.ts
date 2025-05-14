import { GlobalConfig } from 'payload'

export const SocialMedia: GlobalConfig = {
  slug: 'social-media',
  label: 'Social Media Links',
  fields: [
    {
      name: 'links',
      label: 'Social Media Links',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'platform',
          label: 'Platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
