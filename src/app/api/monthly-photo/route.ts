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

// Premium, hardcoded fallbacks to prevent empty cards when Unsplash 50/hr rate limit is hit
const FALLBACK_PHOTOS: Record<number, any> = {
  0: { url: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1600&auto=format&fit=crop', photographerName: 'Eberhard Grossgasteiger', photographerUrl: 'https://unsplash.com/@eberhardgross', color: '#e0e0e0' },
  1: { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop', photographerName: 'Simone Hutsch', photographerUrl: 'https://unsplash.com/@heysupersimi', color: '#a0a0a0' },
  2: { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1600&auto=format&fit=crop', photographerName: 'Arno Smit', photographerUrl: 'https://unsplash.com/@arnosmit', color: '#d4e1e4' },
  3: { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop', photographerName: 'Thomas Kinto', photographerUrl: 'https://unsplash.com/@thomaskinto', color: '#688c5c' },
  4: { url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1600&auto=format&fit=crop', photographerName: 'Jeremy Bishop', photographerUrl: 'https://unsplash.com/@jeremybishop', color: '#c49a6c' },
  5: { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1600&auto=format&fit=crop', photographerName: 'Roberto Nickson', photographerUrl: 'https://unsplash.com/@rpnickson', color: '#2c6c84' },
  6: { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop', photographerName: 'Kalen Emsley', photographerUrl: 'https://unsplash.com/@kalenemsley', color: '#546474' },
  7: { url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop', photographerName: 'Thomas Kinto', photographerUrl: 'https://unsplash.com/@thomaskinto', color: '#a48454' },
  8: { url: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?q=80&w=1600&auto=format&fit=crop', photographerName: 'Jeremy Thomas', photographerUrl: 'https://unsplash.com/@jeremythomasphoto', color: '#8c4c2c' },
  9: { url: 'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1600&auto=format&fit=crop', photographerName: 'Eberhard Grossgasteiger', photographerUrl: 'https://unsplash.com/@eberhardgross', color: '#b4b4b4' },
  10: { url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop', photographerName: 'Jannis Lucas', photographerUrl: 'https://unsplash.com/@jannis_lucas', color: '#1c1c24' },
  11: { url: 'https://images.unsplash.com/photo-1531366936337-779c64366914?q=80&w=1600&auto=format&fit=crop', photographerName: 'Jonatan Pie', photographerUrl: 'https://unsplash.com/@jpie', color: '#0c242c' },
};

export async function GET(request: NextRequest) {
  try {
    const key = process.env.UNSPLASH_ACCESS_KEY;
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

    // Default to fallback if no key is provided
    if (!key) {
      return NextResponse.json(FALLBACK_PHOTOS[monthIndex], {
        headers: { 'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400' },
      });
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
      console.warn('Unsplash API rate limit or error hit. Using premium fallback photo.');
      return NextResponse.json(FALLBACK_PHOTOS[monthIndex], {
        headers: { 'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400' },
      });
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
    // If all else fails, return a safe fallback to ensure the UI never breaks
    return NextResponse.json(FALLBACK_PHOTOS[0], { status: 200 });
  }
}
