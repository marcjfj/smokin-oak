import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type {
  Media,
  Category as PayloadCategory,
} from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import OnePageMenu, { type MenuItem } from './OnePageMenu'

export interface ContactInfoAddress {
  street?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

export interface ContactInfoType {
  id?: string | number
  email?: string | null
  phone?: string | null
  address?: ContactInfoAddress | null
  updatedAt?: string | null
  createdAt?: string | null
  globalType?: string
}

export interface BusinessHourScheduleItem {
  id?: string | null
  day: string
  timeRange: string
}

export interface HoursType {
  id?: string | number
  schedule?: BusinessHourScheduleItem[] | null
  updatedAt?: string | null
  createdAt?: string | null
  globalType?: string
}

interface PopulatedImage extends Omit<Media, 'id'> {
  id: string
  url: string
  alt: string
}

interface EnrichedCategory {
  id: string
  name: string
  description?: string | null
  order: number
}

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
                id: sub.id || undefined,
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
          order: typeof doc.order === 'number' ? doc.order : Infinity,
          updatedAt: String(doc.updatedAt),
          createdAt: String(doc.createdAt),
        }
        return item
      })
      .filter((item): item is MenuItem => {
        return Boolean(
          item &&
            item.name &&
            item.category &&
            item.category.name &&
            typeof item.category.order === 'number' &&
            typeof item.order === 'number',
        )
      })

    return processedItems
  } catch (error) {
    console.error('Error in getMenuItems function (one-page-menu):', error)
    return []
  }
}

export default async function OnePageMenuPage() {
  const menuItems = await getMenuItems()
  const payload = await getPayload({ config })

  let contactInfo: ContactInfoType | null = null
  try {
    contactInfo = (await payload.findGlobal({
      slug: 'contact-info',
    })) as ContactInfoType
  } catch (error) {
    console.error('Error fetching contact info for one-page menu:', error)
  }

  return (
    <OnePageMenu
      initialMenuItems={menuItems}
      contactInfo={contactInfo}
    />
  )
}

export const revalidate = 0
