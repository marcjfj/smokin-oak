import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Media } from '@/payload-types'
import { goblinOne } from '@/lib/fonts'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Utensils, MapPin } from 'lucide-react'

interface Cta {
  label: string
  url: string
  id?: string | null | undefined
  icon?: 'Utensils' | 'MapPin' | '' | null | undefined
}

interface HeroBlockProps {
  title?: string | null | undefined
  content?: SerializedEditorState | null | undefined
  image?: Media | string | number | null | undefined
  imagePosition?: 'left' | 'right'
  ctas?: Cta[] | null | undefined
}

// Helper to get the icon component based on name
const IconComponent = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'Utensils':
      return <Utensils className="size-6 ml-2" />
    case 'MapPin':
      return <MapPin className="size-6 ml-2" />
    default:
      return null
  }
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
    <div className="w-full p-8 md:p-12 md:flex-1">
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
              className={`bg-yellow-400 hover:bg-yellow-500 rounded-lg text-neutral-800 text-xl font-bold py-6 !px-6 transition-all duration-150 ease-in-out`}
            >
              <Link href={cta.url} className="flex items-center" prefetch={true}>
                {cta.label}
                {cta.icon && <IconComponent iconName={cta.icon} />}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )

  const imageSection = imageUrl && (
    <div className="w-full relative min-h-[400px] md:min-h-[600px] md:flex-1">
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
      <div
        className={`container mx-auto flex flex-col items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'}`}
      >
        {contentSection}
        {imageSection}
      </div>
    </section>
  )
}

export default HeroBlock
