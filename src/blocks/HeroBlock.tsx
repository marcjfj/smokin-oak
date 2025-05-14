import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '@/payload-types'
import { goblinOne } from '@/lib/fonts'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Cta {
  label: string
  url: string
  id?: string | null | undefined
}

interface HeroBlockProps {
  title?: string | null | undefined
  content?: SerializedEditorState | null | undefined
  image?: Media | string | number | null | undefined
  imagePosition?: 'left' | 'right'
  ctas?: Cta[] | null | undefined
}

const HeroBlock: React.FC<HeroBlockProps> = ({
  title,
  content,
  image,
  imagePosition = 'right',
  ctas,
}) => {
  const imageUrl = typeof image === 'object' && image?.url ? image.url : null

  const contentSection = (
    <div className="flex-1 p-8 md:p-12">
      {title && (
        <h2
          className={`text-2xl md:text-4xl font-bold mb-6 text-neutral-100 text-pretty md:text-balance ${goblinOne.className}`}
        >
          {title}
        </h2>
      )}
      {content && (
        <RichText
          data={content}
          className="prose lg:prose-xl text-neutral-200 prose-strong:text-yellow-400"
        />
      )}
      {ctas && ctas.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-4">
          {ctas.map((cta) => (
            <Button
              key={cta.id || cta.label}
              asChild
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-neutral-800 hover:from-yellow-500 hover:to-yellow-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
            >
              <Link href={cta.url} className="flex items-center" prefetch={true}>
                {cta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )

  const imageSection = imageUrl && (
    <div className="flex-1 relative min-h-[400px] md:min-h-[600px]">
      <Image
        src={imageUrl}
        alt={title || 'Hero image'}
        fill
        className="object-contain drop-shadow-md"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    </div>
  )

  return (
    <section className=" bg-neutral-800">
      <div className="container mx-auto md:flex md:flex-row items-center">
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
      </div>
    </section>
  )
}

export default HeroBlock
