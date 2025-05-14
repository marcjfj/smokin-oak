import { SiteHeader } from '@/components/layout/site-header'

export default async function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div className="bg-neutral-800 text-neutral-100">
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <footer className="bg-neutral-800 text-neutral-100 p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Smokin Oak. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          {/* Add social media icons or links here */}
          <a href="#" className="hover:text-neutral-300">
            Facebook
          </a>
          <a href="#" className="hover:text-neutral-300">
            Instagram
          </a>
          <a href="#" className="hover:text-neutral-300">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  )
}
