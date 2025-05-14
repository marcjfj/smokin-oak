import { GlobalConfig } from 'payload'

export const Hours: GlobalConfig = {
  slug: 'business-hours',
  label: 'Business Hours',
  fields: [
    {
      name: 'schedule',
      label: 'Weekly Schedule',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'day',
          label: 'Day of the Week',
          type: 'select',
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
          required: true,
        },
        {
          name: 'timeRange',
          label: 'Time Range',
          type: 'text',
          admin: {
            description: 'e.g., 9:00 AM - 5:00 PM or Closed',
          },
          required: true,
        },
      ],
    },
  ],
}
