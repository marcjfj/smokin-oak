import React from 'react'
import { ContentBlock as ContentBlockPayload } from '@/payload-types' // Correctly import ContentBlock
// import { RichText } from '@payloadcms/richtext-lexical/react' // This import is no longer needed here
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import ContentBlock from '../blocks/ContentBlock' // Import the new ContentBlock

// Define a more specific type for our block
interface BlockType {
  blockType: string
  [key: string]: any // Allows for other properties
}

// Use the imported ContentBlockPayload type if available, otherwise fallback to a defined one
// This provides a bridge until payload-types.ts is fully synced.
type AppContentBlock = ContentBlockPayload extends infer T
  ? T
  : {
      blockType: 'content'
      title?: string | null | undefined
      content?: SerializedEditorState | null | undefined
      backgroundImage?: any // Add backgroundImage here, consider a more specific type if known
    }

// Define a component to render blocks
const BlockRenderer = ({ block }: { block: BlockType }) => {
  if (block.blockType === 'content') {
    const contentBlock = block as AppContentBlock // Use the AppContentBlock type
    return (
      <ContentBlock
        title={contentBlock.title}
        content={contentBlock.content}
        backgroundImage={contentBlock.backgroundImage}
      />
    )
  }
  return null
}

export default BlockRenderer
export type { BlockType, AppContentBlock }
