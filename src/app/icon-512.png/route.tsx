import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const size = 512
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
            letterSpacing: `${size * 0.04}px`, 
            color: '#FFFFFF',
            fontFamily: 'sans-serif' 
          }}
        >
          DUO
        </div>
      </div>
    ), { width: size, height: size }
  )
}
