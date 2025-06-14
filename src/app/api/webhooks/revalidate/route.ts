import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Payload
    const payload = await getPayload({ config })
    const signature = req.headers.get('x-payload-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 })
    }

    // Get the revalidation token from environment variables
    const revalidateToken = process.env.REVALIDATE_TOKEN
    if (!revalidateToken) {
      return NextResponse.json({ error: 'Revalidation token not configured' }, { status: 500 })
    }

    // Get the Vercel deployment URL from environment variables
    const deploymentUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!deploymentUrl) {
      return NextResponse.json({ error: 'Deployment URL not configured' }, { status: 500 })
    }

    // Trigger revalidation for all paths that might be affected
    const paths = [
      '/', // Home page
      '/menu', // Menu page
      '/print-menu', // Print menu page
      '/events', // Events page
      '/about', // About page
      '/contact', // Contact page
    ]

    const revalidations = paths.map(async (path) => {
      const res = await fetch(
        `${deploymentUrl}/api/revalidate?path=${path}&token=${revalidateToken}`,
        {
          method: 'POST',
        },
      )
      return res.json()
    })

    await Promise.all(revalidations)

    return NextResponse.json({ revalidated: true, paths })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
