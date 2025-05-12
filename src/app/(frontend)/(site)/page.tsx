import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import { Page, ContentBlock as ContentBlockPayload } from '@/payload-types' // Correctly import ContentBlock
import BlockRenderer, { AppContentBlock } from '@/components/BlockRenderer' // Import the new component and type

// Define a more specific type for our block
// interface BlockType {                           <-- REMOVE
//   blockType: string
//   [key: string]: any // Allows for other properties
// }

// Use the imported ContentBlockPayload type if available, otherwise fallback to a defined one
// This provides a bridge until payload-types.ts is fully synced.
// type AppContentBlock = ContentBlockPayload extends infer T
//   ? T
//   : {
//       blockType: 'content'
//       title?: string
//       content?: any // RichText content can be complex
//     }

// Define a component to render blocks
// const BlockRenderer = ({ block }: { block: BlockType }) => {  <-- REMOVE
//   if (block.blockType === 'content') {
//     const contentBlock = block as AppContentBlock // Use the AppContentBlock type
//     return (
//       <section className="py-16">
//         {contentBlock.title && (
//           <h2 className="text-3xl font-bold text-center mb-8">{contentBlock.title}</h2>
//         )}
//         {/* Ensure content is treated as string for dangerouslySetInnerHTML */}
//         {contentBlock.content && (
//           <div
//             className="prose lg:prose-xl mx-auto"
//             dangerouslySetInnerHTML={{ __html: JSON.stringify(contentBlock.content) }}
//           />
//         )}
//       </section>
//     )
//   }
//   return null
// }

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

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

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

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

      {/* The existing Hero section might become a block type itself,
          or its content could be driven by a specific block. 
          For now, I'll comment it out as its content source is unclear
          in the new block-based system. We can integrate it as a block later. */}
      {/* 
      <section
        className="relative bg-cover bg-center h-[calc(100vh-100px)] text-white"
        style={{ backgroundImage: "url('/meats.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Authentic Smoked BBQ</h1>
          <p className="text-xl md:text-2xl mb-8">Taste the tradition, feel the flavor.</p>
          <div>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-neutral-800 font-bold py-3 px-6 rounded-lg text-lg mr-4">
              View Menu
            </button>
            <button className="bg-transparent hover:bg-yellow-500 border-2 border-yellow-500 text-white hover:text-neutral-800 font-bold py-3 px-6 rounded-lg text-lg">
              Order Online
            </button>
          </div>
        </div>
      </section>
      */}
    </div>
  )
}
