import React from 'react'
import Image from 'next/image'
import { goblinOne } from '@/lib/fonts'

interface HeaderBlockProps {
  title: string
  image: {
    url: string
    alt: string
  }
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ title, image }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      {image && image.url && (
        <Image
          src={image.url}
          alt={image.alt || 'Header background'}
          layout="fill"
          objectFit="cover"
          priority
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center',
          width: '90%',
        }}
      >
        <h1 className={`${goblinOne.className} text-5xl md:text-7xl text-neutral-100`}>{title}</h1>
      </div>
    </div>
  )
}

export default HeaderBlock
