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
    <section
      className="relative flex flex-col items-center justify-center text-center p-4 min-h-[70vh] bg-cover bg-center"
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}
    >
      {bgImageUrl && <div className="absolute inset-0 bg-black opacity-50"></div>}
      <div className="relative z-10 max-w-4xl">
        {title && (
          <h2 className={`text-3xl font-bold mb-8 text-white text-pretty ${goblinOne.className}`}>
            {title}
          </h2>
        )}{' '}
        {/* Assuming white text for better contrast with bg/overlay */}
        {content && (
          <RichText
            data={content}
            className="prose lg:prose-xl mx-auto text-white prose-strong:text-yellow-300"
          />
        )}{' '}
        {/* Assuming white text */}
      </div>
    </section>
  )
}

export default ContentBlock
