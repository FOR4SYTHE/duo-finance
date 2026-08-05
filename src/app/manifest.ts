import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DUO Finance',
    short_name: 'DUO',
    description: 'Budgeting, together. Build better money habits with the person who matters most.',
    start_url: '/',
    display: 'standalone',
    background_color: '#161618',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      // iOS and some Android devices require standard PNG fallbacks for home screen icons.
      // Next.js automatically maps these if they exist in /public/icons.
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
