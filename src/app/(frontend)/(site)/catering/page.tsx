import { getPayload } from 'payload'
import config from '@payload-config'
import type { CateringMenu as CateringMenuItem, CateringCategory } from '@/payload-types'
import { Metadata } from 'next'
import { goblinOne } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Catering Menu | Smokin Oak',
  description: 'View our catering menu with options for all your events and gatherings.',
}

export default async function CateringPage() {
  const payload = await getPayload({ config })

  // Fetch all catering menu items and categories
  const { docs: menuItems } = await payload.find({
    collection: 'catering-menu',
    where: {
      isPublished: {
        equals: true,
      },
    },
    depth: 2,
    limit: 100,
    sort: 'order',
  })

  const { docs: categories } = await payload.find({
    collection: 'catering-categories',
    limit: 50,
    sort: 'order',
  })

  // Group menu items by category
  const menuByCategory = categories.reduce(
    (acc, category) => {
      const items = menuItems.filter((item) => {
        const itemCategory = typeof item.category === 'object' ? item.category : null
        return itemCategory?.id === category.id
      })
      if (items.length > 0) {
        acc[category.id] = {
          category,
          items,
        }
      }
      return acc
    },
    {} as Record<string, { category: CateringCategory; items: CateringMenuItem[] }>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className={`text-4xl font-bold text-center mb-12 mt-8 text-neutral-100 ${goblinOne.className}`}
      >
        Catering Menu
      </h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-neutral-300 text-center mb-12">
          Let us cater your next event! We provide full service catering for all your needs.
        </p>

        <div className="space-y-12">
          {Object.values(menuByCategory).map(({ category, items }) => (
            <section key={category.id} className="mb-12">
              <h2 className={`text-3xl font-semibold text-yellow-500 mb-2 ${goblinOne.className}`}>
                {category.name}
              </h2>
              {category.description && (
                <p className="text-yellow-500 mb-6 italic">{category.description}</p>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start py-6 border-b border-neutral-700 last:border-b-0"
                >
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xl font-semibold text-neutral-100 mr-2" title={item.name}>
                        {item.name}
                      </h3>
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
                    {typeof item.description === 'string' && (
                      <div className="text-sm text-neutral-300 mb-2">
                        <p>{item.description}</p>
                      </div>
                    )}
                    {/* Minimum Order */}
                    {item.minimumOrder && (
                      <p className="text-sm text-neutral-400 italic mb-2">{item.minimumOrder}</p>
                    )}
                    {/* Sub-Items Display */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.subItems.map((subItem, index) => (
                          <div key={index} className="flex justify-between items-baseline text-sm">
                            <span className="text-neutral-300 font-bold">{subItem.name}</span>
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

        {Object.keys(menuByCategory).length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-300 text-lg">
              No catering items available at this time. Please check back later.
            </p>
          </div>
        )}

        <div className="mt-12 p-6 border border-neutral-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-neutral-100">How to Order</h3>
          <p className="text-neutral-300">
            To place a catering order, please call us at least 48 hours in advance. For large orders
            or special requests, we recommend contacting us even earlier to ensure availability.
          </p>
        </div>
      </div>
    </div>
  )
}
