import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Event, Media } from '@/payload-types' // Import Media type
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Image from "next/legacy/image" // Import Next.js Image component
import { goblinOne } from '@/lib/fonts' // Import goblinOne

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

interface EventsBlockProps {
  title?: string | null
}

// It's good practice to define a more specific type for populated relations
interface PopulatedEvent extends Omit<Event, 'image'> {
  image?: Media | null // Assuming 'image' in Event is the ID, and it gets populated as Media object
}

const EventsBlock: React.FC<EventsBlockProps> = async ({ title }) => {
  let events: PopulatedEvent[] = []
  let fetchError: string | null = null

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'events',
      limit: 5,
      sort: '-date',
      depth: 1, // Ensure image relation is populated (if image field stores ID)
    })
    events = result.docs as PopulatedEvent[]
  } catch (err) {
    console.error('Error fetching events in EventsBlock:', err)
    fetchError =
      err instanceof Error ? err.message : 'An unknown error occurred while fetching events.'
  }

  if (fetchError) {
    return (
      <div className="events-block py-8">
        {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
        <p className="text-center text-red-500">Error loading events: {fetchError}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {title && (
        <h2
          className={`text-4xl font-bold text-center mb-12 ${goblinOne.className} text-neutral-800 dark:text-neutral-100`}
        >
          {title}
        </h2>
      )}
      {events.length === 0 && (
        <p className="text-center text-neutral-500">No upcoming events found.</p>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {events.map((event) => {
          const imageUrl = event.image?.url ? `${SERVER_URL}${event.image.url}` : null
          return (
            <div
              key={event.id}
              className="border border-neutral-600 rounded-lg shadow-lg bg-neutral-800 dark:bg-neutral-900 overflow-hidden flex flex-col"
            >
              {imageUrl && event.image?.alt && (
                <div className="relative w-full h-48">
                  <Image
                    src={imageUrl}
                    alt={event.image.alt || event.title || 'Event image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h3
                  className={`text-2xl font-semibold mb-4 ${goblinOne.className} text-yellow-500 dark:text-yellow-400`}
                >
                  {event.title}
                </h3>
                {event.date && (
                  <p className="text-sm text-neutral-100 dark:text-neutral-200 mb-1">
                    Date:{' '}
                    {new Date(event.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {event.location && (
                  <p className="text-sm text-neutral-100 dark:text-neutral-200 mb-2">
                    Location: {event.location}
                  </p>
                )}
                <div className="mt-auto">
                  {event.description &&
                  typeof event.description === 'object' &&
                  event.description?.root?.children?.length > 0 ? (
                    <div className="prose prose-sm prose-invert max-w-none text-neutral-100 dark:text-neutral-200 mt-2">
                      <RichText data={event.description as SerializedEditorState} />
                    </div>
                  ) : typeof event.description === 'string' ? (
                    <p className="text-sm text-neutral-100 dark:text-neutral-200 mt-2">
                      {event.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EventsBlock
