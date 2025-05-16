import React from 'react'
import './styles.css'
import { geistSans } from '@/lib/fonts'

export const metadata = {
  description: "Smokin' Oak BBQ",
  title: "Smokin' Oak BBQ",
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={geistSans.className}>
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍖</text></svg>"
      />
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
