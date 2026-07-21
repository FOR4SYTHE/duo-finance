import { NextRequest, NextResponse } from 'next/server';

// Curated themed search queries per calendar month for editorial variety
const MONTH_THEMES: Record<number, string> = {
  0: 'winter minimal snow landscape',
  1: 'abstract architecture minimal',
  2: 'spring cherry blossom nature',
  3: 'rolling green hills nature',
  4: 'desert sand dunes golden hour',
  5: 'tropical ocean aerial turquoise',
  6: 'mountain peak clouds dramatic',
  7: 'golden wheat field sunset',
  8: 'autumn forest aerial leaves',
  9: 'moody fog forest minimal',
  10: 'city skyline night lights',
  11: 'northern lights aurora landscape',
};

export async function GET(request: NextRequest) {
  try {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing Unsplash key' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // "YYYY-MM"

    // Determine month index (0-11) for theme selection
    let monthIndex = new Date().getMonth();
    if (monthParam) {
      const parts = monthParam.split('-');
      if (parts.length === 2) {
        monthIndex = parseInt(parts[1], 10) - 1; // Convert "07" to 6
      }
    }

    const theme = MONTH_THEMES[monthIndex] || 'minimal landscape nature';

    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${key}`,
        },
        next: { revalidate: 2592000 }, // Cache for 30 days
      }
    );

    if (!res.ok) {
      console.error('Unsplash API error:', res.status, await res.text());
      return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: res.status });
    }

    const data = await res.json();

    // Unsplash API guidelines require pinging the download_location when a photo is used
    if (data.links?.download_location) {
      fetch(data.links.download_location, {
        headers: { Authorization: `Client-ID ${key}` },
      }).catch(console.error);
    }

    return NextResponse.json({
      url: data.urls.regular,
      photographerName: data.user.name,
      photographerUrl: data.user.links.html,
      color: data.color,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
