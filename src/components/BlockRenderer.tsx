import React from 'react'
import { ContentBlock as ContentBlockPayload, HeroBlock as HeroBlockPayload } from '@/payload-types'
// import { RichText } from '@payloadcms/richtext-lexical/react' // This import is no longer needed here
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import ContentBlock from '../blocks/ContentBlock' // Import the new ContentBlock
import HeroBlock from '../blocks/HeroBlock'
import ContactBlock from '../blocks/ContactBlock' // Import the new ContactBlock

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
      ctas?: Array<{ label: string; url: string; id?: string | null }> | null | undefined
    }

// Assume ContactBlockPayload will be available in payload-types after generation
// If not, you might need to define a fallback type similar to AppContentBlock and AppHeroBlock
interface AppContactBlock {
  blockType: 'contact'
  // Add any specific props for ContactBlock if it had any, currently it does not take props directly other than what BlockType implies
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
          ctas={heroBlock.ctas}
        />
      )
    case 'contact':
      // No specific props to pass to ContactBlock as it fetches its own data
      return <ContactBlock />
    default:
      return null
  }
}

export default BlockRenderer
export type { BlockType, AppContentBlock, AppHeroBlock, AppContactBlock }
