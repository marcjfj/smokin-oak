import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '@/payload-types' // Assuming Media type will be available
import { goblinOne } from '@/lib/fonts' // Updated import

// We can import AppContentBlock if it's exported from BlockRenderer or define a specific props type here
// For now, let's define specific props for clarity within this component.
interface ContentBlockProps {
  title?: string | null | undefined
  content?: SerializedEditorState | null | undefined
  backgroundImage?: Media | string | number | null | undefined // Allow for ID (string or number) or Media object
}

const ContentBlock: React.FC<ContentBlockProps> = ({ title, content, backgroundImage }) => {
  const bgImageUrl =
    typeof backgroundImage === 'object' && backgroundImage?.url ? backgroundImage.url : null

  return (
    <section className="relative flex flex-col items-center justify-center text-center p-4 mt-16 min-h-[70vh]">
      <div className="relative z-10 max-w-4xl w-full">
        {title && (
          <h2
            className={`text-3xl font-bold mb-8 text-neutral-q00 dark:text-white text-pretty ${goblinOne.className}`}
          >
            {title}
          </h2>
        )}
        {bgImageUrl && (
          <div className="my-8 flex justify-center">
            <img
              src={bgImageUrl}
              alt={title || 'Content image'}
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '50vh' }} // Constrain image height
            />
          </div>
        )}
        {content && (
          <RichText data={content} className="prose lg:prose-xl mx-auto text-neutral-100" />
        )}
      </div>
    </section>
  )
}

export default ContentBlock
