import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
} from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import InteractiveDigitalMenu, { MenuItem } from './InteractiveDigitalMenu' // Import the new client component and MenuItem type

// const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '' // No longer needed here

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

// MenuItem interface is now imported from InteractiveDigitalMenu.tsx, so it can be removed from here if not used elsewhere in this file directly.
// However, getMenuItems still produces it, so it's fine to keep or rely on the imported one.

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menu-items',
      depth: 2,
      limit: 100,
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
          currentCategory.id = String(doc.category)
          currentCategory.name = `Category ${doc.category}`
        }

        const itemDescription = doc.description as unknown as
          | SerializedEditorState
          | null
          | undefined

        const subItemsProcessed =
          Array.isArray(doc.subItems) && doc.subItems.length > 0
            ? doc.subItems.map((sub) => ({
                id: sub.id || null,
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
          order: doc.order as number,
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
    console.error('Error in getMenuItems function:', error)
    return []
  }
}

// Remove LOCAL_STORAGE_KEY as it's managed by the client component
// Remove DigitalMenuPageWrapper as DndProvider is now in the client component

export default async function DigitalMenuPage() {
  const menuItems = await getMenuItems()

  // The main page component now just fetches data and passes it to the client component.
  // All rendering logic, D&D, and state management are in InteractiveDigitalMenu.
  return <InteractiveDigitalMenu initialMenuItems={menuItems} />
}

// Disable caching to ensure unpublished items are filtered properly
export const revalidate = 0
