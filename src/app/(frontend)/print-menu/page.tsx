import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
  // Add types for globals if they are defined in payload-types
  // Otherwise, define them here or import from a shared types file
} from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
// import { goblinOne } from '@/lib/fonts' // No longer directly used here, moved to InteractivePrintMenu
// import PrintButton from './PrintButton' // Removed import
import InteractivePrintMenu, { type MenuItem } from './InteractivePrintMenu'

// Define structures for global data based on layout.tsx usage
interface ContactInfoAddress {
  street?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

export interface ContactInfoType {
  // Export if used by InteractivePrintMenu directly
  id?: string | number // Allow number from payload default id
  email?: string | null
  phone?: string | null
  address?: ContactInfoAddress | null
  updatedAt?: string | null
  createdAt?: string | null
  globalType?: string
}

export interface BusinessHourScheduleItem {
  // Export if used by InteractivePrintMenu directly
  id?: string | null // block ids are typically strings if defined in fields
  day: string
  timeRange: string
}

export interface HoursType {
  // Export if used by InteractivePrintMenu directly
  id?: string | number // Allow number from payload default id
  schedule?: BusinessHourScheduleItem[] | null
  updatedAt?: string | null
  createdAt?: string | null
  globalType?: string
}

// const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '' // No longer needed here if images are handled by client or not shown

// Define the structure of a populated image (from the 'media' collection)
interface PopulatedImage extends Omit<Media, 'id'> {
  id: string
  url: string
  alt: string
}

// Define the structure of a category from the 'categories' collection
interface EnrichedCategory {
  id: string
  name: string
  description?: string | null
  order: number
}

// MenuItem interface is now imported from InteractivePrintMenu.tsx,
// but getMenuItems still produces it. Ensure consistency.

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menu-items',
      depth: 2,
      limit: 200,
      sort: 'order',
      where: {
        isPublished: {
          equals: true,
        },
      },
    })

    const processedItems = result.docs
      .map((doc) => {
        const image = doc.image as unknown as PopulatedImage | null | undefined

        let currentCategory: EnrichedCategory = {
          id: 'uncategorized',
          name: 'Uncategorized',
          order: Infinity,
          description: null,
        }

        if (doc.category && typeof doc.category === 'object') {
          const cat = doc.category as PayloadCategory
          currentCategory = {
            id: String(cat.id),
            name: String(cat.name || 'Uncategorized'),
            order: typeof cat.order === 'number' ? cat.order : Infinity,
            description: cat.description || null,
          }
        } else if (doc.category && typeof doc.category === 'number') {
          // This case might need to ensure category details are fully populated
          // For now, assuming name will be derived or it's less critical if only ID is used by InteractivePrintMenu
          currentCategory.id = String(doc.category)
          currentCategory.name = `Category ${doc.category}` // Fallback name
        }

        const itemDescription = doc.description as unknown as
          | SerializedEditorState
          | null
          | undefined

        const subItemsProcessed =
          Array.isArray(doc.subItems) && doc.subItems.length > 0
            ? doc.subItems.map((sub) => ({
                id: sub.id || undefined, // Ensure id can be undefined if null
                name: String(sub.name || ''),
                price: Number(sub.price || 0),
              }))
            : null

        const item: MenuItem = {
          id: String(doc.id),
          name: String(doc.name || ''),
          price: doc.price === null || doc.price === undefined ? null : Number(doc.price),
          category: currentCategory,
          image: image && image.url && image.alt ? image : null,
          isSoldOut: Boolean(doc.isSoldOut ?? false),
          description: itemDescription,
          subItems: subItemsProcessed,
          order: typeof doc.order === 'number' ? doc.order : Infinity, // Ensure order is a number
          updatedAt: String(doc.updatedAt),
          createdAt: String(doc.createdAt),
        }
        return item
      })
      .filter((item): item is MenuItem => {
        const isValid = Boolean(
          item &&
            item.name &&
            item.category &&
            item.category.name &&
            typeof item.category.order === 'number' &&
            typeof item.order === 'number',
        )
        return isValid
      })

    return processedItems
  } catch (error) {
    console.error('Error in getMenuItems function (print-menu):', error)
    return []
  }
}

export default async function PrintMenuPage() {
  const menuItems = await getMenuItems()
  const payload = await getPayload({ config })

  let contactInfo: ContactInfoType | null = null
  try {
    contactInfo = (await payload.findGlobal({
      slug: 'contact-info',
    })) as ContactInfoType // Cast to defined type
  } catch (error) {
    console.error('Error fetching contact info for print menu:', error)
  }

  let businessHours: HoursType | null = null
  try {
    businessHours = (await payload.findGlobal({
      slug: 'business-hours',
    })) as HoursType // Cast to defined type
  } catch (error) {
    console.error('Error fetching business hours for print menu:', error)
  }

  return (
    <>
      {/* <PrintButton /> Removed old print button */}
      {/* The main page component now just fetches data and passes it to the client component.
          All rendering, D&D, and state management are in InteractivePrintMenu. */}
      <InteractivePrintMenu
        initialMenuItems={menuItems}
        contactInfo={contactInfo}
        businessHours={businessHours}
      />
    </>
  )
}

// Optional: For dynamic pages or specific revalidation strategies
// export const revalidate = 3600; // Revalidate every hour
// Remove old printStyles and renderRichTextForPrint function as they are no longer needed.
// The old rendering logic (JSX directly in this component) is also removed.
