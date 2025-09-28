'use client'

import Link from 'next/link'
import Image from 'next/legacy/image'
import { Menu } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { goblinOne } from '@/lib/fonts'

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="text-neutral-100 p-4 z-20 relative pb-12 md:pb-0">
      <nav className="container mx-auto flex items-center md:justify-between relative">
        <Link
          href="/"
          className="pt-4 md:pt-0 flex items-center space-x-2 text-2xl font-bold md:static absolute left-1/2 md:left-0 transform md:transform-none -translate-x-1/2 md:-translate-x-0"
        >
          <Image
            src="/smokin-oak-logo-light.png"
            alt="Smokin Oak Logo"
            width={100}
            height={100}
            objectFit="contain"
            className="rounded-full bg-neutral-800 w-24 h-24 -mb-10 md:w-28 md:h-28 md:-mb-10"
          />
        </Link>
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 mr-8">
          <li>
            <Link href="/" className={`hover:text-yellow-300 ${goblinOne.className}`}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/menu" className={`hover:text-yellow-300 ${goblinOne.className}`}>
              Menu
            </Link>
          </li>
          <li>
            <Link href="/about" className={`hover:text-yellow-300 ${goblinOne.className}`}>
              About Us
            </Link>
          </li>
          <li>
            <Link href="/contact" className={`hover:text-yellow-300 ${goblinOne.className}`}>
              Contact
            </Link>
          </li>
          <li>
            <Link href="/events" className={`hover:text-yellow-300 ${goblinOne.className}`}>
              Events
            </Link>
          </li>
        </ul>
        {/* Mobile Navigation */}
        <div className="md:hidden ml-auto">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-10 w-10" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-neutral-800 text-neutral-100"
            >
              <SheetHeader>
                <SheetTitle>
                  <VisuallyHidden>Mobile Navigation Menu</VisuallyHidden>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8 px-4">
                <Link
                  href="/"
                  className={`hover:text-neutral-300 text-lg ${goblinOne.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/menu"
                  className={`hover:text-neutral-300 text-lg ${goblinOne.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  href="/about"
                  className={`hover:text-neutral-300 text-lg ${goblinOne.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`hover:text-neutral-300 text-lg ${goblinOne.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/events"
                  className={`hover:text-neutral-300 text-lg ${goblinOne.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
