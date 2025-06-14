'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y } from 'swiper/modules'
import 'swiper/css'
import Image from 'next/image' // Assuming Next.js Image component
import { goblinOne } from '@/lib/fonts' // Import goblinOne

interface ImageSliderBlockProps {
  title?: string | null
  images?: Array<{ image: any; caption?: string | null; id?: string | null }> | null
}

const ImageSliderBlock: React.FC<ImageSliderBlockProps> = ({ title, images }) => {
  if (!images || images.length === 0) {
    return null // Or some fallback UI
  }

  return (
    <section className="image-slider-block py-8 md:py-12 border-y border-neutral-600">
      <div className="mx-auto">
        {title && (
          <h2 className={`text-3xl font-bold text-center mb-8 ${goblinOne.className}`}>{title}</h2>
        )}
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={20} // Space between slides
          slidesPerView={1.33} // Default for mobile
          slidesOffsetBefore={32}
          slidesOffsetAfter={32}
          breakpoints={{
            // when window width is >= 640px (medium)
            768: {
              slidesPerView: 2.25,
              spaceBetween: 25,
              slidesOffsetBefore: 48,
              slidesOffsetAfter: 48,
            },
            // when window width is >= 768px (desktop)
            1024: {
              slidesPerView: 3.25,
              spaceBetween: 30,
              slidesOffsetBefore: 64,
              slidesOffsetAfter: 64,
            },
          }}
          className="mySwiper"
        >
          {images.map((item) => (
            <SwiperSlide key={item.id || item.image?.id || Math.random()}>
              <div className="flex flex-col items-center text-center rounded-lg overflow-hidden shadow-lg">
                {item.image?.url && (
                  <div className="relative w-full h-64 md:h-80">
                    <Image
                      src={item.image.url}
                      alt={item.caption || item.image.alt || 'Slider image'}
                      layout="fill"
                      objectFit="cover"
                      className=""
                    />
                  </div>
                )}
                {item.caption && (
                  <p className="w-full text-sm p-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
                    {item.caption}
                  </p>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default ImageSliderBlock
