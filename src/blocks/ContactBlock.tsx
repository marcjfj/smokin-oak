import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { goblinOne } from '@/lib/fonts' // Import goblinOne
import type {
  ContactInfo as ContactInfoType,
  BusinessHour as HoursType,
  SocialMedia as SocialMediaType,
  Media, // Assuming Media type is available for the image
} from '@/payload-types' // Assuming this is the correct path to your generated types
import Image from 'next/image' // Import Next.js Image component

interface ContactBlockProps {
  image?: Media | string // Allow for ID or full Media object for the image
}

const ContactBlock: React.FC<ContactBlockProps> = async ({ image }) => {
  const payload = await getPayload({ config: configPromise })

  let contactInfo: ContactInfoType | null = null
  try {
    contactInfo = await payload.findGlobal({
      slug: 'contact-info',
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
  }

  let businessHours: HoursType | null = null
  try {
    businessHours = await payload.findGlobal({
      slug: 'business-hours',
    })
  } catch (error) {
    console.error('Error fetching business hours:', error)
  }

  let socialMedia: SocialMediaType | null = null
  try {
    socialMedia = await payload.findGlobal({
      slug: 'social-media',
    })
  } catch (error) {
    console.error('Error fetching social media links:', error)
  }

  const imageUrl = typeof image === 'string' ? image : image?.url
  const altText =
    typeof image === 'string' ? 'Contact image' : image?.alt || 'Contact section image'

  return (
    <>
      <div className="relative flex flex-col mt-12">
        {imageUrl && (
          <div className="container mx-auto">
            <Image
              src={imageUrl}
              alt={altText}
              layout="responsive"
              width={1200} // Example width, adjust as needed
              height={400} // Example height, adjust for desired aspect ratio or make dynamic
              objectFit="cover"
              priority
              className="aspect-video md:rounded-lg"
            />
          </div>
        )}
        <div className="container-fluid relative bg-neutral-800/80 backdrop-blur-sm mx-auto py-12 px-4 -mt-20 md:-mt-100 border rounded-lg border-neutral-600">
          <h1 className={`text-4xl font-bold text-center mb-12 ${goblinOne.className}`}>
            Contact Us
          </h1>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info */}
            {contactInfo && (
              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 text-yellow-400 ${goblinOne.className}`}
                >
                  Get in Touch
                </h2>
                {contactInfo.email && (
                  <p className="mb-2">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${contactInfo.email}`} className="hover:text-yellow-300">
                      {contactInfo.email}
                    </a>
                  </p>
                )}
                {contactInfo.phone && (
                  <p className="mb-2">
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${contactInfo.phone}`} className="hover:text-yellow-300">
                      {contactInfo.phone}
                    </a>
                  </p>
                )}
                {contactInfo.address && (
                  <div>
                    <strong>Address:</strong>
                    <p>{contactInfo.address.street}</p>
                    <p>
                      {contactInfo.address.city}, {contactInfo.address.state}{' '}
                      {contactInfo.address.zipCode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Business Hours */}
            {businessHours && businessHours.schedule && businessHours.schedule.length > 0 && (
              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 text-yellow-400 ${goblinOne.className}`}
                >
                  Business Hours
                </h2>
                <ul className="space-y-1">
                  {businessHours.schedule.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="capitalize font-medium">{item.day}</span>
                      <span>{item.timeRange}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social Media */}
            {socialMedia && socialMedia.links && socialMedia.links.length > 0 && (
              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 text-yellow-400 ${goblinOne.className}`}
                >
                  Follow Us
                </h2>
                <div className="flex space-x-4">
                  {socialMedia.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-yellow-300 transition-colors duration-200 text-lg"
                    >
                      {link.platform} {/* Consider using icons here in the future */}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* You can add a map embed or a contact form here if needed */}
        </div>
      </div>
    </>
  )
}

export default ContactBlock
