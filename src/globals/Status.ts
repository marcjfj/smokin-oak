import type { GlobalConfig } from 'payload'

export const Status: GlobalConfig = {
  slug: 'status',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'currentStatus',
      label: 'Current Status',
      type: 'select',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Sold Out', value: 'sold-out' },
        { label: 'Closed (unscheduled)', value: 'closed-unscheduled' },
      ],
      defaultValue: 'open',
      required: true,
    },
  ],
}
