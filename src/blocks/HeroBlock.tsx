import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '@/payload-types'
import { goblinOne } from '@/lib/fonts'
import Image from 'next/image'

interface HeroBlockProps {
  title?: string | null | undefined
  content?: SerializedEditorState | null | undefined
  image?: Media | string | number | null | undefined
  imagePosition?: 'left' | 'right'
}

const HeroBlock: React.FC<HeroBlockProps> = ({
  title,
  content,
  image,
  imagePosition = 'right',
}) => {
  const imageUrl = typeof image === 'object' && image?.url ? image.url : null

  const contentSection = (
    <div className="flex-1 p-8 md:p-12">
      {title && (
        <h2
          className={`text-2xl md:text-4xl font-bold mb-6 text-neutral-800 text-pretty md:text-balance ${goblinOne.className}`}
        >
          {title}
        </h2>
      )}
      {content && (
        <RichText
          data={content}
          className="prose lg:prose-xl text-neutral-600 prose-strong:text-yellow-600"
        />
      )}
    </div>
  )

  const imageSection = imageUrl && (
    <div className="flex-1 relative min-h-[400px] md:min-h-[600px]">
      <Image
        src={imageUrl}
        alt={title || 'Hero image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    </div>
  )

  return (
    <section className="md:flex md:flex-row items-center bg-neutral-200">
      {imagePosition === 'left' ? (
        <>
          {imageSection}
          {contentSection}
        </>
      ) : (
        <>
          {contentSection}
          {imageSection}
        </>
      )}
    </section>
  )
}

export default HeroBlock
