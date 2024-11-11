import { NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    const html = await response.text()
    const dom = new JSDOM(html)
    const ogImageElement = dom.window.document.querySelector(
      'meta[property="og:image"]'
    )
    const ogImage = ogImageElement?.getAttribute('content')

    if (ogImage) {
      const ogImageUrl = new URL(ogImage, url).href
      console.log('OG Image URL:', ogImageUrl)
      return NextResponse.json({ ogImage: ogImageUrl })
    } else {
      console.log('No OG Image found')
      return NextResponse.json({ ogImage: null })
    }
  } catch (error) {
    console.error('Error fetching OG image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch OG image' },
      { status: 500 }
    )
  }
}
