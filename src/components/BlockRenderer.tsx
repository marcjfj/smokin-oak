import React from 'react'
import { ContentBlock as ContentBlockPayload, HeroBlock as HeroBlockPayload } from '@/payload-types'
// import { RichText } from '@payloadcms/richtext-lexical/react' // This import is no longer needed here
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import ContentBlock from '../blocks/ContentBlock' // Import the new ContentBlock
import HeroBlock from '../blocks/HeroBlock'

// Define a more specific type for our block
interface BlockType {
  blockType: string
  [key: string]: any // Allows for other properties
}

// Use the imported types if available, otherwise fallback to defined ones
type AppContentBlock = ContentBlockPayload extends infer T
  ? T
  : {
      blockType: 'content'
      title?: string | null | undefined
      content?: SerializedEditorState | null | undefined
      backgroundImage?: any // Add backgroundImage here, consider a more specific type if known
    }

type AppHeroBlock = HeroBlockPayload extends infer T
  ? T
  : {
      blockType: 'hero'
      title?: string | null | undefined
      content?: SerializedEditorState | null | undefined
      image?: any
      imagePosition?: 'left' | 'right' | undefined
    }

// Define a component to render blocks
const BlockRenderer = ({ block }: { block: BlockType }) => {
  switch (block.blockType) {
    case 'content':
      const contentBlock = block as AppContentBlock
      return (
        <ContentBlock
          title={contentBlock.title}
          content={contentBlock.content}
          backgroundImage={contentBlock.backgroundImage}
        />
      )
    case 'hero':
      const heroBlock = block as AppHeroBlock
      return (
        <HeroBlock
          title={heroBlock.title}
          content={heroBlock.content}
          image={heroBlock.image}
          imagePosition={heroBlock.imagePosition || 'right'}
        />
      )
    default:
      return null
  }
}

export default BlockRenderer
export type { BlockType, AppContentBlock, AppHeroBlock }
