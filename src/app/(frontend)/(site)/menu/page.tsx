import React from 'react'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
} from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { goblinOne } from '@/lib/fonts'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

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

// Define the structure of a menu item from the 'menu-items' collection
interface MenuItem extends Omit<PayloadMenuItem, 'id' | 'image' | 'category' | 'description'> {
  id: string
  name: string
  price?: number | null
  category: EnrichedCategory
  image?: PopulatedImage | null
  isSoldOut: boolean
  description?: SerializedEditorState | null
  subItems?: Array<{
    id?: string | null
    name: string
    price: number
  }> | null
  order: number
  updatedAt: string
  createdAt: string
}

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menu-items',
      depth: 2,
      limit: 100,
      sort: 'order',
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
        const hasPriceOrSubItems =
          (item.price !== null && typeof item.price === 'number') ||
          (item.subItems && item.subItems.length > 0)

        const isValid = Boolean(
          item &&
            item.name &&
            hasPriceOrSubItems &&
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

export default async function MenuPage() {
  const menuItems = await getMenuItems()

  const groupedMenuItems = menuItems.reduce(
    (acc, item) => {
      const categoryKey = item.category.name || 'Uncategorized'
      if (!acc[categoryKey]) {
        acc[categoryKey] = { items: [], categoryDetails: item.category }
      }
      acc[categoryKey].items.push(item)
      return acc
    },
    {} as Record<string, { items: MenuItem[]; categoryDetails: EnrichedCategory }>,
  )

  for (const categoryKey in groupedMenuItems) {
    if (Object.prototype.hasOwnProperty.call(groupedMenuItems, categoryKey)) {
      groupedMenuItems[categoryKey].items.sort((a, b) => a.order - b.order)
    }
  }

  const sortedCategorizedItems = Object.entries(groupedMenuItems).sort(([, groupA], [, groupB]) => {
    const orderA = groupA.categoryDetails.order ?? Infinity
    const orderB = groupB.categoryDetails.order ?? Infinity
    return orderA - orderB
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className={`text-4xl font-bold text-center mb-12 text-neutral-100 ${goblinOne.className}`}
      >
        Our Menu
      </h1>
      {menuItems.length === 0 ? (
        <p className="text-center text-neutral-300">
          No menu items available at the moment. Please check back later.
        </p>
      ) : (
        <div className="max-w-3xl mx-auto">
          {sortedCategorizedItems.map(([, group]) => (
            <section key={group.categoryDetails.id} className="mb-12">
              <h2 className={`text-3xl font-semibold text-yellow-500 mb-2 ${goblinOne.className}`}>
                {group.categoryDetails.name}
              </h2>
              {group.categoryDetails.description && (
                <p className="text-yellow-500 mb-6 italic">{group.categoryDetails.description}</p>
              )}
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start py-6 border-b border-neutral-700 last:border-b-0"
                >
                  {item.image && item.image.url ? (
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 mr-6 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={`${SERVER_URL}${item.image.url}`}
                        alt={item.image.alt || item.name || 'Menu item'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 25vw, 128px"
                      />
                    </div>
                  ) : (
                    <div className="w-24 sm:w-32 mr-6 flex-shrink-0"></div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline mb-1">
                      {' '}
                      {/* Name and Price Row */}
                      <div className="flex items-baseline">
                        <h3
                          className="text-xl font-semibold text-neutral-100 mr-2"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        {item.isSoldOut && (
                          <span className="text-base text-red-500 font-semibold whitespace-nowrap">
                            Currently Sold Out
                          </span>
                        )}
                      </div>
                      {/* Price Display Logic */}
                      {item.subItems && item.subItems.length > 0 ? (
                        <div className="text-right">
                          {/* Sub-items will be listed below description */}
                        </div>
                      ) : item.price !== null && typeof item.price === 'number' ? (
                        <p className="text-lg text-neutral-200 font-medium ml-4 whitespace-nowrap">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                    {/* Item Description */}
                    {item.description && (
                      <div className="text-sm prose prose-sm prose-invert max-w-none mb-2">
                        <RichText data={item.description} />
                      </div>
                    )}
                    {/* Sub-Items Display */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <div
                            key={subItem.id || subItem.name}
                            className="flex justify-between items-baseline text-sm"
                          >
                            <span className="text-neutral-300">{subItem.name}</span>
                            <span className="text-neutral-200 font-medium whitespace-nowrap">
                              ${(subItem.price / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

// Optional: For dynamic pages or specific revalidation strategies
// export const revalidate = 3600; // Revalidate every hour
