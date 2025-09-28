import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { Page } from '@/payload-types'
import BlockRenderer, { AppContentBlock } from '@/components/BlockRenderer' // Import the new component and type

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const pageResult = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'home',
      },
    },
    limit: 1,
    depth: 3,
  })

  const page = pageResult.docs[0] as Page | undefined

  if (!page || !page.layout || page.layout.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <p>Home page not found or no content assigned.</p>
      </div>
    )
  }

  const layoutBlocks = page.layout as AppContentBlock[]

  return (
    <div className="home">
      {layoutBlocks.map((block: AppContentBlock, index: number) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </div>
  )
}
