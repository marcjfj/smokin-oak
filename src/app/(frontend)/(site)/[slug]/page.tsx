import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation' // Import notFound

import config from '@/payload.config'
import { Page, ContentBlock as ContentBlockPayload } from '@/payload-types' // Correctly import ContentBlock
import BlockRenderer, { AppContentBlock } from '@/components/BlockRenderer' // Import the new component and type

// Define props type to include params with slug
type SlugPageProps = {
  params: {
    slug: string
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  // Updated function signature
  const { slug } = await params // Destructure slug from params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  // const { user } = await payload.auth({ headers }) // User auth might not be needed for all slug pages, or handle as per requirements

  const pageResult = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug, // Use the dynamic slug here
      },
    },
    limit: 1,
    depth: 3,
  })

  const page = pageResult.docs[0] as Page | undefined

  if (!page) {
    // If page is not found, trigger a 404
    return notFound()
  }

  if (!page.layout || page.layout.length === 0) {
    // Optionally, handle pages found but with no layout differently
    // For now, treating as "not found" or rendering a specific message
    return (
      <div className="container mx-auto py-10">
        <p>This page has no content assigned.</p>
      </div>
    )
  }

  const layoutBlocks = page.layout as AppContentBlock[]

  return (
    <div className="page-container">
      {' '}
      {/* Changed class name for potential specific styling */}
      {layoutBlocks.map((block: AppContentBlock, index: number) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </div>
  )
}

// Optional: Add generateStaticParams if you want to pre-render pages at build time
// export async function generateStaticParams() {
//   const payloadConfig = await config;
//   const payload = await getPayload({ config: payloadConfig });
//   const pages = await payload.find({
//     collection: 'pages',
//     limit: 100, // Adjust as needed
//   });
//   return pages.docs.map((page) => ({
//     slug: page.slug,
//   }));
// }
