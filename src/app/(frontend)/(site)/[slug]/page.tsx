import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation' // Import notFound
import type { Metadata, ResolvingMetadata } from 'next'

import config from '@/payload.config'
import { Page, ContentBlock as ContentBlockPayload } from '@/payload-types' // Correctly import ContentBlock
import BlockRenderer, { AppContentBlock } from '@/components/BlockRenderer' // Import the new component and type

// Define props type to include params with slug
type SlugPageProps = {
  params: {
    // Updated: params is an object, not a Promise here
    slug: string
  }
}

// Define props for generateMetadata
type Props = {
  params: Promise<{ slug: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const pageResult = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 1, // Depth 1 should be enough for the title
  })

  const page = pageResult.docs[0] as Page | undefined

  if (!page || !page.title) {
    // Optionally, return a default title or let it fall back to layout metadata
    // For now, if no page or title, Next.js will use layout.tsx title
    // You could also do: return { title: 'Page Not Found' } or similar
    return {} // Return empty to fall back to parent (layout) metadata
  }

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: page.title + " | Smokin' Oak BBQ", // Use the title from the fetched page
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg', ...previousImages],
    // },
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  // Updated function signature
  const { slug } = params // Destructure slug from params (no await needed here)
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
