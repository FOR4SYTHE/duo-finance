import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const size = 192;
  
  // Fetch Hanken Grotesk 900 (Black) WOFF format from jsdelivr/fontsource for Satori
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/npm/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-900-normal.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#000000', 
          borderRadius: `${size * 0.22}px` 
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            fontSize: size * 0.35, 
            fontWeight: 900, 
            letterSpacing: `${size * 0.05}px`, 
            // Exact Welcome Page Gradient and shadow styling
            backgroundImage: "linear-gradient(110deg, #b3b3b3 0%, #ffffff 25%, #4a4a4a 50%, #ffffff 75%, #b3b3b3 100%)",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.8))",
            fontFamily: '"Hanken Grotesk"' 
          }}
        >
          DUO
        </div>
      </div>
    ), { 
      width: size, 
      height: size,
      fonts: [
        {
          name: 'Hanken Grotesk',
          data: fontData,
          style: 'normal',
          weight: 900
        }
      ]
    }
  )
}
