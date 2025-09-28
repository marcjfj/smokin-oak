import React from 'react'
import { Media } from '@/payload-types' // Assuming Media type is available
import Image from "next/legacy/image"

interface ImageBlockProps {
  image: Media | string // Allow for ID or full Media object
}

const ImageBlock: React.FC<ImageBlockProps> = ({ image }) => {
  // If image is just an ID (string), you might need to fetch the full image data.
  // For simplicity, this example assumes 'image' is a Media object or can be directly used.
  // You may need to adjust based on how 'Media' is structured and how URLs are accessed.

  const imageUrl = typeof image === 'string' ? image : image?.url
  const altText = typeof image === 'string' ? 'Uploaded image' : image?.alt || 'Full-width image'

  if (!imageUrl) {
    return <p>Image not available.</p>
  }

  return (
    <div className="container mx-auto">
      {/* Using Next.js Image component for optimization */}
      {/* Adjust layout, width, height, and objectFit as needed */}
      <Image
        src={imageUrl}
        alt={altText}
        layout="responsive"
        className="w-full h-auto"
        width={1600} // Example width, adjust as needed or make dynamic
        height={900} // Example height, adjust for aspect ratio
        objectFit="cover" // Or 'contain', 'fill', etc.
      />
    </div>
  )
}

export default ImageBlock
