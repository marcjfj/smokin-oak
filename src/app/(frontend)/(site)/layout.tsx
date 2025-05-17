import { SiteHeader } from '@/components/layout/site-header'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { goblinOne } from '@/lib/fonts'
import type {
  SocialMedia as SocialMediaType,
  BusinessHour as HoursType,
  Status as StatusType,
  ContactInfo as ContactInfoType,
} from '@/payload-types'
import Image from 'next/image'

export default async function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: configPromise })

  let socialLinks: SocialMediaType | null = null
  try {
    socialLinks = await payload.findGlobal({
      slug: 'social-media',
    })
  } catch (error) {
    console.error('Error fetching social media links:', error)
    // Optionally: payload.logger.error('Error fetching social media links:', error)
  }

  let businessHours: HoursType | null = null
  try {
    businessHours = await payload.findGlobal({
      slug: 'business-hours',
    })
  } catch (error) {
    console.error('Error fetching business hours:', error)
    // Optionally: payload.logger.error('Error fetching business hours:', error)
  }

  let siteStatus: StatusType | null = null
  try {
    siteStatus = await payload.findGlobal({
      slug: 'status',
    })
  } catch (error) {
    console.error('Error fetching site status:', error)
    // Optionally: payload.logger.error('Error fetching site status:', error)
  }

  let contactInfo: ContactInfoType | null = null
  try {
    contactInfo = await payload.findGlobal({
      slug: 'contact-info',
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    // Optionally: payload.logger.error('Error fetching contact info:', error)
  }

  return (
    <div className="bg-neutral-800 text-neutral-100">
      <SiteHeader />
      {siteStatus && siteStatus.currentStatus === 'sold-out' && (
        <div className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-neutral-800 font-semibold py-3 px-6 rounded-lg shadow-md max-w-xl mx-auto my-4 md:-mb-10 relative z-50">
          <Image
            src="/sold-out.png"
            alt="Sold Out"
            width={100}
            height={100}
            className="mr-4 -my-20 relative z-50 filter drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]"
          />
          <span className={goblinOne.className}>We are currently SOLD OUT. See you tomorrow!</span>
        </div>
      )}
      <main className="min-h-screen">{children}</main>
      <footer className=" text-neutral-300 p-6 md:p-8 mt-24 border-t border-neutral-700">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
            {/* Contact Information */}
            {contactInfo && (
              <div className="mb-6 md:mb-0 md:flex-1 text-center md:text-left">
                <h3 className={`text-lg font-semibold mb-2 ${goblinOne.className}`}>Contact Us</h3>
                <ul className="text-sm space-y-1">
                  {contactInfo.email && (
                    <li>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="hover:text-neutral-100 transition-colors duration-200"
                      >
                        {contactInfo.email}
                      </a>
                    </li>
                  )}
                  {contactInfo.phone && <li>{contactInfo.phone}</li>}
                  {contactInfo.address && (
                    <li>
                      {contactInfo.address.street}, {contactInfo.address.city},{' '}
                      {contactInfo.address.state} {contactInfo.address.zipCode}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Logo and Socials - Centered */}
            <div className="mb-6 md:mb-0 flex flex-col items-center text-center mx-auto">
              <Image
                src="/smokin-oak-logo-light.png"
                alt="Smokin' Oak BBQ Logo"
                width={150}
                height={75}
                className="mb-4"
              />
              {socialLinks && socialLinks.links && socialLinks.links.length > 0 && (
                <div className="flex justify-center space-x-4 mt-2">
                  {socialLinks.links.map(
                    (link: { platform: string; url: string }, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-neutral-300 transition-colors duration-200"
                      >
                        {link.platform}
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Right Section: Business Hours */}
            {businessHours && businessHours.schedule && businessHours.schedule.length > 0 && (
              <div className="mt-6 md:mt-0 text-center md:text-right md:flex-1 flex flex-col items-end">
                <h3 className={`text-lg font-semibold mb-2 ${goblinOne.className}`}>Hours</h3>
                <ul className="text-sm space-y-1 w-full md:w-auto min-w-[200px] max-w-[400px]">
                  {businessHours.schedule.map(
                    (item: { day: string; timeRange: string }, index: number) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="capitalize font-medium mr-4">{item.day}</span>
                        <span>{item.timeRange}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
          <div className="text-center text-sm mt-8 pt-6">
            <p>&copy; {new Date().getFullYear()} Smokin Oak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
