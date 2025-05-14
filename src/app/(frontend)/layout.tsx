import React from 'react'
import './styles.css'
import { geistSans } from '@/lib/fonts'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={geistSans.className}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
