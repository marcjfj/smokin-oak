import React from 'react'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Media, MenuItem as PayloadMenuItem, Category } from '@/payload-types'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

// Define the structure of a populated image (from the 'media' collection)
interface PopulatedImage extends Omit<Media, 'id'> {
  id: string
  url: string
  alt: string
}

// Define the structure of a menu item from the 'menu-items' collection
interface MenuItem extends Omit<PayloadMenuItem, 'id' | 'image' | 'category'> {
  id: string
  name: string
  price: number
  category: string // Category name
  categoryOrder: number // Added for sorting categories
  image?: PopulatedImage | null
}

async function getMenuItems(): Promise<MenuItem[]> {
  console.log('Attempting to fetch menu items...')
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menu-items',
      depth: 1, // This ensures category is populated
      limit: 100,
    })

    console.log('Raw menu items from Payload (result.docs):', JSON.stringify(result.docs, null, 2))

    const processedItems = result.docs
      .map((doc) => {
        const image = doc.image as unknown as PopulatedImage | null | undefined
        let categoryName = 'Uncategorized'
        let categoryOrderValue = Infinity // Default order (last)

        if (doc.category && typeof doc.category === 'object' && 'name' in doc.category) {
          const cat = doc.category as Category // Assert Category type
          categoryName = String(cat.name || 'Uncategorized')
          categoryOrderValue = typeof cat.order === 'number' ? cat.order : Infinity
        } else if (doc.category && typeof doc.category === 'number') {
          console.warn(
            `Menu item ${doc.id} has category ID ${doc.category} but expected populated object. Ordering might be affected.`,
          )
          categoryName = `Category ${doc.category}`
        }

        return {
          ...doc,
          id: String(doc.id),
          name: String(doc.name || ''),
          price: Number(doc.price || 0),
          category: categoryName,
          categoryOrder: categoryOrderValue, // Assign the order
          image: image && image.url && image.alt ? image : null,
        } as unknown as MenuItem
      })
      .filter((item): item is MenuItem => {
        const isValid = Boolean(
          item &&
            item.name &&
            typeof item.price === 'number' &&
            item.category &&
            typeof item.categoryOrder === 'number',
        )
        if (!isValid) {
          console.log(
            'Item filtered out (missing name, price, category, or categoryOrder):',
            JSON.stringify(item, null, 2),
          )
        }
        return isValid
      })

    console.log(
      'Processed and filtered menu items (image optional):',
      JSON.stringify(processedItems, null, 2),
    )
    return processedItems
  } catch (error) {
    console.error('Error in getMenuItems function:', error)
    return []
  }
}

export default async function MenuPage() {
  console.log('MenuPage component rendering...')
  const menuItems = await getMenuItems()
  console.log('Menu items received in MenuPage component:', JSON.stringify(menuItems, null, 2))

  const groupedMenuItems = menuItems.reduce(
    (acc, item) => {
      const categoryKey = item.category || 'Uncategorized'
      if (!acc[categoryKey]) {
        acc[categoryKey] = []
      }
      acc[categoryKey].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )

  // Sort categories based on the categoryOrder of their first item
  const sortedCategorizedItems = Object.entries(groupedMenuItems).sort(([, itemsA], [, itemsB]) => {
    const orderA = itemsA[0]?.categoryOrder ?? Infinity
    const orderB = itemsB[0]?.categoryOrder ?? Infinity
    return orderA - orderB
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-goblin-one font-bold text-center mb-12 text-neutral-100">
        Our Menu
      </h1>
      {menuItems.length === 0 ? (
        <p className="text-center text-neutral-300">
          No menu items available at the moment. Please check back later.
        </p>
      ) : (
        <div className="max-w-3xl mx-auto">
          {sortedCategorizedItems.map(([category, items]) => (
            <section key={category} className="mb-12">
              <h2 className="text-3xl font-goblin-one font-semibold text-yellow-500 mb-6 border-b-2 border-yellow-500 pb-2">
                {category}
              </h2>
              {items.map((item) => (
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
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xl font-semibold text-neutral-100" title={item.name}>
                        {item.name}
                      </h3>
                      {typeof item.price === 'number' && (
                        <p className="text-lg text-neutral-200 font-medium ml-4 whitespace-nowrap">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
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
